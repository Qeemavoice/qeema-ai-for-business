import React, { useState } from 'react';
import { 
  GraduationCap, 
  Mic2, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Award, 
  Users, 
  ArrowLeft, 
  FileCheck,
  Video,
  MapPin,
  X,
  Check,
  BookOpen,
  Send,
  Zap
} from 'lucide-react';
import { ActiveView } from '../types';

interface CommunityTrainingViewProps {
  onNavigate: (view: ActiveView) => void;
  onOpenDemo: () => void;
}

interface Workshop {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  duration: string;
  format: 'online' | 'hybrid' | 'in-person';
  formatLabel: string;
  location: string;
  instructor: {
    name: string;
    title: string;
    avatar: string;
  };
  capacity: number;
  availableSeats: number;
  price: string;
  priceNote: string;
  description: string;
  topics: string[];
  badge?: string;
}

export const CommunityTrainingView: React.FC<CommunityTrainingViewProps> = ({ onNavigate, onOpenDemo }) => {
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'workshops' | 'courses'>('all');
  
  // Registration Form State
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeePhone, setAttendeePhone] = useState('');
  const [attendeeExperience, setAttendeeExperience] = useState('beginner');

  // Workshops Data (قسم الورشات)
  const workshops: Workshop[] = [
    {
      id: 'ws-home-studio',
      title: 'ورشة: هندسة وضبط الميكروفون المنزلي لمعايير الاستوديو التجاري',
      category: 'هندسة صوت',
      date: 'الخميس، 12 نوفمبر 2026',
      time: '6:00 م - 9:00 م (توقيت مكة)',
      duration: '3 ساعات تدريبية مكثفة',
      format: 'hybrid',
      formatLabel: 'حضوري في استوديو الرياض + بث تفاعلي مباشر',
      location: 'استوديوهات قيمة، الرياض / Zoom',
      instructor: {
        name: 'م. فهد السليمان',
        title: 'كبير مهندسي الماسترينغ في منصة قيمة',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      capacity: 20,
      availableSeats: 4,
      price: '190 ر.س',
      priceNote: 'مشمول مجاناً لمشتركي باقات الاستوديو',
      description: 'ورشة عملية تركز على تحويل غرفتك العادية إلى كابينة عزل احترافية، وضبط ميكروفونات الـ Condenser ومعالجة الصدى والـ Noise Floor بدقة 48kHz.',
      topics: [
        'معايرة كرت الصوت (Audio Interface) وضبط الـ Gain دون تشويه',
        'عزل الترددات المنخفضة والصدى بمواد متوفرة واقتصادية',
        'سلسلة معالجة الصوت المباشرة: EQ و Compressor و De-Esser'
      ],
      badge: 'تطبيق عملي فردي'
    },
    {
      id: 'ws-commercial-acting',
      title: 'ورشة: تلوين الأداء الإعلاني السريع وقراءة النصوص تحت ضغط الثواني',
      category: 'أداء صوتي',
      date: 'السبت، 14 نوفمبر 2026',
      time: '5:00 م - 9:00 م (توقيت مكة)',
      duration: '4 ساعات تطبيقية',
      format: 'online',
      formatLabel: 'بث تفاعلي حي عبر الإنترنت (Interactive Web Live)',
      location: 'عبر الإنترنت (منصة قيمة التفاعلية)',
      instructor: {
        name: 'أحمد العتيبي',
        title: 'معلق صوتي معتمد لأكثر من 200 حملة إعلانية وطنية',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      },
      capacity: 15,
      availableSeats: 3,
      price: '240 ر.س',
      priceNote: 'يشمل تقييماً صوتياً فردياً مسجلاً',
      description: 'كيف تقرأ نص الإعلان التجاري لمدد 15 ثانية و 30 ثانية بإيقاع حماسي ومخارج واضحة ومقنعة دون أن يبدو الصوت متسرعاً أو رتيباً.',
      topics: [
        'تقنية الوقفات المؤثرة وتلوين نبرة الحماس vs النبرة الوقورة',
        'التحكم في التنفس أثناء قراءة النصوص السريعة',
        'محاكاة عملية لجلسة توجيه مخرج حقيقية (Live Directing Session)'
      ],
      badge: 'مقاعد محدودة جداً'
    },
    {
      id: 'ws-ai-voice-synthesis',
      title: 'ورشة: إعداد العينات الصوتية وتوجيه محركات النطق بالذكاء الاصطناعي',
      category: 'تقنية وذكاء اصطناعي',
      date: 'الثلاثاء، 17 نوفمبر 2026',
      time: '7:00 م - 9:30 م (توقيت مكة)',
      duration: 'ساعتان ونصف',
      format: 'online',
      formatLabel: 'ورشة تقنية مباشرة عبر الإنترنت',
      location: 'عبر الإنترنت',
      instructor: {
        name: 'د. سارة المنصور',
        title: 'باحثة صوتيات وخوارزميات الذكاء الاصطناعي الصوتي',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      },
      capacity: 30,
      availableSeats: 8,
      price: '150 ر.س',
      priceNote: 'مجان للمسجلين في سوق المعلقين',
      description: 'ورشة تشرح كيف يمكن للمعلق الصوتي الاستفادة من محركات الذكاء الاصطناعي التوليدية، ضبط التشكيل، وبناء رصيد صوتي رقمي محمي الترخيص.',
      topics: [
        'كيف تختار النصوص المناسبة لتدريب وتوثيق نبرتك الصوتية',
        'طرق ضبط التشكيل التلقائي وتصحيح مخارج الحروف في استوديو TTS',
        'استراتيجيات الحماية القانونية لنموذج صوتك وتحقيق عائد سلبي'
      ],
      badge: 'جديد ومواكب'
    },
    {
      id: 'ws-dialects-saudi-gulf',
      title: 'ورشة: إتقان اللهجات السعودية والخليجية في الحملات الرسمية والتجارية',
      category: 'لهجات وثقافة صوتية',
      date: 'الخميس، 19 نوفمبر 2026',
      time: '6:30 م - 9:30 م (توقيت مكة)',
      duration: '3 ساعات تدريبية',
      format: 'hybrid',
      formatLabel: 'حضوري في استوديو الرياض + بث مباشر تفاعلي',
      location: 'استوديوهات قيمة، الرياض / Zoom',
      instructor: {
        name: 'راشد الدوسري',
        title: 'خبير لهجات محلية وموجه أداء إذاعي',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      },
      capacity: 25,
      availableSeats: 6,
      price: '180 ر.س',
      priceNote: 'شامل مادة صوتية تدريبية 48kHz',
      description: 'فهم الفروق الدقيقة بين النبرة النجدية، الحجازية، والشرقية، وكيفية تلبية معايير الشركات الوطنية والوزارات في المحتوى التعريفي.',
      topics: [
        'تسكين الحروف وتحريكها بما يخدم عفوية اللهجة ورصانتها',
        'تجنب الأخطاء الشائعة لغير متحدثي اللهجة',
        'تدريب عملي على 4 نصوص لعلامات تجارية كبرى'
      ],
      badge: 'طلب مرتفع'
    }
  ];

  // Long-term Courses Data
  const courses = [
    {
      id: 'voice-acting-pro',
      title: 'دبلوم التعليق الصوتي الإعلاني وتلوين الصوت في الاستوديو',
      level: 'متقدم',
      duration: '4 أسابيع • 24 ساعة تدريبية',
      instructor: 'نخبة من كبار معلقي منصة قيمة',
      format: 'حضوري في استوديوهات الرياض + بث تفاعلي',
      description: 'برنامج تطبيقي مكثف يركز على تلوين الصوت، التعامل مع نصوص الإعلانات والوثائقيات والـ IVR، وتقنيات التحكم في التنفس والوقفات الإيقاعية.',
      topics: [
        'مخارج الحروف الفصيحة واللهجات الخليجية والشامية والمصرية',
        'هندسة الميكروفون وبيئة العزل الصوتي المنزلية',
        'تسجيل عينات احترافية واعتماد الحساب في سوق قيمة'
      ],
      badge: 'شهادة معتمدة + ملف تعليق صوتي 48kHz'
    },
    {
      id: 'audio-mastering-enterprise',
      title: 'هندسة الصوت والماسترينغ لمعايير البث التلفزيوني والإذاعي',
      level: 'شامل',
      duration: '3 أسابيع • 18 ساعة تدريبية',
      instructor: 'مهندسو ماسترينغ معتمدون',
      format: 'تطبيقي مع مشاريع عملية أسبوعية',
      description: 'تعلم معايير الضغط (Compression)، الـ EQ المخصص للصوت البشري، ضبط الـ LUFS، وإزالة الصدى لضمان أعلى نقاء صوتي ممكن.',
      topics: [
        'معايير EBU R128 و ITU-R BS.1770 العالمية',
        'التعامل مع برامج Pro Tools و Reaper و Logic Pro',
        'تسليم المشاريع للشركات والوكالات الإعلانية الكبرى'
      ],
      badge: 'شهادة إتمام معتمدة'
    }
  ];

  const handleRegisterWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendeeName.trim() || !attendeeEmail.trim() || !attendeePhone.trim()) {
      return;
    }
    setRegistrationSuccess(true);
  };

  const resetModal = () => {
    setSelectedWorkshop(null);
    setRegistrationSuccess(false);
    setAttendeeName('');
    setAttendeeEmail('');
    setAttendeePhone('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-4 max-w-2xl relative z-10 text-right">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
            <GraduationCap className="w-4 h-4 text-brand-text" />
            <span>أكاديمية قيمة لتدريب المواهب وهندسة الصوت</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            برامج التدريب الاحترافي وورش العمل الصوتية
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            ورش عمل تطبيقية مكثفة وبرامج تأهيلية متقدمة تعدك لسوق العمل الصوتي التجاري، وتمنحك الأدوات التقنية والفنية للتميز في التسجيل والاستوديو.
          </p>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-brand text-white shadow-md shadow-brand/25' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              جميع المسارات
            </button>
            <button
              onClick={() => setActiveTab('workshops')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'workshops' ? 'bg-brand text-white shadow-md shadow-brand/25' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>قسم الورشات التفاعلية (جديد)</span>
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'courses' ? 'bg-brand text-white shadow-md shadow-brand/25' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              البرامج التدريبية المعتمدة
            </button>
          </div>
        </div>

        <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700 text-center space-y-3 shrink-0 relative z-10">
          <div className="text-3xl font-black text-brand-text font-mono">1,250+</div>
          <p className="text-xs text-slate-300">خريج ومشارك معتمد في سوق العمل</p>
          <button
            onClick={onOpenDemo}
            className="w-full py-2.5 px-4 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-brand/25"
          >
            طلب تدريب مخصص لفرق الشركات
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. قسم الورشات (WORKSHOPS SECTION)                                        */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'workshops') && (
        <section id="workshops-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4 text-right">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/80 text-brand-text text-[11px] font-bold mb-2">
                <Zap className="w-3.5 h-3.5" />
                <span>ورش عمل تطبيقية مكثفة (Workshops)</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                ورش العمل التفاعلية المباشرة
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                ورش عمل تطبيقية مركزة (من ساعتين إلى 4 ساعات) بحضور مباشر وتقييم حي للأداء لتطوير مهاراتك بشكل فوري.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>4 ورش متاحة للتسجيل هذا الشهر</span>
            </div>
          </div>

          {/* Workshops Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workshops.map((ws) => (
              <div
                key={ws.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 hover:border-orange-300 shadow-xs hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 flex flex-col justify-between space-y-6 text-right group"
              >
                <div className="space-y-4">
                  
                  {/* Top Meta: Category & Available Seats */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-50 text-brand-text border border-orange-200/60">
                      {ws.category}
                    </span>

                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      <span>متبقي {ws.availableSeats} مقاعد</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-brand-text transition-colors leading-snug">
                    {ws.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {ws.description}
                  </p>

                  {/* Workshop Details Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-brand-text shrink-0" />
                      <span className="text-[11px] font-semibold">{ws.date}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-brand-text shrink-0" />
                      <span className="text-[11px] font-semibold">{ws.time}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 sm:col-span-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-[11px] font-semibold">{ws.formatLabel}</span>
                    </div>
                  </div>

                  {/* Instructor Pill */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <img 
                      src={ws.instructor.avatar} 
                      alt={ws.instructor.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" 
                    />
                    <div className="text-right truncate">
                      <div className="text-xs font-bold text-slate-900">{ws.instructor.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{ws.instructor.title}</div>
                    </div>
                  </div>

                  {/* Key Takeaways */}
                  <div className="space-y-1.5 pt-1 text-xs">
                    <span className="font-bold text-slate-900 text-[11px] block">ما ستتعلمه في هذه الورشة:</span>
                    <ul className="space-y-1 text-slate-600 text-[11px]">
                      {ws.topics.map((t, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-text shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Bottom Row: Price & Register Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-slate-900 font-mono">{ws.price}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">{ws.priceNote}</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedWorkshop(ws);
                      setRegistrationSuccess(false);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-brand-ink hover:bg-brand text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <span>حجز مقعد في الورشة</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. البرامج التدريبية المعتمدة (COURSES SECTION)                             */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'courses') && (
        <section id="courses-section" className="space-y-6 pt-4">
          <div className="border-b border-slate-200 pb-4 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold mb-2">
              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
              <span>دبلومات ومسارات طويلة المدى</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              البرامج التدريبية المعتمدة
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              برامج تدريبية متكاملة لعدة أسابيع تشمل إشرافاً مباشراً ومشروع تخرج مسجلاً بأعلى دقة استوديو 48kHz.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses.map(course => (
              <div
                key={course.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 text-right"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {course.level}
                    </span>
                    <span className="text-[11px] text-brand-text font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <span className="font-bold text-slate-800 block text-[11px]">محاور البرنامج:</span>
                    <ul className="space-y-1.5 text-slate-600">
                      {course.topics.map((top, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{top}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 font-semibold flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{course.badge}</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedWorkshop({
                        id: course.id,
                        title: course.title,
                        category: 'برنامج دبلوم',
                        date: 'خلال الشهر القادم',
                        time: 'مسائي',
                        duration: course.duration,
                        format: 'hybrid',
                        formatLabel: course.format,
                        location: 'استوديو الرياض / عن بعد',
                        instructor: {
                          name: course.instructor,
                          title: 'مدرب معتمد بالأكاديمية',
                          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                        },
                        capacity: 25,
                        availableSeats: 5,
                        price: 'رسوم المسار التخصصي',
                        priceNote: 'يشمل تقييم الصوت واعتماد الحساب',
                        description: course.description,
                        topics: course.topics
                      });
                      setRegistrationSuccess(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>التسجيل في الدورة والمسار</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL: WORKSHOP REGISTRATION                                           */}
      {/* ========================================================================= */}
      {selectedWorkshop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in" dir="rtl">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-right space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={resetModal}
              className="absolute left-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!registrationSuccess ? (
              <>
                <div className="space-y-2 pr-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-brand-text text-xs font-bold border border-orange-200/60">
                    <Zap className="w-3.5 h-3.5" />
                    <span>حجز مقعد في الورشة</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-snug">
                    {selectedWorkshop.title}
                  </h3>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-text" />
                      {selectedWorkshop.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-text" />
                      {selectedWorkshop.time}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleRegisterWorkshop} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      الاسم الكامل <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={attendeeName}
                      onChange={(e) => setAttendeeName(e.target.value)}
                      placeholder="مثال: صالح الأحمد"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      البريد الإلكتروني <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>

                  {/* Phone / WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      رقم الهاتف (واتساب للتذكير ورابط الجلسة) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={attendeePhone}
                      onChange={(e) => setAttendeePhone(e.target.value)}
                      placeholder="+966 50 123 4567"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      مستواك الحالي في التعليق وهندسة الصوت
                    </label>
                    <select
                      value={attendeeExperience}
                      onChange={(e) => setAttendeeExperience(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white cursor-pointer"
                    >
                      <option value="beginner">مبتدئ شغوف (أرغب في بدء مجالي الصوتي)</option>
                      <option value="intermediate">معلق صوتي ممارس (أمتلك عينة تسجيل واستوديو منزلي)</option>
                      <option value="pro">محترف / مهندس صوت (أبحث عن معايير وتكنيك متقدم)</option>
                    </select>
                  </div>

                  {/* Pricing / Guarantee */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 text-slate-600">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>الرسوم المستحقة:</span>
                      <span className="font-mono text-brand-text">{selectedWorkshop.price}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      يتم إرسال رابط تأكيد الحضور ودليل الاستعداد التقني فور تأكيد الحجز.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-yellow to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs shadow-lg shadow-brand/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>تأكيد حجز مقعدي في الورشة</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <Check className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900">
                    تم تأكيد حجز مقعدك بنجاح!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    شكراً لك يا <strong>{attendeeName}</strong>. تم تسجيلك في <strong>"{selectedWorkshop.title}"</strong>.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1.5 text-right">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>تم إرسال تفاصيل الحضور ورابط الورشة إلى:</span>
                  </div>
                  <div className="font-mono text-emerald-800 text-[11px] pr-6">{attendeeEmail}</div>
                  <div className="font-mono text-emerald-800 text-[11px] pr-6">{attendeePhone}</div>
                </div>

                <button
                  onClick={resetModal}
                  className="w-full py-2.5 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  العودة إلى صفحة التدريب
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
