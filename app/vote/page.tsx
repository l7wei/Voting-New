'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';

interface Activity {
  _id: string;
  name: string;
  type: string;
  rule: 'choose_all' | 'choose_one';
  open_from: string;
  open_to: string;
  users: string[];
}

export default function VotePage() {
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
        // Filter only active activities
        const now = new Date();
        const activeActivities = data.data.filter((activity: Activity) => {
          const openFrom = new Date(activity.open_from);
          const openTo = new Date(activity.open_to);
          return now >= openFrom && now <= openTo;
        });
        setActivities(activeActivities);
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

  const getActivityStatus = (activity: Activity): 'upcoming' | 'active' | 'ended' => {
    const now = new Date();
    const openFrom = new Date(activity.open_from);
    const openTo = new Date(activity.open_to);

    if (now < openFrom) return 'upcoming';
    if (now > openTo) return 'ended';
    return 'active';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            投票活動選擇
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            選擇您要參與的投票活動
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Activities List */}
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-white rounded-full shadow-lg mb-4">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">目前沒有進行中的投票活動</h3>
            <p className="text-gray-500 mb-6">請稍後再回來查看</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              返回首頁
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <div
                key={activity._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">
                      {activity.name}
                    </h3>
                    <StatusBadge status={getActivityStatus(activity)} />
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="font-medium">類型：</span>
                      <span className="ml-1">{activity.type}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">投票方式：</span>
                      <span className="ml-1">
                        {activity.rule === 'choose_all' ? '多選評分' : '單選'}
                      </span>
                    </div>

                    <div className="flex items-start text-sm text-gray-600">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <span className="font-medium">截止時間：</span>
                        <span className="ml-1 break-words">
                          {new Date(activity.open_to).toLocaleString('zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/vote/${activity._id}`}
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition transform hover:scale-105"
                  >
                    開始投票
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-block text-blue-600 hover:text-blue-800 font-medium transition"
          >
            ← 返回首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
