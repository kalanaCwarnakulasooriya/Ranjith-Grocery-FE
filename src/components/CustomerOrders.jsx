import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { Package, Clock, CheckCircle } from 'lucide-react';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Assume user.email is used as identifier based on checkout logc
        const res = await api.get(`/orders/customer/${user.email}`);
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.email) {
      fetchOrders();
    }
  }, [user]);

  if (loading) return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grocery-green"></div></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 flex flex-col items-center justify-center text-center">
          <Package className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders found</h2>
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-6">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Order Placed</p>
                    <p className="font-medium text-gray-900">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
                    <p className="font-medium text-gray-900">LKR {order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</p>
                    <p className="font-medium text-gray-900">{order.deliveryType}</p>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1
                    ${order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : ''}
                    ${order.status === 'PAID' ? 'bg-green-100 text-green-700' : ''}
                    ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : ''}
                  `}>
                    {order.status === 'PENDING' && <Clock className="h-3 w-3" />}
                    {order.status === 'PAID' && <CheckCircle className="h-3 w-3" />}
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <ul className="space-y-4">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between text-sm items-center">
                      <div className="flex items-center gap-4">
                        <span className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                          {item.quantity}x
                        </span>
                        <span className="font-medium text-gray-900">{item.name}</span>
                      </div>
                      <span className="text-gray-600">LKR {(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t flex justify-end gap-2">
                   <button className="text-sm font-medium text-grocery-green hover:underline">View Invoice</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
