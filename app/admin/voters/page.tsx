'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VotersManagementPage() {
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
      
      // TODO: Implement upload with auth token
      setError('請先實作管理員認證功能');
      
      /* When auth is implemented:
      const token = getAuthToken();
      
      const response = await fetch('/api/voters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ csv_content: text }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('投票人名單上傳成功！');
      } else {
        setError(data.error || '上傳失敗');
      }
      */
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('上傳檔案時發生錯誤');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Link
              href="/admin"
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">投票人名單管理</h1>
              <p className="text-gray-600 mt-1">上傳合格投票人名單</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">上傳投票人名單</h2>

          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-green-600 hover:text-green-700 font-semibold">
                  點擊上傳檔案
                </span>
                <span className="text-gray-500"> 或拖曳到此處</span>
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
              <p className="text-xs text-gray-500 mt-2">僅支援 CSV 格式</p>
            </div>
          </div>

          {uploading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
              <p className="text-gray-600">上傳中...</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">檔案格式說明</h2>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-2">CSV 檔案格式要求：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>第一欄必須是學號</li>
                    <li>可以包含其他欄位（姓名、系所等）供參考</li>
                    <li>使用 UTF-8 編碼</li>
                    <li>每一行代表一位合格投票人</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">範例格式：</h3>
              <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-gray-800">
{`學號,姓名,系所
108060001,王小明,資訊工程學系
108060002,李小華,電機工程學系
108060003,張小美,化學工程學系`}
                </pre>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-yellow-900">
                  <p className="font-medium mb-1">注意事項：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>上傳新名單會覆蓋舊名單</li>
                    <li>建議在投票開始前完成名單設定</li>
                    <li>請確保名單資料正確無誤</li>
                    <li>系統會自動檢查並移除重複學號</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current List Info */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">目前名單狀態</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">名單檔案位置</p>
              <p className="font-mono text-sm text-gray-900 mt-1">data/voterList.csv</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">更新方式</p>
              <p className="text-sm text-gray-900 mt-1">透過上方上傳功能或直接修改檔案</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
