
export interface AISuggestions {
  adCopy: string[];
  captions: string[];
  hashtags: string[];
  editingIdeas: string[];
}

export type ComplianceStatus = 'Compliant' | 'Review Needed' | 'Non-Compliant' | 'Pending';

export interface AnalyzedAsset {
  assetId: string;
  previewUrl: string;
  fileName: string;
  tags: string[];
  engagementScore: number;
  targetAudience: string;
  aiSuggestions: AISuggestions;
  complianceStatus: ComplianceStatus;
  sentiment: string;
}

export interface GeminiAnalysisResponse {
    tags: string[];
    engagementScore: number;
    targetAudience: string;
    aiSuggestions: AISuggestions;
    complianceStatus: ComplianceStatus;
    sentiment: string;
}
