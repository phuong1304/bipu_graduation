import { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
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
  const [showPicker, setShowPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReactions();
  }, [wishId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPicker]);

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

      setShowPicker(false);
    } catch (err) {
      console.error('Error adding reaction:', err);
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return <div className="h-8" />;
  }

  const displayedReactions = Object.entries(reactions)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div ref={containerRef} className="relative inline-flex items-center gap-1 flex-wrap">
      {displayedReactions.map(([sticker, count]) => (
        <button
          key={sticker}
          className="flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-gray-100 border border-gray-300 hover:bg-gray-200 transition-colors"
        >
          <span className="text-base">{sticker}</span>
          <span className="text-xs font-semibold text-gray-700">{count}</span>
        </button>
      ))}

      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          onMouseEnter={() => setShowPicker(true)}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border border-gray-300 hover:bg-gray-200 transition-colors"
          title="Add reaction"
        >
          <Plus className="w-4 h-4 text-gray-600" />
        </button>

        {showPicker && (
          <div
            onMouseLeave={() => setShowPicker(false)}
            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50 animate-fade-in-up"
          >
            <div className="grid grid-cols-4 gap-2">
              {STICKERS.map(sticker => (
                <button
                  key={sticker}
                  onClick={() => !userReactions.has(sticker) && handleReact(sticker)}
                  disabled={isAdding || userReactions.has(sticker)}
                  className={`text-2xl p-2 rounded-lg transition-all duration-200 ${
                    userReactions.has(sticker)
                      ? 'opacity-50 cursor-not-allowed bg-gray-100'
                      : 'hover:bg-gray-100 active:scale-75'
                  }`}
                  title={userReactions.has(sticker) ? 'Already reacted' : 'React'}
                >
                  {sticker}
                </button>
              ))}
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
          </div>
        )}
      </div>
    </div>
  );
}
