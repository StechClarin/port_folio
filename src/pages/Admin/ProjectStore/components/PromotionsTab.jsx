import React, { useState, useEffect, useCallback } from 'react';
import { Tag, Calendar, Percent, Plus, Clock, Save, Edit, Loader2, RefreshCw, Power, Trash2, Box, AppWindow, Check, Info, ChevronDown, ChevronUp, X, Search, FileText } from 'lucide-react';
import StoreModal from './StoreModal';
import ConfirmModal from './ConfirmModal';
import { supabase } from '../../../../lib/supabaseClient';
import toast from 'react-hot-toast';
import { confirmAction } from '../../../../utils/toastUtils';

const PromotionsTab = () => {
  const [promotions, setPromotions] = useState([]);
  const [apps, setApps] = useState([]);
  const [modules, setModules] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isEditPromoMode, setIsEditPromoMode] = useState(false);
  
  // Multiselect UI State
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [searchTarget, setSearchTarget] = useState('');
  
  // Refined Promo State
  const [promoType, setPromoType] = useState('coupon'); // 'coupon' or 'sale'
  const [targetType, setTargetType] = useState('app'); // 'app' or 'module'
  
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
  
  const [newPromo, setNewPromo] = useState({ 
    id: null, 
    name: '',
    code: '', 
    discount_type: 'percentage', 
    discount_value: 0, 
    valid_until: '', 
    usage_limit: '',
    app_ids: [],
    module_ids: []
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: promoData, error: promoError } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (promoError && promoError.code !== '42P01') throw promoError;

      const { data: appsData } = await supabase.from('apps').select('id, name').order('name');
      const { data: modulesData } = await supabase.from('app_modules').select('id, name, app_id').order('name');

      setPromotions(promoData || []);
      setApps(appsData || []);
      setModules(modulesData || []);
      
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Failed to load promotions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    
    if (!newPromo.name) {
      toast.error("Le nom de la promotion est requis.");
      return;
    }

    const isCoupon = promoType === 'coupon';
    if (isCoupon && !newPromo.code) {
      toast.error("Un code promo est requis.");
      return;
    }
    if (!isCoupon && newPromo.app_ids.length === 0 && newPromo.module_ids.length === 0) {
       toast.error("Veuillez sélectionner au moins un produit cible.");
       return;
    }
    if (!newPromo.discount_value || !newPromo.valid_until) {
      toast.error("Valeur et date de validité requises.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        name: newPromo.name,
        code: isCoupon ? newPromo.code.toUpperCase() : null,
        discount_type: newPromo.discount_type,
        discount_value: newPromo.discount_value,
        valid_until: newPromo.valid_until,
        usage_limit: isCoupon ? (newPromo.usage_limit || null) : null,
        app_ids: !isCoupon ? newPromo.app_ids : [],
        module_ids: !isCoupon ? newPromo.module_ids : [],
        is_active: true
      };

      if (isEditPromoMode && newPromo.id) {
        const { data, error } = await supabase
          .from('promotions')
          .update(payload)
          .eq('id', newPromo.id)
          .select()
          .single();

        if (error) throw error;
        setPromotions(promotions.map(p => p.id === data.id ? data : p));
        toast.success('Promotion mise à jour !');
      } else {
        const { data, error } = await supabase
          .from('promotions')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        setPromotions([data, ...promotions]);
        toast.success('Promotion créée !');
      }
      
      setIsPromoModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast.error(error.message || 'Échec de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewPromo({ id: null, name: '', code: '', discount_type: 'percentage', discount_value: 0, valid_until: '', usage_limit: '', app_ids: [], module_ids: [] });
    setPromoType('coupon');
    setTargetType('app');
    setIsEditPromoMode(false);
    setIsSelectionOpen(false);
  };

  const handleEditPromoClick = (promo) => {
    setIsEditPromoMode(true);
    setPromoType(promo.code ? 'coupon' : 'sale');
    setTargetType(promo.module_ids?.length > 0 ? 'module' : 'app');
    
    setNewPromo({
      id: promo.id,
      name: promo.name || '',
      code: promo.code || '',
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      valid_until: promo.valid_until ? promo.valid_until.split('T')[0] : '',
      usage_limit: promo.usage_limit || '',
      app_ids: promo.app_ids || [],
      module_ids: promo.module_ids || []
    });
    setIsPromoModalOpen(true);
  };

  const handleToggleTarget = (id) => {
      if (targetType === 'app') {
          setNewPromo(prev => ({
              ...prev,
              app_ids: prev.app_ids.includes(id) 
                ? prev.app_ids.filter(i => i !== id) 
                : [...prev.app_ids, id]
          }));
      } else {
          setNewPromo(prev => ({
              ...prev,
              module_ids: prev.module_ids.includes(id) 
                ? prev.module_ids.filter(i => i !== id) 
                : [...prev.module_ids, id]
          }));
      }
  };

  const handleTogglePromoStatus = async (promoId, currentStatus) => {
    openConfirm(
      currentStatus ? 'Désactiver la promotion ?' : 'Activer la promotion ?',
      `Voulez-vous vraiment ${currentStatus ? 'suspendre' : 'réactiver'} cette campagne ? Elle cessera d'être appliquée immédiatement.`,
      async () => {
        try {
          const { data, error } = await supabase
            .from('promotions')
            .update({ is_active: !currentStatus })
            .eq('id', promoId)
            .select()
            .single();
            
          if (error) throw error;
          setPromotions(promotions.map(p => p.id === promoId ? data : p));
          toast.success(currentStatus ? 'Promotion désactivée' : 'Promotion activée');
        } catch (err) {
          console.error(err);
          toast.error('Erreur lors du changement de statut');
        }
      },
      'warning'
    );
  };

  const handleDeletePromo = async (promoId, label) => {
    openConfirm(
      'Supprimer la promotion ?',
      `Êtes-vous sûr de vouloir supprimer définitivement la campagne "${label}" ? Cette action est irréversible.`,
      async () => {
        try {
          const { error } = await supabase.from('promotions').delete().eq('id', promoId);
          if (error) throw error;
          setPromotions(promotions.filter(p => p.id !== promoId));
          toast.success('Promotion supprimée');
        } catch (err) {
          console.error(err);
          toast.error('Échec de la suppression');
        }
      },
      'danger'
    );
  };

  const getTargetNames = (promo) => {
      if (promo.app_ids?.length > 0) {
          return promo.app_ids.map(id => apps.find(a => a.id === id)?.name).filter(Boolean).join(', ');
      }
      if (promo.module_ids?.length > 0) {
          return promo.module_ids.map(id => modules.find(m => m.id === id)?.name).filter(Boolean).join(', ');
      }
      return 'Aucune cible';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-pink-500">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-gray-400">Loading promotions...</p>
      </div>
    );
  }

  const currentSelectionIds = targetType === 'app' ? newPromo.app_ids : newPromo.module_ids;
  const filteredTargets = (targetType === 'app' ? apps : modules).filter(t => t.name.toLowerCase().includes(searchTarget.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-900/40 p-4 rounded-xl border border-gray-700/50">
        <div>
           <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Tag className="text-pink-400" size={24} /> 
              Marketing & Promotions
           </h2>
           <p className="text-sm text-gray-400 mt-1">Gérez vos codes promo ou créez des ventes flash groupées sur vos produits.</p>
        </div>

        <div className="flex gap-3">
          <button onClick={fetchData} className="text-gray-400 hover:text-white p-2 rounded-lg transition-colors bg-gray-900/50 hover:bg-gray-800">
            <RefreshCw size={20} />
          </button>
          <button onClick={() => { resetForm(); setIsPromoModalOpen(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-pink-500/25 transition-all font-medium whitespace-nowrap">
            <Plus size={18} /> Nouvelle Promotion
          </button>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {promotions.map((promo) => {
            const isCoupon = !!promo.code;
            const targetNames = getTargetNames(promo);
            
            return (
                <div 
                   key={promo.id}
                   className={`relative bg-gray-800/60 rounded-2xl p-6 border backdrop-blur-sm transition-all shadow-sm overflow-hidden group hover:-translate-y-0.5 ${
                     promo.is_active ? 'border-pink-500/30 hover:border-pink-500/50' : 'border-gray-700/50 grayscale-[40%]'
                   }`}
                >
                   <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-pink-500/10 rounded-full blur-xl pointer-events-none transition-opacity group-hover:bg-pink-500/20" />
    
                   <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="flex-1 min-w-0 pr-4">
                         <h3 className="text-lg font-black text-white truncate group-hover:text-pink-400 transition-colors uppercase tracking-tight">{promo.name || 'Promotion sans nom'}</h3>
                         <div className={`mt-2 px-2 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1.5 ${isCoupon ? 'bg-gray-900 border-gray-700 text-slate-400' : 'bg-pink-500/10 border-pink-500/20 text-pink-500'}`}>
                            {isCoupon ? <Tag size={12} /> : (promo.app_ids?.length > 0 ? <AppWindow size={12}/> : <Box size={12}/>)}
                            {isCoupon ? promo.code : 'VENTE DIRECTE'}
                         </div>
                      </div>
                       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleTogglePromoStatus(promo.id, promo.is_active)} className={`p-1.5 rounded-lg transition-colors ${promo.is_active ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}><Power size={18} /></button>
                          <button onClick={() => handleDeletePromo(promo.id, promo.name || promo.code)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={18} /></button>
                          <button onClick={() => handleEditPromoClick(promo)} className="p-1.5 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"><Edit size={18} /></button>
                       </div>
                   </div>
    
                   <div className="space-y-4 relative z-10">
                      <div className="flex items-end gap-1">
                         <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `${promo.discount_value}€`}
                         </span>
                         <span className="text-sm text-gray-500 mb-1 font-medium italic">off</span>
                      </div>
                      
                      <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-relaxed border-l-2 border-pink-500/30 pl-2">
                        Cibles : <span className="text-slate-300 font-bold">{targetNames}</span>
                      </p>
    
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-700/50">
                         <div>
                            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black mb-1">Expiration</p>
                            <p className={`text-xs font-bold ${new Date(promo.valid_until) < new Date() ? 'text-red-500' : 'text-gray-300'}`}>
                               {new Date(promo.valid_until).toLocaleDateString()}
                            </p>
                         </div>
                         <div>
                            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black mb-1">Impact</p>
                            <p className="text-xs font-bold text-gray-300">
                               {isCoupon ? `${promo.used_count || 0} utilisations` : `${promo.app_ids?.length || promo.module_ids?.length || 0} produits`}
                            </p>
                         </div>
                      </div>
                   </div>
    
                   <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between items-center relative z-10">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-black border uppercase tracking-widest ${
                         promo.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-800 text-gray-400 border-gray-700'
                      }`}>
                         {promo.is_active ? (new Date(promo.valid_until) < new Date() ? 'Expiré' : 'Actif') : 'Désactivé'}
                      </span>
                      
                      {promo.is_active && (
                         <span className="flex items-center gap-1 text-[9px] text-pink-400 font-black uppercase tracking-widest bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/10">
                            <Clock size={10} /> En cours
                         </span>
                      )}
                   </div>
                </div>
            );
         })}
      </div>

      {promotions.length === 0 && (
         <div className="text-center py-20 bg-gray-900/20 rounded-2xl border border-dashed border-gray-700 italic text-gray-500">
            Aucune promotion configurée.
         </div>
      )}

      {/* --- Promotion Modal --- */}
      <StoreModal 
        isOpen={isPromoModalOpen} 
        onClose={() => setIsPromoModalOpen(false)} 
        title={isEditPromoMode ? "Modifier la Promotion" : "Créer une Promotion"}
      >
        <form className="space-y-6" onSubmit={handleCreatePromo}>
           {/* Section 0: Promotion Name */}
           <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <FileText size={14} className="text-pink-500" /> Nom de la Campagne
              </label>
              <input 
                type="text" 
                required
                value={newPromo.name} 
                onChange={e => setNewPromo({...newPromo, name: e.target.value})} 
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white font-bold focus:ring-pink-500 focus:border-pink-500 transition-all text-sm" 
                placeholder="ex: Soldes de Printemps 2026" 
              />
           </div>

           {/* Section 1: Promo Type Toggle */}
           <div className="p-1 bg-gray-900 rounded-xl border border-gray-700 flex">
               <button type="button" onClick={() => setPromoType('coupon')} className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${promoType === 'coupon' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
                 <Tag size={16} /> Code Promo
               </button>
               <button type="button" onClick={() => setPromoType('sale')} className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${promoType === 'sale' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
                 <Clock size={16} /> Vente Directe
               </button>
           </div>

           {promoType === 'coupon' ? (
              <div className="animate-in fade-in duration-300 bg-gray-900/40 p-4 rounded-xl border border-white/5">
                <label className="block text-xs font-bold text-gray-500 mb-2 font-mono uppercase tracking-widest">Code Public</label>
                <input type="text" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white font-mono font-black focus:ring-pink-500 focus:border-pink-500 uppercase tracking-widest text-xl placeholder-gray-700" placeholder="BLACKFRIDAY" />
              </div>
           ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex gap-4">
                    <button type="button" onClick={() => { setTargetType('app'); setIsSelectionOpen(false); }} className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${targetType === 'app' ? 'bg-pink-500/20 border-pink-500 text-pink-400 shadow-inner' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>Applications</button>
                    <button type="button" onClick={() => { setTargetType('module'); setIsSelectionOpen(false); }} className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${targetType === 'module' ? 'bg-pink-500/20 border-pink-500 text-pink-400 shadow-inner' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>Modules Premium</button>
                </div>
                <div className="relative">
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                       {targetType === 'app' ? 'Sélection Apps' : 'Sélection Modules'} ({currentSelectionIds.length})
                   </label>
                   <div 
                      onClick={() => setIsSelectionOpen(!isSelectionOpen)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white cursor-pointer flex justify-between items-center group hover:border-pink-500/50 transition-colors"
                   >
                       <span className={currentSelectionIds.length > 0 ? "text-white font-bold" : "text-gray-500 italic"}>
                          {currentSelectionIds.length > 0 
                             ? `${currentSelectionIds.length} ${targetType === 'app' ? 'app(s)' : 'module(s)'} sélectionné(s)` 
                             : `Choisir les ${targetType === 'app' ? 'apps' : 'modules'}...`}
                       </span>
                       {isSelectionOpen ? <ChevronUp size={20} className="text-pink-500" /> : <ChevronDown size={20} className="text-gray-500 group-hover:text-pink-500" />}
                   </div>

                   {isSelectionOpen && (
                      <div className="absolute z-50 mt-2 w-full bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                         <div className="p-3 border-b border-gray-700 flex gap-2 bg-black/20">
                             <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input 
                                   type="text" 
                                   autoFocus
                                   placeholder="Rechercher spécifiquement..." 
                                   value={searchTarget}
                                   onChange={e => setSearchTarget(e.target.value)}
                                   className="w-full bg-gray-800 border border-gray-700 rounded-lg py-1.5 pl-9 pr-3 text-sm text-white focus:ring-0 focus:border-pink-500"
                                />
                             </div>
                             <button type="button" onClick={() => { if (targetType === 'app') setNewPromo(prev => ({...prev, app_ids: []})); else setNewPromo(prev => ({...prev, module_ids: []})); }} className="p-2 text-gray-400 hover:text-white transition-colors"><X size={18}/></button>
                         </div>
                         <div className="max-h-60 overflow-y-auto custom-scrollbar">
                            {filteredTargets.map(t => (
                               <div 
                                  key={t.id} 
                                  onClick={() => handleToggleTarget(t.id)}
                                  className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                               >
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${currentSelectionIds.includes(t.id) ? 'bg-pink-600 border-pink-600 scale-110' : 'border-gray-600 group-hover:border-gray-500'}`}>
                                     {currentSelectionIds.includes(t.id) && <Check size={14} className="text-white" />}
                                  </div>
                                  <span className={`text-sm ${currentSelectionIds.includes(t.id) ? 'text-white font-black' : 'text-gray-400'}`}>{t.name}</span>
                               </div>
                            ))}
                            {filteredTargets.length === 0 && <div className="p-8 text-center text-xs text-gray-600 italic">Aucun produit ne correspond.</div>}
                         </div>
                         <div className="p-2.5 bg-gray-800/80 border-t border-gray-700 flex justify-between">
                             <button type="button" onClick={() => { if (targetType === 'app') setNewPromo(prev => ({...prev, app_ids: apps.map(a => a.id)})); else setNewPromo(prev => ({...prev, module_ids: modules.map(m => m.id)})); }} className="text-[10px] text-pink-400 font-black hover:underline px-2">Tout sélectionner</button>
                             <button type="button" onClick={() => setIsSelectionOpen(false)} className="text-[10px] text-white font-black px-4 py-1.5 bg-pink-600 rounded-lg hover:bg-pink-500 transition-colors uppercase shadow-lg shadow-pink-500/20">Terminer</button>
                         </div>
                      </div>
                   )}
                </div>
                </div>
           )}
           
           <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
             <div>
               <label className="block text-sm font-medium text-gray-300 mb-1 font-mono tracking-widest text-[10px] uppercase font-black text-gray-500">Amplitude</label>
               <select value={newPromo.discount_type} onChange={e => setNewPromo({...newPromo, discount_type: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-pink-500 appearance-none font-bold text-sm">
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant Fixe (€)</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-300 mb-1 font-mono tracking-widest text-[10px] uppercase font-black text-gray-500">Valeur</label>
               <input type="number" min="0" step="any" value={newPromo.discount_value} onChange={e => setNewPromo({...newPromo, discount_value: parseFloat(e.target.value) || 0})} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-pink-500 text-lg font-black" placeholder="0" />
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-300 mb-1 font-mono tracking-widest text-[10px] uppercase font-black text-gray-500">Échéance</label>
               <input type="date" value={newPromo.valid_until} onChange={e => setNewPromo({...newPromo, valid_until: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-pink-500 font-bold" />
             </div>
             {promoType === 'coupon' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 font-mono tracking-widest text-[10px] uppercase font-black text-gray-500">Usages Max</label>
                  <input type="number" min="1" value={newPromo.usage_limit} onChange={e => setNewPromo({...newPromo, usage_limit: parseInt(e.target.value) || ''})} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-pink-500 font-bold" placeholder="Illimité" />
                </div>
             )}
           </div>

           <div className="bg-gradient-to-br from-gray-900 to-black border border-pink-500/10 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-3xl rounded-full" />
                <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500 shrink-0 border border-pink-500/20 shadow-lg">
                    <Info size={24} />
                </div>
                <div className="relative z-10">
                    <h5 className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-1">Résumé de Campagne</h5>
                    <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                        {promoType === 'coupon' 
                            ? `Code '${newPromo.code || '?'}' utilisable au checkout pour la campagne '${newPromo.name || '...'}'.`
                            : `Vente '${newPromo.name || '...'}' sur ${newPromo.app_ids.length + newPromo.module_ids.length} produits ciblé(s).`
                        }
                    </p>
                </div>
           </div>
           
           <div className="pt-6 flex justify-end gap-3 border-t border-gray-800 mt-6">
               <button type="button" disabled={isSubmitting} onClick={() => setIsPromoModalOpen(false)} className="px-6 py-3 bg-gray-800 text-gray-500 rounded-xl hover:bg-gray-700 transition font-black uppercase tracking-widest text-[10px] border border-transparent hover:border-gray-600">Fermer</button>
               <button disabled={isSubmitting} type="submit" className="px-10 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black rounded-xl hover:shadow-2xl hover:shadow-pink-500/40 transition flex items-center gap-2 disabled:opacity-50 uppercase tracking-widest text-xs">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isSubmitting ? 'Publication...' : (isEditPromoMode ? 'Confirmer' : 'Lancer la Campagne')}
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

export default PromotionsTab;
