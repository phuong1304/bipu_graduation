import { useState, useEffect } from 'react';
import { X, Sparkles, Loader, MessageCircle } from 'lucide-react';
import { submitWish, getWishes, Wish } from '../lib/supabase';
import WishReactions from './WishReactions';

interface WishesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WishesModal({ isOpen, onClose }: WishesModalProps) {
  const [formData, setFormData] = useState<Wish>({
    name: '',
    message: '',
  });
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingWishes, setIsLoadingWishes] = useState(true);
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('wish_session_id');
    if (stored) return stored;
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('wish_session_id', id);
    return id;
  });

  useEffect(() => {
    if (isOpen) {
      loadWishes();
    }
  }, [isOpen]);

  const loadWishes = async () => {
    try {
      setIsLoadingWishes(true);
      const data = await getWishes();
      setWishes(data || []);
    } catch (err) {
      console.error('Error loading wishes:', err);
    } finally {
      setIsLoadingWishes(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await submitWish(formData);
      setSubmitSuccess(true);
      await loadWishes();
      setTimeout(() => {
        setSubmitSuccess(false);
        setFormData({ name: '', message: '' });
      }, 2000);
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại!');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-8 border-b">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-3 animate-spin-slow" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Gửi Lời Chúc
            </h2>
            <p className="text-gray-600 mt-2">Để lại những lời chúc tốt đẹp</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {submitSuccess ? (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold text-amber-600 mb-2">Cảm ơn bạn!</h3>
              <p className="text-gray-600">Lời chúc của bạn đã được gửi đi</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên của bạn <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-400 focus:outline-none transition-colors"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lời chúc của bạn <span className="text-amber-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-400 focus:outline-none transition-colors resize-none"
                  placeholder="Viết lời chúc của bạn..."
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    Đang gửi...
                  </span>
                ) : (
                  'Gửi Lời Chúc'
                )}
              </button>
            </form>
          )}

          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-amber-500" />
              Lời chúc từ mọi người
            </h3>

            {isLoadingWishes ? (
              <div className="text-center py-8">
                <Loader className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
              </div>
            ) : wishes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Chưa có lời chúc nào. Hãy là người đầu tiên!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {wishes.map((wish) => (
                  <div
                    key={wish.id}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200 hover:shadow-md transition-shadow animate-fade-in-up"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-gray-800">{wish.name}</p>
                      {wish.created_at && (
                        <p className="text-xs text-gray-500">{formatDate(wish.created_at)}</p>
                      )}
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap mb-3">{wish.message}</p>
                    {wish.id && <WishReactions wishId={wish.id} sessionId={sessionId} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
