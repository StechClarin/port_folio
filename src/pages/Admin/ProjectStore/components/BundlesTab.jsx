import React, { useState, useEffect, useCallback } from 'react';
import { Package, Plus, Trash2, Edit, Save, RefreshCw, Power, ImageIcon, Loader2, Info, Check, X, Box } from 'lucide-react';
import StoreModal from './StoreModal';
import ConfirmModal from './ConfirmModal';
import { supabase } from '../../../../lib/supabaseClient';
import toast from 'react-hot-toast';

const BundlesTab = () => {
  const [bundles, setBundles] = useState([]);
  const [modules, setModules] = useState([]);
  const [apps, setApps] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [bundleItems, setBundleItems] = useState({}); // { bundleId: [moduleId] }
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

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
  const [formData, setFormData] = useState({ 
    id: null, 
    name: '', 
    description: '', 
    bannerUrl: '', 
    price: 0, 
    oldPrice: 0,
    selectedModuleIds: [] 
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Bundles
      const { data: bundlesData, error: bundlesError } = await supabase
        .from('bundles')
        .select('*')
        .order('created_at', { ascending: false });
      if (bundlesError) throw bundlesError;
      
      // 2. Fetch Bundle Items
      const { data: itemsData, error: itemsError } = await supabase
        .from('bundle_items')
        .select('*');
      if (itemsError) throw itemsError;
      
      // 3. Fetch Apps (for grouping)
      const { data: appsData, error: appsError } = await supabase
        .from('apps')
        .select('id, name');
      if (appsError) throw appsError;

      // 4. Fetch Modules (for selection)
      const { data: modulesData, error: modulesError } = await supabase
        .from('app_modules')
        .select('id, name, app_id, tier, code');
      if (modulesError) throw modulesError;

      // Group items by bundleId
      const groupedItems = {};
      itemsData?.forEach(item => {
        if (!groupedItems[item.bundle_id]) groupedItems[item.bundle_id] = [];
        groupedItems[item.bundle_id].push(item.module_id);
      });

      setBundles(bundlesData || []);
      setBundleItems(groupedItems);
      setApps(appsData || []);
      setModules(modulesData || []);
      if (appsData?.length > 0) setSelectedAppId(appsData[0].id);
    } catch (error) {
      console.error('Error fetching bundles:', error);
      toast.error('Failed to load packs data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error("Le nom et le prix sont requis.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      let bundleId = formData.id;

      if (isEditMode && bundleId) {
        // Update Bundle
        const { error: bundleError } = await supabase
          .from('bundles')
          .update({
            name: formData.name,
            description: formData.description,
            banner_url: formData.bannerUrl,
            price: formData.price,
            old_price: formData.oldPrice || null,
          })
          .eq('id', bundleId);
        if (bundleError) throw bundleError;

        // Update items (Delete existing and re-insert)
        const { error: deleteError } = await supabase
          .from('bundle_items')
          .delete()
          .eq('bundle_id', bundleId);
        if (deleteError) throw deleteError;
      } else {
        // Create Bundle
        const { data, error: bundleError } = await supabase
          .from('bundles')
          .insert([{
            name: formData.name,
            description: formData.description,
            banner_url: formData.bannerUrl,
            price: formData.price,
            old_price: formData.oldPrice || null,
            is_active: true
          }])
          .select()
          .single();
        if (bundleError) throw bundleError;
        bundleId = data.id;
      }

      // Insert Items
      if (formData.selectedModuleIds.length > 0) {
        const itemsToInsert = formData.selectedModuleIds.map(modId => ({
          bundle_id: bundleId,
          module_id: modId
        }));
        const { error: itemsError } = await supabase
          .from('bundle_items')
          .insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }

      toast.success(isEditMode ? 'Pack mis à jour !' : 'Pack créé !');
      setIsModalOpen(false);
      fetchData(); // Refresh all
    } catch (error) {
      console.error('Error saving bundle:', error);
      toast.error(error.message || 'Échec de la sauvegarde du pack');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (bundle) => {
    setIsEditMode(true);
    setFormData({
      id: bundle.id,
      name: bundle.name,
      description: bundle.description || '',
      bannerUrl: bundle.banner_url || '',
      price: bundle.price,
      oldPrice: bundle.old_price || 0,
      selectedModuleIds: bundleItems[bundle.id] || []
    });
    if (apps.length > 0) setSelectedAppId(apps[0].id);
    setIsModalOpen(true);
  };

  const handleDelete = async (bundle) => {
    openConfirm(
        'Supprimer le Pack ?',
        `Êtes-vous sûr de vouloir supprimer définitivement le pack "${bundle.name}" ? Les modules individuels ne seront pas affectés.`,
        async () => {
            try {
                const { error } = await supabase
                  .from('bundles')
                  .delete()
                  .eq('id', bundle.id);
                if (error) throw error;
                setBundles(bundles.filter(b => b.id !== bundle.id));
                toast.success('Pack supprimé');
              } catch (err) {
                console.error(err);
                toast.error('Échec de la suppression');
              }
        },
        'danger'
    );
  };

  const handleToggleStatus = async (bundle) => {
    const newStatus = !bundle.is_active;
    openConfirm(
        newStatus ? 'Activer le Pack ?' : 'Désactiver le Pack ?',
        `Voulez-vous ${newStatus ? 'publier' : 'suspendre'} ce pack ? ${newStatus ? 'Il sera immédiatement visible dans le Store.' : 'Il ne sera plus disponible à l\'achat.'}`,
        async () => {
            try {
                const { error } = await supabase
                  .from('bundles')
                  .update({ is_active: newStatus })
                  .eq('id', bundle.id);
                if (error) throw error;
                setBundles(bundles.map(b => b.id === bundle.id ? { ...b, is_active: newStatus } : b));
                toast.success(newStatus ? 'Pack activé' : 'Pack désactivé');
              } catch (err) {
                console.error(err);
                toast.error('Erreur lors du changement de statut');
              }
        },
        'warning'
    );
  };

  const toggleModuleSelection = (moduleId) => {
    setFormData(prev => {
      const isSelected = prev.selectedModuleIds.includes(moduleId);
      const newSelections = isSelected 
        ? prev.selectedModuleIds.filter(id => id !== moduleId) 
        : [...prev.selectedModuleIds, moduleId];
      return { ...prev, selectedModuleIds: newSelections };
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-yellow-500">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-gray-400">Loading packs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-900/40 p-4 rounded-xl border border-gray-700/50">
        <div>
           <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Package className="text-yellow-400" size={24} /> 
              Application Packs (Bundles)
           </h2>
           <p className="text-sm text-gray-400 mt-1">Combine multiple modules into a single discounted offer for your customers.</p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={fetchData}
            className="text-gray-400 hover:text-white p-2 rounded-lg transition-colors bg-gray-900/50 hover:bg-gray-800"
            title="Refresh Data"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={() => {
              setIsEditMode(false);
              setFormData({ id: null, name: '', description: '', bannerUrl: '', price: 0, oldPrice: 0, selectedModuleIds: [] });
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-black font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-yellow-500/20 transition-all whitespace-nowrap"
          >
            <Plus size={18} />
            Create Pack
          </button>
        </div>
      </div>

      {/* Bundles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {bundles.map((bundle) => (
            <div 
               key={bundle.id}
               className={`relative bg-gray-800/60 rounded-2xl border backdrop-blur-sm transition-all shadow-sm overflow-hidden group hover:-translate-y-1 flex flex-col ${
                 bundle.is_active ? 'border-yellow-500/30 hover:border-yellow-500/50 shadow-yellow-900/10' : 'border-gray-700/50 grayscale-[40%]'
               }`}
            >
               {/* Banner Preview */}
               <div className="h-32 bg-gray-900 relative">
                  {bundle.banner_url ? (
                    <img src={bundle.banner_url} alt={bundle.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                       <ImageIcon size={32} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                  <div className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-yellow-400 uppercase tracking-widest">PACK</div>
                  
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => handleToggleStatus(bundle)} className={`p-1.5 rounded-lg bg-gray-900/80 backdrop-blur-md ${bundle.is_active ? 'text-amber-500' : 'text-emerald-500'}`}><Power size={14}/></button>
                     <button onClick={() => handleEditClick(bundle)} className="p-1.5 rounded-lg bg-gray-900/80 backdrop-blur-md text-gray-300 hover:text-white"><Edit size={14}/></button>
                     <button onClick={() => handleDelete(bundle)} className="p-1.5 rounded-lg bg-gray-900/80 backdrop-blur-md text-red-500 hover:text-red-400"><Trash2 size={14}/></button>
                  </div>
               </div>

               <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">{bundle.name}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">{bundle.description || 'No description provided.'}</p>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
                     <div className="flex flex-col">
                        {bundle.old_price && <span className="text-xs text-gray-500 line-through">{bundle.old_price}€</span>}
                        <span className="text-2xl font-black text-white">{bundle.price}€</span>
                     </div>
                     <div className="flex -space-x-2">
                        {(bundleItems[bundle.id] || []).slice(0, 3).map((modId, i) => (
                          <div key={i} title={modules.find(m => m.id === modId) ? `${modules.find(m => m.id === modId).name} (${modules.find(m => m.id === modId).tier || 'starter'})` : ''} className="w-8 h-8 rounded-full bg-gray-900 border-2 border-gray-800 flex items-center justify-center text-xs text-yellow-400 font-bold">
                             {modules.find(m => m.id === modId)?.name?.charAt(0) || '?'}
                          </div>
                        ))}
                        {(bundleItems[bundle.id]?.length || 0) > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-[10px] text-white font-bold">
                             +{(bundleItems[bundle.id]?.length || 0) - 3}
                          </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {bundles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-900/20 rounded-2xl border border-dashed border-gray-700">
           <Package size={48} className="text-gray-700 mb-4" />
           <p className="text-gray-500">No application packs found. Start by creating one!</p>
        </div>
      )}

      {/* --- Create/Edit Modal --- */}
      <StoreModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={isEditMode ? "Modifier le Pack" : "Créer un Nouveau Pack"}
      >
        <form onSubmit={handleCreateOrUpdate} className="space-y-4">
           {/* Section 1: General Info */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nom du Pack</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500" placeholder="ex: Pack Éducation Complet" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Banner Image URL</label>
                <div className="flex flex-col gap-2">
                  <input type="text" value={formData.bannerUrl} onChange={e => setFormData({...formData, bannerUrl: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500" placeholder="https://images..." />
                </div>
              </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white h-20 focus:ring-yellow-500 focus:border-yellow-500" placeholder="Décrivez les avantages de ce pack..." />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Ancien Prix (€)</label>
                <input type="number" step="0.01" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: parseFloat(e.target.value) || 0})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-yellow-500" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Prix Promo (€)</label>
                <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-yellow-500" placeholder="0.00" />
              </div>
           </div>

           {/* Section 2: App & Module Selection */}
           <div className="pt-4 border-t border-gray-700 mt-6">
              <label className="block text-lg font-bold text-white mb-3 flex items-center gap-2">
                 <Box size={20} className="text-yellow-500" /> 
                 Modules Inclus ({formData.selectedModuleIds.length})
              </label>
              
              <div className="flex gap-4 h-[300px]">
                {/* App Siderail */}
                <div className="w-1/3 overflow-y-auto pr-2 border-r border-gray-700 custom-scrollbar space-y-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-2">Choisir une Application</p>
                  {apps.map(app => {
                    const appModules = modules.filter(m => m.app_id === app.id);
                    const selectedInApp = appModules.filter(m => formData.selectedModuleIds.includes(m.id)).length;
                    
                    return (
                      <div 
                        key={app.id}
                        onClick={() => setSelectedAppId(app.id)}
                        className={`p-3 rounded-xl cursor-pointer transition-all border ${
                          selectedAppId === app.id 
                            ? 'bg-yellow-500/20 border-yellow-500/50 text-white' 
                            : 'bg-gray-800/40 border-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold truncate">{app.name}</span>
                          {selectedInApp > 0 && (
                            <span className="bg-yellow-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">
                              {selectedInApp}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Modules Main Area */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedAppId ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-2 px-2">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          Modules de {apps.find(a => a.id === selectedAppId)?.name}
                        </p>
                        <button 
                          type="button"
                          onClick={() => {
                            const appMods = modules.filter(m => m.app_id === selectedAppId).map(m => m.id);
                            const allSelected = appMods.every(id => formData.selectedModuleIds.includes(id));
                            
                            setFormData(prev => {
                              let newList;
                              if (allSelected) {
                                newList = prev.selectedModuleIds.filter(id => !appMods.includes(id));
                              } else {
                                newList = Array.from(new Set([...prev.selectedModuleIds, ...appMods]));
                              }
                              return { ...prev, selectedModuleIds: newList };
                            });
                          }}
                          className="text-[10px] font-bold text-yellow-500 hover:text-yellow-400 uppercase tracking-tight"
                        >
                          {modules.filter(m => m.app_id === selectedAppId).every(m => formData.selectedModuleIds.includes(m.id)) ? 'Désélectionner Tout' : 'Tout Sélectionner'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {modules.filter(m => m.app_id === selectedAppId).map(mod => {
                          const isSelected = formData.selectedModuleIds.includes(mod.id);
                          return (
                            <div 
                                key={mod.id}
                                onClick={() => toggleModuleSelection(mod.id)}
                                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                                  isSelected ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                                      isSelected ? 'bg-yellow-500 border-yellow-400 text-black' : 'bg-gray-900 border-gray-700 text-transparent'
                                  }`}>
                                      <Check size={12} className="stroke-[3]" />
                                  </div>
                                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                    {mod.name} {mod.tier && <span className="text-[10px] bg-gray-900 px-1.5 py-0.5 rounded text-gray-500 uppercase font-mono font-bold ml-2 border border-gray-800">({mod.tier})</span>}
                                  </span>
                                </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                       <Box size={32} className="mb-2" />
                       <p className="text-sm">Sélectionnez une application à gauche</p>
                    </div>
                  )}
                </div>
              </div>
           </div>

           <div className="pt-6 flex justify-end gap-3 border-t border-gray-800 mt-6">
              <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50">Annuler</button>
              <button disabled={isSubmitting} type="submit" className="px-8 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-lg transition flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-yellow-500/20">
                 {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                 {isSubmitting ? 'Sauvegarde...' : (isEditMode ? 'Enregistrer' : 'Créer le Pack')}
              </button>
           </div>
        </form>
      </StoreModal>

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

export default BundlesTab;
