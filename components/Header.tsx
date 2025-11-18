'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Skeleton } from '@heroui/react';

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
    <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Left: System name */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              清大投票系統
            </h1>
          </Link>

          {/* Right: User info and links */}
          <div className="flex items-center gap-3">
            {loading ? (
              <Skeleton className="h-10 w-24 rounded-lg" />
            ) : user ? (
              <>
                <span className="hidden sm:inline text-sm text-gray-700 font-medium">
                  {user.name || user.student_id}
                </span>
                {user.isAdmin && (
                  <Button
                    as={Link}
                    href="/admin"
                    size="sm"
                    color="primary"
                    variant="flat"
                  >
                    管理後台
                  </Button>
                )}
                <Dropdown>
                  <DropdownTrigger>
                    <Button 
                      size="sm"
                      variant="light"
                      isIconOnly
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="User actions">
                    <DropdownItem key="profile" className="h-14 gap-2">
                      <p className="font-semibold">登入為</p>
                      <p className="font-semibold">{user.name || user.student_id}</p>
                    </DropdownItem>
                    <DropdownItem 
                      key="logout" 
                      color="danger"
                      onClick={handleLogout}
                    >
                      登出
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </>
            ) : (
              <Button
                as={Link}
                href="/login"
                size="sm"
                color="primary"
              >
                登入
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
