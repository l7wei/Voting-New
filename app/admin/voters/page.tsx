'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import AdminGuard from '@/components/auth/AdminGuard';
import { Card, CardHeader, CardBody, Button } from '@heroui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUpload, faInfoCircle, faWarning } from '@fortawesome/free-solid-svg-icons';

function VotersManagementContent() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('請上傳 CSV 格式的檔案');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      await file.text();
      
      // TODO: Implement upload with credentials
      setError('上傳功能開發中');
      
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('上傳檔案時發生錯誤');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />

      <main className="container mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            as={Link}
            href="/admin"
            isIconOnly
            variant="light"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-neutral-900">投票人名單管理</h1>
            <p className="text-neutral-600 mt-1">上傳合格投票人名單</p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <Card className="mb-6 bg-danger-50 border-danger-200">
            <CardBody>
              <p className="text-danger-800">{error}</p>
            </CardBody>
          </Card>
        )}

        {success && (
          <Card className="mb-6 bg-success-50 border-success-200">
            <CardBody>
              <p className="text-success-800">{success}</p>
            </CardBody>
          </Card>
        )}

        {/* Upload Section */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <h2 className="text-xl font-bold text-neutral-900">上傳投票人名單</h2>
          </CardHeader>
          <CardBody>
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary transition">
              <FontAwesomeIcon icon={faUpload} className="text-5xl text-neutral-400 mb-4" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-primary hover:text-primary-600 font-semibold">
                  點擊上傳檔案
                </span>
                <span className="text-neutral-500"> 或拖曳到此處</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
              <p className="text-xs text-neutral-500 mt-2">僅支援 CSV 格式</p>
            </div>

            {uploading && (
              <div className="text-center mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-neutral-600">上傳中...</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Instructions */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <h2 className="text-xl font-bold text-neutral-900">檔案格式說明</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Card className="bg-neutral-50 border-neutral-200" shadow="none">
              <CardBody className="flex flex-row gap-3">
                <FontAwesomeIcon icon={faInfoCircle} className="text-primary text-xl flex-shrink-0 mt-0.5" />
                <div className="text-sm text-neutral-700">
                  <p className="font-semibold mb-2">CSV 檔案格式要求：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>第一欄必須是學號</li>
                    <li>可以包含其他欄位（姓名、系所等）供參考</li>
                    <li>使用 UTF-8 編碼</li>
                  </ul>
                </div>
              </CardBody>
            </Card>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">範例格式：</h3>
              <div className="bg-neutral-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-neutral-800">
{`學號,姓名,系所
108060001,王小明,資訊工程學系
108060002,李小華,電機工程學系`}
                </pre>
              </div>
            </div>

            <Card className="bg-warning-50 border-warning-200" shadow="none">
              <CardBody className="flex flex-row gap-3">
                <FontAwesomeIcon icon={faWarning} className="text-warning-600 text-xl flex-shrink-0 mt-0.5" />
                <div className="text-sm text-warning-900">
                  <p className="font-semibold mb-1">注意事項：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>上傳新名單會覆蓋舊名單</li>
                    <li>建議在投票開始前完成名單設定</li>
                  </ul>
                </div>
              </CardBody>
            </Card>
          </CardBody>
        </Card>

        {/* Current List Info */}
        <Card className="glass-card">
          <CardHeader>
            <h2 className="text-xl font-bold text-neutral-900">目前名單狀態</h2>
          </CardHeader>
          <CardBody>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">名單檔案位置</p>
                <p className="font-mono text-sm text-neutral-900 mt-1">data/voterList.csv</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">更新方式</p>
                <p className="text-sm text-neutral-900 mt-1">透過上方上傳功能或直接修改檔案</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

export default function VotersManagementPage() {
  return (
    <AdminGuard>
      <VotersManagementContent />
    </AdminGuard>
  );
}
