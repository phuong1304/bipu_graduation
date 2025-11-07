import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Download, Loader, AlertCircle } from 'lucide-react';
import { getRSVPResponses, RSVPResponse } from '../lib/supabase';

interface AdminPageProps {
  onBack: () => void;
}

export default function AdminPage({ onBack }: AdminPageProps) {
  const [rsvpList, setRsvpList] = useState<RSVPResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRSVPData();
  }, []);

  const loadRSVPData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getRSVPResponses();
      setRsvpList(data || []);
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại!');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalAttending = rsvpList.filter(r => r.will_attend).reduce((sum, r) => sum + (r.guest_count || 1), 0);
  const totalConfirmed = rsvpList.filter(r => r.will_attend).length;

  const exportToCSV = () => {
    const headers = ['Họ tên', 'Email', 'Số điện thoại', 'Số người', 'Yêu cầu đặc biệt', 'Xác nhận', 'Thời gian'];
    const rows = rsvpList.map(r => [
      r.name,
      r.email,
      r.phone || '',
      r.guest_count,
      r.dietary_requirements || '',
      r.will_attend ? 'Có' : 'Không',
      formatDate(r.created_at || '')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `danh-sach-xac-nhan-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 overflow-hidden relative p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border-4 border-white/50">
          <div className="p-8 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">Danh Sách Xác Nhận Tham Dự</h1>
            </div>
            <p className="text-gray-600">Quản lý danh sách khách mời đã xác nhận</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-blue-600 font-semibold mb-1">Tổng xác nhận</p>
                <p className="text-3xl font-bold text-blue-700">{totalConfirmed}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200">
                <p className="text-sm text-green-600 font-semibold mb-1">Tổng khách</p>
                <p className="text-3xl font-bold text-green-700">{totalAttending}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200">
                <p className="text-sm text-purple-600 font-semibold mb-1">Trung bình/người</p>
                <p className="text-3xl font-bold text-purple-700">
                  {totalConfirmed > 0 ? (totalAttending / totalConfirmed).toFixed(1) : '0'}
                </p>
              </div>
            </div>

            {totalConfirmed > 0 && (
              <button
                onClick={exportToCSV}
                className="mb-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
              >
                <Download className="w-5 h-5" />
                Tải xuống CSV
              </button>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : rsvpList.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>Chưa có ai xác nhận tham dự</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-100 to-purple-100 border-b-2 border-blue-200">
                      <th className="px-6 py-4 text-left font-bold text-gray-800">Họ tên</th>
                      <th className="px-6 py-4 text-left font-bold text-gray-800">Email</th>
                      <th className="px-6 py-4 text-left font-bold text-gray-800">Số ĐT</th>
                      <th className="px-6 py-4 text-center font-bold text-gray-800">Số người</th>
                      <th className="px-6 py-4 text-left font-bold text-gray-800">Yêu cầu đặc biệt</th>
                      <th className="px-6 py-4 text-center font-bold text-gray-800">Xác nhận</th>
                      <th className="px-6 py-4 text-left font-bold text-gray-800">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rsvpList.map((rsvp, index) => (
                      <tr
                        key={rsvp.id || index}
                        className={`border-b transition-colors ${
                          index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-blue-100'
                        }`}
                      >
                        <td className="px-6 py-4 font-semibold text-gray-800">{rsvp.name}</td>
                        <td className="px-6 py-4 text-gray-700">{rsvp.email}</td>
                        <td className="px-6 py-4 text-gray-700">{rsvp.phone || '-'}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full">
                            {rsvp.guest_count}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 text-sm max-w-xs truncate" title={rsvp.dietary_requirements}>
                          {rsvp.dietary_requirements || '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-block px-4 py-2 rounded-full font-semibold text-sm ${
                              rsvp.will_attend
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {rsvp.will_attend ? 'Có' : 'Không'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {rsvp.created_at ? formatDate(rsvp.created_at) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
