import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Search, Filter, AlertTriangle } from 'lucide-react';
import api from '../api/axios';

const CATEGORIES = [
  "Vegetables", "Fruits", "Dairy", "Beverages", "Snacks", 
  "Bakery", "Meat & Fish", "Frozen Food", "Spices", "Household Items"
];

const UNITS = ["g", "kg", "L", "ml", "pcs"];

const AdminItemsList = () => {
  const [items, setItems] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingOfferId, setEditingOfferId] = useState(null);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    unit: 'pcs',
    category: CATEGORIES[0],
    manufactureDate: '',
    expiryDate: '',
    description: '',
    // Offer fields
    hasOffer: false,
    discountType: 'PERCENTAGE',
    discountValue: '',
    offerStartDate: '',
    offerEndDate: ''
  });
  const [images, setImages] = useState([]);

  const fetchData = async () => {
    try {
      const [itemsRes, offersRes] = await Promise.all([
        api.get('/items'),
        api.get('/offers')
      ]);
      setItems(itemsRes.data);
      setOffers(offersRes.data);
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 4) {
      alert("You can only upload up to 4 images.");
      e.target.value = '';
      return;
    }
    setImages(e.target.files);
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      const itemOffer = offers.find(o => o.itemId === item.id);
      if (itemOffer) {
          setEditingOfferId(itemOffer.id);
      } else {
          setEditingOfferId(null);
      }
      
      setFormData({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit || 'pcs',
        category: item.category || CATEGORIES[0],
        manufactureDate: item.manufactureDate || '',
        expiryDate: item.expiryDate || '',
        description: item.description || '',
        hasOffer: !!itemOffer,
        discountType: itemOffer?.discountType || 'PERCENTAGE',
        discountValue: itemOffer?.discountValue || '',
        offerStartDate: itemOffer?.startDate || '',
        offerEndDate: itemOffer?.endDate || ''
      });
      setImages([]);
    } else {
      setEditingItem(null);
      setEditingOfferId(null);
      setFormData({
        name: '', price: '', quantity: '', unit: 'pcs', category: CATEGORIES[0], 
        manufactureDate: '', expiryDate: '', description: '',
        hasOffer: false, discountType: 'PERCENTAGE', discountValue: '', offerStartDate: '', offerEndDate: ''
      });
      setImages([]);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setEditingOfferId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Save Item
    const itemPayload = {
      name: formData.name,
      price: formData.price,
      quantity: formData.quantity,
      unit: formData.unit,
      category: formData.category,
      manufactureDate: formData.manufactureDate,
      expiryDate: formData.expiryDate,
      description: formData.description
    };

    const data = new FormData();
    data.append('itemData', JSON.stringify(itemPayload));
    for (let i = 0; i < images.length; i++) {
        data.append('files', images[i]);
    }

    try {
      let savedItem;
      if (editingItem) {
        const res = await api.put(`/admin/items/${editingItem.id}`, data);
        savedItem = res.data;
      } else {
        const res = await api.post('/admin/items', data);
        savedItem = res.data;
      }

      // 2. Handle Offer
      if (formData.hasOffer) {
        const offerPayload = {
            itemId: savedItem.id,
            discountType: formData.discountType,
            discountValue: formData.discountValue,
            startDate: formData.offerStartDate,
            endDate: formData.offerEndDate
        };
        if (editingOfferId) {
            await api.put(`/admin/offers/${editingOfferId}`, offerPayload);
        } else {
            await api.post('/admin/offers', offerPayload);
        }
      } else if (editingOfferId) {
        // Remove existing offer if hasOffer is toggled off
        await api.delete(`/admin/offers/${editingOfferId}`);
      }

      closeModal();
      fetchData();
    } catch (err) {
      console.error('Failed to save item/offer', err);
      alert('Failed to save item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/admin/items/${id}`);
        // Also delete associated offer if exists
        const associatedOffer = offers.find(o => o.itemId === id);
        if (associatedOffer) {
            await api.delete(`/admin/offers/${associatedOffer.id}`);
        }
        fetchData();
      } catch (err) {
        console.error('Failed to delete item', err);
      }
    }
  };

  const isExpiringSoon = (dateString) => {
    if (!dateString) return false;
    const expiry = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(expiry - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return expiry > now && diffDays <= 7;
  };

  const filteredItems = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === '' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-grocery-green"></div></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-gray-800">Items Inventory</h3>
        <button 
          onClick={() => openModal()}
          className="bg-grocery-green hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="h-5 w-5" /> Add New Item
        </button>
      </div>

      {/* Smart Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                  type="text" 
                  placeholder="Search items by name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-grocery-green/50"
              />
          </div>
          <div className="relative w-full sm:w-64">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-grocery-green/50"
              >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock & Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map(item => {
                const itemOffer = offers.find(o => o.itemId === item.id);
                const isLowStock = item.quantity > 0 && item.quantity < 5;
                const isOut = item.quantity === 0;
                const expiringSoon = isExpiringSoon(item.expiryDate);

                return (
                  <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isOut ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-200">
                                {item.images && item.images.length > 0 ? (
                                    <img src={`http://localhost:8080${item.images[0]}`} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                    <ImageIcon className="h-5 w-5 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">{item.name}</div>
                                {itemOffer && (
                                    <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                                        {itemOffer.discountType === 'PERCENTAGE' ? `${itemOffer.discountValue}% OFF` : `LKR ${itemOffer.discountValue} OFF`}
                                    </span>
                                )}
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">LKR {item.price?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                            <span className={`text-sm font-bold ${isOut ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-gray-900'}`}>
                                {item.quantity} {item.unit}
                            </span>
                            {isLowStock && <span className="text-xs text-orange-600 flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/> Low Stock</span>}
                            {isOut && <span className="text-xs text-red-600 font-bold">Out of Stock</span>}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {expiringSoon ? (
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-md flex items-center inline-flex w-max">
                                Expiring: {item.expiryDate}
                            </span>
                        ) : (
                            <span className="text-xs text-gray-500">
                                {item.expiryDate ? `Exp: ${item.expiryDate}` : 'No expiry'}
                            </span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => openModal(item)} className="text-blue-600 hover:text-blue-900 mr-4 bg-blue-50 p-2 rounded-md transition-colors"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-md transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                  <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                          No items found matching your criteria.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4 sm:p-0">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-xl font-bold text-gray-800">{editingItem ? 'Edit Item & Offer' : 'Add New Item & Offer'}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="itemForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Basic Details Section */}
                <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-2 mb-4">Basic Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                            <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-grocery-green/50 outline-none" placeholder="e.g. Fresh Organic Tomatoes" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select required name="category" value={formData.category} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-grocery-green/50 outline-none">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (LKR)</label>
                            <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-grocery-green/50 outline-none" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                            <input required type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-grocery-green/50 outline-none" placeholder="100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label>
                            <select required name="unit" value={formData.unit} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-grocery-green/50 outline-none">
                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Additional Details */}
                <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-2 mb-4">Product Info & Dates</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Manufacture Date</label>
                            <input type="date" name="manufactureDate" value={formData.manufactureDate} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                            <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea required rows="3" name="description" value={formData.description} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 resize-none outline-none focus:ring-2 focus:ring-grocery-green/50"></textarea>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Images (Max 4)</label>
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full border border-gray-300 rounded-lg p-2" />
                        {editingItem && editingItem.images?.length > 0 && (
                        <div className="mt-2 text-xs text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded font-medium border border-orange-100">
                            Current images: {editingItem.images.length}. Uploading new images will replace them.
                        </div>
                        )}
                    </div>
                </div>

                {/* Offer Section */}
                <div className={`p-5 rounded-lg border transition-colors ${formData.hasOffer ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Promotional Offer</h4>
                        <label className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input type="checkbox" name="hasOffer" className="sr-only" checked={formData.hasOffer} onChange={handleInputChange} />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${formData.hasOffer ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.hasOffer ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                            <span className="ml-3 text-sm font-bold text-gray-700">Enable Offer</span>
                        </label>
                    </div>

                    {formData.hasOffer && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                                <select name="discountType" value={formData.discountType} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white outline-none">
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                    <option value="FIXED">Fixed Amount (LKR)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                                <input required={formData.hasOffer} type="number" step="0.01" name="discountValue" value={formData.discountValue} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input required={formData.hasOffer} type="date" name="offerStartDate" value={formData.offerStartDate} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input required={formData.hasOffer} type="date" name="offerEndDate" value={formData.offerEndDate} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
                            </div>
                        </div>
                    )}
                </div>

                </form>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0 z-10">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
                <button type="submit" form="itemForm" className="px-5 py-2.5 font-bold bg-grocery-green text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-grocery-green">Save Item & Offer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminItemsList;
