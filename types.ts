
export interface ImageHistoryItem {
  id: string;
  originalUrl: string;
  previewUrl: string;
  timestamp: number;
  tags?: string[];
  aiAnalysis?: string;
}

export interface GeminiAnalysisResponse {
  description: string;
  tags: string[];
  suggestedPrompts: string[];
}
