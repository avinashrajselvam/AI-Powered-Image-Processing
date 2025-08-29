import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { Dashboard } from './components/Dashboard';
import { Loader } from './components/Loader';
import { analyzeImageWithGemini } from './services/geminiService';
import type { AnalyzedAsset } from './types';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  const [assets, setAssets] = useState<AnalyzedAsset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    const assetId = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const previewUrl = URL.createObjectURL(file);

    const placeholderAsset: AnalyzedAsset = {
      assetId,
      previewUrl,
      fileName: file.name,
      tags: [],
      engagementScore: 0,
      targetAudience: 'Analyzing...',
      aiSuggestions: { adCopy: [], captions: [], hashtags: [], editingIdeas: [] },
      complianceStatus: 'Pending',
      sentiment: 'Pending'
    };

    // Add placeholder to show immediate feedback
    setAssets(prev => [placeholderAsset, ...prev]);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        const analysisResult = await analyzeImageWithGemini(base64Data, file.type);
        
        const newAsset: AnalyzedAsset = {
          ...placeholderAsset,
          ...analysisResult
        };
        
        setAssets(prev => prev.map(asset => asset.assetId === assetId ? newAsset : asset));
      };
      reader.onerror = () => {
        throw new Error("Failed to read file.");
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during analysis.';
      setError(errorMessage);
      // Remove placeholder on error
      setAssets(prev => prev.filter(asset => asset.assetId !== assetId));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdateAsset = (assetId: string, newPreviewUrl: string) => {
    setAssets(prevAssets => 
      prevAssets.map(asset => 
        asset.assetId === assetId ? { ...asset, previewUrl: newPreviewUrl } : asset
      )
    );
  };


  return (
    <div className="min-h-screen bg-brand-secondary text-gray-100 font-sans flex flex-col">
      <header className="bg-black/30 backdrop-blur-sm border-b border-brand-primary/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <img 
                src="https://raw.githubusercontent.com/hereandnowai/images/refs/heads/main/logos/HNAI%20Title%20-Teal%20%26%20Golden%20Logo%20-%20DESIGN%203%20-%20Raj-07.png" 
                alt="HERE AND NOW AI Logo" 
                className="h-10"
              />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="mb-8 p-6 bg-black/20 rounded-2xl border border-brand-primary/20 shadow-lg">
          <h2 className="text-lg font-semibold mb-2 text-brand-primary">Upload Your Visual Asset</h2>
          <p className="text-gray-300 mb-4">
            Select an image to begin the AI-powered analysis. We'll generate tags, predict engagement, suggest marketing copy, and check for brand compliance.
          </p>
          <ImageUploader onImageUpload={handleImageUpload} disabled={isLoading} />
        </div>

        {isLoading && assets.some(a => a.complianceStatus === 'Pending') && (
            <div className="my-8 flex justify-center items-center space-x-4">
                <Loader />
                <span className="text-lg text-gray-200 animate-pulse">AI is analyzing your image...</span>
            </div>
        )}

        {error && (
          <div className="my-8 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-center">
            <p><strong>Analysis Failed:</strong> {error}</p>
          </div>
        )}

        <div className="bg-black/20 rounded-2xl border border-brand-primary/20 shadow-2xl overflow-hidden">
            <Dashboard assets={assets} onUpdateAsset={handleUpdateAsset} />
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default App;