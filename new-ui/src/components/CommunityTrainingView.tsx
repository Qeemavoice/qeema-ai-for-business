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
  Video
} from 'lucide-react';
import { ActiveView } from '../types';

interface CommunityTrainingViewProps {
  onNavigate: (view: ActiveView) => void;
  onOpenDemo: () => void;
}

export const CommunityTrainingView: React.FC<CommunityTrainingViewProps> = ({ onNavigate, onOpenDemo }) => {
  const [enrolledCourse, setEnrolledCourse] = useState<string | null>(null);

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
      id: 'ai-voice-cloning-ethics',
      title: 'إعداد وتجهيز مجموعات البيانات للتوأمة الصوتية بالذكاء الاصطناعي',
      level: 'متوسط إلى متقدم',
      duration: 'أسبوعان • 12 ساعة تدريبية',
      instructor: 'فريق هندسة النماذج والبيانات الصوتية',
      format: 'عبر الإنترنت (ورش عمل تفاعلية مباشرة)',
      description: 'دورة تقنية متخصصة للمعلقين ومهندسي الصوت الراغبين في بناء نموذج صوتي رقمي ذكي موثق وعالي الدقة يحقق دخلاً سلبياً مستمراً.',
      topics: [
        'معايير تنظيف وتفريغ التسجيلات الصوتية (Denoising & Segmentation)',
        'تأمين الحقوق والترخيص التجاري لنموذج الصوت الذكي',
        'التوافق مع أنظمة التوليد الصوتي B2B'
      ],
      badge: 'تفعيل التوأم الصوتي الرقمي في منصة قيمة'
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>أكاديمية قيمة لتدريب المواهب الصوتية</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            برامج التدريب الاحترافي وهندسة الصوت العربي
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            نؤهل المواهب الصوتية ومهندسي الصوت في العالم العربي لأعلى المعايير العالمية، ونمكن المعلقين من الاستفادة من ثورة الذكاء الاصطناعي بدلاً من التخوف منها.
          </p>
        </div>

        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 text-center space-y-3 shrink-0">
          <div className="text-3xl font-black text-[#FF5500] font-mono">1,000+</div>
          <p className="text-xs text-slate-300">خريج معتمد يعملون في الإنتاج التجاري</p>
          <button
            onClick={onOpenDemo}
            className="w-full py-2.5 px-4 rounded-xl bg-[#FF5500] text-white text-xs font-bold hover:bg-[#E04800] transition-colors"
          >
            طلب تدريب مخصص لفرق الشركات
          </button>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            البرامج التدريبية المتاحة للتسجيل حالياً
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            جميع البرامج تشمل جلسات تطبيقية مباشرة وتقييمات فردية لصوتك من خبراء المجال.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div
              key={course.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {course.level}
                  </span>
                  <span className="text-[11px] text-[#FF5500] font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
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
                    setEnrolledCourse(course.title);
                    alert(`تم تسجيل اهتمامك في الدورة: "${course.title}". سيتواصل معك فريق الأكاديمية خلال 24 ساعة.`);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>التسجيل في الدورة</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
