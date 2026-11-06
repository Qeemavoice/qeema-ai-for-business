import { AssistantMessage, AssistantLanguage, PricingPlanCard } from '../components/ai-assistant/types';
import { voiceSearchService } from './voiceSearchService';
import { analytics } from './analyticsService';
import { Voice } from '../types';
import { authRequest } from '../lib/api';

const PLANS_DATA: PricingPlanCard[] = [
  {
    id: 'starter',
    nameAr: 'باقة الإنتاج الأساسية (Starter)',
    nameEn: 'Starter Production Plan',
    priceUsd: 49,
    period: 'شهر',
    credits: 50000,
    features: [
      'رصيد مخصص لحجوزات وإنتاج الصوت البشري',
      'وصول كامل لمكتبة المعلقين البشريين',
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
      'رصيد إنتاج شهري مخصص',
      'خصم 15% على حجوزات المعلقين البشريين',
      'إدارة مشاريع ومراجعات التسجيل',
      'أولوية في حجز المعلقين الصوتيين',
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
      'ميزانية إنتاج مخصصة حسب حجم المؤسسة',
      'مدير إنتاج مخصص للمشروع',
      'تسجيلات بشرية لأنظمة IVR ومراكز الاتصال',
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
        text: 'Hello! I am your QeemaVoice text assistant. I can help you discover certified human Arabic voices, compare dialects, check pricing and licensing, or guide you to booking.',
        timestamp: Date.now(),
        suggestedReplies: [
          'Find a Voice',
          'Explore Dialects',
          'Pricing & Plans',
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
      const response = await authRequest('/api/v1/assistant/chat', {
        message: userInput,
        language: lang,
        history: history.slice(-6).map(m => ({
          sender: m.sender,
          text: m.text
        }))
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
            suggestedReplies: data.suggestedReplies || [],
            quota: data.quota
          };
        }
      }
    } catch (err) {
      console.warn('[AssistantService] Backend chat failed or offline, using smart local engine fallback:', err);
    }

    // Fallback: Smart Local Intent Engine
    return this.processLocalIntent(userInput, history, lang, availableVoices);
  }

  private async processLocalIntent(
    input: string,
    history: AssistantMessage[],
    lang: AssistantLanguage,
    availableVoices: Voice[]
  ): Promise<AssistantMessage> {
    const q = input.toLowerCase().trim();
    const priorUserMessage = [...history]
      .reverse()
      .find(message => message.sender === 'user' && message.text.trim().toLowerCase() !== q);
    const priorQ = priorUserMessage?.text.toLowerCase().trim() || '';
    const followUpTerms = ['نسائي', 'أنثى', 'انثى', 'رجالي', 'رجل', 'سعود', 'مصر', 'شام', 'فصح', 'بشري', 'ذكاء', 'غيره', 'غيرها', 'أخرى', 'اخرى'];
    const isVoiceFollowUp = followUpTerms.some(term => q.includes(term)) && priorQ !== '';
    const contextualQ = isVoiceFollowUp ? `${priorQ} ${q}` : q;

    // 1. Pricing / Plans Intent
    if (
      !q.includes('عرض سعر') && (
        q.includes('سعر') || q.includes('اسعار') || q.includes('باقة') || q.includes('باقات') ||
        q.includes('price') || q.includes('pricing') || q.includes('plan') || q.includes('cost')
      )
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

    // 2. Contact / enterprise sales intent
    if (
      q.includes('تواصل') || q.includes('مبيعات') || q.includes('دعم') || q.includes('عرض سعر') ||
      q.includes('contact') || q.includes('sales') || q.includes('support') || q.includes('demo')
    ) {
      analytics.track('sales_contact_requested', { input });
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: lang === 'en'
          ? 'You can send your project details directly to QeemaVoice or request an enterprise demo. Choose the option that suits you:'
          : 'يمكنك إرسال تفاصيل مشروعك مباشرة لفريق قيمة فويس أو طلب عرض تجريبي للمؤسسات. اختر الإجراء المناسب:',
        timestamp: Date.now(),
        cardType: 'contact_sales',
        cardData: {
          targetView: 'contact',
          ctaLabel: lang === 'en' ? 'Open Contact Page' : 'فتح صفحة التواصل'
        },
        suggestedReplies: lang === 'en'
          ? ['Find a Voice', 'View Pricing']
          : ['ابحث عن صوت مناسب', 'الأسعار والباقات']
      };
    }

    // 3. Licensing Intent
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

    // 4. Voice Cloning / Twins Intent
    if (
      q.includes('استنساخ') || q.includes('توأم') || q.includes('صوتي مخصص') || q.includes('بصمة') ||
      q.includes('clone') || q.includes('cloning') || q.includes('twin') || q.includes('custom voice')
    ) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: lang === 'en'
          ? 'Voice cloning and Voice Twins are not available in the current launch phase. I can help you book a certified human voice instead.'
          : 'الاستنساخ والتوأم الصوتي غير متاحين في مرحلة الإطلاق الحالية. يمكنني مساعدتك في اختيار وحجز صوت بشري معتمد بدلاً منهما.',
        timestamp: Date.now(),
        suggestedReplies: lang === 'en'
          ? ['Book a Demo', 'Find Existing Voices', 'Pricing']
          : ['طلب عرض تجريبي (Demo)', 'استعراض الأصوات الجاهزة', 'الأسعار']
      };
    }

    // 5. Voice Search by dialect, gender and use case, with follow-up context.
    let matchedVoices: Voice[] = [];
    let detectedDialect: string | undefined = undefined;

    if (contextualQ.includes('سعود') || contextualQ.includes('خليج') || contextualQ.includes('saudi') || contextualQ.includes('gulf')) {
      detectedDialect = 'gulf';
    } else if (contextualQ.includes('مصر') || contextualQ.includes('egypt')) {
      detectedDialect = 'egyptian';
    } else if (contextualQ.includes('شام') || contextualQ.includes('سور') || contextualQ.includes('لبنان') || contextualQ.includes('اردن') || contextualQ.includes('أردن') || contextualQ.includes('levant') || contextualQ.includes('syria')) {
      detectedDialect = 'levantine';
    } else if (contextualQ.includes('مغرب') || contextualQ.includes('تونس') || contextualQ.includes('جزائر') || contextualQ.includes('maghreb')) {
      detectedDialect = 'maghrebi';
    } else if (contextualQ.includes('فصح') || contextualQ.includes('رسمي') || contextualQ.includes('fusha') || contextualQ.includes('msa')) {
      detectedDialect = 'fusha';
    }

    const detectedGender = (contextualQ.includes('رجل') || contextualQ.includes('رجالي') || contextualQ.includes('ذكر') || contextualQ.includes('male') || contextualQ.includes('man'))
      ? 'male'
      : (contextualQ.includes('امرأة') || contextualQ.includes('نسائي') || contextualQ.includes('انثى') || contextualQ.includes('أنثى') || contextualQ.includes('بنت') || contextualQ.includes('female') || contextualQ.includes('woman'))
      ? 'female'
      : 'all';

    const detectedType = 'human';

    const useCaseMap: Array<[string[], string]> = [
      [['إعلان', 'اعلان', 'advert'], 'إعلانات'],
      [['وثائقي', 'documentary'], 'وثائقيات'],
      [['تعليمي', 'تدريب', 'education'], 'تعليمي'],
      [['رد آلي', 'ivr', 'هاتف'], 'رد آلي'],
      [['بودكاست', 'podcast'], 'بودكاست'],
      [['دوبلاج', 'dubbing'], 'دوبلاج'],
      [['قصة', 'قصص', 'سرد', 'audiobook'], 'قصص']
    ];
    const detectedUseCase = useCaseMap.find(([terms]) => terms.some(term => contextualQ.includes(term)))?.[1];
    const voiceTerms = ['صوت', 'معلق', 'لهجة', 'إعلان', 'اعلان', 'وثائقي', 'تعليمي', 'بودكاست', 'رد آلي', 'دوبلاج', 'voice', 'dialect', 'narrator'];
    const isVoiceIntent = isVoiceFollowUp || voiceTerms.some(term => q.includes(term));

    if (isVoiceIntent) {
      const hasSpecificFilter = Boolean(detectedDialect || detectedGender !== 'all' || detectedUseCase);
      matchedVoices = hasSpecificFilter
        ? await voiceSearchService.searchVoices({
            dialect: detectedDialect as any,
            gender: detectedGender as any,
            type: detectedType as any,
            useCase: detectedUseCase
          })
        : await voiceSearchService.getFeaturedVoices(4);
    }

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

    if (isVoiceIntent) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: lang === 'en'
          ? 'I could not find an exact match. Try changing the dialect, gender, or intended use.'
          : 'لم أجد نتيجة مطابقة تمامًا. جرّب تغيير اللهجة أو جنس الصوت أو نوع الاستخدام.',
        timestamp: Date.now(),
        suggestedReplies: lang === 'en'
          ? ['Saudi male voice', 'Female voice', 'Show all voices']
          : ['صوت سعودي رجالي', 'صوت نسائي', 'اعرض كل الأصوات']
      };
    }

    // 6. General Platform Intro / How it works
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

    // 7. Default Helpful Conversational Response
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
