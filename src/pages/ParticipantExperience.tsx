import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Heart,
  Calendar,
  MapPin,
  Clock,
  GraduationCap,
  Copy,
  MessageCircle,
  Globe,
  RotateCcw,
} from "lucide-react";
import WishesModal from "../components/WishesModal";
import RSVPModal from "../components/RSVPModal";
import DinnerInviteModal from "../components/DinnerInviteModal";
import type {
  AppUser,
  ParticipantRecord,
  RSVPResponse,
  Wish,
} from "../lib/supabase";
import { getWishes, getParticipants, submitRSVP } from "../lib/supabase";
import sendIcon from "../../assets/icon/send.svg";
import GraduationMessage from "../components/GraduationMessage";
import GraduationTimeline from "../components/GraduationTimeline";
import RSVPButton from "../components/RSVPButton";
import { RSVPFilter } from "../components/admin/ParticipantsTab";

interface ParticipantExperienceProps {
  user: AppUser;
  onLogout: () => void;
}

export default function ParticipantExperience({
  user,
  onLogout,
}: ParticipantExperienceProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false);
  const [isWishesModalOpen, setIsWishesModalOpen] = useState(false);
  const [isDinnerModalOpen, setIsDinnerModalOpen] = useState(false);
  const [lastCeremonyDecision, setLastCeremonyDecision] = useState<
    boolean | null
  >(null);
  const [canAttendDinner, setCanAttendDinner] = useState(
    Boolean(user.invited_to_dinner)
  );
  const [isSavingDinnerChoice, setIsSavingDinnerChoice] = useState(false);
  const [copied, setCopied] = useState(false);
  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);

  const [previewWishes, setPreviewWishes] = useState<Wish[]>([]);
  const [isLoadingWishes, setIsLoadingWishes] = useState(false);
  const friendlyName = user.salutation?.trim()
    ? `${user.salutation.trim()} ${user.display_name}`
    : user.display_name;

  const contactSectionRef = useRef<HTMLDivElement | null>(null);

  function getDinnerState(
    participant: ParticipantRecord
  ): RSVPFilter | "not_invited" {
    if (!participant.invited_to_dinner) return "not_invited";
    const rsvp = participant.rsvp;
    // debugger;
    if (
      !rsvp ||
      typeof rsvp.will_attend_dinner === "undefined" ||
      rsvp.will_attend_dinner === null
    ) {
      return "pending";
    }
    return rsvp.will_attend_dinner ? "yes" : "no";
  }

  const currentParticipant = useMemo(() => {
    return participants.find((p) => p.id === user.id);
  }, [participants, user.id]);

  const dinnerState = currentParticipant
    ? getDinnerState(currentParticipant)
    : "not_invited";

  // const hasRespondedDinner = dinnerState !== "pending";

  // ⚡ Dùng IntersectionObserver để mở popup khi người dùng scroll tới “Thông tin liên hệ”
  useEffect(() => {
    // 🔹 Chỉ bắt đầu quan sát khi có dữ liệu participant
    if (!currentParticipant) return;

    const willAttend = currentParticipant?.rsvp?.will_attend;
    // 🔹 Nếu người này đã xác nhận tham dự hoặc từ chối, thì không làm gì
    if (willAttend === true || willAttend === false) return;

    const target = contactSectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRSVPModalOpen(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [currentParticipant]);

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
        console.error("Unable to load wishes preview", error);
      } finally {
        setIsLoadingWishes(false);
      }
    };

    loadPreviewWishes();
  }, []);

  // 👇 Đặt ở cấp component
  const loadParticipants = async () => {
    try {
      const data = await getParticipants();
      setParticipants(data || []);
    } catch (err) {
      console.error("❌ Lỗi load participants:", err);
    }
  };

  // 🔁 Gọi khi mount
  useEffect(() => {
    loadParticipants();
  }, []);

  // 🥂 Và sau khi user chọn tham dự
  const handleDinnerChoice = async (attending: boolean) => {
    if (!user.id) {
      setIsDinnerModalOpen(false);
      return;
    }
    const payload: RSVPResponse = {
      user_id: user.id,
      name: user.display_name,
      email: user.email,
      phone: "",
      will_attend_dinner: attending,
    };

    try {
      setIsSavingDinnerChoice(true);
      await submitRSVP(payload);

      // 🔁 Reload danh sách để cập nhật client
      await loadParticipants();

      setCanAttendDinner(attending);
    } catch (error) {
      console.error("❌ Unable to update dinner attendance", error);
    } finally {
      setIsSavingDinnerChoice(false);
      setIsDinnerModalOpen(false);
      if (currentParticipant?.rsvp?.will_attend != undefined) {
        setIsWishesModalOpen(true);
      } else {
        setIsRSVPModalOpen(true);
      }
    }
  };

  const confettiPieces = Array.from({ length: 30 }, (_, index) => index);

  const handleCeremonyDecision = async (willAttend: boolean) => {
    setLastCeremonyDecision(willAttend);
    await loadParticipants();
    if (canAttendDinner && !currentParticipant?.rsvp?.will_attend_dinner) {
      setIsRSVPModalOpen(false);

      setIsDinnerModalOpen(true);
    } else {
      setIsRSVPModalOpen(false);
      setIsDinnerModalOpen(false);

      setIsWishesModalOpen(true);
    }
  };

  // const handleDinnerChoice = async (attending: boolean) => {
  //   if (!user.id) {
  //     setIsDinnerModalOpen(false);
  //     setIsWishesModalOpen(true);
  //     return;
  //   }

  //   try {
  //     setIsSavingDinnerChoice(true);
  //     await updateDinnerAttendance(user.id, attending);
  //     // ✅ Gọi đúng hàm loadParticipants()
  //     await loadParticipants();
  //     setCanAttendDinner(attending);
  //   } catch (error) {
  //     console.error("Unable to update dinner attendance", error);
  //   } finally {
  //     setIsSavingDinnerChoice(false);
  //     setIsDinnerModalOpen(false);
  //     setIsWishesModalOpen(true);
  //   }
  // };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          "linear-gradient(127.09deg, #740F71 1.92%, #6C0B79 13.72%, #371154 49.1%, #34206B 72.68%)",
      }}
    >
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3 bg-white/85 text-slate-700 px-4 py-2 rounded-full shadow-lg">
        <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
          Xin chào, {friendlyName}
        </span>
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
          const x0 = Math.random() * 100; // start off-screen bên trái
          const y0 = Math.random() * 100; // start phía trên để bay chéo xuống

          const travel = 160 + Math.random() * 70; // quãng đường giống nhau cho X/Y để giữ 45°
          const dx = travel;
          const dy = travel;
          const sx = 0.4 + Math.random() * 0.4;

          return (
            <div
              key={piece}
              className="confetti"
              style={{
                ["--x0" as any]: `${x0}vw`,
                ["--y0" as any]: `${y0}vh`,
                ["--dx" as any]: `${dx}vw`,
                ["--dy" as any]: `${dy}vh`,
                ["--dur" as any]: `${dur}s`,
                ["--sx" as any]: sx.toString(),
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
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div
          className={`max-w-4xl  w-full transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-[0_25px_70px_rgba(12,16,38,0.55)] overflow-hidden border border-indigo-100 animate-float">
            <div className="bg-gradient-to-r from-rose-300 via-sky-300 to-indigo-300 p-[1px]">
              <div className="bg-white px-6 py-10 sm:p-8 md:p-12 space-y-4">
                <header className="text-center space-y-6">
                  <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
                    {/* Hàng đầu: icon + text nhỏ */}
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-500" />
                        <Sparkles className="w-5 h-5 text-pink-400 absolute -top-1 -right-1 animate-pulse" />
                      </div>
                      <p className="uppercase tracking-[2px] text-xs sm:text-sm font-bold bg-gradient-to-r from-rose-400 via-indigo-500 to-sky-400 bg-clip-text text-transparent">
                        Thiệp mời đặc biệt
                      </p>
                    </div>

                    {/* Hàng thứ hai: tiêu đề & tên */}
                    <div className="text-center leading-tight">
                      <h1 className="text-xl xs:text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-400 bg-clip-text text-transparent">
                        Lễ Tốt Nghiệp
                      </h1>
                      <h2 className="text-xl xs:text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-rose-400 via-amber-500 to-pink-500 bg-clip-text text-transparent mt-1">
                        Vũ Thị Bích Phương
                      </h2>
                    </div>
                  </div>

                  <hr className=" text-rose-500" />
                  <div className=" flex items-start w-full gap-2">
                    {/* Content */}
                    <div className="w-full">
                      <motion.section
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true, amount: 0.3 }}
                        className="max-w-5xl mx-auto text-center"
                      >
                        <div className="flex flex-col gap-1 items-center ">
                          <p className="text-lg sm:text-xl text-rose-400 font-semibold italic tracking-wide">
                            Thân mời,
                          </p>

                          <p className="text-xl sm:text-2xl font-bold text-transparent w-full italic bg-clip-text bg-gradient-to-r from-indigo-600 via-rose-500 to-amber-400 drop-shadow-sm">
                            {" "}
                            {friendlyName}{" "}
                          </p>
                        </div>
                      </motion.section>
                      <motion.section
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true, amount: 0.3 }}
                        className="max-w-5xl mx-auto text-center"
                      >
                        <GraduationMessage friendlyName={friendlyName} />
                      </motion.section>
                    </div>
                  </div>
                </header>
                <motion.section
                  initial={{ opacity: 0, x: -80 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.3 }}
                  className="max-w-5xl mx-auto text-center"
                >
                  <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoPill
                      icon={<Calendar className="w-5 h-5" />}
                      title="Thời gian đón khách"
                      accent="from-indigo-500 to-purple-500"
                    >
                      Thứ 5, ngày 20/11/2025 <br /> 08:00 - 09:00 & từ 11:00 đến
                      14:00
                    </InfoPill>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=%C4%90%E1%BA%A1i+h%E1%BB%8Dc+FPT+-+Khu+C%C3%B4ng+Ngh%E1%BB%87+Cao"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <InfoPill
                        icon={<MapPin className="w-5 h-5" />}
                        title="Địa điểm"
                        accent="from-pink-500 to-rose-500"
                      >
                        Đại học FPT HCM - Khu Công Nghệ Cao
                        <p className="text-xs font-semibold text-rose-500">
                          Nhấn để mở Google Maps
                        </p>
                      </InfoPill>
                    </a>

                    <InfoPill
                      icon={<Clock className="w-5 h-5" />}
                      title="Check-in nhận bằng"
                      accent="from-blue-500 to-cyan-500"
                    >
                      09:20 - 09:40 · Tầng 5 Hội trường A (Session 3)
                    </InfoPill>
                    <InfoPill
                      icon={<Globe className="w-5 h-5" />}
                      title="Kết nối cùng Phương"
                      accent="from-amber-500 to-orange-500"
                    >
                      <div className="flex flex-wrap gap-1.5 xs:gap-2 mt-1 justify-center">
                        <a
                          href="https://www.facebook.com/bichphuong1304"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 transition text-xs xs:text-sm font-medium text-blue-700"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            className="w-4 h-4"
                          >
                            <path d="M22 12a10 10 0 1 0-11.5 9.87v-7H8v-2.87h2.5v-2.2c0-2.47 1.46-3.84 3.7-3.84 1.07 0 2.19.19 2.19.19v2.4h-1.23c-1.22 0-1.6.76-1.6 1.54v1.9h2.72l-.43 2.87h-2.29v7A10 10 0 0 0 22 12z" />
                          </svg>
                          Facebook
                        </a>

                        <a
                          href="https://www.instagram.com/bipu1304?igsh=MXEwaGhtZnc1bWxwMA%3D%3D&utm_source=qr"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full border border-pink-200 bg-pink-50 hover:bg-pink-100 transition text-xs xs:text-sm font-medium text-pink-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            className="w-4 h-4"
                          >
                            <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm0 2h10c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3zm5 2.9a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2zm0 2a3.1 3.1 0 1 1 0 6.2 3.1 3.1 0 0 1 0-6.2zm4.75-.85a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5z" />
                          </svg>
                          Instagram
                        </a>

                        <a
                          href="https://zalo.me/0984135344"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full border border-sky-200 bg-sky-50 hover:bg-sky-100 transition text-xs xs:text-sm font-medium text-sky-600"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Zalo
                        </a>
                      </div>
                    </InfoPill>
                  </section>
                </motion.section>
                <motion.section
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.2 }}
                  className="max-w-5xl mx-auto text-center"
                >
                  <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left items-stretch">
                    {/* Cột 1 - Timeline */}
                    <div className="flex flex-col h-full">
                      <GraduationTimeline
                        isInviteDinner={user.invited_to_dinner ?? false}
                      />
                    </div>

                    {/* Cột 2 - Lời nhắn & lời chúc */}
                    <div className="flex flex-col h-full space-y-6 flex-1">
                      {/* Lời nhắn */}
                      <article className="bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 rounded-2xl p-5 sm:p-6 text-slate-700 shadow-xl border border-rose-100 space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-rose-600">
                          <Heart className="w-5 h-5 text-rose-500" />
                          Lời nhắn từ Phương
                        </h3>
                        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                          “Ngày tốt nghiệp không chỉ là cột mốc của riêng mình
                          mà còn là thành quả của tình yêu thương, sự dạy dỗ và
                          đồng hành của mọi người. Mong được nhìn thấy nụ cười
                          của bạn tại Đại học FPT để chúng ta cùng nhau viết
                          tiếp những ký ức thật đẹp.”
                        </p>
                        <p className="text-sm sm:text-base text-rose-500 italic">
                          — Vũ Thị Bích Phương
                        </p>
                      </article>
                      {/* Lời chúc */}
                      <article
                        className="bg-white rounded-2xl border border-rose-100 shadow-lg 
                 p-5 sm:p-6 flex flex-col gap-2 flex-1 overflow-hidden lg:h-full"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-rose-600 font-semibold text-lg">
                            <motion.div
                              animate={{
                                scale: [1, 1.3, 0.9, 1.2, 1],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            >
                              <Heart className="w-5 h-5 text-rose-600" />
                            </motion.div>{" "}
                            Lời chúc dành cho Phương
                          </div>

                          <div className="flex items-center gap-2">
                            {/* 🔄 Nút reload danh sách */}
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  setIsLoadingWishes(true);
                                  const data = await getWishes(); // hàm bạn đã có sẵn
                                  setPreviewWishes((data || []).slice(0, 4));
                                } catch (error) {
                                  console.error(
                                    "Lỗi khi tải lại lời chúc:",
                                    error
                                  );
                                } finally {
                                  setIsLoadingWishes(false);
                                }
                              }}
                              aria-label="Tải lại lời chúc"
                              className="flex items-center justify-center border border-rose-200 rounded-full w-8 h-8 hover:bg-rose-50 transition"
                            >
                              <RotateCcw
                                className={`w-4 h-4 ${
                                  isLoadingWishes
                                    ? "animate-spin text-rose-400"
                                    : "text-rose-500"
                                } transition-colors`}
                              />
                              <span className="sr-only">Tải lại lời chúc</span>
                            </button>

                            {/* ✉️ Nút mở modal gửi lời chúc */}
                            <button
                              type="button"
                              onClick={() => setIsWishesModalOpen(true)}
                              aria-label="Gửi lời chúc mới"
                              className="flex items-center justify-center border border-rose-200 rounded-full w-8 h-8 hover:bg-rose-50 transition"
                            >
                              <img src={sendIcon} alt="" className="w-4 h-4" />
                              <span className="sr-only">Gửi lời chúc</span>
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-slate-500">
                          Gửi lời yêu thương và đọc những chia sẻ từ bạn bè ngay
                          tại đây.
                        </div>

                        {/* Danh sách lời chúc */}
                        <div
                          className={`
                            space-y-3 overflow-y-auto pr-1 flex-1
                            max-h-[400px]  ${
                              user.invited_to_dinner
                                ? "lg:max-h-[400px]"
                                : "lg:max-h-[270px] "
                            }
                          `}
                        >
                          {isLoadingWishes ? (
                            <p className="text-sm text-slate-500">
                              Đang tải lời chúc...
                            </p>
                          ) : previewWishes.length === 0 ? (
                            <p className="text-sm text-slate-500">
                              Chưa có lời chúc nào. Hãy là người đầu tiên nhé!
                            </p>
                          ) : (
                            previewWishes.map((wish) => (
                              <div
                                key={wish.id ?? `${wish.name}-${wish.message}`}
                                className="bg-gradient-to-r from-rose-50 to-white border border-rose-100 rounded-2xl p-3"
                              >
                                <p className="text-sm font-semibold text-rose-600">
                                  {wish.name}
                                </p>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                  {wish.message}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </article>
                    </div>
                  </section>
                </motion.section>
                <motion.section
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.2 }}
                  className="max-w-5xl mx-auto text-center"
                >
                  <section
                    ref={contactSectionRef}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-lg"
                  >
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                      Thông tin liên hệ
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                      {[
                        { name: "Vũ Thị Bích Phương", phone: "0984135344" },
                        { name: "Hoàng Minh Nhựt", phone: "0938570859" },
                      ].map((contact, index) => {
                        const handleCopy = async (phone: string) => {
                          try {
                            await navigator.clipboard.writeText(phone);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1500);
                          } catch {
                            alert("Không thể sao chép số, vui lòng thử lại!");
                          }
                        };

                        return (
                          <div
                            key={`${contact.phone}-${index}`}
                            className="flex items-center justify-between rounded-xl border border-amber-100 px-3 py-2 bg-gradient-to-r from-amber-50 to-white hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                          >
                            <a
                              href={`tel:${contact.phone}`}
                              className="flex items-center gap-2 text-left"
                            >
                              <span className="font-medium text-slate-800">
                                {contact.name}
                              </span>
                              <span> - </span>
                              <span className="text-amber-600 font-semibold">
                                {contact.phone}
                              </span>
                            </a>

                            <button
                              onClick={() => handleCopy(contact.phone)}
                              className="ml-2 p-1.5 rounded-lg hover:bg-amber-100 transition"
                              title={copied ? "Đã sao chép!" : "Sao chép số"}
                            >
                              <Copy
                                className={`w-4 h-4 ${
                                  copied ? "text-green-500" : "text-amber-500"
                                } transition-colors`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </motion.section>
                <motion.section
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.3 }}
                  className="max-w-5xl mx-auto text-center"
                >
                  <section className="pt-4 flex flex-wrap justify-center gap-4">
                    {/* <button
                    onClick={() => setIsRSVPModalOpen(true)}
                    className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                    // disabled={user. === }
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Heart className="w-5 h-5 group-hover:animate-heartbeat" />
                      Xác nhận tham dự
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button> */}

                    <RSVPButton
                      participants={participants ?? []}
                      setIsRSVPModalOpen={setIsRSVPModalOpen}
                      userId={user.id ?? ""}
                      user={user}
                      setIsDinnerModalOpen={setIsDinnerModalOpen}
                    />

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
                </motion.section>
                <motion.section
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.2 }}
                  className="max-w-5xl mx-auto text-center"
                >
                  <footer className="mt-6 pt-6 border-t-2 border-rose-200 text-center space-y-2">
                    <p className="text-sm text-gray-600">
                      Sự hiện diện của bạn là món quà lớn nhất đối với Phương.
                    </p>
                    <div className="flex justify-center gap-2">
                      {[...Array(5)].map((_, index) => (
                        <Heart
                          key={index}
                          className="w-4 h-4 text-rose-400 animate-heartbeat"
                          style={{ animationDelay: `${index * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </footer>
                </motion.section>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 animate-fade-in-up-delay-3">
            <p className="text-white text-lg font-medium drop-shadow-lg">
              Cảm ơn và hẹn gặp bạn tại buổi lễ!
            </p>
          </div>
        </div>
      </div>

      <RSVPModal
        isOpen={isRSVPModalOpen}
        user={user}
        onClose={() => setIsRSVPModalOpen(false)}
        onDecision={handleCeremonyDecision}
        onRefresh={loadParticipants}
      />

      <DinnerInviteModal
        isOpen={isDinnerModalOpen}
        onClose={() => setIsDinnerModalOpen(false)}
        willAttendCeremony={lastCeremonyDecision}
        onSelect={handleDinnerChoice}
        isSaving={isSavingDinnerChoice}
        friendlyName={friendlyName}
        dinnerState={dinnerState}
        onRefresh={loadParticipants}
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
    <div className="flex flex-col items-center justify-start gap-3 rounded-2xl border border-slate-100 bg-white/90 p-4 text-center shadow">
      <div
        className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${accent} px-4 py-1 text-xs font-semibold text-white`}
      >
        {icon}
        <span>{title}</span>
      </div>
      <p className="text-base font-medium text-slate-700 text-balance">
        {children}
      </p>
    </div>
  );
}
