import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center mb-4 text-blue-600">
          清大學生會投票系統
        </h1>
        <h2 className="text-2xl text-center mb-8 text-gray-600">
          NTHU Student Association Voting System
        </h2>

        <div className="space-y-6">
          <p className="text-lg text-gray-700">
            歡迎使用清華大學學生會線上投票系統。本系統採用現代化技術架構，確保投票過程的匿名性與安全性。
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-6 border-2 border-blue-200 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-blue-700">
                學生投票
              </h3>
              <p className="text-gray-600 mb-4">
                登入後參與投票活動
              </p>
              <Link
                href="/api/auth/login"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded transition"
              >
                登入投票
              </Link>
            </div>

            <div className="p-6 border-2 border-green-200 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-green-700">
                管理後台
              </h3>
              <p className="text-gray-600 mb-4">
                管理員登入後台管理
              </p>
              <Link
                href="/admin"
                className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition"
              >
                後台管理
              </Link>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-900">
              系統特色
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>✅ 完全匿名投票（使用 UUID 技術）</li>
              <li>✅ 僅記錄是否投票，不記錄投票內容</li>
              <li>✅ OAuth 安全認證</li>
              <li>✅ 現代化使用者介面</li>
              <li>✅ 支援多種投票方式</li>
              <li>✅ 即時投票統計</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
