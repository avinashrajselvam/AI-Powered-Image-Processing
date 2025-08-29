import React, { useState, useEffect, useRef } from 'react';
import type { AnalyzedAsset } from '../types';
import { Loader } from './Loader';
import { CloseIcon } from './icons/CloseIcon';
import { BrightnessIcon } from './icons/BrightnessIcon';
import { ContrastIcon } from './icons/ContrastIcon';
import { removeImageBackground } from '../services/geminiService';

interface ImageEditModalProps {
  asset: AnalyzedAsset;
  isOpen: boolean;
  onClose: () => void;
  onApply: (assetId: string, newPreviewUrl: string) => void;
}

// Helper to convert data URL to blob
const dataURLToBlob = (dataURL: string) => {
    const arr = dataURL.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
      throw new Error("Invalid data URL format");
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

// Helper to get base64 from object URL (like asset.previewUrl)
const getBase64FromUrl = async (url: string): Promise<{ base64: string; mimeType: string }> => {
    const response = await fetch(url);
    const blob = await response.blob();
    const mimeType = blob.type;
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64Data = (reader.result as string).split(',')[1];
            resolve({ base64: base64Data, mimeType });
        };
        reader.onerror = error => reject(error);
    });
};


export const ImageEditModal: React.FC<ImageEditModalProps> = ({ asset, isOpen, onClose, onApply }) => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens for a new asset
      setBrightness(100);
      setContrast(100);
      setEditedImageUrl(asset.previewUrl);
      setError(null);
    }
  }, [isOpen, asset]);

  const handleBackgroundRemove = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const { base64, mimeType } = await getBase64FromUrl(asset.previewUrl);
        const newImageUrl = await removeImageBackground(base64, mimeType);
        setEditedImageUrl(newImageUrl);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (isLoading) return;
    
    // If only brightness/contrast changed, we need to use canvas
    if (brightness !== 100 || contrast !== 100) {
        const image = imageRef.current;
        const canvas = canvasRef.current;
        if (image && canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
                ctx.drawImage(image, 0, 0);
                const dataUrl = canvas.toDataURL();
                onApply(asset.assetId, dataUrl);
                return;
            }
        }
    }
    
    // If background was removed or no changes were made
    if (editedImageUrl) {
        onApply(asset.assetId, editedImageUrl);
    }
  };

  if (!isOpen) {
    return null;
  }

  const imageStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
  };

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
    >
      <div 
        className="bg-brand-secondary rounded-2xl border border-brand-primary/30 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-brand-primary/20">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-100">Edit Asset: <span className="text-brand-primary">{asset.fileName}</span></h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="flex-grow p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex items-center justify-center bg-black/20 rounded-lg p-4">
             {isLoading ? (
                <div className="flex flex-col items-center justify-center text-center">
                    <Loader />
                    <p className="mt-4 text-gray-300 animate-pulse">AI is working its magic...</p>
                    <p className="text-sm text-gray-500">Removing background can take a moment.</p>
                </div>
             ) : (
                <img ref={imageRef} src={editedImageUrl || asset.previewUrl} crossOrigin="anonymous" alt="Asset preview" className="max-w-full max-h-[60vh] object-contain" style={imageStyle}/>
             )}
          </div>

          <aside className="md:col-span-1 space-y-6">
            <h3 className="text-md font-semibold text-gray-200 border-b border-brand-primary/20 pb-2">Editing Tools</h3>
            
            {error && <div className="p-3 bg-red-900/50 text-red-200 border border-red-500/50 rounded-md text-sm">{error}</div>}

            <div className="space-y-4">
                {/* Brightness */}
                <div>
                    <label htmlFor="brightness" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <BrightnessIcon className="w-5 h-5 mr-2 text-brand-primary" />
                        Brightness
                        <span className="ml-auto text-xs font-mono text-gray-400">{brightness}%</span>
                    </label>
                    <input 
                        id="brightness" 
                        type="range" 
                        min="50" 
                        max="150" 
                        value={brightness} 
                        onChange={e => setBrightness(parseInt(e.target.value, 10))} 
                        className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                        title="Adjust the overall lightness or darkness of the image."
                    />
                </div>
                {/* Contrast */}
                <div>
                    <label htmlFor="contrast" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <ContrastIcon className="w-5 h-5 mr-2 text-brand-primary" />
                        Contrast
                        <span className="ml-auto text-xs font-mono text-gray-400">{contrast}%</span>
                    </label>
                    <input 
                        id="contrast" 
                        type="range" 
                        min="50" 
                        max="150" 
                        value={contrast} 
                        onChange={e => setContrast(parseInt(e.target.value, 10))} 
                        className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                        title="Adjust the difference between light and dark areas."
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-brand-primary/20">
                 <button 
                    onClick={handleBackgroundRemove} 
                    disabled={isLoading}
                    className="w-full text-center px-4 py-2 border border-brand-primary/50 text-brand-primary rounded-lg hover:bg-brand-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                   {isLoading ? 'Processing...' : 'Remove Background with AI'}
                </button>
            </div>
          </aside>
        </main>
        
        <footer className="flex justify-end p-4 border-t border-brand-primary/20 bg-black/20 space-x-3 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 rounded-md hover:bg-white/10 transition-colors">Cancel</button>
          <button onClick={handleApply} disabled={isLoading} className="px-6 py-2 text-sm font-medium bg-brand-primary text-brand-secondary rounded-md hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Apply Changes
          </button>
        </footer>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};