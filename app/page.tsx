import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            清大線上投票系統
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            國立清華大學學生會線上投票平台
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="space-y-4">
            <Link
              href="/api/auth/login"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              使用 CCXP OAuth 登入
            </Link>
            
            {process.env.NODE_ENV === 'development' && (
              <Link
                href="/api/auth/mock-login"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                開發模式登入（模擬）
              </Link>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>此平台使用清大計中 OAuth 2 登入驗證</p>
          <p>投票系統不會取得您的帳密資訊</p>
        </div>
      </div>
    </main>
  );
}
