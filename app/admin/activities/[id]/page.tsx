'use client';

import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import AdminGuard from '@/components/auth/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function ActivityDetailPageContent() {
  const params = useParams();
  const activityId = params.id as string;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-7xl px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>活動管理</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              活動 ID: {activityId}
            </p>
            <p className="mb-4 text-muted-foreground">
              請使用 API 端點管理活動詳情
            </p>
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link href="/admin">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回後台
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/admin/activities/${activityId}/results`}>
                  查看統計
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function ActivityDetailPage() {
  return (
    <AdminGuard>
      <ActivityDetailPageContent />
    </AdminGuard>
  );
}
