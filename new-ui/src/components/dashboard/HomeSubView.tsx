import React, { useEffect, useState } from 'react';
import { Coins, Mic2, Clock, Volume2, ArrowLeft, Sliders } from 'lucide-react';
import { Voice, Generation, HumanBooking } from '../../types';
import { DashboardNavKey } from './DashboardSidebar';
import { useNavigate } from 'react-router-dom';
import { useVoiceTemplates, openTemplateLink } from '../../lib/voiceTemplates';
import { api, ACCOUNT_CHANGED_EVENT } from '../../lib/api';

interface HomeSubViewProps {
  voices: Voice[];
  generations: Generation[];
  playingId: string | null;
  onTogglePlay: (id: string, url: string) => void;
  onNavigateTab: (tab: DashboardNavKey) => void;
  onQuickGenerate: (text: string, voiceId: string) => void;
  onOpenStudioPreset?: (text: string, voiceId?: string) => void;
  canUseStudio?: boolean;
  onGenerated?: (newBalanceCredits: number) => void;
}

const fmt = (n: number) => n.toLocaleString('en-US');

/** One summary card of the dashboard home */
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; note: string; action: string; onClick: () => void }> = ({ icon, label, value, note, action, onClick }) => (
  <button type="button" onClick={onClick} className="group text-right bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs hover:border-brand/50 hover:shadow-sm transition-all flex flex-col gap-3">
    <span className="flex items-center justify-between">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <span className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">{icon}</span>
    </span>
    <span className="text-2xl font-black text-slate-950 font-mono">{value}</span>
    <span className="text-[11px] text-slate-500 leading-relaxed">{note}</span>
    <span className="mt-auto text-xs font-bold text-brand-text flex items-center gap-1">{action} <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" /></span>
  </button>
);

/** Dashboard home: the account at a glance (credit, human bookings, TTS use) and a short way into the TTS studio */
export const HomeSubView: React.FC<HomeSubViewProps> = ({ generations, onNavigateTab }) => {
  const navigate = useNavigate();
  const templates = useVoiceTemplates();
  const [balance, setBalance] = useState<number | null>(null);
  const [planName, setPlanName] = useState('');
  const [bookings, setBookings] = useState<HumanBooking[] | null>(null);

  useEffect(() => {
    const load = () => {
      api.getBilling().then(b => { setBalance(b.balanceCredits); setPlanName(b.currentPlan?.nameAr || ''); }).catch(() => setBalance(0));
      api.getMyBookings().then(r => setBookings(r.bookings || [])).catch(() => setBookings([]));
    };
    load();
    window.addEventListener(ACCOUNT_CHANGED_EVENT, load);
    return () => window.removeEventListener(ACCOUNT_CHANGED_EVENT, load);
  }, []);

  const live = (bookings || []).filter(b => b.status !== 'canceled');
  const bookingsValue = live.reduce((sum, b) => sum + (Number(b.priceUsd) || 0), 0);
  const inProgress = live.filter(b => b.status === 'pending' || b.status === 'in_studio').length;
  const toReview = live.filter(b => b.status === 'delivered').length;
  const ttsChars = generations.reduce((sum, g) => sum + (g.textChars || 0), 0);
  const dots = '...';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in" style={{ direction: 'rtl' }}>
      {/* 1. The account at a glance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Coins className="w-4 h-4 text-brand-text" />} label="رصيد الحروف"
          value={balance === null ? dots : fmt(balance)}
          note={planName ? `باقتك الحالية: ${planName}. كل حرف من النص يساوي نقطة.` : 'كل حرف من النص يساوي نقطة.'}
          action="الباقة والفوترة" onClick={() => onNavigateTab('billing')}
        />
        <StatCard
          icon={<Mic2 className="w-4 h-4 text-brand-text" />} label="قيمة حجوزاتي (معلقون بشريون)"
          value={bookings === null ? dots : `$${fmt(Math.round(bookingsValue * 100) / 100)}`}
          note={bookings === null ? '' : live.length ? `${fmt(live.length)} ${live.length === 1 ? 'حجز' : 'حجوزات'} مع المعلقين.` : 'لا توجد حجوزات بعد. اختر صوتاً من مكتبة الأصوات.'}
          action={live.length ? 'حجوزاتي' : 'مكتبة الأصوات'} onClick={() => onNavigateTab(live.length ? 'human-bookings' : 'voices')}
        />
        <StatCard
          icon={<Clock className="w-4 h-4 text-brand-text" />} label="حجوزات قيد التنفيذ"
          value={bookings === null ? dots : fmt(inProgress)}
          note={toReview ? `${fmt(toReview)} ${toReview === 1 ? 'تسجيل وصلك وبانتظار' : 'تسجيلات وصلتك وبانتظار'} اعتمادك.` : 'قيد المراجعة أو التسجيل لدى المعلق.'}
          action="متابعة الحجوزات" onClick={() => onNavigateTab('human-bookings')}
        />
        <StatCard
          icon={<Volume2 className="w-4 h-4 text-brand-text" />} label="توليداتي في TTS"
          value={fmt(generations.length)}
          note={generations.length ? `${fmt(ttsChars)} حرف مستخدم في التوليد.` : 'لم تولّد أي تسجيل بعد.'}
          action="استوديو التوليد TTS" onClick={() => onNavigateTab('studio')}
        />
      </div>

      {/* 2. A short way into the TTS studio (the full studio lives in «استوديو التوليد TTS») */}
      <div className="rounded-3xl bg-slate-950 text-white p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 shrink-0 rounded-2xl bg-brand flex items-center justify-center"><Sliders className="w-5 h-5" /></span>
          <div className="space-y-1">
            <h2 className="text-lg font-black">استوديو التوليد TTS</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">حوّل نصك إلى صوت عربي بأصوات مرخّصة، واختر اللهجة والسرعة والأداء، ثم نزّل الملف جاهزاً للاستخدام.</p>
          </div>
        </div>
        <button type="button" onClick={() => onNavigateTab('studio')} className="shrink-0 px-5 py-3 rounded-2xl bg-brand hover:bg-brand-orange text-white text-sm font-bold flex items-center justify-center gap-2 transition">
          افتح الاستوديو <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Templates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">نماذج الإنتاج الصوتي</h3>
            <p className="text-xs text-slate-500">ابدأ بسرعة باستخدام إعدادات مسبقة مخصصة لحملتك الإعلانية أو مشروعك</p>
          </div>
          <button
            onClick={() => window.open('/ar/voice-models', '_blank', 'noopener')}
            className="text-xs font-bold text-brand-text hover:underline"
          >
            عرض كل النماذج ←
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.slice(0, 6).map((tmpl) => (
            <div
              key={tmpl.id}
              // The template's own link (set in the admin dashboard); the studio when it has none
              onClick={() => { if (!openTemplateLink(tmpl.link, navigate)) onNavigateTab('studio'); }}
              className="group relative rounded-2xl overflow-hidden border border-slate-200/80 hover:border-brand/50 transition-all duration-300 hover:shadow-md cursor-pointer bg-white"
            >
              <div className="h-32 relative overflow-hidden bg-brand-ink">
                {tmpl.img && (
                  <img
                    src={tmpl.img}
                    alt={tmpl.title}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/90 via-brand-ink/50 to-brand-ink/10" />
                <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white border border-white/20">
                  {tmpl.tag}
                </span>
              </div>
              <div className="p-3.5 space-y-1">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-text transition-colors">
                  {tmpl.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {tmpl.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
