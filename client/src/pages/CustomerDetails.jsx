import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Edit, MessageSquare, Plus, Clock, User, Phone, MapPin, Building2, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

const CustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newFollowUp, setNewFollowUp] = useState('');
  const [newFollowUpDate, setNewFollowUpDate] = useState('');
  const [addingFollowUp, setAddingFollowUp] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerRes, followUpsRes] = await Promise.all([
          api.get(`/customers/${id}`),
          api.get(`/customers/${id}/follow-ups`)
        ]);
        setCustomer(customerRes.data.data);
        setFollowUps(followUpsRes.data.data);
      } catch (error) {
        console.error('Failed to load customer', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    if (!newFollowUp.trim()) return;
    
    setAddingFollowUp(true);
    try {
      const payload = { notes: newFollowUp };
      if (newFollowUpDate) {
        payload.followUpDate = newFollowUpDate;
      }
      
      const res = await api.post(`/customers/${id}/follow-ups`, payload);
      
      // Update lists locally
      setFollowUps([res.data.data, ...followUps]);
      
      if (newFollowUpDate) {
        setCustomer(prev => ({ ...prev, followUpDate: newFollowUpDate }));
      }
      
      setNewFollowUp('');
      setNewFollowUpDate('');
    } catch (error) {
      console.error('Failed to add follow up', error);
    } finally {
      setAddingFollowUp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!customer) return <div>Customer not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link to="/customers" className="p-2 -ml-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              {customer.customerName}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                ${customer.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 
                  customer.status === 'LEAD' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                {customer.status}
              </span>
            </h1>
            {customer.businessName && <p className="text-sm text-slate-500 mt-1">{customer.businessName}</p>}
          </div>
        </div>
        <Link 
          to={`/customers/${customer._id}/edit`}
          className="inline-flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all shadow-sm w-full sm:w-auto justify-center"
        >
          <Edit className="h-4 w-4" />
          Edit Details
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Contact Info</h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3 text-slate-700">
                <User className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{customer.customerName}</p>
                  <p className="text-slate-500 text-xs">Primary Contact</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-slate-700">
                <Phone className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                <p className="font-medium">{customer.mobileNumber}</p>
              </div>

              {customer.email && (
                <div className="flex items-start gap-3 text-slate-700">
                  <Mail className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                  <p className="font-medium break-all">{customer.email}</p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-4 text-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Business Details</h3>
              
              <div className="flex items-start gap-3 text-slate-700">
                <Briefcase className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{customer.customerType}</p>
                  <p className="text-slate-500 text-xs">Customer Type</p>
                </div>
              </div>

              {customer.gstNumber && (
                <div className="flex items-start gap-3 text-slate-700">
                  <Building2 className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{customer.gstNumber}</p>
                    <p className="text-slate-500 text-xs">GST Number</p>
                  </div>
                </div>
              )}
              
              {customer.address && (
                <div className="flex items-start gap-3 text-slate-700">
                  <MapPin className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                  <p className="font-medium leading-relaxed">{customer.address}</p>
                </div>
              )}
            </div>
            
            {customer.notes && (
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Notes</h3>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg leading-relaxed">
                  {customer.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: CRM & Follow-ups */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                CRM & Follow-ups
              </h2>
              {customer.followUpDate && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                  <Clock className="h-3.5 w-3.5" />
                  Next: {format(new Date(customer.followUpDate), 'MMM d, yyyy HH:mm')}
                </div>
              )}
            </div>
            
            {/* Follow-up Form */}
            <div className="p-6 border-b border-slate-100 bg-white">
              <form onSubmit={handleAddFollowUp} className="space-y-4">
                <div>
                  <textarea
                    value={newFollowUp}
                    onChange={(e) => setNewFollowUp(e.target.value)}
                    rows={2}
                    placeholder="Add a new note or record a conversation..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all resize-none"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Schedule Next:</span>
                    <input
                      type="datetime-local"
                      value={newFollowUpDate}
                      onChange={(e) => setNewFollowUpDate(e.target.value)}
                      className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newFollowUp.trim() || addingFollowUp}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-primary-dark transition-all disabled:opacity-50"
                  >
                    {addingFollowUp ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Add Note
                  </button>
                </div>
              </form>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              <div className="space-y-6">
                {followUps.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-500">
                    No follow-ups recorded yet. Add one above.
                  </div>
                ) : (
                  followUps.map((fu, idx) => (
                    <div key={fu._id} className="relative flex gap-4">
                      {idx !== followUps.length - 1 && (
                        <div className="absolute top-8 left-4 bottom-[-24px] w-px bg-slate-200"></div>
                      )}
                      <div className="relative z-10 h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm text-slate-500 mt-0.5">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <span className="font-semibold text-sm text-slate-900">{fu.createdBy?.name || 'User'}</span>
                          <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                            {format(new Date(fu.createdAt), 'MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{fu.notes}</p>
                        {fu.followUpDate && (
                          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 inline-flex px-2.5 py-1 rounded-md border border-amber-100">
                            <Clock className="h-3.5 w-3.5" />
                            Scheduled Follow-up: {format(new Date(fu.followUpDate), 'MMM d, yyyy HH:mm')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// We need an import for Mail in CustomerDetails
import { Mail } from 'lucide-react';

export default CustomerDetails;
