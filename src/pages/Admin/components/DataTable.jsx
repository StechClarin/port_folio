import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';

const DataTable = ({ columns, data, onEdit, onDelete, onView }) => {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
                <p className="text-gray-400">No entries found.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
            <table className="w-full text-left">
                <thead className="bg-gray-700/50 text-gray-300 uppercase text-xs font-semibold tracking-wider">
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} className="px-6 py-4">
                                {col.header}
                            </th>
                        ))}
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {data.map((item) => (
                        <tr
                            key={item.id}
                            className="hover:bg-gray-700/30 transition-colors duration-200"
                        >
                            {columns.map((col, index) => (
                                <td key={index} className="px-6 py-4 text-gray-300 text-sm">
                                    {col.render ? col.render(item) : item[col.accessor]}
                                </td>
                            ))}
                            <td className="px-6 py-4 text-right space-x-2">
                                {onView && (
                                    <button
                                        onClick={() => onView(item)}
                                        className="text-blue-400 hover:text-blue-300 transition-colors bg-gray-700 p-2 rounded-lg hover:bg-gray-600"
                                        title="View details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                )}
                                {onEdit && (
                                    <button
                                        onClick={() => onEdit(item)}
                                        className="text-amber-400 hover:text-amber-300 transition-colors bg-gray-700 p-2 rounded-lg hover:bg-gray-600"
                                        title="Edit"
                                    >
                                        <Edit size={16} />
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="text-red-400 hover:text-red-300 transition-colors bg-gray-700 p-2 rounded-lg hover:bg-gray-600"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
