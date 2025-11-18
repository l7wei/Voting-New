'use client';

import Header from '@/components/Header';
import AdminGuard from '@/components/auth/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function NewActivityPageContent() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-7xl px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>新增投票活動</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              請使用 API 端點建立新的投票活動
            </p>
            <Button variant="outline" asChild>
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回後台
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function NewActivityPage() {
  return (
    <AdminGuard>
      <NewActivityPageContent />
    </AdminGuard>
  );
}
