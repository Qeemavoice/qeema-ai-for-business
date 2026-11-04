import { Company, User, Session, Voice, Generation, UsageRecord, CreditTransaction, AuditLog, Plan, HumanBooking, TalentPayout, SystemSettings, IntegrationSettings, NarratorEarning } from '../types';
import crypto from 'crypto';
import { PLANS } from '../../shared/plans';
import { PLATFORM_COMMISSION_PERCENT, narratorShareOf } from '../../shared/pricing';

class DatabaseStore {
  private static instance: DatabaseStore;

  public companies: Map<string, Company> = new Map();
  public users: Map<string, User> = new Map();
  public voices: Map<string, Voice> = new Map();
  public generations: Map<string, Generation> = new Map();
  public usageRecords: Map<string, UsageRecord> = new Map();
  public narratorEarnings: Map<string, NarratorEarning> = new Map();
  public creditTransactions: CreditTransaction[] = [];
  public companyBalances: Map<string, number> = new Map();
  public audioFiles: Map<string, { buffer: Buffer; mimeType: string; filename: string }> = new Map();
  public auditLogs: AuditLog[] = [];
  public plans: Plan[] = [];
  public humanBookings: Map<string, HumanBooking> = new Map();
  public talentPayouts: Map<string, TalentPayout> = new Map();
  /** Login sessions: token → user */
  public sessions: Map<string, Session> = new Map();
  /** Narrator dashboards data (narrators, samples, contracts…); null until first loaded from the seed */
  public narratorState: Record<string, any> | null = null;
  public systemSettings: SystemSettings = {
    platformCommissionPercent: PLATFORM_COMMISSION_PERCENT,
    elevenLabsStatus: 'operational',
    geminiAiStatus: 'operational',
    cdnStorageStatus: 'operational',
    maintenanceMode: false,
    creditRatePer10kCharsUsd: 4.0,
    paymentEscrowModel: 'direct_100_percent',
    defaultCurrency: 'USD',
    stripeFeePercent: 5
  };
  // ponytail: in-memory only; production reads these from env / a secrets manager
  public integrations: IntegrationSettings = {
    stripe: { enabled: true, displayName: 'بطاقة الائتمان/الخصم', testMode: true, livePublishableKey: '', liveSecretKey: '', testPublishableKey: '', testSecretKey: '' },
    smtp: { driver: 'smtp', fromName: 'Qeemavoice', fromAddress: 'info@qeemavoice.com', host: '', port: 465, username: '', password: '', encryption: 'SSL' }
  };

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): DatabaseStore {
    if (!DatabaseStore.instance) {
      DatabaseStore.instance = new DatabaseStore();
    }
    return DatabaseStore.instance;
  }

  private seedInitialData() {
    // 1. Seed Plans
    this.plans = PLANS;

    // 2. Seed Companies
    const comp1: Company = {
      id: 'comp-horizon',
      name: 'وكالة أفق الإعلامية | Horizon Media Agency',
      industry: 'Advertising & Marketing',
      country: 'المملكة العربية السعودية',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      planId: 'plan-starter'
    };
    const comp2: Company = {
      id: 'comp-tadreeb',
      name: 'منصة تدريب الذكية | Tadreeb EdTech',
      industry: 'E-learning & Training',
      country: 'الإمارات العربية المتحدة',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      planId: 'plan-creator'
    };
    const comp3: Company = {
      id: 'comp-etihad',
      name: 'الاتحاد للتجارة الرقمية | Etihad E-commerce',
      industry: 'Retail & E-commerce',
      country: 'مصر',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      planId: 'plan-starter'
    };

    this.companies.set(comp1.id, comp1);
    this.companies.set(comp2.id, comp2);
    this.companies.set(comp3.id, comp3);

    // Initial Balances (1 Credit = 1 Char)
    this.companyBalances.set(comp1.id, 24500);
    this.companyBalances.set(comp2.id, 185000);
    this.companyBalances.set(comp3.id, 12000);

    // Initial Ledger Entries
    this.creditTransactions.push(
      {
        id: crypto.randomUUID(),
        companyId: comp1.id,
        userId: 'usr-ahmad',
        delta: 50000,
        balanceAfter: 50000,
        reason: 'signup_bonus',
        description: 'رصيد الترحيب بالاشتراك في باقة Business Starter',
        createdAt: comp1.createdAt
      },
      {
        id: crypto.randomUUID(),
        companyId: comp1.id,
        userId: 'usr-ahmad',
        delta: -25500,
        balanceAfter: 24500,
        reason: 'generation',
        description: 'إنتاج إعلانات موسم العودة للمدارس (حملات رقمية)',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: crypto.randomUUID(),
        companyId: comp2.id,
        userId: 'usr-laila',
        delta: 250000,
        balanceAfter: 250000,
        reason: 'purchase',
        description: 'شراء باقة Business Pro السنوية',
        createdAt: comp2.createdAt
      }
    );

    // 3. Seed Users
    const user1: User = {
      id: 'usr-ahmad',
      email: 'ahmad@horizon-media.sa',
      name: 'أحمد الغامدي',
      companyId: comp1.id,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: comp1.createdAt
    };
    const user2: User = {
      id: 'usr-laila',
      email: 'laila@tadreeb.ae',
      name: 'ليلى منصور',
      companyId: comp2.id,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: comp2.createdAt
    };
    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);

    // 3b. Extra customers (admin customers page)
    const day = 86400000;
    const extra: { c: Company; balance: number; user: Omit<User, 'companyId' | 'createdAt'> }[] = [
      { c: { id: 'comp-nabd', name: 'نبض للبودكاست | Nabd Podcasts', industry: 'Media & Podcasting', country: 'الأردن', createdAt: new Date(Date.now() - 55 * day).toISOString(), planId: 'plan-creator', phone: '+962 79 555 0142' },
        balance: 41200, user: { id: 'usr-omar', email: 'omar@nabd.fm', name: 'عمر الخطيب', role: 'admin' } },
      { c: { id: 'comp-salam-bank', name: 'مصرف السلام | Al Salam Bank', industry: 'Banking & Finance', country: 'البحرين', createdAt: new Date(Date.now() - 90 * day).toISOString(), planId: 'plan-enterprise', phone: '+973 17 000 123' },
        balance: 820000, user: { id: 'usr-huda', email: 'huda.k@alsalam.bh', name: 'هدى الكعبي', role: 'admin' } },
      { c: { id: 'comp-souq-kids', name: 'سوق الأطفال | Souq Kids', industry: 'Retail & E-commerce', country: 'الكويت', createdAt: new Date(Date.now() - 7 * day).toISOString(), planId: 'plan-free' },
        balance: 5000, user: { id: 'usr-fahad', email: 'fahad@souqkids.com', name: 'فهد العنزي', role: 'admin' } },
      { c: { id: 'comp-dalil', name: 'دليل السياحة | Dalil Travel', industry: 'Travel & Tourism', country: 'المغرب', createdAt: new Date(Date.now() - 140 * day).toISOString(), planId: 'plan-starter', status: 'suspended',
          notes: [{ id: 'note-1', text: 'تم إيقاف الحساب مؤقتاً لتعثر السداد. التواصل مع المحاسبة قبل إعادة التفعيل.', author: 'admin', createdAt: new Date(Date.now() - 12 * day).toISOString() }] },
        balance: 300, user: { id: 'usr-yassine', email: 'yassine@dalil.ma', name: 'ياسين بنعلي', role: 'admin' } },
      { c: { id: 'comp-maryam', name: 'مريم حسن (صانعة محتوى)', industry: 'Content Creator', country: 'مصر', createdAt: new Date(Date.now() - 3 * day).toISOString(), planId: 'plan-free' },
        balance: 4100, user: { id: 'usr-maryam', email: 'maryam.creates@gmail.com', name: 'مريم حسن', role: 'admin' } }
    ];
    for (const { c, balance, user } of extra) {
      this.companies.set(c.id, c);
      this.companyBalances.set(c.id, balance);
      this.users.set(user.id, { ...user, companyId: c.id, createdAt: c.createdAt });
      this.creditTransactions.push({ id: crypto.randomUUID(), companyId: c.id, userId: user.id, delta: balance, balanceAfter: balance, reason: 'signup_bonus', description: 'الرصيد الافتتاحي للحساب', createdAt: c.createdAt });
    }

    // 4. Seed Voices (Both Human and AI)
    const seedVoices: Voice[] = [
      // Human Voices
      {
        id: 'voice-human-tariq',
        type: 'human',
        name: 'طارق.ش',
        nameEn: 'Tariq Al-Shammari',
        gender: 'male',
        language: 'ar',
        dialect: 'gulf',
        dialectLabel: 'سعودي - نجدي / فصحى رنانة',
        style: 'commercial',
        styleLabel: 'وقور، واثق، دافئ ومصرفي',
        useCases: ['ads', 'presentations', 'ivr'],
        provider: 'human_marketplace',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
        isActive: true,
        isFeatured: true,
        bookingsCount: 184,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      },
      {
        id: 'voice-human-sara',
        type: 'human',
        name: 'سارة.د',
        nameEn: 'Sara Al-Dawsari',
        gender: 'female',
        language: 'ar',
        dialect: 'gulf',
        dialectLabel: 'خليجي معاصر / حجازي ناعم',
        style: 'conversational',
        styleLabel: 'مرح، تفاعلي، دقيق وترحيبي',
        useCases: ['elearning', 'ivr', 'social_media'],
        provider: 'human_marketplace',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
        isActive: true,
        isFeatured: true,
        bookingsCount: 236,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      },
      {
        id: 'voice-human-karim',
        type: 'human',
        name: 'كريم.م',
        nameEn: 'Karim Al-Mansoor',
        gender: 'male',
        language: 'ar',
        dialect: 'levantine',
        dialectLabel: 'شامي سوري / فصحى وثائقية',
        style: 'storytelling',
        styleLabel: 'سينمائي، مخملي، روائي ومؤثر',
        useCases: ['podcasts', 'documentary', 'presentations'],
        provider: 'human_marketplace',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
        isActive: true,
        isFeatured: true,
        bookingsCount: 142,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      },
      {
        id: 'voice-human-nour',
        type: 'human',
        name: 'نور.إ',
        nameEn: 'Nour Al-Huda',
        gender: 'female',
        language: 'ar',
        dialect: 'egyptian',
        dialectLabel: 'مصري أبيض / إعلاني حديث',
        style: 'energetic',
        styleLabel: 'عفوي، مقنع، وسريع البديهة',
        useCases: ['ads', 'social_media', 'elearning'],
        provider: 'human_marketplace',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
        isActive: true,
        isFeatured: true,
        bookingsCount: 195,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      },
      {
        id: 'voice-human-amin',
        type: 'human',
        name: 'أمين.ف',
        nameEn: 'Amin Al-Fassi',
        gender: 'male',
        language: 'ar',
        dialect: 'maghrebi',
        dialectLabel: 'مغاربي مهذب / فرنسي عربي',
        style: 'corporate',
        styleLabel: 'فخم، راقٍ، ومتعدد اللغات',
        useCases: ['ads', 'corporate', 'documentary'],
        provider: 'human_marketplace',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
        isActive: true,
        bookingsCount: 88,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      },

      // AI Voices (Certified Arabic Voice Models)
      {
        id: 'voice-ai-tariq-pro',
        type: 'ai',
        name: 'طارق AI (التوأم الصوتي)',
        nameEn: 'Tariq AI Pro',
        gender: 'male',
        language: 'ar',
        dialect: 'gulf',
        dialectLabel: 'سعودي نجدي ورسمي',
        style: 'commercial',
        styleLabel: 'إعلاني، رصين، وبنكي موثق',
        useCases: ['ads', 'presentations', 'ivr'],
        provider: 'elevenlabs',
        providerVoiceId: 'pNInz6obpgDQGcFmaJgB', // Adam or custom voice
        previewUrl: '',
        isActive: true,
        isFeatured: true,
        humanTalentId: 'voice-human-tariq',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      },
      {
        id: 'voice-ai-sara-tech',
        type: 'ai',
        name: 'سارة AI (التفاعلية)',
        nameEn: 'Sara AI Modern',
        gender: 'female',
        language: 'ar',
        dialect: 'gulf',
        dialectLabel: 'خليجي وحجازي معاصر',
        style: 'conversational',
        styleLabel: 'تفاعلي، ودود، وملهم للشركات',
        useCases: ['elearning', 'ivr', 'social_media'],
        provider: 'elevenlabs',
        providerVoiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
        previewUrl: '',
        isActive: true,
        isFeatured: true,
        humanTalentId: 'voice-human-sara',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      },
      {
        id: 'voice-ai-nour-ads',
        type: 'ai',
        name: 'نور AI (الإعلانات الرقمية)',
        nameEn: 'Nour AI Ads',
        gender: 'female',
        language: 'ar',
        dialect: 'egyptian',
        dialectLabel: 'لهجة مصرية بيضاء سريعة',
        style: 'energetic',
        styleLabel: 'حماسي، عفوي ومناسب للريلز والإعلانات',
        useCases: ['ads', 'social_media', 'elearning'],
        provider: 'elevenlabs',
        providerVoiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella
        previewUrl: '',
        isActive: true,
        isFeatured: true,
        humanTalentId: 'voice-human-nour',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      },
      {
        id: 'voice-ai-karim-narrator',
        type: 'ai',
        name: 'كريم AI (الراوي المخملي)',
        nameEn: 'Karim AI Story',
        gender: 'male',
        language: 'ar',
        dialect: 'levantine',
        dialectLabel: 'شامي سوري وفصحى سينمائية',
        style: 'storytelling',
        styleLabel: 'روائي، عميق ومؤثر جداً',
        useCases: ['podcasts', 'documentary', 'presentations'],
        provider: 'elevenlabs',
        providerVoiceId: 'ErXwobaYiN019PkySvjV', // Antoni
        previewUrl: '',
        isActive: true,
        isFeatured: true,
        humanTalentId: 'voice-human-karim',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      },
      {
        id: 'voice-ai-ziyad-fusha',
        type: 'ai',
        name: 'زياد الفصيح AI',
        nameEn: 'Ziyad Fusha AI',
        gender: 'male',
        language: 'ar',
        dialect: 'fusha',
        dialectLabel: 'لغة عربية فصحى معيارية',
        style: 'corporate',
        styleLabel: 'إخباري، مؤسسي، ودقيق النطق والتشكيل',
        useCases: ['presentations', 'elearning', 'documentary'],
        provider: 'qeema_acoustic',
        previewUrl: '',
        isActive: true,
        isFeatured: false,
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      },
      {
        id: 'voice-ai-sofia-maghrebi',
        type: 'ai',
        name: 'صوفيا AI (المغاربي الأنيق)',
        nameEn: 'Sofia Maghrebi AI',
        gender: 'female',
        language: 'ar',
        dialect: 'maghrebi',
        dialectLabel: 'لهجة مغاربية ناعمة للمنتجات الفاخرة',
        style: 'calm',
        styleLabel: 'هادئ، فخم، وأنيق للعلامات التجارية',
        useCases: ['ads', 'corporate', 'social_media'],
        provider: 'qeema_acoustic',
        previewUrl: '',
        isActive: true,
        isFeatured: false,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      }
    ];

    seedVoices.forEach(v => this.voices.set(v.id, v));

    // 5. Seed some past Generations for Horizon Media
    const gen1: Generation = {
      id: 'gen-sample-1',
      companyId: comp1.id,
      userId: user1.id,
      voiceId: 'voice-ai-tariq-pro',
      voiceName: 'طارق AI (التوأم الصوتي)',
      voiceType: 'ai',
      dialect: 'gulf',
      text: 'نبتكر حلول الغد بثقة اليوم، لأن طموحنا لا يعرف المستحيل في أرض العطاء والتطور المستمر.',
      textChars: 85,
      settings: { speed: 1.0, stability: 0.7, style: 0.5 },
      provider: 'qeema_acoustic',
      model: 'arabic-acoustic-neural-f0',
      audioUrl: '/api/v1/storage/audio/gen-sample-1',
      storagePath: 'storage/generations/gen-sample-1.wav',
      durationSeconds: 6.2,
      status: 'completed',
      creditsConsumed: 85,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    };

    const gen2: Generation = {
      id: 'gen-sample-2',
      companyId: comp1.id,
      userId: user1.id,
      voiceId: 'voice-ai-nour-ads',
      voiceName: 'نور AI (الإعلانات الرقمية)',
      voiceType: 'ai',
      dialect: 'egyptian',
      text: 'جاهز تبدأ مشوارك الصح؟ مع خدمتنا الجديدة هتوفر وقتك وفلوسك بضغطة زر واحدة ومن غير أي مجهود!',
      textChars: 93,
      settings: { speed: 1.1, stability: 0.6, style: 0.8 },
      provider: 'qeema_acoustic',
      model: 'arabic-acoustic-neural-f0',
      audioUrl: '/api/v1/storage/audio/gen-sample-2',
      storagePath: 'storage/generations/gen-sample-2.wav',
      durationSeconds: 6.8,
      status: 'completed',
      creditsConsumed: 93,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
    };

    this.generations.set(gen1.id, gen1);
    this.generations.set(gen2.id, gen2);

    this.usageRecords.set(gen1.id, {
      id: crypto.randomUUID(),
      companyId: comp1.id,
      userId: user1.id,
      generationId: gen1.id,
      feature: 'tts',
      provider: gen1.provider,
      model: gen1.model,
      inputUnits: gen1.textChars,
      outputUnits: gen1.durationSeconds,
      creditsConsumed: gen1.creditsConsumed,
      costUsd: 0.0004,
      createdAt: gen1.createdAt
    });

    this.usageRecords.set(gen2.id, {
      id: crypto.randomUUID(),
      companyId: comp1.id,
      userId: user1.id,
      generationId: gen2.id,
      feature: 'tts',
      provider: gen2.provider,
      model: gen2.model,
      inputUnits: gen2.textChars,
      outputUnits: gen2.durationSeconds,
      creditsConsumed: gen2.creditsConsumed,
      costUsd: 0.0005,
      createdAt: gen2.createdAt
    });

    // 6. Seed Human Voice Bookings (Direct 100% Escrow Model)
    const booking1: HumanBooking = {
      id: 'BOK-8921',
      companyId: comp1.id,
      companyName: comp1.name,
      talentId: 'voice-human-tariq',
      sampleId: 'human-sample-1',
      talentName: 'محمد.ع',
      scriptText: 'في عالم يتسارع فيه الابتكار، تصنع الرؤية الفارق. معنا تبدأ رحلة جديدة نحو آفاق غير محدودة من الإنجاز والتميز.',
      deadlineDays: 2,
      usageLicense: 'commercial_ads',
      notes: 'المطلوب نبرة وقورة ورنانة تناسب إعلانات البنوك والقطاع المالي.',
      priceUsd: 450,
      review: { rating: 5, text: 'صوت رصين وتسليم قبل الموعد، والتعديل الوحيد نُفذ خلال ساعات.', author: 'أحمد الغامدي', createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), status: 'approved' },
      talentPayoutUsd: narratorShareOf(450),
      paymentModel: 'direct_escrow_100',
      status: 'approved',
      deliverableAudioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 86400000).toISOString()
    };

    const booking2: HumanBooking = {
      id: 'BOK-9043',
      companyId: comp2.id,
      companyName: comp2.name,
      talentId: 'voice-human-sara',
      sampleId: 'human-sample-2',
      talentName: 'سارة.خ',
      scriptText: 'مرحباً بكم في دورة التحول الرقمي المتقدمة للمؤسسات. سنخوض معاً أهم المفاهيم والاستراتيجيات لتطوير بيئة العمل.',
      deadlineDays: 3,
      usageLicense: 'elearning',
      notes: 'تسجيل تعليمي دقيق وواضح، مخارج حروف فصيحة وهادئة.',
      priceUsd: 640,
      review: { rating: 4, text: 'مخارج حروف واضحة جداً، نحتاج فقط إيقاعاً أسرع قليلاً في الفصل الثاني.', author: 'ليلى منصور', createdAt: new Date(Date.now() - 12 * 3600000).toISOString(), status: 'pending' },
      talentPayoutUsd: narratorShareOf(640),
      paymentModel: 'direct_escrow_100',
      status: 'delivered',
      deliverableAudioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
    };

    const booking3: HumanBooking = {
      id: 'BOK-9182',
      companyId: comp1.id,
      companyName: comp1.name,
      talentId: 'voice-human-karim',
      sampleId: 'human-sample-6',
      talentName: 'فيصل.د',
      scriptText: 'من عمق التاريخ إلى مشارف الغد، كانت هذه الأرض مهد الحضارات وحكاية لا تنتهي من العطاء والمجد.',
      deadlineDays: 4,
      usageLicense: 'broadcast_tv',
      notes: 'أداء وثائقي ملحمي لفيلم الشركة السنوي.',
      priceUsd: 950,
      talentPayoutUsd: narratorShareOf(950),
      paymentModel: 'direct_escrow_100',
      status: 'in_studio',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    const booking4: HumanBooking = {
      id: 'BOK-9290',
      companyId: comp3.id,
      companyName: comp3.name,
      talentId: 'voice-human-nour',
      sampleId: 'human-sample-4',
      talentName: 'نور.إ',
      scriptText: 'عروض الجمعة البيضاء وصلت! خصومات تصل حتى 70% على جميع المنتجات الإلكترونية. لا تفوّت الفرصة وتسوق الآن.',
      deadlineDays: 1,
      usageLicense: 'commercial_ads',
      notes: 'إيقاع إعلاني سريع، شبابي وعفوي جذاب.',
      priceUsd: 320,
      talentPayoutUsd: narratorShareOf(320),
      paymentModel: 'direct_escrow_100',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.humanBookings.set(booking1.id, booking1);
    this.humanBookings.set(booking2.id, booking2);
    this.humanBookings.set(booking3.id, booking3);
    this.humanBookings.set(booking4.id, booking4);

    // 7. Seed Talent Payouts Ledger (USD)
    const payout1: TalentPayout = {
      talentId: 'voice-human-tariq',
      talentName: 'طارق.ش',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      dialect: 'سعودي - نجدي',
      completedBookingsCount: 14,
      totalEarningsUsd: 5280,
      paidOutUsd: 4960,
      pendingBalanceUsd: 320,
      iban: 'SA4480000456123456789012',
      bankName: 'مصرف الراجحي',
      status: 'payout_scheduled',
      lastPayoutDate: '2026-08-28'
    };

    const payout2: TalentPayout = {
      talentId: 'voice-human-sara',
      talentName: 'سارة.د',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      dialect: 'خليجي معاصر',
      completedBookingsCount: 19,
      totalEarningsUsd: 7100,
      paidOutUsd: 6620,
      pendingBalanceUsd: 480,
      iban: 'SA1210000009876543210987',
      bankName: 'البنك الأهلي السعودي SNB',
      status: 'active',
      lastPayoutDate: '2026-08-30'
    };

    const payout3: TalentPayout = {
      talentId: 'voice-human-karim',
      talentName: 'كريم.م',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      dialect: 'شامي سوري',
      completedBookingsCount: 8,
      totalEarningsUsd: 3800,
      paidOutUsd: 3087.5,
      pendingBalanceUsd: 712.5,
      iban: 'AE890330000001234567890',
      bankName: 'بنك الإمارات دبي الوطني',
      status: 'active',
      lastPayoutDate: '2026-08-20'
    };

    const payout4: TalentPayout = {
      talentId: 'voice-human-nour',
      talentName: 'نور.إ',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      dialect: 'مصري أبيض',
      completedBookingsCount: 11,
      totalEarningsUsd: 3600,
      paidOutUsd: 3360,
      pendingBalanceUsd: 240,
      iban: 'EG380002000100000012345678901',
      bankName: 'البنك التجاري الدولي CIB',
      status: 'active',
      lastPayoutDate: '2026-08-25'
    };

    this.talentPayouts.set(payout1.talentId, payout1);
    this.talentPayouts.set(payout2.talentId, payout2);
    this.talentPayouts.set(payout3.talentId, payout3);
    this.talentPayouts.set(payout4.talentId, payout4);
  }

  // Helper Methods
  public getCompany(companyId: string): Company | undefined {
    return this.companies.get(companyId);
  }

  public getCompanyBalance(companyId: string): number {
    return this.companyBalances.get(companyId) ?? 0;
  }

  public deductCredits(companyId: string, userId: string, amount: number, referenceId: string, description: string): boolean {
    const current = this.getCompanyBalance(companyId);
    if (current < amount) {
      return false;
    }
    const newBalance = current - amount;
    this.companyBalances.set(companyId, newBalance);

    this.creditTransactions.unshift({
      id: crypto.randomUUID(),
      companyId,
      userId,
      delta: -amount,
      balanceAfter: newBalance,
      reason: 'generation',
      referenceId,
      description,
      createdAt: new Date().toISOString()
    });

    return true;
  }

  public addCredits(companyId: string, userId: string, amount: number, reason: CreditTransaction['reason'], description: string, referenceId?: string): number {
    const current = this.getCompanyBalance(companyId);
    const newBalance = current + amount;
    this.companyBalances.set(companyId, newBalance);

    this.creditTransactions.unshift({
      id: crypto.randomUUID(),
      companyId,
      userId,
      delta: amount,
      balanceAfter: newBalance,
      reason,
      referenceId,
      description,
      createdAt: new Date().toISOString()
    });

    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      companyId,
      actor: userId,
      action: `GRANT_CREDITS: +${amount}`,
      metadata: { reason, newBalance },
      createdAt: new Date().toISOString()
    });

    return newBalance;
  }

  public updateBookingStatus(bookingId: string, status: HumanBooking['status'], deliverableUrl?: string): HumanBooking | null {
    const booking = this.humanBookings.get(bookingId);
    if (!booking) return null;
    booking.status = status;
    booking.updatedAt = new Date().toISOString();
    if (deliverableUrl) {
      booking.deliverableAudioUrl = deliverableUrl;
    }

    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      companyId: booking.companyId,
      actor: 'admin',
      action: `BOOKING_STATUS_UPDATE: ${booking.id} -> ${status}`,
      metadata: { bookingId, status, deliverableUrl },
      createdAt: new Date().toISOString()
    });

    return booking;
  }

  public processTalentPayout(talentId: string, amount?: number): TalentPayout | null {
    const payout = this.talentPayouts.get(talentId);
    if (!payout) return null;
    const payoutAmount = amount ?? payout.pendingBalanceUsd;
    payout.paidOutUsd += payoutAmount;
    payout.pendingBalanceUsd = Math.max(0, payout.pendingBalanceUsd - payoutAmount);
    payout.lastPayoutDate = new Date().toISOString().split('T')[0];
    payout.status = 'settled';

    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      companyId: 'system',
      actor: 'admin',
      action: `PAYOUT_PROCESSED: ${payout.talentName} -> $${payoutAmount} USD`,
      metadata: { talentId, payoutAmount, remainingPending: payout.pendingBalanceUsd },
      createdAt: new Date().toISOString()
    });

    return payout;
  }
}

export const db = DatabaseStore.getInstance();
