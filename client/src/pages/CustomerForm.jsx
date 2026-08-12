import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Save } from 'lucide-react';

const CustomerForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      status: 'LEAD',
      customerType: 'RETAIL'
    }
  });

  useEffect(() => {
    if (isEdit) {
      const fetchCustomer = async () => {
        try {
          const res = await api.get(`/customers/${id}`);
          // Format date for datetime-local input if present
          const data = res.data.data;
          if (data.followUpDate) {
            data.followUpDate = new Date(data.followUpDate).toISOString().slice(0, 16);
          }
          reset(data);
        } catch (err) {
          setError('Failed to load customer details');
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer();
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await api.put(`/customers/${id}`, data);
      } else {
        await api.post('/customers', data);
      }
      navigate('/customers');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save customer');
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
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/customers" className="p-2 -ml-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isEdit ? 'Edit Customer' : 'Add New Customer'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
                <input
                  {...register('customerName', { required: 'Name is required' })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                  placeholder="John Doe"
                />
                {errors.customerName && <p className="mt-1 text-sm text-danger">{errors.customerName.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                <input
                  {...register('businessName')}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                  placeholder="Acme Corp"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
                <input
                  {...register('mobileNumber', { required: 'Mobile is required' })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                  placeholder="+1 234 567 8900"
                />
                {errors.mobileNumber && <p className="mt-1 text-sm text-danger">{errors.mobileNumber.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  {...register('email', { 
                    pattern: { value: /.+\@.+\..+/, message: 'Invalid email format' } 
                  })}
                  type="email"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                  placeholder="john@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
              </div>
            </div>
          </div>

          {/* Classification */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4">Classification & Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Type *</label>
                <select
                  {...register('customerType', { required: 'Type is required' })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                >
                  <option value="RETAIL">Retail</option>
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                </select>
                {errors.customerType && <p className="mt-1 text-sm text-danger">{errors.customerType.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
                <select
                  {...register('status', { required: 'Status is required' })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                >
                  <option value="LEAD">Lead</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-danger">{errors.status.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">GST Number</label>
                <input
                  {...register('gstNumber')}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Follow Up Date</label>
                <input
                  type="datetime-local"
                  {...register('followUpDate')}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <textarea
                {...register('address')}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                placeholder="Full address..."
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                placeholder="Any special notes or requirements..."
              />
            </div>
          </div>
          
        </div>
        
        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link 
            to="/customers"
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
            Save Customer
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
