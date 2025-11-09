import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { addReaction, getReactionsForWish, getUserReactionsForWish } from '../lib/supabase';

interface WishReactionsProps {
  wishId: string;
  sessionId: string;
  userName: string;
}

interface ReactionDetail {
  count: number;
  names: string[];
}

const STICKERS = [
  { emoji: '\u{1F393}', label: 'Mu tot nghiep' },
  { emoji: '\u{1F389}', label: 'Phao hoa' },
  { emoji: '\u{1F973}', label: 'Party' },
  { emoji: '\u{1F4F8}', label: 'Chup hinh' },
  { emoji: '\u{1F9D1}\u{200D}\u{1F393}', label: 'Ban hoc' },
  { emoji: '\u{1F3B6}', label: 'Am nhac' },
  { emoji: '\u{1F942}', label: 'Nang ly' },
  { emoji: '\u{1F490}', label: 'Hoa tang' }
];

const MAX_NAMES_PER_STICKER = 10;

export default function WishReactions({ wishId, sessionId, userName }: WishReactionsProps) {
  const [reactionDetails, setReactionDetails] = useState<Record<string, ReactionDetail>>({});
  const [totalReactions, setTotalReactions] = useState(0);
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [tooltip, setTooltip] = useState<{ sticker: string; left: number; top: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadReactions();
  }, [wishId, sessionId]);

  const loadReactions = async () => {
    try {
      setIsLoading(true);
      const [allReactions, userReactionRows] = await Promise.all([
        getReactionsForWish(wishId),
        getUserReactionsForWish(wishId, sessionId)
      ]);

      const details: Record<string, ReactionDetail> = {};

      allReactions.forEach((reaction) => {
        const sticker = reaction.sticker;
        const name = reaction.reactor_name?.trim() || 'Khach';

        if (!details[sticker]) {
          details[sticker] = { count: 0, names: [] };
        }

        details[sticker].count += 1;
        const names = details[sticker].names;
        if (names.length < MAX_NAMES_PER_STICKER && !names.includes(name)) {
          names.push(name);
        }
      });

      const userStickerSet = new Set(userReactionRows.map((row) => row.sticker));
      setTotalReactions(allReactions.length);
      setReactionDetails(details);
      setUserReactions(userStickerSet);
    } catch (err) {
      console.error('Error loading reactions:', err);
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
      console.error('Error adding reaction:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const buildTooltipContent = (detail: ReactionDetail) => {
    const remaining = detail.count - detail.names.length;
    const namesText =
      detail.names.length > 0
        && `${detail.names.join(', ')}${remaining > 0 ? `, +${remaining} nguoi khac` : ''}`
    return `${detail.count} nguoi da cam xuc: ${namesText}`;
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
      new Set(
        displayedReactions.flatMap(([, detail]) => detail.names)
      )
    );
    const totalPeople = uniqueNames.length;
    const otherNames = uniqueNames.filter((name) => name !== userName);
    const maxNamesToShow = totalPeople <= 2 ? totalPeople : 2;

    const namesForSentence: string[] = [];
    if (userHasReacted) {
      namesForSentence.push('Ban');
    }

    const slotsForOthers = Math.max(0, maxNamesToShow - (userHasReacted ? 1 : 0));
    namesForSentence.push(...otherNames.slice(0, slotsForOthers));

    const displayedCount = (userHasReacted ? 1 : 0) + slotsForOthers;
    const remainingPeople = Math.max(totalPeople - displayedCount, 0);

    let sentence = '';
    if (namesForSentence.length === 0) {
      sentence = `${totalReactions} cam xuc`;
    } else if (remainingPeople > 0) {
      sentence = `${namesForSentence.join(', ')} va ${remainingPeople} nguoi khac`;
    } else {
      sentence = namesForSentence.join(', ');
    }

    return { topReactions, sentence };
  }, [displayedReactions, totalReactions, userReactions.size, userName]);

  if (isLoading) return <div className="h-8" />;
  const tooltipDetail = tooltip ? reactionDetails[tooltip.sticker] : null;

  return (
    <div ref={containerRef} className="relative flex flex-col gap-3">
      {totalReactions === 0 ? (
        <span className="text-xs text-gray-400">Chua co cam xuc nao</span>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {summaryInfo.topReactions.map(([sticker, detail]) => (
              <span
                key={sticker}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white bg-white shadow ring-1 ring-gray-200 text-lg cursor-default"
                onMouseEnter={(event) => showTooltip(sticker, event.currentTarget)}
                onMouseLeave={hideTooltip}
              >
                {sticker}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-700">{summaryInfo.sentence}</p>
          <span className="text-xs text-gray-400">({totalReactions})</span>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {STICKERS.map(({ emoji, label }) => (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            disabled={isAdding || userReactions.has(emoji)}
            className={`text-2xl p-1 rounded-full transition-all duration-200 ${
              userReactions.has(emoji)
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:scale-110 hover:-translate-y-0.5 active:scale-95 hover:bg-gray-100'
            }`}
            onMouseEnter={(event) => reactionDetails[emoji] && showTooltip(emoji, event.currentTarget)}
            onMouseLeave={hideTooltip}
          >
            {emoji}
          </button>
        ))}
      </div>

      {tooltipDetail &&
        tooltip &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 min-w-[200px] max-w-xs text-xs text-gray-600 bg-white shadow-xl border border-gray-200 rounded-xl p-3 animate-fade-in"
            style={{
              left: Math.max(16, Math.min(window.innerWidth - 16, tooltip.left)),
              top: Math.max(16, tooltip.top - 16),
              transform: 'translate(-50%, -100%)'
            }}
          >
            <p className="font-semibold text-gray-800 mb-1">
              {tooltip.sticker} · {tooltipDetail.count} nguoi da cam xuc
            </p>
            <p>
              {tooltipDetail.names.length > 0
                ? `${tooltipDetail.names.join(', ')}${
                    tooltipDetail.count - tooltipDetail.names.length > 0
                      ? `, +${tooltipDetail.count - tooltipDetail.names.length} nguoi khac`
                      : ''
                  }`
                : 'Chua co ten nguoi tham gia'}
            </p>
          </div>,
          document.body
        )}
    </div>
  );
}
