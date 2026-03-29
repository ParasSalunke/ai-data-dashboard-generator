'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { ColumnInfo } from '@/lib/types';

interface DataTableProps {
  data: Record<string, unknown>[] | undefined;
  columns: ColumnInfo[];
  isLoading: boolean;
}

const DTYPE_COLORS: Record<string, string> = {
  numeric: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  categorical: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  datetime: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  boolean: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  unknown: 'bg-muted text-muted-foreground border-border',
};

export default function DataTable({ data, columns, isLoading }: DataTableProps) {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!data?.length || !columns.length) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        No data to display
      </div>
    );
  }

  // Filter rows by search
  let filtered = data;
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = data.filter((row) =>
      Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }

  // Sort
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

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleSort = (col: string) => {
    if (sortCol === col) setAscending((prev) => !prev);
    else { setSortCol(col); setSortAsc(true); }
  };

  function setAscending(fn: (v: boolean) => boolean) {
    setSortAsc(fn);
  }

  return (
    <div className="space-y-3 w-full min-w-0 overflow-hidden">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search rows…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-9 h-9 text-sm bg-card/50 border-border/60"
        />
      </div>

      {/* Table */}
      <div className="w-full rounded-xl border border-border/60 bg-card/40 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-border/60 bg-card/60">
                {columns.map((col) => (
                  <th
                    key={col.name}
                    className="cursor-pointer px-4 py-3 text-left font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => handleSort(col.name)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="max-w-[120px] truncate">{col.name}</span>
                      <Badge
                        variant="outline"
                        className={`hidden lg:inline-flex shrink-0 border px-1 py-0 text-[10px] h-4 ${DTYPE_COLORS[col.dtype] ?? DTYPE_COLORS.unknown}`}
                      >
                        {col.dtype}
                      </Badge>
                      {sortCol === col.name && (
                        sortAsc
                          ? <ChevronUp className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                          : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-border/30 transition-colors hover:bg-accent/30 last:border-0"
                >
                  {columns.map((col) => (
                    <td
                      key={col.name}
                      className="px-4 py-2.5 text-foreground/90 max-w-[200px]"
                    >
                      <span className="block truncate" title={String(row[col.name] ?? '')}>
                        {row[col.name] == null ? (
                          <span className="text-muted-foreground/40 italic text-xs">null</span>
                        ) : (
                          String(row[col.name])
                        )}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {filtered.length} rows{search ? ` (filtered from ${data.length})` : ''}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded px-2 py-1 hover:bg-accent disabled:opacity-40"
          >
            ← Prev
          </button>
          <span>
            Page {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded px-2 py-1 hover:bg-accent disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
