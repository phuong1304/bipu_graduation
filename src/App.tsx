import { useState, useEffect } from 'react';
import { Sparkles, Heart, Music, Calendar, MapPin, Clock, PartyPopper, Users, Lock } from 'lucide-react';
import RSVPModal from './components/RSVPModal';
import WishesModal from './components/WishesModal';
import AdminPage from './pages/AdminPage';

function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false);
  const [isWishesModalOpen, setIsWishesModalOpen] = useState(false);
  const [showAdminPage, setShowAdminPage] = useState(false);
  const [adminPassword, setAdminPassword] = useState('lehoangphuc');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setShowConfetti(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const confettiPieces = Array.from({ length: 50 }, (_, i) => i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 via-fuchsia-500 to-orange-400 overflow-hidden relative">
      {showConfetti && confettiPieces.map((i) => (
        <div
          key={i}
          className="confetti absolute"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}

      <div className="stars-container">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div
          className={`max-w-4xl w-full transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border-4 border-white/50 animate-float">
            <div className="bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 p-1">
              <div className="bg-gradient-to-br from-white to-pink-50 p-8 sm:p-12 md:p-16">
                <div className="text-center space-y-6">
                  <div className="flex justify-center mb-6 animate-bounce-slow">
                    <div className="relative">
                      <PartyPopper className="w-20 h-20 text-rose-500 animate-spin-slow" />
                      <Sparkles className="w-8 h-8 text-amber-400 absolute -top-2 -right-2 animate-pulse" />
                    </div>
                  </div>

                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-rose-500 via-fuchsia-500 to-orange-500 bg-clip-text text-transparent animate-gradient leading-tight pb-2">
                    Lời Mời Tham Dự
                  </h1>

                  <div className="relative inline-block">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 animate-pulse-slow">
                      Buổi Chia Tay
                    </h2>
                    <Heart className="absolute -right-8 -top-4 w-6 h-6 text-rose-400 animate-heartbeat" />
                  </div>

                  <div className="py-8 space-y-4">
                    <div className="flex items-center justify-center gap-3 text-gray-700 hover:scale-105 transition-transform duration-300">
                      <Music className="w-6 h-6 text-fuchsia-500 animate-bounce" />
                      <p className="text-xl font-medium">
                        Sau những năm tháng gắn bó cùng nhau...
                      </p>
                    </div>

                    <p className="text-2xl sm:text-3xl font-semibold text-gray-800 animate-fade-in-up">
                      Tôi - <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600 font-bold">Lê Hoàng Phúc</span>
                    </p>

                    <p className="text-2xl sm:text-3xl font-semibold text-gray-800 animate-fade-in-up">
                      Đã đến lúc phải nói lời tạm biệt
                    </p>

                    <div className="flex items-center justify-center gap-3 text-gray-700 hover:scale-105 transition-transform duration-300">
                      <Users className="w-6 h-6 text-orange-500 animate-pulse" />
                      <p className="text-xl font-medium">
                        Để bắt đầu một chương mới trong sự nghiệp
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl p-8 my-8 border-2 border-rose-200 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in-up-delay">
                    <p className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
                      <Sparkles className="w-6 h-6 text-amber-500 animate-spin-slow" />
                      Thông Tin Buổi Nhậu
                      <Sparkles className="w-6 h-6 text-amber-500 animate-spin-slow" />
                    </p>

                    <div className="space-y-5 text-left max-w-md mx-auto">
                      <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300">
                        <Calendar className="w-6 h-6 text-rose-500 flex-shrink-0 mt-1 group-hover:scale-125 transition-transform" />
                        <div>
                          <p className="font-semibold text-gray-800">Thời gian:</p>
                          <p className="text-gray-700">Thứ Bảy, 8 tháng 11 năm 2025</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300">
                        <Clock className="w-6 h-6 text-fuchsia-500 flex-shrink-0 mt-1 group-hover:scale-125 transition-transform" />
                        <div>
                          <p className="font-semibold text-gray-800">Giờ:</p>
                          <p className="text-gray-700">18:00 - 23:59</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300">
                        <MapPin className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1 group-hover:scale-125 transition-transform" />
                        <div>
                          <p className="font-semibold text-gray-800">Địa điểm:</p>
                          <p className="text-gray-700">Làm Tí – Food & Beer</p>
                          <p className="text-sm text-gray-600">436 đường Trường Sa, Phường 2, quận Phú Nhuận, TP.Hồ Chí Minh</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-6 space-y-4 animate-fade-in-up-delay-2">
                    <p className="text-xl text-gray-700 italic">
                      "Mỗi lời tạm biệt là khởi đầu của một hành trình mới"
                    </p>

                    <div className="relative inline-block">
                      <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-rose-600">
                        Rất mong được gặp lại các bạn!
                      </p>
                      <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-fuchsia-400 rounded-lg blur opacity-30 animate-pulse-slow"></div>
                    </div>
                  </div>

                  <div className="pt-6 flex flex-wrap justify-center gap-4">
                    <button
                      onClick={() => setIsRSVPModalOpen(true)}
                      className="group relative px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Heart className="w-5 h-5 group-hover:animate-heartbeat" />
                        Xác Nhận Tham Dự
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>

                    <button
                      onClick={() => setIsWishesModalOpen(true)}
                      className="group px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                        Gửi Lời Chúc
                      </span>
                    </button>
                  </div>

                  <div className="mt-8 pt-6 border-t-2 border-rose-200">
                    <p className="text-sm text-gray-600">
                      Sự hiện diện của bạn là món quà ý nghĩa nhất với tôi
                    </p>
                    <div className="flex justify-center gap-2 mt-3">
                      {[...Array(5)].map((_, i) => (
                        <Heart
                          key={i}
                          className="w-4 h-4 text-rose-400 animate-heartbeat"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setShowPasswordPrompt(true)}
                      className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1 mx-auto"
                    >
                      <Lock className="w-3 h-3" />
                      Admin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 animate-fade-in-up-delay-3">
            <p className="text-white text-lg font-medium drop-shadow-lg">
              💝 Cảm ơn vì những kỷ niệm đẹp đẽ 💝
            </p>
          </div>
        </div>
      </div>

      <RSVPModal isOpen={isRSVPModalOpen} onClose={() => setIsRSVPModalOpen(false)} />
      <WishesModal isOpen={isWishesModalOpen} onClose={() => setIsWishesModalOpen(false)} />

      {showPasswordPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowPasswordPrompt(false); setAdminPasswordInput(''); setPasswordError(''); }}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 animate-scale-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Truy cập Admin</h2>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={adminPasswordInput}
              onChange={(e) => {
                setAdminPasswordInput(e.target.value);
                setPasswordError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (adminPasswordInput === adminPassword) {
                    setShowAdminPage(true);
                    setShowPasswordPrompt(false);
                    setAdminPasswordInput('');
                  } else {
                    setPasswordError('Mật khẩu không đúng!');
                  }
                }
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none mb-4"
            />
            {passwordError && <p className="text-red-600 text-sm mb-4">{passwordError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowPasswordPrompt(false); setAdminPasswordInput(''); setPasswordError(''); }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (adminPasswordInput === adminPassword) {
                    setShowAdminPage(true);
                    setShowPasswordPrompt(false);
                    setAdminPasswordInput('');
                  } else {
                    setPasswordError('Mật khẩu không đúng!');
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Truy cập
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdminPage && <AdminPage onBack={() => setShowAdminPage(false)} />}
    </div>
  );
}

export default App;
