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
    metadataBaseUrl: '',
    sizeMB: '',
    platforms: [] // Array of selected platforms
  });
  
  const [platformData, setPlatformData] = useState({}); // { 'windows-latest': { checksum, downloadUrl }, ... }

  useEffect(() => {
    const handleOutsideClick = () => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
    };
    
    if (openDropdownId) {
      document.addEventListener('click', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [openDropdownId]);
  
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
    if (!newRelease.metadataBaseUrl) {
      toast.error('Veuillez saisir l\'URL de base des métadonnées');
      return;
    }

    if (newRelease.platforms.length === 0) {
      toast.error('Veuillez sélectionner au moins une plateforme');
      return;
    }

    try {
      setIsSubmitting(true);
      const newPlatformData = {};
      let version = newRelease.version;

      // Fetch metadata for each selected platform
      for (const platform of newRelease.platforms) {
        const metadataFileName = 
          platform === 'windows-latest' ? 'metadata-win.json' :
          platform === 'ubuntu-latest' ? 'metadata-linux.json' :
          platform === 'macos-latest' ? 'metadata-mac.json' : null;

        if (!metadataFileName) {
          toast.error(`Plateforme inconnue: ${platform}`);
          continue;
        }

        const metadataUrl = `${newRelease.metadataBaseUrl}/${metadataFileName}`;
        console.log(`Fetching metadata for ${platform} from ${metadataUrl}`);

        const response = await fetch(metadataUrl);
        if (!response.ok) {
          throw new Error(`Impossible de charger metadata pour ${platform} (${response.status})`);
        }

        const data = await response.json();
        
        const baseUrl = newRelease.metadataBaseUrl;
        const computedDownloadUrl = baseUrl + (data.archive || '');

        newPlatformData[platform] = {
          checksum: data.hash,
          downloadUrl: computedDownloadUrl,
          os: data.os
        };

        if (!version && data.version) {
          version = data.version;
        }
      }

      setPlatformData(newPlatformData);
      setNewRelease(prev => ({
        ...prev,
        version: version || prev.version
      }));

      toast.success(`Métadonnées récupérées pour ${newRelease.platforms.length} plateforme(s) !`);
    } catch (err) {
      console.error('Metadata fetch error:', err);
      toast.error(`Erreur lors de la lecture des métadonnées: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRelease.appId || !newRelease.version || newRelease.platforms.length === 0) {
      toast.error('Please fill all required fields and select at least one platform');
      return;
    }

    // Verify all platforms have metadata
    for (const platform of newRelease.platforms) {
      if (!platformData[platform]?.checksum || !platformData[platform]?.downloadUrl) {
        toast.error(`Métadonnées manquantes pour ${platform}. Veuillez fetcher les métadonnées.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Create or update a release for each selected platform
      for (const platform of newRelease.platforms) {
        const releaseData = {
          app_id: newRelease.appId,
          version: newRelease.version,
          download_url: platformData[platform].downloadUrl,
          checksum: platformData[platform].checksum,
          size_bytes: newRelease.sizeMB ? parseInt(newRelease.sizeMB) * 1024 * 1024 : 0,
          platform: platform,
          is_active: true,
          released_at: new Date().toISOString()
        };

        if (editingRelease) {
          // UPDATE: look for release with same app_id, version, and platform
          const existingRelease = releases.find(r => 
            r.app_id === newRelease.appId && 
            r.version === newRelease.version && 
            r.platform === platform
          );

          if (existingRelease) {
            const { data, error } = await supabase
              .from('app_releases')
              .update(releaseData)
              .eq('id', existingRelease.id)
              .select('*, apps(name)')
              .single();

            if (error) throw error;
            setReleases(releases.map(r => r.id === existingRelease.id ? data : r));
          }
        } else {
          // CREATE
          const { data, error } = await supabase
            .from('app_releases')
            .insert([releaseData])
            .select('*, apps(name)')
            .single();

          if (error) throw error;
          setReleases([data, ...releases]);
        }
      }

      toast.success(`Release(s) publiée(s) pour ${newRelease.platforms.length} plateforme(s) !`);
      setIsUploadModalOpen(false);
      setEditingRelease(null);
      setNewRelease({ appId: apps[0]?.id || '', version: '', metadataBaseUrl: '', sizeMB: '', platforms: [] });
      setPlatformData({});
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
      metadataBaseUrl: '',
      sizeMB: release.size_bytes ? Math.round(release.size_bytes / 1024 / 1024).toString() : '',
      platforms: [release.platform]
    });
    setPlatformData({
      [release.platform]: {
        checksum: release.checksum,
        downloadUrl: release.download_url,
        os: release.platform
      }
    });
    setIsUploadModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
    setEditingRelease(null);
    setNewRelease({ appId: apps[0]?.id || '', version: '', metadataBaseUrl: '', sizeMB: '', platforms: [] });
    setPlatformData({});
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
                            <div className="flex items-center justify-end">
                               
                               {/* Menu Content (Horizontal Icons) - Appears on Left of Trigger */}
                               {openDropdownId === release.id && (
                                  <div 
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-gray-900 border border-gray-700 rounded-full shadow-xl px-1.5 py-1.5 z-50 animate-in slide-in-from-right-2 fade-in duration-200 origin-right pointer-events-auto"
                                  >
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); handleEditClick(release); setOpenDropdownId(null); }}
                                        className="p-2 rounded-full text-gray-400 hover:bg-violet-500/20 hover:text-violet-400 transition-colors cursor-pointer"
                                        title="Modifier"
                                     >
                                        <Edit size={16} />
                                     </button>

                                     <button 
                                        onClick={(e) => { e.stopPropagation(); handleToggleReleaseStatus(release.id, release.is_active); setOpenDropdownId(null); }}
                                        className="p-2 rounded-full text-gray-400 hover:bg-violet-500/20 hover:text-white transition-colors cursor-pointer"
                                        title={release.is_active ? "Désactiver" : "Activer"}
                                     >
                                        {release.is_active ? <PowerOff size={16} className="text-amber-500" /> : <Power size={16} className="text-emerald-500" />}
                                     </button>

                                     <div className="w-px h-5 bg-gray-700 mx-1"></div>

                                     <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteRelease(release.id); setOpenDropdownId(null); }}
                                        className="p-2 rounded-full text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors cursor-pointer"
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
                                  className={`w-9 h-9 flex items-center justify-center rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-violet-500/30 cursor-pointer ${
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
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Target Application</label>
                <select value={newRelease.appId} onChange={e => setNewRelease({...newRelease, appId: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-violet-500 focus:border-violet-500 appearance-none">
                   <option value="">Select an app...</option>
                   {apps.map(app => (
                      <option key={app.id} value={app.id}>{app.name}</option>
                   ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Semantic Version</label>
                <input type="text" required value={newRelease.version} onChange={e => setNewRelease({...newRelease, version: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white font-mono text-sm focus:ring-violet-500 focus:border-violet-500" placeholder="e.g. 1.0.12" />
              </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">📱 Target Platforms (Multi-select)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['windows-latest', 'ubuntu-latest', 'macos-latest'].map(platform => {
                  const platformLabel = platform === 'windows-latest' ? '🪟 Windows' : platform === 'ubuntu-latest' ? '🐧 Linux' : '🍎 macOS';
                  return (
                    <label key={platform} className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-violet-500/50 transition">
                      <input 
                        type="checkbox" 
                        checked={newRelease.platforms.includes(platform)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewRelease({...newRelease, platforms: [...newRelease.platforms, platform]});
                          } else {
                            setNewRelease({...newRelease, platforms: newRelease.platforms.filter(p => p !== platform)});
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-700 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-white text-sm font-medium">{platformLabel}</span>
                    </label>
                  );
                })}
              </div>
           </div>
           
           <div className="bg-violet-500/5 border border-violet-500/20 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                 <label className="block text-sm font-medium text-violet-300">🔄 Auto-fetch Metadata</label>
                 <span className="text-[10px] text-gray-500 font-mono">metadata-win.json, metadata-linux.json, metadata-mac.json</span>
              </div>
              <div className="space-y-2">
                 <input 
                   type="url" 
                   placeholder="Base URL for metadata files (e.g., http://72.60.2.96:8080/schoolmanage/test/releases/v1.0.12)"
                   value={newRelease.metadataBaseUrl || ''}
                   onChange={e => setNewRelease({...newRelease, metadataBaseUrl: e.target.value})}
                   className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-xs focus:ring-violet-500 focus:border-violet-500"
                 />
                 <button 
                   type="button" 
                   onClick={handleFetchMetadata}
                   disabled={isSubmitting || newRelease.platforms.length === 0}
                   className="w-full px-4 py-2 bg-violet-600/80 hover:bg-violet-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs rounded-lg transition border border-violet-500/30 flex items-center justify-center gap-2"
                 >
                    {isSubmitting ? 'Fetching...' : 'Fetch Metadata for Selected Platforms'}
                 </button>
              </div>
              <p className="text-[10px] text-gray-400 italic">Will read metadata-win.json, metadata-linux.json, metadata-mac.json and populate version, checksum, and download URLs.</p>
           </div>

           {/* Display platform-specific data */}
           {newRelease.platforms.length > 0 && (
             <div className="bg-gray-800/30 border border-gray-700/50 p-4 rounded-lg space-y-3">
               <h3 className="text-sm font-medium text-violet-300">Platform Details</h3>
               {newRelease.platforms.map(platform => {
                 const data = platformData[platform];
                 const platformLabel = platform === 'windows-latest' ? '🪟 Windows' : platform === 'ubuntu-latest' ? '🐧 Linux' : '🍎 macOS';
                 return (
                   <div key={platform} className="bg-gray-900/50 border border-gray-700/50 p-3 rounded-lg space-y-2">
                     <div className="font-mono text-xs text-gray-400">{platformLabel}</div>
                     <div>
                       <label className="block text-xs text-gray-400 mb-1">Download URL</label>
                       <input 
                         type="url"
                         readOnly
                         value={data?.downloadUrl || ''}
                         className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-xs font-mono opacity-75"
                       />
                     </div>
                     <div>
                       <label className="block text-xs text-gray-400 mb-1">SHA-256 Checksum</label>
                       <input 
                         type="text"
                         readOnly
                         value={data?.checksum || ''}
                         className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-xs font-mono opacity-75"
                       />
                     </div>
                   </div>
                 );
               })}
             </div>
           )}


           <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Size (MB) - Optional</label>
              <input 
                 type="number" 
                 value={newRelease.sizeMB} 
                 onChange={e => setNewRelease({...newRelease, sizeMB: e.target.value})}
                 className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:ring-violet-500 focus:border-violet-500" 
                 placeholder="Optional" 
              />
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
