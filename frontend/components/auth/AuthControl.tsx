'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import UserButton from './UserButton';

export function AuthControl() {
  const { isLoaded, isSignedIn, openSignIn } = useAuth();

  if (!isLoaded) {
    return <Skeleton className="h-8 w-8 rounded-full bg-muted/60" />;
  }

  if (isSignedIn) {
    return <UserButton />;
  }

  return (
    <Button
      size="default"
      variant="secondary"
      onClick={openSignIn}
      className="cursor-pointer rounded-md"
    >
      Sign In
    </Button>
  );
}

export default AuthControl;
