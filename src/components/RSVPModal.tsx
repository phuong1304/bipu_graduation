import { useState } from "react";
import { X, Heart, Loader } from "lucide-react";
import { submitRSVP, type RSVPResponse, type AppUser } from "../lib/supabase";

interface RSVPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDecision: (willAttend: boolean) => void;
  user: AppUser;
}

export default function RSVPModal({
  isOpen,
  onClose,
  onDecision,
  user,
}: RSVPModalProps) {
  const [submittingChoice, setSubmittingChoice] = useState<"yes" | "no" | null>(
    null
  );
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleDecision = async (willAttend: boolean) => {
    setSubmittingChoice(willAttend ? "yes" : "no");
    setError("");

    if (!user.id) {
      setError("Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại.");
      setSubmittingChoice(null);
      return;
    }

    const payload: RSVPResponse = {
      user_id: user.id,
      name: user.display_name,
      email: user.email,
      phone: "",
      will_attend: willAttend,
      guest_count: 1,
      dietary_requirements: "",
      created_at: new Date().toISOString(),
    };

    try {
      await submitRSVP(payload);
      onDecision(willAttend);
    } catch (err) {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại!");
      console.error(err);
    } finally {
      setSubmittingChoice(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-gradient-to-br from-indigo-50 via-white to-pink-50 border border-indigo-100 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-indigo-50 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-8">
          <div className="text-center mb-6 space-y-2">
            <Heart className="w-12 h-12 text-indigo-500 mx-auto mb-3 animate-heartbeat" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
              Mời dự lễ tốt nghiệp
            </h2>
            <p className="text-slate-600 mt-2">
              Hãy cho Phương biết bạn có thể tham gia buổi lễ ngày 20/11 không
              nhé.
            </p>
          </div>

          <div className="space-y-4">
            <button
              disabled={submittingChoice !== null}
              onClick={() => handleDecision(true)}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submittingChoice === "yes" ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  Đang gửi...
                </span>
              ) : (
                "Tôi sẽ tham gia buổi lễ"
              )}
            </button>

            <button
              disabled={submittingChoice !== null}
              onClick={() => handleDecision(false)}
              className="w-full py-4 border-2 border-indigo-100 text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingChoice === "no" ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  Đang gửi...
                </span>
              ) : (
                "Không thể tham gia được"
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
