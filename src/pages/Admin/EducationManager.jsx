import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DataTable from './components/DataTable';
import { Plus, X, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EducationManager = () => {
    const [education, setEducation] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEdu, setCurrentEdu] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        school: '',
        degree: '',
        year: '',
        location: '',
        display_order: 0,
    });

    useEffect(() => {
        fetchEducation();
    }, []);

    const fetchEducation = async () => {
        try {
            const { data, error } = await supabase
                .from('education')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setEducation(data || []);
        } catch (error) {
            toast.error('Error fetching education');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (edu) => {
        setCurrentEdu(edu);
        setFormData({
            school: edu.school,
            degree: edu.degree,
            year: edu.year || '',
            location: edu.location || '',
            display_order: edu.display_order || 0,
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setCurrentEdu(null);
        setFormData({
            school: '',
            degree: '',
            year: '',
            location: '',
            display_order: 0,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            const { error } = await supabase.from('education').delete().eq('id', id);
            if (error) throw error;
            toast.success('Deleted successfully');
            fetchEducation();
        } catch (error) {
            console.error(error);
            toast.error('Error deleting');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const eduData = {
                school: formData.school,
                degree: formData.degree,
                year: formData.year,
                location: formData.location,
                display_order: parseInt(formData.display_order),
            };

            if (currentEdu) {
                const { error } = await supabase.from('education').update(eduData).eq('id', currentEdu.id);
                if (error) throw error;
                toast.success('Updated successfully');
            } else {
                const { error } = await supabase.from('education').insert([eduData]);
                if (error) throw error;
                toast.success('Created successfully');
            }
            setIsModalOpen(false);
            fetchEducation();
        } catch (error) {
            console.error(error);
            toast.error('Error saving');
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        { header: 'School', accessor: 'school' },
        { header: 'Degree', accessor: 'degree' },
        { header: 'Year', accessor: 'year' },
        { header: 'Order', accessor: 'display_order' },
    ];

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Education</h1>
                <button
                    onClick={handleCreate}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Add Education</span>
                </button>
            </div>
            <DataTable columns={columns} data={education} onEdit={handleEdit} onDelete={handleDelete} />

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-xl">
                        <div className="flex justify-between items-center p-6 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-white">{currentEdu ? 'Edit' : 'Add'} Education</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-gray-300 mb-1">School</label>
                                <input type="text" value={formData.school} onChange={e => setFormData({ ...formData, school: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" required />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-1">Degree</label>
                                <input type="text" value={formData.degree} onChange={e => setFormData({ ...formData, degree: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" required />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-1">Year</label>
                                <input type="text" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-1">Location</label>
                                <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" />
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

export default EducationManager;
