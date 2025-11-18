'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface OptionStat {
  option_id: string;
  name: string;
  support: number;
  oppose: number;
  neutral: number;
  total: number;
}

interface Statistics {
  totalVotes: number;
  totalEligibleVoters: number;
  turnoutRate: string;
  optionStats: OptionStat[];
}

interface ActivityInfo {
  id: string;
  name: string;
  type: string;
  rule: string;
  open_from: string;
  open_to: string;
}

interface StatsData {
  activity: ActivityInfo;
  statistics: Statistics;
}

export default function ResultsPage() {
  const params = useParams();
  const activityId = params.id as string;

  const [stats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, [activityId]);

  const fetchStatistics = async () => {
    try {
      // TODO: Get auth token and make request
      setError('請先實作管理員認證功能');
      setLoading(false);
      
      /* When auth is implemented:
      const token = getAuthToken();
      
      const response = await fetch(`/api/stats?activity_id=${activityId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || '無法載入統計資料');
      }
      */
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('載入統計資料時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Link
              href={`/admin/activities/${activityId}`}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">投票統計</h1>
              <p className="text-gray-600 mt-1">
                {stats?.activity.name || '載入中...'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {stats ? (
          <>
            {/* Overall Statistics */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">總投票數</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {stats.statistics.totalVotes}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-100 rounded-full">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">合格投票人數</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {stats.statistics.totalEligibleVoters}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-100 rounded-full">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">投票率</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {stats.statistics.turnoutRate}%
                    </p>
                  </div>
                  <div className="p-4 bg-green-100 rounded-full">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">候選人得票統計</h2>

              {stats.activity.rule === 'choose_all' ? (
                <div className="space-y-6">
                  {stats.statistics.optionStats.map((option, index) => (
                    <div key={option.option_id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        候選人 {index + 1}: {option.name}
                      </h3>

                      <div className="grid md:grid-cols-3 gap-4">
                        {/* Support */}
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-green-900">支持</span>
                            <span className="text-lg font-bold text-green-600">{option.support}</span>
                          </div>
                          <div className="w-full bg-green-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${getPercentage(option.support, option.total)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-green-700 mt-1 text-right">
                            {getPercentage(option.support, option.total)}%
                          </p>
                        </div>

                        {/* Oppose */}
                        <div className="bg-red-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-red-900">反對</span>
                            <span className="text-lg font-bold text-red-600">{option.oppose}</span>
                          </div>
                          <div className="w-full bg-red-200 rounded-full h-2">
                            <div
                              className="bg-red-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${getPercentage(option.oppose, option.total)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-red-700 mt-1 text-right">
                            {getPercentage(option.oppose, option.total)}%
                          </p>
                        </div>

                        {/* Neutral */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-900">無意見</span>
                            <span className="text-lg font-bold text-gray-600">{option.neutral}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gray-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${getPercentage(option.neutral, option.total)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-700 mt-1 text-right">
                            {getPercentage(option.neutral, option.total)}%
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-gray-600">
                        總表達意見數：{option.total}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.statistics.optionStats.map((option, index) => (
                    <div key={option.option_id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900">
                          候選人 {index + 1}: {option.name}
                        </span>
                        <span className="text-2xl font-bold text-purple-600">{option.support}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-purple-600 h-4 rounded-full transition-all duration-500"
                          style={{
                            width: `${getPercentage(
                              option.support,
                              stats.statistics.totalVotes
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 text-right">
                        {getPercentage(option.support, stats.statistics.totalVotes)}%
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Info */}
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">活動資訊</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">活動類型</p>
                  <p className="font-medium text-gray-900">{stats.activity.type}</p>
                </div>
                <div>
                  <p className="text-gray-600">投票方式</p>
                  <p className="font-medium text-gray-900">
                    {stats.activity.rule === 'choose_all' ? '多選評分' : '單選'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">開始時間</p>
                  <p className="font-medium text-gray-900">
                    {new Date(stats.activity.open_from).toLocaleString('zh-TW')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">結束時間</p>
                  <p className="font-medium text-gray-900">
                    {new Date(stats.activity.open_to).toLocaleString('zh-TW')}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">
              {error || '無法載入統計資料'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
