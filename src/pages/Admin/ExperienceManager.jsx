import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DataTable from './components/DataTable';
import { Plus, X, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ExperienceManager = () => {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentExp, setCurrentExp] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        company: '',
        role: '',
        period: '',
        description: '',
        display_order: 0,
    });

    useEffect(() => {
        fetchExperiences();
    }, []);

    const fetchExperiences = async () => {
        try {
            const { data, error } = await supabase
                .from('experiences')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setExperiences(data || []);
        } catch (error) {
            toast.error('Error fetching experiences');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (exp) => {
        setCurrentExp(exp);
        setFormData({
            company: exp.company,
            role: exp.role,
            period: exp.period || '',
            description: exp.description || '',
            display_order: exp.display_order || 0,
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setCurrentExp(null);
        setFormData({
            company: '',
            role: '',
            period: '',
            description: '',
            display_order: 0,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this experience?')) return;

        try {
            const { error } = await supabase.from('experiences').delete().eq('id', id);
            if (error) throw error;
            toast.success('Experience deleted');
            fetchExperiences();
        } catch (error) {
            console.error('Error deleting experience:', error);
            toast.error('Error deleting experience');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const expData = {
                company: formData.company,
                role: formData.role,
                period: formData.period,
                description: formData.description,
                display_order: parseInt(formData.display_order),
            };

            if (currentExp) {
                const { error } = await supabase
                    .from('experiences')
                    .update(expData)
                    .eq('id', currentExp.id);
                if (error) throw error;
                toast.success('Experience updated');
            } else {
                const { error } = await supabase.from('experiences').insert([expData]);
                if (error) throw error;
                toast.success('Experience created');
            }

            setIsModalOpen(false);
            fetchExperiences();
        } catch (error) {
            toast.error('Error saving experience');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        { header: 'Company', accessor: 'company' },
        { header: 'Role', accessor: 'role' },
        { header: 'Period', accessor: 'period' },
        { header: 'Order', accessor: 'display_order' },
    ];

    if (loading) return <div className="text-white">Loading experiences...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Experience</h1>
                <button
                    onClick={handleCreate}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Experience</span>
                </button>
            </div>

            <DataTable
                columns={columns}
                data={experiences}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-gray-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl my-8">
                        <div className="flex justify-between items-center p-6 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-white">
                                {currentExp ? 'Edit Experience' : 'New Experience'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-violet-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-violet-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Period</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.period}
                                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-violet-500 outline-none"
                                        placeholder="e.g. 2020 - Present"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-violet-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            <span>Save Experience</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExperienceManager;
