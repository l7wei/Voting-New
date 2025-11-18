'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/loader';

interface User {
  student_id: string;
  name: string;
  isAdmin: boolean;
}

interface AdminGuardProps {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export default function AdminGuard({ children, loadingComponent }: AdminGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            if (!data.user.isAdmin) {
              // Not an admin, redirect to home
              router.push('/');
              return;
            }
            setUser(data.user);
            setLoading(false);
          } else {
            // Not authenticated, redirect to login
            router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
          }
        } else {
          // Auth check failed, redirect to login
          router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
        }
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loading text="驗證中..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
