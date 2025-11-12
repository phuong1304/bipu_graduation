import { GraduationCap, Wine } from "lucide-react";
import { AppUser, ParticipantRecord } from "../lib/supabase";
import { RSVPFilter } from "./admin/ParticipantsTab";

interface Props {
  userId: string;
  participants: ParticipantRecord[];
  setIsRSVPModalOpen: (value: boolean) => void;
  user?: AppUser;
  setIsDinnerModalOpen: (value: boolean) => void;
}

export default function RSVPButton({
  userId,
  participants,
  setIsRSVPModalOpen,
  user,
  setIsDinnerModalOpen,
}: Props) {
  const hasResponded = participants.some(
    (p) => p.id === userId && p.rsvp?.will_attend != undefined
  );

  function getDinnerState(
    participant: ParticipantRecord
  ): RSVPFilter | "not_invited" {
    if (!participant.invited_to_dinner) return "not_invited";
    const rsvp = participant.rsvp;
    if (
      !rsvp ||
      typeof rsvp.will_attend_dinner === "undefined" ||
      rsvp.will_attend_dinner === null
    ) {
      return "pending";
    }
    return rsvp.will_attend_dinner ? "yes" : "no";
  }

  const currentParticipant = participants.find((p) => p.id === userId);
  const dinnerState = currentParticipant
    ? getDinnerState(currentParticipant)
    : "not_invited";

  const hasResDinner = dinnerState !== "pending";

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {/* --- BTN DỰ TIỆC --- */}
      {user?.invited_to_dinner && (
        <button
          onClick={() => setIsDinnerModalOpen(true)}
          className={`group relative px-8 py-4 font-bold rounded-full shadow-lg transform transition-all duration-300 overflow-hidden
            bg-gradient-to-r from-yellow-400 via-yellow-200 to-white text-gray-900
            hover:from-yellow-500 hover:via-white hover:to-yellow-400
            border border-yellow-400 hover:shadow-yellow-300 hover:scale-105
          `}
        >
          <span className="relative z-10 flex items-center gap-2 text-yellow-800">
            <Wine className="w-5 h-5 text-yellow-600" />
            {hasResDinner
              ? "Bạn đã xác nhận dự tiệc"
              : "Bạn chưa xác nhận dự tiệc"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 via-white to-yellow-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
        </button>
      )}

      {/* --- BTN THAM DỰ LỄ --- */}
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
          <GraduationCap
            className={`w-5 h-5 ${
              !hasResponded ? "group-hover:animate-heartbeat" : ""
            }`}
          />
          {hasResponded ? "Đã xác nhận tham dự lễ" : "Xác nhận tham dự lễ"}
        </span>

        {!hasResponded && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </button>
    </div>
  );
}
