'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LogOut, User as UserIcon, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { getUserSavedDashboards, MAX_SAVED_DASHBOARDS } from '@/lib/firestore';
import SavedDashboardsModal from '@/components/dashboard/SavedDashboardsModal';

export function UserButton({ className }: { className?: string }) {
  const { user, signOut } = useAuth();
  const [savedCount, setSavedCount] = useState<number>(0);
  const [dashboardsModalOpen, setDashboardsModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserSavedDashboards(user.uid)
      .then((data) => setSavedCount(data.length))
      .catch((err) => console.error('Failed to load user saved dashboard count:', err));
  }, [user, dashboardsModalOpen]);

  if (!user) return null;

  const displayName = user.displayName || user.email?.split('@')[0] || 'User';
  const email = user.email || '';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const providerId = user.providerData?.[0]?.providerId || 'password';
  const providerLabel = providerId.includes('google') ? 'Google Account' : 'Email Account';
  const isLimitReached = savedCount >= MAX_SAVED_DASHBOARDS;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="User profile menu"
            className={`relative rounded-full ring-offset-background transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer ${
              className || ''
            }`}
          >
            <Avatar className="h-8 w-8 border border-border/60">
              {user.photoURL && <AvatarImage src={user.photoURL} alt={displayName} />}
              <AvatarFallback className="bg-linear-to-br from-violet-500 to-sky-500 text-white text-xs font-semibold">
                {initials || <UserIcon className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-60" align="end" sideOffset={8}>
          <DropdownMenuLabel className="font-normal p-3">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none text-foreground">{displayName}</p>
              {email && (
                <p className="text-xs leading-none text-muted-foreground truncate">{email}</p>
              )}
              <div className="pt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span>{providerLabel}</span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            {/* Dashboard / Saved Dashboards Option */}
            <DropdownMenuItem
              className="cursor-pointer gap-2 py-2 text-foreground focus:bg-violet-500/10 focus:text-violet-400"
              onClick={() => setDashboardsModalOpen(true)}
            >
              <LayoutDashboard className="h-4 w-4 text-violet-400" />
              <div className="flex flex-1 items-center justify-between">
                <span className="text-sm font-medium">Dashboards</span>
                <Badge
                  variant={isLimitReached ? 'destructive' : 'secondary'}
                  className="text-[10px] px-1.5 py-0 font-medium"
                >
                  {savedCount} / {MAX_SAVED_DASHBOARDS}
                </Badge>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
              onClick={async () => {
                try {
                  await signOut();
                } catch (err) {
                  console.error('Failed to sign out:', err);
                }
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal to view, edit, and delete saved dashboards */}
      <SavedDashboardsModal
        open={dashboardsModalOpen}
        onOpenChange={setDashboardsModalOpen}
      />
    </>
  );
}

export default UserButton;
