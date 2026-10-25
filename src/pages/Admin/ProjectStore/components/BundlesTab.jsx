import React, { useState, useEffect, useCallback } from 'react';
import { Package, Plus, Trash2, Edit, Save, RefreshCw, Power, ImageIcon, Loader2, Info, Check, X, Box, AppWindow, Sparkles, Tag, Layers } from 'lucide-react';
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
    appId: '',
    name: '', 
    description: '', 
    bannerUrl: '', 
    price: 0, 
    oldPrice: 0,
    selectedModuleIds: [],
    allowedTags: []
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
        .select('*');
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
      const bundlePayload = {
        name: formData.name,
        description: formData.description,
        banner_url: formData.bannerUrl,
        price: formData.price,
        old_price: formData.oldPrice || null,
        app_id: formData.appId || null,
        allowed_tags: formData.allowedTags || [],
        allowed_pages: formData.allowedTags || [],
      };

      if (isEditMode && bundleId) {
        // Update Bundle
        let { error: bundleError } = await supabase
          .from('bundles')
          .update(bundlePayload)
          .eq('id', bundleId);

        if (bundleError && (bundleError.code === '42703' || bundleError.message?.includes('allowed_tags') || bundleError.message?.includes('app_id'))) {
          const { allowed_tags, app_id, ...fallbackPayload } = bundlePayload;
          const res = await supabase.from('bundles').update(fallbackPayload).eq('id', bundleId);
          bundleError = res.error;
        }
        if (bundleError) throw bundleError;

        // Update items (Delete existing and re-insert)
        const { error: deleteError } = await supabase
          .from('bundle_items')
          .delete()
          .eq('bundle_id', bundleId);
        if (deleteError) throw deleteError;
      } else {
        // Create Bundle
        let { data, error: bundleError } = await supabase
          .from('bundles')
          .insert([{ ...bundlePayload, is_active: true }])
          .select()
          .single();

        if (bundleError && (bundleError.code === '42703' || bundleError.message?.includes('allowed_tags') || bundleError.message?.includes('app_id'))) {
          const { allowed_tags, app_id, ...fallbackPayload } = bundlePayload;
          const res = await supabase.from('bundles').insert([{ ...fallbackPayload, is_active: true }]).select().single();
          data = res.data;
          bundleError = res.error;
        }
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
    const itemIds = bundleItems[bundle.id] || [];
    const relatedMod = modules.find(m => itemIds.includes(m.id));
    const targetAppId = bundle.app_id || relatedMod?.app_id || (apps.length > 0 ? apps[0].id : '');

    let effectiveTags = bundle.allowed_tags || bundle.allowed_pages || [];
    if (!effectiveTags || effectiveTags.length === 0) {
      const collected = [];
      itemIds.forEach(mId => {
        const m = modules.find(mod => mod.id === mId);
        if (m) {
          collected.push(...(m.allowed_tags || m.allowed_pages || []));
        }
      });
      effectiveTags = Array.from(new Set(collected));
    }

    setFormData({
      id: bundle.id,
      appId: targetAppId,
      name: bundle.name,
      description: bundle.description || '',
      bannerUrl: bundle.banner_url || '',
      price: bundle.price,
      oldPrice: bundle.old_price || 0,
      selectedModuleIds: itemIds,
      allowedTags: effectiveTags
    });
    setSelectedAppId(targetAppId);
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

  const toggleTag = (tag, moduleId) => {
    setFormData(prev => {
      const isTagSelected = prev.allowedTags.includes(tag);
      const nextTags = isTagSelected 
        ? prev.allowedTags.filter(t => t !== tag) 
        : [...prev.allowedTags, tag];

      const mod = modules.find(m => m.id === moduleId);
      const modTags = mod ? (mod.allowed_tags || mod.allowed_pages || []) : [];
      const hasRemainingTags = nextTags.some(t => modTags.includes(t));

      let nextModuleIds = prev.selectedModuleIds;
      if (hasRemainingTags && !nextModuleIds.includes(moduleId)) {
        nextModuleIds = [...nextModuleIds, moduleId];
      } else if (!hasRemainingTags && nextModuleIds.includes(moduleId)) {
        nextModuleIds = nextModuleIds.filter(id => id !== moduleId);
      }

      return { ...prev, allowedTags: nextTags, selectedModuleIds: nextModuleIds };
    });
  };

  const toggleAllTagsForModule = (mod) => {
    const modTags = mod.allowed_tags || mod.allowed_pages || [];
    if (modTags.length === 0) return;
    const allSelected = modTags.every(t => formData.allowedTags.includes(t));

    setFormData(prev => {
      let nextTags = [...prev.allowedTags];
      let nextModuleIds = [...prev.selectedModuleIds];

      if (allSelected) {
        nextTags = nextTags.filter(t => !modTags.includes(t));
        nextModuleIds = nextModuleIds.filter(id => id !== mod.id);
      } else {
        nextTags = Array.from(new Set([...nextTags, ...modTags]));
        if (!nextModuleIds.includes(mod.id)) {
          nextModuleIds.push(mod.id);
        }
      }

      return { ...prev, allowedTags: nextTags, selectedModuleIds: nextModuleIds };
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
              const defaultAppId = apps.length > 0 ? apps[0].id : '';
              setFormData({ 
                id: null, 
                appId: defaultAppId,
                name: '', 
                description: '', 
                bannerUrl: '', 
                price: 0, 
                oldPrice: 0, 
                selectedModuleIds: [] 
              });
              setSelectedAppId(defaultAppId);
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
                          <div key={i} title={modules.find(m => m.id === modId)?.name || ''} className="w-8 h-8 rounded-full bg-gray-900 border-2 border-gray-800 flex items-center justify-center text-xs text-yellow-400 font-bold">
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
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateOrUpdate} className="space-y-5">
           {/* Section 1: Application Cible & Nom du Pack */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1.5">
                   <AppWindow size={15} className="text-yellow-400" /> Application Cible
                </label>
                <select 
                  required 
                  value={formData.appId || selectedAppId || ''} 
                  onChange={e => {
                    const newAppId = e.target.value;
                    setSelectedAppId(newAppId);
                    setFormData(prev => ({
                      ...prev,
                      appId: newAppId,
                      selectedModuleIds: []
                    }));
                  }} 
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white font-semibold focus:ring-yellow-500 focus:border-yellow-500"
                >
                  {apps.map(app => (
                    <option key={app.id} value={app.id}>{app.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1.5">
                   <Package size={15} className="text-yellow-400" /> Nom du Pack
                </label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500" 
                  placeholder="ex: Pack Scolarité & Analytics" 
                />
              </div>
           </div>

           {/* Section 2: Banner Image, Description & Tarifs */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1.5">
                   <ImageIcon size={15} className="text-gray-400" /> Banner Image URL
                </label>
                <input 
                  type="text" 
                  value={formData.bannerUrl} 
                  onChange={e => setFormData({...formData, bannerUrl: e.target.value})} 
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500" 
                  placeholder="https://images..." 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Ancien Prix (€)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={formData.oldPrice} 
                    onChange={e => setFormData({...formData, oldPrice: parseFloat(e.target.value) || 0})} 
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white focus:ring-yellow-500" 
                    placeholder="0.00" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 text-yellow-400 font-bold">Prix Promo (€)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} 
                    className="w-full bg-gray-800 border border-yellow-500/50 rounded-xl p-2.5 text-white font-bold focus:ring-yellow-500" 
                    placeholder="0.00" 
                  />
                </div>
              </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description du Pack</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-white h-16 focus:ring-yellow-500 focus:border-yellow-500 text-sm" 
                placeholder="Décrivez les avantages et fonctionnalités de cette offre groupée..." 
              />
           </div>

           {/* --- SÉLECTION DES CONTENUS DU PACK --- */}
           {/* 1. Modules Métier de l'Application (Regroupés avec leurs tags) */}
           {(() => {
              const currentAppId = formData.appId || selectedAppId;
              const appBusinessModules = modules.filter(m => m.app_id === currentAppId && m.code !== 'mod-free' && !m.code?.startsWith('free-'));
              const freeTagsMod = modules.find(m => m.app_id === currentAppId && m.code === 'mod-free');
              const freeTagsList = freeTagsMod ? (freeTagsMod.allowed_tags || freeTagsMod.allowed_pages || []) : [];

              return (
                 <>
                    <div className="pt-4 border-t border-gray-700/60 space-y-4">
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                             <Box size={18} className="text-yellow-400" />
                             <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                                Modules Métier de l'Application
                             </h4>
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                             {appBusinessModules.filter(m => (m.allowed_tags || m.allowed_pages || []).some(t => (formData.allowedTags || []).includes(t))).length} / {appBusinessModules.length} modules sélectionnés
                          </div>
                       </div>

                       {/* Liste des modules métier avec leurs tags regroupés */}
                       <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                          {appBusinessModules.map(mod => {
                             const modTags = mod.allowed_tags || mod.allowed_pages || [];
                             const currentTags = formData.allowedTags || [];
                             const allModTagsSelected = modTags.length > 0 && modTags.every(t => currentTags.includes(t));
                             const someModTagsSelected = modTags.some(t => currentTags.includes(t));

                             return (
                                <div 
                                   key={mod.id}
                                   className={`p-3.5 rounded-xl border transition-all ${
                                      someModTagsSelected 
                                         ? 'bg-yellow-500/10 border-yellow-500/40 shadow-sm' 
                                         : 'bg-gray-800/40 border-gray-700/80 hover:border-gray-600'
                                   }`}
                                >
                                   {/* En-tête du module */}
                                   <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-gray-700/50">
                                      <div className="flex items-center gap-2.5">
                                         <div className="w-7 h-7 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center text-yellow-400 text-xs shrink-0">
                                            <Layers size={14} />
                                         </div>
                                          <div>
                                             <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-white block leading-tight">{mod.name}</span>
                                                {mod.is_premium ? (
                                                   <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 font-semibold">
                                                      Premium {mod.price > 0 ? `(${mod.price}€)` : ''}
                                                   </span>
                                                ) : (
                                                   <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-semibold">
                                                      Inclus
                                                   </span>
                                                )}
                                             </div>
                                             <span className="text-[10px] text-gray-400 font-mono">{mod.code}</span>
                                          </div>
                                      </div>

                                      <button
                                         type="button"
                                         onClick={() => toggleAllTagsForModule(mod)}
                                         className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all uppercase tracking-wider ${
                                            allModTagsSelected
                                               ? 'bg-yellow-500 text-black border-yellow-400 shadow-sm'
                                               : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-yellow-400/60 hover:text-yellow-300'
                                         }`}
                                      >
                                         {allModTagsSelected ? 'Tout décocher' : 'Tout cocher'}
                                      </button>
                                   </div>

                                   {/* Chips des tags de ce module */}
                                   <div className="flex flex-wrap gap-1.5 pt-1">
                                      {modTags.map((tag, idx) => {
                                         const isTagSelected = currentTags.includes(tag);
                                         return (
                                            <button
                                               type="button"
                                               key={idx}
                                               onClick={() => toggleTag(tag, mod.id)}
                                               className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                                                  isTagSelected
                                                     ? 'bg-yellow-400 text-black font-bold border-yellow-300 shadow-sm'
                                                     : 'bg-gray-900/80 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-200'
                                               }`}
                                            >
                                               <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                                                  isTagSelected ? 'bg-black text-yellow-400' : 'border border-gray-600'
                                               }`}>
                                                  {isTagSelected && <Check size={10} className="stroke-[3]" />}
                                               </div>
                                               <span>{tag}</span>
                                            </button>
                                         );
                                      })}
                                      {modTags.length === 0 && (
                                         <span className="text-xs text-gray-500 italic">Aucun tag de page spécifique défini pour ce module.</span>
                                      )}
                                   </div>
                                </div>
                             );
                          })}

                          {appBusinessModules.length === 0 && (
                             <div className="bg-gray-900/60 border border-dashed border-gray-700 rounded-lg p-4 text-center text-xs text-gray-400">
                                Aucun module métier trouvé pour cette application.
                             </div>
                          )}
                       </div>
                    </div>

                    {/* 2. Options Transversales & Add-ons (Free Tags) */}
                    <div className="bg-gradient-to-br from-violet-950/40 to-purple-950/20 border border-violet-500/30 rounded-xl p-4 space-y-3">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <Sparkles size={18} className="text-violet-400 animate-pulse" />
                             <div>
                                <h4 className="text-sm font-bold text-violet-200 uppercase tracking-wider">
                                   Options Libres & Extensions (Free Tags)
                                </h4>
                                <p className="text-xs text-violet-300/70">
                                   Capacités transversales sans page de menu (analytiques, portails web, API...)
                                </p>
                             </div>
                          </div>

                          {freeTagsList.length > 0 && (
                             <button
                                type="button"
                                onClick={() => {
                                   if (freeTagsMod) toggleAllTagsForModule(freeTagsMod);
                                }}
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all uppercase tracking-wider ${
                                   freeTagsList.every(t => (formData.allowedTags || []).includes(t))
                                      ? 'bg-violet-500 text-white border-violet-400 shadow-sm'
                                      : 'bg-violet-950/80 text-violet-300 border-violet-700/60 hover:border-violet-400'
                                }`}
                             >
                                {freeTagsList.every(t => (formData.allowedTags || []).includes(t)) ? 'Tout décocher' : 'Tout cocher'}
                             </button>
                          )}
                       </div>

                       {/* Grille des Free Tags individuels */}
                       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                          {freeTagsList.map((tag, idx) => {
                             const isSelected = (formData.allowedTags || []).includes(tag);
                             return (
                                <div 
                                   key={idx}
                                   onClick={() => {
                                      if (freeTagsMod) toggleTag(tag, freeTagsMod.id);
                                   }}
                                   className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 select-none ${
                                      isSelected 
                                         ? 'bg-violet-600/25 border-violet-400 shadow-sm shadow-violet-500/10' 
                                         : 'bg-gray-900/60 border-violet-900/40 hover:border-violet-600/60'
                                   }`}
                                >
                                   <div className="flex items-center gap-2 min-w-0">
                                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                                         isSelected ? 'bg-violet-500 border-violet-400 text-white' : 'bg-gray-900 border-gray-700 text-transparent'
                                      }`}>
                                         <Check size={10} className="stroke-[3]" />
                                      </div>
                                      <span className={`text-xs font-mono font-bold truncate ${isSelected ? 'text-violet-100' : 'text-gray-300'}`}>
                                         {tag}
                                      </span>
                                   </div>
                                   <span className="text-[9px] uppercase font-bold text-violet-400 bg-violet-950 px-1.5 py-0.5 rounded border border-violet-800/40 shrink-0 font-mono">
                                      free
                                   </span>
                                </div>
                             );
                          })}

                          {freeTagsList.length === 0 && (
                             <div className="col-span-full bg-gray-900/60 border border-dashed border-violet-700/40 rounded-lg p-3 text-center text-xs text-gray-400 flex flex-col items-center gap-1">
                                <Tag size={16} className="text-violet-400" />
                                <span>Aucun Free Tag synchronisé pour cette application.</span>
                                <span className="text-violet-400 text-[11px]">
                                   Astuce : Synchronisez le catalogue depuis l'onglet "Applications" pour importer automatiquement les options libres.
                                </span>
                             </div>
                          )}
                       </div>
                    </div>
                 </>
              );
           })()}

           <div className="pt-4 flex justify-end gap-3 border-t border-gray-800 mt-4">
              <button 
                type="button" 
                disabled={isSubmitting} 
                onClick={() => setIsModalOpen(false)} 
                className="px-5 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition disabled:opacity-50 text-sm font-medium"
              >
                 Annuler
              </button>
              <button 
                disabled={isSubmitting} 
                type="submit" 
                className="px-8 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black rounded-xl transition flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-yellow-500/20 text-sm"
              >
                 {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                 {isSubmitting ? 'Sauvegarde...' : (isEditMode ? 'Enregistrer le Pack' : 'Créer le Pack')}
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
