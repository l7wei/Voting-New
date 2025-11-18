'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewActivityPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'candidate',
    rule: 'choose_all' as 'choose_all' | 'choose_one',
    open_from: '',
    open_to: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // TODO: Get auth token from cookie or session
      setError('請先實作管理員認證功能');
      setSubmitting(false);
      return;

      /* When auth is implemented:
      const token = getAuthToken();
      
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/admin/activities/${data.data._id}`);
      } else {
        setError(data.error || '建立活動失敗');
      }
      */
    } catch (err) {
      console.error('Error creating activity:', err);
      setError('建立活動時發生錯誤');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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
              <h1 className="text-3xl font-bold text-gray-900">新增投票活動</h1>
              <p className="text-gray-600 mt-1">建立新的投票活動</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            {/* Activity Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                活動名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="例如：第30屆學生會正副會長選舉"
              />
            </div>

            {/* Activity Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                活動類型 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="例如：candidate（候選人）"
              />
              <p className="mt-1 text-sm text-gray-500">
                建議使用英文類型，如：candidate（候選人）、referendum（公投）等
              </p>
            </div>

            {/* Voting Rule */}
            <div>
              <label htmlFor="rule" className="block text-sm font-medium text-gray-700 mb-2">
                投票方式 <span className="text-red-500">*</span>
              </label>
              <select
                id="rule"
                name="rule"
                required
                value={formData.rule}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="choose_all">多選評分（對每位候選人表達支持/反對/無意見）</option>
                <option value="choose_one">單選（只能選擇一位候選人）</option>
              </select>
            </div>

            {/* Start Date/Time */}
            <div>
              <label htmlFor="open_from" className="block text-sm font-medium text-gray-700 mb-2">
                開始時間 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="open_from"
                name="open_from"
                required
                value={formData.open_from}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* End Date/Time */}
            <div>
              <label htmlFor="open_to" className="block text-sm font-medium text-gray-700 mb-2">
                結束時間 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="open_to"
                name="open_to"
                required
                value={formData.open_to}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">注意事項：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>建立活動後，您可以新增候選人和選項</li>
                    <li>開始時間必須早於結束時間</li>
                    <li>投票僅在開始時間和結束時間之間開放</li>
                    <li>活動建立後仍可編輯，但建議在投票開始前完成所有設定</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 mt-8">
            <Link
              href="/admin"
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition text-center"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition transform hover:scale-105 disabled:transform-none"
            >
              {submitting ? '建立中...' : '建立活動'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
