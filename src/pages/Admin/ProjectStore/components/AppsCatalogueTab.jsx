import React, { useState, useEffect, useCallback } from 'react';
import { AppWindow, Settings, Search, Plus, Trash2, Box, Smartphone, Check, Calendar, ArrowRight, Loader2, RefreshCw, Power, Edit, Package, Shield, MoreVertical, Save, Star, Image as ImageIcon, Copy, Tag, Sparkles, DollarSign, Layers } from 'lucide-react';
import StoreModal from './StoreModal';
import { supabase } from '../../../../lib/supabaseClient';
import toast from 'react-hot-toast';
import { confirmAction } from '../../../../utils/toastUtils';

const AppsCatalogueTab = () => {
  const [apps, setApps] = useState([]);
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditModuleMode, setIsEditModuleMode] = useState(false);
  
  const [selectedApp, setSelectedApp] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [isModuleSettingsModalOpen, setIsModuleSettingsModalOpen] = useState(false);
  const [selectedModuleForEdit, setSelectedModuleForEdit] = useState(null);
  const [moduleSettings, setModuleSettings] = useState({
    is_premium: false,
    price: 0
  });
  
  // Menu State
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);

  // Form States
  const [newApp, setNewApp] = useState({ 
    name: '', 
    slug: '', 
    description: '', 
    basePrice: 0, 
    isMobile: false,
    isFeatured: false,
    isOfferOfTheYear: false,
    iconSvg: '',
    bannerUrl: '',
    builder: '',
    cloudApiUrl: ''
  });
  const [isSyncingManifest, setIsSyncingManifest] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: appsData, error: appsError } = await supabase
        .from('apps')
        .select('*')
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;
      
      const { data: modulesData, error: modulesError } = await supabase
        .from('app_modules')
        .select('*');

      if (modulesError) throw modulesError;

      setApps(appsData || []);
      setModules(modulesData || []);
      
      setSelectedApp(prev => prev || (appsData && appsData.length > 0 ? appsData[0] : null));
    } catch (error) {
      console.error('Error fetching catalogue data:', error);
      toast.error('Failed to load apps catalogue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateApp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditMode && selectedApp) {
        // Update App
        const { data, error } = await supabase
          .from('apps')
          .update({
            name: newApp.name,
            slug: newApp.slug,
            description: newApp.description,
            base_price: newApp.basePrice,
            is_mobile: newApp.isMobile,
            is_featured: newApp.isFeatured,
            is_offer_of_the_year: newApp.isOfferOfTheYear,
            icon_svg: newApp.iconSvg,
            banner_url: newApp.bannerUrl,
            builder: newApp.builder,
            cloud_api_url: newApp.cloudApiUrl
          })
          .eq('id', selectedApp.id)
          .select()
          .single();

        if (error) throw error;
        setApps(apps.map(a => a.id === data.id ? data : a));
        setSelectedApp(data);
        toast.success('Application updated successfully!');
        if (data && (data.cloud_api_url || data.cloudApiUrl)) {
          handleSyncFromManifest(data);
        }
      } else {
        // Create App
        const { data, error } = await supabase
          .from('apps')
          .insert([{
            name: newApp.name,
            slug: newApp.slug,
            description: newApp.description,
            base_price: newApp.basePrice,
            is_mobile: newApp.isMobile,
            is_featured: newApp.isFeatured,
            is_offer_of_the_year: newApp.isOfferOfTheYear,
            icon_svg: newApp.iconSvg,
            banner_url: newApp.bannerUrl,
            builder: newApp.builder,
            cloud_api_url: newApp.cloudApiUrl,
            is_active: false // Draft by default
          }])
          .select()
          .single();

        if (error) throw error;
        setApps([data, ...apps]);
        setSelectedApp(data);
        toast.success('Application created successfully!');
        if (data && (data.cloud_api_url || data.cloudApiUrl)) {
          handleSyncFromManifest(data);
        }
      }

      setIsAppModalOpen(false);
      setIsEditMode(false);
      setNewApp({ 
        name: '', slug: '', description: '', basePrice: 0, 
        isMobile: false, isFeatured: false, isOfferOfTheYear: false, iconSvg: '', bannerUrl: '', builder: '', cloudApiUrl: '' 
      });
    } catch (error) {
      console.error('Error saving app:', error);
      toast.error(error.message || 'Failed to save application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAppClick = () => {
    setIsEditMode(true);
    setNewApp({
      name: selectedApp.name,
      slug: selectedApp.slug,
      description: selectedApp.description || '',
      basePrice: selectedApp.base_price || 0,
      isMobile: selectedApp.is_mobile || false,
      isFeatured: selectedApp.is_featured || false,
      isOfferOfTheYear: selectedApp.is_offer_of_the_year || false,
      iconSvg: selectedApp.icon_svg || '',
      bannerUrl: selectedApp.banner_url || '',
      builder: selectedApp.builder || '',
      cloudApiUrl: selectedApp.cloud_api_url || ''
    });
    setIsAppMenuOpen(false);
    setIsAppModalOpen(true);
  };

  const handleToggleFeatured = async () => {
    if (!selectedApp) return;
    const newStatus = !selectedApp.is_featured;
    try {
      const { data, error } = await supabase
        .from('apps')
        .update({ is_featured: newStatus })
        .eq('id', selectedApp.id)
        .select()
        .single();
        
      if (error) throw error;
      
      setApps(apps.map(a => a.id === data.id ? data : a));
      setSelectedApp(data);
      toast.success(newStatus ? 'App Featured!' : 'App unfeatured');
    } catch (err) {
      console.error(err);
      toast.error('Failed to change featured status');
    }
  };

  const handleToggleOfferOfYear = async () => {
    if (!selectedApp) return;
    const newStatus = !selectedApp.is_offer_of_the_year;
    try {
      const { data, error } = await supabase
        .from('apps')
        .update({ is_offer_of_the_year: newStatus })
        .eq('id', selectedApp.id)
        .select()
        .single();
        
      if (error) throw error;
      
      setApps(apps.map(a => a.id === data.id ? data : a));
      setSelectedApp(data);
      toast.success(newStatus ? 'Set as Offer of the Year!' : 'Offer of the Year removed');
    } catch (err) {
      console.error(err);
      toast.error('Failed to change Offer of the Year status');
    }
  };

  const handleToggleAppStatus = async () => {
    if (!selectedApp) return;
    const newStatus = !selectedApp.is_active;
    confirmAction(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} '${selectedApp.name}'?`, async () => {
      try {
        const { data, error } = await supabase
          .from('apps')
          .update({ is_active: newStatus })
          .eq('id', selectedApp.id)
          .select()
          .single();
          
        if (error) throw error;
        
        setApps(apps.map(a => a.id === data.id ? data : a));
        setSelectedApp(data);
        setIsAppMenuOpen(false);
        toast.success(`Application ${newStatus ? 'activated' : 'deactivated'}!`);
      } catch (err) {
        console.error(err);
        toast.error('Failed to change application status');
      }
    });
  };

  const handleDeleteApp = async () => {
    if (!selectedApp) return;
    confirmAction(`Are you sure you want to permanently delete '${selectedApp.name}'? All related modules and releases will be lost cascade.`, async () => {
      try {
        const { error } = await supabase
          .from('apps')
          .delete()
          .eq('id', selectedApp.id);
          
        if (error) throw error;
        
        const newApps = apps.filter(a => a.id !== selectedApp.id);
        setApps(newApps);
        setSelectedApp(newApps.length > 0 ? newApps[0] : null);
        setIsAppMenuOpen(false);
        toast.success('Application deleted');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete application');
      }
    });
  };

  const handleSyncFromManifest = async (targetAppOverride = null) => {
    const appToSync = targetAppOverride || selectedApp;
    if (!appToSync) {
      toast.error("Veuillez d'abord sélectionner une application.");
      return;
    }

    const apiUrl = appToSync.cloud_api_url || appToSync.cloudApiUrl || import.meta.env.VITE_SCHOOL_MANAGE_API_URL;
    if (!apiUrl) {
      toast.error("Aucune URL d'API Cloud n'est configurée pour cette application.");
      return;
    }

    const apiKey = import.meta.env.VITE_HUB_API_KEY;
    let normalizedApiUrl = apiUrl.trim();
    normalizedApiUrl = normalizedApiUrl.replace(/\/api\/?$/, '');
    normalizedApiUrl = normalizedApiUrl.replace(/\/schoolmanage(?:\/test)?\/?$/, '');
    normalizedApiUrl = normalizedApiUrl.replace(/\/admin\/?$/, '');
    normalizedApiUrl = normalizedApiUrl.replace(/\/+$/, '');
    const toastId = toast.loading(`Synchronisation du catalogue depuis ${appToSync.name}...`);
    setIsSyncingManifest(true);

    try {
      let response;
      const targetUrl = `${normalizedApiUrl}/api/external/catalog-manifest/`;
      try {
        response = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'X-Hub-Api-Key': apiKey || 'ethernanos-hub-secret-2026'
          }
        });
      } catch (directErr) {
        if (import.meta.env.DEV) {
          console.warn('[Store] Appel direct bloqué (CORS/réseau), bascule automatique sur le proxy Vite...', directErr);
          response = await fetch('/vps-proxy/api/external/catalog-manifest/', {
            method: 'GET',
            headers: {
              'X-Hub-Api-Key': apiKey || 'ethernanos-hub-secret-2026'
            }
          });
        } else {
          throw directErr;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const manifest = await response.json();
      const manifestModules = manifest.modules || [];
      const freeTags = manifest.free_tags || [];

      let syncCount = 0;

      // 1. Synchronisation des modules métier de l'application
      for (const mod of manifestModules) {
        const existingMod = modules.find(m => m.app_id === appToSync.id && m.code === mod.code);
        const tags = mod.tags || [];

        const updateData = {
          name: mod.name || existingMod?.name,
          icon: mod.icon || existingMod?.icon,
          allowed_tags: tags,
          allowed_pages: tags,
        };

        if (existingMod) {
          let { error } = await supabase
            .from('app_modules')
            .update(updateData)
            .eq('id', existingMod.id);
          if (error && (error.code === '42703' || error.message?.includes('allowed_tags'))) {
            const { allowed_tags, ...fallbackData } = updateData;
            const res = await supabase.from('app_modules').update(fallbackData).eq('id', existingMod.id);
            error = res.error;
          }
          if (!error) syncCount++;
        } else {
          const insertData = {
            app_id: appToSync.id,
            name: mod.name,
            code: mod.code,
            icon: mod.icon || '',
            description: `Module synchronisé depuis le manifeste (${tags.length} tags)`,
            is_premium: false,
            price: 0,
            allowed_tags: tags,
            allowed_pages: tags
          };
          let { error } = await supabase.from('app_modules').insert([insertData]);
          if (error && (error.code === '42703' || error.message?.includes('allowed_tags'))) {
            const { allowed_tags, ...fallbackData } = insertData;
            const res = await supabase.from('app_modules').insert([fallbackData]);
            error = res.error;
          }
          if (!error) syncCount++;
        }
      }

      // 2. Synchronisation du module unique "FreeTags" (mod-free)
      if (freeTags && freeTags.length > 0) {
        const freeTagKeys = freeTags.map(ft => (typeof ft === 'string' ? ft : ft.tag)).filter(Boolean);
        const existingFreeMod = modules.find(m => m.app_id === appToSync.id && m.code === 'mod-free');
        
        const freeModData = {
          app_id: appToSync.id,
          name: 'FreeTags',
          code: 'mod-free',
          icon: 'pascal-icon-dashboard',
          description: `Options transversales et capacités système (${freeTagKeys.length} tags libres)`,
          is_premium: false,
          price: 0,
          allowed_tags: freeTagKeys,
          allowed_pages: freeTagKeys,
        };

        if (existingFreeMod) {
          let { error } = await supabase
            .from('app_modules')
            .update({
              name: freeModData.name,
              description: freeModData.description,
              allowed_tags: freeModData.allowed_tags,
              allowed_pages: freeModData.allowed_pages,
            })
            .eq('id', existingFreeMod.id);
          if (error && (error.code === '42703' || error.message?.includes('allowed_tags'))) {
            const { allowed_tags, ...fallback } = freeModData;
            await supabase.from('app_modules').update(fallback).eq('id', existingFreeMod.id);
          }
        } else {
          let { error } = await supabase.from('app_modules').insert([freeModData]);
          if (error && (error.code === '42703' || error.message?.includes('allowed_tags'))) {
            const { allowed_tags, ...fallback } = freeModData;
            await supabase.from('app_modules').insert([fallback]);
          }
        }
        // Nettoyer les anciens enregistrements séparés free-* s'ils existent
        await supabase.from('app_modules').delete().eq('app_id', appToSync.id).like('code', 'free-%');
        syncCount++;
      }

      toast.success(`${syncCount} modules & FreeTags synchronisés avec succès depuis l'application !`, { id: toastId });
      await fetchData();
    } catch (err) {
      console.error('Error syncing catalog manifest:', err);
      toast.error(`Échec de la synchronisation : ${err.message}`, { id: toastId });
    } finally {
      setIsSyncingManifest(false);
    }
  };



  const handleOpenModuleSettings = (mod) => {
    setSelectedModuleForEdit(mod);
    setModuleSettings({
      is_premium: Boolean(mod.is_premium),
      price: mod.price || 0
    });
    setIsModuleSettingsModalOpen(true);
  };

  const handleSaveModuleSettings = async (e) => {
    e.preventDefault();
    if (!selectedModuleForEdit) return;
    setIsSubmitting(true);
    const toastId = toast.loading('Mise à jour des paramètres du module...');

    try {
      const isPremium = Boolean(moduleSettings.is_premium);
      const price = isPremium ? Math.max(0, parseFloat(moduleSettings.price) || 0) : 0;

      const { data, error } = await supabase
        .from('app_modules')
        .update({
          is_premium: isPremium,
          price: price
        })
        .eq('id', selectedModuleForEdit.id)
        .select()
        .single();

      if (error) throw error;

      setModules(prev => prev.map(m => m.id === selectedModuleForEdit.id ? { ...m, is_premium: isPremium, price: price } : m));
      toast.success(`Module "${selectedModuleForEdit.name}" configuré avec succès !`, { id: toastId });
      setIsModuleSettingsModalOpen(false);
      setSelectedModuleForEdit(null);
    } catch (err) {
      console.error('Error saving module settings:', err);
      toast.error(`Erreur : ${err.message || 'Impossible de sauvegarder le module'}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId, moduleName) => {
    confirmAction(`Are you sure you want to delete module '${moduleName}'? Licenses for this module will be affected.`, async () => {
      try {
        const { error } = await supabase
          .from('app_modules')
          .delete()
          .eq('id', moduleId);
          
        if (error) throw error;
        
        setModules(modules.filter(m => m.id !== moduleId));
        toast.success('Module deleted');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete module');
      }
    });
  };

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const appModules = modules.filter(m => m.app_id === selectedApp?.id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-violet-400">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-gray-400">Loading catalogue data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left Column: Apps List */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4 border-r border-gray-700/50 pr-0 lg:pr-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
             <Package className="text-violet-400" size={24} /> 
             Applications
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchData}
              className="text-gray-400 hover:text-white p-2 rounded-lg transition-colors bg-gray-900/50 hover:bg-gray-800"
              title="Refresh Data"
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={() => {
                setIsEditMode(false);
                setNewApp({ name: '', slug: '', description: '', basePrice: 0, isMobile: false, isFeatured: false, isOfferOfTheYear: false, iconSvg: '', bannerUrl: '', builder: '', cloudApiUrl: '' });
                setIsAppModalOpen(true);
              }}
              className="bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-lg transition-colors shadow-lg shadow-violet-500/20"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Search Apps */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search applications..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
          />
        </div>

        {/* Apps List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              onClick={() => setSelectedApp(app)}
              className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 flex items-center justify-between ${
                selectedApp?.id === app.id
                  ? 'bg-violet-900/40 border-violet-500 shadow-lg shadow-violet-500/10'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-500 hover:bg-gray-750'
              }`}
            >
              <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold relative
                    ${selectedApp?.id === app.id ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                    {app.icon_svg && typeof app.icon_svg === 'string' && app.icon_svg.trim().startsWith('<svg') ? (
                       <div dangerouslySetInnerHTML={{ __html: app.icon_svg }} className="w-8 h-8 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full" />
                    ) : (
                       app.name?.charAt(0) || 'A'
                    )}
                    {(app.is_featured || app.is_offer_of_the_year) && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-lg">
                        <Star size={10} fill="currentColor" />
                      </div>
                    )}
                 </div>
                 <div>
                    <h3 className="font-semibold text-gray-100 flex items-center gap-2">
                       {app.name}
                       {app.is_featured && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold uppercase">À la une</span>}
                       {app.is_offer_of_the_year && <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">Offre de l'année</span>}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mt-1">{app.slug}</p>
                 </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                      ${app.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-600/30 text-gray-400'}`}>
                      {app.is_active ? 'Active' : 'Draft'}
                  </span>
                  {app.is_mobile && (
                    <span className="text-[10px] text-violet-400 bg-violet-900/30 px-1.5 py-0.5 rounded border border-violet-500/20">Mobile App</span>
                  )}
              </div>
            </div>
          ))}
          {filteredApps.length === 0 && (
             <div className="text-center py-8 text-gray-500">
                No apps found matching "{searchQuery}"
             </div>
          )}
        </div>
      </div>

      {/* Right Column: Modules for Selected App */}
      <div className="w-full lg:w-2/3 flex flex-col h-full">
        {selectedApp ? (
          <>
            {/* App Header Detail */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 mb-6 flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">{selectedApp.name}</h2>
                  {selectedApp.is_featured && (
                    <span className="flex items-center gap-1 bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
                      <Star size={10} fill="currentColor" /> À la une
                    </span>
                  )}
                  {selectedApp.is_offer_of_the_year && (
                    <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider ml-2">
                      <Tag size={10} /> Offre de l'année
                    </span>
                  )}
                </div>
                <p className="text-gray-400 max-w-2xl">{selectedApp.description}</p>
                <div className="flex gap-4 mt-4">
                   <div className="bg-gray-900 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-gray-700 group relative">
                      <Shield size={16} className="text-fuchsia-400" />
                      <span className="text-sm font-mono text-gray-300" title={selectedApp.id}>
                         ID: {selectedApp.id.substring(0, 8)}...
                      </span>
                      <button 
                         onClick={() => {
                            navigator.clipboard.writeText(selectedApp.id);
                            toast.success('ID copié !');
                         }}
                         className="text-gray-500 hover:text-white transition-colors p-1"
                         title="Copier l'ID complet"
                      >
                         <Copy size={14} />
                      </button>
                   </div>
                   <div className="bg-gray-900 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-gray-700">
                      <Settings size={16} className="text-blue-400" />
                      <span className="text-sm text-gray-300">{appModules.length} Modules configured</span>
                   </div>
                </div>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setIsAppMenuOpen(!isAppMenuOpen)}
                  onBlur={() => setTimeout(() => setIsAppMenuOpen(false), 200)}
                  className={`text-gray-400 p-2 rounded-lg transition-colors ${isAppMenuOpen ? 'bg-gray-700 text-white' : 'hover:text-white hover:bg-gray-700'}`}
                >
                  <MoreVertical size={20} />
                </button>

                {/* Dropdown Menu */}
                {isAppMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl shadow-black/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                     <div className="py-1">
                        <button 
                           onClick={handleEditAppClick}
                           className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2 transition-colors"
                        >
                           <Edit size={16} /> Edit Application
                        </button>
                        <button 
                           onClick={handleToggleAppStatus}
                           className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2 transition-colors"
                        >
                           <Power size={16} /> {selectedApp.is_active ? 'Deactivate (Draft)' : 'Activate App'}
                        </button>
                        <button 
                           onClick={handleToggleFeatured}
                           className="w-full text-left px-4 py-2.5 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center gap-2"
                        >
                           <Star size={16} fill={selectedApp.is_featured ? 'currentColor' : 'none'} /> 
                           {selectedApp.is_featured ? 'Enlever de "À la une"' : 'Mettre "À la une"'}
                        </button>
                        <button 
                           onClick={handleToggleOfferOfYear}
                           className="w-full text-left px-4 py-2.5 text-sm text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center gap-2"
                        >
                           <Tag size={16} fill={selectedApp.is_offer_of_the_year ? 'currentColor' : 'none'} /> 
                           {selectedApp.is_offer_of_the_year ? 'Enlever de "Offre de l\'année"' : 'Mettre "Offre de l\'année"'}
                        </button>
                        <div className="h-px bg-gray-700 my-1"></div>
                        <button 
                           onClick={handleDeleteApp}
                           className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2 transition-colors"
                        >
                           <Trash2 size={16} /> Delete Application
                        </button>
                     </div>
                  </div>
                )}
              </div>
            </div>

             {/* Modules Section Header */}
             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                 <div>
                   <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                     <Layers size={20} className="text-violet-400" />
                     Modules & Capacités Synchronisés
                   </h3>
                   <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                     <span className="flex items-center gap-1.5">
                       <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                       <strong className="text-emerald-400">{appModules.filter(m => !m.is_premium && m.code !== 'mod-free').length}</strong> inclus de base
                     </span>
                     <span>•</span>
                     <span className="flex items-center gap-1.5">
                       <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                       <strong className="text-amber-400">{appModules.filter(m => m.is_premium).length}</strong> options premium
                     </span>
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                   <button 
                     onClick={() => handleSyncFromManifest()}
                     disabled={isSyncingManifest}
                     className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl border border-violet-500/30 transition-all text-sm font-semibold shadow-lg shadow-violet-500/20 disabled:opacity-50 cursor-pointer"
                     title="Synchroniser la liste des modules et tags directement depuis l'application"
                   >
                     <RefreshCw size={15} className={isSyncingManifest ? 'animate-spin' : ''} />
                     {isSyncingManifest ? 'Synchronisation...' : "Synchroniser depuis l'App"}
                   </button>
                 </div>
             </div>

             {/* Modules Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max overflow-y-auto pb-4 custom-scrollbar">
                {appModules.map((mod) => {
                   const isPremium = Boolean(mod.is_premium);
                   const tags = mod.allowed_tags || mod.allowed_pages || [];

                   return (
                     <div
                       key={mod.id}
                       className={`p-5 rounded-2xl border transition-all duration-200 group relative flex flex-col justify-between ${
                          mod.code === 'mod-free'
                            ? 'bg-gradient-to-br from-gray-800/90 via-gray-800/80 to-purple-950/20 border-purple-500/30 hover:border-purple-500/50 shadow-sm'
                            : isPremium 
                              ? 'bg-gradient-to-br from-gray-800/90 via-gray-800/80 to-amber-950/20 border-amber-500/30 hover:border-amber-500/50 shadow-sm' 
                           : 'bg-gradient-to-br from-gray-800/90 via-gray-800/80 to-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40'
                       }`}
                     >
                       {/* Header: Icon, Name, Code & Badge Inclus vs Premium */}
                       <div>
                         <div className="flex items-start justify-between gap-3 mb-3">
                           <div className="flex items-center gap-3 min-w-0">
                             <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                               mod.code === 'mod-free'
                                 ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                                 : isPremium 
                                   ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                                   : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                             }`}>
                               {mod.code === 'mod-free' ? (
                                 <Sparkles size={22} className="text-purple-400" />
                               ) : mod.icon && typeof mod.icon === 'string' && mod.icon.trim().startsWith('<svg') ? (
                                 <div dangerouslySetInnerHTML={{ __html: mod.icon }} className="w-6 h-6 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full" />
                               ) : (
                                 <Box size={22} className={isPremium ? 'text-amber-400' : 'text-emerald-400'} />
                               )}
                             </div>
                             <div className="min-w-0">
                               <h4 className="text-white font-bold truncate text-base leading-tight">
                                 {mod.name}
                               </h4>
                               <div className="flex items-center gap-2 mt-1">
                                 <span className="font-mono text-[10px] text-violet-300 bg-violet-900/40 border border-violet-700/40 px-1.5 py-0.5 rounded leading-none">
                                   {mod.code}
                                 </span>
                                 {mod.code === 'mod-free' && (
                                   <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30 font-medium">
                                     FreeTags
                                   </span>
                                 )}
                               </div>
                             </div>
                           </div>

                           {/* Status Badge: Inclus vs Premium */}
                           <div className="shrink-0 flex flex-col items-end">
                             {mod.code === 'mod-free' ? (
                                <>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-sm">
                                    <Sparkles size={11} className="text-purple-400" />
                                    Capacités libres
                                  </span>
                                  <span className="text-[10px] text-purple-400/80 font-mono mt-1">
                                    Pool transversal (hors base)
                                  </span>
                                </>
                              ) : isPremium ? (
                               <>
                                 <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm">
                                   <Sparkles size={11} className="text-amber-400" />
                                   Option Premium
                                 </span>
                                 <span className="text-xs font-mono font-bold text-amber-300 mt-1">
                                   {mod.price > 0 ? `+${mod.price} €/an` : 'Prix non fixé'}
                                 </span>
                               </>
                             ) : (
                               <>
                                 <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                   <Check size={11} className="text-emerald-400 stroke-[3]" />
                                   Inclus de base
                                 </span>
                                 <span className="text-[10px] text-emerald-500/80 font-mono mt-1">
                                   Offert avec la licence
                                 </span>
                               </>
                             )}
                           </div>
                         </div>

                         <p className="text-xs text-gray-400 line-clamp-2 mt-2">
                           {mod.description || 'Module synchronisé depuis le catalogue applicatif.'}
                         </p>

                         {/* Tags Pills */}
                         {tags.length > 0 && (
                           <div className="mt-3.5 pt-3 border-t border-gray-700/40">
                             <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5 font-medium">
                               <span>Tags de navigation associés :</span>
                               <span className="font-mono bg-gray-900 px-1.5 py-0.5 rounded text-gray-300 border border-gray-700">{tags.length}</span>
                             </div>
                             <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto custom-scrollbar">
                               {tags.map((tag, idx) => (
                                 <span key={idx} className="text-[10px] bg-gray-900/80 text-gray-300 px-2 py-0.5 rounded-md border border-gray-700 font-mono">
                                   {tag}
                                 </span>
                               ))}
                             </div>
                           </div>
                         )}
                       </div>

                       {/* Card Bottom Actions: Paramètres + Supprimer */}
                       <div className="mt-4 pt-3 border-t border-gray-700/60 flex items-center justify-between">
                         <span className={`text-[11px] font-mono font-medium ${
                            mod.code === 'mod-free' 
                              ? 'text-purple-400/80' 
                              : isPremium 
                                ? 'text-amber-400/80' 
                                : 'text-emerald-400/80'
                          }`}>
                            {mod.code === 'mod-free' ? ' Pool de capacités' : isPremium ? '⚡ Option payante' : '✓ Licence standard'}
                          </span>
                         <div className="flex items-center gap-2">
                           {mod.code !== 'mod-free' && (
                            <button
                             onClick={() => handleOpenModuleSettings(mod)}
                             className="px-2.5 py-1.5 text-xs rounded-lg bg-gray-700/80 hover:bg-violet-600 text-gray-200 hover:text-white border border-gray-600 hover:border-violet-500/60 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                             title="Configurer ce module (Inclus / Premium & Prix)"
                           >
                             <Settings size={13} className="text-violet-300" />
                             <span>Paramètres</span>
                           </button>
                            )}
                           <button
                             onClick={() => handleDeleteModule(mod.id, mod.name)}
                             className="p-1.5 text-xs rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                             title="Supprimer ce module"
                           >
                             <Trash2 size={13} />
                           </button>
                         </div>
                       </div>
                     </div>
                   );
                })}
             </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
             <Package size={64} className="mb-4 opacity-50" />
             <p className="text-xl">Select an application to view its modules</p>
          </div>
        )}
      </div>

      {/* --- Modals --- */}
      
      {/* Create / Edit Application Modal */}
      <StoreModal 
        isOpen={isAppModalOpen} 
        onClose={() => setIsAppModalOpen(false)} 
        title={isEditMode ? "Edit Application" : "Create New Application"}
      >
        <form className="space-y-4" onSubmit={handleCreateApp}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Application Name</label>
                  <input type="text" value={newApp.name} onChange={e => setNewApp({...newApp, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-violet-500 focus:border-violet-500" placeholder="e.g. Yekola" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Technical Slug</label>
                  <input type="text" disabled={isEditMode} value={newApp.slug} onChange={e => setNewApp({...newApp, slug: e.target.value})} className={`w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white font-mono text-sm focus:ring-violet-500 focus:border-violet-500 ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="e.g. school-manage" />
                  {!isEditMode && <p className="mt-1 text-xs text-gray-500">Must be unique, lowercase, without spaces.</p>}
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Developer (Builder)</label>
                  <input type="text" value={newApp.builder} onChange={e => setNewApp({...newApp, builder: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-violet-500 focus:border-violet-500" placeholder="e.g. StechClarin" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Cloud API URL (Serveur Maître)</label>
                  <input type="url" value={newApp.cloudApiUrl} onChange={e => setNewApp({...newApp, cloudApiUrl: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-violet-500 focus:border-violet-500 font-mono text-sm" placeholder="http://72.60.2.96:8080 ou https://eteyelo.online" />
               </div>
            </div>
           <div>
             <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
             <textarea value={newApp.description} onChange={e => setNewApp({...newApp, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-violet-500 focus:border-violet-500 h-24" placeholder="Brief description of the application..." />
           </div>
           <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Base Price ($) / Year</label>
                <input type="number" min="0" step="0.01" value={newApp.basePrice} onChange={e => setNewApp({...newApp, basePrice: parseFloat(e.target.value) || 0})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-violet-500 focus:border-violet-500" placeholder="0.00" />
              </div>
              <div className="flex items-center pt-6">
                <input type="checkbox" id="isFeatured" checked={newApp.isFeatured} onChange={e => setNewApp({...newApp, isFeatured: e.target.checked})} className="w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500 bg-gray-800" />
                <label htmlFor="isFeatured" className="ml-2 text-sm text-amber-400 font-semibold cursor-pointer">À la une</label>
              </div>
              <div className="flex items-center pt-6">
                <input type="checkbox" id="isOfferOfTheYear" checked={newApp.isOfferOfTheYear} onChange={e => setNewApp({...newApp, isOfferOfTheYear: e.target.checked})} className="w-4 h-4 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 bg-gray-800" />
                <label htmlFor="isOfferOfTheYear" className="ml-2 text-sm text-emerald-400 font-semibold cursor-pointer">Offre de l'année</label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
               <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                     <Box size={14} className="text-violet-400" /> Logo (SVG Code)
                  </label>
                  <textarea 
                    value={newApp.iconSvg} 
                    onChange={e => setNewApp({...newApp, iconSvg: e.target.value})} 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white font-mono text-xs focus:ring-violet-500 focus:border-violet-500 h-20" 
                    placeholder='<svg>...</svg>' 
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                     <ImageIcon size={14} className="text-violet-400" /> Banner Image URL
                  </label>
                  <input 
                    type="text" 
                    value={newApp.bannerUrl} 
                    onChange={e => setNewApp({...newApp, bannerUrl: e.target.value})} 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-violet-500 focus:border-violet-500" 
                    placeholder="https://images..." 
                  />
                  <div className="mt-2 h-12 bg-gray-900 rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden">
                     {newApp.bannerUrl ? (
                        <img src={newApp.bannerUrl} alt="Preview" className="h-full w-full object-cover" />
                     ) : (
                        <span className="text-[10px] text-gray-500">Banner Preview</span>
                     )}
                  </div>
               </div>
            </div>

            <div className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-xl flex items-start gap-3 mt-4">
               <input type="checkbox" id="isMobile" checked={newApp.isMobile} onChange={e => setNewApp({...newApp, isMobile: e.target.checked})} className="mt-1 w-4 h-4 rounded border-gray-600 text-violet-500 focus:ring-violet-500 bg-gray-800" />
               <div>
                  <label htmlFor="isMobile" className="text-violet-400 font-semibold cursor-pointer block">Mobile Application</label>
                  <p className="text-xs text-gray-400 mt-1">Check this if the application is intended for mobile devices.</p>
               </div>
            </div>
           </div>
           
           <div className="pt-4 flex justify-end gap-3 border-t border-gray-800 mt-6">
              <button type="button" onClick={() => setIsAppModalOpen(false)} className="px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">Cancel</button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                 {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                 {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Application' : 'Create Application')}
              </button>
           </div>
        </form>
      </StoreModal>

      {/* Module Settings Modal (Inclus vs Premium + Prix) */}
      <StoreModal
        isOpen={isModuleSettingsModalOpen}
        onClose={() => setIsModuleSettingsModalOpen(false)}
        title={`Paramètres du Module : ${selectedModuleForEdit?.name || ''}`}
        maxWidth="max-w-xl"
      >
        {selectedModuleForEdit && (
          <form onSubmit={handleSaveModuleSettings} className="space-y-5">
            {/* Context Box */}
            <div className="p-3.5 bg-gray-800/80 rounded-xl border border-gray-700 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Code Technique</span>
                <span className="text-sm font-mono text-violet-400 font-bold">{selectedModuleForEdit.code}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block font-medium">Tags autorisés</span>
                <span className="text-sm font-mono text-gray-200">
                  {(selectedModuleForEdit.allowed_tags || selectedModuleForEdit.allowed_pages || []).length} tags
                </span>
              </div>
            </div>

            {/* Type de Module : Inclus vs Premium */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Type de distribution du module
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Inclus de base */}
                <div
                  onClick={() => setModuleSettings(prev => ({ ...prev, is_premium: false }))}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    !moduleSettings.is_premium
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      !moduleSettings.is_premium ? 'border-emerald-400 bg-emerald-500 text-black' : 'border-gray-600'
                    }`}>
                      {!moduleSettings.is_premium && <Check size={10} className="stroke-[3]" />}
                    </div>
                    <span className="text-sm font-bold text-white">Inclus de base</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Fourni automatiquement avec la licence standard de l'application sans surcoût.
                  </p>
                </div>

                {/* Option 2: Option Premium */}
                <div
                  onClick={() => setModuleSettings(prev => ({ ...prev, is_premium: true }))}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    moduleSettings.is_premium
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      moduleSettings.is_premium ? 'border-amber-400 bg-amber-500 text-black' : 'border-gray-600'
                    }`}>
                      {moduleSettings.is_premium && <Check size={10} className="stroke-[3]" />}
                    </div>
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-400" />
                      Option Premium
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Module optionnel payant. Non inclus dans l'offre standard.
                  </p>
                </div>
              </div>
            </div>

            {/* Prix du Module (si Premium) */}
            {moduleSettings.is_premium && (
              <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 animate-in fade-in-50 duration-200">
                <label className="block text-sm font-semibold text-amber-300 mb-1.5 flex items-center gap-1.5">
                  <DollarSign size={15} />
                  Prix additionnel du module (€ / an)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={moduleSettings.price}
                  onChange={e => setModuleSettings({ ...moduleSettings, price: e.target.value })}
                  className="w-full bg-gray-800 border border-amber-500/50 rounded-lg p-2.5 text-white font-mono text-base font-bold focus:ring-amber-500 focus:border-amber-500"
                  placeholder="ex: 49.00"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Ce tarif sera appliqué pour l'activation individuelle de ce module ou pris en compte dans les offres.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsModuleSettingsModalOpen(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition flex items-center gap-2 disabled:opacity-50 font-semibold cursor-pointer"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les paramètres'}
              </button>
            </div>
          </form>
        )}
      </StoreModal>



    </div>
  );
};

export default AppsCatalogueTab;
