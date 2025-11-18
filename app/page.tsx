'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';

interface Activity {
  _id: string;
  name: string;
  type: string;
  rule: 'choose_all' | 'choose_one';
  open_from: string;
  open_to: string;
  users: string[];
}

export default function HomePage() {
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
        // Filter active activities
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

  const getStatusBadge = (activity: Activity) => {
    const now = new Date();
    const openFrom = new Date(activity.open_from);
    const openTo = new Date(activity.open_to);

    if (now < openFrom) {
      return <span className="px-3 py-1 text-sm rounded-lg bg-yellow-100 text-yellow-800 font-medium">即將開始</span>;
    } else if (now > openTo) {
      return <span className="px-3 py-1 text-sm rounded-lg bg-gray-100 text-gray-800 font-medium">已結束</span>;
    } else {
      return <span className="px-3 py-1 text-sm rounded-lg bg-green-100 text-green-800 font-medium">進行中</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-neutral">載入中...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-dark mb-2">投票活動</h2>
          <p className="text-neutral">選擇您要參與的投票活動</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Activities List */}
        {activities.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-primary-light rounded-full mb-4">
                <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-dark mb-2">目前沒有進行中的投票活動</h3>
              <p className="text-neutral">請稍後再回來查看</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card key={activity._id} hover>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-neutral-dark">
                        {activity.name}
                      </h3>
                      {getStatusBadge(activity)}
                    </div>
                    
                    <div className="space-y-1 text-sm text-neutral">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span>類型：{activity.type}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>投票方式：{activity.rule === 'choose_all' ? '多選評分' : '單選'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>截止時間：{new Date(activity.open_to).toLocaleString('zh-TW')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="sm:flex-shrink-0">
                    <Button href={`/vote/${activity._id}`} variant="primary">
                      開始投票
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
