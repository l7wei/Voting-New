'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Card, CardBody, CardHeader, Button, Chip, Spinner, Divider } from '@heroui/react';

interface Activity {
  _id: string;
  name: string;
  type: string;
  rule: 'choose_all' | 'choose_one';
  open_from: string;
  open_to: string;
  users: string[];
  options: string[];
}

export default function AdminDashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities');
      const data = await response.json();

      if (data.success) {
        setActivities(data.data);
      } else {
        setError(data.error || '無法載入投票活動');
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('載入投票活動時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (_id: string) => {
    if (!confirm('確定要刪除此投票活動嗎？此操作無法復原。')) {
      return;
    }

    try {
      // TODO: Implement delete with auth token
      setError('請先實作管理員認證功能');
    } catch (err) {
      console.error('Error deleting activity:', err);
      setError('刪除活動時發生錯誤');
    }
  };

  const getStatusBadge = (activity: Activity) => {
    const now = new Date();
    const openFrom = new Date(activity.open_from);
    const openTo = new Date(activity.open_to);

    if (now < openFrom) {
      return <Chip color="warning" variant="flat" size="sm">即將開始</Chip>;
    } else if (now > openTo) {
      return <Chip color="default" variant="flat" size="sm">已結束</Chip>;
    } else {
      return <Chip color="success" variant="flat" size="sm">進行中</Chip>;
    }
  };

  const activeCount = activities.filter(a => {
    const now = new Date();
    return now >= new Date(a.open_from) && now <= new Date(a.open_to);
  }).length;

  const completedCount = activities.filter(a => new Date() > new Date(a.open_to)).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-blue-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" label="載入中..." />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-blue-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">管理員後台</h2>
          <p className="text-gray-600">投票系統管理控制台</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card className="border-none bg-white/80 backdrop-blur-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">總活動數</p>
                  <p className="text-4xl font-bold text-gray-900">{activities.length}</p>
                </div>
                <div className="p-4 bg-primary-100 rounded-2xl">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border-none bg-white/80 backdrop-blur-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">進行中</p>
                  <p className="text-4xl font-bold text-green-600">{activeCount}</p>
                </div>
                <div className="p-4 bg-green-100 rounded-2xl">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border-none bg-white/80 backdrop-blur-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">已結束</p>
                  <p className="text-4xl font-bold text-gray-500">{completedCount}</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-2xl">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-danger-200 bg-danger-50">
            <CardBody>
              <p className="text-danger-800 text-sm">{error}</p>
            </CardBody>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mb-8 border-none bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <h3 className="text-xl font-bold text-gray-900">快速操作</h3>
          </CardHeader>
          <Divider />
          <CardBody className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                as={Link}
                href="/admin/activities/new" 
                color="primary"
                size="lg"
                startContent={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
                className="h-14"
              >
                新增投票活動
              </Button>
              <Button 
                as={Link}
                href="/admin/voters" 
                color="secondary"
                variant="flat"
                size="lg"
                startContent={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
                className="h-14"
              >
                管理投票人名單
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="bordered"
                size="lg"
                startContent={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
                className="h-14"
              >
                重新整理
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Activities List */}
        <Card className="border-none bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <h3 className="text-xl font-bold text-gray-900">投票活動列表</h3>
          </CardHeader>
          <Divider />
          <CardBody className="p-0">
            {activities.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="inline-block p-6 bg-primary-100 rounded-full mb-4">
                  <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-6 text-lg">目前沒有任何投票活動</p>
                <Button 
                  as={Link}
                  href="/admin/activities/new" 
                  color="primary"
                >
                  新增第一個活動
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        活動名稱
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        狀態
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                        投票方式
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                        候選人數
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                        已投票人數
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/60 divide-y divide-gray-200">
                    {activities.map((activity) => (
                      <tr key={activity._id} className="hover:bg-gray-50/80 transition">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">{activity.name}</div>
                          <div className="text-xs text-gray-600">{activity.type}</div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(activity)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 hidden sm:table-cell">
                          {activity.rule === 'choose_all' ? '多選評分' : '單選'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 hidden md:table-cell">
                          {activity.options?.length || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 hidden md:table-cell">
                          {activity.users?.length || 0}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              as={Link}
                              href={`/admin/activities/${activity._id}`}
                              size="sm"
                              color="primary"
                              variant="flat"
                            >
                              管理
                            </Button>
                            <Button
                              as={Link}
                              href={`/admin/activities/${activity._id}/results`}
                              size="sm"
                              color="secondary"
                              variant="flat"
                            >
                              統計
                            </Button>
                            <Button
                              onClick={() => handleDeleteActivity(activity._id)}
                              size="sm"
                              color="danger"
                              variant="light"
                            >
                              刪除
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
