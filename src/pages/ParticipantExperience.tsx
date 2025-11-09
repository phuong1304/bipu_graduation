import { useEffect, useState, type ReactNode } from 'react';
import { Sparkles, Heart, Music, Calendar, MapPin, Clock, GraduationCap, Users } from 'lucide-react';
import WishesModal from '../components/WishesModal';
import RSVPModal from '../components/RSVPModal';
import DinnerInviteModal from '../components/DinnerInviteModal';
import type { AppUser, Wish } from '../lib/supabase';
import { updateDinnerAttendance, getWishes } from '../lib/supabase';
import gradPhoto from '../../assets/bipu.jpg';
import sendIcon from '../../assets/icon/send.svg';

interface ParticipantExperienceProps {
  user: AppUser;
  onLogout: () => void;
}

export default function ParticipantExperience({ user, onLogout }: ParticipantExperienceProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false);
  const [isWishesModalOpen, setIsWishesModalOpen] = useState(false);
  const [isDinnerModalOpen, setIsDinnerModalOpen] = useState(false);
  const [lastCeremonyDecision, setLastCeremonyDecision] = useState<boolean | null>(null);
  const [canAttendDinner, setCanAttendDinner] = useState(Boolean(user.invited_to_dinner));
  const [isSavingDinnerChoice, setIsSavingDinnerChoice] = useState(false);
  const [previewWishes, setPreviewWishes] = useState<Wish[]>([]);
  const [isLoadingWishes, setIsLoadingWishes] = useState(false);
  const friendlyName = user.salutation?.trim()
    ? `${user.salutation.trim()} ${user.display_name}`
    : user.display_name;

  useEffect(() => {
    setCanAttendDinner(Boolean(user.invited_to_dinner));
  }, [user.invited_to_dinner]);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setShowConfetti(true), 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadPreviewWishes = async () => {
      try {
        setIsLoadingWishes(true);
        const data = await getWishes();
        setPreviewWishes((data || []).slice(0, 4));
      } catch (error) {
        console.error('Unable to load wishes preview', error);
      } finally {
        setIsLoadingWishes(false);
      }
    };

    loadPreviewWishes();
  }, []);

  const confettiPieces = Array.from({ length: 30 }, (_, index) => index);

  const handleCeremonyDecision = (willAttend: boolean) => {
    setLastCeremonyDecision(willAttend);
    setIsRSVPModalOpen(false);
    if (canAttendDinner) {
      setIsDinnerModalOpen(true);
    } else {
      setIsWishesModalOpen(true);
    }
  };

  const handleDinnerChoice = async (attending: boolean) => {
    if (!user.id) {
      setIsDinnerModalOpen(false);
      setIsWishesModalOpen(true);
      return;
    }

    try {
      setIsSavingDinnerChoice(true);
      await updateDinnerAttendance(user.id, attending);
      setCanAttendDinner(attending);
    } catch (error) {
      console.error('Unable to update dinner attendance', error);
    } finally {
      setIsSavingDinnerChoice(false);
      setIsDinnerModalOpen(false);
      setIsWishesModalOpen(true);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 relative overflow-hidden">

      <div className="absolute top-4 right-4 z-20 flex items-center gap-3 bg-white/85 text-slate-700 px-4 py-2 rounded-full shadow-lg">
        <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">Xin chào, {friendlyName}</span>
        <button
          onClick={() => {
            setIsRSVPModalOpen(false);
            setIsDinnerModalOpen(false);
            setIsWishesModalOpen(false);
            onLogout();
          }}
          className="text-xs sm:text-sm font-bold uppercase tracking-wide hover:text-indigo-500 transition-colors"
        >
          Đăng xuất
        </button>
      </div>

      {showConfetti &&
  confettiPieces.map((piece) => {
    const delay = Math.random() * 3;
    const dur = 5 + Math.random() * 4;

    // rải ngang toàn màn hình + dư ra 20vw để quỹ đạo đi qua cả góc trên-phải
    const x0 = Math.random() * 100;   // start off-screen bên trái
    const y0 = Math.random() * 100;   // start phía trên để bay chéo xuống

    const travel = 160 + Math.random() * 70; // quãng đường giống nhau cho X/Y để giữ 45°
    const dx = travel;
    const dy = travel;
    const sx = 0.4 + Math.random() * 0.4;

    return (  
      <div
        key={piece}
        className="confetti"
        style={{
          ['--x0' as any]: `${x0}vw`,
          ['--y0' as any]: `${y0}vh`,
          ['--dx' as any]: `${dx}vw`,
          ['--dy' as any]: `${dy}vh`,
          ['--dur' as any]: `${dur}s`,
          ['--sx' as any]: sx.toString(),
          animationDelay: `${delay}s`,
        }}
      />
    );
  })}


      <div className="stars-container">
        {Array.from({ length: 30 }).map((_, index) => (
          <div
            key={index}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
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
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-[0_25px_70px_rgba(12,16,38,0.55)] overflow-hidden border border-indigo-100 animate-float">
            <div className="bg-gradient-to-r from-rose-300 via-sky-300 to-indigo-300 p-[1px]">
              <div className="bg-white p-8 sm:p-12 md:p-16 space-y-12">
                <header className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="relative">
                      <GraduationCap className="w-20 h-20 text-indigo-500" />
                      <Sparkles className="w-8 h-8 text-pink-400 absolute -top-2 -right-2 animate-pulse" />
                    </div>
                  </div>

                  <p className="uppercase tracking-[0.35em] text-xs sm:text-sm text-indigo-300 font-semibold">Thiệp mời đặc biệt</p>

                  <div className="flex flex-col gap-2 text-center text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-400 bg-clip-text text-transparent leading-[1.1]">
                    <span>Lễ Tốt Nghiệp</span>
                    <span className='leading-[1.4]'>Vũ Thị Bích Phương</span>
                  </div>

                  <p className="text-base sm:text-lg md:text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed">
                    Chúng tôi trân trọng gửi đến bạn lời mời tham dự khoảnh khắc đánh dấu cột mốc trưởng thành của{' '}
                    <span className="font-semibold text-indigo-600">Vũ Thị Bích Phương</span>. Hãy đến Đại học FPT - Khu Công Nghệ Cao để cùng sẻ chia niềm vui
                    và lưu lại những ký ức đẹp nhất.
                  </p>

                  <div className="w-full flex justify-center">
                    <div className="w-full sm:w-10/12 lg:w-4/5 rounded-[2.5rem] border border-indigo-100 bg-white shadow-2xl overflow-hidden">
                      <img src={gradPhoto} alt="Vũ Thị Bích Phương" className="w-full h-80 sm:h-[32rem] object-cover object-center" />
                    </div>
                  </div>
                </header>

                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoPill icon={<Calendar className="w-5 h-5" />} title="Thời gian" accent="from-indigo-500 to-purple-500">
                    20/11/2025 · 08:00 - 09:00 & từ 11:00 trở đi
                  </InfoPill>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=%C4%90%E1%BA%A1i+h%E1%BB%8Dc+FPT+-+Khu+C%C3%B4ng+Ngh%E1%BB%87+Cao"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <InfoPill icon={<MapPin className="w-5 h-5" />} title="Địa điểm" accent="from-pink-500 to-rose-500">
                      Đại học FPT - Khu Công Nghệ Cao
                      <p className="text-xs font-semibold text-rose-500">Nhấn để mở Google Maps</p>
                    </InfoPill>
                  </a>
                  
                  <InfoPill icon={<Clock className="w-5 h-5" />} title="Check-in" accent="from-blue-500 to-cyan-500">
                    09:20 - 09:40 · Tầng 5 Hội trường A (Session 3)
                  </InfoPill>
                  <InfoPill icon={<Music className="w-5 h-5" />} title="Dress code" accent="from-amber-500 to-orange-500">
                    Elegant pastel · Touch of gold
                  </InfoPill>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                  <article className="bg-white rounded-2xl p-5 sm:p-6 border border-indigo-100 shadow-lg space-y-1.5">
                    <h3 className="text-lg font-semibold text-indigo-600 mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Hành trình lễ
                    </h3>
                    <TimelineItem time="07:00 - 08:00" title="Khai mạc Convocation Day" description="Không khí tưng bừng tại sân trường Đại học FPT - Khu Công Nghệ Cao." />
                    <TimelineItem
                      time="08:00 - 09:00"
                      title="Khoảng thời gian chụp hình lý tưởng"
                      description="Ánh sáng đẹp nhất để chụp ảnh cùng gia đình và bạn bè."
                      highlight
                    />
                    <TimelineItem
                      time="09:20 - 09:40"
                      title="Check-in tân cử nhân (Session 3)"
                      description="Có mặt tại tầng 5 Hội trường A. Sau 09:40 đóng check-in."
                    />
                    <TimelineItem
                      time="09:40 - 10:20"
                      title="Trên sân khấu lễ trao bằng"
                      description="Session trao bằng & nhận Graduated Kit số 3. Lối vào tầng 5, lối ra tầng 4."
                    />
                    <TimelineItem
                      time="Sau 11:00"
                      title="Golden hours chụp hình"
                      description="Hội trường mở cửa tầng 4-5 · Nhận quà tốt nghiệp & chụp ảnh cùng người thân."
                      highlight
                    />
                  </article>

                  <div className="space-y-6">
                    <article className="bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 rounded-2xl p-5 sm:p-6 text-slate-700 shadow-xl border border-rose-100 space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-rose-600">
                        <Heart className="w-5 h-5 text-rose-500" />
                        Lời nhắn từ Phương
                      </h3>
                      <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                        “Ngày tốt nghiệp không chỉ là cột mốc của riêng mình mà còn là thành quả của tình yêu thương, sự dạy dỗ và đồng hành của mọi người. Mong được
                        nhìn thấy nụ cười của bạn tại Đại học FPT để chúng ta cùng nhau viết tiếp những ký ức thật đẹp.”
                      </p>
                      <p className="text-sm sm:text-base text-rose-500 italic">— Vũ Thị Bích Phương</p>
                    </article>

                    <article className="bg-white rounded-2xl border border-rose-100 shadow-lg p-5 sm:p-6 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-rose-600 font-semibold text-lg">
                          <Heart className="w-5 h-5" />
                          Lời chúc dành cho Phương
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsWishesModalOpen(true)}
                          aria-label="Xem tất cả lời chúc"
                          className="flex items-center justify-center border border-rose-200 rounded-full w-8 h-8 hover:bg-rose-50 transition"
                        >
                          <img src={sendIcon} alt="" className="w-4 h-4" />
                          <span className="sr-only">Xem tất cả lời chúc</span>
                        </button>
                      </div>
                      <div className="text-xs text-slate-500">
                        Gửi lời yêu thương và đọc những chia sẻ từ bạn bè ngay tại đây.
                      </div>
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {isLoadingWishes ? (
                          <p className="text-sm text-slate-500">Đang tải lời chúc...</p>
                        ) : previewWishes.length === 0 ? (
                          <p className="text-sm text-slate-500">Chưa có lời chúc nào. Hãy là người đầu tiên nhé!</p>
                        ) : (
                          previewWishes.map((wish) => (
                            <div key={wish.id ?? `${wish.name}-${wish.message}`} className="bg-gradient-to-r from-rose-50 to-white border border-rose-100 rounded-2xl p-3">
                              <p className="text-sm font-semibold text-rose-600">{wish.name}</p>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">{wish.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </article>
                  </div>
                </section>

                <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-lg">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Thông tin liên hệ</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                    {[
                      { name: 'Vũ Thị Bích Phương', phone: '0984135344' },
                      { name: 'Hoàng Minh Nhựt', phone: '0938570859' }
                    ].map((contact) => (
                      <a
                        key={contact.phone}
                        href={`tel:${contact.phone}`}
                        className="flex items-center justify-between rounded-2xl border border-indigo-100 px-4 py-3 bg-gradient-to-r from-indigo-50 to-white hover:shadow-md transition-shadow"
                      >
                        <span className="font-semibold text-slate-800">{contact.name}</span>
                        <span className="text-indigo-600 font-semibold">{contact.phone}</span>
                      </a>
                    ))}
                  </div>
                </section>

                <section className="pt-4 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => setIsRSVPModalOpen(true)}
                    className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Heart className="w-5 h-5 group-hover:animate-heartbeat" />
                      Xác nhận tham dự
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>

                  <button
                    onClick={() => setIsWishesModalOpen(true)}
                    className="group px-8 py-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                      Gửi lời chúc
                    </span>
                  </button>
                </section>

                <footer className="mt-6 pt-6 border-t-2 border-rose-200 text-center space-y-2">
                  <p className="text-sm text-gray-600">Sự hiện diện của bạn là món quà lớn nhất đối với chúng tôi.</p>
                  <div className="flex justify-center gap-2">
                    {[...Array(5)].map((_, index) => (
                      <Heart key={index} className="w-4 h-4 text-rose-400 animate-heartbeat" style={{ animationDelay: `${index * 0.2}s` }} />
                    ))}
                  </div>
                </footer>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 animate-fade-in-up-delay-3">
            <p className="text-white text-lg font-medium drop-shadow-lg">Cảm ơn và hẹn gặp bạn tại buổi lễ!</p>
          </div>
        </div>
      </div>

      <RSVPModal isOpen={isRSVPModalOpen} user={user} onClose={() => setIsRSVPModalOpen(false)} onDecision={handleCeremonyDecision} />

      <DinnerInviteModal
        isOpen={isDinnerModalOpen}
        onClose={() => setIsDinnerModalOpen(false)}
        willAttendCeremony={lastCeremonyDecision}
        onSelect={handleDinnerChoice}
        isSaving={isSavingDinnerChoice}
      />

      <WishesModal
        isOpen={isWishesModalOpen}
        onClose={() => setIsWishesModalOpen(false)}
        currentUserName={friendlyName}
        currentUserId={user.id}
        currentUsername={user.username}
      />
    </div>
  );
}

interface InfoPillProps {
  icon: ReactNode;
  title: string;
  accent: string;
  children: ReactNode;
}

function InfoPill({ icon, title, accent, children }: InfoPillProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white/90 p-4 text-center shadow">
      <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${accent} px-4 py-1 text-xs font-semibold text-white`}>
        {icon}
        <span>{title}</span>
      </div>
      <p className="text-base font-medium text-slate-700 text-balance">{children}</p>
    </div>
  );
}

interface TimelineItemProps {
  time: string;
  title: string;
  description: string;
  highlight?: boolean;
}

function TimelineItem({ time, title, description, highlight = false }: TimelineItemProps) {
  return (
    <div className={`flex gap-4 py-3 ${highlight ? 'bg-gradient-to-r from-indigo-50 to-pink-50 rounded-2xl px-3' : ''}`}>
      <div className="flex flex-col items-center">
        <span className="text-xs font-semibold text-indigo-500">{time}</span>
        <span className="mt-1 h-full w-[2px] bg-gradient-to-b from-indigo-400 to-transparent" />
      </div>
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}
