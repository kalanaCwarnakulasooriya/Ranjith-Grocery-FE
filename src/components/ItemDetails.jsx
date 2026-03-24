import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCartStore } from '../store/useCartStore';
import { ShoppingCart, ArrowLeft, Check, AlertCircle } from 'lucide-react';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qtyToAdd, setQtyToAdd] = useState(1);

  const cartItems = useCartStore(state => state.items);
  const addToCart = useCartStore(state => state.addToCart);
  const updateQuantity = useCartStore(state => state.updateQuantity);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [itemRes, offersRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/items/${id}`),
          axios.get('http://localhost:8080/api/offers')
        ]);
        setItem(itemRes.data);
        setOffers(offersRes.data);
      } catch (err) {
        console.error("Failed to fetch item details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grocery-green"></div></div>;
  if (!item) return <div className="text-center py-20 text-gray-500">Item not found.</div>;

  const offer = offers.find(o => o.itemId === item.id);
  const hasOffer = !!offer;
  let discountedPrice = item.price;
  if (hasOffer) {
    if (offer.discountType === 'PERCENTAGE') discountedPrice = item.price * (1 - offer.discountValue / 100);
    else if (offer.discountType === 'FIXED') discountedPrice = item.price - offer.discountValue;
  }

  const existingCartItem = cartItems.find(i => i.item.id === item.id);
  const inCartQty = existingCartItem ? existingCartItem.quantity : 0;
  
  const increaseQty = () => {
    if (qtyToAdd < item.quantity - inCartQty) setQtyToAdd(prev => prev + 1);
  };
  
  const decreaseQty = () => {
    if (qtyToAdd > 1) setQtyToAdd(prev => prev - 1);
  };

  const handleAddToCart = () => {
    if (existingCartItem) {
      updateQuantity(item.id, inCartQty + qtyToAdd);
    } else {
      addToCart({ ...item, originalPrice: item.price, price: discountedPrice });
      if (qtyToAdd > 1) {
          updateQuantity(item.id, qtyToAdd);
      }
    }
    setQtyToAdd(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-600 hover:text-grocery-green mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          
          {/* Enhanced Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center relative">
              {item.quantity === 0 && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 py-4 flex justify-center">
                  <span className="bg-gray-800 text-white font-bold py-2 px-8 rounded-full border-2 border-white shadow-lg text-lg tracking-wider">OUT OF STOCK</span>
                </div>
              )}
              {hasOffer && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-md shadow-md">
                  {offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}% OFF` : `LKR ${offer.discountValue} OFF`}
                </div>
              )}
              {item.images && item.images.length > 0 ? (
                <img 
                  src={`http://localhost:8080${item.images[activeImage]}`} 
                  alt={item.name} 
                  className={`w-full h-full object-contain ${item.quantity === 0 ? 'opacity-50 grayscale' : ''}`}
                />
              ) : (
                <span className="text-gray-400">No Image Available</span>
              )}
            </div>
            
            {item.images && item.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {item.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(idx)}
                    className={`h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === idx ? 'border-grocery-green scale-105 shadow-md' : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={`http://localhost:8080${img}`} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="text-sm text-grocery-green font-semibold uppercase tracking-widest">{item.category}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-2">{item.name}</h1>
            
            <div className="flex items-end gap-3 mb-6">
              {hasOffer ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-red-600">LKR {discountedPrice.toFixed(2)}</span>
                    <span className="text-xl font-medium text-gray-500">/ {item.unit || 'pcs'}</span>
                  </div>
                  <span className="text-xl text-gray-400 line-through mb-1">LKR {item.price.toFixed(2)}</span>
                </>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">LKR {item.price.toFixed(2)}</span>
                  <span className="text-xl font-medium text-gray-500">/ {item.unit || 'pcs'}</span>
                </div>
              )}
            </div>

            <p className="text-gray-600 text-lg mb-8 leading-relaxed whitespace-pre-wrap">{item.description}</p>
            
            <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100 grid grid-cols-2 gap-4">
               <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Availability</h4>
                  {item.quantity > 0 ? (
                    <span className="text-green-600 font-semibold flex items-center gap-1"><Check className="h-4 w-4"/> In Stock ({item.quantity} {item.unit || 'pcs'})</span>
                  ) : (
                    <span className="text-red-500 font-semibold flex items-center gap-1"><AlertCircle className="h-4 w-4"/> Out of Stock</span>
                  )}
               </div>
               {item.expiryDate && (
                 <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Expiry Date</h4>
                    <span className="text-gray-900 font-medium">{item.expiryDate}</span>
                 </div>
               )}
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center h-14 border-2 border-gray-200 rounded-xl bg-white overflow-hidden w-full sm:w-auto">
                <button 
                  onClick={decreaseQty} 
                  disabled={qtyToAdd <= 1}
                  className="px-5 h-full hover:bg-gray-100 disabled:opacity-50 text-gray-600 font-medium text-xl transition-colors"
                >-</button>
                <div className="w-16 flex items-center justify-center font-bold text-lg text-gray-900">{qtyToAdd}</div>
                <button 
                  onClick={increaseQty} 
                  disabled={qtyToAdd >= (item.quantity - inCartQty)}
                  className="px-5 h-full hover:bg-gray-100 disabled:opacity-50 text-gray-600 font-medium text-xl transition-colors"
                >+</button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={item.quantity === 0 || inCartQty >= item.quantity}
                className={`flex-1 h-14 rounded-xl flex items-center justify-center gap-3 text-lg font-bold transition-all shadow-sm ${
                  item.quantity === 0 || inCartQty >= item.quantity
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-grocery-green hover:bg-green-700 text-white hover:shadow-md active:scale-[0.98]'
                }`}
              >
                <ShoppingCart className="h-6 w-6" /> 
                {inCartQty >= item.quantity && item.quantity > 0 ? 'Max in Cart' : 'Add to Cart'}
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
