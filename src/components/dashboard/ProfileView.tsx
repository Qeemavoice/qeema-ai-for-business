import React, { useEffect, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { api, ACCOUNT_CHANGED_EVENT } from '../../lib/api';
import { ChangePasswordModal } from '../admin/AdminShell';

/** «البيانات الشخصية»: name, mobile and country of the signed-in client, plus «تغيير كلمة المرور» */
export const ProfileView: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', country: '' });
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwOpen, setPwOpen] = useState(false);

  useEffect(() => { api.getProfile().then(p => { setForm(p); setLoaded(true); }).catch(e => setMsg({ ok: false, text: e.message })); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await api.updateProfile({ name: form.name, mobile: form.mobile, country: form.country });
      window.dispatchEvent(new Event(ACCOUNT_CHANGED_EVENT));
      setMsg({ ok: true, text: 'تم حفظ بياناتك.' });
    } catch (err: any) { setMsg({ ok: false, text: err.message }); }
    finally { setBusy(false); }
  };

  const field = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand bg-white';
  const label = 'block text-xs font-bold text-slate-600 mb-1.5';
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 animate-fade-in" dir="rtl">
      <div>
        <h1 className="text-xl font-black text-slate-950">البيانات الشخصية</h1>
        <p className="text-xs text-slate-500 mt-1">حدّث اسمك ورقم جوالك وبلدك. البريد الإلكتروني لا يتغير لأنه وسيلة الدخول.</p>
      </div>
      <form onSubmit={save} className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4 text-right">
        <div><label className={label}>الاسم الكامل</label>
          <input className={field} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required minLength={2} maxLength={80} disabled={!loaded} /></div>
        <div><label className={label}>البريد الإلكتروني</label>
          <input className={`${field} bg-slate-50 text-slate-500`} value={form.email} dir="ltr" readOnly /></div>
        <div><label className={label}>رقم الجوال (مع رمز الدولة)</label>
          <input className={field} value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="+9665XXXXXXXX" dir="ltr" inputMode="tel" disabled={!loaded} /></div>
        <div><label className={label}>الدولة</label>
          <input className={field} value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} maxLength={60} disabled={!loaded} /></div>
        {msg && <p className={`text-xs font-bold ${msg.ok ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</p>}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button type="submit" disabled={busy || !loaded} className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-sm font-bold disabled:opacity-60 cursor-pointer">{busy ? '...' : 'حفظ التغييرات'}</button>
          <button type="button" onClick={() => setPwOpen(true)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold flex items-center gap-2 hover:bg-slate-50 cursor-pointer"><KeyRound className="w-4 h-4" /> تغيير كلمة المرور</button>
        </div>
      </form>
      {pwOpen && <ChangePasswordModal onClose={() => setPwOpen(false)} />}
    </div>
  );
};
