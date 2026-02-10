import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const ImageUploader = ({ value, onChange, bucket = 'portfolio', folder = 'images' }) => {
    const [uploading, setUploading] = useState(false);

    const uploadImage = async (event) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${folder}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

            onChange(data.publicUrl);
            toast.success('Image uploaded successfully!');
        } catch (error) {
            toast.error('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        onChange('');
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-300 mb-2">
                Image Upload
            </label>

            {value ? (
                <div className="relative group rounded-xl overflow-hidden border-2 border-gray-600 bg-gray-800 w-full h-48 sm:w-64">
                    <img
                        src={value}
                        alt="Uploaded content"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 group-hover:opacity-100 opacity-0 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={removeImage}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            title="Remove image"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="border-2 border-dashed border-gray-600 rounded-xl bg-gray-800/50 hover:bg-gray-800 hover:border-violet-500 transition-all cursor-pointer h-48 sm:w-64 flex flex-col items-center justify-center relative">
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={uploadImage}
                        disabled={uploading}
                    />
                    {uploading ? (
                        <div className="flex flex-col items-center text-violet-400">
                            <Loader2 className="animate-spin mb-2" size={24} />
                            <span className="text-sm">Uploading...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-gray-400 group-hover:text-violet-400">
                            <Upload className="mb-2" size={24} />
                            <span className="text-sm font-medium">Click to upload image</span>
                            <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 2MB</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
