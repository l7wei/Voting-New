'use client';

import { useState, useEffect } from 'react';
import { Loading } from '@/components/ui/loader';

interface AdminGuardProps {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

/**
 * AdminGuard component - Simplified version
 * 
 * Note: Authentication and authorization are now handled by middleware.
 * This component only provides a brief loading state while the page initializes.
 * The middleware ensures only authenticated admins can access admin routes.
 */
export default function AdminGuard({ children, loadingComponent }: AdminGuardProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Brief delay to allow middleware to complete its checks
    // This prevents flash of content if user needs to be redirected
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loading text="載入中..." />
      </div>
    );
  }

  return <>{children}</>;
}
