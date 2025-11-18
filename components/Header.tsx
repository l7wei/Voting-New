'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem,
  Button, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  User,
  Skeleton 
} from '@heroui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardCheck, faUserCircle, faRightFromBracket, faUserShield } from '@fortawesome/free-solid-svg-icons';

interface UserData {
  student_id: string;
  name: string;
  isAdmin: boolean;
}

export default function Header() {
  const [user, setUser] = useState<UserData | null>(null);
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
    <Navbar isBordered maxWidth="xl" position="sticky">
      <NavbarBrand>
        <Link href="/" className="flex items-center gap-2">
          <FontAwesomeIcon icon={faClipboardCheck} className="text-primary text-2xl" />
          <p className="font-bold text-xl text-inherit">清大投票系統</p>
        </Link>
      </NavbarBrand>

      <NavbarContent justify="end">
        {loading ? (
          <NavbarItem>
            <Skeleton className="h-10 w-24 rounded-lg" />
          </NavbarItem>
        ) : user ? (
          <>
            {user.isAdmin && (
              <NavbarItem>
                <Button
                  as={Link}
                  href="/admin"
                  color="primary"
                  variant="flat"
                  startContent={<FontAwesomeIcon icon={faUserShield} />}
                >
                  管理後台
                </Button>
              </NavbarItem>
            )}
            <NavbarItem>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <User   
                    as="button"
                    name={user.name || user.student_id}
                    description="學生"
                    className="transition-transform"
                    avatarProps={{
                      icon: <FontAwesomeIcon icon={faUserCircle} />,
                      classNames: {
                        base: "bg-gradient-to-br from-primary-400 to-primary-600",
                        icon: "text-white"
                      }
                    }}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="User actions" variant="flat">
                  <DropdownItem key="profile" className="h-14 gap-2">
                    <p className="font-semibold">登入為</p>
                    <p className="font-semibold">{user.name || user.student_id}</p>
                  </DropdownItem>
                  <DropdownItem 
                    key="logout" 
                    color="danger"
                    startContent={<FontAwesomeIcon icon={faRightFromBracket} />}
                    onClick={handleLogout}
                  >
                    登出
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          </>
        ) : (
          <NavbarItem>
            <Button
              as={Link}
              href="/login"
              color="primary"
              variant="flat"
            >
              登入
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
}
