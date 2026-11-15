'use client';

import React, { ReactNode } from 'react';
import { AuthProvider as BaseAuthProvider } from '@/context/AuthContext';
import AuthModal from './AuthModal';

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <BaseAuthProvider>
      {children}
      <AuthModal />
    </BaseAuthProvider>
  );
}

export default AuthProvider;
