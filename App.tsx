
import React, { useState } from 'react';
import { ImageItem, ToolMode } from './types';
import { geminiService } from './services/geminiService';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ImageCard from './components/ImageCard';
import { Trash2, Play, Download, Loader2, Scissors, ShieldAlert } from 'lucide-react';

const App: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<ToolMode>('logo');

  const MAX_IMAGES = 100;

  const handleFilesAdded = (newImages: Omit<ImageItem, 'mode'>[]) => {
    setImages(prev => {
      const currentTabImages = prev.filter(img => img.mode === activeTab);
      const spaceLeft = MAX_IMAGES - currentTabImages.length;
      
      if (spaceLeft <= 0) return prev;

      const newWithMode = newImages
        .slice(0, spaceLeft)
        .map(img => ({ ...img, mode: activeTab }));
        
      return [...prev, ...newWithMode];
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const processSingleImage = async (id: string) => {
    const image = images.find(img => img.id === id);
    if (!image || image.status === 'processing') return;

    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, status: 'processing', error: undefined } : img
    ));

    try {
      const resultUrl = await geminiService.processImage(image.base64, image.file.type, image.mode);
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, status: 'done', processedUrl: resultUrl } : img
      ));
    } catch (err: any) {
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, status: 'error', error: err.message } : img
      ));
    }
  };

  const processAll = async () => {
    if (isProcessingAll) return;
    setIsProcessingAll(true);

    const pendingImages = images.filter(img => img.status !== 'done' && img.mode === activeTab);
    
    for (const image of pendingImages) {
      await processSingleImage(image.id);
    }

    setIsProcessingAll(false);
  };

  const downloadAll = () => {
    images.filter(img => img.mode === activeTab).forEach(img => {
      if (img.processedUrl) {
        const link = document.createElement('a');
        link.href = img.processedUrl;
        link.download = `cleaned-${img.file.name}`;
        link.click();
      }
    });
  };

  const clearAll = () => {
    setImages(prev => prev.filter(img => img.mode !== activeTab));
  };

  const filteredImages = images.filter(img => img.mode === activeTab);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-1">Logo remover</h2>
          <p className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-4">
            A Masterpiece Crafted by Amr Ibrahem
          </p>
          
          <div className="flex justify-center mt-8 mb-8">
            <div className="inline-flex p-1 bg-slate-100 rounded-xl">
              <button 
                onClick={() => setActiveTab('logo')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'logo' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Scissors size={18} />
                Logo Remover
              </button>
              <button 
                onClick={() => setActiveTab('watermark')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'watermark' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <ShieldAlert size={18} />
                Watermark Remover
              </button>
            </div>
          </div>

          <p className="text-slate-600 max-w-2xl mx-auto">
            {activeTab === 'logo' 
              ? `Upload up to ${MAX_IMAGES} designs. Our AI will precisely remove logos while preserving every other pixel of your design.`
              : `Remove watermarks and patterns with surgical precision. Upload up to ${MAX_IMAGES} images for bulk processing.`}
          </p>
        </div>

        {filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <ImageUploader onImagesAdded={handleFilesAdded} />
            <p className="mt-4 text-slate-400 text-sm">Upload up to {MAX_IMAGES} images at once</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                  {filteredImages.length} / {MAX_IMAGES} Images
                </span>
                <button 
                  onClick={clearAll}
                  className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium"
                >
                  <Trash2 size={16} /> Clear Tab
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <ImageUploader onImagesAdded={handleFilesAdded} compact />
                
                {filteredImages.some(img => img.status === 'done') && (
                  <button 
                    onClick={downloadAll}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-semibold hover:bg-emerald-100 transition-colors border border-emerald-200"
                  >
                    <Download size={18} /> Download All
                  </button>
                )}

                <button 
                  onClick={processAll}
                  disabled={isProcessingAll || filteredImages.every(img => img.status === 'done')}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200"
                >
                  {isProcessingAll ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                  {isProcessingAll ? 'Processing...' : 'Process All'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImages.map((img) => (
                <ImageCard 
                  key={img.id} 
                  image={img} 
                  onRemove={() => removeImage(img.id)}
                  onProcess={() => processSingleImage(img.id)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Logo remover. Created with precision by Amr Ibrahem.
        </div>
      </footer>
    </div>
  );
};

export default App;
