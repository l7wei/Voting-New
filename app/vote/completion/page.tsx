'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Copy, Check, Home, Download } from 'lucide-react';

interface VoteCertificate {
  activityId: string;
  activityName: string;
  token: string;
  timestamp: string;
}

export default function VotingCompletionPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<VoteCertificate[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Load certificates from localStorage
    const stored = localStorage.getItem('votingCertificates');
    if (stored) {
      setCertificates(JSON.parse(stored));
    } else {
      // If no certificates, redirect to vote page
      router.push('/vote');
    }
  }, [router]);

  const handleCopyToken = async (token: string, index: number) => {
    await navigator.clipboard.writeText(token);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = async () => {
    const allTokens = certificates
      .map((cert, idx) => `${idx + 1}. ${cert.activityName}\n   UUID: ${cert.token}\n   時間: ${new Date(cert.timestamp).toLocaleString('zh-TW')}`)
      .join('\n\n');
    
    await navigator.clipboard.writeText(allTokens);
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownload = () => {
    const content = certificates
      .map((cert, idx) => `${idx + 1}. ${cert.activityName}\n   UUID: ${cert.token}\n   時間: ${new Date(cert.timestamp).toLocaleString('zh-TW')}`)
      .join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `投票證明_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFinish = () => {
    // Clear certificates
    localStorage.removeItem('votingCertificates');
    router.push('/');
  };

  if (certificates.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-lg text-muted-foreground">載入中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="mb-2 text-4xl font-bold">恭喜！完成所有投票</h1>
          <p className="text-lg text-muted-foreground">
            感謝您的參與，以下是您的投票證明
          </p>
        </div>

        {/* Instructions */}
        <Card className="mb-6 border-primary bg-primary/5">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              💡 <strong>提示：</strong>請截圖或複製保存以下所有投票證明（UUID），以備期末慰問會使用。
            </p>
          </CardContent>
        </Card>

        {/* Certificates List */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>投票證明列表</CardTitle>
              <Badge variant="success" className="text-base">
                {certificates.length} 個活動
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {certificates.map((cert, index) => (
              <Card key={index} className="border-primary/20 bg-white">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {index + 1}
                        </span>
                        <h3 className="font-semibold">{cert.activityName}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        投票時間：{new Date(cert.timestamp).toLocaleString('zh-TW')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 break-all rounded-lg border border-primary/20 bg-primary/5 p-3 font-mono text-sm text-primary">
                      {cert.token}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopyToken(cert.token, index)}
                      className="flex-shrink-0"
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            size="lg"
            onClick={handleCopyAll}
            className="flex-1"
          >
            {copiedIndex === -1 ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                已複製全部
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                複製全部證明
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleDownload}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            下載為文字檔
          </Button>
          <Button
            size="lg"
            onClick={handleFinish}
            className="flex-1"
          >
            <Home className="mr-2 h-4 w-4" />
            完成並返回首頁
          </Button>
        </div>

        {/* Footer Note */}
        <Card className="mt-6 border-muted">
          <CardContent className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              您的投票已安全送出，系統採用匿名機制，無法追溯您的投票內容。<br />
              請妥善保存投票證明，以便日後查驗。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
