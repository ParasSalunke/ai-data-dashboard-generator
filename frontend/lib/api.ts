import axios from 'axios';
import type {
  UploadResponse,
  AnalyzeResponse,
  InsightsResponse,
  AskResponse,
  PreviewResponse,
} from './types';

export const api = axios.create({
  // Bypass Next.js rewrites to avoid multipart/form-data body proxying issues
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 120_000, // 2 min for large CSV + AI processing
});

// Request interceptor for logging
api.interceptors.request.use((config) => {
  return config;
});

// Response interceptor for global error normalisation
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.detail ||
      err?.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export async function uploadCSV(
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<UploadResponse>('/upload', formData, {
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    },
  });
  return data;
}

export async function analyzeDataset(datasetId: string): Promise<AnalyzeResponse> {
  const { data } = await api.post<AnalyzeResponse>('/analyze', {
    dataset_id: datasetId,
  });
  return data;
}

export async function getInsights(datasetId: string): Promise<InsightsResponse> {
  const { data } = await api.post<InsightsResponse>('/insights', {
    dataset_id: datasetId,
  });
  return data;
}

export async function askQuestion(
  datasetId: string,
  question: string
): Promise<AskResponse> {
  const { data } = await api.post<AskResponse>('/ask', {
    dataset_id: datasetId,
    question,
  });
  return data;
}

export async function getPreview(datasetId: string): Promise<PreviewResponse> {
  const { data } = await api.post<PreviewResponse>('/preview', {
    dataset_id: datasetId,
  });
  return data;
}

export default api;
