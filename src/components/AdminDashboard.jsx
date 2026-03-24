import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LayoutDashboard, Package, Users, ShoppingBag, CreditCard, DollarSign, AlertCircle } from 'lucide-react';

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 pb-32 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grocery-green"></div></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg text-green-600">
            <DollarSign className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Sales</p>
            <p className="text-2xl font-bold text-gray-800">LKR {stats?.totalSales?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.totalOrders || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-lg text-red-600">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Low Stock Items</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.lowStockCount || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
            <CreditCard className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Credit</p>
            <p className="text-2xl font-bold text-gray-800">LKR {stats?.totalPendingCredit?.toLocaleString() || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Low Stock Alerts</h3>
          {stats?.lowStockItems?.length === 0 ? (
            <p className="text-gray-500 text-sm">All items are well stocked.</p>
          ) : (
            <ul className="space-y-3">
              {stats?.lowStockItems?.map(item => (
                <li key={item.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="bg-red-100 text-red-700 py-1 px-3 rounded-full text-xs font-bold">Only {item.quantity} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Expiring Soon</h3>
          {stats?.expiringItems?.length === 0 ? (
            <p className="text-gray-500 text-sm">No items expiring in the next 7 days.</p>
          ) : (
            <ul className="space-y-3">
              {stats?.expiringItems?.map(item => (
                <li key={item.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="bg-orange-100 text-orange-700 py-1 px-3 rounded-full text-xs font-bold">Exp: {item.expiryDate}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

import AdminItemsAndOffers from './AdminItemsAndOffers';

// Placeholders for nested routes
const AdminOrders = () => <div className="text-gray-500">Orders & POS Module Coming Soon</div>;
const AdminCredits = () => <div className="text-gray-500">Credit Management Module Coming Soon</div>;
const AdminCustomers = () => <div className="text-gray-500">Customer Management Module Coming Soon</div>;

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 shadow-sm hidden md:block">
        <div className="py-6 px-4 space-y-2">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-grocery-green rounded-lg transition-colors">
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link to="/admin/items" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-grocery-green rounded-lg transition-colors">
            <Package className="h-5 w-5" />
            <span className="font-medium">Items & Offers</span>
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-grocery-green rounded-lg transition-colors">
            <ShoppingBag className="h-5 w-5" />
            <span className="font-medium">Orders / POS</span>
          </Link>
          <Link to="/admin/credits" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-grocery-green rounded-lg transition-colors">
            <CreditCard className="h-5 w-5" />
            <span className="font-medium">Credit (Naya)</span>
          </Link>
          <Link to="/admin/customers" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-grocery-green rounded-lg transition-colors">
            <Users className="h-5 w-5" />
            <span className="font-medium">Customers</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-50 max-h-[calc(100vh-64px)] overflow-y-auto w-full">
        <Routes>
          <Route path="/" element={<AdminStats />} />
          <Route path="/items" element={<AdminItemsAndOffers />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/credits" element={<AdminCredits />} />
          <Route path="/customers" element={<AdminCustomers />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
