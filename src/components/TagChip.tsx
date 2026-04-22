import React from 'react';
import { X } from 'lucide-react';
import { useAppState } from '@/context/AppContext';

interface TagChipProps {
  name: string;
  size?: 'xs' | 'sm';
  onRemove?: () => void;
}

/**
 * Renders a tag chip styled with the master tag's color (15% bg, full color text).
 * Falls back to neutral surface colors if the tag isn't in the master list.
 */
const TagChip: React.FC<TagChipProps> = ({ name, size = 'sm', onRemove }) => {
  const { getTagByName } = useAppState();
  const tag = getTagByName(name);
  const color = tag?.color;

  const sizeClasses = size === 'xs'
    ? 'px-1 py-0 text-[10px] gap-0.5'
    : 'px-1.5 py-0.5 text-xs gap-1';

  const style = color
    ? { backgroundColor: `${color}26`, color, borderColor: `${color}55` }
    : undefined;

  return (
    <span
      className={`inline-flex items-center rounded ${sizeClasses} border`}
      style={style ?? { backgroundColor: 'hsl(var(--surface-2))', color: 'hsl(var(--muted-foreground))', borderColor: 'transparent' }}
    >
      <span className="leading-none">{name}</span>
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="hover:opacity-70 opacity-80"
          aria-label={`Remove tag ${name}`}
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  );
};

export default TagChip;
