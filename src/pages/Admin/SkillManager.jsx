import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DataTable from './components/DataTable';
import { Plus, X, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SkillManager = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSkill, setCurrentSkill] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category: 'Languages',
        icon_name: '',
        color: '#ffffff', // kept for UI state but unused in DB for now
        display_order: 0,
    });

    const categories = ['Languages', 'Frameworks', 'Tools', 'SGBD', 'DevOps', 'Other'];

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const { data, error } = await supabase
                .from('skills')
                .select('*')
                .order('category')
                .order('display_order');

            if (error) throw error;
            setSkills(data || []);
        } catch (error) {
            toast.error('Error fetching skills');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (skill) => {
        setCurrentSkill(skill);
        setFormData({
            name: skill.name,
            category: skill.category,
            icon_name: skill.icon_name || '',
            display_order: skill.display_order || 0,
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setCurrentSkill(null);
        setFormData({
            name: '',
            category: 'Languages',
            icon_name: '',
            display_order: 0,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            const { error } = await supabase.from('skills').delete().eq('id', id);
            if (error) throw error;
            toast.success('Deleted successfully');
            fetchSkills();
        } catch (error) {
            console.error(error);
            toast.error('Error deleting');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const skillData = {
                name: formData.name,
                category: formData.category,
                icon_name: formData.icon_name,
                display_order: parseInt(formData.display_order),
            };

            if (currentSkill) {
                const { error } = await supabase.from('skills').update(skillData).eq('id', currentSkill.id);
                if (error) throw error;
                toast.success('Updated successfully');
            } else {
                const { error } = await supabase.from('skills').insert([skillData]);
                if (error) throw error;
                toast.success('Created successfully');
            }
            setIsModalOpen(false);
            fetchSkills();
        } catch (error) {
            console.error(error);
            toast.error('Error saving');
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        { header: 'Name', accessor: 'name' },
        {
            header: 'Category',
            accessor: 'category',
            render: (item) => <span className="px-2 py-1 bg-gray-700 rounded-full text-xs">{item.category}</span>
        },
        { header: 'Order', accessor: 'display_order' },
    ];

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Skills Manager</h1>
                <button
                    onClick={handleCreate}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Add Skill</span>
                </button>
            </div>
            <DataTable columns={columns} data={skills} onEdit={handleEdit} onDelete={handleDelete} />

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-xl">
                        <div className="flex justify-between items-center p-6 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-white">{currentSkill ? 'Edit' : 'Add'} Skill</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-gray-300 mb-1">Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" required />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-1">Category</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-1">Icon Name (Lucide)</label>
                                <input type="text" value={formData.icon_name} onChange={e => setFormData({ ...formData, icon_name: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" />
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

export default SkillManager;
