import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number | null;
  onRate?: (rating: number) => void;
  readonly?: boolean;
}

export function StarRating({
  rating,
  onRate,
  readonly = false,
}: StarRatingProps) {
  const handleClick = (e: React.MouseEvent, star: number) => {
    if (readonly || !onRate) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isHalf = clickX < rect.width / 2;

    onRate(isHalf ? star - 0.5 : star);
  };

  const getStarFill = (star: number): "full" | "half" | "empty" => {
    if (!rating) return "empty";
    if (rating >= star) return "full";
    if (rating >= star - 0.5) return "half";
    return "empty";
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = getStarFill(star);
        return (
          <button
            key={star}
            onClick={(e) => handleClick(e, star)}
            disabled={readonly}
            className={`relative ${!readonly && "hover:scale-110"} transition-transform`}
          >
            {/* Background empty star */}
            <Star size={18} className="text-gray-300" />

            {/* Filled overlay */}
            {fill !== "empty" && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: fill === "half" ? "50%" : "100%" }}
              >
                <Star size={18} className="fill-[#d4a5a5] text-[#d4a5a5]" />
              </span>
            )}
          </button>
        );
      })}

      {/* Show rating number */}
      {rating && (
        <span className="text-xs text-gray-400 ml-1 self-center">{rating}</span>
      )}
    </div>
  );
}
