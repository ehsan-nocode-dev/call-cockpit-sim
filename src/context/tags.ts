export interface Tag {
  id: string;
  name: string;
  color: string;
}

// Master seed list (per spec).
export const SEED_TAGS: Tag[] = [
  { id: '1', name: 'manufacturing', color: '#6366f1' },
  { id: '2', name: 'automation', color: '#10b981' },
  { id: '3', name: 'family-owned', color: '#f59e0b' },
  { id: '4', name: 'founder', color: '#3b82f6' },
  { id: '5', name: 'retiring-soon', color: '#ef4444' },
  { id: '6', name: 'evening-ok', color: '#8b5cf6' },
];

// Color palette cycled through when auto-creating new tags.
export const TAG_PALETTE = [
  '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16', '#a855f7',
  '#eab308', '#0ea5e9', '#f43f5e', '#22c55e',
];
