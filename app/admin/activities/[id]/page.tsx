'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Candidate {
  name: string;
  department: string;
  college: string;
  avatar_url?: string;
  personal_experiences?: string[];
  political_opinions?: string[];
}

interface Option {
  _id: string;
  type: string;
  candidate?: Candidate;
  vice1?: Candidate;
  vice2?: Candidate;
}

interface Activity {
  _id: string;
  name: string;
  type: string;
  rule: 'choose_all' | 'choose_one';
  open_from: string;
  open_to: string;
  users: string[];
  options: Option[];
}

export default function ActivityManagementPage() {
  const params = useParams();
  const router = useRouter();
  const activityId = params.id as string;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddCandidate, setShowAddCandidate] = useState(false);

  // Form state for adding candidate
  // Form state for adding candidate - to be implemented
  // const [candidateForm, setCandidateForm] = useState({...});
  const [includeVice1, setIncludeVice1] = useState(false);
  const [includeVice2, setIncludeVice2] = useState(false);

  useEffect(() => {
    fetchActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  const fetchActivity = async () => {
    try {
      const response = await fetch(`/api/activities/${activityId}?include_options=true`);
      const data = await response.json();

      if (data.success) {
        setActivity(data.data);
      } else {
        setError(data.error || '無法載入投票活動');
      }
    } catch (err) {
      console.error('Error fetching activity:', err);
      setError('載入投票活動時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async () => {
    setError('');
    
    try {
      // TODO: Implement with auth token
      setError('請先實作管理員認證功能');
    } catch (err) {
      console.error('Error adding candidate:', err);
      setError('新增候選人時發生錯誤');
    }
  };

  const handleDeleteOption = async (_optionId: string) => {
    if (!confirm('確定要刪除此候選人嗎？')) {
      return;
    }

    try {
      // TODO: Implement with auth token
      setError('請先實作管理員認證功能');
    } catch (err) {
      console.error('Error deleting option:', err);
      setError('刪除候選人時發生錯誤');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">找不到投票活動</h2>
          <button
            onClick={() => router.push('/admin')}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            返回管理後台
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
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
                <h1 className="text-3xl font-bold text-gray-900">{activity.name}</h1>
                <p className="text-gray-600 mt-1">管理候選人與活動設定</p>
              </div>
            </div>
            <Link
              href={`/admin/activities/${activityId}/results`}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              查看統計
            </Link>
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

        {/* Activity Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">活動資訊</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">活動類型</p>
              <p className="font-medium text-gray-900">{activity.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">投票方式</p>
              <p className="font-medium text-gray-900">
                {activity.rule === 'choose_all' ? '多選評分' : '單選'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">開始時間</p>
              <p className="font-medium text-gray-900">
                {new Date(activity.open_from).toLocaleString('zh-TW')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">結束時間</p>
              <p className="font-medium text-gray-900">
                {new Date(activity.open_to).toLocaleString('zh-TW')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">候選人數</p>
              <p className="font-medium text-gray-900">{activity.options.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">已投票人數</p>
              <p className="font-medium text-gray-900">{activity.users.length}</p>
            </div>
          </div>
        </div>

        {/* Candidates List */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">候選人列表</h2>
            <button
              onClick={() => setShowAddCandidate(!showAddCandidate)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              {showAddCandidate ? '取消新增' : '+ 新增候選人'}
            </button>
          </div>

          {/* Add Candidate Form */}
          {showAddCandidate && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">新增候選人</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900">
                  <strong>說明：</strong> 請填寫候選人資訊。如果是會長選舉，可以選擇是否包含副會長。
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="王小明"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">系所 *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="資訊工程學系 22 級"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">學院 *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="電機資訊學院"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">照片網址</label>
                  <input
                    type="url"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={includeVice1}
                      onChange={(e) => setIncludeVice1(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">包含副會長一</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={includeVice2}
                      onChange={(e) => setIncludeVice2(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">包含副會長二</span>
                  </label>
                </div>

                <button
                  onClick={handleAddCandidate}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  確認新增
                </button>
              </div>
            </div>
          )}

          {/* Candidates Display */}
          {activity.options.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">目前沒有候選人</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activity.options.map((option, index) => (
                <div key={option._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900">候選人 {index + 1}</h3>
                    <button
                      onClick={() => handleDeleteOption(option._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      刪除
                    </button>
                  </div>

                  <div className="space-y-4">
                    {option.candidate && (
                      <div className="flex items-start">
                        {option.candidate.avatar_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={option.candidate.avatar_url}
                            alt={option.candidate.name}
                            className="w-16 h-16 rounded-full mr-4 object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">會長：{option.candidate.name}</p>
                          <p className="text-sm text-gray-600">{option.candidate.department}</p>
                          <p className="text-sm text-gray-500">{option.candidate.college}</p>
                        </div>
                      </div>
                    )}
                    {option.vice1 && (
                      <div className="flex items-start">
                        {option.vice1.avatar_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={option.vice1.avatar_url}
                            alt={option.vice1.name}
                            className="w-16 h-16 rounded-full mr-4 object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">副會長一：{option.vice1.name}</p>
                          <p className="text-sm text-gray-600">{option.vice1.department}</p>
                          <p className="text-sm text-gray-500">{option.vice1.college}</p>
                        </div>
                      </div>
                    )}
                    {option.vice2 && (
                      <div className="flex items-start">
                        {option.vice2.avatar_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={option.vice2.avatar_url}
                            alt={option.vice2.name}
                            className="w-16 h-16 rounded-full mr-4 object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">副會長二：{option.vice2.name}</p>
                          <p className="text-sm text-gray-600">{option.vice2.department}</p>
                          <p className="text-sm text-gray-500">{option.vice2.college}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
