'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface User {
  student_id: string;
  name: string;
  isAdmin: boolean;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Left: System name */}
          <Link href="/" className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-dark">
              清大投票系統
            </h1>
          </Link>

          {/* Right: User info and links */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="text-sm text-neutral">載入中...</div>
            ) : user ? (
              <>
                <span className="text-sm text-neutral">
                  {user.name || user.student_id}
                </span>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    管理後台
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm text-neutral hover:text-neutral-dark"
                >
                  登出
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
