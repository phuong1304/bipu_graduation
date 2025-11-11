import { Heart } from "lucide-react";
import { ParticipantRecord } from "../lib/supabase";

// Giả sử bạn có:
// interface Participant {
//   id: string;
//   display_name: string;
//   rsvp?: any | null;
// }

interface Props {
  userId: string; // id người đang đăng nhập
  participants: ParticipantRecord[];
  setIsRSVPModalOpen: (value: boolean) => void;
}

export default function RSVPButton({
  userId,
  participants,
  setIsRSVPModalOpen,
}: Props) {
  // 🧠 Kiểm tra xem user hiện tại đã phản hồi chưa
  const hasResponded = participants.some(
    (p) => p.id === userId && p.rsvp != null
  );

  return (
    <button
      onClick={() => setIsRSVPModalOpen(true)}
      disabled={hasResponded}
      className={`group relative px-8 py-4 font-bold rounded-full shadow-lg transform transition-all duration-300 overflow-hidden ${
        hasResponded
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-gradient-to-r from-indigo-600 to-purple-500 text-white hover:shadow-xl hover:scale-105"
      }`}
    >
      <span className="relative z-10 flex items-center gap-2">
        <Heart
          className={`w-5 h-5 ${
            !hasResponded ? "group-hover:animate-heartbeat" : ""
          }`}
        />
        {hasResponded ? "Đã xác nhận" : "Xác nhận tham dự"}
      </span>

      {!hasResponded && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </button>
  );
}
