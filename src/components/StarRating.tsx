import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number | null;
  onRate?: (rating: number) => void;
  readonly?: boolean;
}

export function StarRating({ rating, onRate, readonly = false }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readonly && onRate?.(star)}
          disabled={readonly}
          className={`${!readonly && 'hover:scale-110'} transition-transform`}
        >
          <Star
            size={18}
            className={star <= (rating ?? 0) ? 'fill-[#d4a5a5] text-[#d4a5a5]' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );
}