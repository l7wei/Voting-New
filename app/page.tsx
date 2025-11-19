'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, UserCheck, Zap, ArrowRight, CheckCircle2, Vote } from 'lucide-react';

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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-6 py-12">
        {/* Hero Section */}
        <div className="mb-16 space-y-6 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Vote className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
            清大投票系統
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            National Tsing Hua University Voting System
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/vote">
                前往投票
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {!loading && activities.length > 0 && (
              <Badge variant="success" className="flex items-center gap-2 px-4 py-2 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                {activities.length} 個投票活動進行中
              </Badge>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center">安全可靠</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                使用加密技術保護投票資料
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center">匿名投票</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                完全匿名機制保護隱私
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center">快速便捷</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                簡潔介面，隨時隨地投票
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it works Section */}
        <Card>
          <CardHeader className="pb-8 text-center">
            <CardTitle className="text-3xl">使用流程</CardTitle>
          </CardHeader>
          <CardContent className="pb-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              {[
                { num: '1', title: '登入系統', desc: '使用學號登入' },
                { num: '2', title: '選擇活動', desc: '選擇投票活動' },
                { num: '3', title: '進行投票', desc: '投下您的一票' },
                { num: '4', title: '完成投票', desc: '取得投票憑證' },
              ].map((step) => (
                <div key={step.num} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-sm">
                    {step.num}
                  </div>
                  <h4 className="mb-2 text-lg font-bold">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="mt-20 border-t py-8">
        <div className="container mx-auto max-w-7xl px-6">
          <p className="text-center text-muted-foreground">
            © 2025 清華大學學生會投票系統
          </p>
        </div>
      </footer>
    </div>
  );
}
