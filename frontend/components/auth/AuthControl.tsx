'use client';

import { useEffect, useState } from 'react';
import { useUser, SignIn, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function AuthControl() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [hasSessionCookie, setHasSessionCookie] = useState<boolean>(false);

  useEffect(() => {
    // Strictly check for active user session token (ignore generic __clerk dev cookies)
    if (typeof document !== 'undefined') {
      const isSessionActive = document.cookie.split(';').some((item) => {
        const [key, val] = item.trim().split('=');
        if (key === '__session' && val && val !== '0') return true;
        if (key === '__client_uat' && val && val !== '0') return true;
        return false;
      });
      setHasSessionCookie(isSessionActive);
    }
  }, []);

  // Render matching skeleton placeholder while Clerk hydrates
  if (!isLoaded) {
    if (hasSessionCookie) {
      // If logged in session cookie is detected, render circular shadcn Avatar skeleton
      return (
        <Avatar className="h-8 w-8">
          <Skeleton className="h-full w-full rounded-full bg-muted/60" />
        </Avatar>
      );
    }
    // Otherwise render rectangular button skeleton for logged out state
    return <Skeleton className="h-8 w-17 rounded-md bg-muted/50" />;
  }

  if (isSignedIn && user) {
    return (
      <UserButton
        appearance={{
          elements: {
            rootBox: 'flex items-center justify-center',
            avatarBox:
              'h-8 w-8 rounded-full',
          },
        }}
      />
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="cursor-pointer rounded-md">
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-auto max-w-fit border-none bg-transparent p-0 shadow-none sm:max-w-fit"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Sign In</DialogTitle>
        <SignIn routing="hash" />
      </DialogContent>
    </Dialog>
  );
}

export default AuthControl;