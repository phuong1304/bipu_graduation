import { useEffect, useRef, useState } from "react";
import {
  Lock,
  Loader2,
  Sparkles,
  Info,
  Calendar,
  MapPin,
  GraduationCap,
  User,
} from "lucide-react";
import type { AppUser } from "../lib/supabase";
import { findUserByUsername, upsertParticipant } from "../lib/supabase";
import gradPhoto from "../../assets/icon/login-image.jpg";

interface ParticipantLoginPageProps {
  onAuthenticated: (user: AppUser) => void;
}

export default function ParticipantLoginPage({
  onAuthenticated,
}: ParticipantLoginPageProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [pendingUsername, setPendingUsername] = useState("");
  const [profileForm, setProfileForm] = useState({
    salutation: "",
    displayName: "",
  });
  const [profileError, setProfileError] = useState("");
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const backgroundStars = Array.from({ length: 25 }, (_, index) => index);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const startExperienceTransition = (user: AppUser) => {
    setIsTransitioning(true);
    transitionTimeoutRef.current = setTimeout(() => {
      onAuthenticated(user);
    }, 3000);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedUsername) {
      setError("Vui lòng nhập username");
      return;
    }

    try {
      setIsLoading(true);
      const existingUser = await findUserByUsername(normalizedUsername, "user");
      if (existingUser) {
        startExperienceTransition(existingUser);
      } else {
        setPendingUsername(normalizedUsername);
        setProfileForm({ salutation: "", displayName: "" });
        setProfileError("");
        setProfileModalOpen(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileError("");

    if (!pendingUsername) {
      setProfileError("Thiếu username, vui lòng thử lại.");
      return;
    }

    const trimmedDisplayName = profileForm.displayName.trim();
    if (!trimmedDisplayName) {
      setProfileError("Vui lòng nhập họ tên hiển thị.");
      return;
    }

    try {
      setIsCreatingProfile(true);
      const newUser = await upsertParticipant({
        username: pendingUsername,
        display_name: trimmedDisplayName,
        salutation: profileForm.salutation.trim(),
        invited_to_dinner: false,
      });

      setProfileModalOpen(false);
      startExperienceTransition(newUser);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể tạo người tham gia.";
      setProfileError(message);
    } finally {
      setIsCreatingProfile(false);
    }
  };

  if (isTransitioning) {
    return <LetterLoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#08031f,_#120b3d,_#1f0f59)] relative overflow-hidden">
      <div className="stars-container">
        {backgroundStars.map((star) => (
          <div
            key={star}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-indigo-900/40 to-purple-900/30 pointer-events-none" />

      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 relative z-10">
        <div className="w-full max-w-5xl">
          <div className="bg-gradient-to-r from-rose-300 via-sky-300 to-indigo-300 p-[1px] rounded-[2.75rem] shadow-[0_25px_70px_rgba(8,5,30,0.65)] w-full">
            <div className="bg-white/95 backdrop-blur-lg rounded-[2.65rem] grid gap-0 lg:grid-cols-2 overflow-hidden">
              <section className="p-8 sm:p-10 lg:p-12 border-b border-gray-100/70 lg:border-b-0 lg:border-r space-y-4">
                <div className="flex items-center justify-center lg:justify-start gap-3 text-indigo-500 text-xs tracking-[2px] font-semibold uppercase">
                  <Sparkles className="w-4 h-4" />
                  Thiệp mời tốt nghiệp
                </div>

                <div className="text-center lg:text-left space-y-3">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-[2px]">
                    Vũ Thị Bích Phương · FPT University HCM
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-indigo-600 via-rose-500 to-amber-400 bg-clip-text text-transparent leading-tight">
                    Chào mừng bạn đến với hành trình lễ tốt nghiệp
                  </h1>
                  <p className="text-slate-600">
                    Đăng nhập để trải nghiệm thiệp mời số, xác nhận tham dự và
                    cập nhật mọi hoạt động của Lễ tốt nghiệp của{" "}
                    <strong>Bipu</strong>.
                  </p>
                </div>

                <div className="rounded-[16px] border border-indigo-100 overflow-hidden shadow-2xl">
                  <img
                    src={gradPhoto}
                    alt="Vũ Thị Bích Phương"
                    className="w-full h-64 sm:h-72 object-cover object-center"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-600">
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <div className="flex flex-col gap-2">
                      <p className="font-semibold text-indigo-800">Check-in</p>
                      <p className="font-semibold">Thứ 5 · 20/11/2025</p>
                      <p>09:20 - 09:40 · Hội trường A (Session 3)</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <div className="flex flex-col gap-2">
                      <p className="font-semibold text-rose-700">Địa điểm</p>
                      <p>Đại học FPT - Khu Công Nghệ Cao, TP.HCM</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-8 sm:p-10 lg:p-12 bg-gradient-to-br from-indigo-50 via-white to-rose-50 flex items-center">
                <div className="space-y-6 w-full">
                  <div className="text-center lg:text-left">
                    <p className="text-md font-semibold text-indigo-400 uppercase tracking-[2px] mb-2">
                      Đăng nhập/ Đăng kí
                    </p>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Trải nghiệm thiệp mời số
                    </h2>
                  </div>

                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Tên người tham gia
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nhập username của bạn"
                        required
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white/90 text-slate-800"
                      />
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-2">
                        <Info className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                        <span>
                          Username được tạo từ họ tên (ví dụ Hoàng Minh Nhựt →{" "}
                          <span className="font-mono">nhuthm</span>)
                        </span>
                      </p>
                    </div>

                    {error && (
                      <div className="p-3 rounded-2xl bg-red-50 text-red-700 border border-red-100 text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-500 to-rose-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                    >
                      <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Sparkles className="w-6 h-6 text-white/60 absolute left-1/3 top-1/2 -translate-y-1/2 animate-pulse" />
                        <Sparkles className="w-4 h-4 text-amber-200 absolute right-6 top-1/3 animate-bounce" />
                      </span>
                      {isLoading && (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      )}
                      <span className="relative z-10">Mở thiệp</span>
                    </button>
                  </form>

                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    Thông tin đăng nhập/ đăng kí chỉ phục vụ cho Convocation Day
                    20/11/2025.
                  </div>

                  <div className="flex flex-col items-center justify-center gap-2 text-rose-600 max-w-2xl text-sm leading-relaxed px-4 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-rose-500 flex-shrink-0 mt-[2px]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.343l-6.828-6.829a4 4 0 010-5.656z" />
                    </svg>
                    <p>
                      Sản phẩm này được tạo nên từ tình yêu thương và lòng biết
                      ơn của Phương gửi đến những người thân yêu, thầy cô, bạn
                      bè và tất cả những ai đọc được dòng này. Hy vọng mọi người
                      sẽ đón nhận và trải nghiệm thiệp mời số này với sự thoải
                      mái, nhẹ nhàng, để cùng nhau lưu lại những kỷ niệm thật
                      đẹp trong hành trình thanh xuân.
                    </p>
                  </div>
                </div>
              </section>
            </div>
            <div className="flex flex-col items-center justify-center text-center w-full space-y-2 my-2">
              <div className="text-xs text-white font-semibold">
                Developed by Minu & Bipu @ 2025
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileSetupModal
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setPendingUsername("");
        }}
        onSubmit={handleProfileSubmit}
        formValues={profileForm}
        onChange={setProfileForm}
        isSubmitting={isCreatingProfile}
        error={profileError}
      />
    </div>
  );
}

function LetterLoadingScreen() {
  const backgroundStars = Array.from({ length: 30 }, (_, index) => index);

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#08031f,_#120b3d,_#1f0f59)] relative overflow-hidden flex items-center justify-center">
      <div className="stars-container">
        {backgroundStars.map((star) => (
          <div
            key={star}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/45 via-indigo-900/35 to-purple-900/45 pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 text-white">
        <div className="paper-reveal-card flex items-center justify-center">
          <div className="paper-reveal-sheet flex items-center justify-center">
            <GraduationCap className="w-20 h-20 text-indigo-500" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-base font-semibold tracking-[0.35em] uppercase text-white/80">
            Đang mở thiệp
          </p>
        </div>
      </div>
    </div>
  );
}

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  formValues: { salutation: string; displayName: string };
  onChange: React.Dispatch<
    React.SetStateAction<{ salutation: string; displayName: string }>
  >;
  isSubmitting: boolean;
  error: string;
}

function ProfileSetupModal({
  isOpen,
  onClose,
  onSubmit,
  formValues,
  onChange,
  isSubmitting,
  error,
}: ProfileSetupModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
            <User className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Phương nên gọi bạn như thế nào?
          </h2>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1 block">
              Danh xưng (tuỳ chọn)
            </label>
            <input
              type="text"
              value={formValues.salutation}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, salutation: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
              placeholder="Ví dụ: Anh, Chị, Bạn..."
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1 block">
              Họ tên *
            </label>
            <input
              type="text"
              value={formValues.displayName}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, displayName: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
              placeholder="Ví dụ: Nguyễn Minh Anh"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tạo...
                </span>
              ) : (
                "Mở thiệp"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
