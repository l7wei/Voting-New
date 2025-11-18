'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MockLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    userid: '',
    name: '',
    inschool: 'true',
    uuid: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateUUID = () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    setFormData({ ...formData, uuid });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userid || !formData.name) {
      setError('請填寫必填欄位');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send login data to mock OAuth endpoint
      const response = await fetch('/api/auth/mock-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to voting page or admin page based on role
        router.push(data.redirectUrl || '/vote');
      } else {
        setError(data.error || '登入失敗');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('登入時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              模擬 OAuth 登入
            </h2>
            <p className="text-gray-600 text-sm">
              Mock OAuth Login (開發測試用)
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="userid" className="block text-sm font-medium text-gray-700 mb-2">
                學號 (userid) <span className="text-red-500">*</span>
              </label>
              <input
                id="userid"
                type="text"
                required
                value={formData.userid}
                onChange={(e) => setFormData({ ...formData, userid: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="例如: 110000114"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                姓名 (name) <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="例如: 王小明"
              />
            </div>

            <div>
              <label htmlFor="inschool" className="block text-sm font-medium text-gray-700 mb-2">
                在校狀態 (inschool)
              </label>
              <select
                id="inschool"
                value={formData.inschool}
                onChange={(e) => setFormData({ ...formData, inschool: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="true">在校 (true)</option>
                <option value="false">離校 (false)</option>
              </select>
            </div>

            <div>
              <label htmlFor="uuid" className="block text-sm font-medium text-gray-700 mb-2">
                UUID
              </label>
              <div className="flex gap-2">
                <input
                  id="uuid"
                  type="text"
                  value={formData.uuid}
                  onChange={(e) => setFormData({ ...formData, uuid: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="自動產生或手動輸入"
                />
                <button
                  type="button"
                  onClick={generateUUID}
                  className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition font-medium"
                >
                  產生
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  登入中...
                </span>
              ) : (
                '登入'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-800 transition"
            >
              ← 返回首頁
            </Link>
          </div>

          {/* Development Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 text-center">
              ⚠️ 此為開發測試用模擬登入介面
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
