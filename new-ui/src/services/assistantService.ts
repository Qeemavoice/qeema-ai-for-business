import { AssistantMessage, AssistantLanguage, PricingPlanCard } from '../components/ai-assistant/types';
import { voiceSearchService } from './voiceSearchService';
import { analytics } from './analyticsService';
import { Voice } from '../types';

const PLANS_DATA: PricingPlanCard[] = [
  {
    id: 'starter',
    nameAr: 'باقة الإنتاج الأساسية (Starter)',
    nameEn: 'Starter Production Plan',
    priceUsd: 49,
    period: 'شهر',
    credits: 50000,
    features: [
      '50,000 نقطة صوتية (حوالي 50 دقيقة)',
      'وصول كامل لمكتبة الأصوات الذكية (AI)',
      'ترخيص تجاري كامل للإعلانات والسوشيال ميديا',
      'تصدير بجودة ستوديو 48kHz WAV'
    ]
  },
  {
    id: 'growth',
    nameAr: 'باقة الشركات والوكالات (Growth)',
    nameEn: 'Growth & Agency Plan',
    priceUsd: 149,
    period: 'شهر',
    credits: 200000,
    highlight: true,
    features: [
      '200,000 نقطة صوتية شهرياً',
      'خصم 15% على حجوزات المعلقين البشريين',
      'مفاتيح API مخصصة للربط البرمجي',
      'توأم صوتي واحد (Custom Brand Voice Twin)',
      'دعم فني مخصص ذو أولوية 24/7'
    ]
  },
  {
    id: 'enterprise',
    nameAr: 'باقة المؤسسات المخصصة (Enterprise)',
    nameEn: 'Enterprise Custom Plan',
    priceUsd: 499,
    period: 'شهر',
    credits: 1000000,
    features: [
      'أرصدة غير محدودة أو استهلاك مخصص (SLA)',
      'استنساخ توائم صوتية غير محدودة',
      'ربط خاص بأنظمة IVR ومراكز الاتصال',
      'عقود تجارية مخصصة وفواتير ضريبية رسمية'
    ]
  }
];

export class AssistantService {
  public getInitialGreeting(lang: AssistantLanguage): AssistantMessage {
    if (lang === 'en') {
      return {
        id: 'msg-welcome-en',
        sender: 'assistant',
        text: 'Hello! I am your QeemaVoice AI Assistant. I can help you discover human and AI Arabic voices, compare dialects, check pricing and licensing, or guide you to booking.',
        timestamp: Date.now(),
        suggestedReplies: [
          'Find a Voice',
          'Explore Dialects',
          'Pricing & Plans',
          'Voice Cloning',
          'Contact Sales'
        ]
      };
    }

    return {
      id: 'msg-welcome-ar',
      sender: 'assistant',
      text: 'مرحباً بك! أنا مساعدك الذكي في «قيمة فويس». كيف يمكنني مساعدتك اليوم في اختيار الصوت الأنسب أو التعرف على الأسعار والتراخيص؟',
      timestamp: Date.now(),
      suggestedReplies: [
        'ابحث عن صوت مناسب',
        'استكشف اللهجات العربية',
        'الأسعار والباقات',
        'استنساخ الصوت والتوأم',
        'تواصل مع المبيعات'
      ]
    };
  }

  public async sendMessage(
    userInput: string,
    history: AssistantMessage[],
    lang: AssistantLanguage,
    availableVoices: Voice[] = []
  ): Promise<AssistantMessage> {
    voiceSearchService.setVoicesCache(availableVoices);

    try {
      const response = await fetch('/api/v1/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          language: lang,
          history: history.slice(-6).map(m => ({
            sender: m.sender,
            text: m.text
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.text) {
          // If server returned structured card data
          let enrichedVoices: Voice[] | undefined = undefined;
          if (data.cardType === 'voice_list' && data.searchParams) {
            enrichedVoices = await voiceSearchService.searchVoices(data.searchParams);
          } else if (data.cardType === 'voice_list' && data.cardData?.voices) {
            enrichedVoices = data.cardData.voices;
          }

          return {
            id: `msg-${Date.now()}`,
            sender: 'assistant',
            text: data.text,
            timestamp: Date.now(),
            cardType: data.cardType,
            cardData: {
              ...data.cardData,
              voices: enrichedVoices || data.cardData?.voices,
              plans: data.cardType === 'pricing' ? PLANS_DATA : data.cardData?.plans
            },
            suggestedReplies: data.suggestedReplies || []
          };
        }
      }
    } catch (err) {
      console.warn('[AssistantService] Backend chat failed or offline, using smart local engine fallback:', err);
    }

    // Fallback: Smart Local Intent Engine
    return this.processLocalIntent(userInput, lang, availableVoices);
  }

  private async processLocalIntent(
    input: string,
    lang: AssistantLanguage,
    availableVoices: Voice[]
  ): Promise<AssistantMessage> {
    const q = input.toLowerCase().trim();

    // 1. Pricing / Plans Intent
    if (
      q.includes('سعر') || q.includes('اسعار') || q.includes('باقة') || q.includes('باقات') ||
      q.includes('price') || q.includes('pricing') || q.includes('plan') || q.includes('cost')
    ) {
      analytics.track('pricing_requested', { input });
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: lang === 'en'
          ? 'Here are our transparent flexible plans tailored for creators, agencies, and enterprise production:'
          : 'إليك باقات منصة «قيمة» الشفافة المصممة لصناع المحتوى، والوكالات، والشركات الكبرى:',
        timestamp: Date.now(),
        cardType: 'pricing',
        cardData: {
          plans: PLANS_DATA,
          targetView: 'billing',
          ctaLabel: lang === 'en' ? 'View All Plans' : 'عرض كافة الباقات والترقية'
        },
        suggestedReplies: lang === 'en'
          ? ['Find a Saudi Voice', 'How does licensing work?', 'Contact Enterprise Sales']
          : ['ابحث عن صوت سعودي', 'ما هي شروط التراخيص؟', 'تواصل مع مبيعات الشركات']
      };
    }

    // 2. Licensing Intent
    if (
      q.includes('ترخيص') || q.includes('حقوق') || q.includes('ملكية') || q.includes('تجاري') ||
      q.includes('license') || q.includes('licensing') || q.includes('commercial') || q.includes('copyright')
    ) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: lang === 'en'
          ? 'All audio generated or recorded through QeemaVoice includes 100% full commercial and broadcast rights with no royalties or recurring fees.'
          : 'جميع التسجيلات والأصوات المولدة عبر منصة «قيمة» تأتي مع ترخيص تجاري وبث كامل 100% معتمد قانونياً وخالٍ من أي رسوم ملكية متكررة (Royalty-Free).',
        timestamp: Date.now(),
        cardType: 'licensing',
        cardData: {
          details: lang === 'en' ? [
            'Full rights for TV, Radio, Digital Ads, and Social Media campaigns',
            'Downloadable authenticated PDF licensing certificate for every track',
            'Certified protection against copyright strikes on YouTube and Meta platforms'
          ] : [
            'حقوق كاملة لحملات التلفزيون، الراديو، الإعلانات الرقمية والسوشيال ميديا',
            'شهادة ترخيص رسمية معتمدة بصيغة PDF لكل ملف يتم تصديره',
            'حماية معتمدة من مخالفات حقوق النشر على يوتيوب ومنصات ميتا'
          ],
          targetView: 'client-dashboard',
          ctaLabel: lang === 'en' ? 'Open Compliance Hub' : 'عرض مركز التراخيص والأمان'
        },
        suggestedReplies: lang === 'en'
          ? ['View Pricing', 'Find a Voice', 'Book a Human Voice Actor']
          : ['الأسعار والباقات', 'ابحث عن صوت', 'حجز معلق صوتي بشري']
      };
    }

    // 3. Voice Cloning / Twins Intent
    if (
      q.includes('استنساخ') || q.includes('توأم') || q.includes('صوتي مخصص') || q.includes('بصمة') ||
      q.includes('clone') || q.includes('cloning') || q.includes('twin') || q.includes('custom voice')
    ) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: lang === 'en'
          ? 'Qeema Voice Twins allows organizations to build a proprietary, ultra-realistic neural voice model trained on authorized brand speakers in just minutes.'
          : 'تقنية «التوأم الصوتي» من قيمة تتيح للمنشآت بناء نموذج ذكاء اصطناعي صوتي حصري ومطابق لنبرة المتحدث المعتمد بدقة تفوق 98% وتشفير بيومتري آمن.',
        timestamp: Date.now(),
        cardType: 'cloning',
        cardData: {
          targetView: 'branded-voice',
          ctaLabel: lang === 'en' ? 'Explore Voice Twins' : 'استكشف التوأم الصوتي المؤسسي'
        },
        suggestedReplies: lang === 'en'
          ? ['Book a Demo', 'Find Existing Voices', 'Pricing']
          : ['طلب عرض تجريبي (Demo)', 'استعراض الأصوات الجاهزة', 'الأسعار']
      };
    }

    // 4. Voice Search by Dialect / Gender / Use Case
    let matchedVoices: Voice[] = [];
    let detectedDialect: string | undefined = undefined;

    if (q.includes('سعود') || q.includes('خليج') || q.includes('saudi') || q.includes('gulf')) {
      detectedDialect = 'gulf';
    } else if (q.includes('مصر') || q.includes('egypt')) {
      detectedDialect = 'egyptian';
    } else if (q.includes('شام') || q.includes('سور') || q.includes('لبنان') || q.includes('اردن') || q.includes('levant') || q.includes('syria')) {
      detectedDialect = 'levantine';
    } else if (q.includes('مغرب') || q.includes('تونس') || q.includes('جزائر') || q.includes('maghreb')) {
      detectedDialect = 'maghrebi';
    } else if (q.includes('فصح') || q.includes('رسمي') || q.includes('وثائقي') || q.includes('fusha') || q.includes('msa')) {
      detectedDialect = 'fusha';
    }

    const detectedGender = (q.includes('رجل') || q.includes('ذكر') || q.includes('male') || q.includes('man'))
      ? 'male'
      : (q.includes('امرأة') || q.includes('انثى') || q.includes('أنثى') || q.includes('بنت') || q.includes('female') || q.includes('woman'))
      ? 'female'
      : 'all';

    const detectedType = q.includes('بشري') || q.includes('معلق') || q.includes('human')
      ? 'human'
      : q.includes('ذكاء') || q.includes('ai')
      ? 'ai'
      : 'all';

    matchedVoices = await voiceSearchService.searchVoices({
      dialect: detectedDialect as any,
      gender: detectedGender as any,
      type: detectedType as any,
      query: (detectedDialect || detectedGender !== 'all') ? undefined : q
    });

    if (matchedVoices.length > 0) {
      analytics.track('voice_search', { query: input, count: matchedVoices.length });
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: lang === 'en'
          ? `I found ${matchedVoices.length} voice${matchedVoices.length > 1 ? 's' : ''} matching your criteria. You can preview them directly below:`
          : `وجدت لك ${matchedVoices.length} ${matchedVoices.length === 1 ? 'صوت مناسب' : 'أصوات متميزة'} تطابق طلبك. يمكنك الاستماع للمعاينة الفورية مباشرة:`,
        timestamp: Date.now(),
        cardType: 'voice_list',
        cardData: {
          voices: matchedVoices.slice(0, 4),
          targetView: 'voice-library',
          ctaLabel: lang === 'en' ? 'Open Full Voice Library' : 'فتح مكتبة الأصوات الكاملة'
        },
        suggestedReplies: lang === 'en'
          ? ['How much does it cost?', 'Search Female Voices', 'Show Human Voice Actors']
          : ['كم التكلفة والأسعار؟', 'ابحث عن أصوات نسائية', 'عرض المعلقين البشريين']
      };
    }

    // 5. General Platform Intro / How it works
    if (
      q.includes('من نحن') || q.includes('ما هي') || q.includes('كيف تعمل') || q.includes('شرح') ||
      q.includes('what is') || q.includes('how it works') || q.includes('about')
    ) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: lang === 'en'
          ? 'QeemaVoice is the leading Arabic Voice AI and human talent marketplace for enterprises. We combine authentic regional Arabic dialects with enterprise-grade Text-to-Speech synthesis and certified human voice actors.'
          : '«قيمة للذكاء الصوتي» هي المنصة الأولى المتخصصة بالصوت العربي للشركات وصناع المحتوى. نجمع بين دقة الذكاء الاصطناعي للهجات العربية كافة، وسوق المعلقين الصوتيين البشريين المعتمدين مع ترخيص تجاري كامل.',
        timestamp: Date.now(),
        cardType: 'how_it_works',
        cardData: {
          targetView: 'how-it-works',
          ctaLabel: lang === 'en' ? 'Learn How It Works' : 'تعرف على آلية عمل المنصة'
        },
        suggestedReplies: lang === 'en'
          ? ['Explore Voices', 'View Pricing', 'Talk to Sales']
          : ['استعراض الأصوات', 'عرض الأسعار والباقات', 'تحدث مع المبيعات']
      };
    }

    // 6. Default Helpful Conversational Response
    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: lang === 'en'
        ? 'I can assist you with finding specific Arabic dialects, previewing voices, checking plans, or navigating our AI studio. What specific voice style or project are you working on?'
        : 'أنا جاهز لمساعدتك في العثور على أنسب نبرة ولهجة لمشروعك، أو شرح الباقات والتراخيص، أو حجز معلق صوتي بشري. ما هو نوع المشروع أو اللهجة التي تبحث عنها؟',
      timestamp: Date.now(),
      suggestedReplies: lang === 'en'
        ? ['Find a Saudi Voice', 'Find an Egyptian Voice', 'Check Pricing', 'Contact Sales']
        : ['صوت سعودي إعلاني', 'صوت مصري وثائقي', 'الأسعار والباقات', 'تواصل مع المبيعات']
    };
  }
}

export const assistantService = new AssistantService();
