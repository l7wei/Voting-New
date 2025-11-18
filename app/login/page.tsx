'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function MockLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get('redirect_uri') || '';
  
  const [formData, setFormData] = useState({
    userid: '110000114',
    name: '測試學生',
    inschool: 'true',
    uuid: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate UUID if not provided
    const uuid = formData.uuid || crypto.randomUUID();
    
    // Store mock data in a cookie for the mock API to use
    const mockData = {
      ...formData,
      uuid,
    };
    
    // Set cookie with secure flag in production
    // NOTE: This is for development/mock OAuth only. In production, use server-side cookies.
    const isProduction = window.location.protocol === 'https:';
    const secureFlag = isProduction ? '; secure' : '';
    // codeql[js/clear-text-cookie] - Mock OAuth development cookie, secure flag added for production
    document.cookie = `mockOAuthData=${encodeURIComponent(JSON.stringify(mockData))}; path=/; max-age=300; samesite=lax${secureFlag}`;
    
    // Generate mock code and redirect
    const code = 'mock_code_' + Date.now();
    const callbackUrl = `${redirectUri}?code=${code}`;
    
    window.location.href = callbackUrl;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
          模擬 OAuth 登入
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Mock OAuth Login (Development Only)
        </p>

        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>開發模式：</strong>此頁面僅用於開發測試，可以模擬不同的學生身份登入系統。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="userid" className="block text-sm font-medium text-gray-700 mb-1">
              學號 (Student ID) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="userid"
              name="userid"
              value={formData.userid}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如: 110000114"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              姓名 (Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如: 王小明"
            />
          </div>

          <div>
            <label htmlFor="inschool" className="block text-sm font-medium text-gray-700 mb-1">
              在校狀態 (In School Status) <span className="text-red-500">*</span>
            </label>
            <select
              id="inschool"
              name="inschool"
              value={formData.inschool}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="true">在校 (True)</option>
              <option value="false">離校 (False)</option>
            </select>
          </div>

          <div>
            <label htmlFor="uuid" className="block text-sm font-medium text-gray-700 mb-1">
              UUID (選填，留空自動產生)
            </label>
            <input
              type="text"
              id="uuid"
              name="uuid"
              value={formData.uuid}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="留空自動產生"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition transform hover:scale-105 shadow-lg"
          >
            登入系統
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            取消並返回首頁
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">快速測試帳號：</h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setFormData({ userid: '110000114', name: '管理員測試', inschool: 'true', uuid: '' })}
              className="w-full text-left px-3 py-2 bg-green-50 hover:bg-green-100 text-green-800 text-sm rounded-lg transition"
            >
              <strong>管理員：</strong> 110000114 (管理員測試)
            </button>
            <button
              type="button"
              onClick={() => setFormData({ userid: '110000001', name: '一般學生', inschool: 'true', uuid: '' })}
              className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-sm rounded-lg transition"
            >
              <strong>學生：</strong> 110000001 (一般學生)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MockLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    }>
      <MockLoginForm />
    </Suspense>
  );
}
