import axios from 'axios';
import { auth } from './firebase';
import type {
  UploadResponse,
  AnalyzeResponse,
  InsightsResponse,
  AskResponse,
  PreviewResponse,
} from './types';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    // If running in browser on production, always use same-origin relative URLs
    if (!isLocal) {
      return '';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || '';
};

export const api = axios.create({
  // Use relative path on production to avoid localhost / cross-origin issues
  baseURL: getBaseURL(),
  timeout: 120_000, // 2 min for large CSV + AI processing
});

// Request interceptor to attach Firebase Auth token securely
api.interceptors.request.use(async (config) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('Failed to attach auth token to request:', err);
  }
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
