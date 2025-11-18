'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
  options: Option[];
}

export default function VotingPage() {
  const params = useParams();
  const router = useRouter();
  const activityId = params.id as string;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voteToken] = useState<string>('');
  const [showConfirmation] = useState(false);

  // Vote state
  const [chooseAllVotes, setChooseAllVotes] = useState<Record<string, string>>({});
  const [chooseOneVote, setChooseOneVote] = useState<string>('');

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
        
        // Initialize vote state for choose_all
        if (data.data.rule === 'choose_all') {
          const initialVotes: Record<string, string> = {};
          data.data.options.forEach((option: Option) => {
            initialVotes[option._id] = '我沒有意見';
          });
          setChooseAllVotes(initialVotes);
        }
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

  const handleChooseAllChange = (optionId: string, remark: string) => {
    setChooseAllVotes(prev => ({
      ...prev,
      [optionId]: remark,
    }));
  };

  const handleSubmitVote = async () => {
    if (!activity) return;

    // Validate vote
    if (activity.rule === 'choose_one' && !chooseOneVote) {
      setError('請選擇一個選項');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // TODO: Get auth token from cookie or session
      // For now, we'll show an error
      setError('請先登入後再投票');
      setSubmitting(false);
      return;

      /* When auth is implemented:
      const token = getAuthToken();
      
      const voteData = {
        activity_id: activityId,
        rule: activity.rule,
        ...(activity.rule === 'choose_all' ? {
          choose_all: Object.entries(chooseAllVotes).map(([option_id, remark]) => ({
            option_id,
            remark,
          })),
        } : {
          choose_one: chooseOneVote,
        }),
      };

      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(voteData),
      });

      const data = await response.json();

      if (data.success) {
        setVoteToken(data.data.token);
        setShowConfirmation(true);
      } else {
        setError(data.error || '投票失敗');
      }
      */
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError('投票時發生錯誤');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCandidate = (candidate: Candidate, role: string) => {
    return (
      <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg border border-primary-200">
        <div className="flex items-start gap-4 mb-3">
          {candidate.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={candidate.avatar_url}
              alt={candidate.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-1 bg-primary-500 text-white text-xs font-semibold rounded">{role}</span>
            </div>
            <h4 className="font-bold text-xl text-gray-900 mb-1">{candidate.name}</h4>
            <p className="text-sm text-primary-700 font-medium">{candidate.department}</p>
            <p className="text-sm text-gray-600">{candidate.college}</p>
          </div>
        </div>
        
        {candidate.personal_experiences && candidate.personal_experiences.length > 0 && (
          <div className="mb-3 bg-white rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-bold text-gray-900">經歷</p>
            </div>
            <ul className="space-y-1">
              {candidate.personal_experiences.map((exp, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>{exp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {candidate.political_opinions && candidate.political_opinions.length > 0 && (
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-bold text-gray-900">政見</p>
            </div>
            <ul className="space-y-1">
              {candidate.political_opinions.map((opinion, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  <span>{opinion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
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
            onClick={() => router.push('/vote')}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            返回投票列表
          </button>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="inline-block p-6 bg-green-100 rounded-full mb-6">
              <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">投票成功！</h2>
            <p className="text-lg text-gray-600 mb-8">感謝您的參與，您的投票已成功送出</p>

            <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-primary-900 mb-2">投票證明 UUID</h3>
              <div className="font-mono text-sm text-primary-700 bg-white p-4 rounded-lg border border-primary-200 break-all">
                {voteToken}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                請妥善保存此 UUID，這是您投票的唯一證明。系統採用匿名投票機制，無法追溯您的投票內容。
              </p>
            </div>

            <button
              onClick={() => router.push('/vote')}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition transform hover:scale-105"
            >
              返回投票列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{activity.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>類型：{activity.type}</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>投票方式：{activity.rule === 'choose_all' ? '多選評分' : '單選'}</span>
            </div>
          </div>

          {activity.rule === 'choose_all' && (
            <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-sm text-primary-900">
                <strong>投票說明：</strong> 請對每位候選人表達您的意見（支持、反對或無意見）
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Options/Candidates */}
        <div className="space-y-6 mb-8">
          {activity.options.map((option, index) => (
            <div key={option._id} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                候選人 {index + 1}
              </h3>

              {option.candidate && renderCandidate(option.candidate, '會長')}
              {option.vice1 && renderCandidate(option.vice1, '副會長一')}
              {option.vice2 && renderCandidate(option.vice2, '副會長二')}

              {/* Vote Selection */}
              {activity.rule === 'choose_all' ? (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">您的選擇：</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleChooseAllChange(option._id, '我要投給他')}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                        chooseAllVotes[option._id] === '我要投給他'
                          ? 'bg-green-600 text-white shadow-lg transform scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                      }`}
                    >
                      支持
                    </button>
                    <button
                      onClick={() => handleChooseAllChange(option._id, '我不投給他')}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                        chooseAllVotes[option._id] === '我不投給他'
                          ? 'bg-red-600 text-white shadow-lg transform scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                      }`}
                    >
                      反對
                    </button>
                    <button
                      onClick={() => handleChooseAllChange(option._id, '我沒有意見')}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                        chooseAllVotes[option._id] === '我沒有意見'
                          ? 'bg-gray-600 text-white shadow-lg transform scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      無意見
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setChooseOneVote(option._id)}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                      chooseOneVote === option._id
                        ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-primary-100'
                    }`}
                  >
                    {chooseOneVote === option._id ? '✓ 已選擇' : '選擇此候選人'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/vote')}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition"
          >
            返回
          </button>
          <button
            onClick={handleSubmitVote}
            disabled={submitting}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition transform hover:scale-105 disabled:transform-none"
          >
            {submitting ? '提交中...' : '確認投票'}
          </button>
        </div>
      </div>
    </div>
  );
}
