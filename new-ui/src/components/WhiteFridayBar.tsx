import React, { useEffect, useState } from 'react';

// ponytail: fixed end date; move it to the dashboard settings if offers start changing often
const ENDS_AT = new Date('2026-12-01T00:00:00+03:00').getTime();   // end of 30 Nov 2026, Riyadh time

const two = (n: number) => String(n).padStart(2, '0');

/**
 * «عروض الجمعة البيضاء» strip at the top of the header: the sentence and a live countdown only (no offer prices).
 * For visitors the strip opens the sign-up; hidden once the countdown ends.
 */
export const WhiteFridayBar: React.FC<{ onSignup?: () => void }> = ({ onSignup }) => {
  const [now, setNow] = useState(() => Date.now());
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
    <div
      role={onSignup ? 'button' : undefined}
      tabIndex={onSignup ? 0 : undefined}
      onClick={onSignup}
      onKeyDown={e => { if (onSignup && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSignup(); } }}
      className={`block bg-brand-ink text-white transition-colors ${onSignup ? 'cursor-pointer hover:bg-brand-ink/95' : ''}`}
      aria-label={onSignup ? 'عروض الجمعة البيضاء: أنشئ حسابك الآن' : 'عروض الجمعة البيضاء'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-10 py-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-5 text-xs sm:text-sm">
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
        {onSignup && <span className="inline font-bold underline underline-offset-4 decoration-brand-yellow/60 whitespace-nowrap">أنشئ حسابك الآن</span>}
      </div>
    </div>
  );
};
