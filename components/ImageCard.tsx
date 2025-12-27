
import React from 'react';
import { ImageItem } from '../types';
import { X, Loader2, CheckCircle2, AlertCircle, Download, RefreshCcw, Scissors, ShieldAlert } from 'lucide-react';

interface Props {
  image: ImageItem;
  onRemove: () => void;
  onProcess: () => void;
}

const ImageCard: React.FC<Props> = ({ image, onRemove, onProcess }) => {
  const isDone = image.status === 'done';
  const isError = image.status === 'error';
  const isProcessing = image.status === 'processing';

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:shadow-lg transition-all relative">
      {/* Remove Button */}
      <button 
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-sm"
        disabled={isProcessing}
      >
        <X size={16} />
      </button>

      {/* Image Preview Container */}
      <div className="relative aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
        {isDone && image.processedUrl ? (
          <img 
            src={image.processedUrl} 
            alt="Processed" 
            className="w-full h-full object-contain"
          />
        ) : (
          <img 
            src={image.previewUrl} 
            alt="Original" 
            className={`w-full h-full object-contain ${isProcessing ? 'blur-[2px] opacity-70' : ''}`}
          />
        )}

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px]">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-2" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Processing</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute bottom-2 right-2">
          {isDone && (
            <div className="flex items-center gap-1 bg-emerald-500 text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase shadow-sm">
              <CheckCircle2 size={12} /> Ready
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase shadow-sm">
              <AlertCircle size={12} /> Failed
            </div>
          )}
        </div>
      </div>

      {/* Info & Actions */}
      <div className="p-4 bg-white">
        <div className="flex flex-col gap-1 mb-3">
          <p className="text-sm font-semibold text-slate-900 truncate" title={image.file.name}>
            {image.file.name}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {(image.file.size / 1024).toFixed(1)} KB • {image.file.type.split('/')[1].toUpperCase()}
            </p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
              image.mode === 'logo' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
            }`}>
              {image.mode}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {isDone ? (
            <a 
              href={image.processedUrl} 
              download={`cleaned-${image.file.name}`}
              className="flex-grow flex items-center justify-center gap-2 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-100"
            >
              <Download size={16} /> Download
            </a>
          ) : (
            <button 
              onClick={onProcess}
              disabled={isProcessing}
              className="flex-grow flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm shadow-blue-100"
            >
              {isError ? (
                <><RefreshCcw size={16} /> Retry</>
              ) : (
                <>
                  {image.mode === 'logo' ? <Scissors size={16} /> : <ShieldAlert size={16} />}
                  Remove {image.mode === 'logo' ? 'Logo' : 'Watermark'}
                </>
              )}
            </button>
          )}
        </div>
        
        {isError && (
          <p className="mt-2 text-[10px] text-red-500 font-medium text-center italic">
            {image.error || 'Connection failed'}
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageCard;
