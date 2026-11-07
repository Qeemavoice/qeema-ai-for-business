import React from 'react';
import { Award } from 'lucide-react';
import { useRowad, rowadSince } from '../lib/rowad';

/** «رائد قيمة منذ نوفمبر 2026»: shown for Rowad members (date = users.rowad_badge_at). */
export const RowadBadge: React.FC<{ size?: 'sm' | 'md'; className?: string }> = ({ size = 'sm', className = '' }) => {
  const { badgeAt } = useRowad();
  if (!badgeAt) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-brand-ink text-white font-bold whitespace-nowrap ${
        size === 'md' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
      } ${className}`}
      title="من أوائل عملاء قيمة فويس المدعوّين للوصول المبكر"
    >
      <Award className={`${size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3'} text-brand-yellow`} />
      <span>رائد قيمة منذ {rowadSince(badgeAt)}</span>
    </span>
  );
};
