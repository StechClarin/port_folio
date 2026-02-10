import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DataTable from './components/DataTable';
import { Plus, X, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SocialManager = () => {
    const [socials, setSocials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSocial, setCurrentSocial] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        platform: '',
        url: '',
        icon_name: '',
        display_order: 0,
    });

    useEffect(() => {
        fetchSocials();
    }, []);

    const fetchSocials = async () => {
        try {
            const { data, error } = await supabase.from('socials').select('*').order('display_order');
            if (error) throw error;
            setSocials(data || []);
        } catch (error) {
            toast.error('Error fetching socials');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setCurrentSocial(item);
        setFormData({
            platform: item.platform,
            url: item.url,
            icon_name: item.icon_name || '',
            display_order: item.display_order || 0,
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setCurrentSocial(null);
        setFormData({
            platform: '',
            url: '',
            icon_name: '',
            display_order: 0,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            const { error } = await supabase.from('socials').delete().eq('id', id);
            if (error) throw error;
            toast.success('Deleted');
            fetchSocials();
        } catch (error) {
            console.error(error);
            toast.error('Error deleting');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = {
                platform: formData.platform,
                url: formData.url,
                icon_name: formData.icon_name,
                display_order: parseInt(formData.display_order),
            };

            if (currentSocial) {
                const { error } = await supabase.from('socials').update(data).eq('id', currentSocial.id);
                if (error) throw error;
                toast.success('Updated');
            } else {
                const { error } = await supabase.from('socials').insert([data]);
                if (error) throw error;
                toast.success('Created');
            }
            setIsModalOpen(false);
            fetchSocials();
        } catch (error) {
            console.error(error);
            toast.error('Error saving');
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        { header: 'Platform', accessor: 'platform' },
        { header: 'URL', accessor: 'url' },
        { header: 'Icon', accessor: 'icon_name' },
        { header: 'Order', accessor: 'display_order' },
    ];

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Socials</h1>
                <button
                    onClick={handleCreate}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Add Social</span>
                </button>
            </div>
            <DataTable columns={columns} data={socials} onEdit={handleEdit} onDelete={handleDelete} />

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-xl">
                        <div className="flex justify-between items-center p-6 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-white">{currentSocial ? 'Edit' : 'Add'} Social</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-gray-300 mb-1">Platform</label>
                                <input type="text" value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" required />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-1">URL</label>
                                <input type="url" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" required />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-1">Lucide Icon Name</label>
                                <input type="text" value={formData.icon_name} onChange={e => setFormData({ ...formData, icon_name: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" placeholder="e.g. Github, Linkedin" />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-1">Display Order</label>
                                <input type="number" value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" />
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" disabled={saving} className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 disabled:opacity-50">
                                    {saving ? <Loader2 className="animate-spin" /> : <Save />}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocialManager;
