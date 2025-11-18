'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Card, CardHeader, CardBody, Button, Chip, Divider } from '@heroui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLock, 
  faUserSecret, 
  faBolt, 
  faCheckCircle,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            清大投票系統
          </h1>
          <p className="text-2xl text-default-600 max-w-3xl mx-auto">
            National Tsing Hua University Voting System
          </p>
          <p className="text-lg text-default-500 max-w-2xl mx-auto">
            安全、透明、便捷的線上投票平台，為清華大學學生會選舉提供專業的投票服務
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              as={Link}
              href="/vote" 
              color="primary"
              size="lg"
              endContent={<FontAwesomeIcon icon={faArrowRight} />}
              className="font-semibold"
            >
              前往投票
            </Button>
            {!loading && activities.length > 0 && (
              <Chip 
                color="success" 
                variant="flat" 
                size="lg"
                startContent={<FontAwesomeIcon icon={faCheckCircle} />}
              >
                {activities.length} 個投票活動進行中
              </Chip>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card shadow="sm" className="border-none bg-gradient-to-br from-primary-50 to-primary-100">
            <CardBody className="text-center p-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary-100 rounded-full">
                  <FontAwesomeIcon icon={faLock} className="text-4xl text-primary-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">安全可靠</h3>
              <p className="text-default-600">
                採用業界標準的加密技術，確保每一票都安全可靠，無法被竄改
              </p>
            </CardBody>
          </Card>

          <Card shadow="sm" className="border-none bg-gradient-to-br from-success-50 to-success-100">
            <CardBody className="text-center p-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-success-100 rounded-full">
                  <FontAwesomeIcon icon={faUserSecret} className="text-4xl text-success-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">匿名投票</h3>
              <p className="text-default-600">
                完全匿名的投票機制，保護您的隱私，讓您自由表達意見
              </p>
            </CardBody>
          </Card>

          <Card shadow="sm" className="border-none bg-gradient-to-br from-secondary-50 to-secondary-100">
            <CardBody className="text-center p-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-secondary-100 rounded-full">
                  <FontAwesomeIcon icon={faBolt} className="text-4xl text-secondary-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">快速便捷</h3>
              <p className="text-default-600">
                簡潔直觀的界面設計，讓投票過程輕鬆快速，隨時隨地都能參與
              </p>
            </CardBody>
          </Card>
        </div>

        {/* How it works Section */}
        <Card shadow="md">
          <CardHeader className="flex flex-col items-center pb-4">
            <h2 className="text-3xl font-bold">如何使用</h2>
          </CardHeader>
          <Divider/>
          <CardBody className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { num: '1', title: '登入系統', desc: '使用您的學號登入' },
                { num: '2', title: '選擇活動', desc: '從進行中的活動選擇' },
                { num: '3', title: '進行投票', desc: '審慎選擇並投下您的一票' },
                { num: '4', title: '完成投票', desc: '取得投票證明憑證' },
              ].map((step) => (
                <div key={step.num} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center text-2xl font-bold mb-4 mx-auto shadow-lg">
                    {step.num}
                  </div>
                  <h4 className="font-bold text-lg mb-2">{step.title}</h4>
                  <p className="text-sm text-default-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </main>

      <footer className="border-t border-divider mt-20 py-8 bg-default-50">
        <div className="container mx-auto max-w-7xl px-6">
          <p className="text-center text-default-500">
            © 2024 清華大學學生會 投票系統. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
