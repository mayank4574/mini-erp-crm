import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle } from 'lucide-react';

const ChallanForm = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get('/customers', { params: { limit: 500, status: 'ACTIVE' } }),
          api.get('/products', { params: { limit: 1000 } })
        ]);
        setCustomers(custRes.data.data);
        setProducts(prodRes.data.data);
      } catch (err) {
        console.error('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { product: '', quantity: 1, unitPrice: 0, stock: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    
    if (field === 'product') {
      const selectedProd = products.find(p => p._id === value);
      newItems[index] = {
        ...newItems[index],
        product: value,
        unitPrice: selectedProd ? selectedProd.unitPrice : 0,
        stock: selectedProd ? selectedProd.currentStock : 0
      };
    } else if (field === 'quantity') {
      newItems[index].quantity = parseInt(value) || 0;
    }
    
    setItems(newItems);
  };

  const calculateSubtotal = (item) => (item.quantity * item.unitPrice) || 0;
  
  const totalAmount = items.reduce((sum, item) => sum + calculateSubtotal(item), 0);
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const handleSubmit = async (status) => {
    setError('');
    setSuccess('');
    
    if (!selectedCustomer) {
      setError('Please select a customer.');
      return;
    }
    
    if (items.length === 0) {
      setError('Please add at least one product.');
      return;
    }
    
    // Validate items
    for (let i = 0; i < items.length; i++) {
      if (!items[i].product) {
        setError(`Please select a product for item #${i+1}`);
        return;
      }
      if (items[i].quantity <= 0) {
        setError(`Quantity must be greater than 0 for item #${i+1}`);
        return;
      }
    }

    const payload = {
      customer: selectedCustomer,
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity
      })),
      status: 'DRAFT' // Create as draft first
    };

    if (status === 'DRAFT') setSaving(true);
    else setConfirming(true);

    try {
      // 1. Create draft challan
      const res = await api.post('/challans', payload);
      const challanId = res.data.data._id;
      
      // 2. If status is CONFIRMED, make a second call to confirm it (this triggers stock deduction)
      if (status === 'CONFIRMED') {
        await api.put(`/challans/${challanId}`, { status: 'CONFIRMED' });
      }
      
      setSuccess(`Challan successfully ${status === 'CONFIRMED' ? 'confirmed' : 'saved as draft'}!`);
      setTimeout(() => navigate('/challans'), 1500);
      
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while saving the challan.');
    } finally {
      setSaving(false);
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/challans" className="p-2 -ml-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Sales Challan</h1>
          <p className="text-sm text-slate-500 mt-1">Generate a new sales order or challan.</p>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle className="h-5 w-5" /> {success}
        </div>
      )}

      {/* Customer Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">1. Customer Information</h3>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-slate-700 mb-1">Select Customer *</label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
          >
            <option value="">-- Choose Customer --</option>
            {customers.map(c => (
              <option key={c._id} value={c._id}>
                {c.customerName} {c.businessName ? `(${c.businessName})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
          <h3 className="text-lg font-semibold text-slate-800">2. Order Items</h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-300">
            No items added. Click "Add Item" to begin.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 font-medium w-1/2">Product</th>
                    <th className="py-2 font-medium text-center">Unit Price</th>
                    <th className="py-2 font-medium text-center">Avail. Stock</th>
                    <th className="py-2 font-medium text-center w-24">Quantity</th>
                    <th className="py-2 font-medium text-right">Subtotal</th>
                    <th className="py-2 font-medium text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="py-3 pr-4">
                        <select
                          value={item.product}
                          onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                        >
                          <option value="">-- Select Product --</option>
                          {products.map(p => (
                            <option key={p._id} value={p._id}>{p.productName} ({p.sku})</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 text-center text-slate-700">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.stock < item.quantity ? 'bg-danger/10 text-danger' : 'bg-slate-100 text-slate-700'}`}>
                          {item.stock}
                        </span>
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 text-center bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                        />
                      </td>
                      <td className="py-3 text-right font-medium text-slate-900">
                        ${calculateSubtotal(item).toFixed(2)}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {items.map((item, index) => (
                <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Product</label>
                    <select
                      value={item.product}
                      onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    >
                      <option value="">-- Select Product --</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>{p.productName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Stock</label>
                      <div className="py-2 text-sm font-medium">
                        <span className={item.stock < item.quantity ? 'text-danger' : 'text-slate-700'}>{item.stock}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-1">
                    <span className="text-sm text-slate-500">${item.unitPrice.toFixed(2)} ea</span>
                    <span className="font-bold text-slate-900">${calculateSubtotal(item).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Totals & Actions (Sticky Bottom on Mobile) */}
      <div className="fixed bottom-0 left-0 lg:left-72 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:p-0">
        <div className="bg-white sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-sm sm:p-6 max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex gap-6 w-full sm:w-auto">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500">Total Items</span>
              <span className="text-lg font-bold text-slate-800">{totalQuantity}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500">Total Amount</span>
              <span className="text-2xl font-bold text-primary">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSubmit('DRAFT')}
              disabled={saving || confirming || items.length === 0}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('CONFIRMED')}
              disabled={saving || confirming || items.length === 0}
              className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {confirming ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Confirm Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallanForm;
