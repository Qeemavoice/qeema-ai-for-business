import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// ponytail: fixed end date; move it to the dashboard settings if offers start changing often
const ENDS_AT = new Date('2026-12-01T00:00:00+03:00').getTime();   // end of 30 Nov 2026, Riyadh time

const two = (n: number) => String(n).padStart(2, '0');

/** «عروض الجمعة البيضاء» strip at the top of the header with a live countdown; hidden once the offer ends. */
export const WhiteFridayBar: React.FC = () => {
  const [now, setNow] = useState(() => Date.now());
  const target = '/ar/pricing';
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const left = Math.max(0, Math.floor((ENDS_AT - now) / 1000));
  if (!left) return null;
  const parts = [
    { v: Math.floor(left / 86400), label: 'يوم' },
    { v: Math.floor((left % 86400) / 3600), label: 'ساعة' },
    { v: Math.floor((left % 3600) / 60), label: 'دقيقة' },
    { v: left % 60, label: 'ثانية' }
  ];

  return (
    <Link
      to={target}
      className="block bg-brand-ink text-white hover:bg-brand-ink/95 transition-colors"
      aria-label="عروض الجمعة البيضاء: شاهد العروض"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-center gap-3 sm:gap-5 text-xs sm:text-sm">
        <span className="font-black whitespace-nowrap">
          <span className="text-brand-yellow">عروض</span> الجمعة البيضاء
        </span>
        <span className="flex items-center gap-1.5 sm:gap-2" dir="rtl" aria-live="off">
          {parts.map(p => (
            <span key={p.label} className="flex items-baseline gap-0.5">
              <span className="font-mono font-black tabular-nums text-brand-yellow">{two(p.v)}</span>
              <span className="text-[10px] sm:text-[11px] text-white/70">{p.label}</span>
            </span>
          ))}
        </span>
        <span className="hidden sm:inline font-bold underline underline-offset-4 decoration-brand-yellow/60 whitespace-nowrap">شاهد العروض</span>
      </div>
    </Link>
  );
};
