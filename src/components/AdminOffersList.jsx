import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../api/axios';

const AdminOffersList = () => {
  const [offers, setOffers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const [formData, setFormData] = useState({
    itemId: '',
    discountType: 'PERCENTAGE', // PERCENTAGE or FIXED
    discountValue: '',
    startDate: '',
    endDate: ''
  });

  const fetchData = async () => {
    try {
      const [offersRes, itemsRes] = await Promise.all([
        api.get('/offers'),
        api.get('/items')
      ]);
      setOffers(offersRes.data);
      setItems(itemsRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (offer = null) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        itemId: offer.itemId,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        startDate: offer.startDate || '',
        endDate: offer.endDate || ''
      });
    } else {
      setEditingOffer(null);
      setFormData({
        itemId: items.length > 0 ? items[0].id : '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        startDate: '',
        endDate: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOffer(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOffer) {
        await api.put(`/admin/offers/${editingOffer.id}`, formData);
      } else {
        await api.post('/admin/offers', formData);
      }
      closeModal();
      fetchData();
    } catch (err) {
      console.error('Failed to save offer', err);
      alert('Failed to save offer');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await api.delete(`/admin/offers/${id}`);
        fetchData();
      } catch (err) {
        console.error('Failed to delete offer', err);
      }
    }
  };

  const getItemName = (itemId) => {
    const item = items.find(i => i.id === itemId);
    return item ? item.name : 'Unknown Item';
  };

  if (loading) return <div>Loading offers...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Offers & Discounts</h3>
        <button 
          onClick={() => openModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-5 w-5" /> Add Offer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {offers.map(offer => (
                <tr key={offer.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{getItemName(offer.itemId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md font-semibold">
                      {offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}% OFF` : `LKR ${offer.discountValue} OFF`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{offer.startDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{offer.endDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                    <button onClick={() => openModal(offer)} className="text-blue-600 hover:text-blue-900 mr-3"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(offer.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {offers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No active offers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">{editingOffer ? 'Edit Offer' : 'Add New Offer'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Item</label>
                <select required name="itemId" value={formData.itemId} onChange={handleInputChange} className="w-full border rounded-lg p-2 bg-white">
                  <option value="" disabled>Select an Item</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.name} - LKR {item.price}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <select name="discountType" value={formData.discountType} onChange={handleInputChange} className="w-full border rounded-lg p-2 bg-white">
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (LKR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input required type="number" step="0.01" name="discountValue" value={formData.discountValue} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input required type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input required type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Save Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOffersList;
