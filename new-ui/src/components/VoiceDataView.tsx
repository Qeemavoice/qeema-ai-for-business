import React, { useState } from 'react';
import { 
  Database, 
  ShieldCheck, 
  Sparkles, 
  FileCheck, 
  Download, 
  CheckCircle2, 
  Headphones, 
  Layers, 
  Cpu, 
  Lock,
  Play,
  Pause
} from 'lucide-react';
import { audioSynth } from '../utils/audioSynthesizer';
import { ActiveView } from '../types';

interface VoiceDataViewProps {
  onNavigate: (view: ActiveView) => void;
}

export const VoiceDataView: React.FC<VoiceDataViewProps> = ({ onNavigate }) => {
  const [playingDataset, setPlayingDataset] = useState<string | null>(null);

  const datasets = [
    {
      id: 'ds-gulf',
      title: 'مجموعة البيانات الخليجية المعاصرة (Gulf Speech Corpus)',
      hours: '550+ ساعة',
      dialects: 'سعودي (نجدي، حجازي)، إماراتي، كويتي',
      sampling: '48kHz / 24-bit PCM FLAC',
      annotations: 'تشكيل كامل، وسم المشاعر، وتحديد مخارج الحروف',
      desc: 'سجلات نقية مسجلة في غرف عزل استوديو احترافية لتطوير نماذج المحادثة الطبيعية وتطبيقات الرد الآلي.'
    },
    {
      id: 'ds-levantine',
      title: 'مجموعة البيانات الشامية التفاعلية (Levantine Dialogue)',
      hours: '420+ ساعة',
      dialects: 'سوري، لبناني، أردني، فلسطيني',
      sampling: '48kHz / 24-bit PCM FLAC',
      annotations: 'حوارات عفوية، نصوص درامية، وبودكاست مصنف',
      desc: 'مثالية لتدريب نماذج الذكاء الاصطناعي التوليدي والسرد الروائي والدبلجة الصوتية الآلية.'
    },
    {
      id: 'ds-egyptian',
      title: 'مجموعة البيانات المصرية التجارية (Egyptian Commercial Corpus)',
      hours: '480+ ساعة',
      dialects: 'مصري قاهري وسكندري معاصر',
      sampling: '48kHz / 24-bit PCM FLAC',
      annotations: 'إعلانات، ردود استفسارات، وحوارات سوشيال ميديا',
      desc: 'الخيار الأقوى للشركات التي تستهدف السوق المصري وأكبر قاعدة جماهيرية في العالم العربي.'
    },
    {
      id: 'ds-msa',
      title: 'مجموعة بيانات الفصحى المعيارية (Classical MSA)',
      hours: '700+ ساعة',
      dialects: 'عربية فصحى معاصرة وتراثية سليمة',
      sampling: '48kHz / 24-bit PCM FLAC',
      annotations: 'تشكيل إعرابي كامل مدقق لغوياً بواسطة خبراء معتمدين',
      desc: 'مرجع قياسي للكتب المسموعة، نشرات الأخبار، والنصوص الدينية والوثائقية التاريخية.'
    }
  ];

  const handlePlaySample = (id: string, text: string) => {
    if (playingDataset === id) {
      audioSynth.stopAll();
      setPlayingDataset(null);
      return;
    }
    setPlayingDataset(id);
    audioSynth.speakText(text, 1, 1, () => {
      setPlayingDataset(null);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3.5 py-1 rounded-full text-xs font-bold text-emerald-800">
          <Database className="w-3.5 h-3.5" />
          <span>بيانات صوتية لتدريب نماذج الذكاء الاصطناعي (AI Training Datasets)</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          بيانات صوتية نقية لتدريب أذكى النماذج
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          مستوحاة من معايير Voices.com العالمية: مجموعات بيانات صوتية عربية مسجلة في استوديوهات 48kHz، موسومة ومصنفة بدقة، ومرخصة قانونياً 100% لتغذية خوارزميات الذكاء الاصطناعي الصوتي ومشاريع الأبحاث.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-brand-text flex items-center justify-center">
            <Headphones className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">جودة استوديو احترافية 48kHz</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            تسجيلات خالصة من الضجيج والصدى، مسجلة بمعدات بث عالمية وميكروفونات Neumann وShure في بيئة عزل معتمدة.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">تصنيف ووسم دقيق (Phonetic Tagging)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            كل مقطع صوتي يرافقه ملف نصي بالتشكيل، وسم مخارج الحروف، ونوع المشاعر (وقور، مرح، جاد، إعلاني) لتسهيل التدريب.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">مصادر أخلاقية وتراخيص واضحة</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            موافقة خطية من المعلقين تتيح استخدام الأصوات في تدريب النماذج اللغوية والصوتية دون أي مخاطر قانونية مستقبلية.
          </p>
        </div>
      </div>

      {/* Dataset Catalog */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">حزم البيانات الصوتية الجاهزة للترخيص</h2>
            <p className="text-xs text-slate-500">متوفرة للتسليم الفوري مع توثيق تقني شامل</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
            +2,150 ساعة صوتية معتمدة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {datasets.map(ds => (
            <div key={ds.id} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900">{ds.title}</h3>
                  <span className="text-xs bg-brand/10 text-brand-text font-bold px-2.5 py-0.5 rounded-full shrink-0">
                    {ds.hours}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{ds.desc}</p>

                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">
                  <div><strong>اللهجات المضمنة:</strong> {ds.dialects}</div>
                  <div><strong>مواصفات الملفات:</strong> {ds.sampling}</div>
                  <div><strong>الوسم والتصنيف:</strong> {ds.annotations}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handlePlaySample(ds.id, `عينة تجريبية من مجموعة ${ds.title}`)}
                  className="flex items-center gap-1.5 text-xs font-bold text-brand-text hover:text-brand-text"
                >
                  {playingDataset === ds.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-brand" />}
                  <span>{playingDataset === ds.id ? 'إيقاف' : 'استمع لعينة من الحزمة'}</span>
                </button>

                <button
                  onClick={() => alert(`طلب ترخيص حزمة: ${ds.title}\nيرجى التواصل مع فريق مبيعات البيانات الصوتية.`)}
                  className="px-4 py-2 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>طلب عينة الترخيص</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Dataset Collection Request */}
      <div className="bg-[#1C120A] text-white rounded-3xl p-8 sm:p-10 border border-orange-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-right">
          <span className="text-xs font-bold text-brand-yellow uppercase">خدمة جمع بيانات مخصصة</span>
          <h3 className="text-2xl font-bold text-white">هل تحتاج مجموعة بيانات بلهجة أو سيناريو محدد؟</h3>
          <p className="text-xs text-amber-200/70 max-w-xl leading-relaxed">
            بفضل شبكتنا المكونة من 1,000+ معلق صوتي في مختلف البلدان العربية، يمكننا تسجيل وتسمية آلاف الساعات الصوتية المخصصة لمشروعك وبإشراف لغوي مباشر.
          </p>
        </div>

        <button
          onClick={() => onNavigate('branded-voice')}
          className="px-6 py-3.5 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold shrink-0 shadow-lg transition"
        >
          طلب جمع بيانات صوتية مخصصة
        </button>
      </div>

    </div>
  );
};
