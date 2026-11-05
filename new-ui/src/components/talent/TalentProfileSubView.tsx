import React, { useState } from 'react';
import { 
  User, 
  Camera, 
  Save, 
  Check, 
  DollarSign, 
  Mic2, 
  Sparkles, 
  Phone, 
  Mail,
  ShieldCheck,
  Star
} from 'lucide-react';
import { TalentProfile } from '../../data/talentMockData';

interface TalentProfileSubViewProps {
  profile: TalentProfile;
}

export const TalentProfileSubView: React.FC<TalentProfileSubViewProps> = ({ profile }) => {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [phone, setPhone] = useState('+966555124567');
  const [email, setEmail] = useState('tareq.shammary@qeema.voice');
  const [ratePerWord, setRatePerWord] = useState(0.45);
  const [commercialRate, setCommercialRate] = useState(380);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white">الملف المهني والبيانات العامة</h2>
          <p className="text-xs text-slate-400">
            بيانات ملفك المعروضة للعملاء وشركات الإنتاج في مكتبة الأصوات وقائمة المعلقين
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-brand hover:bg-orange-600 text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'تم الحفظ بنجاح ✓' : 'حفظ التعديلات'}</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        {/* Photo and identity */}
        <div className="flex items-center gap-5 pb-6 border-b border-slate-800">
          <div className="relative group">
            <img
              src={profile.avatar}
              alt={name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-500/40 shadow-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center text-white cursor-pointer transition-opacity">
              <Camera className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">{name}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
                PRO VERIFIED TALENT
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{profile.title}</p>
            <span className="font-mono text-slate-500 text-[11px] block mt-1">كود المعلق: {profile.code}</span>
          </div>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">الاسم الفني الكامل</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">رقم الجوال للتوثيق</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">البريد الإلكتروني للتعاقد</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">سعر الإعلان التجاري القياسي (USD)</label>
            <div className="relative">
              <span className="text-slate-500 absolute left-3 top-2.5 text-xs font-mono">$</span>
              <input
                type="number"
                value={commercialRate}
                onChange={(e) => setCommercialRate(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">نبذة السيرة الذاتية (Bio)</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed outline-none focus:border-orange-500"
          />
        </div>
      </div>
    </div>
  );
};
