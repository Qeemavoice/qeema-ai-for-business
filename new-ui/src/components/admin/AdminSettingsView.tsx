import React, { useEffect, useState } from 'react';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';
import { api } from '../../lib/api';
import { setCommissionPercent } from '../../../shared/pricing';

export type SettingsSection = 'currency' | 'commission' | 'policies' | 'payments' | 'smtp' | 'tts' | 'maintenance';

const TITLES: Record<SettingsSection, string> = {
  currency: 'العملات', commission: 'العمولات', policies: 'السياسات', payments: 'طرق الدفع', smtp: 'إعدادات SMTP', tts: 'مزوّدو تحويل النص إلى صوت', maintenance: 'إعدادات الصيانة'
};
const CURRENCIES = [
  { code: 'USD', label: 'دولار أمريكي' }, { code: 'SAR', label: 'ريال سعودي' }, { code: 'AED', label: 'درهم إماراتي' },
  { code: 'EGP', label: 'جنيه مصري' }, { code: 'KWD', label: 'دينار كويتي' }, { code: 'EUR', label: 'يورو' }
];
const input = 'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-hidden focus:border-brand';

const Field: React.FC<{ label: React.ReactNode; children: React.ReactNode; hint?: string; full?: boolean }> = ({ label, children, hint, full }) => (
  <label className={`block ${full ? 'sm:col-span-2' : ''}`}>
    <span className="block text-xs font-bold text-slate-700 mb-1.5">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-slate-400 mt-1">{hint}</span>}
  </label>
);

const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex items-center gap-3 cursor-pointer">
    <span className={`w-11 h-6 rounded-full p-0.5 transition-colors ${checked ? 'bg-brand' : 'bg-slate-300'}`}>
      <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? '-translate-x-5' : ''}`} />
    </span>
    <span className="text-sm font-bold text-slate-800">{label}</span>
  </button>
);

/** Write-only secret: never shows the stored value, only a masked hint; empty = keep current. */
const SecretInput: React.FC<{ value: string; hint?: string; onChange: (v: string) => void }> = ({ value, hint, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      {/* a text field masked with CSS, not type="password": browsers then don't offer «Strong Password» or save it as a login */}
      <input dir="ltr" type="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
        data-1p-ignore="true" data-lpignore="true" data-bwignore="true" data-form-type="other"
        style={{ WebkitTextSecurity: show ? 'none' : 'disc' } as React.CSSProperties}
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={hint ? `محفوظ ${hint} (اتركه فارغاً للإبقاء عليه)` : 'غير مضبوط'} className={`${input} font-mono text-left pl-10`} />
      <button type="button" onClick={() => setShow(s => !s)} className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer" title={show ? 'إخفاء' : 'إظهار'}>
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

/** Settings sub-pages: currency, fees, Stripe, SMTP, maintenance. */
export const AdminSettingsView: React.FC<{ section: SettingsSection }> = ({ section }) => {
  const [data, setData] = useState<any | null>(null);
  const [draft, setDraft] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);

  const load = () => api.getAdminSettings().then(d => { setData(d); setDraft(structuredClone(d)); }).catch(() => setToast({ ok: false, text: 'تعذر تحميل الإعدادات' }));
  useEffect(() => { setData(null); load(); }, [section]);

  if (!draft) return <div className="p-10 text-center"><RefreshCw className="w-5 h-5 animate-spin inline text-slate-400" /></div>;
  const set = (k: string, v: any) => setDraft((d: any) => ({ ...d, [k]: v }));
  const setInt = (group: 'stripe' | 'smtp' | 'elevenlabs' | 'munsit', k: string, v: any) => setDraft((d: any) => ({ ...d, integrations: { ...d.integrations, [group]: { ...d.integrations[group], [k]: v } } }));
  const stripe = draft.integrations.stripe;
  const smtp = draft.integrations.smtp;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload =
        section === 'currency' ? { settings: { defaultCurrency: draft.defaultCurrency, creditRatePer10kCharsUsd: draft.creditRatePer10kCharsUsd } }
        : section === 'commission' ? { settings: { platformCommissionPercent: draft.platformCommissionPercent, stripeFeePercent: draft.stripeFeePercent } }
        : section === 'maintenance' ? { settings: { maintenanceMode: draft.maintenanceMode } }
        : section === 'policies' ? { settings: { paymentHoldDaysVoiceActor: draft.paymentHoldDaysVoiceActor } }
        : section === 'tts' ? { settings: { ttsEnabled: draft.ttsEnabled }, integrations: { elevenlabs: draft.integrations.elevenlabs, munsit: draft.integrations.munsit } }
        : { integrations: { [section === 'payments' ? 'stripe' : 'smtp']: section === 'payments' ? stripe : smtp } };
      const d = await api.saveAdminSettings(payload);
      setData(d); setDraft(structuredClone(d));
      setCommissionPercent(d.platformCommissionPercent);
      setToast({ ok: true, text: 'تم حفظ الإعدادات' });
    } catch (err: any) {
      setToast({ ok: false, text: err.message || 'تعذر الحفظ' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <form onSubmit={save} className="space-y-5 max-w-4xl" dir="rtl">
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <h3 className="px-6 py-5 border-b border-slate-100 text-base font-black text-slate-900">{TITLES[section]}</h3>
        <div className="p-6 space-y-5">
          {section === 'currency' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="العملة الافتراضية" full hint="العملة التي تُعرض بها الأسعار وتصدر بها الفواتير">
                <select value={draft.defaultCurrency} onChange={e => set('defaultCurrency', e.target.value)} className={`${input} cursor-pointer`}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label} ({c.code})</option>)}
                </select>
              </Field>
              <Field label="سعر 10,000 حرف رصيد (USD)" hint="يُستخدم في شراء رصيد إضافي لأستوديو TTS">
                <input type="number" min={0} step={0.1} value={draft.creditRatePer10kCharsUsd} onChange={e => set('creditRatePer10kCharsUsd', e.target.value)} className={`${input} font-mono`} />
              </Field>
            </div>
          )}

          {section === 'commission' && (
            <>
              <h4 className="text-sm font-black text-slate-900">رسوم <span className="text-brand-text">قيمة فويس</span></h4>
              <Field label={<>رسوم المنصة <span className="text-brand-text font-mono">(%)</span></>} hint={`تُضاف على سعر المعلق: معلق سعره $100 يظهر للعميل بسعر $${(100 * (1 + Number(draft.platformCommissionPercent || 0) / 100)).toFixed(2).replace(/\.00$/, '')}`}>
                <input type="number" min={0} max={100} step={0.5} value={draft.platformCommissionPercent} onChange={e => set('platformCommissionPercent', e.target.value)} className={`${input} font-mono max-w-sm`} />
              </Field>
              <h4 className="text-sm font-black text-slate-900 pt-2">رسوم طرق الدفع</h4>
              <Field label={<>رسوم سترايب <span className="text-brand-text font-mono">(%)</span></>}>
                <input type="number" min={0} max={100} step={0.1} value={draft.stripeFeePercent} onChange={e => set('stripeFeePercent', e.target.value)} className={`${input} font-mono max-w-sm`} />
              </Field>
            </>
          )}

          {section === 'payments' && (
            <>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="px-3 py-1.5 rounded-lg bg-orange-50 text-brand-text text-xs font-black border-b-2 border-brand">سترايب</span>
                <span className="text-[11px] text-slate-400">Visa · Mastercard · Apple Pay · Google Pay</span>
              </div>
              <Switch checked={stripe.enabled} onChange={v => setInt('stripe', 'enabled', v)} label="تفعيل الخدمة" />
              <Field label="المسمى (باللغة العربية)">
                <input value={stripe.displayName} onChange={e => setInt('stripe', 'displayName', e.target.value)} className={input} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="المفتاح التعريفي للوضع المباشر" full>
                  <input dir="ltr" value={stripe.livePublishableKey} onChange={e => setInt('stripe', 'livePublishableKey', e.target.value)} placeholder="pk_live_..." className={`${input} font-mono text-left`} />
                </Field>
                <Field label="المفتاح السري للوضع المباشر" full hint="لا يُعرض المفتاح المحفوظ أبداً. اكتب مفتاحاً جديداً فقط عند تغييره.">
                  <SecretInput value={stripe.liveSecretKey} hint={stripe.liveSecretKeyHint} onChange={v => setInt('stripe', 'liveSecretKey', v)} />
                </Field>
              </div>
              <Switch checked={stripe.testMode} onChange={v => setInt('stripe', 'testMode', v)} label="وضع الاختبار" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="المفتاح التعريفي لوضع الاختبار" full>
                  <input dir="ltr" value={stripe.testPublishableKey} onChange={e => setInt('stripe', 'testPublishableKey', e.target.value)} placeholder="pk_test_..." className={`${input} font-mono text-left`} />
                </Field>
                <Field label="المفتاح السري لوضع الاختبار" full>
                  <SecretInput value={stripe.testSecretKey} hint={stripe.testSecretKeyHint} onChange={v => setInt('stripe', 'testSecretKey', v)} />
                </Field>
              </div>
            </>
          )}

          {section === 'policies' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="عدد الأيام المخصصة لحجز مدفوعات المعلق الصوتي" hint="بعد تسليم الحجز تبقى حصة المعلق محجوزة هذه المدة قبل أن تصبح قابلة للسحب.">
                <input type="number" min={0} max={365} value={draft.paymentHoldDaysVoiceActor ?? 0} onChange={e => set('paymentHoldDaysVoiceActor', e.target.value)} className={`${input} font-mono`} />
              </Field>
            </div>
          )}

          {section === 'tts' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="المزوّدون المفعّلون" hint="المزوّد غير المفعّل لا تظهر أصواته في استوديو TTS ولا يُستخدم للتوليد." full>
                <div className="flex flex-wrap gap-3">
                  {([['munsit', 'منصّت (Munsit)'], ['elevenlabs', 'ElevenLabs']] as const).map(([k, l]) => {
                    const on = (draft.ttsEnabled || []).includes(k);
                    return (
                      <label key={k} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-sm ${on ? 'border-brand bg-orange-50' : 'border-slate-200 bg-white'}`}>
                        <input type="checkbox" checked={on} onChange={() => set('ttsEnabled', on ? draft.ttsEnabled.filter((x: string) => x !== k) : [...(draft.ttsEnabled || []), k])} className="accent-brand" />
                        {l}
                      </label>
                    );
                  })}
                </div>
              </Field>
              <Field label="مفتاح منصّت (Munsit API Key)" hint="أصوات منصّت العربية في استوديو TTS. اتركه فارغاً للإبقاء على المفتاح المحفوظ.">
                <SecretInput value={draft.integrations.munsit?.apiKey || ''} hint={draft.integrations.munsit?.apiKeyHint} onChange={v => setInt('munsit', 'apiKey', v)} />
              </Field>
              <Field label="مفتاح ElevenLabs (API Key)" hint="أصوات ElevenLabs والمساعد الصوتي. اتركه فارغاً للإبقاء على المفتاح المحفوظ.">
                <SecretInput value={draft.integrations.elevenlabs?.apiKey || ''} hint={draft.integrations.elevenlabs?.apiKeyHint} onChange={v => setInt('elevenlabs', 'apiKey', v)} />
              </Field>
            </div>
          )}

          {section === 'smtp' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Mail Driver" full><input readOnly value={smtp.driver} className={`${input} bg-slate-100 font-mono`} dir="ltr" /></Field>
              <Field label="Mail From Address"><input dir="ltr" type="email" value={smtp.fromAddress} onChange={e => setInt('smtp', 'fromAddress', e.target.value)} className={`${input} font-mono text-left`} /></Field>
              <Field label="Mail From Name"><input value={smtp.fromName} onChange={e => setInt('smtp', 'fromName', e.target.value)} className={input} /></Field>
              <Field label="Mail Host"><input dir="ltr" value={smtp.host} onChange={e => setInt('smtp', 'host', e.target.value)} placeholder="smtp.example.com" className={`${input} font-mono text-left`} /></Field>
              <Field label="Mail Port"><input type="number" value={smtp.port} onChange={e => setInt('smtp', 'port', e.target.value)} className={`${input} font-mono`} /></Field>
              <Field label="Mail Username"><input dir="ltr" autoComplete="off" value={smtp.username} onChange={e => setInt('smtp', 'username', e.target.value)} className={`${input} font-mono text-left`} /></Field>
              <Field label="Mail Password"><SecretInput value={smtp.password} hint={smtp.passwordHint} onChange={v => setInt('smtp', 'password', v)} /></Field>
              <Field label="Mail Encryption" full>
                <select value={smtp.encryption} onChange={e => setInt('smtp', 'encryption', e.target.value)} className={`${input} cursor-pointer`}>
                  <option value="SSL">SSL</option><option value="TLS">TLS</option><option value="none">بدون</option>
                </select>
              </Field>
            </div>
          )}

          {section === 'maintenance' && (
            <div className="space-y-2">
              <Switch checked={draft.maintenanceMode} onChange={v => set('maintenanceMode', v)} label="وضع التطبيق في وضع الصيانة" />
              <p className="text-[11px] text-slate-400">عند التفعيل يظهر للزوار إشعار الصيانة، وتبقى لوحة الإدارة متاحة.</p>
            </div>
          )}
        </div>
      </section>

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold cursor-pointer disabled:opacity-50">{saving ? 'جارٍ الحفظ...' : 'حفظ'}</button>
        <button type="button" onClick={() => setDraft(structuredClone(data))} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">إلغاء</button>
      </div>
      {toast && <div className={`fixed bottom-6 left-6 z-[60] px-4 py-3 rounded-xl text-white text-xs font-bold shadow-xl ${toast.ok ? 'bg-slate-900' : 'bg-rose-600'}`}>{toast.text}</div>}
    </form>
  );
};
