export interface ColumnInfo {
  name: string;
  dtype: 'numeric' | 'categorical' | 'datetime' | 'boolean' | 'unknown';
  null_count: number;
  null_pct: number;
  unique_count: number;
  sample_values: (string | number | null)[];
}

export interface UploadResponse {
  dataset_id: string;
  columns: ColumnInfo[];
  preview: Record<string, unknown>[];
  row_count: number;
  col_count: number;
  file_size_bytes: number;
  fileName?: string;
}

export interface PreviewResponse {
  dataset_id: string;
  columns: ColumnInfo[];
  preview: Record<string, unknown>[];
  row_count: number;
  col_count: number;
  fileName?: string;
}

export interface SummaryStats {
  column: string;
  dtype: string;
  mean?: number | null;
  median?: number | null;
  min?: number | null;
  max?: number | null;
  std?: number | null;
  percentile_25?: number | null;
  percentile_75?: number | null;
  top_values?: { value: string; count: number; pct: number }[];
  unique_count?: number;
  min_date?: string | null;
  max_date?: string | null;
  date_range_days?: number | null;
}

export type ChartType =
  | 'bar'
  | 'histogram'
  | 'line'
  | 'area'
  | 'timeseries'
  | 'scatter'
  | 'pie'
  | 'radar'
  | 'radialbar';

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  column: string;
  x_column?: string;
  y_columns?: string[];
  data: Record<string, string | number | null>[];
  options: {
    responsive: boolean;
    showLegend: boolean;
    showGrid: boolean;
    colors: string[];
    variant?: string;
  };
}

export interface Insight {
  title: string;
  content: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'summary' | 'recommendation';
}

export interface AnalyzeResponse {
  dataset_id: string;
  summary_stats: SummaryStats[];
  chart_suggestions: ChartConfig[];
}

export interface InsightsResponse {
  dataset_id: string;
  insights: Insight[];
}

export interface AskResponse {
  answer: string;
  chart?: ChartConfig | null;
}
