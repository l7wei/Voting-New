'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Card, CardBody, CardHeader, Button, Chip, Spinner } from '@heroui/react';

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
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            投票活動選擇
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            選擇您要參與的投票活動
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-danger-200 bg-danger-50">
            <CardBody>
              <p className="text-danger-800 text-sm">{error}</p>
            </CardBody>
          </Card>
        )}

        {/* Activities List */}
        {activities.length === 0 ? (
          <Card className="border-none bg-white/80 backdrop-blur-sm">
            <CardBody className="text-center py-16">
              <div className="inline-block p-6 bg-primary-100 rounded-full mb-6">
                <svg className="w-16 h-16 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">目前沒有進行中的投票活動</h3>
              <p className="text-gray-600 mb-6">請稍後再回來查看</p>
              <Button 
                as={Link}
                href="/" 
                color="primary"
                variant="flat"
              >
                返回首頁
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <Card key={activity._id} className="border-none bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-col items-start gap-2 pb-4">
                  <div className="flex justify-between items-start w-full gap-2">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">
                      {activity.name}
                    </h3>
                    {getStatusBadge(activity)}
                  </div>
                </CardHeader>
                <CardBody className="pt-0 space-y-3">
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="font-medium">類型：</span>
                    <span className="ml-1">{activity.type}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">投票方式：</span>
                    <span className="ml-1">
                      {activity.rule === 'choose_all' ? '多選評分' : '單選'}
                    </span>
                  </div>

                  <div className="flex items-start text-sm text-gray-700">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <span className="font-medium">截止時間：</span>
                      <span className="ml-1 block sm:inline">
                        {new Date(activity.open_to).toLocaleString('zh-TW', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      as={Link}
                      href={`/vote/${activity._id}`} 
                      color="primary"
                      className="w-full"
                    >
                      開始投票
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-12">
          <Button
            as={Link}
            href="/"
            variant="light"
            color="primary"
            startContent={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            }
          >
            返回首頁
          </Button>
        </div>
      </main>
    </div>
  );
}
