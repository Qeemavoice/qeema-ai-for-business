import React, { useEffect, useMemo, useState } from 'react';
import { Search, Pencil, RefreshCw, Send, Copy, Check, ExternalLink, Mail, Phone, Eye, Ban, RotateCcw, Plus, ShieldCheck } from 'lucide-react';
import { narratorService } from '../../services/narratorService';
import { Narrator, NarratorNotification, NarratorStatus, VoiceOverBooking, VoiceSample, AIVoice } from '../../types';
import { buildSampleSlug } from '../VoiceLibraryView';

/** A narrator's price per minute above this is a typing mistake (e.g. a phone number in the price field) */
const MAX_RATE_USD = 1000;
const validRate = (p: number) => Number.isFinite(p) && p > 0 && p <= MAX_RATE_USD;
import { finalPrice, commissionAmount, fmtUsd, commissionPercent } from '../../../shared/pricing';
import { reasonByCode } from '../../../shared/sampleRules';
import { fmtDate, fmtDateTime, fmtMoney, fmtNum } from '../../lib/format';
import { exportToExcel } from '../../lib/exportExcel';
import { Badge, Drawer, ExcelButton, Field, FilterChip, Pager, SamplePlayer, StatCard, Tabs, Tone } from './adminUi';

const PAGE_SIZE = 10;

const STATUS: Record<NarratorStatus, { label: string; tone: Tone }> = {
  active: { label: 'مفعّل', tone: 'green' },
  invited: { label: 'تمت الدعوة', tone: 'amber' },
  unclaimed: { label: 'غير مطالب به', tone: 'slate' },
  suspended: { label: 'موقوف', tone: 'red' }
};
const KYC: Record<string, { label: string; tone: Tone }> = {
  approved: { label: 'موثّق', tone: 'green' },
  pending: { label: 'قيد التحقق', tone: 'amber' },
  rejected: { label: 'مرفوض', tone: 'red' },
  none: { label: 'غير موثّق', tone: 'slate' }
};
const BADGE: Record<string, { label: string; tone: Tone }> = {
  verified: { label: 'معلق بشري ✓', tone: 'green' },
  pending: { label: 'طلب قيد المراجعة', tone: 'amber' },
  none: { label: 'بدون شارة', tone: 'slate' }
};
const SAMPLE_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending_review: { label: 'قيد المراجعة', tone: 'amber' },
  published: { label: 'معتمدة', tone: 'green' },
  rejected: { label: 'مرفوضة', tone: 'red' },
  hidden: { label: 'مخفية', tone: 'slate' }
};
const BOOKING_STATUS: Record<string, { label: string; tone: Tone }> = {
  in_progress: { label: 'قيد التنفيذ', tone: 'amber' },
  completed: { label: 'مكتمل', tone: 'blue' },
  paid: { label: 'مدفوع', tone: 'green' }
};

interface Props { onNavigateToClaim?: (token: string) => void; onOpenSamples?: () => void; }

export const AdminNarratorsView: React.FC<Props> = ({ onNavigateToClaim, onOpenSamples }) => {
  const [narrators, setNarrators] = useState<Narrator[]>([]);
  const [samples, setSamples] = useState<VoiceSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | NarratorStatus>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);
  const [adding, setAdding] = useState(false);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const load = async () => {
    setLoading(true);
    try {
      const [n, s] = await Promise.all([narratorService.getAllNarrators(), narratorService.getAllVoiceSamples()]);
      setNarrators(n); setSamples(s);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const samplesOf = (id: string) => samples.filter(s => s.narratorId === id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return narrators.filter(n =>
      (filter === 'all' || n.status === filter) &&
      // old imported accounts can lack a name, phone or dialects: search what each narrator has
      (!q || [n.displayName, n.phone, n.email, ...(n.dialects || [])].some(v => String(v || '').toLowerCase().includes(q)))
    );
  }, [narrators, filter, query]);

  useEffect(() => { setPage(1); }, [filter, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // voices in «مكتبة الأصوات» and how many narrators they belong to
  const libraryVoices = narratorService.allLibraryVoices();
  const libraryNarrators = new Set(libraryVoices.map(v => v.narratorId)).size;
  const pendingSamples = samples.filter(s => s.status === 'pending_review').length;

  const sendInvite = async (id: string) => {
    try {
      const u = await narratorService.sendInvite(id) as Narrator & { inviteEmailed?: boolean };
      setNarrators(p => p.map(n => n.id === id ? u : n));
      flash(u.inviteEmailed ? 'تم إرسال رابط التفعيل إلى بريد المعلق' : 'تم إنشاء رابط التفعيل. البريد غير مفعّل (SMTP)، انسخ الرابط وأرسله للمعلق');
    } catch (e: any) { flash(e?.message || 'تعذر إرسال الدعوة'); }
  };
  const bulkInvite = async () => {
    setBulkSending(true);
    try { const r = await narratorService.bulkSendInvites(); await load(); flash(`تم إنشاء ${r.count} رابط تفعيل، وأُرسل منها بالبريد ${r.emailed}`); } finally { setBulkSending(false); }
  };
  const copyLink = (token: string) => { navigator.clipboard?.writeText(`${window.location.origin}/claim/${token}`); flash('تم نسخ رابط التفعيل'); };

  const exportExcel = () => exportToExcel<Narrator>('narrators', 'المعلقون', [
    { header: 'المعرّف', value: 'id', width: 22 },
    { header: 'الاسم', value: 'displayName' },
    { header: 'الهاتف', value: 'phone' },
    { header: 'البريد', value: n => n.email || '', width: 30 },
    { header: 'اللهجات', value: n => (n.dialects || []).join('، '), width: 30 },
    { header: 'الحالة', value: n => STATUS[n.status].label },
    { header: 'التوثيق (KYC)', value: n => (KYC[n.kycStatus] || KYC.none).label },
    { header: 'شارة معلق بشري', value: n => BADGE[n.humanBadge || 'none'].label },
    { header: 'سعر المعلق / دقيقة ($)', value: n => n.rates?.perMinuteUsd ?? '' },
    { header: `عمولة المنصة ${commissionPercent()}% ($)`, value: n => n.rates?.perMinuteUsd ? commissionAmount(n.rates.perMinuteUsd) : '' },
    { header: 'السعر النهائي بالمكتبة / دقيقة ($)', value: n => n.rates?.perMinuteUsd ? finalPrice(n.rates.perMinuteUsd) : '' },
    { header: 'العينات المعتمدة', value: n => samplesOf(n.id).filter(s => s.status === 'published').length },
    { header: 'إجمالي العينات', value: n => samplesOf(n.id).length },
    { header: 'أصوات المكتبة', value: n => narratorService.libraryVoicesOf(n.id).length },
    { header: 'تاريخ الانضمام', value: n => fmtDate(n.createdAt) }
  ], filtered);

  const selected = narrators.find(n => n.id === selectedId) || null;

  return (
    <div className="space-y-4" dir="rtl">
      {toast && <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">{toast}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="إجمالي المعلقين" value={fmtNum(narrators.length)} />
        <StatCard label="الحسابات المفعّلة" value={fmtNum(narrators.filter(n => n.status === 'active').length)} tone="green" />
        <StatCard label="عينات بانتظار المراجعة" value={fmtNum(pendingSamples)} tone="amber" hint="تُراجع من صفحة العينات" />
        <StatCard label="عدد الأصوات" value={fmtNum(libraryVoices.length)} tone="orange" hint={`في مكتبة الأصوات، لـ ${fmtNum(libraryNarrators)} معلق`} />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="بحث بالاسم أو الهاتف أو البريد أو اللهجة"
              className="w-full pr-10 pl-3 py-2.5 bg-slate-50 rounded-xl text-xs border border-transparent focus:border-slate-300 outline-hidden" />
          </div>
          <button onClick={() => setAdding(true)} className="px-4 py-2.5 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-4 h-4" /><span>إضافة معلق</span>
          </button>
          <button onClick={bulkInvite} disabled={bulkSending} className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
            <Send className="w-4 h-4" /><span>{bulkSending ? 'جارٍ الإرسال...' : 'دعوات جماعية'}</span>
          </button>
          <ExcelButton onClick={exportExcel} disabled={filtered.length === 0} />
          <button onClick={load} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer" title="تحديث"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {([['all', 'الكل'], ['active', 'مفعّلون'], ['invited', 'تمت الدعوة'], ['unclaimed', 'غير مطالب بالحساب'], ['suspended', 'موقوفون']] as const).map(([k, l]) => (
            <FilterChip key={k} active={filter === k} onClick={() => setFilter(k as any)}>
              {l} ({k === 'all' ? narrators.length : narrators.filter(n => n.status === k).length})
            </FilterChip>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="text-slate-400">
                <th className="p-3 font-bold">المعلق</th>
                <th className="p-3 font-bold">التواصل</th>
                <th className="p-3 font-bold">اللهجات</th>
                <th className="p-3 font-bold">سعر المعلق / د</th>
                <th className="p-3 font-bold">السعر النهائي / د</th>
                <th className="p-3 font-bold">العينات</th>
                <th className="p-3 font-bold">التوثيق</th>
                <th className="p-3 font-bold">شارة معلق بشري</th>
                <th className="p-3 font-bold">الحالة</th>
                <th className="p-3 font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {!loading && pageItems.length === 0 && <tr><td colSpan={10} className="p-10 text-center text-slate-400">لا توجد بيانات</td></tr>}
              {pageItems.map(n => {
                const ss = samplesOf(n.id);
                const pub = ss.filter(s => s.status === 'published').length;
                const pend = ss.filter(s => s.status === 'pending_review').length;
                const price = n.rates?.perMinuteUsd;
                return (
                  <tr key={n.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="p-3">
                      <button onClick={() => setSelectedId(n.id)} className="flex items-center gap-2.5 text-right cursor-pointer">
                        <img src={n.avatarUrl} alt="" className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
                        <span><span className="font-bold text-slate-900 block hover:text-brand-text">{n.displayName}</span><span className="text-[10px] text-slate-400 font-mono">{n.id}</span></span>
                      </button>
                    </td>
                    <td className="p-3 text-slate-600">
                      <span className="block font-mono text-[11px]" dir="ltr">{n.phone}</span>
                      <span className="block text-[11px] text-slate-400">{n.email || '-'}</span>
                    </td>
                    <td className="p-3"><div className="flex flex-wrap gap-1 max-w-[190px]">{(n.dialects || []).map(d => <span key={d} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">{d}</span>)}</div></td>
                    {price && !validRate(price) ? (
                      <td colSpan={2} className="p-3"><Badge tone="red">سعر غير صالح: {fmtNum(price)}</Badge></td>
                    ) : (
                      <>
                        <td className="p-3 font-mono font-bold text-slate-800">{price ? `$${fmtUsd(price)}` : '-'}</td>
                        <td className="p-3 font-mono font-bold text-brand-text">{price ? `$${fmtUsd(finalPrice(price))}` : '-'}</td>
                      </>
                    )}
                    <td className="p-3">
                      <span className="font-mono font-bold text-slate-800">{pub}/{ss.length}</span>
                      {pend > 0 && <Badge tone="amber" className="mr-1.5">{pend} بالانتظار</Badge>}
                      {narratorService.libraryVoicesOf(n.id).length > 0 && <span className="block text-[10px] text-slate-500 mt-0.5">{narratorService.libraryVoicesOf(n.id).length} صوت في المكتبة</span>}
                    </td>
                    <td className="p-3"><Badge tone={(KYC[n.kycStatus] || KYC.none).tone}>{(KYC[n.kycStatus] || KYC.none).label}</Badge></td>
                    <td className="p-3"><Badge tone={BADGE[n.humanBadge || 'none'].tone}>{BADGE[n.humanBadge || 'none'].label}</Badge></td>
                    <td className="p-3"><Badge tone={STATUS[n.status].tone}>{STATUS[n.status].label}</Badge></td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setSelectedId(n.id)} className="px-2.5 py-1.5 rounded-lg bg-brand-ink hover:bg-brand-ink/90 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"><Eye className="w-3.5 h-3.5" />الملف</button>
                        <button onClick={() => setSelectedId(n.id)} title="تعديل الاسم والسعر" className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-brand text-slate-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"><Pencil className="w-3.5 h-3.5" />تعديل</button>
                        {n.status !== 'active' && n.status !== 'suspended' && (
                          <button onClick={() => sendInvite(n.id)} className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer">{n.status === 'unclaimed' ? 'إرسال دعوة' : 'إعادة إرسال'}</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pager page={page} pages={pages} total={filtered.length} onPage={setPage} />
      </div>

      {adding && <AddNarratorDrawer onClose={() => setAdding(false)} onAdded={async (n, msg) => { setAdding(false); await load(); setSelectedId(n.id); flash(msg); }} />}

      {selected && (
        <NarratorDrawer
          narrator={selected}
          samples={samplesOf(selected.id)}
          onClose={() => setSelectedId(null)}
          onChanged={(n) => setNarrators(p => p.map(x => x.id === n.id ? n : x))}
          onReload={load}
          onCopy={copyLink}
          onInvite={sendInvite}
          onPreviewClaim={onNavigateToClaim}
          onOpenSamples={onOpenSamples}
          flash={flash}
        />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------------------------------------ */

interface DrawerProps {
  narrator: Narrator; samples: VoiceSample[];
  onClose: () => void; onChanged: (n: Narrator) => void; onReload: () => void;
  onCopy: (t: string) => void; onInvite: (id: string) => void; onPreviewClaim?: (t: string) => void; onOpenSamples?: () => void;
  flash: (m: string) => void;
}

/** «إضافة معلق»: creates the narrator's account; the narrator picks their own password from the activation link */
const AddNarratorDrawer: React.FC<{ onClose: () => void; onAdded: (n: Narrator, msg: string) => void }> = ({ onClose, onAdded }) => {
  const [f, setF] = useState({ displayName: '', email: '', phone: '', price: '', sendInvite: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof f, v: any) => setF(p => ({ ...p, [k]: v }));
  const input = 'mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-hidden focus:border-brand';
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const price = parseFloat(f.price);
      const { narrator, invite } = await narratorService.adminCreateNarrator({
        displayName: f.displayName, email: f.email, phone: f.phone || undefined, perMinuteUsd: isNaN(price) ? undefined : price, sendInvite: f.sendInvite
      });
      onAdded(narrator, invite ? (invite.emailed ? 'تمت إضافة المعلق وإرسال رابط التفعيل إلى بريده' : 'تمت إضافة المعلق، وتعذر إرسال البريد: انسخ رابط التفعيل من ملفه') : 'تمت إضافة المعلق');
    } catch (err) { setError(err instanceof Error ? err.message : 'تعذر إضافة المعلق'); } finally { setSaving(false); }
  };
  return (
    <Drawer title="إضافة معلق" subtitle="ينشئ حساب معلق في الموقع، ويختار المعلق كلمة مروره بنفسه من رابط التفعيل" onClose={onClose} width="max-w-lg">
      <form onSubmit={submit} className="p-6 space-y-4">
        <label className="block text-xs font-bold text-slate-700">اسم المعلق <span className="text-rose-500">*</span>
          <input required minLength={2} maxLength={80} value={f.displayName} onChange={e => set('displayName', e.target.value)} className={input} />
          <span className="block text-[11px] font-normal text-slate-400 mt-1">يظهر في الإدارة ولوحة المعلق فقط، ولا يظهر للعملاء</span>
        </label>
        <label className="block text-xs font-bold text-slate-700">البريد الإلكتروني <span className="text-rose-500">*</span>
          <input required type="email" dir="ltr" value={f.email} onChange={e => set('email', e.target.value)} className={input} />
        </label>
        <label className="block text-xs font-bold text-slate-700">رقم الهاتف
          <input type="tel" dir="ltr" placeholder="+966..." value={f.phone} onChange={e => set('phone', e.target.value)} className={input} />
        </label>
        <label className="block text-xs font-bold text-slate-700">سعر المعلق / دقيقة ($)
          <input type="number" min="1" max={MAX_RATE_USD} step="1" dir="ltr" value={f.price} onChange={e => set('price', e.target.value)} className={`${input} w-32`} />
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
          <input type="checkbox" checked={f.sendInvite} onChange={e => set('sendInvite', e.target.checked)} className="w-4 h-4 accent-brand" />
          إرسال رابط التفعيل إلى بريد المعلق الآن
        </label>
        {error && <p className="text-xs font-bold text-rose-600">{error}</p>}
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold cursor-pointer disabled:opacity-50">{saving ? 'جارٍ الإضافة...' : 'إضافة المعلق'}</button>
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">إلغاء</button>
        </div>
      </form>
    </Drawer>
  );
};

const NarratorDrawer: React.FC<DrawerProps> = ({ narrator: n, samples, onClose, onChanged, onReload, onCopy, onInvite, onPreviewClaim, onOpenSamples, flash }) => {
  const [tab, setTab] = useState('overview');
  const [bookings, setBookings] = useState<VoiceOverBooking[]>([]);
  const [earnings, setEarnings] = useState<{ voThisMonth: number; aiThisMonth: number; totalMonthly: number; availableBalance: number } | null>(null);
  const [aiVoice, setAiVoice] = useState<AIVoice | null>(null);
  const [notifs, setNotifs] = useState<NarratorNotification[]>([]);
  const [priceInput, setPriceInput] = useState(String(n.rates?.perMinuteUsd ?? ''));
  const [nameInput, setNameInput] = useState(n.displayName || '');
  const [nameError, setNameError] = useState('');
  const [noteText, setNoteText] = useState('');
  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');

  const refreshNotifs = async () => setNotifs(await narratorService.getNotifications(n.id));
  const library = useMemo(() => narratorService.libraryVoicesOf(n.id), [n.id]);

  useEffect(() => {
    narratorService.getVoiceOverBookings(n.id).then(setBookings);
    narratorService.getMonthlyEarnings(n.id).then(setEarnings);
    narratorService.getAIVoice(n.id).then(setAiVoice);
    refreshNotifs();
    setPriceInput(String(n.rates?.perMinuteUsd ?? ''));
    setNameInput(n.displayName || ''); setNameError('');
  }, [n.id]);

  const priceNum = parseFloat(priceInput);
  const validPrice = !isNaN(priceNum) && validRate(priceNum);
  const paidTotal = bookings.filter(b => b.status === 'paid').reduce((a, b) => a + b.amount, 0);

  const saveName = async () => {
    setNameError('');
    try {
      const u = await narratorService.adminUpdateNarrator(n.id, { displayName: nameInput });
      onChanged(u); flash('تم تحديث اسم المعلق وتسجيل التغيير في سجل التدقيق');
    } catch (e) { setNameError(e instanceof Error ? e.message : 'تعذر حفظ الاسم'); }
  };
  const savePrice = async () => {
    if (!validPrice) return;
    const u = await narratorService.setNarratorPrice(n.id, priceNum);
    onChanged(u); flash('تم تحديث سعر المعلق وتسجيل التغيير في سجل التدقيق');
  };
  const setBadge = async (status: 'none' | 'verified') => {
    const u = await narratorService.setHumanBadge(n.id, status);
    onChanged(u); refreshNotifs(); flash(status === 'verified' ? 'تم منح شارة «معلق بشري» وإبلاغ المعلق' : 'تم سحب الشارة وإبلاغ المعلق');
  };
  const toggleSuspend = async () => {
    const u = await narratorService.setNarratorSuspended(n.id, n.status !== 'suspended');
    onChanged(u); refreshNotifs(); flash(u.status === 'suspended' ? 'تم إيقاف الحساب وإبلاغ المعلق' : 'تمت إعادة تفعيل الحساب');
  };
  const addNote = async () => {
    if (!noteText.trim()) return;
    const u = await narratorService.addAdminNote(n.id, noteText); onChanged(u); setNoteText('');
  };
  const sendMsg = async () => {
    if (!msgTitle.trim() || !msgBody.trim()) return;
    await narratorService.sendAdminMessage(n.id, msgTitle.trim(), msgBody.trim());
    setMsgTitle(''); setMsgBody(''); refreshNotifs(); flash('وصلت الرسالة إلى حساب المعلق');
  };

  return (
    <Drawer
      title={<span className="flex items-center gap-3"><img src={n.avatarUrl} alt="" className="w-10 h-10 rounded-xl object-cover" />{n.displayName}</span>}
      subtitle={<span className="flex items-center gap-2"><Badge tone={STATUS[n.status].tone}>{STATUS[n.status].label}</Badge><span className="font-mono">{n.id}</span></span>}
      onClose={onClose}
    >
      <Tabs active={tab} onChange={setTab} tabs={[
        { id: 'overview', label: 'نظرة عامة' },
        { id: 'samples', label: 'العينات', count: samples.length },
        { id: 'library', label: 'أصواته في المكتبة', count: library.length },
        { id: 'earnings', label: 'الحجوزات والأرباح', count: bookings.length },
        { id: 'notifs', label: 'الإشعارات', count: notifs.length },
        { id: 'notes', label: 'ملاحظات الإدارة', count: n.adminNotes?.length || 0 }
      ]} />

      <div className="p-6 space-y-5">
        {tab === 'overview' && (
          <>
            <div className="rounded-2xl border border-slate-200 p-4">
              <Field label="الهاتف"><span dir="ltr" className="font-mono flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" />{n.phone}</span></Field>
              <Field label="البريد الإلكتروني"><span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" />{n.email || '-'}</span></Field>
              <Field label="اللهجات المعتمدة">{(n.dialects || []).join('، ')}</Field>
              <Field label="التوثيق (KYC)"><Badge tone={(KYC[n.kycStatus] || KYC.none).tone}>{(KYC[n.kycStatus] || KYC.none).label}</Badge></Field>
              <Field label="شارة «معلق بشري»">
                <span className="flex items-center gap-2 flex-wrap">
                  <Badge tone={BADGE[n.humanBadge || 'none'].tone}>{BADGE[n.humanBadge || 'none'].label}</Badge>
                  {n.humanBadge !== 'verified' && n.humanVerification && (
                    <button onClick={() => setBadge('verified')} className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer">منح الشارة</button>
                  )}
                  {n.humanBadge === 'verified' && (
                    <button onClick={() => { if (window.confirm('سحب شارة «معلق بشري» من هذا المعلق؟')) setBadge('none'); }} className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold cursor-pointer">سحب الشارة</button>
                  )}
                  {!n.humanVerification && n.humanBadge !== 'verified' && <span className="text-[10px] text-slate-400">لم يرفع المعلق مستنداته بعد</span>}
                  {n.humanBadge === 'pending' && (
                    <button onClick={() => setBadge('none')} className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer">رفض الطلب</button>
                  )}
                </span>
              </Field>
              {n.humanVerification && (
                <div className="py-3 border-b border-slate-100 space-y-2.5 text-xs">
                  <span className="text-slate-500 font-semibold">مستندات طلب الشارة ({fmtDate(n.humanVerification.submittedAt)})</span>
                  <div className="flex items-start gap-3">
                    <img src={n.humanVerification.selfieUrl} alt="سيلفي المعلق" className="w-24 h-24 rounded-xl object-cover border border-slate-200 shrink-0" />
                    <div className="space-y-2 min-w-0 flex-1">
                      <p className="text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-2.5 border border-slate-100">«{n.humanVerification.text}»</p>
                      <SamplePlayer url={n.humanVerification.voiceUrl} compact />
                    </div>
                  </div>
                </div>
              )}
              <Field label="الصوت الذكي (AI)">{aiVoice ? aiVoice.status : 'لم يبدأ'}</Field>
              <Field label="تاريخ الانضمام">{fmtDate(n.createdAt)}</Field>
              <Field label="رمز التفعيل">
                {n.claimToken ? (
                  <span className="flex items-center gap-1.5">
                    <code className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-brand-text">{n.claimToken}</code>
                    <button onClick={() => onCopy(n.claimToken!)} className="p-1 rounded bg-slate-100 hover:bg-slate-200 cursor-pointer"><Copy className="w-3 h-3" /></button>
                    {n.claimTokenExpiresAt && <span className="text-[10px] text-slate-400 font-normal">ينتهي {fmtDate(n.claimTokenExpiresAt)}</span>}
                  </span>
                ) : 'لا يوجد'}
              </Field>
            </div>
            {n.bio && <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-2xl p-4">{n.bio}</p>}

            {/* Name (admin only; clients see clip names, never the narrator's) */}
            <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
              <h4 className="text-sm font-black text-slate-900">اسم المعلق</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">يظهر في لوحة الإدارة ولوحة المعلق فقط، ولا يظهر للعملاء.</p>
              <div className="flex items-end gap-3 flex-wrap">
                <input value={nameInput} onChange={e => setNameInput(e.target.value)} maxLength={80} placeholder="اسم المعلق"
                  className="flex-1 min-w-48 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-hidden focus:border-brand" />
                <button onClick={saveName} disabled={nameInput.trim().length < 2 || nameInput.trim() === (n.displayName || '').trim()} className="px-4 py-2.5 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold cursor-pointer disabled:opacity-30">حفظ الاسم</button>
              </div>
              {nameError && <p className="text-[11px] font-bold text-rose-600">{nameError}</p>}
            </div>

            {/* Pricing */}
            <div className="rounded-2xl border border-orange-200 bg-orange-50/40 p-4 space-y-3">
              <h4 className="text-sm font-black text-slate-900">التسعير</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">لكل معلق سعره الخاص للدقيقة. السعر الذي يراه العميل في مكتبة الأصوات البشرية هو السعر النهائي (سعر المعلق + عمولة المنصة {commissionPercent()}%).</p>
              <div className="flex items-end gap-3 flex-wrap">
                <label className="text-xs font-bold text-slate-700">سعر المعلق / دقيقة ($)
                  <input type="number" min="1" step="1" value={priceInput} onChange={e => setPriceInput(e.target.value)} dir="ltr"
                    className="mt-1 block w-32 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold outline-hidden focus:border-brand" />
                </label>
                <button onClick={savePrice} disabled={!validPrice || priceNum === n.rates?.perMinuteUsd} className="px-4 py-2.5 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold cursor-pointer disabled:opacity-30">حفظ السعر</button>
              {priceNum > MAX_RATE_USD && <p className="text-[11px] font-bold text-rose-600">السعر أعلى من {MAX_RATE_USD}$ للدقيقة: تأكد من الرقم (قد يكون رقم هاتف)</p>}
              </div>
              {validPrice && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white rounded-xl p-2.5 border border-slate-200"><p className="text-[10px] text-slate-400">للمعلق</p><p className="font-mono font-black">${fmtUsd(priceNum)}</p></div>
                  <div className="bg-white rounded-xl p-2.5 border border-slate-200"><p className="text-[10px] text-slate-400">عمولة المنصة {commissionPercent()}%</p><p className="font-mono font-black text-emerald-600">+${fmtUsd(commissionAmount(priceNum))}</p></div>
                  <div className="bg-white rounded-xl p-2.5 border border-orange-300"><p className="text-[10px] text-slate-400">السعر النهائي للعميل</p><p className="font-mono font-black text-brand-text">${fmtUsd(finalPrice(priceNum))}</p></div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {n.claimToken && onPreviewClaim && (
                <button onClick={() => onPreviewClaim(n.claimToken!)} className="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-brand-text border border-orange-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"><ExternalLink className="w-3.5 h-3.5" />معاينة صفحة التفعيل</button>
              )}
              {n.status !== 'active' && n.status !== 'suspended' && (
                <button onClick={() => onInvite(n.id)} className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"><Send className="w-3.5 h-3.5" />{n.status === 'unclaimed' ? 'إرسال دعوة' : 'إعادة إرسال الدعوة'}</button>
              )}
              <button onClick={toggleSuspend} className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${n.status === 'suspended' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'}`}>
                {n.status === 'suspended' ? <><RotateCcw className="w-3.5 h-3.5" />إعادة تفعيل الحساب</> : <><Ban className="w-3.5 h-3.5" />إيقاف الحساب</>}
              </button>
            </div>
          </>
        )}

        {tab === 'samples' && (
          <>
            {samples.length === 0 && <p className="text-center text-slate-400 text-xs py-10">لم يرفع المعلق أي عينة بعد</p>}
            {samples.map(s => {
              const st = SAMPLE_STATUS[s.status];
              return (
                <div key={s.id} className="rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900">{s.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{s.category} • {s.dialect} • {fmtDate(s.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {s.autoRejected && <Badge tone="red">رفض تلقائي</Badge>}
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </div>
                  </div>
                  <SamplePlayer url={s.audioUrl} durationSec={s.durationSec} />
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                    <span className={s.durationSec > 40 ? 'text-rose-600 font-bold' : ''}>{s.durationSec} ثانية</span>•
                    <span className={(s.format || 'mp3') !== 'mp3' ? 'text-rose-600 font-bold' : ''}>{(s.format || 'mp3').toUpperCase()}</span>
                  </div>
                  {s.status === 'rejected' && (
                    <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-[11px] text-rose-800 space-y-1">
                      <p className="font-bold">أسباب الرفض:</p>
                      {(s.rejectionCodes || []).map(c => <p key={c}>• {reasonByCode(c)?.label || c}</p>)}
                      {s.rejectionReason && <p className="text-rose-700/80 leading-relaxed">{s.rejectionReason}</p>}
                    </div>
                  )}
                </div>
              );
            })}
            {onOpenSamples && <button onClick={onOpenSamples} className="text-xs font-bold text-brand-text hover:underline cursor-pointer">الذهاب إلى صفحة العينات للمراجعة والاعتماد ←</button>}
          </>
        )}

        {tab === 'library' && (
          <>
            <p className="text-[11px] text-slate-500 leading-relaxed">أصوات المعلق المنشورة في مكتبة الأصوات، بسعر الدقيقة الخاص بكل صوت والسعر الذي يراه العميل (سعر المعلق + عمولة المنصة {commissionPercent()}%).</p>
            {library.length === 0 && <p className="text-center text-slate-400 text-xs py-10">لا توجد أصوات لهذا المعلق في مكتبة الأصوات</p>}
            {library.map(v => {
              const own = v.narratorPriceUsd > 0 ? v.narratorPriceUsd : (n.rates?.perMinuteUsd || 0);
              return (
                <div key={v.id} className="rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900">{v.title || 'بدون اسم'}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{[v.category, v.dialect, v.language, v.gender === 'female' ? 'نسائي' : 'رجالي'].filter(Boolean).join(' • ')}</p>
                    </div>
                    <a href={`/ar/voices/${buildSampleSlug({ id: v.id, sampleName: v.title, name: v.title })}`} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-brand-text hover:underline"><ExternalLink className="w-3 h-3" />صفحة الصوت</a>
                  </div>
                  {v.audioUrl && <SamplePlayer url={v.audioUrl} />}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-slate-50 p-2"><p className="text-[10px] text-slate-500">سعر المعلق / دقيقة</p><p className="font-mono font-black text-slate-900 text-sm">{own ? `$${fmtUsd(own)}` : '—'}</p>{v.narratorPriceUsd <= 0 && own > 0 && <p className="text-[9px] text-slate-400">من سعره العام</p>}</div>
                    <div className="rounded-xl bg-orange-50 p-2"><p className="text-[10px] text-slate-500">السعر للعميل / دقيقة</p><p className="font-mono font-black text-brand-text text-sm">{own ? `$${fmtUsd(finalPrice(own))}` : '—'}</p></div>
                    <div className="rounded-xl bg-slate-50 p-2"><p className="text-[10px] text-slate-500">الحجوزات / الاستماع</p><p className="font-mono font-black text-slate-900 text-sm">{fmtNum(v.bookingsCount)} / {fmtNum(v.listensCount)}</p></div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {tab === 'earnings' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="أرباح الشهر الحالي" value={fmtMoney(earnings?.totalMonthly ?? 0)} tone="green" />
              <StatCard label="الرصيد المتاح للسحب" value={fmtMoney(earnings?.availableBalance ?? 0)} tone="orange" />
              <StatCard label="إجمالي المدفوع (حجوزات)" value={fmtMoney(paidTotal)} />
              <StatCard label="عدد الحجوزات" value={fmtNum(bookings.length)} />
            </div>
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead><tr className="bg-slate-50 text-slate-500"><th className="p-3 font-bold">المشروع</th><th className="p-3 font-bold">التاريخ</th><th className="p-3 font-bold">المبلغ</th><th className="p-3 font-bold">الحالة</th></tr></thead>
                <tbody>
                  {bookings.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">لا توجد حجوزات</td></tr>}
                  {bookings.map(b => (
                    <tr key={b.id} className="border-t border-slate-100">
                      <td className="p-3 font-semibold text-slate-800">{b.projectTitle}</td>
                      <td className="p-3 font-mono text-slate-500">{b.date}</td>
                      <td className="p-3 font-mono font-bold">{fmtMoney(b.amount)}</td>
                      <td className="p-3"><Badge tone={BOOKING_STATUS[b.status].tone}>{BOOKING_STATUS[b.status].label}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'notifs' && (
          <>
            <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
              <h4 className="text-sm font-black text-slate-900">إرسال رسالة إلى حساب المعلق</h4>
              <input value={msgTitle} onChange={e => setMsgTitle(e.target.value)} placeholder="عنوان الرسالة" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-brand" />
              <textarea value={msgBody} onChange={e => setMsgBody(e.target.value)} rows={3} placeholder="نص الرسالة" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-brand resize-none" />
              <button onClick={sendMsg} disabled={!msgTitle.trim() || !msgBody.trim()} className="px-4 py-2 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold cursor-pointer disabled:opacity-30 flex items-center gap-1.5"><Send className="w-3.5 h-3.5" />إرسال</button>
            </div>
            {notifs.length === 0 && <p className="text-center text-slate-400 text-xs py-6">لا توجد إشعارات مرسلة</p>}
            {notifs.map(x => (
              <div key={x.id} className="rounded-2xl border border-slate-200 p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-xs text-slate-900">{x.title}</p>
                  <div className="flex items-center gap-1.5">
                    <Badge tone={x.type === 'sample_rejected' ? 'red' : x.type === 'sample_approved' ? 'green' : 'slate'}>{x.type === 'sample_rejected' ? 'رفض عينة' : x.type === 'sample_approved' ? 'اعتماد عينة' : x.type === 'account' ? 'الحساب' : 'رسالة'}</Badge>
                    <Badge tone={x.read ? 'slate' : 'amber'}>{x.read ? 'مقروء' : 'غير مقروء'}</Badge>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{x.body}</p>
                {x.reasons && x.reasons.length > 0 && <ul className="text-[11px] text-rose-700 list-disc pr-5 space-y-0.5">{x.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>}
                <p className="text-[10px] text-slate-400 font-mono">{fmtDateTime(x.createdAt)}</p>
              </div>
            ))}
          </>
        )}

        {tab === 'notes' && (
          <>
            <div className="space-y-2">
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3} placeholder="ملاحظة داخلية عن المعلق (لا تظهر له)" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-brand resize-none" />
              <button onClick={addNote} disabled={!noteText.trim()} className="px-4 py-2 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold cursor-pointer disabled:opacity-30 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />إضافة ملاحظة</button>
            </div>
            {(n.adminNotes || []).length === 0 && <p className="text-center text-slate-400 text-xs py-6">لا توجد ملاحظات</p>}
            {(n.adminNotes || []).map(x => (
              <div key={x.id} className="rounded-2xl bg-amber-50/60 border border-amber-100 p-4"><p className="text-xs text-slate-800 leading-relaxed">{x.text}</p><p className="text-[10px] text-slate-400 font-mono mt-1.5">{fmtDateTime(x.at)}</p></div>
            ))}
          </>
        )}
      </div>
    </Drawer>
  );
};
