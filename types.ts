
export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error';
export type ToolMode = 'logo' | 'watermark';

export interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
  processedUrl?: string;
  status: ProcessingStatus;
  error?: string;
  mode: ToolMode;
}

export interface GeminiResponse {
  imageUrl?: string;
  text?: string;
  error?: string;
}
