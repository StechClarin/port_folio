import React, { useState, useEffect, useCallback } from 'react';
import { Upload, HardDrive, Filter, Clock, CheckCircle2, AlertCircle, Copy, DownloadCloud, FileArchive, Save, Shield, Loader2, RefreshCw, Edit, Menu, Trash2, Power, PowerOff } from 'lucide-react';
import StoreModal from './StoreModal';
import { supabase } from '../../../../lib/supabaseClient';
import toast from 'react-hot-toast';
import { confirmAction } from '../../../../utils/toastUtils';

const ReleasesTab = () => {
  const [apps, setApps] = useState([]);
  const [releases, setReleases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filterApp, setFilterApp] = useState('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [newRelease, setNewRelease] = useState({ 
    appId: '', 
    version: '', 
    metadataUrl: '',
    downloadUrl: '',
    checksum: '',
    sizeMB: '',
    platform: 'windows-latest'
  });
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: appsData, error: appsError } = await supabase
        .from('apps')
        .select('id, name');
        
      if (appsError) throw appsError;
      
      const { data: releasesData, error: releasesError } = await supabase
        .from('app_releases')
        .select('*, apps(name)')
        .order('released_at', { ascending: false });
        
      if (releasesError) throw releasesError;
      
      setApps(appsData || []);
      setReleases(releasesData || []);
      
      setNewRelease(prev => {
        if (appsData?.length > 0 && !prev.appId) {
          return { ...prev, appId: appsData[0].id };
        }
        return prev;
      });
    } catch (error) {
      console.error('Error fetching releases data:', error);
      toast.error('Failed to load releases');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFetchMetadata = async () => {
    if (!newRelease.metadataUrl) {
      toast.error('Veuillez saisir l\'URL du fichier metadata.json');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(newRelease.metadataUrl);
      if (!response.ok) throw new Error('Impossible de charger le fichier de métadonnées');
      
      const data = await response.json();
      
      // Map JSON fields to form
      // data.hash -> checksum
      // data.version -> version
      // data.archive -> extracted from metadata URL
      
      const baseUrl = newRelease.metadataUrl.substring(0, newRelease.metadataUrl.lastIndexOf('/') + 1);
      const computedDownloadUrl = baseUrl + (data.archive || '');

      setNewRelease(prev => ({
        ...prev,
        version: data.version || prev.version,
        checksum: data.hash || prev.checksum,
        downloadUrl: computedDownloadUrl || prev.downloadUrl,
        platform: data.os || prev.platform
      }));

      toast.success('Métadonnées récupérées avec succès !');
    } catch (err) {
      console.error('Metadata fetch error:', err);
      toast.error('Erreur lors de la lecture du metadata.json. Vérifiez l\'URL et le CORS.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRelease.appId || !newRelease.version || !newRelease.downloadUrl || !newRelease.checksum) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRelease) {
        // UPDATE
        const { data, error } = await supabase
          .from('app_releases')
          .update({
            app_id: newRelease.appId,
            version: newRelease.version,
            download_url: newRelease.downloadUrl,
            checksum: newRelease.checksum,
            size_bytes: newRelease.sizeMB ? parseInt(newRelease.sizeMB) * 1024 * 1024 : 0,
            platform: newRelease.platform,
          })
          .eq('id', editingRelease.id)
          .select('*, apps(name)')
          .single();

        if (error) throw error;
        setReleases(releases.map(r => r.id === editingRelease.id ? data : r));
        toast.success('Release updated successfully!');
      } else {
        // CREATE
        const { data, error } = await supabase
          .from('app_releases')
          .insert([{
            app_id: newRelease.appId,
            version: newRelease.version,
            download_url: newRelease.downloadUrl,
            checksum: newRelease.checksum,
            size_bytes: newRelease.sizeMB ? parseInt(newRelease.sizeMB) * 1024 * 1024 : 0,
            platform: newRelease.platform,
            is_active: true,
            released_at: new Date().toISOString()
          }])
          .select('*, apps(name)')
          .single();

        if (error) throw error;
        setReleases([data, ...releases]);
        toast.success('Release published successfully!');
      }

      setIsUploadModalOpen(false);
      setEditingRelease(null);
      setNewRelease({ appId: apps[0]?.id || '', version: '', downloadUrl: '', checksum: '', sizeMB: '', metadataUrl: '', platform: 'windows-latest' });
    } catch (err) {
      console.error('Error saving release:', err);
      toast.error(err.message || 'Failed to save release');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (release) => {
    setEditingRelease(release);
    setNewRelease({
      appId: release.app_id,
      version: release.version,
      downloadUrl: release.download_url,
      checksum: release.checksum,
      sizeMB: release.size_bytes ? Math.round(release.size_bytes / 1024 / 1024).toString() : '',
      metadataUrl: '',
      platform: release.platform || 'windows-latest'
    });
    setIsUploadModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
    setEditingRelease(null);
    setNewRelease({ appId: apps[0]?.id || '', version: '', downloadUrl: '', checksum: '', sizeMB: '', metadataUrl: '', platform: 'windows-latest' });
  };

  const handleToggleReleaseStatus = async (releaseId, currentStatus) => {
    const newStatus = !currentStatus;
    confirmAction(`Are you sure you want to mark this release as ${newStatus ? 'Live' : 'Archived'}?`, async () => {
      try {
        const { data, error } = await supabase
          .from('app_releases')
          .update({ is_active: newStatus })
          .eq('id', releaseId)
          .select('*, apps(name)')
          .single();
          
        if (error) throw error;
        
        setReleases(releases.map(r => r.id === releaseId ? data : r));
        toast.success(`Release marked as ${newStatus ? 'Live' : 'Archived'}`);
      } catch (err) {
        console.error(err);
        toast.error('Failed to update release status');
      }
    });
  };

  const handleDeleteRelease = async (releaseId) => {
    confirmAction('Voulez-vous vraiment supprimer définitivement cette release ? Cette action est irréversible.', async () => {
      try {
        const { error } = await supabase.from('app_releases').delete().eq('id', releaseId);
        if (error) throw error;
        setReleases(releases.filter(r => r.id !== releaseId));
        toast.success('Release supprimée avec succès');
      } catch (err) {
        console.error(err);
        toast.error('Erreur lors de la suppression de la release');
      }
    });
  };

  const filteredReleases = filterApp === 'All' 
    ? releases 
    : releases.filter(r => r.app_id === filterApp);

  const handleCopyHash = (hash) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    toast.success('SHA-256 Copied!');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-violet-400">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-gray-400">Loading releases...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Overlay click-outside for dropdown */}
      {openDropdownId && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)}></div>
      )}

      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-900/40 p-4 rounded-xl border border-gray-700/50">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             <select 
                value={filterApp}
                onChange={(e) => setFilterApp(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block pl-10 p-2.5 appearance-none"
             >
                <option value="All">All Applications</option>
                {apps.map(app => (
                  <option key={app.id} value={app.id}>{app.name}</option>
                ))}
             </select>
          </div>
        </div>

        {/* Upload Zone Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={fetchData}
            className="text-gray-400 hover:text-white p-2 rounded-lg transition-colors bg-gray-900/50 hover:bg-gray-800"
            title="Refresh Data"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-6 py-2.5 rounded-lg shadow-lg shadow-violet-500/25 transition-all font-medium"
          >
            <Upload size={18} />
            New Release (.tar.gz)
          </button>
        </div>
      </div>

      {/* Releases List */}
      <div className="bg-gray-800/20 border border-gray-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-gray-400">
               <thead className="bg-gray-900/50 text-xs uppercase text-gray-500 border-b border-gray-700">
                  <tr>
                     <th scope="col" className="px-6 py-4 font-medium tracking-wider">Application / Version</th>
                     <th scope="col" className="px-6 py-4 font-medium tracking-wider">Status</th>
                     <th scope="col" className="px-6 py-4 font-medium tracking-wider">Size & Date</th>
                     <th scope="col" className="px-6 py-4 font-medium tracking-wider">Security (SHA-256)</th>
                     <th scope="col" className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
                  </tr>
               </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredReleases.map((release) => (
                     <tr 
                        key={release.id} 
                        className="hover:bg-gray-800/40 transition-colors group"
                     >
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-900 rounded-lg border border-gray-700">
                                 <FileArchive className="text-violet-400" size={20} />
                              </div>
                              <div>
                                 <div className="font-semibold text-white text-base flex items-center gap-2">
                                    {release.apps?.name || 'Unknown App'}
                                    <span className="text-xs font-mono bg-violet-900/30 text-violet-300 px-2 py-0.5 rounded">
                                       v{release.version}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           {release.is_active ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ring-1 ring-emerald-500/30">
                                 <CheckCircle2 size={12} /> Live
                              </span>
                           ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-600/30">
                                 <Clock size={12} /> Archived
                              </span>
                           )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex flex-col text-xs">
                              <span className="text-gray-300 font-medium flex items-center gap-1">
                                 <HardDrive size={12} className="text-gray-500"/> {release.size_bytes ? `${Math.round(release.size_bytes / 1024 / 1024)} MB` : 'Pending'}
                              </span>
                              <span className="text-gray-500 mt-1">
                                 {new Date(release.released_at).toLocaleDateString()}
                              </span>
                              {release.platform && (
                                 <span className="text-violet-400 mt-1 uppercase text-[10px] tracking-wide font-semibold">
                                     {release.platform.includes('ubuntu') || release.platform.includes('linux') ? '🐧 LINUX' : '🪟 WINDOWS'}
                                 </span>
                              )}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2 bg-gray-900/50 p-2 rounded-lg border border-gray-750 w-max group/hash">
                              <div className="flex items-center gap-2 text-xs font-mono text-gray-400 max-w-[150px] truncate" title={release.checksum}>
                                 <Shield size={14} className={release.is_active ? "text-emerald-500/70" : "text-gray-500"} />
                                 {release.checksum ? `${release.checksum.substring(0, 16)}...` : 'Processing...'}
                              </div>
                              <button 
                                 onClick={() => handleCopyHash(release.checksum)}
                                 className="text-gray-500 hover:text-white transition-colors opacity-0 group-hover/hash:opacity-100"
                              >
                                 <Copy size={14} />
                              </button>
                           </div>
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right relative">
                            <div className="flex items-center justify-end relative">
                               
                               {/* Menu Content (Horizontal Icons) - Appears on Left of Trigger */}
                               {openDropdownId === release.id && (
                                  <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-gray-900 border border-gray-700 rounded-full shadow-xl px-1.5 py-1.5 z-[100] animate-in slide-in-from-right-2 fade-in duration-200 origin-right">
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); handleEditClick(release); setOpenDropdownId(null); }}
                                        className="p-2 rounded-full text-gray-400 hover:bg-violet-500/20 hover:text-violet-400 transition-colors"
                                        title="Modifier"
                                     >
                                        <Edit size={16} />
                                     </button>

                                     <button 
                                        onClick={(e) => { e.stopPropagation(); handleToggleReleaseStatus(release.id, release.is_active); setOpenDropdownId(null); }}
                                        className="p-2 rounded-full text-gray-400 hover:bg-violet-500/20 hover:text-white transition-colors"
                                        title={release.is_active ? "Désactiver" : "Activer"}
                                     >
                                        {release.is_active ? <PowerOff size={16} className="text-amber-500" /> : <Power size={16} className="text-emerald-500" />}
                                     </button>

                                     <div className="w-px h-5 bg-gray-700 mx-1"></div>

                                     <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteRelease(release.id); setOpenDropdownId(null); }}
                                        className="p-2 rounded-full text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                        title="Supprimer"
                                     >
                                        <Trash2 size={16} />
                                     </button>
                                  </div>
                               )}

                               {/* Trigger Button - Student List Style */}
                               <button 
                                  onClick={(e) => {
                                     e.stopPropagation();
                                     setOpenDropdownId(openDropdownId === release.id ? null : release.id);
                                  }}
                                  className={`w-9 h-9 flex items-center justify-center rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-violet-500/30 ${
                                     openDropdownId === release.id 
                                     ? 'bg-violet-700 text-white scale-105 ring-4 ring-violet-500/30' 
                                     : 'bg-violet-600 text-white hover:bg-violet-700 hover:scale-105'
                                  }`}
                               >
                                  <Menu size={18} />
                               </button>

                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {filteredReleases.length === 0 && (
               <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
                  <AlertCircle size={48} className="mb-4 opacity-50" />
                  <p className="text-lg text-gray-400">No releases found for this filter.</p>
               </div>
            )}
         </div>
      </div>

      {/* --- Modals --- */}
      
      {/* Upload Release Modal */}
      <StoreModal 
        isOpen={isUploadModalOpen} 
        onClose={handleCloseModal} 
        title={editingRelease ? "Edit Release" : "Upload New Release"}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Target Application</label>
                <select value={newRelease.appId} onChange={e => setNewRelease({...newRelease, appId: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-violet-500 focus:border-violet-500 appearance-none">
                   {apps.map(app => (
                      <option key={app.id} value={app.id}>{app.name}</option>
                   ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Semantic Version</label>
                <input type="text" required value={newRelease.version} onChange={e => setNewRelease({...newRelease, version: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white font-mono text-sm focus:ring-violet-500 focus:border-violet-500" placeholder="e.g. 1.0.0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">OS / Platform</label>
                <select value={newRelease.platform} onChange={e => setNewRelease({...newRelease, platform: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-violet-500 focus:border-violet-500 appearance-none">
                   <option value="windows-latest">Windows (.exe / .zip)</option>
                   <option value="ubuntu-latest">Linux (.tar.gz)</option>
                </select>
              </div>
           </div>
           
           <div className="bg-violet-500/5 border border-violet-500/20 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                 <label className="block text-sm font-medium text-violet-300">Option : Récupération Automatique</label>
                 <span className="text-[10px] text-gray-500 font-mono">Lecture du metadata.json</span>
              </div>
              <div className="flex gap-2">
                 <div className="relative flex-1">
                    <input 
                      type="url" 
                      placeholder="URL du fichier metadata.json"
                      value={newRelease.metadataUrl || ''}
                      onChange={e => setNewRelease({...newRelease, metadataUrl: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-xs focus:ring-violet-500 focus:border-violet-500"
                    />
                 </div>
                 <button 
                   type="button" 
                   onClick={handleFetchMetadata}
                   disabled={isSubmitting}
                   className="px-4 py-2 bg-violet-600/80 hover:bg-violet-600 text-white text-xs rounded-lg transition border border-violet-500/30 flex items-center gap-2"
                 >
                    {isSubmitting ? 'Fetching...' : 'Fetch'}
                 </button>
              </div>
              <p className="text-[10px] text-gray-400 italic">Remplira automatiquement la version, le Hash SHA-256 et le lien de téléchargement.</p>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Archive Download Link (URL)</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <DownloadCloud className="w-5 h-5 text-gray-400" />
                 </div>
                 <input 
                    type="url" 
                    required
                    value={newRelease.downloadUrl} 
                    onChange={e => setNewRelease({...newRelease, downloadUrl: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 pl-10 text-white text-sm focus:ring-violet-500 focus:border-violet-500 font-mono" 
                    placeholder={import.meta.env.VITE_RELEASE_BASE_URL ? import.meta.env.VITE_RELEASE_BASE_URL + "..." : "https://server.com/releases/..."} 
                 />
              </div>
              {import.meta.env.VITE_RELEASE_BASE_URL && (
                 <p className="mt-1 text-[10px] text-violet-400/70 truncate">
                    Base URL active: <span className="font-mono">{import.meta.env.VITE_RELEASE_BASE_URL}</span>
                 </p>
              )}
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                 <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                    <Shield size={14} className="text-emerald-400" /> SHA-256 Checksum
                 </label>
                 <input 
                    type="text" 
                    required
                    value={newRelease.checksum} 
                    onChange={e => setNewRelease({...newRelease, checksum: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-xs focus:ring-emerald-500 focus:border-emerald-500 font-mono" 
                    placeholder="From metadata.json..." 
                 />
              </div>
              <div className="sm:col-span-1">
                 <label className="block text-sm font-medium text-gray-300 mb-1">Size (MB)</label>
                 <input 
                    type="number" 
                    value={newRelease.sizeMB} 
                    onChange={e => setNewRelease({...newRelease, sizeMB: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:ring-violet-500 focus:border-violet-500" 
                    placeholder="Optional" 
                 />
              </div>
           </div>
           
           <div className="pt-4 flex justify-end gap-3 border-t border-gray-800 mt-6">
              <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">Cancel</button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                 {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                 {isSubmitting ? (editingRelease ? 'Saving...' : 'Publishing...') : (editingRelease ? 'Save Changes' : 'Publish Release')}
              </button>
           </div>
        </form>
      </StoreModal>

    </div>
  );
};

export default ReleasesTab;
