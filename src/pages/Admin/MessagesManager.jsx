import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DataTable from './components/DataTable';
import { Mail, CheckCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MessagesManager = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            toast.error('Error fetching messages');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (message) => {
        setSelectedMessage(message);
        if (!message.is_read) {
            try {
                const { error } = await supabase
                    .from('messages')
                    .update({ is_read: true })
                    .eq('id', message.id);

                if (error) throw error;

                // Update local state without refetching
                setMessages(prev => prev.map(m =>
                    m.id === message.id ? { ...m, is_read: true } : m
                ));
            } catch (error) {
                console.error("Error marking as read:", error);
            }
        }
    };

    const confirmDelete = (id) => {
        setMessageToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!messageToDelete) return;
        try {
            const { error } = await supabase.from('messages').delete().eq('id', messageToDelete);
            if (error) throw error;
            toast.success('Message deleted');
            setMessages(prev => prev.filter(m => m.id !== messageToDelete));
            setIsDeleteModalOpen(false);
            if (selectedMessage?.id === messageToDelete) setSelectedMessage(null);
        } catch (error) {
            console.error(error);
            toast.error('Error deleting message');
        }
    };

    const columns = [
        {
            header: 'Status',
            accessor: 'is_read',
            render: (item) => item.is_read ?
                <span className="flex items-center text-green-400 text-xs uppercase font-bold tracking-wider"><CheckCircle size={14} className="mr-1" /> Read</span> :
                <span className="flex items-center text-violet-400 text-xs uppercase font-bold tracking-wider animate-pulse"><Mail size={14} className="mr-1" /> New</span>
        },
        { header: 'From', accessor: 'name', render: (item) => <span className={`font-medium ${!item.is_read ? 'text-white' : 'text-gray-400'}`}>{item.name}</span> },
        { header: 'Subject', accessor: 'subject', render: (item) => <span className={`${!item.is_read ? 'text-white font-medium' : 'text-gray-400'}`}>{item.subject || 'No Subject'}</span> },
        {
            header: 'Date',
            accessor: 'created_at',
            render: (item) => <span className="text-gray-400 text-sm">{new Date(item.created_at).toLocaleDateString()}</span>
        },
    ];

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center">
                <Mail className="mr-3 text-violet-500" /> Inbox
            </h1>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden shadow-xl">
                <DataTable
                    columns={columns}
                    data={messages}
                    onDelete={confirmDelete}
                    onEdit={null}
                    onView={handleView}
                    customActionName="Read"
                />
            </div>

            {/* Message Detail Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-gray-900 rounded-2xl w-full max-w-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-800 flex justify-between items-start bg-gray-800/50">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">{selectedMessage.subject || 'No Subject'}</h2>
                                <div className="flex items-center text-sm text-gray-400 space-x-4">
                                    <span className="font-medium text-violet-400">{selectedMessage.name}</span>
                                    <span>&lt;{selectedMessage.email}&gt;</span>
                                    <span>•</span>
                                    <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="text-gray-400 hover:text-white hover:bg-gray-700/50 p-2 rounded-lg transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 overflow-y-auto bg-gray-900 leading-relaxed text-gray-300 whitespace-pre-wrap font-light text-lg">
                            {selectedMessage.content}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-800 bg-gray-800/30 flex justify-between items-center">
                            <a href={`mailto:${selectedMessage.email}`} className="text-violet-400 hover:text-violet-300 font-medium flex items-center transition-colors">
                                <Mail size={18} className="mr-2" /> Reply via Email
                            </a>
                            <button
                                onClick={() => {
                                    confirmDelete(selectedMessage.id);
                                }}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors flex items-center"
                            >
                                <Trash2 size={18} className="mr-2" /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-gray-800 rounded-xl max-w-sm w-full border border-gray-700 p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-2">Confirm Deletion</h3>
                        <p className="text-gray-400 mb-6">Are you sure you want to permanently delete this message? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg shadow-red-900/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagesManager;
