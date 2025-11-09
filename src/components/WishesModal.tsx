import { useEffect, useState } from 'react';
import { X, Sparkles, Loader, MessageCircle } from 'lucide-react';
import { submitWish, getWishes, Wish } from '../lib/supabase';
import Reactions from './Reactions';

interface WishesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserName: string;
  currentUserId?: string;
  currentUsername?: string;
}

export default function WishesModal({ isOpen, onClose, currentUserName, currentUserId }: WishesModalProps) {
  const [formData, setFormData] = useState<Wish>({
    name: currentUserName,
    message: ''
  });
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingWishes, setIsLoadingWishes] = useState(true);
  const [browserSessionId] = useState(() => {
    const stored = localStorage.getItem('wish_session_id');
    if (stored) return stored;
    const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem('wish_session_id', id);
    return id;
  });
  const reactionSessionId = currentUserId ? `${currentUserId}-${browserSessionId}` : browserSessionId;
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

  useEffect(() => {
    setFormData((prev) => ({ ...prev, name: currentUserName }));
  }, [currentUserName]);

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await submitWish(formData);
      setSubmitSuccess(true);
      await loadWishes();
      setTimeout(() => {
        setSubmitSuccess(false);
        setFormData({ name: currentUserName, message: '' });
      }, 1800);
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại!');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
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

      <div className="relative bg-gradient-to-br from-rose-50 via-white to-pink-50 border border-rose-100 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-rose-50 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-8 border-b border-rose-100">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-rose-500 mx-auto mb-3 animate-spin-slow" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              Gửi lời chúc
            </h2>
            <p className="text-rose-500 mt-2">
              Lưu giữ những lời chúc đẹp nhất cho lễ tốt nghiệp.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {submitSuccess ? (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-2xl font-bold text-rose-600 mb-2">Cảm ơn bạn!</h3>
              <p className="text-rose-500">Lời chúc của bạn đã được gửi thành công.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Người gửi
                </label>
                <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-semibold">
                  {formData.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lời chúc của bạn <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-400 focus:outline-none transition-colors resize-none"
                  placeholder="Hãy viết lời chúc cho lễ tốt nghiệp..."
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
                className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    Đang gửi...
                  </span>
                ) : (
                  'Gửi lời chúc'
                )}
              </button>
            </form>
          )}

          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-rose-500" />
              Lời chúc từ mọi người
            </h3>

            {isLoadingWishes ? (
              <div className="text-center py-8">
                <Loader className="w-8 h-8 text-rose-500 animate-spin mx-auto" />
              </div>
            ) : wishes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Chưa có lời chúc nào. Hãy là người đầu tiên nhé!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {wishes.map((wish) => (
                  <div
                    key={wish.id}
                    className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-lg border border-rose-200 hover:shadow-md transition-shadow animate-fade-in-up"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-gray-800">{wish.name}</p>
                      {wish.created_at && (
                        <p className="text-xs text-gray-500">{formatDate(wish.created_at)}</p>
                      )}
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{wish.message}</p>
                    {wish.id && (
                      <Reactions
                        wishId={wish.id}
                        sessionId={reactionSessionId}
                        userName={currentUserName}
                      />
                    )}
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
