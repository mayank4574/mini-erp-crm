import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, Plus, MoreVertical, Edit, Eye, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers', {
        params: {
          page,
          limit: 10,
          search,
          customerType: typeFilter,
          status: statusFilter,
        }
      });
      setCustomers(res.data.data);
      setTotalPages(res.data.pages);
    } catch (error) {
      console.error('Failed to fetch customers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, typeFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchCustomers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your leads and active customers.</p>
        </div>
        <Link 
          to="/customers/new" 
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-all shadow-md shadow-primary/20 w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search name, mobile, or business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            >
              <option value="">All Types</option>
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </select>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          >
            <option value="">All Statuses</option>
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Responsive Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Desktop Table view (hidden on small screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer Details</th>
                <th className="px-6 py-4 font-semibold">Contact Info</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div></div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">No customers found.</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{c.customerName}</span>
                        <span className="text-xs text-slate-500">{c.businessName || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-700">{c.mobileNumber}</span>
                        <span className="text-xs text-slate-500">{c.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-medium">
                        {c.customerType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 
                          c.status === 'LEAD' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/customers/${c._id}`} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link to={`/customers/${c._id}/edit`} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg">
                          <Edit className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card view (hidden on medium+ screens) */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
             <div className="py-12 flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div></div>
          ) : customers.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">No customers found.</div>
          ) : (
            customers.map((c) => (
              <div key={c._id} className="p-4 bg-white flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-900">{c.customerName}</h3>
                    <p className="text-xs text-slate-500">{c.businessName || 'N/A'}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 
                          c.status === 'LEAD' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                    {c.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Contact</p>
                    <p className="font-medium text-slate-800">{c.mobileNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Type</p>
                    <p className="font-medium text-slate-800">{c.customerType}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2 border-t border-slate-50 mt-1">
                  <Link to={`/customers/${c._id}`} className="flex-1 text-center py-2 bg-slate-50 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-100">
                    View
                  </Link>
                  <Link to={`/customers/${c._id}/edit`} className="flex-1 text-center py-2 bg-slate-50 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-100">
                    Edit
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Pagination */}
        {!loading && customers.length > 0 && (
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

export default Customers;
