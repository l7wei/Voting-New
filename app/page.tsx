'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Card, CardHeader, CardBody, Button, Chip } from '@heroui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLock, 
  faUserSecret, 
  faBolt, 
  faCheckCircle,
  faArrowRight,
  faClipboardCheck
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
    <div className="min-h-screen bg-neutral-100">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-white/80 backdrop-blur-md rounded-full shadow-sm">
              <FontAwesomeIcon icon={faClipboardCheck} className="text-6xl text-primary" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900">
            清大投票系統
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            National Tsing Hua University Voting System
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
          <Card shadow="sm" className="glass-card">
            <CardBody className="text-center p-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-neutral-100 rounded-full">
                  <FontAwesomeIcon icon={faLock} className="text-4xl text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">安全可靠</h3>
              <p className="text-neutral-600">
                使用加密技術保護投票資料
              </p>
            </CardBody>
          </Card>

          <Card shadow="sm" className="glass-card">
            <CardBody className="text-center p-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-neutral-100 rounded-full">
                  <FontAwesomeIcon icon={faUserSecret} className="text-4xl text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">匿名投票</h3>
              <p className="text-neutral-600">
                完全匿名機制保護隱私
              </p>
            </CardBody>
          </Card>

          <Card shadow="sm" className="glass-card">
            <CardBody className="text-center p-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-neutral-100 rounded-full">
                  <FontAwesomeIcon icon={faBolt} className="text-4xl text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">快速便捷</h3>
              <p className="text-neutral-600">
                簡潔介面，隨時隨地投票
              </p>
            </CardBody>
          </Card>
        </div>

        {/* How it works Section */}
        <Card shadow="sm" className="glass-card-strong">
          <CardHeader className="flex flex-col items-center pb-4 pt-8">
            <h2 className="text-3xl font-bold text-neutral-900">使用流程</h2>
          </CardHeader>
          <CardBody className="p-8 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { num: '1', title: '登入系統', desc: '使用學號登入' },
                { num: '2', title: '選擇活動', desc: '選擇投票活動' },
                { num: '3', title: '進行投票', desc: '投下您的一票' },
                { num: '4', title: '完成投票', desc: '取得投票憑證' },
              ].map((step) => (
                <div key={step.num} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-4 mx-auto shadow-sm">
                    {step.num}
                  </div>
                  <h4 className="font-bold text-lg text-neutral-900 mb-2">{step.title}</h4>
                  <p className="text-sm text-neutral-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </main>

      <footer className="border-t border-neutral-200 mt-20 py-8 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-6">
          <p className="text-center text-neutral-500">
            © 2024 清華大學學生會投票系統
          </p>
        </div>
      </footer>
    </div>
  );
}
