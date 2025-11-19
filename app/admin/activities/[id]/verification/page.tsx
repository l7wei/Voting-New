'use client';

import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import AdminGuard from '@/components/auth/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function VerificationPageContent() {
  const params = useParams();
  const activityId = params.id as string;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-7xl px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>投票驗證</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              活動 ID: {activityId}
            </p>
            <p className="mb-4 text-muted-foreground">
              請使用 API 端點進行投票驗證
            </p>
            <Button variant="outline" asChild>
              <Link href={`/admin/activities/${activityId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回活動管理
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function VerificationPage() {
  return (
    <AdminGuard>
      <VerificationPageContent />
    </AdminGuard>
  );
}
