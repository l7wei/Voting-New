'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Card, CardBody, Button, Chip } from '@heroui/react';

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
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-blue-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            清大投票系統
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            National Tsing Hua University Voting System
          </p>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
            安全、透明、便捷的線上投票平台，為清華大學學生會選舉提供專業的投票服務
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              as={Link}
              href="/vote" 
              color="primary"
              size="lg"
              className="text-lg px-8 py-6"
            >
              前往投票
            </Button>
            {!loading && activities.length > 0 && (
              <Chip color="success" variant="flat" size="lg">
                {activities.length} 個投票活動進行中
              </Chip>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          <Card className="border-none bg-white/60 backdrop-blur-sm">
            <CardBody className="p-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-6 mx-auto">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">安全可靠</h3>
              <p className="text-gray-600 text-center">
                採用業界標準的加密技術，確保每一票都安全可靠，無法被竄改
              </p>
            </CardBody>
          </Card>

          <Card className="border-none bg-white/60 backdrop-blur-sm">
            <CardBody className="p-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-6 mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">匿名投票</h3>
              <p className="text-gray-600 text-center">
                完全匿名的投票機制，保護您的隱私，讓您自由表達意見
              </p>
            </CardBody>
          </Card>

          <Card className="border-none bg-white/60 backdrop-blur-sm">
            <CardBody className="p-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 mb-6 mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">快速便捷</h3>
              <p className="text-gray-600 text-center">
                簡潔直觀的界面設計，讓投票過程輕鬆快速，隨時隨地都能參與
              </p>
            </CardBody>
          </Card>
        </div>

        {/* How it works Section */}
        <Card className="border-none bg-white/80 backdrop-blur-sm">
          <CardBody className="p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">如何使用</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                  1
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">登入系統</h4>
                <p className="text-sm text-gray-600">使用您的學號登入</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                  2
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">選擇活動</h4>
                <p className="text-sm text-gray-600">從進行中的活動選擇</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                  3
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">進行投票</h4>
                <p className="text-sm text-gray-600">審慎選擇並投下您的一票</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                  4
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">完成投票</h4>
                <p className="text-sm text-gray-600">取得投票證明憑證</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </main>

      <footer className="bg-white/80 backdrop-blur-sm mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600">
            © 2024 清華大學學生會 投票系統. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
