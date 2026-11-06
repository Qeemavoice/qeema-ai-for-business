import React, { useEffect, useState } from 'react';
import { ArrowLeft, BadgeCheck } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  jobTitle: string;
  description: string;
  imageUrl: string | null;
  alt: string;
}

interface PartnersResponse {
  partners: Partner[];
}

interface TrustedEnterpriseBrandsProps {
  onExplore?: () => void;
}

export const TrustedEnterpriseBrands: React.FC<TrustedEnterpriseBrandsProps> = ({ onExplore }) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/v1/partners', { headers: { Accept: 'application/json' } })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: PartnersResponse) => {
        if (active) setPartners(Array.isArray(data.partners) ? data.partners : []);
      })
      .catch(() => active && setPartners([]))
      .finally(() => active && setLoaded(true));
    return () => { active = false; };
  }, []);

  if (!loaded || partners.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8" dir="rtl">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FF5500]"><BadgeCheck className="h-4 w-4" /> قصص نجاح معتمدة</div>
            <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">جهات وثقت بالصوت</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">نعرض فقط الجهات التي اعتمدت النشر وأُضيف لها مرجع من لوحة الإدارة.</p>
          </div>
          {onExplore && <button onClick={onExplore} className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-bold text-[#FF5500] transition hover:bg-orange-100">اكتشف قصص النجاح <ArrowLeft className="h-4 w-4" /></button>}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {partners.slice(0, 10).map((partner) => (
            <article key={partner.id} className="group flex min-h-28 flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-center transition hover:border-orange-200 hover:bg-orange-50/50" title={partner.description || partner.name}>
              {partner.imageUrl ? <img src={partner.imageUrl} alt={partner.alt || partner.name} loading="lazy" className="h-12 max-w-full object-contain grayscale transition group-hover:grayscale-0" /> : <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-900 text-lg font-black text-white">{partner.name.charAt(0)}</div>}
              <h3 className="mt-2 text-xs font-black text-slate-800">{partner.name}</h3>
              {partner.jobTitle && <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-400">{partner.jobTitle}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
