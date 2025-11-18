'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';

function MockLoginForm() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    userid: '',
    name: '',
    inschool: 'true',
    uuid: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate input
      if (!formData.userid || !formData.name) {
        setError('請填寫學號和姓名');
        setLoading(false);
        return;
      }

      // Generate UUID if not provided
      const uuid = formData.uuid || generateUUID();
      
      // Simulate OAuth callback with code
      const code = `mock_code_${Date.now()}`;

      // Create mock OAuth response
      const mockOAuthData = {
        Userid: formData.userid,
        name: formData.name,
        inschool: formData.inschool,
        uuid: uuid,
        timestamp: Date.now(),
      };

      // Store the data on server
      await fetch('/api/mock/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, data: mockOAuthData }),
      });

      // Get redirect_uri from query params or use default
      const redirectUri = searchParams.get('redirect_uri') || `${window.location.origin}/api/auth/callback`;
      
      // Redirect to callback with code
      window.location.href = `${redirectUri}?code=${code}`;
    } catch (err) {
      console.error('Login error:', err);
      setError('登入時發生錯誤');
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    setFormData({
      userid: '110000114',
      name: '測試學生',
      inschool: 'true',
      uuid: generateUUID(),
    });
  };

  return (
    <Card className="w-full max-w-md">
      <div className="text-center mb-6">
        <div className="inline-block p-4 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full mb-4">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">模擬 OAuth 登入</h1>
        <p className="text-gray-600">請輸入您的資訊以模擬 OAuth 認證</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="學號 (userid)"
          value={formData.userid}
          onChange={(e) => setFormData({ ...formData, userid: e.target.value })}
          placeholder="例如: 110000114"
          required
        />

        <Input
          label="姓名 (name)"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="例如: 王小明"
          required
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            在校狀態 (inschool) <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            value={formData.inschool}
            onChange={(e) => setFormData({ ...formData, inschool: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="true">在校 (true)</option>
            <option value="false">離校 (false)</option>
          </select>
        </div>

        <Input
          label="UUID (選填，留空自動生成)"
          value={formData.uuid}
          onChange={(e) => setFormData({ ...formData, uuid: e.target.value })}
          placeholder="自動生成 UUID"
        />

        <div className="flex flex-col gap-3 mt-6">
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? '登入中...' : '登入'}
          </Button>
          
          <Button type="button" variant="outline" fullWidth onClick={handleAutoFill}>
            快速填入測試資料
          </Button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-primary-50 rounded-lg">
        <p className="text-sm text-gray-700 mb-2">
          <strong>說明：</strong>
        </p>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li>此頁面僅用於開發環境模擬 OAuth 登入</li>
          <li>正式環境將使用真實的 OAuth 認證</li>
          <li>UUID 會自動生成用於匿名投票</li>
        </ul>
      </div>
    </Card>
  );
}

export default function MockLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">載入中...</p>
          </div>
        </Card>
      }>
        <MockLoginForm />
      </Suspense>
    </div>
  );
}
