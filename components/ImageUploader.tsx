
import React, { useRef } from 'react';
import { Upload, Plus } from 'lucide-react';
import { ImageItem } from '../types';

interface Props {
  onImagesAdded: (images: Omit<ImageItem, 'mode'>[]) => void;
  compact?: boolean;
}

const ImageUploader: React.FC<Props> = ({ onImagesAdded, compact }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: Omit<ImageItem, 'mode'>[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        const base64 = await fileToBase64(file);
        newImages.push({
          id: Math.random().toString(36).substring(7),
          file,
          previewUrl: URL.createObjectURL(file),
          base64,
          status: 'idle'
        });
      } catch (err) {
        console.error("Error reading file:", err);
      }
    }

    onImagesAdded(newImages);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (compact) {
    return (
      <>
        <input 
          type="file" 
          ref={inputRef}
          onChange={handleFileChange}
          multiple 
          accept="image/*" 
          className="hidden" 
        />
        <button 
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
        >
          <Plus size={18} /> Add More
        </button>
      </>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <input 
        type="file" 
        ref={inputRef}
        onChange={handleFileChange}
        multiple 
        accept="image/*" 
        className="hidden" 
      />
      <button 
        onClick={() => inputRef.current?.click()}
        className="group relative flex flex-col items-center gap-4 transition-all"
      >
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
          <Upload size={32} />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900">Click to upload up to 100 images</p>
          <p className="text-sm text-slate-500">Supports PNG, JPG, WEBP</p>
        </div>
      </button>
    </div>
  );
};

export default ImageUploader;
