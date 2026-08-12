import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, Plus, FileText, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const Challans = () => {
  const { user } = useAuth();
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const isSalesOrAdmin = ['ADMIN', 'SALES'].includes(user?.role);

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/challans', {
        params: {
          page,
          limit: 10,
          search,
          status: statusFilter,
        }
      });
      setChallans(res.data.data);
      setTotalPages(res.data.pages);
    } catch (error) {
      console.error('Failed to fetch challans', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [page, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchChallans();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Challans</h1>
          <p className="text-sm text-slate-500 mt-1">Manage sales orders and challans.</p>
        </div>
        {isSalesOrAdmin && (
          <Link 
            to="/challans/new" 
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-all shadow-md shadow-primary/20 w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4" />
            Create Challan
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
            placeholder="Search challan number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all"
          />
        </div>
        
        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Challan No.</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div></div>
                  </td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">No challans found.</td>
                </tr>
              ) : (
                challans.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-900">{c.challanNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{c.customer?.customerName || 'Unknown'}</span>
                        <span className="text-xs text-slate-500">{c.customer?.businessName || ''}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {format(new Date(c.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${c.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                        ${c.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 
                          c.status === 'DRAFT' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* For now we just allow viewing, later can add PDF download */}
                      <button className="inline-flex p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Download PDF (Mock)">
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
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
          ) : challans.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">No challans found.</div>
          ) : (
            challans.map((c) => (
              <div key={c._id} className="p-4 bg-white flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <h3 className="font-semibold text-slate-900">{c.challanNumber}</h3>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${c.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 
                      c.status === 'DRAFT' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                    {c.status}
                  </span>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-sm font-medium text-slate-800">{c.customer?.customerName || 'Unknown'}</p>
                  <p className="text-xs text-slate-500 mb-2">{c.customer?.businessName || ''}</p>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
                    <span className="text-slate-500">{format(new Date(c.createdAt), 'MMM d, yy')}</span>
                    <span className="font-bold text-slate-900">${c.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Pagination */}
        {!loading && challans.length > 0 && (
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

export default Challans;
