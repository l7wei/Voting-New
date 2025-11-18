'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoginModal from '@/components/LoginModal';

export default function HomePage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if service_token cookie exists by making a test API call
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
        if (!data.authenticated) {
          // Show login modal after a short delay for better UX
          setTimeout(() => setShowLoginModal(true), 500);
        }
      } else {
        setShowLoginModal(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setShowLoginModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50">
      <LoginModal isOpen={showLoginModal} />
      
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-center mb-3 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          清大學生會投票系統
        </h1>
        <h2 className="text-xl text-center mb-10 text-gray-500 font-light">
          NTHU Student Association Voting System
        </h2>

        {!isAuthenticated && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-center">
              <strong>請先登入</strong> 才能使用投票系統功能
            </p>
          </div>
        )}

        <div className="space-y-8">
          <p className="text-lg text-gray-700 text-center leading-relaxed">
            歡迎使用清華大學學生會線上投票系統<br />
            採用現代化技術架構，確保投票過程的匿名性與安全性
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="group p-8 border-2 border-primary-200 rounded-2xl hover:border-primary-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full mr-3 group-hover:bg-primary-500 transition-colors">
                  <svg className="w-6 h-6 text-primary-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-primary-700">
                  學生投票
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                選擇投票活動，進行投票，完成後取得投票證明
              </p>
              {isAuthenticated ? (
                <Link
                  href="/vote"
                  className="inline-block w-full text-center bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition transform hover:scale-105 shadow-lg"
                >
                  前往投票
                </Link>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="inline-block w-full text-center bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg cursor-not-allowed"
                  disabled
                >
                  需要登入
                </button>
              )}
            </div>

            <div className="group p-8 border-2 border-green-200 rounded-2xl hover:border-green-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 rounded-full mr-3 group-hover:bg-green-500 transition-colors">
                  <svg className="w-6 h-6 text-green-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-700">
                  管理後台
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                新增投票、管理候選人、查看投票統計
              </p>
              {isAuthenticated ? (
                <Link
                  href="/admin"
                  className="inline-block w-full text-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition transform hover:scale-105 shadow-lg"
                >
                  後台管理
                </Link>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="inline-block w-full text-center bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg cursor-not-allowed"
                  disabled
                >
                  需要登入
                </button>
              )}
            </div>
          </div>

          <div className="mt-10 p-8 bg-gradient-to-r from-primary-50 to-purple-50 rounded-2xl border border-primary-100">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 text-center">
              🌟 系統特色
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">完全匿名投票</p>
                  <p className="text-sm text-gray-600">使用 UUID 技術保護隱私</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">安全認證</p>
                  <p className="text-sm text-gray-600">OAuth 與 JWT 雙重保護</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">現代化介面</p>
                  <p className="text-sm text-gray-600">響應式設計，支援各種裝置</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">即時統計</p>
                  <p className="text-sm text-gray-600">管理員可查看投票結果</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2024 清華大學學生會資訊部</p>
            <p className="mt-1">National Tsing Hua University Student Association</p>
          </div>
        </div>
      </div>
    </div>
  );
}
