import { X } from 'lucide-react';

interface TagChipProps {
  tag: string;
  onRemove?: () => void;
  variant?: 'default' | 'removable';
}

export function TagChip({ tag, onRemove, variant = 'default' }: TagChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f5e6e8] text-[#8b5a6b] text-xs border border-[#d4a5a5]/20">
      {tag}
      {variant === 'removable' && onRemove && (
        <button
          onClick={onRemove}
          className="hover:bg-white/50 rounded-full p-0.5 transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
