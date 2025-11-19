'use client';

import Header from '@/components/Header';
import AdminGuard from '@/components/auth/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function VotersPageContent() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-7xl px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>投票人名單管理</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              請編輯 data/voterList.csv 檔案來管理投票人名單
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

export default function VotersPage() {
  return (
    <AdminGuard>
      <VotersPageContent />
    </AdminGuard>
  );
}
