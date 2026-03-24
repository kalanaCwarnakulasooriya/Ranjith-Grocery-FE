import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCartStore } from '../store/useCartStore';
import { ShoppingCart, Star, Plus, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [items, setItems] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const addToCart = useCartStore(state => state.addToCart);
  const cartItems = useCartStore(state => state.items);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, offersRes] = await Promise.all([
          axios.get('http://localhost:8080/api/items'),
          axios.get('http://localhost:8080/api/offers')
        ]);
        setItems(itemsRes.data);
        setOffers(offersRes.data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDiscountedPrice = (item) => {
    const offer = offers.find(o => o.itemId === item.id);
    if (!offer) return null;
    if (offer.discountType === 'PERCENTAGE') return item.price * (1 - offer.discountValue / 100);
    if (offer.discountType === 'FIXED') return item.price - offer.discountValue;
    return null;
  };

  const isInCart = (itemId) => cartItems.some(i => i.item.id === itemId);

  const categories = ['All', ...new Set(items.map(i => i.category).filter(Boolean))];

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  if (loading) return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grocery-green"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Fresh Groceries</h1>
          <p className="mt-2 text-gray-600">Discover our fresh produce and daily essentials.</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-8 flex overflow-x-auto pb-2 custom-scrollbar gap-2 hide-scroll">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`whitespace-nowrap px-5 py-2 rounded-full font-medium transition-colors border ${
              selectedCategory === category
                ? 'bg-grocery-green text-white border-grocery-green shadow-sm text-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-grocery-green hover:text-grocery-green text-sm'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map(item => {
          const discountPrice = getDiscountedPrice(item);
          const hasOffer = discountPrice !== null;
          const currentPrice = hasOffer ? discountPrice : item.price;
          const isAdded = isInCart(item.id);

          return (
            <div key={item.id} className="card group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              
              {/* Badges */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                {hasOffer && (
                  <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm tracking-wide">
                    {offers.find(o => o.itemId === item.id)?.discountType === 'PERCENTAGE' 
                        ? `${offers.find(o => o.itemId === item.id)?.discountValue}% OFF` 
                        : `SAVE LKR ${offers.find(o => o.itemId === item.id)?.discountValue}`}
                  </span>
                )}
                {item.quantity < 5 && item.quantity > 0 && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                    Only {item.quantity} {item.unit} left
                  </span>
                )}
              </div>

              {item.quantity === 0 && (
                <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                  <span className="bg-gray-900 text-white font-black py-2.5 px-6 rounded-xl -rotate-[10deg] shadow-lg border border-gray-700 tracking-widest text-sm">OUT OF STOCK</span>
                </div>
              )}

              {/* Image */}
              <Link to={`/items/${item.id}`} className="block aspect-[4/3] bg-gray-50 overflow-hidden relative">
                <img 
                  src={item.images?.[0] ? `http://localhost:8080${item.images[0]}` : `https://placehold.co/400x300?text=${item.name}`} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
              </Link>
              
              {/* Content */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="text-[11px] text-grocery-green font-bold mb-1.5 uppercase tracking-widest">{item.category}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-snug">
                  <Link to={`/items/${item.id}`} className="hover:text-grocery-green transition-colors">{item.name}</Link>
                </h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{item.description}</p>
                
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    {hasOffer ? (
                      <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-gray-400 line-through mb-0.5">LKR {item.price.toFixed(2)}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-red-600">LKR {discountPrice.toFixed(2)}</span>
                          <span className="text-xs font-semibold text-gray-500">/ {item.unit || 'pcs'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-gray-900">LKR {item.price.toFixed(2)}</span>
                        <span className="text-xs font-semibold text-gray-500">/ {item.unit || 'pcs'}</span>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => !isAdded && item.quantity > 0 && addToCart({ ...item, originalPrice: item.price, price: currentPrice })}
                    disabled={item.quantity === 0}
                    className={`h-11 w-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                      isAdded 
                        ? 'bg-green-100 text-green-600 cursor-default' 
                        : item.quantity === 0 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-grocery-green hover:bg-green-700 hover:shadow-md hover:-translate-y-0.5 text-white active:scale-95'
                    }`}
                  >
                    {isAdded ? <Check className="h-5 w-5" /> : <Plus className="h-6 w-6" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredItems.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center text-gray-500">
                <p className="text-lg">No items found in this category.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Home;
