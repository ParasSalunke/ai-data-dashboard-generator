'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ColumnInfo } from '@/lib/types';

const DTYPE_BADGE: Record<string, string> = {
  numeric:     'bg-sky-500/10 text-sky-400 border-sky-500/25',
  categorical: 'bg-violet-500/10 text-violet-400 border-violet-500/25',
  datetime:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  boolean:     'bg-amber-500/10 text-amber-400 border-amber-500/25',
  unknown:     'bg-zinc-500/10 text-zinc-400 border-zinc-500/25',
};

function CellValue({ value, dtype }: { value: unknown; dtype: string }) {
  if (value == null) return <span className="text-muted-foreground/40 italic text-xs">—</span>;
  const str = String(value);

  if (dtype === 'numeric') {
    const num = Number(value);
    const isNeg = !isNaN(num) && num < 0;
    return (
      <span className={`font-mono font-medium tabular-nums ${isNeg ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
        {isNaN(num) ? str : num.toLocaleString()}
      </span>
    );
  }
  if (dtype === 'boolean') {
    const isTrue = ['true', '1', 'y', 'yes'].includes(str.toLowerCase());
    return <span className={`font-medium ${isTrue ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>{str}</span>;
  }
  if (dtype === 'datetime') {
    return <span className="text-sky-600 dark:text-sky-400 text-xs font-mono">{str}</span>;
  }
  return <span className="text-foreground">{str}</span>;
}

interface DataTableProps {
  data: Record<string, unknown>[] | undefined;
  columns: ColumnInfo[];
  isLoading: boolean;
}

export default function DataTable({ data, columns, isLoading }: DataTableProps) {

  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  /* ── Loading skeleton ─────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-10 w-full rounded-none" />
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-none border-t border-border" style={{ opacity: 0.8 - i * 0.08 }} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Empty state ──────────────────────────────────────────────── */
  if (!data?.length || !columns.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground rounded-xl border border-border bg-card">
        <svg className="h-10 w-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18M10 3v18M14 3v18" />
        </svg>
        <span className="text-sm">No data to display</span>
      </div>
    );
  }

  /* ── Filter ───────────────────────────────────────────────────── */
  let filtered = data;
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = data.filter((row) =>
      Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }

  /* ── Sort ─────────────────────────────────────────────────────── */
  if (sortCol) {
    filtered = [...filtered].sort((a, b) => {
      const av = a[sortCol];
      const bv = b[sortCol];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sortAsc ? cmp : -cmp;
    });
  }

  /* ── Pagination ───────────────────────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);
  const startRow = filtered.length > 0 ? safePage * pageSize + 1 : 0;
  const endRow = Math.min((safePage + 1) * pageSize, filtered.length);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortAsc((prev) => !prev);
    else { setSortCol(col); setSortAsc(true); }
  };

  /* Smart page pill list: first, window around current, last, with ellipsis */
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i);
    const pages: (number | 'ellipsis')[] = [0];
    if (safePage > 2) pages.push('ellipsis');
    for (let i = Math.max(1, safePage - 1); i <= Math.min(totalPages - 2, safePage + 1); i++) {
      pages.push(i);
    }
    if (safePage < totalPages - 3) pages.push('ellipsis');
    pages.push(totalPages - 1);
    return pages;
  };

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col w-full min-w-0 rounded-xl border border-border bg-card overflow-hidden shadow-sm">

      {/* Search bar */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search rows…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9 h-8 text-sm focus-visible:border-violet-500/60 focus-visible:ring-1 focus-visible:ring-violet-500/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {columns.map((col) => {
                const isActive = sortCol === col.name;
                return (
                  <th
                    key={col.name}
                    onClick={() => handleSort(col.name)}
                    className="group cursor-pointer px-4 py-3 text-left whitespace-nowrap select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-semibold tracking-widest uppercase transition-colors duration-150 ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground/80'}`}>
                        {col.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`hidden xl:inline-flex shrink-0 px-1 py-0 text-[9px] h-[14px] border rounded-sm font-medium ${DTYPE_BADGE[col.dtype] ?? DTYPE_BADGE.unknown}`}
                      >
                        {col.dtype}
                      </Badge>
                      <span className={`ml-0.5 transition-opacity duration-150 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                        {isActive && !sortAsc
                          ? <ChevronDown className="h-3 w-3 text-violet-500" />
                          : <ChevronUp className="h-3 w-3 text-violet-500" />}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-sm text-muted-foreground">
                  No matching rows
                </td>
              </tr>
            ) : (
              paginated.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-border/60 transition-colors duration-100 hover:bg-muted/30 last:border-0"
                >
                  {columns.map((col) => (
                    <td
                      key={col.name}
                      className="px-4 py-3 max-w-[220px] whitespace-nowrap"
                    >
                      <div className="truncate" title={String(row[col.name] ?? '')}>
                        <CellValue value={row[col.name]} dtype={col.dtype} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20">

        {/* Left: row count */}
        <p className="text-xs text-muted-foreground shrink-0">
          Showing{' '}
          <span className="font-semibold text-foreground">{startRow} to {endRow}</span>
          {' '}of{' '}
          <span className="font-semibold text-foreground">{filtered.length}</span>
          {' '}rows
          {search && <span className="text-muted-foreground/60"> (filtered from {data.length})</span>}
        </p>

        {/* Right: nav + per-page */}
        <div className="flex items-center gap-1.5">

          {/* First */}
          <button
            onClick={() => setPage(0)}
            disabled={safePage === 0}
            className="inline-flex items-center justify-center h-7 w-7 rounded border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>

          {/* Prev */}
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="inline-flex items-center justify-center h-7 w-7 rounded border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {/* Page pills */}
          {getPageNumbers().map((p, idx) =>
            p === 'ellipsis' ? (
              <span key={`e-${idx}`} className="w-7 text-center text-xs text-muted-foreground select-none">…</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`inline-flex items-center justify-center h-7 w-7 rounded text-xs font-medium transition-all duration-150 ${
                  safePage === p
                    ? 'bg-violet-600 text-white shadow-sm border border-violet-500/50 scale-105'
                    : 'border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {p + 1}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage >= totalPages - 1}
            className="inline-flex items-center justify-center h-7 w-7 rounded border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          {/* Last */}
          <button
            onClick={() => setPage(totalPages - 1)}
            disabled={safePage >= totalPages - 1}
            className="inline-flex items-center justify-center h-7 w-7 rounded border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </button>

          {/* Rows-per-page */}
          <Select
            value={pageSize.toString()}
            onValueChange={(val) => { setPageSize(Number(val)); setPage(0); }}
          >
            <SelectTrigger className="ml-2 h-7 w-[62px] text-xs focus:ring-0 focus:ring-offset-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50, 100].map((s) => (
                <SelectItem key={s} value={s.toString()} className="text-xs">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

