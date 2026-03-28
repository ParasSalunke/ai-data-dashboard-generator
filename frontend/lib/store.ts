import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColumnInfo, ChartConfig } from './types';

interface DashboardStore {
  // Dataset state
  datasetId: string | null;
  columns: ColumnInfo[];
  preview: Record<string, unknown>[];
  rowCount: number;

  // Dashboard layout
  chartOrder: string[];

  // Filters
  activeFilters: Record<string, string[]>;

  // UI state
  sidebarOpen: boolean;

  // Actions
  setDatasetId: (id: string) => void;
  setColumns: (cols: ColumnInfo[]) => void;
  setPreview: (rows: Record<string, unknown>[]) => void;
  setRowCount: (n: number) => void;
  setChartOrder: (ids: string[]) => void;
  toggleFilter: (column: string, value: string) => void;
  clearFilters: () => void;
  setSidebarOpen: (open: boolean) => void;
  reset: () => void;
}

const initialState = {
  datasetId: null,
  columns: [],
  preview: [],
  rowCount: 0,
  chartOrder: [],
  activeFilters: {},
  sidebarOpen: true,
};

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      ...initialState,

      setDatasetId: (id) => set({ datasetId: id }),
      setColumns: (cols) => set({ columns: cols }),
      setPreview: (rows) => set({ preview: rows }),
      setRowCount: (n) => set({ rowCount: n }),
      setChartOrder: (ids) => set({ chartOrder: ids }),

      toggleFilter: (column, value) =>
        set((state) => {
          const current = state.activeFilters[column] ?? [];
          const next = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
          return {
            activeFilters: { ...state.activeFilters, [column]: next },
          };
        }),

      clearFilters: () => set({ activeFilters: {} }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      reset: () => set(initialState),
    }),
    {
      name: 'ai-dashboard-store',
      partialize: (state) => ({
        datasetId: state.datasetId,
        chartOrder: state.chartOrder,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
