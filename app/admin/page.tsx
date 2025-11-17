import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth/jwt';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('service_token');

  if (!token) {
    redirect('/');
  }

  try {
    const user = verifyToken(token.value);
    
    if (user.remark !== 'admin') {
      redirect('/voting');
    }
    
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <h1 className="text-2xl font-bold text-gray-900">管理後台</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  管理員: {user.student_id}
                </span>
                <a
                  href="/voting"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  返回投票
                </a>
                <a
                  href="/api/auth/logout"
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  登出
                </a>
              </div>
            </div>
          </div>
        </nav>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdminDashboard />
        </main>
      </div>
    );
  } catch (error) {
    redirect('/');
  }
}
