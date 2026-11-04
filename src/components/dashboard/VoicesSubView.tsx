import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Play, 
  Pause, 
  Sliders, 
  Sparkles, 
  Users2, 
  Check, 
  Share2, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Globe,
  Coins,
  ShieldCheck,
  ExternalLink,
  DollarSign,
  Wallet,
  CreditCard,
  BarChart3,
  Flame,
  ArrowUpRight,
  HelpCircle,
  FileCheck,
  Lock,
  Layers,
  Mic,
  Folder,
  SlidersHorizontal,
  Volume2
} from 'lucide-react';
import { Voice } from '../../types';
import { DashboardNavKey } from './DashboardSidebar';

interface VoicesSubViewProps {
  voices: Voice[];
  playingVoiceId: string | null;
  onTogglePlayVoice: (voiceId: string) => void;
  onSelectVoiceForStudio: (voiceId: string) => void;
  onOpenCreateVoiceModal: () => void;
  onBookHumanVoice?: (voice: Voice) => void;
  onNavigateTab: (tab: DashboardNavKey) => void;
}

export const VoicesSubView: React.FC<VoicesSubViewProps> = ({
  voices,
  playingVoiceId,
  onTogglePlayVoice,
  onSelectVoiceForStudio,
  onOpenCreateVoiceModal,
  onBookHumanVoice,
  onNavigateTab
}) => {
  // Main Tabs: explore (استكشاف), my-voices (أصواتي), earnings (الأرباح)
  const [activeTab, setActiveTab] = useState<'explore' | 'my-voices' | 'earnings'>('explore');
  
  // Earnings Sub-tab: payouts (المدفوعات), analytics (التحليلات), opportunities (الفرص)
  const [earningsSubTab, setEarningsSubTab] = useState<'payouts' | 'analytics' | 'opportunities'>('payouts');
  
  // Search and Filter States for Explore
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedDialect, setSelectedDialect] = useState('all');

  // Payout Account Modal state
  const [isPayoutAccountModalOpen, setIsPayoutAccountModalOpen] = useState(false);
  const [ibanInput, setIbanInput] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [isSavedPayout, setIsSavedPayout] = useState(false);

  const filterTags = [
    { id: 'all', label: 'جميع الأصوات' },
    { id: 'conversational', label: 'حوارية تفاعلية' },
    { id: 'narration', label: 'سرد ووثائقي' },
    { id: 'characters', label: 'شخصيات وألعاب' },
    { id: 'social', label: 'سوشيال ميديا' },
    { id: 'educational', label: 'تعليمي وتدريبي' },
    { id: 'advertisement', label: 'إعلانات وترويج' },
    { id: 'entertainment', label: 'بودكاست وترفيه' }
  ];

  const dialectCollections = [
    { id: 'gulf', label: 'سعودي وخليجي', count: 18, color: 'from-brand-ink/80 to-brand-ink', border: 'border-brand/40' },
    { id: 'egyptian', label: 'مصري', count: 12, color: 'from-brand-ink/80 to-brand-ink', border: 'border-brand/40' },
    { id: 'levantine', label: 'شامي (سوري/لبناني)', count: 10, color: 'from-brand-ink/80 to-brand-ink', border: 'border-brand/40' },
    { id: 'maghrebi', label: 'مغاربي', count: 6, color: 'from-brand-ink/80 to-brand-ink', border: 'border-brand/40' },
    { id: 'fusha', label: 'عربي فصيح معاصر', count: 14, color: 'from-brand-ink/80 to-brand-ink', border: 'border-brand/40' }
  ];

  const handpicked = [
    {
      title: 'أفضل أصوات للإعلانات',
      desc: 'نبرات وقورة وجذابة لحملات التلفزيون والراديو',
      count: '8 أصوات',
      badge: 'V3 High Quality',
      img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&auto=format&fit=crop&q=80'
    },
    {
      title: 'حملات تيك توك وسناب',
      desc: 'سريعة، طبيعية، ومثالية لصناع المحتوى والـ UGC',
      count: '12 صوتاً',
      badge: 'Viral Trends',
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
    },
    {
      title: 'أصوات وثائقية فخمة',
      desc: 'عمق صوتي وتأثير درامي عالي الدقة',
      count: '6 أصوات',
      badge: 'Studio Master',
      img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=500&auto=format&fit=crop&q=80'
    },
    {
      title: 'شخصيات الألعاب والأنيميشن',
      desc: 'انفعالات وأداء تمثيلي متعدد النبرات',
      count: '9 أصوات',
      badge: 'Character FX',
      img: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=500&auto=format&fit=crop&q=80'
    }
  ];

  // Filter voices
  const filteredVoices = voices.filter(v => {
    const matchSearch = searchQuery === '' || 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.dialectLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.styleLabel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDialect = selectedDialect === 'all' || v.dialect === selectedDialect;
    return matchSearch && matchDialect;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      
      {/* 1. Header Section */}
      <div className="space-y-4">
        {/* Main Title */}
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          مكتبة الأصوات
        </h1>

        {/* Navigation Bar under Title:
            - Right: 'استكشاف' and 'أصواتي'
            - Left: 'الأرباح' and '+ إنشاء صوت'
        */}
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-200/80 pb-3">
          
          {/* Right Side: Explore & My Voices */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-2 pb-2 -mb-3 text-sm font-bold transition-all relative ${
                activeTab === 'explore'
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>استكشاف</span>
            </button>

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EARNINGS (الأرباح) - Exact match to ElevenLabs Screenshot */}
      {/* ========================================================================= */}
      {activeTab === 'earnings' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 animate-fade-in">
          
          {/* Sub Navigation on the side (المدفوعات, التحليلات, الفرص) */}
          <div className="md:col-span-3 lg:col-span-2 space-y-1">
            <button
              onClick={() => setEarningsSubTab('payouts')}
              className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                earningsSubTab === 'payouts'
                  ? 'bg-slate-100 text-slate-900 font-black'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              المدفوعات (Payouts)
            </button>

            <button
              onClick={() => setEarningsSubTab('analytics')}
              className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                earningsSubTab === 'analytics'
                  ? 'bg-slate-100 text-slate-900 font-black'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              التحليلات (Analytics)
            </button>

            <button
              onClick={() => setEarningsSubTab('opportunities')}
              className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                earningsSubTab === 'opportunities'
                  ? 'bg-slate-100 text-slate-900 font-black'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              الفرص (Opportunities)
            </button>
          </div>

          {/* Main Earnings Content Area */}
          <div className="md:col-span-9 lg:col-span-10 space-y-8">
            
            {/* PAYOUTS VIEW */}
            {earningsSubTab === 'payouts' && (
              <>
                {/* Hero Header matching screenshot */}
                <div className="space-y-1.5">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                    سجّل صوتك. اكسب أرباحك.
                  </h2>
                  <p className="text-xs md:text-sm text-slate-600">
                    انشر صوتك في مكتبة الأصوات واكسب عائداً مالياً في كل مرة يتم استخدامه من قبل مستخدم مدفوع.
                  </p>
                </div>

                {/* Two Columns Grid: Get Started (0/3) & Payouts Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column (in RTL): Get Started Steps */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900">خطوات البدء والانطلاق</h3>
                      <span className="text-xs font-bold text-slate-400">0 / 3</span>
                    </div>

                    <div className="space-y-3">
                      {/* Step 1: Create Voice Clone (Hero Graphic Card) */}
                      <div className="relative rounded-2xl overflow-hidden p-5 text-white shadow-xs border border-brand/20 bg-linear-to-br from-brand via-brand-orange to-brand-text">
                        <div className="relative z-10 space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-white text-slate-900 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                              1
                            </span>
                            <span className="text-sm font-bold text-white">
                              إنشاء استنساخ صوتي احترافي
                            </span>
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={onOpenCreateVoiceModal}
                              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-black transition-all shadow-xs active:scale-95"
                            >
                              إنشاء صوت
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Step 2: Create Payout Account */}
                      <div 
                        onClick={() => setIsPayoutAccountModalOpen(true)}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors cursor-pointer flex items-center gap-3"
                      >
                        <span className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          2
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          إنشاء حساب تحويل الأرباح
                        </span>
                      </div>

                      {/* Step 3: Publish Your Voice */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 opacity-70">
                        <span className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 font-bold text-xs flex items-center justify-center shrink-0">
                          3
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          نشر صوتك في المكتبة
                        </span>
                      </div>
                    </div>

                    {/* Terms Link */}
                    <div className="text-center pt-2">
                      <a 
                        href="#terms" 
                        onClick={(e) => { e.preventDefault(); alert('ملحق شروط مكتبة الأصوات: يضمن حفظ حقوق الملكية الفكرية ونسبة أرباح 70% لصاحب الصوت لكل استخدام.'); }}
                        className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-4 transition-colors"
                      >
                        ملحق شروط مكتبة الأصوات وحقوق الملكية
                      </a>
                    </div>
                  </div>

                  {/* Right Column (in RTL): Payouts Summary & Empty State */}
                  <div className="lg:col-span-7 space-y-4">
                    <h3 className="text-sm font-black text-slate-900">سجل المدفوعات والتحويلات</h3>

                    {/* Stat boxes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Current Period */}
                      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600">الفترة الحالية</span>
                        <span className="text-sm font-black text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          0.00 دولار
                        </span>
                      </div>

                      {/* All Time Payouts */}
                      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600">إجمالي الأرباح عبر التاريخ</span>
                        <span className="text-sm font-black text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          0.00 دولار
                        </span>
                      </div>
                    </div>

                    {/* Empty State Box matching screenshot */}
                    <div className="p-12 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center flex flex-col items-center justify-center space-y-3 min-h-[220px]">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                        <Folder className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-slate-900">لا توجد دفعات بعد</h4>
                        <p className="text-xs text-slate-500 max-w-sm">
                          أكمل خطوات البدء لتبدأ في تحقيق الأرباح من كل عملية توليد لصوتك.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}

            {/* ANALYTICS VIEW */}
            {earningsSubTab === 'analytics' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-slate-900">تحليلات الأداء واستخدام الأصوات</h2>
                  <p className="text-xs text-slate-500">إحصاءات استهلاك حروف أصواتك وعدد مرات الاستخدام والتوليد</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="text-xs font-bold text-slate-400">إجمالي مرات التوليد</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">0</div>
                    <span className="text-[10px] text-slate-400">خلال آخر 30 يوماً</span>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="text-xs font-bold text-slate-400">الحروف المستهلكة</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">0 حرف</div>
                    <span className="text-[10px] text-slate-400">معدل $0.002 لكل 1000 حرف</span>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="text-xs font-bold text-slate-400">الأرباح المتوقعة</span>
                    <div className="text-2xl font-black text-emerald-600 mt-1">0.00 دولار</div>
                    <span className="text-[10px] text-slate-400">دورة الدفع القادمة: نهاية الشهر</span>
                  </div>
                </div>

                <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center py-16 space-y-3">
                  <BarChart3 className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-700">لا توجد بيانات كافية للرسم البياني</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    بمجرد نشر صوتك الأول وبدء استخدامه من قبل منشآت الأعمال، ستظهر هنا تفاصيل التوليدات ومصادر الأرباح اليومية.
                  </p>
                </div>
              </div>
            )}

            {/* OPPORTUNITIES VIEW */}
            {earningsSubTab === 'opportunities' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-slate-900">فرص الأصوات المطلوبة والمكافآت</h2>
                  <p className="text-xs text-slate-500">طلبات أصوات مخصصة من شركات وعلامات تجارية بمكافآت مجزية</p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">مطلوب: نبرة إعلانية نجدية حماسية (شبابي)</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          مكافأة $500 + نسبة
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        مطلوب لإطلاق حملة تطبيق توصيل رائد في المملكة العربية السعودية.
                      </p>
                    </div>
                    <button
                      onClick={onOpenCreateVoiceModal}
                      className="px-4 py-2 bg-brand-ink hover:bg-brand-ink/90 text-white rounded-xl text-xs font-bold"
                    >
                      تقديم عينة صوتية
                    </button>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">مطلوب: صوت وثائقي عميق فصحى معاصرة</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          مكافأة $800 + نسبة
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        سلسلة بودكاست تاريخي لجهة إعلامية خليجية (10 حلقات).
                      </p>
                    </div>
                    <button
                      onClick={onOpenCreateVoiceModal}
                      className="px-4 py-2 bg-brand-ink hover:bg-brand-ink/90 text-white rounded-xl text-xs font-bold"
                    >
                      تقديم عينة صوتية
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MY VOICES (أصواتي) */}
      {/* ========================================================================= */}
      {activeTab === 'my-voices' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">أصواتي المستنسخة والخاصة</h2>
              <p className="text-xs text-slate-500">الأصوات التي قمت بإنشائها أو استنساخها وتخصيصها لمنشأتك</p>
            </div>
            <button
              onClick={onOpenCreateVoiceModal}
              className="px-4 py-2 bg-brand-ink hover:bg-brand-ink/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>استنساخ صوت جديد</span>
            </button>
          </div>

          <div className="p-12 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand-text">
              <Mic className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">لم تقم بإنشاء أصوات مخصصة بعد</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                يمكنك رفع تسجيل صوتي مدته دقيقة واحدة لإنشاء توأم صوتي فائق الدقة ونشره في مكتبة الأصوات لتحقيق عوائد مالية.
              </p>
            </div>
            <button
              onClick={onOpenCreateVoiceModal}
              className="px-5 py-2.5 bg-brand-ink hover:bg-brand-ink/90 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              + ابدأ استنساخ صوتك الآن
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EXPLORE (استكشاف) */}
      {/* ========================================================================= */}
      {activeTab === 'explore' && (
        <div className="space-y-8 animate-fade-in">
          {/* Search & Tag Filter Bar */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في أصوات المكتبة، اللهجات، النبرات، أو الاستخدامات..."
                  className="w-full pl-4 pr-10 py-2.5 bg-white text-xs md:text-sm text-slate-900 placeholder:text-slate-400 rounded-2xl border border-slate-200/90 focus:border-brand outline-hidden shadow-2xs transition-all"
                />
              </div>

              <button
                onClick={() => {
                  setSelectedDialect('all');
                  setSelectedTag('all');
                  setSearchQuery('');
                }}
                className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>تصفية</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {filterTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                    selectedTag === tag.id
                      ? 'bg-brand-ink text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/70'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trending Voices */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-text" />
                <h3 className="text-sm font-black text-slate-900">الأصوات المتصدرة الأكثر استخداماً</h3>
              </div>
              <span className="text-xs font-bold text-slate-400">تحديث أسبوعي معتمد</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredVoices.slice(0, 6).map((voice) => {
                const isPlaying = playingVoiceId === voice.id;
                const isHuman = voice.type === 'human';

                return (
                  <div
                    key={voice.id}
                    className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200/80 hover:border-brand/50 shadow-2xs hover:shadow-xs transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => onTogglePlayVoice(voice.id)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          isPlaying
                            ? 'bg-brand text-white shadow-xs scale-95'
                            : 'bg-slate-100 group-hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {voice.name}
                          </h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isHuman ? 'bg-brand/10 text-brand-text' : 'bg-brand-ink/10 text-brand-ink'
                          }`}>
                            {isHuman ? 'بشري' : 'ذكاء اصطناعي'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {voice.dialectLabel} • {voice.styleLabel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (isHuman && onBookHumanVoice) {
                            onBookHumanVoice(voice);
                          } else {
                            onSelectVoiceForStudio(voice.id);
                          }
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-brand-ink hover:text-white text-slate-700 text-[10px] font-bold rounded-lg transition-all"
                      >
                        {isHuman ? 'حجز' : 'استخدام'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Handpicked for Your Use Case */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900">مجموعات مختارة خصيصاً لاحتياجاتك</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {handpicked.map((hp, i) => (
                <div
                  key={i}
                  onClick={() => onNavigateTab('studio')}
                  className="group relative rounded-2xl overflow-hidden border border-slate-200/80 hover:border-brand/50 p-4 bg-brand-ink text-white cursor-pointer transition-all hover:shadow-md"
                >
                  <div className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url(${hp.img})` }} />
                  <div className="relative z-10 space-y-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 backdrop-blur-md text-white border border-white/20 inline-block">
                      {hp.badge}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors">
                      {hp.title}
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-tight">
                      {hp.desc}
                    </p>
                    <div className="text-[10px] font-bold text-brand-text pt-1">
                      {hp.count} متوفرة ←
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Curated Dialect Collections */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900">مجموعات اللهجات العربية المعتمدة</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {dialectCollections.map((dc) => (
                <button
                  key={dc.id}
                  onClick={() => setSelectedDialect(dc.id === selectedDialect ? 'all' : dc.id)}
                  className={`p-3.5 rounded-2xl text-right transition-all border ${
                    selectedDialect === dc.id
                      ? 'bg-brand-ink text-white border-orange-400 shadow-md ring-2 ring-orange-400/20'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80 shadow-2xs'
                  }`}
                >
                  <div className="text-xs font-black truncate">{dc.label}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{dc.count} صوتاً معتمداً</div>
                </button>
              ))}
            </div>
          </div>

          {/* Voices Full Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900">قائمة الأصوات الكاملة والمعاينة الفورية</h3>
            <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-2xs">
              {filteredVoices.map((v) => {
                const isPlaying = playingVoiceId === v.id;
                const isHuman = v.type === 'human';

                return (
                  <div
                    key={v.id}
                    className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => onTogglePlayVoice(v.id)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          isPlaying
                            ? 'bg-brand text-white shadow-xs'
                            : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs md:text-sm font-bold text-slate-900">
                            {v.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {v.dialectLabel}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isHuman ? 'bg-brand/10 text-brand-text border border-brand/30' : 'bg-brand-ink/10 text-brand-ink border border-brand-ink/20'
                          }`}>
                            {isHuman ? 'معلق بشري' : 'ذكاء اصطناعي'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {v.styleLabel} • {v.useCases.slice(0, 3).join('، ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          if (isHuman && onBookHumanVoice) {
                            onBookHumanVoice(v);
                          } else {
                            onSelectVoiceForStudio(v.id);
                          }
                        }}
                        className="px-3.5 py-1.5 bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                      >
                        {isHuman ? 'حجز المعلق' : 'فتح في الاستوديو'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Setup Payout Account */}
      {isPayoutAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-scale-up" style={{ direction: 'rtl' }}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">إعداد وتوثيق حساب تحويل الأرباح</h3>
              </div>
              <button 
                onClick={() => setIsPayoutAccountModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              يتم تحويل أرباحك شهرياً بالدولار أو الريال السعودي مباشرة إلى حسابك البنكي المعتمد أو عبر بوابة الدفع الرقمية.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستفيد (كما في الحساب البنكي)</label>
                <input
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="مثال: محمد بن فهد التميمي"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-hidden focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الحساب الدولي (الآيبان البنكي) أو بوابة الدفع</label>
                <input
                  type="text"
                  value={ibanInput}
                  onChange={(e) => setIbanInput(e.target.value)}
                  placeholder="SA00 0000 0000 0000 0000 0000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-hidden focus:border-brand font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsPayoutAccountModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  setIsSavedPayout(true);
                  setIsPayoutAccountModalOpen(false);
                  alert('تم حفظ إعدادات حساب تحويل الأرباح بنجاح.');
                }}
                className="px-5 py-2 bg-brand-ink text-white rounded-xl text-xs font-black hover:bg-brand-ink/90 shadow-xs"
              >
                حفظ وتأكيد الحساب
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
