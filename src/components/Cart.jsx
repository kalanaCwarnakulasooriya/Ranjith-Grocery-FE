import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, getTotal } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
        <div className="bg-gray-100 p-6 rounded-full mb-6">
          <ShoppingBag className="h-16 w-16 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-sm text-center">Looks like you haven't added any groceries to your cart yet.</p>
        <Link to="/" className="btn-primary flex items-center gap-2">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {items.map(({ item, quantity }) => (
                <li key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6 hover:bg-gray-50 transition-colors">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <img 
                      src={item.images?.[0] ? `http://localhost:8080${item.images[0]}` : `https://placehold.co/100x100?text=${item.name}`} 
                      alt={item.name} 
                      className="h-full w-full object-cover object-center" 
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between w-full">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900"><Link to={`/item/${item.id}`}>{item.name}</Link></h3>
                        <p className="mt-1 text-sm text-gray-500">LKR {item.price.toFixed(2)} each</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">LKR {(item.price * quantity).toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.id, Math.max(1, quantity - 1))}
                          className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 font-medium min-w-[3rem] text-center border-x border-gray-300">
                          {quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, Math.min(item.quantity, quantity + 1))}
                          className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button 
                        type="button" 
                        onClick={() => removeFromCart(item.id)}
                        className="font-medium text-red-500 hover:text-red-600 flex items-center gap-1 bg-red-50 px-3 py-1 rounded-md transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b">Order Summary</h2>
            
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p className="font-medium text-gray-900">LKR {getTotal().toFixed(2)}</p>
              </div>
              <div className="flex justify-between pb-4 border-b">
                <p>Delivery Estimate</p>
                <p className="font-medium text-gray-900">Calculated at checkout</p>
              </div>
              
              <div className="flex justify-between outline-none pb-2 pt-2 items-center">
                <p className="text-base font-bold text-gray-900">Total Selection</p>
                <p className="text-2xl font-bold text-grocery-green">LKR {getTotal().toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary flex justify-center items-center gap-2 py-3 text-lg"
              >
                Proceed to Checkout
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
