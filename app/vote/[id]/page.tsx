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

interface VoteChoice {
  option_id: string;
  remark: '我要投給他' | '我不投給他' | '我沒有意見';
}

export default function VotingPage() {
  const params = useParams();
  const router = useRouter();
  const activityId = params.id as string;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voteToken, setVoteToken] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Vote state
  const [chooseAllVotes, setChooseAllVotes] = useState<Record<string, string>>({});
  const [chooseOneVote, setChooseOneVote] = useState<string>('');

  useEffect(() => {
    fetchActivity();
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
      <div className="mb-4">
        <div className="flex items-center mb-2">
          {candidate.avatar_url && (
            <img
              src={candidate.avatar_url}
              alt={candidate.name}
              className="w-16 h-16 rounded-full mr-4 object-cover"
            />
          )}
          <div>
            <h4 className="font-semibold text-lg">{role}: {candidate.name}</h4>
            <p className="text-sm text-gray-600">{candidate.department}</p>
            <p className="text-sm text-gray-500">{candidate.college}</p>
          </div>
        </div>
        {candidate.personal_experiences && candidate.personal_experiences.length > 0 && (
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-700">經歷：</p>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {candidate.personal_experiences.map((exp, idx) => (
                <li key={idx}>{exp}</li>
              ))}
            </ul>
          </div>
        )}
        {candidate.political_opinions && candidate.political_opinions.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700">政見：</p>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {candidate.political_opinions.map((opinion, idx) => (
                <li key={idx}>{opinion}</li>
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
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

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">投票證明 UUID</h3>
              <div className="font-mono text-sm text-blue-700 bg-white p-4 rounded-lg border border-blue-200 break-all">
                {voteToken}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                請妥善保存此 UUID，這是您投票的唯一證明。系統採用匿名投票機制，無法追溯您的投票內容。
              </p>
            </div>

            <button
              onClick={() => router.push('/vote')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition transform hover:scale-105"
            >
              返回投票列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
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
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
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
                        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
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
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition transform hover:scale-105 disabled:transform-none"
          >
            {submitting ? '提交中...' : '確認投票'}
          </button>
        </div>
      </div>
    </div>
  );
}
