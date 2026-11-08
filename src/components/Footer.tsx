import React from 'react';
import { SocialLinks } from './SocialLinks';
import { openTalentSignup } from '../lib/talentJoin';
import { Link } from 'react-router-dom';
import { useSiteLists } from '../lib/siteLists';
import { 
  Mic2, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Users, 
  Coins, 
  Mail, 
  Globe2, 
  Briefcase, 
  HelpCircle,
  FileCode
} from 'lucide-react';

interface FooterProps {
  onOpenChangelog?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenChangelog }) => {
  // «خدمات الإنتاج الصوتي» list comes from the dashboard (الخدمات)
  const { services } = useSiteLists();
  // The «الوظائف» link only shows while the admin has at least one posted job
  const [hasJobs, setHasJobs] = React.useState(false);
  React.useEffect(() => {
    fetch('/api/v1/jobs').then(r => (r.ok ? r.json() : Promise.reject())).then(({ items }) => setHasJobs(items.length > 0)).catch(() => {});
  }, []);
  const [nlEmail, setNlEmail] = React.useState('');
  const [nlState, setNlState] = React.useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setNlState('sending');
    const r = await fetch('/api/v1/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: nlEmail }) }).catch(() => null);
    setNlState(r?.ok ? 'done' : 'error');
    if (r?.ok) setNlEmail('');
  };
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800 pt-16 pb-12" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Column (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <Link 
              to="/ar" 
              className="flex items-center select-none group w-fit"
            >
              <img 
                src="/assets/aistudio/qeemavoice_logo_5d0c91ae.png" 
                alt="قيمة فويس - Qeemavoice" 
                width="145"
                height="50"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-[1.02] brightness-0 invert"
              />
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              منصة قيمة فويس، أكبر منصة عربية لخدمات التعليق الصوتي، فويس اوفر، دوبلاج صوتي. احجز الآن من بين آلاف المعلقين الصوتيين المحترفين على مستوى الوطن العربي.
            </p>

            {/* Newsletter -> admin «القائمة البريدية» */}
            <form onSubmit={subscribe} className="flex items-center gap-2 max-w-sm pt-1">
              <input
                type="email"
                required
                value={nlEmail}
                onChange={e => { setNlEmail(e.target.value); setNlState('idle'); }}
                placeholder="بريدك لتصلك أحدث عينات وعروض التعليق الصوتي"
                aria-label="البريد الإلكتروني للنشرة البريدية"
                className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand"
              />
              <button type="submit" disabled={nlState === 'sending'} className="px-4 py-2 rounded-xl bg-white text-slate-950 text-xs font-bold hover:bg-slate-200 disabled:opacity-60 cursor-pointer shrink-0">اشترك</button>
            </form>
            {nlState === 'done' && <p className="text-[11px] text-emerald-400">تم الاشتراك في النشرة البريدية.</p>}
            {nlState === 'error' && <p className="text-[11px] text-red-400">تعذر الاشتراك، تحقق من البريد وحاول مرة أخرى.</p>}

            <div className="pt-2">
              <button
                type="button"
                onClick={openTalentSignup}
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-brand hover:bg-brand-orange px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>انضم إلى قيمة فويس كمعلق صوتي</span>
              </button>
            </div>
          </div>

          {/* Col 2: خدمات التعليق الصوتي والإنتاج */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-yellow uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>خدمات الإنتاج الصوتي</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {services.map(sv => (
                <li key={sv.slug}>
                  <Link to={sv.slug} className="hover:text-white transition">
                    {sv.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/ar/text-to-speech" className="hover:text-white transition">
                  تحويل النص إلى صوت (TTS)
                </Link>
              </li>
              <li>
                <Link to="/ar/voices" className="hover:text-brand-text font-bold transition">
                  مكتبة الأصوات العربية
                </Link>
              </li>
              <li>
                <Link to="/ar/voice-models" className="hover:text-white transition">
                  نماذج الإنتاج الصوتي
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: فويس اوفر حسب اللهجة */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-yellow uppercase tracking-wider flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-blue-400" />
              <span>فويس اوفر باللهجات</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/ar/saudi-voice-over" className="hover:text-white transition">
                  فويس اوفر سعودي
                </Link>
              </li>
              <li>
                <Link to="/ar/emirati-voice-over" className="hover:text-white transition">
                  فويس اوفر إماراتي
                </Link>
              </li>
              <li>
                <Link to="/ar/egyptian-voice-over" className="hover:text-white transition">
                  فويس اوفر مصري
                </Link>
              </li>
              <li>
                <Link to="/ar/categories" className="hover:text-white transition">
                  كافة تصنيفات الأصوات
                </Link>
              </li>
              <li>
                <Link to="/ar/our-works" className="hover:text-white transition">
                  قصص النجاح للشركات
                </Link>
              </li>
              <li>
                <Link to="/ar/booking-steps" className="hover:text-white transition">
                  كيف نعمل
                </Link>
              </li>
              <li>
                <Link to="/ar/p/revisions-policy" className="hover:text-white transition">
                  سياسة التعديلات
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: الشركة والدعم والمعرفة */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-yellow uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>المعرفة والدعم</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/ar/blogs" className="hover:text-white transition">
                  المدونة والأبحاث
                </Link>
              </li>
              <li>
                <Link to="/ar/pricing" className="hover:text-white transition font-bold text-slate-300">
                  أسعار التعليق الصوتي
                </Link>
              </li>
              <li>
                <Link to="/ar/faqs" className="hover:text-white transition">
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link to="/ar/guides" className="hover:text-white transition">
                  أدلة الإنتاج الصوتي
                </Link>
              </li>
              <li>
                <Link to="/ar/p/about-us" className="hover:text-white transition">
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/ar/contact-us" className="hover:text-white transition">
                  تواصل معنا
                </Link>
              </li>
              {hasJobs && (
                <li>
                  <Link to="/ar/jobs" className="hover:text-white transition">
                    الوظائف
                  </Link>
                </li>
              )}
              <li>
                <Link to="/ar/p/terms-of-use" className="hover:text-slate-400 transition text-[11px]">
                  شروط الاستخدام
                </Link>
              </li>
              <li>
                <Link to="/ar/p/privacy-policy" className="hover:text-slate-400 transition text-[11px]">
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            جميع الحقوق محفوظة © {new Date().getFullYear()} منصة قيمة فويس (Qeemavoice).
          </div>

          <SocialLinks tone="light" />

        </div>

      </div>
    </footer>
  );
};
