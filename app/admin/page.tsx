'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Loading from '@/components/Loading';

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
      return <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">即將開始</span>;
    } else if (now > openTo) {
      return <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800 font-medium">已結束</span>;
    } else {
      return <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">進行中</span>;
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
      <Header title="管理員後台" subtitle="投票系統管理控制台" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">總活動數</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activities.length}</p>
              </div>
              <div className="p-4 bg-blue-100 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">進行中</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {activities.filter(a => {
                    const now = new Date();
                    return now >= new Date(a.open_from) && now <= new Date(a.open_to);
                  }).length}
                </p>
              </div>
              <div className="p-4 bg-green-100 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">已結束</p>
                <p className="text-3xl font-bold text-gray-500 mt-2">
                  {activities.filter(a => new Date() > new Date(a.open_to)).length}
                </p>
              </div>
              <div className="p-4 bg-gray-100 rounded-full">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Quick Actions */}
        <Card className="mb-6 sm:mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">快速操作</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button href="/admin/activities/new" variant="success" className="flex items-center justify-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新增投票活動
            </Button>
            <Button href="/admin/voters" variant="primary" className="flex items-center justify-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              管理投票人名單
            </Button>
            <Button onClick={() => window.location.reload()} className="flex items-center justify-center bg-purple-600 hover:bg-purple-700">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重新整理
            </Button>
          </div>
        </Card>

        {/* Activities List */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">投票活動列表</h2>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-gray-500 mb-4">目前沒有任何投票活動</p>
              <Button href="/admin/activities/new" variant="success">
                新增第一個活動
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      活動名稱
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      狀態
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      投票方式
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      候選人數
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      已投票人數
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <tr key={activity._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{activity.name}</div>
                        <div className="text-sm text-gray-500">{activity.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(activity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {activity.rule === 'choose_all' ? '多選評分' : '單選'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {activity.options.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {activity.users.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          href={`/admin/activities/${activity._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          管理
                        </Link>
                        <Link
                          href={`/admin/activities/${activity._id}/results`}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          統計
                        </Link>
                        <button
                          onClick={() => handleDeleteActivity(activity._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          刪除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
