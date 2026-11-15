'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  getUserSavedDashboards,
  updateDashboardTitle,
  deleteUserDashboard,
  MAX_SAVED_DASHBOARDS,
  type FirestoreDataset,
} from '@/lib/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  LayoutDashboard,
  Calendar,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
  Sparkles,
  Loader2,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { toast } from 'sonner';

interface SavedDashboardsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDashboardSelect?: (dataset: FirestoreDataset) => void;
}

export function SavedDashboardsModal({
  open,
  onOpenChange,
  onDashboardSelect,
}: SavedDashboardsModalProps) {
  const router = useRouter();
  const { user, isSignedIn } = useAuth();
  const [dashboards, setDashboards] = useState<FirestoreDataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDashboards = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserSavedDashboards(user.uid);
      setDashboards(data);
    } catch (err) {
      console.error('Failed to load saved dashboards:', err);
      toast.error('Failed to load saved dashboards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      fetchDashboards();
    }
  }, [open, user]);

  const handleStartEdit = (d: FirestoreDataset) => {
    setEditingId(d.id);
    setEditTitle(d.fileName || 'Untitled Dashboard');
  };

  const handleSaveEdit = async (datasetId: string) => {
    if (!user || !editTitle.trim()) return;
    setSavingEdit(true);
    try {
      await updateDashboardTitle(user.uid, datasetId, editTitle.trim());
      setDashboards((prev) =>
        prev.map((d) => (d.id === datasetId ? { ...d, fileName: editTitle.trim() } : d))
      );
      setEditingId(null);
      toast.success('Dashboard renamed successfully');
    } catch (err) {
      console.error('Failed to rename dashboard:', err);
      toast.error('Failed to update dashboard name');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (datasetId: string) => {
    if (!user) return;
    setDeletingId(datasetId);
    try {
      await deleteUserDashboard(user.uid, datasetId);
      setDashboards((prev) => prev.filter((d) => d.id !== datasetId));
      toast.success('Dashboard removed (1 slot freed up)');
    } catch (err) {
      console.error('Failed to delete dashboard:', err);
      toast.error('Failed to delete dashboard');
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenDashboard = (dataset: FirestoreDataset) => {
    onOpenChange(false);
    if (onDashboardSelect) {
      onDashboardSelect(dataset);
    } else {
      router.push(`/dashboard?id=${dataset.id}`);
    }
  };

  const savedCount = dashboards.length;
  const isLimitReached = savedCount >= MAX_SAVED_DASHBOARDS;
  const progressPercent = Math.min(100, Math.round((savedCount / MAX_SAVED_DASHBOARDS) * 100));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-md border border-border/80 p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Saved Dashboards
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Access, edit, and organize your saved analytics dashboards
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant={isLimitReached ? 'destructive' : 'secondary'}
              className="text-xs font-semibold px-2.5 py-1"
            >
              {savedCount} / {MAX_SAVED_DASHBOARDS} Saves Used
            </Badge>
          </div>

          {/* Quota Progress Meter */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
              <span>Free Plan Quota</span>
              <span>
                {MAX_SAVED_DASHBOARDS - savedCount > 0
                  ? `${MAX_SAVED_DASHBOARDS - savedCount} save slots available`
                  : 'All slots used'}
              </span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        </DialogHeader>

        {/* Limit Warning Banner if Reached */}
        {isLimitReached && (
          <div className="mx-6 mt-4 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-amber-500">
                You have reached your limit of {MAX_SAVED_DASHBOARDS} saved dashboards
              </p>
              <p className="text-muted-foreground leading-relaxed">
                To save more dashboards, delete an old one to free up a slot, or upgrade to Pro.
              </p>
              <div className="pt-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.info('Pro subscription is coming soon! Stay tuned.')}
                  className="h-7 text-[11px] gap-1.5 border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
                >
                  <Sparkles className="h-3 w-3" />
                  Upgrade to Pro (Coming Soon)
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Items List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
              <span>Loading your saved dashboards…</span>
            </div>
          ) : dashboards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 border border-dashed border-border/60 rounded-xl p-8 bg-card/40">
              <div className="p-3 rounded-full bg-muted/40 text-muted-foreground">
                <FolderOpen className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">No saved dashboards yet</h4>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Upload a CSV file and click the "Save Dashboard" button to preserve your customized charts and AI insights here.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  router.push('/');
                }}
                className="mt-2 text-xs"
              >
                Upload a CSV
              </Button>
            </div>
          ) : (
            dashboards.map((d) => {
              const isEditing = editingId === d.id;
              const dateStr = d.updatedAt?.toDate
                ? d.updatedAt.toDate().toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : d.createdAt?.toDate
                ? d.createdAt.toDate().toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recently saved';

              const chartCount = d.charts?.length || 0;
              const rowCount = d.rowCount || 0;
              const colCount = d.columnCount || d.colCount || 0;

              return (
                <div
                  key={d.id}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/60 bg-card/60 hover:border-violet-500/40 transition-all duration-200 gap-4"
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-8 text-sm"
                          placeholder="Dashboard title"
                          autoFocus
                          disabled={savingEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(d.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(d.id)}
                          disabled={savingEdit || !editTitle.trim()}
                          className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          disabled={savingEdit}
                          className="h-8 px-2 text-xs"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-violet-400 transition-colors">
                          {d.fileName}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(d)}
                          title="Rename dashboard"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[11px] font-normal">
                        {rowCount.toLocaleString()} rows
                      </Badge>
                      <Badge variant="outline" className="text-[11px] font-normal">
                        {colCount} cols
                      </Badge>
                      {chartCount > 0 && (
                        <Badge
                          variant="outline"
                          className="text-[11px] font-normal border-violet-500/30 text-violet-400 bg-violet-500/10"
                        >
                          {chartCount} charts
                        </Badge>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80 ml-1">
                        <Calendar className="h-3 w-3" />
                        {dateStr}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleOpenDashboard(d)}
                      className="h-8 px-3 text-xs gap-1.5 bg-violet-600 hover:bg-violet-700 text-white shadow-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Open</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(d.id)}
                      disabled={deletingId === d.id}
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Delete dashboard"
                    >
                      {deletingId === d.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SavedDashboardsModal;
