import type { ChartConfig } from "@/components/ui/chart";

export interface DynamicChartProps {
  data?: any[];
  config?: ChartConfig;
  title?: string;
  description?: string;
  insightText?: string | null;
  insightSubText?: string | null;
  insightUp?: boolean;
  compact?: boolean;
  onViewCode?: () => void;
  categoryLabel?: string;
}
