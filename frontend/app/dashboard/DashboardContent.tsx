'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { analyzeDataset, getInsights, getPreview } from '@/lib/api';
import { useDashboardStore } from '@/lib/store';
import DashboardGrid from '@/components/DashboardGrid';
import InsightPanel from '@/components/InsightPanel';
import DataTable from '@/components/DataTable';
import AskPanel from '@/components/AskPanel';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  BarChart3, Lightbulb, Table2, MessageSquare,
  ArrowLeft, Moon, Sun, Database, Search, X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import type { ChartConfig } from '@/lib/types';

const CHART_TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'area', label: 'Area' },
  { value: 'bar', label: 'Bar' },
  { value: 'histogram', label: 'Histogram' },
  { value: 'pie', label: 'Pie' },
  { value: 'radar', label: 'Radar' },
  { value: 'radialbar', label: 'Radial' },
  { value: 'scatter', label: 'Scatter' },
  { value: 'timeseries', label: 'Time Series' },
  { value: 'line', label: 'Line' },
];

export default function DashboardContent() {
  const params = useSearchParams();
  const { theme, setTheme } = useTheme();
  const paramId = params.get('id');

  const { datasetId: storeId, columns, preview, rowCount } = useDashboardStore();
  const datasetId = paramId || storeId;

  const [activeTab, setActiveTab] = useState('charts');
  const [chartFilter, setChartFilter] = useState('all');
  const [chartSearch, setChartSearch] = useState('');

  // Fetch analysis (charts + summary stats)
  const analysisQuery = useQuery({
    queryKey: ['analysis', datasetId],
    queryFn: () => analyzeDataset(datasetId!),
    enabled: !!datasetId,
    staleTime: Infinity,
  });

  // Fetch insights (depends on analysis completing)
  const insightsQuery = useQuery({
    queryKey: ['insights', datasetId],
    queryFn: () => getInsights(datasetId!),
    enabled: !!datasetId && analysisQuery.isSuccess,
    staleTime: Infinity,
  });

  // Fetch preview when store is empty (URL-based navigation)
  const previewQuery = useQuery({
    queryKey: ['preview', datasetId],
    queryFn: () => getPreview(datasetId!),
    enabled: !!datasetId && columns.length === 0,
    staleTime: Infinity,
  });

  // No dataset — show empty state
  if (!datasetId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
        <Database className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No dataset loaded</p>
        <Button asChild size="sm" variant="outline">
          <Link href="/">Upload a CSV to get started</Link>
        </Button>
      </div>
    );
  }

  const charts = analysisQuery.data?.chart_suggestions ?? [];
  const insights = insightsQuery.data?.insights;

  // Column + preview data: prefer Zustand store (set during upload), fall back to /preview endpoint
  const columnData = columns.length ? columns : (previewQuery.data?.columns ?? []);
  const previewData = preview.length ? preview : (previewQuery.data?.preview ?? []);
  const totalRows = rowCount || previewQuery.data?.row_count || 0;

  // Filter + search charts
  const filteredCharts = useMemo<ChartConfig[]>(() => {
    let result = charts;
    if (chartFilter !== 'all') {
      result = result.filter((c) => c.type === chartFilter);
    }
    if (chartSearch.trim()) {
      const q = chartSearch.toLowerCase();
      result = result.filter((c) => c.title.toLowerCase().includes(q) || c.column.toLowerCase().includes(q));
    }
    return result;
  }, [charts, chartFilter, chartSearch]);

  // Chart type counts for filter badges
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: charts.length };
    charts.forEach((c) => {
      counts[c.type] = (counts[c.type] ?? 0) + 1;
    });
    return counts;
  }, [charts]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">

      {/* ── Top Nav ──────────────────────────────────────────────────────── */}
      <header className="flex h-13 shrink-0 items-center justify-between border-b border-border/60 bg-card/60 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="h-8 gap-1.5 text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Back</span>
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-semibold text-foreground">Dashboard</span>
          </div>
        </div>

        {/* Dataset info */}
        <div className="hidden items-center gap-2 md:flex">
          {totalRows > 0 && (
            <Badge variant="outline" className="gap-1.5 border-border/60 text-xs text-muted-foreground">
              <Database className="h-3 w-3" />
              {totalRows.toLocaleString()} rows · {columnData.length} cols
            </Badge>
          )}
          {charts.length > 0 && (
            <Badge variant="outline" className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400">
              {charts.length} charts
            </Badge>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark'
            ? <Sun className="h-4 w-4 text-muted-foreground" />
            : <Moon className="h-4 w-4 text-muted-foreground" />
          }
        </Button>
      </header>

      {/* ── Main layout ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — Main content */}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full min-h-0 flex-col">

            {/* Tab bar */}
            <div className="flex items-center gap-3 border-b border-border/60 bg-card/40 px-4 py-2">
              <TabsList className="h-8 bg-transparent p-0 gap-0.5">
                <TabsTrigger value="charts" className="h-8 rounded-lg text-xs gap-1.5 px-3">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Charts
                  {charts.length > 0 && (
                    <Badge variant="secondary" className="ml-0.5 h-4 px-1.5 text-[10px]">
                      {filteredCharts.length}/{charts.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="data" className="h-8 rounded-lg text-xs gap-1.5 px-3">
                  <Table2 className="h-3.5 w-3.5" />
                  Data
                </TabsTrigger>
                <TabsTrigger value="ask" className="h-8 rounded-lg text-xs gap-1.5 px-3 md:hidden">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Ask
                </TabsTrigger>
                <TabsTrigger value="insights" className="h-8 rounded-lg text-xs gap-1.5 px-3 md:hidden">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Insights
                </TabsTrigger>
              </TabsList>

              {/* FilterBar — only visible in charts tab */}
              {activeTab === 'charts' && charts.length > 0 && (
                <div className="ml-auto flex items-center gap-2">
                  {/* Search */}
                  <div className="relative hidden sm:block">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search charts…"
                      value={chartSearch}
                      onChange={(e) => setChartSearch(e.target.value)}
                      className="h-7 w-40 pl-8 text-xs bg-card/60 border-border/60"
                    />
                    {chartSearch && (
                      <button
                        onClick={() => setChartSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Type filter pills */}
                  <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-card/40 p-0.5">
                    {CHART_TYPE_OPTIONS.filter(
                      (o) => o.value === 'all' || (typeCounts[o.value] ?? 0) > 0
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setChartFilter(opt.value)}
                        className={`rounded px-2 py-0.5 text-[11px] font-medium transition-all ${
                          chartFilter === opt.value
                            ? 'bg-violet-500/20 text-violet-300'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {opt.label}
                        {typeCounts[opt.value] ? (
                          <span className="ml-0.5 text-[10px] opacity-60">
                            {typeCounts[opt.value]}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tab content — shadcn ScrollArea for styled themed scrollbar */}
            <ScrollArea className="h-full flex-1 overflow-hidden">
              <div className="p-4">
                <TabsContent value="charts" className="mt-0">
                  <DashboardGrid
                    charts={filteredCharts}
                    isLoading={analysisQuery.isLoading}
                  />
                  {analysisQuery.error && (
                    <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                      Failed to analyze dataset: {(analysisQuery.error as Error).message}
                    </div>
                  )}
                  {!analysisQuery.isLoading && filteredCharts.length === 0 && charts.length > 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Search className="mb-3 h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No charts match your filter</p>
                      <button
                        onClick={() => { setChartFilter('all'); setChartSearch(''); }}
                        className="mt-2 text-xs text-violet-400 hover:underline"
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="data" className="mt-0">
                  <DataTable
                    data={previewData}
                    columns={columnData}
                    isLoading={analysisQuery.isLoading || previewQuery.isLoading}
                  />
                </TabsContent>

                {/* Mobile-only tabs */}
                <TabsContent value="ask" className="mt-0 md:hidden">
                  <div className="h-[calc(100vh-140px)]">
                    <AskPanel datasetId={datasetId} />
                  </div>
                </TabsContent>
                <TabsContent value="insights" className="mt-0 md:hidden">
                  <InsightPanel
                    insights={insights}
                    isLoading={insightsQuery.isLoading}
                    error={insightsQuery.error ? (insightsQuery.error as Error).message : null}
                  />
                </TabsContent>
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </Tabs>
        </main>

        {/* ── Right sidebar — desktop only ─────────────────────────────── */}
        <aside className="hidden md:flex w-[340px] shrink-0 flex-col gap-0 border-l border-border/60 bg-card/30 overflow-hidden">
          {/* AI Insights — flex-1 + min-h-0 so ScrollArea can scroll properly */}
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden p-4">
            <InsightPanel
              insights={insights}
              isLoading={insightsQuery.isLoading}
              error={insightsQuery.error ? (insightsQuery.error as Error).message : null}
            />
          </div>

          <Separator className="shrink-0" />

          {/* Ask panel */}
          <div className="flex h-[300px] min-h-0 shrink-0 flex-col p-4">
            <AskPanel datasetId={datasetId} />
          </div>
        </aside>
      </div>
    </div>
  );
}
