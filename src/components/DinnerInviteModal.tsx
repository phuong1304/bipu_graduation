import { X, Utensils, Smile, MapPin, Clock, Heart } from "lucide-react";
import { AppUser } from "../lib/supabase";

interface DinnerInviteModalProps {
  isOpen: boolean;
  willAttendCeremony: boolean | null;
  onClose: () => void;
  onSelect: (attending: boolean) => void;
  isSaving?: boolean;
  friendlyName?: string;
  dinnerState?: string;
  user?: AppUser;
  onRefresh?: () => void; // 👈 callback
}

export default function DinnerInviteModal({
  isOpen,
  willAttendCeremony,
  onClose,
  onSelect,
  isSaving,
  friendlyName,
  dinnerState,
  user,
  onRefresh,
}: DinnerInviteModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 border border-amber-100 rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-amber-50 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-8">
          <div className="text-center mb-6 space-y-2">
            <Utensils className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Mời dự tiệc thân mật
            </h2>
            <p className="text-gray-600 mt-2">
              Sau buổi lễ, Phương sẽ có tiệc thân mật cùng gia đình và bạn bè.
              Và{" "}
              <strong className="font-semibold text-rose-500">
                {friendlyName || "Bạn"}
              </strong>{" "}
              là một phần không thể thiếu trong buổi tiệc này. Rất mong có sự
              góp mặt chung vui của bạn tới chung vui với Phương và gia đình!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm text-amber-800">
            <a
              href="https://www.google.com/maps/search/?api=1&query=H%E1%BA%A3i+S%E1%BA%A3n+%C3%9At+Linh+2,+67+L%C3%A3+Xu%C3%A2n+Oai,+T%C4%83ng+Nh%C6%A1n+Ph%C3%BA+A,+Th%E1%BB%A7+%C4%90%E1%BB%A9c,+Th%C3%A0nh+ph%E1%BB%91+H%E1%BB%93+Ch%C3%AD+Minh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-2 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-amber-50 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 font-semibold text-amber-900">
                <MapPin className="w-5 h-5 text-amber-600" />
                <span>Địa điểm</span>
              </div>
              <p className="text-sm font-semibold leading-relaxed">
                Hải Sản Út Linh 2
              </p>
              <p className="text-xs font-semibold text-amber-500">
                Nhấn để mở Google Maps
              </p>
            </a>
            <div className="flex flex-col gap-2 rounded-2xl border border-amber-100 bg-gradient-to-br from-white via-amber-50 to-white p-4">
              <div className="flex items-center gap-2 font-semibold text-amber-900">
                <Clock className="w-5 h-5 text-amber-600" />
                <span>Thời gian</span>
              </div>
              <p className="text-sm font-medium">18:00 · 20/11/2025</p>
            </div>
          </div>
          <p className="text-sm text-amber-700 mb-6">
            {willAttendCeremony === null &&
              "Hãy cùng nhau tạo nên một buổi tối ấm áp nhé!"}
            {willAttendCeremony === true &&
              "Cảm ơn bạn đã nhận lời dự lễ. Mong được gặp bạn tại buổi tiệc thân mật này."}
            {willAttendCeremony === false &&
              "Dù bạn không thể dự lễ, Phương vẫn hy vọng bạn đến chung vui trong buổi tiệc."}
          </p>
          {dinnerState !== "pending" ? (
            <div className="flex justify-center w-full">
              <button
                className={`group relative bg-gray-300 text-gray-500 cursor-not-allowed px-8 py-4 font-bold rounded-full shadow-lg transform transition-all duration-300 overflow-hidden `}
              >
                <span className="relative z-10 flex items-start gap-2">
                  <Heart className={`w-5 h-5 group-hover:animate-heartbeat`} />
                  {dinnerState === "yes"
                    ? "Đã xác nhận tham dự tiệc"
                    : dinnerState === "no"
                    ? "Phương rất tiếc khi bạn không tham dự tiệc! "
                    : "pending"}
                </span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={async () => {
                  await onSelect(true);
                  onRefresh?.(); // 🔁 gọi refresh sau khi xác nhận
                }}
                disabled={!!isSaving}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-60"
              >
                Sẽ tham gia tiệc
              </button>
              <button
                onClick={async () => {
                  await onSelect(false);
                  onRefresh?.(); // 🔁 refresh lại danh sách
                }}
                disabled={!!isSaving}
                className="flex-1 py-3 rounded-xl border border-amber-200 text-amber-700 font-semibold hover:bg-amber-50 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Smile className="w-5 h-5" />
                Không tham gia được
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
