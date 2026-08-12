import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../utils/api';
import { ArrowDownRight, ArrowUpRight, Boxes, Check, Search, Filter, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';

const Inventory = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionType, setActionType] = useState('IN'); // 'IN' or 'OUT'
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [actionError, setActionError] = useState('');

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      quantity: 1
    }
  });

  const selectedProductId = watch('product');
  const selectedProduct = products.find(p => p._id === selectedProductId);

  const fetchMovements = async () => {
    try {
      const res = await api.get('/inventory/movements', { params: { limit: 20 } });
      setMovements(res.data.data);
    } catch (error) {
      console.error('Failed to fetch movements', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products', { params: { limit: 1000 } }); // Fetch all for dropdown
      setProducts(res.data.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchMovements(), fetchProducts()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    setActionLoading(true);
    setActionError('');
    setActionSuccess(false);

    try {
      const endpoint = actionType === 'IN' ? '/inventory/stock-in' : '/inventory/stock-out';
      await api.post(endpoint, data);
      
      setActionSuccess(true);
      reset({ product: '', quantity: 1, reason: '' });
      
      // Refresh data
      fetchData();
      
      setTimeout(() => setActionSuccess(false), 3000);
    } catch (err) {
      setActionError(err.response?.data?.message || `Failed to process Stock ${actionType}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Management</h1>
        <p className="text-sm text-slate-500 mt-1">Manage stock in/out operations and view movement history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stock Action Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Boxes className="h-5 w-5 text-primary" />
                Record Movement
              </h2>
            </div>
            
            <div className="p-6">
              {/* Type Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => { setActionType('IN'); setActionError(''); }}
                  className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    actionType === 'IN' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <ArrowDownRight className="h-4 w-4" /> Stock IN
                </button>
                <button
                  type="button"
                  onClick={() => { setActionType('OUT'); setActionError(''); }}
                  className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    actionType === 'OUT' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <ArrowUpRight className="h-4 w-4" /> Stock OUT
                </button>
              </div>

              {actionError && (
                <div className="mb-4 bg-danger/10 border border-danger/20 text-danger p-3 rounded-xl text-sm font-medium">
                  {actionError}
                </div>
              )}

              {actionSuccess && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
                  <Check className="h-4 w-4" /> Successfully recorded.
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Product *</label>
                  <select
                    {...register('product', { required: 'Product is required' })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.productName} ({p.sku})
                      </option>
                    ))}
                  </select>
                  {errors.product && <p className="mt-1 text-sm text-danger">{errors.product.message}</p>}
                </div>

                {selectedProduct && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-sm">
                    <span className="text-slate-500">Current Stock:</span>
                    <span className="font-bold text-slate-900">{selectedProduct.currentStock}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    {...register('quantity', { 
                      required: 'Quantity is required',
                      min: { value: 1, message: 'Must be at least 1' }
                    })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                  />
                  {errors.quantity && <p className="mt-1 text-sm text-danger">{errors.quantity.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reason/Reference *</label>
                  <input
                    {...register('reason', { required: 'Reason is required' })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                    placeholder="e.g. New Shipment / Damaged"
                  />
                  {errors.reason && <p className="mt-1 text-sm text-danger">{errors.reason.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`w-full inline-flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-medium text-white transition-all shadow-md disabled:opacity-70 ${
                    actionType === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                  }`}
                >
                  {actionLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    actionType === 'IN' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />
                  )}
                  Record {actionType === 'IN' ? 'Stock IN' : 'Stock OUT'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Movement History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">Recent Movements</h2>
              <button onClick={fetchData} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : movements.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-12 text-slate-500">
                No movements recorded yet.
              </div>
            ) : (
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 font-medium">Type</th>
                      <th className="px-6 py-3 font-medium">Product</th>
                      <th className="px-6 py-3 font-medium">Qty</th>
                      <th className="px-6 py-3 font-medium">Reason</th>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {movements.map((m) => (
                      <tr key={m._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          {m.movementType === 'IN' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold">
                              <ArrowDownRight className="h-3 w-3" /> IN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold">
                              <ArrowUpRight className="h-3 w-3" /> OUT
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{m.product?.productName}</span>
                            <span className="text-xs text-slate-500">{m.product?.sku}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {m.movementType === 'IN' ? '+' : '-'}{m.quantityChanged}
                        </td>
                        <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]" title={m.reason}>
                          {m.reason}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {format(new Date(m.createdAt), 'MMM d, yy HH:mm')}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                          {m.createdBy?.name || 'System'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Inventory;
