import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { Truck, Store, CheckCircle } from 'lucide-react';

const Checkout = () => {
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState('HOME');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const shippingCost = deliveryType === 'HOME' ? 300 : 0;
  const finalTotal = getTotal() + shippingCost;

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    const orderItems = items.map(i => ({
      itemId: i.item.id,
      name: i.item.name,
      price: i.item.price,
      quantity: i.quantity
    }));

    try {
      await api.post('/orders', {
        customerId: user?.role === 'CUSTOMER' ? user.email : null, // Backend uses ID usually, but adjusting based on current models. We will pass email or real ID if stored. Currently, let's omit customerId if not mapped properly, but our backend finds user.
        items: orderItems,
        totalAmount: finalTotal,
        deliveryType,
        deliveryCharge: shippingCost
      });

      setSuccess(true);
      clearCart();
      
      // Navigate to orders after delay
      setTimeout(() => {
        navigate('/orders');
      }, 3000);

    } catch (err) {
      setError(err.response?.data || 'An error occurred while placing the order.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !success) {
    navigate('/');
    return null;
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
         <div className="bg-white p-10 rounded-2xl shadow-xl border border-green-100 text-center max-w-md w-full">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-6">Your order has been placed successfully. A confirmation email has been sent.</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
              <div className="bg-green-500 h-1.5 rounded-full animate-[progress_3s_ease-in-out]"></div>
            </div>
            <p className="text-xs text-gray-400">Redirecting to orders...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Options</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`cursor-pointer border-2 rounded-xl p-4 flex gap-4 ${deliveryType === 'HOME' ? 'border-grocery-green bg-green-50' : 'border-gray-200 hover:border-green-200'}`}>
                <input 
                  type="radio" 
                  name="deliveryType" 
                  className="mt-1 flex-shrink-0 text-grocery-green focus:ring-grocery-green" 
                  checked={deliveryType === 'HOME'}
                  onChange={() => setDeliveryType('HOME')}
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="h-5 w-5 text-gray-700" />
                    <span className="font-bold text-gray-900">Home Delivery</span>
                  </div>
                  <p className="text-sm text-gray-500">Delivered within 24 hours.</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">LKR 300.00</p>
                </div>
              </label>

              <label className={`cursor-pointer border-2 rounded-xl p-4 flex gap-4 ${deliveryType === 'PICKUP' ? 'border-grocery-green bg-green-50' : 'border-gray-200 hover:border-green-200'}`}>
                <input 
                  type="radio" 
                  name="deliveryType" 
                  className="mt-1 flex-shrink-0 text-grocery-green focus:ring-grocery-green" 
                  checked={deliveryType === 'PICKUP'}
                  onChange={() => setDeliveryType('PICKUP')}
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Store className="h-5 w-5 text-gray-700" />
                    <span className="font-bold text-gray-900">Store Pickup</span>
                  </div>
                  <p className="text-sm text-gray-500">Pickup anytime during store hours.</p>
                  <p className="text-sm border border-green-200 bg-green-100 text-green-700 inline-block px-2 py-0.5 rounded text-xs font-bold mt-2">FREE</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
             <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg text-blue-800 text-sm flex gap-3 items-start">
               <div className="mt-0.5">ℹ️</div>
               <p>Cash on Delivery / Pay at Store is currently selected by default for all orders.</p>
             </div>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b">Order Summary</h2>
            
            <ul className="mb-6 space-y-3">
              {items.map(({item, quantity}) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate pr-4">{quantity} x {item.name}</span>
                  <span className="text-gray-900 font-medium">LKR {(item.price * quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-3 text-sm border-t pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>LKR {getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 mb-4">
                <span>Shipping</span>
                <span>LKR {shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-grocery-orange">LKR {finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className={`w-full mt-8 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white ${loading ? 'bg-gray-400' : 'bg-grocery-green hover:bg-grocery-green-dark active:scale-95'} transition-all`}
            >
              {loading ? 'Processing...' : 'Confirm Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
