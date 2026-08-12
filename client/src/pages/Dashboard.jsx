import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, Package, Boxes, FileText, TrendingUp, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setData(res.data.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  const { stats, recent } = data;

  const statCards = [
    { title: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Active Customers', value: stats.activeCustomers, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Low Stock Alerts', value: stats.lowStockProducts, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Total Inventory Stock', value: stats.totalStock, icon: Boxes, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { title: 'Confirmed Challans', value: stats.confirmedChallans, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Here's what's happening in your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <h3 className="text-sm font-medium text-slate-500">{card.title}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Customers */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800">Recent Customers</h2>
          </div>
          <div className="p-0 flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{customer.customerName}</td>
                    <td className="px-6 py-4 text-slate-600">{customer.customerType}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${customer.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 
                          customer.status === 'LEAD' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                        {customer.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recent.customers.length === 0 && (
                  <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500">No customers found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Sales Challans */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800">Recent Challans</h2>
          </div>
          <div className="p-0 flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Challan #</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.challans.map((challan) => (
                  <tr key={challan._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{challan.challanNumber}</td>
                    <td className="px-6 py-4 text-slate-600">{challan.customer?.customerName || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-900 font-medium">${challan.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${challan.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 
                          challan.status === 'DRAFT' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                        {challan.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recent.challans.length === 0 && (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No challans found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
