'use client';

import { useMemo } from 'react';
import { X, Filter, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDashboardStore } from '@/lib/store';
import type { ColumnInfo, ChartConfig } from '@/lib/types';

interface FilterBarProps {
  columns: ColumnInfo[];
  charts: ChartConfig[] | undefined;
}

export default function FilterBar({ columns, charts }: FilterBarProps) {
  const { activeFilters, toggleFilter, clearFilters } = useDashboardStore();

  // Only show categorical / boolean columns with <= 20 unique values
  const filterableColumns = useMemo(() => {
    return columns.filter(
      (col) =>
        (col.dtype === 'categorical' || col.dtype === 'boolean') &&
        col.unique_count <= 20 &&
        col.unique_count >= 2
    );
  }, [columns]);

  // Get unique values per filterable column from chart data
  const columnValues = useMemo(() => {
    const values: Record<string, string[]> = {};
    for (const col of filterableColumns) {
      const uniqueVals = new Set<string>();
      // Pull values from chart data
      if (charts) {
        for (const chart of charts) {
          for (const d of chart.data) {
            const val = d[col.name] ?? d.category ?? d.name;
            if (val !== undefined && val !== null && chart.column === col.name) {
              uniqueVals.add(String(val));
            }
          }
        }
      }
      // Also pull from sample_values
      for (const sv of col.sample_values) {
        if (sv !== null && sv !== undefined) uniqueVals.add(String(sv));
      }
      if (uniqueVals.size > 0) {
        values[col.name] = Array.from(uniqueVals).sort().slice(0, 20);
      }
    }
    return values;
  }, [filterableColumns, charts]);

  const activeFilterCount = Object.values(activeFilters).reduce(
    (sum, vals) => sum + (vals?.length || 0),
    0
  );

  const filterableCols = filterableColumns.filter(
    (col) => columnValues[col.name]?.length
  );

  if (filterableCols.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Filter className="h-3.5 w-3.5" />
        <span className="font-medium">Filters</span>
      </div>

      {filterableCols.map((col) => {
        const values = columnValues[col.name] || [];
        const selected = activeFilters[col.name] || [];
        const label = col.name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <DropdownMenu key={col.name}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`h-7 gap-1.5 text-xs ${
                  selected.length > 0
                    ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                    : 'border-border/60'
                }`}
              >
                {label}
                {selected.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-0.5 h-4 min-w-4 rounded-full px-1 text-[10px]"
                  >
                    {selected.length}
                  </Badge>
                )}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-60 overflow-auto w-48">
              <DropdownMenuLabel className="text-xs">{label}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {values.map((val) => (
                <DropdownMenuCheckboxItem
                  key={val}
                  checked={selected.includes(val)}
                  onCheckedChange={() => toggleFilter(col.name, val)}
                  className="text-xs"
                >
                  {val}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}

      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
          Clear all ({activeFilterCount})
        </Button>
      )}
    </div>
  );
}
