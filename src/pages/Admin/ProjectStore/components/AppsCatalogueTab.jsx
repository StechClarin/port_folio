import React, { useState, useEffect, useCallback } from 'react';
import { AppWindow, Settings, Search, Plus, Trash2, Box, Smartphone, Check, Calendar, ArrowRight, Loader2, RefreshCw, Power, Edit, Package, Shield, MoreVertical, Save, Star, Image as ImageIcon, Copy } from 'lucide-react';
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
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  
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
    iconSvg: '',
    bannerUrl: '',
    builder: ''
  });
  const [newModule, setNewModule] = useState({ id: null, name: '', code: '', icon: '', description: '', isPremium: false, price: 0 });

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
            icon_svg: newApp.iconSvg,
            banner_url: newApp.bannerUrl,
            builder: newApp.builder
          })
          .eq('id', selectedApp.id)
          .select()
          .single();

        if (error) throw error;
        setApps(apps.map(a => a.id === data.id ? data : a));
        setSelectedApp(data);
        toast.success('Application updated successfully!');
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
            icon_svg: newApp.iconSvg,
            banner_url: newApp.bannerUrl,
            builder: newApp.builder,
            is_active: false // Draft by default
          }])
          .select()
          .single();

        if (error) throw error;
        setApps([data, ...apps]);
        setSelectedApp(data);
        toast.success('Application created successfully!');
      }

      setIsAppModalOpen(false);
      setIsEditMode(false);
      setNewApp({ 
        name: '', slug: '', description: '', basePrice: 0, 
        isMobile: false, isFeatured: false, iconSvg: '', bannerUrl: '', builder: '' 
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
      iconSvg: selectedApp.icon_svg || '',
      bannerUrl: selectedApp.banner_url || '',
      builder: selectedApp.builder || ''
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
      toast.success(newStatus ? 'App featured!' : 'App unfeatured');
    } catch (err) {
      console.error(err);
      toast.error('Failed to change featured status');
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

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    
    setIsSubmitting(true);
    try {
      if (isEditModuleMode && newModule.id) {
        const { data, error } = await supabase
          .from('app_modules')
          .update({
            name: newModule.name,
            code: newModule.code,
            icon: newModule.icon,
            description: newModule.description,
            is_premium: newModule.isPremium,
            price: newModule.isPremium ? newModule.price : 0
          })
          .eq('id', newModule.id)
          .select()
          .single();

        if (error) throw error;

        setModules(modules.map(m => m.id === data.id ? data : m));
        setIsModuleModalOpen(false);
        setIsEditModuleMode(false);
        setNewModule({ id: null, name: '', code: '', icon: '', description: '', isPremium: false, price: 0 });
        toast.success('Module updated successfully!');
      } else {
        const { data, error } = await supabase
          .from('app_modules')
          .insert([{
            app_id: selectedApp.id,
            name: newModule.name,
            code: newModule.code,
            icon: newModule.icon,
            description: newModule.description,
            is_premium: newModule.isPremium,
            price: newModule.isPremium ? newModule.price : 0
          }])
          .select()
          .single();

        if (error) throw error;

        setModules([...modules, data]);
        setIsModuleModalOpen(false);
        setNewModule({ id: null, name: '', code: '', icon: '', description: '', isPremium: false, price: 0 });
        toast.success('Module added successfully!');
      }
    } catch (error) {
      console.error('Error creating/updating module:', error);
      toast.error(error.message || 'Failed to save module');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditModuleClick = (mod) => {
    setIsEditModuleMode(true);
    setNewModule({
      id: mod.id,
      name: mod.name,
      code: mod.code,
      icon: mod.icon || '',
      description: mod.description,
      isPremium: mod.is_premium,
      price: mod.price || 0
    });
    setIsModuleModalOpen(true);
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
                setNewApp({ name: '', slug: '', description: '', basePrice: 0, isMobile: false });
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
                    {app.icon_svg ? (
                       <div dangerouslySetInnerHTML={{ __html: app.icon_svg }} className="w-8 h-8" />
                    ) : (
                       app.name.charAt(0)
                    )}
                    {app.is_featured && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-lg">
                        <Star size={10} fill="currentColor" />
                      </div>
                    )}
                 </div>
                 <div>
                    <h3 className="font-semibold text-gray-100 flex items-center gap-2">
                       {app.name}
                       {app.is_featured && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold uppercase">Featured</span>}
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
                      <Star size={10} fill="currentColor" /> Featured
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
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl shadow-black/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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
                           {selectedApp.is_featured ? 'Unfeature App' : 'Feature Application'}
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
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Configured Modules</h3>
                <button 
                  onClick={() => {
                    setIsEditModuleMode(false);
                    setNewModule({ id: null, name: '', code: '', icon: '', description: '', isPremium: false, price: 0 });
                    setIsModuleModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition-colors text-sm"
                >
                  <Plus size={16} /> Add Module
                </button>
             </div>

             {/* Modules Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max overflow-y-auto pb-4 custom-scrollbar">
                {appModules.map((mod) => (
                   <div
                     key={mod.id}
                     className="bg-gray-800/80 border border-gray-700 p-5 rounded-xl hover:border-gray-500 transition-colors group relative overflow-hidden"
                   >
                     {/* Premium Ribbon */}
                     {mod.is_premium && (
                        <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 pointer-events-none">
                           <div className="absolute transform rotate-45 bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 text-[10px] font-bold py-1 right-[-35px] top-[15px] w-[130px] text-center shadow-lg uppercase tracking-wider">
                              Premium
                           </div>
                        </div>
                     )}

                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center text-xl shrink-0">
                           {mod.icon ? (
                              <div dangerouslySetInnerHTML={{ __html: mod.icon }} className="w-6 h-6" />
                           ) : (
                              <Box size={20} className="text-gray-600" />
                           )}
                        </div>
                        <div className="min-w-0 pr-8">
                           <h4 className="text-white font-semibold truncate">{mod.name}</h4>
                           <p className="font-mono text-[10px] text-violet-400 bg-violet-900/30 inline-block px-1.5 py-0.5 rounded leading-none">
                              {mod.code}
                           </p>
                        </div>
                      </div>
                     <p className="text-sm text-gray-400 line-clamp-2">
                        {mod.description}
                     </p>
                     
                     <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleDeleteModule(mod.id, mod.name)} className="text-sm text-red-500 hover:text-red-400 transition-colors flex items-center gap-1"><Trash2 size={14}/> Delete</button>
                        <button onClick={() => handleEditModuleClick(mod)} className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"><Edit size={14}/> Edit</button>
                     </div>
                   </div>
                ))}
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">Developer (Builder)</label>
                  <input type="text" value={newApp.builder} onChange={e => setNewApp({...newApp, builder: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-violet-500 focus:border-violet-500" placeholder="e.g. StechClarin" />
               </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Technical Slug</label>
              <input type="text" disabled={isEditMode} value={newApp.slug} onChange={e => setNewApp({...newApp, slug: e.target.value})} className={`w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white font-mono text-sm focus:ring-violet-500 focus:border-violet-500 ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="e.g. school-manage" />
              {!isEditMode && <p className="mt-1 text-xs text-gray-500">Must be unique, lowercase, without spaces.</p>}
            </div>
           <div>
             <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
             <textarea value={newApp.description} onChange={e => setNewApp({...newApp, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-violet-500 focus:border-violet-500 h-24" placeholder="Brief description of the application..." />
           </div>
           <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Base Price ($) / Year</label>
                <input type="number" min="0" step="0.01" value={newApp.basePrice} onChange={e => setNewApp({...newApp, basePrice: parseFloat(e.target.value) || 0})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-violet-500 focus:border-violet-500" placeholder="0.00" />
              </div>
              <div className="flex items-center pt-6">
                <input type="checkbox" id="isFeatured" checked={newApp.isFeatured} onChange={e => setNewApp({...newApp, isFeatured: e.target.checked})} className="w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500 bg-gray-800" />
                <label htmlFor="isFeatured" className="ml-2 text-sm text-amber-400 font-semibold cursor-pointer">Mettre en avant (Featured)</label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-xl flex items-start gap-3 mt-2">
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

      {/* Create Module Modal */}
      <StoreModal 
        isOpen={isModuleModalOpen} 
        onClose={() => setIsModuleModalOpen(false)} 
        title={isEditModuleMode ? "Edit Module" : `Add Module to ${selectedApp?.name}`}
      >
        <form className="space-y-4" onSubmit={handleCreateModule}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Module Name (Display)</label>
                <input type="text" value={newModule.name} onChange={e => setNewModule({...newModule, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-violet-500 focus:border-violet-500" placeholder="e.g. Advanced Finance" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Module Code (Technical)</label>
                <input type="text" value={newModule.code} onChange={e => setNewModule({...newModule, code: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white font-mono text-sm focus:ring-violet-500 focus:border-violet-500" placeholder="e.g. finance_adv" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Module Logo (SVG Code / Emoji)</label>
                  <textarea 
                    value={newModule.icon} 
                    onChange={e => setNewModule({...newModule, icon: e.target.value})} 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white font-mono text-xs focus:ring-violet-500 focus:border-violet-500 h-20" 
                    placeholder='<svg>...</svg> or 👨‍💻' 
                  />
               </div>
               <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Preview</label>
                  <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-center text-2xl">
                    {newModule.icon ? (
                       newModule.icon.includes('<svg') ? (
                          <div dangerouslySetInnerHTML={{ __html: newModule.icon }} className="w-8 h-8" />
                       ) : (
                          newModule.icon
                       )
                    ) : (
                       <Box size={24} className="text-gray-700" />
                    )}
                  </div>
               </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea value={newModule.description} onChange={e => setNewModule({...newModule, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-violet-500 focus:border-violet-500 h-20" placeholder="What does this module do?" />
            </div>
           
           <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex flex-col gap-3 mt-2">
              <div className="flex items-start gap-3">
                <input type="checkbox" id="isPremium" checked={newModule.isPremium} onChange={e => setNewModule({...newModule, isPremium: e.target.checked})} className="mt-1 w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500 bg-gray-800" />
                <div>
                   <label htmlFor="isPremium" className="text-amber-500 font-semibold cursor-pointer block">Premium Module (Paid)</label>
                   <p className="text-xs text-gray-400 mt-1">If active, this module requires a specific license granted to the tenant to be unlocked.</p>
                </div>
              </div>
              
              {newModule.isPremium && (
                <div className="mt-2 pl-7 animate-in fade-in duration-300">
                  <label className="block text-sm font-medium text-amber-500 mb-1">Module Price ($) / Year</label>
                  <input type="number" min="0" step="0.01" value={newModule.price} onChange={e => setNewModule({...newModule, price: parseFloat(e.target.value) || 0})} className="w-full sm:w-1/2 bg-gray-900 border border-amber-500/30 rounded-lg p-2.5 text-white focus:ring-amber-500 focus:border-amber-500" placeholder="0.00" />
                </div>
              )}
           </div>
           
           <div className="pt-4 flex justify-end gap-3 border-t border-gray-800 mt-6">
              <button type="button" onClick={() => setIsModuleModalOpen(false)} className="px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">Cancel</button>
               <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                 {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                 {isSubmitting ? 'Saving...' : (isEditModuleMode ? 'Save Changes' : 'Add Module')}
              </button>
           </div>
        </form>
      </StoreModal>

    </div>
  );
};

export default AppsCatalogueTab;
