import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { GuideCard } from '../data/guides';

/** Cover image with a branded gradient fallback when the image file is missing. */
export const GuideCover: React.FC<{ guide: GuideCard; className?: string }> = ({ guide, className = '' }) => {
  const [failed, setFailed] = useState(false);
  if (!failed) {
    return (
      <img
        src={guide.cover}
        alt={`غلاف ${guide.title}`}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`w-full object-cover ${className}`}
      />
    );
  }
  return (
    <div className={`w-full flex items-center justify-center text-white/90 ${className}`} style={{ background: guide.gradient }} aria-hidden="true">
      <BookOpen className="w-10 h-10" />
    </div>
  );
};

export const GuidePriceBadge: React.FC<{ priceUsd: number | null }> = ({ priceUsd }) =>
  priceUsd === null ? (
    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">مجاني</span>
  ) : (
    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">مدفوع • ${priceUsd}</span>
  );
