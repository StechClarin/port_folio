import React, { useState, useEffect, useCallback } from 'react';
import { Search, ShieldAlert, ShieldCheck, Edit, UserCog, Power, Save, Loader2, RefreshCw, Trash2, Copy, UserPlus } from 'lucide-react';
import StoreModal from './StoreModal';
import { supabase } from '../../../../lib/supabaseClient';
import toast from 'react-hot-toast';
import { confirmAction } from '../../../../utils/toastUtils';

const CustomersTab = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [isEditTenantMode, setIsEditTenantMode] = useState(false);
  const [newTenant, setNewTenant] = useState({ 
    id: '', 
    name: '', 
    hubId: '', 
    email: '', 
    phone: '', 
    industry: '',
    country: '',
    isActive: true,
  });

  const handleCopyHubId = (hubId) => {
    navigator.clipboard.writeText(hubId);
    toast.success('Hub ID copied to clipboard');
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Query tenants and join with tenant_licenses to get the count
      const { data, error } = await supabase
        .from('tenants')
        .select('*, tenant_licenses(id)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Failed to load tenants');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = useCallback(() => {
    setNewTenant({ id: '', name: '', hubId: '', email: '', phone: '', industry: '', country: '', isActive: true });
  }, []);

  const handleToggleTenantStatus = async (tenantId, currentStatus) => {
    const newStatus = !currentStatus;
    confirmAction(`Are you sure you want to ${newStatus ? 'reactivate' : 'kill switch (revoke access for)'} this tenant?`, async () => {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .update({ is_active: newStatus })
          .eq('id', tenantId)
          .select('*, tenant_licenses(id)')
          .single();
          
        if (error) throw error;
        
        setCustomers(customers.map(c => c.id === tenantId ? data : c));
        toast.success(newStatus ? 'Tenant reactivated' : 'Kill switch activated! access revoked.');
      } catch (err) {
        console.error(err);
        toast.error('Failed to toggle tenant status');
      }
    });
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditTenantMode && newTenant.id) {
        const { data, error } = await supabase
          .from('tenants')
          .update({
            name: newTenant.name,
            contact_email: newTenant.email,
            contact_phone: newTenant.phone,
            industry: newTenant.industry,
            country: newTenant.country,
            hub_id: newTenant.hubId,
            is_active: newTenant.isActive
          })
          .eq('id', newTenant.id)
          .select('*, tenant_licenses(id)')
          .single();

        if (error) throw error;

        setCustomers(customers.map(c => c.id === data.id ? data : c));
        setIsTenantModalOpen(false);
        setIsEditTenantMode(false);
        toast.success('Tenant updated successfully!');
      } else {
        // CREATE LOGIC: automatic user creation with default password
        const { data: rpcData, error: rpcError } = await supabase.rpc('create_tenant_with_auth', {
          t_name: newTenant.name,
          t_email: newTenant.email,
          t_phone: newTenant.phone,
          t_industry: newTenant.industry,
          t_country: newTenant.country,
          t_password: 'admin@1234',
          t_hub_id: newTenant.hubId || null
        });

        if (rpcError) throw rpcError;
        if (rpcData && rpcData.success === false) {
          throw new Error(rpcData.message || 'Failed to create user/tenant');
        }

        const { data: fullTenant, error: fetchError } = await supabase
          .from('tenants')
          .select('*, tenant_licenses(id)')
          .eq('id', rpcData.tenant_id)
          .single();
        
        if (fetchError) throw fetchError;
        setCustomers([fullTenant, ...customers]);
        setIsTenantModalOpen(false);
        toast.success('Tenant & User created successfully!');
      }
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to save tenant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTenantClick = (tenant) => {
    setIsEditTenantMode(true);
    setNewTenant({
      id: tenant.id,
      name: tenant.name,
      hubId: tenant.hub_id || '',
      email: tenant.contact_email || '',
      phone: tenant.contact_phone || '',
      industry: tenant.industry || '',
      country: tenant.country || '',
      isActive: tenant.is_active,
    });
    setIsTenantModalOpen(true);
  };

  const handleDeleteTenant = async (tenantId, tenantName) => {
    confirmAction(`Are you sure you want to permanently delete '${tenantName}'? All licenses will be revoked cascade.`, async () => {
      try {
        const { error } = await supabase
          .from('tenants')
          .delete()
          .eq('id', tenantId);
          
        if (error) throw error;
        
        setCustomers(customers.filter(c => c.id !== tenantId));
        toast.success('Tenant deleted');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete tenant');
      }
    });
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.hub_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-emerald-500">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-gray-400">Loading tenants...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
           <UserCog className="text-fuchsia-400" size={24} /> 
           Tenants & Hub Devices
        </h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by school name or Hub ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <button 
            onClick={fetchData}
            className="text-gray-400 hover:text-white p-2 rounded-lg transition-colors bg-gray-900/50 hover:bg-gray-800"
            title="Refresh Data"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={() => {
              setIsEditTenantMode(false);
              setNewTenant({ id: null, name: '', hubId: '', email: '', phone: '', industry: '', country: '', isActive: true });
              setIsTenantModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors whitespace-nowrap shadow-lg shadow-emerald-600/20 font-medium"
          >
            Add Tenant
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredCustomers.map((customer) => (
          <div 
            key={customer.id} 
            className={`bg-gray-800/40 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 border backdrop-blur-sm transition-all shadow-sm group ${
              customer.is_active 
                ? 'border-emerald-500/30' 
                : 'border-red-500/30 grayscale-[50%]'
            }`}
          >
            {/* Customer Info */}
            <div className="flex items-center gap-5 w-full md:w-auto">
               <div className={`p-4 rounded-xl flex items-center justify-center shrink-0 ${
                   customer.is_active 
                     ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                     : 'bg-red-500/10 text-red-500 border border-red-500/20'
               }`}>
                  {customer.is_active ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
               </div>
               
               <div>
                 <h3 className="text-lg font-bold text-white mb-1">{customer.name}</h3>
                 <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-gray-400 bg-gray-900 px-2 py-1 rounded border border-gray-700">
                       {customer.industry || 'No Industry'} • {customer.country || 'No Country'}
                    </span>
                    <span className="font-mono text-xs bg-gray-900 px-2 py-1 rounded text-violet-300 border border-gray-700 flex items-center gap-2 group/hubid">
                       Hub ID: {customer.hub_id}
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleCopyHubId(customer.hub_id); }}
                         className="text-gray-500 hover:text-violet-400 transition-colors opacity-0 group-hover/hubid:opacity-100"
                         title="Copy Hub ID"
                       >
                         <Copy size={12} />
                       </button>
                    </span>
                 </div>
               </div>
            </div>

            {/* Actions & Stats */}
            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-gray-700/50 pt-4 md:pt-0">
               <div className="text-center px-4 md:border-r border-gray-700">
                  <span className="block text-2xl font-bold text-white">{customer.tenant_licenses?.length || 0}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Licenses</span>
               </div>
               
               <div className="flex items-center gap-3">
                 <button 
                    onClick={() => handleToggleTenantStatus(customer.id, customer.is_active)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                     customer.is_active 
                        ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                 }`}>
                    <Power size={16} />
                    {customer.is_active ? 'Kill Switch' : 'Reactivate'}
                 </button>
                 
                 <button
                    onClick={() => handleDeleteTenant(customer.id, customer.name)}
                    className="p-2 text-red-500 hover:text-white bg-red-900/30 hover:bg-red-600 rounded-xl border border-red-800/50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Tenant"
                 >
                    <Trash2 size={20} />
                 </button>
                 
                 <button 
                    onClick={() => handleEditTenantClick(customer)}
                    className="p-2 flex items-center justify-center text-gray-400 hover:text-white bg-gray-900 rounded-xl border border-gray-700 transition-colors"
                    title="Edit Tenant"
                 >
                    <Edit size={20} />
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- Modals --- */}
      
      {/* Add / Edit Tenant Modal */}
      <StoreModal 
        isOpen={isTenantModalOpen} 
        onClose={() => setIsTenantModalOpen(false)} 
        title={isEditTenantMode ? "Edit Tenant" : "Register New Tenant"}
      >
        <form className="space-y-4" onSubmit={handleCreateTenant}>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tenant Name <span className="text-red-500">*</span></label>
                <input type="text" required value={newTenant.name} onChange={e => setNewTenant({...newTenant, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g. Lycée d'Excellence" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Industry / Sector</label>
                <input type="text" value={newTenant.industry} onChange={e => setNewTenant({...newTenant, industry: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g. Éducation, Santé" />
              </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
              <input type="text" value={newTenant.country} onChange={e => setNewTenant({...newTenant, country: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g. Sénégal, France" />
           </div>

           {!isEditTenantMode && (
             <div className="bg-violet-900/10 border border-violet-500/20 p-4 rounded-xl flex items-start gap-4 transition-all">
                <div className="pt-1">
                  <UserPlus className="text-violet-400" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-violet-400 font-bold">Utilisateur automatique</span>
                    <span className="text-xs text-gray-400 uppercase tracking-tight">Password: admin@1234</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight font-semibold">Le tenant créé recevra automatiquement un utilisateur Supabase.</p>
                </div>
             </div>
           )}

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Contact Email <span className="text-red-500">*</span></label>
                <input type="email" required value={newTenant.email} onChange={e => setNewTenant({...newTenant, email: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-emerald-500 focus:border-emerald-500" placeholder="admin@school.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                <input type="tel" value={newTenant.phone} onChange={e => setNewTenant({...newTenant, phone: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-emerald-500 focus:border-emerald-500" placeholder="+1 234 567 890" />
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">EtherNanos Hub ID {isEditTenantMode ? '' : '(Optional)'}</label>
                <div className="relative">
                  <input 
                    type="text" 
                    disabled={isEditTenantMode} 
                    value={newTenant.hubId} 
                    onChange={e => setNewTenant({...newTenant, hubId: e.target.value})} 
                    className={`w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white font-mono text-sm focus:ring-emerald-500 focus:border-emerald-500 ${isEditTenantMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    placeholder="e.g. ETH-NANOS-XXXXXX" 
                  />
                  {isEditTenantMode && (
                    <button 
                      type="button"
                      onClick={() => handleCopyHubId(newTenant.hubId)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white bg-gray-700 rounded-md transition-colors"
                      title="Copy Hub ID"
                    >
                      <Copy size={14} />
                    </button>
                  )}
                </div>
                {!isEditTenantMode && <p className="mt-1 text-xs text-gray-500">Leave blank to auto-generate.</p>}
              </div>
           </div>
           
           <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3 mt-4">
              <input type="checkbox" id="isActive" checked={newTenant.isActive} onChange={e => setNewTenant({...newTenant, isActive: e.target.checked})} className="mt-1 w-4 h-4 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 bg-gray-800" />
              <div>
                 <label htmlFor="isActive" className="text-emerald-500 font-semibold cursor-pointer block">Active Tenant (Grant Access)</label>
                 <p className="text-xs text-gray-400 mt-1">If enabled, the tenant's hub will be able to synchronize and download updates immediately.</p>
              </div>
           </div>
           
           <div className="pt-4 flex justify-end gap-3 border-t border-gray-800 mt-6">
              <button type="button" onClick={() => setIsTenantModalOpen(false)} className="px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">Cancel</button>
              <button 
                 type="submit" 
                 disabled={isSubmitting}
                 className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 font-medium disabled:opacity-50"
              >
                 {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                 {isSubmitting ? 'Saving...' : (isEditTenantMode ? 'Save Changes' : 'Register Tenant')}
              </button>
           </div>
        </form>
      </StoreModal>

    </div>
  );
};

export default CustomersTab;
