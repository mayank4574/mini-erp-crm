import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Save } from 'lucide-react';

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      currentStock: 0,
      minimumStockAlertQuantity: 10
    }
  });

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const res = await api.get(`/products/${id}`);
          reset(res.data.data);
        } catch (err) {
          setError('Failed to load product details');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, data);
      } else {
        await api.post('/products', data);
      }
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
      setSaving(false);
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
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/products" className="p-2 -ml-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
              <input
                {...register('productName', { required: 'Name is required' })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                placeholder="Laptop Pro 15"
              />
              {errors.productName && <p className="mt-1 text-sm text-danger">{errors.productName.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SKU *</label>
              <input
                {...register('sku', { required: 'SKU is required' })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all uppercase"
                placeholder="LPT-001"
              />
              {errors.sku && <p className="mt-1 text-sm text-danger">{errors.sku.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <input
                {...register('category')}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                placeholder="Electronics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('unitPrice', { required: 'Price is required', valueAsNumber: true })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                placeholder="0.00"
              />
              {errors.unitPrice && <p className="mt-1 text-sm text-danger">{errors.unitPrice.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Warehouse Location</label>
              <input
                {...register('warehouseLocation')}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                placeholder="A1-Shelf-B"
              />
            </div>

            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  {...register('currentStock', { valueAsNumber: true })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                />
              </div>
            )}
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Stock</label>
                <input
                  disabled
                  value="Manage in Inventory Module"
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Low Stock Alert Level</label>
              <input
                type="number"
                min="0"
                {...register('minimumStockAlertQuantity', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
              />
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link 
            to="/products"
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20 disabled:opacity-70"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
