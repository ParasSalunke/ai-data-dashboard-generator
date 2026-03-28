'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadCSV } from '@/lib/api';
import { useDashboardStore } from '@/lib/store';
import { Cloud, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FileUploadProps {
  onSuccess?: (datasetId: string) => void;
  className?: string;
}

type UploadState = 'idle' | 'dragging' | 'selected' | 'uploading' | 'success' | 'error';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({ onSuccess, className }: FileUploadProps) {
  const router = useRouter();
  const { setDatasetId, setColumns, setPreview, setRowCount } = useDashboardStore();

  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE_MB = 100;

  const validateFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return 'Only CSV files are supported. Please select a .csv file.';
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File is too large. Maximum size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setUploadState('error');
        return;
      }

      setSelectedFile(file);
      setError(null);
      setUploadState('uploading');
      setProgress(0);

      try {
        const response = await uploadCSV(file, (pct) => setProgress(pct));

        setDatasetId(response.dataset_id);
        setColumns(response.columns);
        setPreview(response.preview);
        setRowCount(response.row_count);

        setUploadState('success');
        setProgress(100);

        setTimeout(() => {
          if (onSuccess) {
            onSuccess(response.dataset_id);
          } else {
            router.push(`/dashboard?id=${response.dataset_id}`);
          }
        }, 600);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Upload failed. Please try again.';
        setError(message);
        setUploadState('error');
        setProgress(0);
      }
    },
    [router, setDatasetId, setColumns, setPreview, setRowCount, onSuccess]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadState('dragging');
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadState('idle');
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset input so same file can re-trigger
      e.target.value = '';
    },
    [handleFile]
  );

  const reset = () => {
    setUploadState('idle');
    setSelectedFile(null);
    setProgress(0);
    setError(null);
  };

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={onInputChange}
        id="csv-file-input"
      />

      {/* Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => uploadState === 'idle' || uploadState === 'error' ? inputRef.current?.click() : undefined}
        className={cn(
          'relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300',
          {
            'border-border/60 bg-card/40 hover:border-violet-500/60 hover:bg-violet-500/5 hover:scale-[1.01]':
              uploadState === 'idle',
            'border-violet-500 bg-violet-500/10 scale-[1.02]': uploadState === 'dragging',
            'cursor-default border-border/40 bg-card/20': uploadState === 'uploading',
            'border-emerald-500/60 bg-emerald-500/10': uploadState === 'success',
            'border-red-500/60 bg-red-500/10': uploadState === 'error',
          }
        )}
      >
        {/* Idle State */}
        {(uploadState === 'idle' || uploadState === 'dragging') && (
          <>
            <div
              className={cn(
                'mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300',
                uploadState === 'dragging'
                  ? 'bg-violet-500/30 scale-110'
                  : 'bg-violet-500/15'
              )}
            >
              <Cloud
                className={cn(
                  'h-8 w-8 transition-colors duration-300',
                  uploadState === 'dragging' ? 'text-violet-300' : 'text-violet-400'
                )}
              />
            </div>
            <p className="mb-2 text-lg font-semibold text-foreground">
              {uploadState === 'dragging' ? 'Drop your CSV here' : 'Drag & drop your CSV'}
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              or{' '}
              <span className="font-medium text-violet-400 underline underline-offset-2">
                browse to upload
              </span>
            </p>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1.5 border-border/60 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                CSV only
              </Badge>
              <Badge variant="outline" className="border-border/60 text-xs text-muted-foreground">
                Max 100MB
              </Badge>
            </div>
          </>
        )}

        {/* Uploading State */}
        {uploadState === 'uploading' && (
          <div className="w-full max-w-xs space-y-4">
            <div className="flex items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-500" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted-foreground truncate">{selectedFile?.name}</span>
                <span className="ml-2 font-medium text-violet-400">{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
                <div
                  className="h-full rounded-full bg-linear-to-r from-violet-500 to-sky-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {progress < 100 ? 'Uploading & analyzing…' : 'Processing data…'}
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {uploadState === 'success' && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="font-semibold text-emerald-400">Upload successful!</p>
            <p className="text-sm text-muted-foreground">Redirecting to dashboard…</p>
          </div>
        )}

        {/* Error State */}
        {uploadState === 'error' && (
          <div className="flex w-full flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <div className="space-y-1 text-center">
              <p className="font-semibold text-red-400">Upload failed</p>
              <p className="max-w-xs text-sm text-muted-foreground">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <X className="h-3.5 w-3.5" />
              Try again
            </Button>
          </div>
        )}
      </div>

      {/* File info row (after selection, before upload) */}
      {selectedFile && uploadState === 'uploading' && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-border/40 bg-card/40 px-4 py-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="truncate max-w-[200px]">{selectedFile.name}</span>
          </div>
          <span className="text-muted-foreground">{formatBytes(selectedFile.size)}</span>
        </div>
      )}
    </div>
  );
}
