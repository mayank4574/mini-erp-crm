import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, Plus, Edit, Filter, ChevronLeft, ChevronRight, Package, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  const isWarehouseOrAdmin = ['ADMIN', 'WAREHOUSE'].includes(user?.role);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: {
          page,
          limit: 10,
          search,
          category: categoryFilter,
          lowStock: lowStockFilter || undefined,
        }
      });
      setProducts(res.data.data);
      setTotalPages(res.data.pages);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter, lowStockFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your product catalog.</p>
        </div>
        {isWarehouseOrAdmin && (
          <Link 
            to="/products/new" 
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-all shadow-md shadow-primary/20 w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-colors w-full sm:w-auto justify-center
              ${lowStockFilter ? 'bg-amber-100 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
          >
            <AlertTriangle className="h-4 w-4" />
            Low Stock
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">SKU</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                {isWarehouseOrAdmin && <th className="px-6 py-4 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={isWarehouseOrAdmin ? "5" : "4"} className="px-6 py-12 text-center">
                    <div className="flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div></div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={isWarehouseOrAdmin ? "5" : "4"} className="px-6 py-12 text-center text-slate-500">No products found.</td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Package className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{p.productName}</span>
                          <span className="text-xs text-slate-500">{p.category || 'Uncategorized'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {p.sku}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      ${p.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${p.currentStock <= p.minimumStockAlertQuantity ? 'text-amber-600' : 'text-slate-700'}`}>
                          {p.currentStock}
                        </span>
                        {p.currentStock <= p.minimumStockAlertQuantity && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                        )}
                      </div>
                    </td>
                    {isWarehouseOrAdmin && (
                      <td className="px-6 py-4 text-right">
                        <Link to={`/products/${p._id}/edit`} className="inline-flex p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <Edit className="h-4 w-4" />
                        </Link>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
             <div className="py-12 flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div></div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">No products found.</div>
          ) : (
            products.map((p) => (
              <div key={p._id} className="p-4 bg-white flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Package className="h-6 w-6 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-slate-900 truncate">{p.productName}</h3>
                    <span className="font-bold text-slate-900 shrink-0">${p.unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {p.sku}
                    </span>
                    <span className="text-xs text-slate-400">{p.category}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Stock:</span>
                      <span className={`text-sm font-bold ${p.currentStock <= p.minimumStockAlertQuantity ? 'text-amber-600' : 'text-slate-800'}`}>
                        {p.currentStock}
                      </span>
                    </div>
                    {isWarehouseOrAdmin && (
                      <Link to={`/products/${p._id}/edit`} className="text-primary hover:text-primary-dark p-1">
                        <Edit className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Pagination */}
        {!loading && products.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Page <span className="font-medium text-slate-900">{page}</span> of <span className="font-medium text-slate-900">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
