import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  addReaction,
  getReactionsForWish,
  getUserReactionsForWish,
} from "@/app/actions/wishes";
import type { Wish, WishReaction } from "@/lib/supabase/types";

interface WishReactionsProps {
  wishId: string;
  sessionId: string;
  userName: string;
  initialReactions?: WishReaction[];
}

interface ReactionDetail {
  count: number;
  names: string[];
}

const STICKERS = [
  // 💖 Các cảm xúc kiểu Facebook (xếp đầu tiên)
  { emoji: "👍", label: "Thích" },
  { emoji: "❤️", label: "Yêu thích" },
  { emoji: "😂", label: "Haha" },
  { emoji: "😮", label: "Ngạc nhiên" },
  { emoji: "😢", label: "Buồn" },
  { emoji: "😡", label: "Phẫn nộ" },

  // 🎓 Các biểu tượng lễ tốt nghiệp phía dưới
  { emoji: "🎓", label: "Mũ tốt nghiệp" },
  { emoji: "🎉", label: "Pháo hoa" },
  { emoji: "🥳", label: "Party" },
  { emoji: "📸", label: "Chụp hình" },
  { emoji: "🧑‍🎓", label: "Bạn học" },
  { emoji: "🎶", label: "Âm nhạc" },
  { emoji: "🥂", label: "Nâng ly" },
  { emoji: "💐", label: "Hoa tặng" },
];

const MAX_NAMES_PER_STICKER = 10;

export default function WishReactions({
  wishId,
  sessionId,
  userName,
  initialReactions,
}: WishReactionsProps) {
  const [reactionDetails, setReactionDetails] = useState<
    Record<string, ReactionDetail>
  >({});
  const [totalReactions, setTotalReactions] = useState(0);
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [tooltip, setTooltip] = useState<{
    sticker: string;
    left: number;
    top: number;
  } | null>(null);
  const [showAllReactions, setShowAllReactions] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialReactions) {
      processReactions(initialReactions);
      setIsLoading(false);
    } else {
      loadReactions();
    }
  }, [wishId, sessionId, initialReactions]); // Keep dependencies simple, processReactions handles logic

  const processReactions = (reactions: WishReaction[]) => {
    const details: Record<string, ReactionDetail> = {};
    const userStickerSet = new Set<string>();

    reactions.forEach((reaction) => {
      const sticker = reaction.sticker;
      const name = reaction.reactor_name?.trim() || "Khách";

      if (!details[sticker]) {
        details[sticker] = { count: 0, names: [] };
      }

      details[sticker].count += 1;
      const names = details[sticker].names;
      if (names.length < MAX_NAMES_PER_STICKER && !names.includes(name)) {
        names.push(name);
      }

      if (reaction.session_id === sessionId) {
        userStickerSet.add(sticker);
      }
    });

    setTotalReactions(reactions.length);
    setReactionDetails(details);
    setUserReactions(userStickerSet);
  };

  const loadReactions = async () => {
    try {
      setIsLoading(true);
      const [allReactions, userReactionRows] = await Promise.all([
        getReactionsForWish(wishId),
        getUserReactionsForWish(wishId, sessionId),
      ]);

      const userStickerSet = new Set(
        userReactionRows.map((row) => row.sticker)
      );

      // Combine for processing logic if needed, but here we just need to match the logic of processReactions
      // Actually, let's reuse processReactions logic but we have separate userReactionRows here which is slightly different from initialReactions approach
      // To be consistent, let's just map allReactions and manually check session_id if available, or rely on userReactionRows.
      // But wait, getReactionsForWish returns ALL reactions.

      const details: Record<string, ReactionDetail> = {};

      allReactions.forEach((reaction) => {
        const sticker = reaction.sticker;
        const name = reaction.reactor_name?.trim() || "Khách";

        if (!details[sticker]) {
          details[sticker] = { count: 0, names: [] };
        }

        details[sticker].count += 1;
        const names = details[sticker].names;
        if (names.length < MAX_NAMES_PER_STICKER && !names.includes(name)) {
          names.push(name);
        }
      });

      setTotalReactions(allReactions.length);
      setReactionDetails(details);
      setUserReactions(userStickerSet);
    } catch (err) {
      console.error("Error loading reactions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReact = async (sticker: string) => {
    if (userReactions.has(sticker)) return;
    try {
      setIsAdding(true);
      await addReaction(wishId, sticker, sessionId, userName);
      await loadReactions();
    } catch (err) {
      console.error("Error adding reaction:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const buildTooltipContent = (detail: ReactionDetail) => {
    const remaining = detail.count - detail.names.length;
    const namesText =
      detail.names.length > 0 &&
      `${detail.names.join(", ")}${remaining > 0 ? `, +${remaining} người khác` : ""
      }`;
    return `${detail.count} người đã cảm xúc: ${namesText}`;
  };

  const showTooltip = (sticker: string, target: HTMLElement) => {
    const targetRect = target.getBoundingClientRect();
    const left = targetRect.left + targetRect.width / 2;
    const top = targetRect.top;
    setTooltip({ sticker, left, top });
  };

  const hideTooltip = () => setTooltip(null);

  const displayedReactions = useMemo(
    () =>
      Object.entries(reactionDetails)
        .filter(([, detail]) => detail.count > 0)
        .sort((a, b) => b[1].count - a[1].count),
    [reactionDetails]
  );

  const summaryInfo = useMemo(() => {
    const userHasReacted = userReactions.size > 0;
    const topReactions = displayedReactions; // show all icons with reactions
    const uniqueNames = Array.from(
      new Set(displayedReactions.flatMap(([, detail]) => detail.names))
    );
    const totalPeople = uniqueNames.length;
    const otherNames = uniqueNames.filter((name) => name !== userName);
    const maxNamesToShow = totalPeople <= 2 ? totalPeople : 2;

    const namesForSentence: string[] = [];
    if (userHasReacted) {
      namesForSentence.push("Bạn");
    }

    const slotsForOthers = Math.max(
      0,
      maxNamesToShow - (userHasReacted ? 1 : 0)
    );
    namesForSentence.push(...otherNames.slice(0, slotsForOthers));

    const displayedCount = (userHasReacted ? 1 : 0) + slotsForOthers;
    const remainingPeople = Math.max(totalPeople - displayedCount, 0);

    let sentence = "";
    if (namesForSentence.length === 0) {
      sentence = `${totalReactions} cam xuc`;
    } else if (remainingPeople > 0) {
      sentence = `${namesForSentence.join(
        ", "
      )} va ${remainingPeople} nguoi khac`;
    } else {
      sentence = namesForSentence.join(", ");
    }

    return { topReactions, sentence };
  }, [displayedReactions, totalReactions, userReactions.size, userName]);

  if (isLoading) return <div className="h-8" />;
  const tooltipDetail = tooltip ? reactionDetails[tooltip.sticker] : null;

  return (
    <div ref={containerRef} className="relative flex flex-col gap-3">
      {totalReactions === 0 ? (
        <span className="text-xs text-gray-400">Chưa có cảm xúc nào</span>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {summaryInfo.topReactions.map(([sticker]) => (
              <span
                key={sticker}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white bg-white shadow ring-1 ring-gray-200 text-lg cursor-default"
                onMouseEnter={(event) =>
                  showTooltip(sticker, event.currentTarget)
                }
                onMouseLeave={hideTooltip}
              >
                {sticker}
              </span>
            ))}
          </div>
          <p className="text-sm font-semibold  text-gray-700">
            {summaryInfo.sentence}
          </p>
          <span className="text-xs text-gray-400">({totalReactions})</span>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {(showAllReactions ? STICKERS : STICKERS.slice(0, 5)).map(
          ({ emoji, label }) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              disabled={isAdding || userReactions.has(emoji)}
              className={`text-2xl p-1 rounded-full transition-all duration-200 ${userReactions.has(emoji)
                ? "opacity-30 cursor-not-allowed"
                : "hover:scale-110 hover:-translate-y-0.5 active:scale-95 hover:bg-gray-100"
                }`}
              onMouseEnter={(event) =>
                reactionDetails[emoji] &&
                showTooltip(emoji, event.currentTarget)
              }
              onMouseLeave={hideTooltip}
              title={label}
            >
              {emoji}
            </button>
          )
        )}

        {/* Nút mở rộng / thu gọn */}
        {STICKERS.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAllReactions((prev) => !prev)}
            className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 text-lg hover:bg-gray-100"
            title={showAllReactions ? "Thu gọn" : "Xem thêm"}
          >
            {showAllReactions ? "−" : "+"}
          </button>
        )}
      </div>

      {tooltipDetail &&
        tooltip &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 min-w-[200px] max-w-xs text-xs text-gray-600 bg-white shadow-xl border border-gray-200 rounded-xl p-3 animate-fade-in"
            style={{
              left: Math.max(
                16,
                Math.min(window.innerWidth - 16, tooltip.left)
              ),
              top: Math.max(16, tooltip.top - 16),
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="font-semibold text-gray-800 mb-1">
              {tooltip.sticker} · {tooltipDetail.count} Người đã cảm xúc
            </p>
            <p>
              {tooltipDetail.names.length > 0
                ? `${tooltipDetail.names.join(", ")}${tooltipDetail.count - tooltipDetail.names.length > 0
                  ? `, +${tooltipDetail.count - tooltipDetail.names.length
                  } người khác`
                  : ""
                }`
                : "Chưa có người tham gia"}
            </p>
          </div>,
          document.body
        )}
    </div>
  );
}
