import React, { useState } from 'react';
import type { AnalyzedAsset, ComplianceStatus, AISuggestions } from '../types';
import { ImageEditModal } from './ImageEditModal';


interface DashboardProps {
  assets: AnalyzedAsset[];
  onUpdateAsset: (assetId: string, newPreviewUrl: string) => void;
}

const ComplianceBadge: React.FC<{ status: ComplianceStatus }> = ({ status }) => {
  const baseClasses = 'px-3 py-1 text-xs font-semibold rounded-full inline-block';
  let colorClasses = '';

  switch (status) {
    case 'Compliant':
      colorClasses = 'bg-green-500/20 text-green-200';
      break;
    case 'Review Needed':
      colorClasses = 'bg-yellow-500/20 text-yellow-200';
      break;
    case 'Non-Compliant':
      colorClasses = 'bg-red-500/20 text-red-200';
      break;
    case 'Pending':
      colorClasses = 'bg-gray-500/20 text-gray-300 animate-pulse';
      break;
  }

  return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};

const ExpandableSuggestions: React.FC<{ suggestions: AISuggestions, onEditClick: () => void }> = ({ suggestions, onEditClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const { adCopy, captions, hashtags, editingIdeas } = suggestions;
    const totalCount = adCopy.length + captions.length + hashtags.length + editingIdeas.length;

    if (totalCount === 0) {
        return <span className="text-gray-500">...</span>;
    }

    const isCollapsible = totalCount > 3;

    const renderFullList = () => (
        <div className="space-y-3">
            {(adCopy.length > 0 || captions.length > 0) && (
                <div>
                    <strong className="text-gray-300 block mb-1 text-xs uppercase tracking-wider">Creative Copy</strong>
                    {adCopy.length > 0 && (
                        <div className="mb-2">
                            <strong className="text-gray-200 text-sm">Ad Copy:</strong>
                            <ul className="list-disc list-inside pl-3 mt-0.5 space-y-0.5 text-gray-400">
                                {adCopy.map((item, i) => <li key={`ad-${i}`}>{item}</li>)}
                            </ul>
                        </div>
                    )}
                    {captions.length > 0 && (
                        <div>
                            <strong className="text-gray-200 text-sm">Captions:</strong>
                            <ul className="list-disc list-inside pl-3 mt-0.5 space-y-0.5 text-gray-400">
                                {captions.map((item, i) => <li key={`cap-${i}`}>{item}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
    
            {(editingIdeas.length > 0 || hashtags.length > 0) && (
                <div className="pt-2 mt-2 border-t border-brand-primary/10">
                    <strong className="text-gray-300 block mb-1 text-xs uppercase tracking-wider">Enhancements</strong>
                    {editingIdeas.length > 0 && (
                         <div className="mb-2">
                            <strong className="text-gray-200 text-sm">Editing Ideas:</strong>
                            <ul className="list-disc list-inside pl-3 mt-0.5 space-y-1 text-gray-400">
                                {editingIdeas.map((item, i) => (
                                    <li key={`edit-${i}`}>
                                        <button onClick={onEditClick} className="text-left text-brand-primary hover:underline focus:outline-none focus:ring-2 focus:ring-brand-primary/50 rounded-sm">
                                            {item}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {hashtags.length > 0 && (
                        <div>
                            <strong className="text-gray-200 text-sm">Hashtags:</strong>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                                {hashtags.map((tag, i) => (
                                    <span key={`hash-${i}`} className="px-2 py-0.5 text-xs rounded bg-brand-primary/20 text-brand-primary">#{tag.replace(/^#/, '')}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderCollapsedList = () => (
        <ul className="list-disc list-inside space-y-1">
            {adCopy.slice(0, 1).map((s, i) => <li key={`ac-${i}`}><strong className="text-gray-200">Ad Copy:</strong> {s}</li>)}
            {captions.slice(0, 1).map((s, i) => <li key={`cap-${i}`}><strong className="text-gray-200">Caption:</strong> {s}</li>)}
            {editingIdeas.slice(0, 1).map((s, i) => <li key={`ed-${i}`}><strong className="text-gray-200">Edit Idea:</strong> <button onClick={onEditClick} className="text-left text-brand-primary hover:underline focus:outline-none focus:ring-2 focus:ring-brand-primary/50 rounded-sm">{s}</button></li>)}
        </ul>
    );

    return (
        <div className="text-xs">
            {isCollapsible && !isExpanded ? renderCollapsedList() : renderFullList()}
            {isCollapsible && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-3 text-brand-primary hover:text-yellow-300 font-semibold transition-colors"
                    aria-expanded={isExpanded}
                >
                    {isExpanded ? 'Show less' : `Show all ${totalCount} suggestions...`}
                </button>
            )}
        </div>
    );
};


export const Dashboard: React.FC<DashboardProps> = ({ assets, onUpdateAsset }) => {
  const [editingAsset, setEditingAsset] = useState<AnalyzedAsset | null>(null);

  const handleApplyEdits = (assetId: string, newPreviewUrl: string) => {
    onUpdateAsset(assetId, newPreviewUrl);
    setEditingAsset(null);
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <h3 className="text-xl font-semibold text-gray-200">No Assets Analyzed Yet</h3>
        <p className="text-gray-400 mt-2">Upload an image to see the AI-powered analysis here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-brand-primary/20">
          <thead className="bg-black/20">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-200 sm:pl-6">Asset</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200">Tags</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200">Insights</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200">AI Suggestions</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200 sm:pr-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-primary/20 bg-brand-secondary">
            {assets.map((asset) => (
              <tr key={asset.assetId} className="hover:bg-black/20 transition-colors">
                <td className="w-1/4 py-4 pl-4 pr-3 text-sm sm:pl-6 align-top">
                  <div className="flex items-start">
                    <div className="h-20 w-20 flex-shrink-0">
                      <img className="h-20 w-20 rounded-md object-cover" src={asset.previewUrl} alt={asset.fileName} />
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-50 truncate" title={asset.fileName}>{asset.fileName}</div>
                      <div className="text-gray-400 text-xs">{asset.assetId}</div>
                    </div>
                  </div>
                </td>
                <td className="w-1/4 px-3 py-4 text-sm text-gray-300 align-top">
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.length > 0 ? asset.tags.slice(0, 5).map(tag => (
                      <span key={tag} className="px-2 py-0.5 text-xs rounded bg-brand-primary/20 text-brand-primary">{tag}</span>
                    )) : <span className="text-gray-500">...</span>}
                  </div>
                </td>
                <td className="w-1/4 px-3 py-4 text-sm text-gray-300 align-top">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-200 w-28">Eng. Score:</span>
                      <div className="w-full bg-black/20 rounded-full h-2.5">
                        <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${asset.engagementScore}%` }}></div>
                      </div>
                      <span className="ml-2 font-mono text-brand-primary text-xs">{asset.engagementScore}</span>
                    </div>
                    <div className="flex"><span className="font-semibold text-gray-200 w-28 shrink-0">Audience:</span> <span>{asset.targetAudience}</span></div>
                    <div className="flex"><span className="font-semibold text-gray-200 w-28 shrink-0">Sentiment:</span> <span>{asset.sentiment}</span></div>
                  </div>
                </td>
                <td className="w-1/4 px-3 py-4 text-sm text-gray-300 align-top">
                  <ExpandableSuggestions 
                    suggestions={asset.aiSuggestions} 
                    onEditClick={() => setEditingAsset(asset)}
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-200 sm:pr-6 align-top">
                  <ComplianceBadge status={asset.complianceStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingAsset && (
        <ImageEditModal 
          asset={editingAsset}
          isOpen={!!editingAsset}
          onClose={() => setEditingAsset(null)}
          onApply={handleApplyEdits}
        />
      )}
    </>
  );
};