'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  saveUserDashboard,
  MAX_SAVED_DASHBOARDS,
  type SaveDashboardPayload,
  type FirestoreDataset,
} from '@/lib/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Bookmark,
  Sparkles,
  AlertTriangle,
  Loader2,
  FolderOpen,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface SaveDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: SaveDashboardPayload;
  savedDashboards: FirestoreDataset[];
  onSaveSuccess: (updatedName: string) => void;
  onOpenManageModal?: () => void;
}

export function SaveDashboardDialog({
  open,
  onOpenChange,
  payload,
  savedDashboards,
  onSaveSuccess,
  onOpenManageModal,
}: SaveDashboardDialogProps) {
  const { user, openSignIn } = useAuth();
  const [title, setTitle] = useState(payload.fileName || 'My Dashboard');
  const [saving, setSaving] = useState(false);

  // Sync title when dialog opens or payload changes
  React.useEffect(() => {
    if (open) {
      setTitle(payload.fileName || 'My Dashboard');
    }
  }, [open, payload.fileName]);

  const isAlreadySaved = savedDashboards.some((d) => d.id === payload.id);
  const currentCount = savedDashboards.length;
  const isLimitReached = !isAlreadySaved && currentCount >= MAX_SAVED_DASHBOARDS;

  const handleSave = async () => {
    if (!user) {
      onOpenChange(false);
      openSignIn?.();
      toast.info('Please sign in to save your dashboard');
      return;
    }

    if (isLimitReached) {
      return;
    }

    setSaving(true);
    try {
      const res = await saveUserDashboard(user.uid, {
        ...payload,
        fileName: title.trim() || 'Untitled Dashboard',
      });

      if (res.limitReached) {
        toast.error(`You have reached the limit of ${MAX_SAVED_DASHBOARDS} saved dashboards`);
        return;
      }

      if (res.success) {
        toast.success(
          isAlreadySaved
            ? 'Dashboard changes saved successfully!'
            : `Dashboard saved! (${res.count} of ${MAX_SAVED_DASHBOARDS} slots used)`
        );
        onSaveSuccess(title.trim());
        onOpenChange(false);
      } else {
        toast.error(res.error || 'Failed to save dashboard');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error('An unexpected error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border border-border/80 shadow-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Bookmark className="h-5 w-5" />
              </div>
              <DialogTitle className="text-base font-semibold text-foreground">
                {isAlreadySaved ? 'Save Dashboard Changes' : 'Save Dashboard'}
              </DialogTitle>
            </div>
            <Badge
              variant={isLimitReached ? 'destructive' : 'secondary'}
              className="text-[11px] font-medium"
            >
              {currentCount} / {MAX_SAVED_DASHBOARDS} Used
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {isAlreadySaved
              ? 'Update your existing saved dashboard with the latest layout and charts.'
              : 'Save this interactive dashboard to your account so you can revisit or share it anytime.'}
          </DialogDescription>
        </DialogHeader>

        {isLimitReached ? (
          <div className="py-3 space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1.5 text-xs">
                <p className="font-semibold text-amber-500 text-sm">
                  Limit of {MAX_SAVED_DASHBOARDS} Saves Reached
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  You have reached the free tier limit of {MAX_SAVED_DASHBOARDS} saved dashboards.
                  To save additional dashboards, please delete an older one or subscribe to Pro.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span>Datovo Pro Subscription</span>
                <Badge variant="outline" className="ml-auto text-[10px] bg-violet-500/10 text-violet-400 border-violet-500/30">
                  Coming Soon
                </Badge>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Unlimited saved dashboards, scheduled email reports, multi-CSV joins, and automated dataset refreshing.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info('Pro subscription is coming soon! Stay tuned.')}
                className="w-full text-xs gap-1.5 border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Notify Me When Available
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dashboard-title" className="text-xs font-medium text-foreground">
                Dashboard Title
              </Label>
              <Input
                id="dashboard-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q4 Financial Performance"
                className="h-9 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                }}
              />
            </div>

            <div className="rounded-lg border border-border/40 bg-muted/20 p-3 text-xs space-y-1.5 text-muted-foreground">
              <div className="flex justify-between items-center text-foreground font-medium text-[11px]">
                <span>Included with this save:</span>
                <span className="text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Ready
                </span>
              </div>
              <ul className="text-[11px] list-disc list-inside space-y-0.5 text-muted-foreground/80">
                <li>{payload.rowCount?.toLocaleString()} data rows & {payload.columnCount} columns</li>
                <li>{payload.charts?.length || 0} interactive visualization charts</li>
                <li>{payload.insights?.length || 0} Gemini AI business insights</li>
                <li>Customized drag-and-drop layout arrangement</li>
              </ul>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/40">
          {isLimitReached ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onOpenManageModal?.();
                }}
                className="text-xs gap-1.5 bg-violet-600 hover:bg-violet-700 text-white"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                Manage Saved Dashboards
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={saving}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="text-xs gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-xs"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Bookmark className="h-3.5 w-3.5" />
                    {isAlreadySaved ? 'Update Dashboard' : 'Save to Cloud'}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SaveDashboardDialog;
