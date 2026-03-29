'use client';

import { useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ChartCard from './ChartCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { ChartConfig } from '@/lib/types';
import { useDashboardStore } from '@/lib/store';
import { BarChart3 } from 'lucide-react';

interface DashboardGridProps {
  charts: ChartConfig[] | undefined;
  isLoading: boolean;
}

function SortableChartCard({ chart }: { chart: ChartConfig }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chart.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="min-w-0">
      <ChartCard
        chart={chart}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 p-4 min-w-0">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-[220px] w-full rounded-xl" />
    </div>
  );
}

export default function DashboardGrid({ charts, isLoading }: DashboardGridProps) {
  const { chartOrder, setChartOrder } = useDashboardStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  // Sync order with incoming charts — initialise order if empty
  const orderedCharts = useMemo(() => {
    if (!charts?.length) return [];
    const ids = chartOrder.length ? chartOrder : charts.map((c) => c.id);
    const byId = Object.fromEntries(charts.map((c) => [c.id, c]));
    // Include any new charts not yet in order
    const all = [...new Set([...ids, ...charts.map((c) => c.id)])];
    return all.map((id) => byId[id]).filter(Boolean);
  }, [charts, chartOrder]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = orderedCharts.findIndex((c) => c.id === active.id);
      const newIndex = orderedCharts.findIndex((c) => c.id === over?.id);
      const newOrder = arrayMove(orderedCharts, oldIndex, newIndex).map((c) => c.id);
      setChartOrder(newOrder);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ChartSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!orderedCharts.length) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60">
        <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">No charts generated yet</p>
        <p className="mt-1 text-xs text-muted-foreground/60">Upload a CSV to get started</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedCharts.map((c) => c.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orderedCharts.map((chart) => (
            <SortableChartCard key={chart.id} chart={chart} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
