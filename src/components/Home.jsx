import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCartStore } from '../store/useCartStore';
import { ShoppingCart, Star, Plus, Check } from 'lucide-react';

const Home = () => {
  const [items, setItems] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
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
    if (offer.discountPercent) return item.price * (1 - offer.discountPercent / 100);
    if (offer.discountFixed) return item.price - offer.discountFixed;
    return null;
  };

  const isInCart = (itemId) => cartItems.some(i => i.item.id === itemId);

  if (loading) return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grocery-green"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Fresh Groceries</h1>
          <p className="mt-2 text-gray-600">Discover our fresh produce and daily essentials.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(item => {
          const discountPrice = getDiscountedPrice(item);
          const hasOffer = discountPrice !== null;
          const currentPrice = hasOffer ? discountPrice : item.price;
          const isAdded = isInCart(item.id);

          return (
            <div key={item.id} className="card group relative flex flex-col h-full bg-white">
              {hasOffer && (
                <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                  SALE
                </div>
              )}
              {item.quantity < 5 && item.quantity > 0 && (
                <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                  Only {item.quantity} left
                </div>
              )}
              {item.quantity === 0 && (
                <div className="absolute inset-0 z-20 bg-white/70 flex items-center justify-center -m-1">
                  <span className="bg-gray-800 text-white font-bold py-2 px-6 rounded-full rotate-[-15deg] shadow-lg border-2 border-white">OUT OF STOCK</span>
                </div>
              )}

              <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                <img 
                  src={item.images?.[0] ? `http://localhost:8080${item.images[0]}` : `https://placehold.co/400x300?text=${item.name}`} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              
              <div className="p-5 flex flex-col flex-grow">
                <div className="text-xs text-grocery-green font-semibold mb-1 uppercase tracking-wider">{item.category}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description}</p>
                
                <div className="mt-auto flex items-center justify-between">
                  <div>
                    {hasOffer ? (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 line-through">LKR {item.price.toFixed(2)}</span>
                        <span className="text-xl font-bold text-red-600">LKR {discountPrice.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-gray-900">LKR {item.price.toFixed(2)}</span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => !isAdded && item.quantity > 0 && addToCart(item)}
                    disabled={item.quantity === 0}
                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                      isAdded 
                        ? 'bg-green-100 text-green-600 cursor-default' 
                        : item.quantity === 0 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-grocery-green hover:bg-grocery-green-dark hover:shadow-lg text-white active:scale-90'
                    }`}
                  >
                    {isAdded ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
