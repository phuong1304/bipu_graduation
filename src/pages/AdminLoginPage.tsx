import { useState } from 'react';
import { Shield, Loader2, Lock, Info } from 'lucide-react';
import type { AppUser } from '../lib/supabase';
import { loginUser } from '../lib/supabase';

interface AdminLoginPageProps {
  onAuthenticated: (user: AppUser) => void;
}

const TEST_ADMIN_USERNAME = 'admin_master';

export default function AdminLoginPage({ onAuthenticated }: AdminLoginPageProps) {
  const [username, setUsername] = useState(TEST_ADMIN_USERNAME);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      setIsLoading(true);
      const user = await loginUser(username.trim(), 'admin');
      onAuthenticated(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-500">Đăng nhập để xem danh sách xác nhận</p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-600">
          <p className="font-semibold mb-1">Tài khoản demo</p>
          <p>Username demo: <span className="font-mono">{TEST_ADMIN_USERNAME}</span></p>
          <p className="text-xs text-gray-500 flex items-center gap-2 mt-2">
            <Info className="w-4 h-4" />
            <span>Username được tạo từ họ tên (ví dụ Hoàng Minh Nhựt -&gt; </span>
            <span className="font-mono">nhuthm</span>
            <span>)</span>
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-red-50 text-red-700 border border-red-100 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            Đăng nhập
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          <Lock className="w-4 h-4 inline-block mr-1" />
          Chỉ dành cho thành viên ban tổ chức.
        </div>
      </div>
    </div>
  );
}
