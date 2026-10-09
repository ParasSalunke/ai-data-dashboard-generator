'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo, useCallback, useRef } from 'react';
import { analyzeDataset, getInsights, getPreview } from '@/lib/api';
import { useDashboardStore } from '@/lib/store';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import InsightPanel from '@/components/insight-panel/InsightPanel';
import DataTable from '@/components/data-table/DataTable';
import AskPanel from '@/components/ask-panel/AskPanel';
import FilterBar from '@/components/filter-bar/FilterBar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  BarChart3, Lightbulb, Table2, MessageSquare,
  ArrowLeft, Database, Search, X, FileDown,
  PanelRightClose, PanelRightOpen,
  Rows3, Columns3, TrendingUp, Hash,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import type { ChartConfig } from '@/lib/types';
import ThemeToggleButton from '@/components/theme/ThemeToggleButton';

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
  const [sidebarTab, setSidebarTab] = useState('insights');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chartFilter, setChartFilter] = useState('all');
  const [chartSearch, setChartSearch] = useState('');
  const [exporting, setExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

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

  // Summary stats for overview cards
  const summaryStats = useMemo(() => {
    const stats = analysisQuery.data?.summary_stats ?? [];
    const numericCols = stats.filter((s) => s.dtype === 'numeric');
    const catCols = stats.filter((s) => s.dtype === 'categorical');
    const dateCols = stats.filter((s) => s.dtype === 'datetime');
    return { numericCols, catCols, dateCols, total: stats.length };
  }, [analysisQuery.data]);

  // PDF Export handler
  const handleExportPDF = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const { toPng } = await import('html-to-image');
      const { pdf } = await import('@react-pdf/renderer');
      const { DashboardReportPDF } = await import('@/components/pdf/DashboardReportPDF');

      const chartElements = document.querySelectorAll('.export-chart-card');
      const chartImages = [];

      for (const el of Array.from(chartElements)) {
        const id = el.getAttribute('data-chart-export-id');
        if (!id) continue;
        
        const chartConfig = charts.find(c => c.id === id);
        if (!chartConfig) continue;

        const dataUrl = await toPng(el as HTMLElement, {
            backgroundColor: '#09090b',
            pixelRatio: 2,
        });
        
        chartImages.push({
            id,
            title: chartConfig.title,
            dataUrl
        });
      }

      const doc = <DashboardReportPDF totalRows={totalRows} columns={columnData.length} chartsCount={charts.length} chartImages={chartImages} />;
      const asPdf = pdf();
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dashboard-report.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [exporting, totalRows, columnData.length, charts]);

  // Chart type counts for filter badges
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: charts.length };
    charts.forEach((c) => {
      counts[c.type] = (counts[c.type] ?? 0) + 1;
    });
    return counts;
  }, [charts]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">

      {/* ── Top Nav ──────────────────────────────────────────────────────── */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border/60 bg-card/60 px-3 backdrop-blur-sm sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="h-8 shrink-0 gap-1.5 px-2 text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Back</span>
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-5 shrink-0" />
          <div className="flex min-w-0 items-center gap-1.5">
            <BarChart3 className="h-4 w-4 shrink-0 text-violet-400" />
            <span className="truncate text-sm font-semibold text-foreground">Dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Dataset info — desktop only */}
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

          {/* Export PDF button */}
          {charts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={exporting}
              className="h-8 gap-1.5 text-xs border-border/60 hidden sm:flex"
            >
              <FileDown className="h-3.5 w-3.5" />
              {exporting ? 'Exporting…' : 'Export PDF'}
            </Button>
          )}

          <ThemeToggleButton />
          <UserButton />
        </div>
      </header>

      {/* ── Mobile dataset info strip ─────────────────────────────────────── */}
      {(totalRows > 0 || charts.length > 0) && (
        <div className="flex shrink-0 items-center gap-2 border-b border-border/40 bg-card/20 px-3 py-1.5 md:hidden">
          {totalRows > 0 && (
            <Badge variant="outline" className="gap-1 border-border/60 text-[10px] text-muted-foreground">
              <Database className="h-2.5 w-2.5" />
              {totalRows.toLocaleString()} rows · {columnData.length} cols
            </Badge>
          )}
          {charts.length > 0 && (
            <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-400">
              {charts.length} charts
            </Badge>
          )}
        </div>
      )}

      {/* ── Main layout ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-w-0 overflow-hidden">

        {/* Left — Main content (min-w-0 prevents flex child from overflowing) */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full min-h-0 flex-col">

            {/* Tab bar + optional filter row (stacked on mobile, side-by-side on sm+) */}
            <div className="shrink-0 border-b border-border/60 bg-card/40">
              {/* Top row: tabs always visible */}
              <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2">
                <TabsList className="h-8 shrink-0 bg-transparent p-0 gap-0.5">
                  <TabsTrigger value="charts" className="h-8 rounded-lg text-xs gap-1 px-2 sm:gap-1.5 sm:px-3">
                    <BarChart3 className="h-3.5 w-3.5 shrink-0" />
                    <span>Charts</span>
                    {charts.length > 0 && (
                      <Badge variant="secondary" className="ml-0.5 h-4 px-1.5 text-[10px]">
                        {filteredCharts.length}/{charts.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="data" className="h-8 rounded-lg text-xs gap-1 px-2 sm:gap-1.5 sm:px-3">
                    <Table2 className="h-3.5 w-3.5 shrink-0" />
                    <span>Data</span>
                  </TabsTrigger>
                  <TabsTrigger value="ask" className="h-8 rounded-lg text-xs gap-1 px-2 sm:gap-1.5 sm:px-3 md:hidden">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    <span>Ask</span>
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="h-8 rounded-lg text-xs gap-1 px-2 sm:gap-1.5 sm:px-3 md:hidden">
                    <Lightbulb className="h-3.5 w-3.5 shrink-0" />
                    <span>Insights</span>
                  </TabsTrigger>
                </TabsList>

                {/* Desktop search — only in charts tab, hidden on mobile (shown in separate row) */}
                {activeTab === 'charts' && charts.length > 0 && (
                  <div className="ml-auto hidden items-center gap-2 sm:flex">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search charts…"
                        value={chartSearch}
                        onChange={(e) => setChartSearch(e.target.value)}
                        className="h-7 w-36 pl-8 text-xs bg-card/60 border-border/60 md:w-40"
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
                  </div>
                )}
              </div>

              {/* Filter pills row — full-width horizontal scroll (both mobile + desktop) */}
              {activeTab === 'charts' && charts.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto border-t border-border/40 px-3 pb-1.5 pt-1 sm:px-4 [&::-webkit-scrollbar]:hidden">
                  {/* Mobile search input */}
                  <div className="relative shrink-0 sm:hidden">
                    <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search…"
                      value={chartSearch}
                      onChange={(e) => setChartSearch(e.target.value)}
                      className="h-6 w-24 pl-7 text-[11px] bg-card/60 border-border/60"
                    />
                    {chartSearch && (
                      <button
                        onClick={() => setChartSearch('')}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>

                  {/* Type filter pills */}
                  <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-border/60 bg-card/40 p-0.5">
                    {CHART_TYPE_OPTIONS.filter(
                      (o) => o.value === 'all' || (typeCounts[o.value] ?? 0) > 0
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setChartFilter(opt.value)}
                        className={`whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-medium transition-all ${chartFilter === opt.value
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

            {/* Tab content */}
            <div className="flex-1 min-h-0 overflow-hidden">

              {/* Charts tab — vertical scroll only */}
              <TabsContent value="charts" className="mt-0 h-full">
                <ScrollArea className="h-full">
                  <div ref={dashboardRef} className="p-4 space-y-4">
                    {/* Summary overview cards */}
                    {!analysisQuery.isLoading && totalRows > 0 && (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-xl border border-border/60 bg-card/60 p-3 backdrop-blur-sm">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Rows3 className="h-3.5 w-3.5" />
                            <span className="text-[11px] font-medium">Total Rows</span>
                          </div>
                          <p className="text-lg font-bold text-foreground">{totalRows.toLocaleString()}</p>
                        </div>
                        <div className="rounded-xl border border-border/60 bg-card/60 p-3 backdrop-blur-sm">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Columns3 className="h-3.5 w-3.5" />
                            <span className="text-[11px] font-medium">Columns</span>
                          </div>
                          <p className="text-lg font-bold text-foreground">{columnData.length}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {summaryStats.numericCols.length} numeric · {summaryStats.catCols.length} categorical
                          </p>
                        </div>
                        <div className="rounded-xl border border-border/60 bg-card/60 p-3 backdrop-blur-sm">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span className="text-[11px] font-medium">Charts</span>
                          </div>
                          <p className="text-lg font-bold text-foreground">{charts.length}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {new Set(charts.map(c => c.type)).size} types
                          </p>
                        </div>
                        <div className="rounded-xl border border-border/60 bg-card/60 p-3 backdrop-blur-sm">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Hash className="h-3.5 w-3.5" />
                            <span className="text-[11px] font-medium">Data Points</span>
                          </div>
                          <p className="text-lg font-bold text-foreground">
                            {charts.reduce((sum, c) => sum + (c.data?.length || 0), 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Column-level filters */}
                    {!analysisQuery.isLoading && columnData.length > 0 && (
                      <FilterBar columns={columnData} charts={charts} />
                    )}

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
                  </div>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </TabsContent>

              {/* Data tab — isolated scroll context so wide tables don't bleed into sidebar */}
              <TabsContent value="data" className="mt-0 h-full">
                <div className="h-full overflow-auto p-4">
                  <DataTable
                    data={previewData}
                    columns={columnData}
                    isLoading={analysisQuery.isLoading || previewQuery.isLoading}
                  />
                </div>
              </TabsContent>

              {/* Mobile-only tabs */}
              <TabsContent value="ask" className="mt-0 h-full md:hidden">
                <div className="h-[calc(100dvh-175px)] sm:h-[calc(100dvh-155px)]">
                  <AskPanel datasetId={datasetId} />
                </div>
              </TabsContent>
              <TabsContent value="insights" className="mt-0 h-full md:hidden">
                <div className="h-full overflow-auto p-4">
                  <InsightPanel
                    insights={insights}
                    isLoading={insightsQuery.isLoading}
                    error={insightsQuery.error ? (insightsQuery.error as Error).message : null}
                  />
                </div>
              </TabsContent>

            </div>
          </Tabs>
        </main>

        {/* ── Sidebar open button (visible when sidebar is closed) ──────── */}
        {!sidebarOpen && (
          <div className="hidden md:flex items-start pt-3 pr-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
              title="Open panel"
            >
              <PanelRightOpen className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* ── Right sidebar — desktop only ─────────────────────────────── */}
        <aside
          className={`hidden md:flex shrink-0 flex-col border-l border-border/60 bg-card/30 overflow-hidden transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-[360px] opacity-100' : 'w-0 opacity-0 border-l-0'
            }`}
        >
          <div className="flex h-full w-[360px] min-w-[360px] flex-col">
            <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="flex h-full flex-col gap-0">
              {/* Tab triggers + close button */}
              <div className="shrink-0 border-b border-border/60 bg-card/40 px-2 pt-2 pb-2">
                <div className="flex items-center gap-1.5">
                  <TabsList className="h-9 flex-1 bg-muted/50 p-0.5 rounded-lg">
                    <TabsTrigger
                      value="insights"
                      className="h-full flex-1 rounded-md text-xs font-medium gap-1.5 transition-all data-active:bg-violet-500/15 data-active:text-violet-400 data-active:shadow-sm"
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      AI Insights
                      {insights && insights.length > 0 && (
                        <Badge variant="secondary" className="ml-0.5 h-4 px-1.5 text-[10px]">
                          {insights.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="ask"
                      className="h-full flex-1 rounded-md text-xs font-medium gap-1.5 transition-all data-active:bg-sky-500/15 data-active:text-sky-400 data-active:shadow-sm"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Ask Your Data
                    </TabsTrigger>
                  </TabsList>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="h-8 w-8 shrink-0 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                    title="Close panel"
                  >
                    <PanelRightClose className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tab content — fills remaining height */}
              <TabsContent value="insights" className="mt-0 flex-1 min-h-0 overflow-hidden">
                <div className="flex h-full flex-col overflow-hidden p-4">
                  <InsightPanel
                    insights={insights}
                    isLoading={insightsQuery.isLoading}
                    error={insightsQuery.error ? (insightsQuery.error as Error).message : null}
                    hideHeader
                  />
                </div>
              </TabsContent>

              <TabsContent value="ask" className="mt-0 flex-1 min-h-0 overflow-hidden">
                <div className="flex h-full flex-col overflow-hidden p-4">
                  <AskPanel datasetId={datasetId} hideHeader />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </aside>
      </div>
    </div>
  );
}
