import React, { useState, useEffect, useCallback } from 'react';
import { Key, Building, Check, X, Info, ShieldCheck, Loader2, RefreshCw, Lock, Unlock } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';
import toast from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';

const LicensesTab = () => {
  const [customers, setCustomers] = useState([]);
  const [apps, setApps] = useState([]);
  const [modules, setModules] = useState([]);
  const [licenses, setLicenses] = useState({}); // { customerId: [moduleIds] }
  
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmation Modal State
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });

  const openConfirm = (title, message, onConfirm, type = 'info') => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        await onConfirm();
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      },
      type
    });
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch Tenants
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });
      if (tenantsError) throw tenantsError;
      
      // Fetch Apps
      const { data: appsData, error: appsError } = await supabase
        .from('apps')
        .select('*')
        .order('name', { ascending: true });
      if (appsError) throw appsError;
      
      // Fetch Modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('app_modules')
        .select('*');
      if (modulesError) throw modulesError;
      
      // Fetch Licenses
      const { data: licensesData, error: licensesError } = await supabase
        .from('tenant_licenses')
        .select('*');
      if (licensesError) throw licensesError;
      
      // Format Licenses to { customerId: [moduleIds] }
      const formattedLicenses = {};
      licensesData.forEach(license => {
        if (!formattedLicenses[license.tenant_id]) {
          formattedLicenses[license.tenant_id] = [];
        }
        if (!formattedLicenses[license.tenant_id].includes(license.module_id)) {
          formattedLicenses[license.tenant_id].push(license.module_id);
        }
      });

      setCustomers(tenantsData || []);
      setApps(appsData || []);
      setModules(modulesData || []);
      setLicenses(formattedLicenses);
      
      setSelectedCustomerId(prev => prev || (tenantsData && tenantsData.length > 0 ? tenantsData[0].id : null));
    } catch (error) {
      console.error('Error fetching data for licenses:', error);
      toast.error('Failed to load license data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const customerLicenses = licenses[selectedCustomerId] || [];

  /**
   * PONT "DOUBLE LOCK" - ACTIVATION & PROVISIONING
   * ---------------------------------------------
   * Cette fonction déclenche tout le mécanisme d'onboarding automatisé :
   * 1. Demande de confirmation à l'Admin EtherNanos.
   * 2. Appel au Bridge Django (External Provisioning) pour créer l'école et l'admin.
   * 3. Attribution des licences de base dans Supabase (déverrouille le Hub).
   */
  const handleUnlockApp = (app) => {
    if (!selectedCustomerId) return;
    const customer = customers.find(c => c.id === selectedCustomerId);
    
    openConfirm(
        'Activer la licence ?',
        `Voulez-vous accorder la licence pour ${app.name} à ${customer.name} ? Cela créera automatiquement le compte Admin dans l'application Cloud.`,
        async () => {
            setIsSubmitting(true);
            const toastId = toast.loading(`Câblage de l'application ${app.name}...`);
        
            try {
              const apiUrl = import.meta.env.VITE_SCHOOL_MANAGE_API_URL;
              if (!apiUrl) throw new Error("L'URL de l'API Cloud (VITE_SCHOOL_MANAGE_API_URL) n'est pas configurée.");
              
              const apiKey = import.meta.env.VITE_HUB_API_KEY;
              const normalizedApiUrl = apiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
              const hubId = customer.hub_id || customer.hubId || `ETH-NANOS-${customer.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

              const response = await fetch(`${normalizedApiUrl}/api/external/provision-tenant/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Hub-Api-Key': apiKey
                },
                body: JSON.stringify({
                  tenant_id: customer.id,
                  tenant_name: customer.name,
                  hub_id: hubId,
                  admin_email: customer.contact_email || `${customer.name.toLowerCase().replace(/\s/g, '')}@kanycollege.com`
                })
              });
        
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors du provisioning Django');
              }
        
              const baseModules = modules.filter(m => m.app_id === app.id && !m.is_premium);
              if (baseModules.length > 0) {
                const licenseEntries = baseModules.map(m => ({
                  tenant_id: selectedCustomerId,
                  module_id: m.id
                }));
        
                const { error: licenseError } = await supabase.from('tenant_licenses').insert(licenseEntries);
                if (licenseError) throw licenseError;
              }
        
              toast.success(`${app.name} activé avec succès ! Compte Admin créé.`, { id: toastId });
              fetchData();
            } catch (error) {
              console.error('Error unlocking app:', error);
              toast.error(`Échec de l'activation : ${error.message}`, { id: toastId });
            } finally {
              setIsSubmitting(false);
            }
        },
        'info'
    );
  };

  const toggleLicense = async (moduleId) => {
    if (!selectedCustomerId) return;
    setIsSubmitting(true);
    
    const hasAccess = customerLicenses.includes(moduleId);
    
    try {
      if (hasAccess) {
        // Revoke license
        const { error } = await supabase
          .from('tenant_licenses')
          .delete()
          .eq('tenant_id', selectedCustomerId)
          .eq('module_id', moduleId);
          
        if (error) throw error;
        
        setLicenses(prev => ({
          ...prev,
          [selectedCustomerId]: prev[selectedCustomerId].filter(id => id !== moduleId)
        }));
        toast.success('License revoked');
      } else {
        // Grant license
        const { error } = await supabase
          .from('tenant_licenses')
          .insert([{
            tenant_id: selectedCustomerId,
            module_id: moduleId
          }]);
          
        if (error) throw error;
        
        setLicenses(prev => ({
          ...prev,
          [selectedCustomerId]: [...(prev[selectedCustomerId] || []), moduleId]
        }));
        toast.success('License granted');
      }
    } catch (error) {
      console.error('Error toggling license:', error);
      toast.error('Failed to change license status');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-blue-400">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-gray-400">Loading licenses...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left Column: Tenant Selection */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4 border-r border-gray-700/50 pr-0 lg:pr-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-2">
           <Building className="text-blue-400" size={24} /> 
           Select Tenant
        </h2>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {customers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => setSelectedCustomerId(customer.id)}
              className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 flex items-center justify-between ${
                selectedCustomerId === customer.id
                  ? 'bg-blue-900/40 border-blue-500 shadow-lg shadow-blue-500/10'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-500 hover:bg-gray-750'
              }`}
            >
              <div className="font-semibold text-gray-100">{customer.name}</div>
              <div className="bg-gray-900 text-gray-400 text-xs px-2 py-1 rounded-md font-mono border border-gray-700">
                {licenses[customer.id]?.length || 0} Modules
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: License Assignment Matrix */}
      <div className="w-full lg:w-2/3 flex flex-col h-full">
         <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 mb-6 flex justify-between items-center shadow-lg">
           <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-white mb-1">
                 {customers.find(c => c.id === selectedCustomerId)?.name || "Select a Tenant"}
              </h2>
              <p className="text-gray-400 text-sm flex items-center gap-2">
                 <Key size={14} className="text-fuchsia-400"/> Manage access rights and feature toggles
              </p>
           </div>
           <button 
              onClick={fetchData}
              disabled={isSubmitting}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors font-medium border border-gray-700 disabled:opacity-50"
              title="Refresh Licenses"
           >
              <RefreshCw size={18} className={isSubmitting ? "animate-spin" : ""} />
           </button>
         </div>

         {/* Modules List for toggling, grouped by App */}
         <div className="flex-1 overflow-y-auto pb-4 custom-scrollbar pr-2 space-y-8">
            {apps.map(app => {
               const appModules = modules.filter(m => m.app_id === app.id);
               if (appModules.length === 0) return null;
               
               const appModuleIds = appModules.map(m => m.id);
               const hasAppAccess = appModuleIds.some(id => customerLicenses.includes(id));
               
               return (
                 <div key={app.id} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                       <h3 className="text-xl font-bold text-white">{app.name}</h3>
                       {hasAppAccess ? (
                          <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                             <ShieldCheck size={14} /> Licensed
                          </span>
                       ) : (
                          <span className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase tracking-widest bg-gray-500/10 px-3 py-1 rounded-full border border-gray-500/20">
                             <Lock size={14} /> Locked
                          </span>
                       )}
                    </div>
                    
                    <div className="relative">
                       {/* Modules Grid */}
                       <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500 ${!hasAppAccess ? 'filter blur-sm opacity-40 pointer-events-none' : ''}`}>
                         {appModules.map((module) => {
                            const hasAccess = customerLicenses.includes(module.id);
                            
                            return (
                              <div 
                                key={module.id}
                                onClick={() => toggleLicense(module.id)}
                                className={`relative p-5 rounded-xl border cursor-pointer transition-all duration-300 overflow-hidden group flex items-center justify-between ${
                                  hasAccess 
                                     ? 'bg-emerald-900/20 border-emerald-500/50 shadow-sm' 
                                     : 'bg-gray-800/50 border-gray-700 hover:border-gray-500'
                                }`}
                              >
                                 <div className="flex items-center gap-4 z-10 w-full pr-8">
                                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border transition-colors ${
                                       hasAccess 
                                        ? 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 border-emerald-400/50' 
                                        : 'bg-gray-900 border-gray-600 text-gray-500 group-hover:text-gray-400'
                                    }`}>
                                       {hasAccess ? <Check size={20} className="stroke-[3]"/> : <X size={20} />}
                                    </div>
                                    <div>
                                       <h4 className={`font-semibold  ${hasAccess ? 'text-emerald-100' : 'text-gray-300'}`}>
                                          {module.name}
                                       </h4>
                                       {module.is_premium ? (
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mt-1 inline-block">
                                             Premium
                                          </span>
                                       ) : (
                                          <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-700 mt-1 inline-block">
                                             Included Base
                                          </span>
                                       )}
                                    </div>
                                 </div>
                                 
                                 <div className="absolute right-5 z-10">
                                   <div className={`w-10 h-5 rounded-full p-1 transition-colors duration-300 flex items-center ${hasAccess ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                                     <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${hasAccess ? 'translate-x-4.5' : 'translate-x-0'}`} />
                                   </div>
                                 </div>
                              </div>
                            );
                         })}
                       </div>

                       {/* Unlock Overlay */}
                       {!hasAppAccess && (
                          <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-950/40 backdrop-blur-sm rounded-2xl">
                             <div className="bg-gray-900/90 border border-white/10 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-5 max-w-2xl mx-4 w-full">
                                <div className="w-12 h-12 shrink-0 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30 text-blue-400 shadow-inner">
                                   <Lock size={24} />
                                </div>
                                <div className="text-left flex-1">
                                   <h4 className="text-base font-bold text-white">Application Verrouillée</h4>
                                   <p className="text-gray-400 text-sm mt-0.5">
                                      Activez la licence pour débloquer {app.name}.
                                   </p>
                                </div>
                                <button
                                   onClick={() => handleUnlockApp(app)}
                                   disabled={isSubmitting}
                                   className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-5 rounded-xl transition-all hover:bg-blue-400 active:scale-95 shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50 text-sm"
                                >
                                   {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Unlock size={18} />}
                                   DÉVERROUILLER
                                </button>
                             </div>
                          </div>
                       )}
                    </div>
                 </div>
               );
            })}
         </div>

         {/* Warning/Info Box */}
         <div className="mt-auto pt-6">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 flex gap-3 text-sm text-blue-200">
               <Info size={20} className="shrink-0 text-blue-400" />
               <p>
                  Changes made here will be instantly synchronized with the client's <strong>EtherNanos Hub</strong> upon their next activity. Revoking a module immediately hides it from the Yekola UI.
               </p>
            </div>
         </div>
      </div>

      <ConfirmModal 
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
      />
    </div>
  );
};

export default LicensesTab;
