import { useState, useEffect } from 'react';
import { addReaction, getReactionsForWish, getUserReactionsForWish } from '../lib/supabase';

interface WishReactionsProps {
  wishId: string;
  sessionId: string;
}

const STICKERS = ['👍', '❤️', '😂', '🎉', '🌟', '✨', '🔥', '👏'];

export default function WishReactions({ wishId, sessionId }: WishReactionsProps) {
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadReactions();
  }, [wishId]);

  const loadReactions = async () => {
    try {
      setIsLoading(true);
      const allReactions = await getReactionsForWish(wishId);
      const userReactionsData = await getUserReactionsForWish(wishId, sessionId);

      const reactionCounts: Record<string, number> = {};
      allReactions.forEach(reaction => {
        reactionCounts[reaction.sticker] = (reactionCounts[reaction.sticker] || 0) + 1;
      });

      const userReactionSet = new Set(userReactionsData.map(r => r.sticker));

      setReactions(reactionCounts);
      setUserReactions(userReactionSet);
    } catch (err) {
      console.error('Error loading reactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReact = async (sticker: string) => {
    try {
      setIsAdding(true);
      await addReaction(wishId, sticker, sessionId);

      const newReactions = { ...reactions };
      newReactions[sticker] = (newReactions[sticker] || 0) + 1;
      setReactions(newReactions);

      const newUserReactions = new Set(userReactions);
      newUserReactions.add(sticker);
      setUserReactions(newUserReactions);
    } catch (err) {
      console.error('Error adding reaction:', err);
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return <div className="h-10" />;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {STICKERS.map(sticker => (
        <button
          key={sticker}
          onClick={() => !userReactions.has(sticker) && handleReact(sticker)}
          disabled={isAdding || userReactions.has(sticker)}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all duration-200 ${
            userReactions.has(sticker)
              ? 'bg-amber-200 border-2 border-amber-400 cursor-not-allowed'
              : 'bg-gray-100 border border-gray-300 hover:bg-gray-200 active:scale-90 disabled:opacity-50'
          }`}
        >
          <span className="text-base">{sticker}</span>
          {reactions[sticker] > 0 && (
            <span className="text-xs font-semibold text-gray-700">{reactions[sticker]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
