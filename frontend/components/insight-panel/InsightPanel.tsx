'use client';

import { Lightbulb, TrendingUp, AlertTriangle, Link2, BookOpen, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import type { Insight } from '@/lib/types';

interface InsightPanelProps {
  insights: Insight[] | undefined;
  isLoading: boolean;
  error?: string | null;
  hideHeader?: boolean;
}

const INSIGHT_CONFIG: Record<
  Insight['type'],
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; label: string }
> = {
  trend: {
    icon: TrendingUp,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    label: 'Trend',
  },
  anomaly: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    label: 'Anomaly',
  },
  correlation: {
    icon: Link2,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    label: 'Correlation',
  },
  summary: {
    icon: BookOpen,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    label: 'Summary',
  },
  recommendation: {
    icon: Zap,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    label: 'Action',
  },
};

function InsightSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 rounded-xl border border-border/40 bg-card/40 p-4">
          <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const config = INSIGHT_CONFIG[insight.type] ?? INSIGHT_CONFIG.summary;
  const Icon = config.icon;

  return (
    <div className="group flex gap-3 rounded-xl border border-border/40 bg-card/40 p-4 transition-all duration-200 hover:border-border/70 hover:bg-card/60">
      <div className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-xl ${config.bg}`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground leading-tight">{insight.title}</p>
          <Badge
            variant="outline"
            className={`shrink-0 border-current/30 px-1.5 py-0 text-[10px] h-4 ${config.color}`}
          >
            {config.label}
          </Badge>
        </div>
        <div className="text-xs leading-relaxed text-muted-foreground">
          <ReactMarkdown
            components={{
              strong: ({ node, ...props }) => <span className="font-bold text-foreground" {...props} />,
              p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-1" {...props} />,
              li: ({ node, ...props }) => <li className="mb-0.5" {...props} />
            }}
          >
            {insight.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default function InsightPanel({ insights, isLoading, error, hideHeader }: InsightPanelProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      {!hideHeader && (
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15">
            <Lightbulb className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">AI Insights</h2>
            <p className="text-[11px] text-muted-foreground">Powered by Gemini</p>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="space-y-2 pr-3">
          {isLoading && <InsightSkeleton />}

          {error && !isLoading && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              <p className="font-medium">Failed to load insights</p>
              <p className="mt-1 text-xs text-red-400/80">{error}</p>
            </div>
          )}

          {!isLoading && !error && insights?.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}

          {!isLoading && !error && (!insights || insights.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Lightbulb className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No insights generated yet</p>
            </div>
          )}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
