'use client';

import { Show, SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function AuthControl() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <Skeleton className="h-8 w-8 rounded-full bg-muted/60" />;
  }

  if (isSignedIn) {
    return (
      <Show when="signed-in">
        <UserButton />
      </Show>
    );
  }

  return (
    <Show when="signed-out">
      <SignInButton mode="modal">
        <Button size="default" variant="secondary" className="cursor-pointer rounded-md">
          Sign In
        </Button>
      </SignInButton>
    </Show>
  );
}

export default AuthControl;