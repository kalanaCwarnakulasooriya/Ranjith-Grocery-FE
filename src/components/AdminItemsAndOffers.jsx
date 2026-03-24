import React, { useState } from 'react';
import AdminItemsList from './AdminItemsList';
import AdminOffersList from './AdminOffersList';

const AdminItemsAndOffers = () => {
  const [activeTab, setActiveTab] = useState('items');

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200">
        <button
          className={`py-3 px-6 font-medium text-sm focus:outline-none transition-colors ${
            activeTab === 'items'
              ? 'border-b-2 border-grocery-green text-grocery-green'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('items')}
        >
          Items Management
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm focus:outline-none transition-colors ${
            activeTab === 'offers'
              ? 'border-b-2 border-orange-500 text-orange-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('offers')}
        >
          Offers Management
        </button>
      </div>

      <div className="mt-4">
        {activeTab === 'items' ? <AdminItemsList /> : <AdminOffersList />}
      </div>
    </div>
  );
};

export default AdminItemsAndOffers;
