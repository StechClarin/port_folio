import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DataTable from './components/DataTable';
import ImageUploader from './components/ImageUploader';
import { Plus, X, Save, Loader2, Link as LinkIcon, Github, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectManager = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image_url: '',
        demo_url: '',
        repo_url: '',
        technologies: '', // Will be parsed to array
        display_order: 0,
        is_featured: false,
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            toast.error('Error fetching projects');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (project) => {
        setCurrentProject(project);
        setFormData({
            title: project.title,
            description: project.description || '',
            image_url: project.image_url || '',
            demo_url: project.demo_url || '',
            repo_url: project.repo_url || '',
            // Convert array back to comma-separated string for input
            technologies: project.technologies ? project.technologies.join(', ') : '',
            display_order: project.display_order || 0,
            is_featured: project.is_featured || false,
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setCurrentProject(null);
        setFormData({
            title: '',
            description: '',
            image_url: '',
            demo_url: '',
            repo_url: '',
            technologies: '',
            display_order: 0,
            is_featured: false,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;

        try {
            const { error } = await supabase.from('projects').delete().eq('id', id);
            if (error) throw error;
            toast.success('Project deleted');
            fetchProjects();
        } catch (error) {
            console.error(error);
            toast.error('Error deleting project');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Parse technologies string to array
            const technologiesArray = formData.technologies
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0);

            const projectData = {
                title: formData.title,
                description: formData.description,
                image_url: formData.image_url,
                demo_url: formData.demo_url,
                repo_url: formData.repo_url,
                technologies: technologiesArray,
                display_order: parseInt(formData.display_order),
                is_featured: formData.is_featured,
            };

            if (currentProject) {
                const { error } = await supabase
                    .from('projects')
                    .update(projectData)
                    .eq('id', currentProject.id);
                if (error) throw error;
                toast.success('Project updated');
            } else {
                const { error } = await supabase.from('projects').insert([projectData]);
                if (error) throw error;
                toast.success('Project created');
            }

            setIsModalOpen(false);
            fetchProjects();
        } catch (error) {
            toast.error('Error saving project');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        {
            header: 'Image',
            accessor: 'image_url',
            render: (item) => (
                item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-12 h-12 object-cover rounded-md" />
                ) : (
                    <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center text-xs text-gray-500">No Img</div>
                )
            ),
        },
        { header: 'Title', accessor: 'title' },
        {
            header: 'Status',
            accessor: 'is_featured',
            render: (item) => (
                item.is_featured ? (
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-500 text-xs rounded-full">Featured</span>
                ) : (
                    <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full">Standard</span>
                )
            ),
        },
        { header: 'Order', accessor: 'display_order' },
    ];

    if (loading) return <div className="text-white">Loading projects...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Projects</h1>
                <button
                    onClick={handleCreate}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Project</span>
                </button>
            </div>

            <DataTable
                columns={columns}
                data={projects}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-gray-800 rounded-2xl w-full max-w-2xl border border-gray-700 shadow-2xl my-8">
                        <div className="flex justify-between items-center p-6 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-white">
                                {currentProject ? 'Edit Project' : 'New Project'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-violet-500 outline-none"
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

                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Display Order</label>
                                            <input
                                                type="number"
                                                value={formData.display_order}
                                                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-violet-500 outline-none"
                                            />
                                        </div>
                                        <div className="flex items-center h-full pt-6">
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_featured}
                                                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                                    className="w-5 h-5 rounded border-gray-600 text-violet-600 focus:ring-violet-500 bg-gray-700"
                                                />
                                                <span className="text-gray-300 text-sm font-medium">Featured</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <ImageUploader
                                        value={formData.image_url}
                                        onChange={(url) => setFormData({ ...formData, image_url: url })}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                                            <Globe size={16} className="mr-2" /> Demo URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.demo_url}
                                            onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-violet-500 outline-none"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                                            <Github size={16} className="mr-2" /> Repo URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.repo_url}
                                            onChange={(e) => setFormData({ ...formData, repo_url: e.target.value })}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-violet-500 outline-none"
                                            placeholder="https://github.com/..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Technologies (comma separated)</label>
                                        <input
                                            type="text"
                                            value={formData.technologies}
                                            onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-violet-500 outline-none"
                                            placeholder="React, Node.js, Tailwind..."
                                        />
                                    </div>
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
                                            <span>Save Project</span>
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

export default ProjectManager;
