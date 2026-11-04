import { 
  Narrator, 
  VoiceContract, 
  AIVoice, 
  UsageEvent, 
  AuditLog, 
  UseCase,
  AIVoiceStatus,
  VoiceSample,
  VoiceSampleStatus,
  VoiceOverBooking,
  VoiceOverBookingStatus
} from '../types';

const USE_MOCK = true;

// Pre-seeded narrators
const INITIAL_NARRATORS: Narrator[] = [
  {
    id: 'narrator_tareq_01',
    displayName: 'طارق الشمري',
    phone: '+966555124567',
    email: 'tareq.shammary@qeema.voice',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    dialects: ['سعودي نجدي', 'فصحى معاصرة', 'خليجي عام'],
    status: 'active',
    claimToken: 'token_tareq_active_2026',
    claimTokenExpiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    kycStatus: 'approved',
    bio: 'معلق صوتي إذاعي معتمد لأكثر من 12 عاماً، صوت جهوري فخم للهويات الوطنية والإعلانات الكبرى للشركات القيادية في المملكة.',
    rates: {
      standardCommercialUsd: 380,
      perWordRateUsd: 0.45,
      hourlyLiveDirectingUsd: 150
    },
    sampleAudioUrl: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3'
  },
  {
    id: 'narrator_sara_02',
    displayName: 'سارة الدوسري',
    phone: '+966504891122',
    email: 'sara.aldosari@qeema.voice',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    dialects: ['سعودي حجازي', 'فصحى وثائقية'],
    status: 'invited',
    claimToken: 'token_sara_invite_8891',
    claimTokenExpiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    kycStatus: 'none',
    bio: 'نبرة حيوية، دافئة وملهمة. متخصصة في الإعلانات التفاعلية وتطبيقات التقنية والكتب المسموعة.',
    rates: {
      standardCommercialUsd: 320,
      perWordRateUsd: 0.40,
      hourlyLiveDirectingUsd: 120
    },
    sampleAudioUrl: 'https://cdn.freesound.org/previews/387/387641_7255533-lq.mp3'
  },
  {
    id: 'narrator_karim_03',
    displayName: 'كريم المنصور',
    phone: '+971501239988',
    email: 'karim.almansour@qeema.voice',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    dialects: ['خليجي إماراتي', 'فصحى رسمية'],
    status: 'unclaimed',
    claimToken: 'token_karim_unclaimed_4412',
    claimTokenExpiresAt: new Date(Date.now() + 3 * 86400000).toISOString(),
    kycStatus: 'none',
    bio: 'معلق إعلاني رسمي للمؤتمرات الدولية والبرامج الوثائقية والردود الآلية للقطاع البنكي.',
    rates: {
      standardCommercialUsd: 420,
      perWordRateUsd: 0.50,
      hourlyLiveDirectingUsd: 180
    },
    sampleAudioUrl: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3'
  },
  {
    id: 'narrator_nour_04',
    displayName: 'نور الهدى إبراهيم',
    phone: '+201012345678',
    email: 'nour.ibrahim@qeema.voice',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    dialects: ['مصري تسويقي', 'فصحى إذاعية'],
    status: 'unclaimed',
    claimToken: 'token_nour_claim_5531',
    claimTokenExpiresAt: new Date(Date.now() - 2 * 86400000).toISOString(), // expired token example!
    kycStatus: 'none',
    bio: 'صوت شبابي مبهج وسريع ومتقن، متخصص في حملات السوشيال ميديا وتطبيقات التوصيل والتعليم التفاعلي.',
    rates: {
      standardCommercialUsd: 260,
      perWordRateUsd: 0.35,
      hourlyLiveDirectingUsd: 100
    },
    sampleAudioUrl: 'https://cdn.freesound.org/previews/387/387641_7255533-lq.mp3'
  }
];

// Seeded AI Voices
const INITIAL_AI_VOICES: Record<string, AIVoice> = {
  narrator_tareq_01: {
    id: 'ai_voice_tareq_01',
    narratorId: 'narrator_tareq_01',
    contractId: 'contract_tareq_2026',
    elevenLabsVoiceId: 'el_voice_ar_tareq_fast_clone_v2',
    dialect: 'سعودي نجدي',
    status: 'published',
    consentRecordingUrl: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
    sampleRecordingUrls: ['/mock/sample_tareq_01.wav'],
    previewUrls: [
      'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
      'https://cdn.freesound.org/previews/387/387641_7255533-lq.mp3'
    ],
    publishedAt: '2026-02-15T10:00:00Z',
    clonedAt: '2026-02-15T09:45:00Z',
    qualityMetrics: {
      durationSeconds: 84,
      clippingDetected: false,
      noiseScore: 'excellent',
      isClean: true
    }
  },
  narrator_karim_03: {
    id: 'ai_voice_karim_03',
    narratorId: 'narrator_karim_03',
    contractId: 'contract_karim_2026',
    elevenLabsVoiceId: 'el_voice_ar_karim_fast_clone_v1',
    dialect: 'خليجي إماراتي',
    status: 'paused',
    consentRecordingUrl: 'https://cdn.freesound.org/previews/387/387641_7255533-lq.mp3',
    sampleRecordingUrls: ['/mock/sample_karim_01.wav'],
    previewUrls: [
      'https://cdn.freesound.org/previews/387/387641_7255533-lq.mp3'
    ],
    publishedAt: '2026-01-20T12:00:00Z',
    clonedAt: '2026-01-20T11:30:00Z',
    qualityMetrics: {
      durationSeconds: 92,
      clippingDetected: false,
      noiseScore: 'excellent',
      isClean: true
    }
  }
};

// Seeded Voice Contracts
const INITIAL_CONTRACTS: Record<string, VoiceContract> = {
  contract_tareq_2026: {
    id: 'contract_tareq_2026',
    narratorId: 'narrator_tareq_01',
    version: '1.2.0',
    allowedUseCases: ['ads', 'corporate', 'elearning', 'ivr', 'documentary', 'podcast', 'social', 'audiobook'],
    blockedUseCases: ['political', 'religious', 'adult', 'gambling', 'impersonation'],
    noticePeriodDays: 365,
    revenueSharePercent: 40,
    signedAt: '2026-02-15T09:30:00Z',
    signatureName: 'طارق بن عبدالعزيز الشمري',
    ipAddress: '151.254.12.89'
  },
  contract_karim_2026: {
    id: 'contract_karim_2026',
    narratorId: 'narrator_karim_03',
    version: '1.0.0',
    allowedUseCases: ['ads', 'corporate', 'ivr', 'documentary'],
    blockedUseCases: ['political', 'religious', 'adult', 'gambling', 'impersonation'],
    noticePeriodDays: 180,
    revenueSharePercent: 40,
    signedAt: '2026-01-20T11:00:00Z',
    signatureName: 'كريم المنصور',
    ipAddress: '86.96.12.44'
  }
};

// Seeded Usage Events (amounts in USD)
const INITIAL_USAGE_EVENTS: UsageEvent[] = [
  {
    id: 'use_ev_991',
    aiVoiceId: 'ai_voice_tareq_01',
    clientId: 'comp_aramco_01',
    clientName: 'أرامكو السعودية',
    useCase: 'corporate',
    characters: 4520,
    grossAmount: 18.08,
    narratorEarning: 8.14,
    createdAt: '2026-10-18T07:15:00Z'
  },
  {
    id: 'use_ev_992',
    aiVoiceId: 'ai_voice_tareq_01',
    clientId: 'comp_stc_02',
    clientName: 'مجموعة stc',
    useCase: 'ads',
    characters: 12400,
    grossAmount: 62.00,
    narratorEarning: 27.90,
    createdAt: '2026-10-17T14:30:00Z'
  },
  {
    id: 'use_ev_993',
    aiVoiceId: 'ai_voice_tareq_01',
    clientId: 'comp_alrajhi_03',
    clientName: 'مصرف الراجحي',
    useCase: 'ivr',
    characters: 8900,
    grossAmount: 35.60,
    narratorEarning: 16.02,
    createdAt: '2026-10-16T11:05:00Z'
  },
  {
    id: 'use_ev_994',
    aiVoiceId: 'ai_voice_tareq_01',
    clientId: 'comp_neom_04',
    clientName: 'نيوم للتطوير',
    useCase: 'documentary',
    characters: 28500,
    grossAmount: 142.50,
    narratorEarning: 64.12,
    createdAt: '2026-10-15T09:20:00Z'
  },
  {
    id: 'use_ev_995',
    aiVoiceId: 'ai_voice_tareq_01',
    clientId: 'comp_saudia_05',
    clientName: 'الخطوط السعودية',
    useCase: 'social',
    characters: 6200,
    grossAmount: 31.00,
    narratorEarning: 13.95,
    createdAt: '2026-10-12T16:45:00Z'
  },
  {
    id: 'use_ev_996',
    aiVoiceId: 'ai_voice_tareq_01',
    clientId: 'comp_jarir_06',
    clientName: 'جرير للتسويق',
    useCase: 'audiobook',
    characters: 42100,
    grossAmount: 210.50,
    narratorEarning: 94.72,
    createdAt: '2026-10-08T18:10:00Z'
  },
  {
    id: 'use_ev_997',
    aiVoiceId: 'ai_voice_tareq_01',
    clientId: 'comp_elm_07',
    clientName: 'شركة علم',
    useCase: 'elearning',
    characters: 15300,
    grossAmount: 76.50,
    narratorEarning: 34.42,
    createdAt: '2026-09-28T13:20:00Z'
  },
  {
    id: 'use_ev_998',
    aiVoiceId: 'ai_voice_karim_03',
    clientId: 'comp_emirates_01',
    clientName: 'طيران الإمارات',
    useCase: 'corporate',
    characters: 8400,
    grossAmount: 42.00,
    narratorEarning: 16.80,
    createdAt: '2026-10-14T10:00:00Z'
  },
  {
    id: 'use_ev_999',
    aiVoiceId: 'ai_voice_karim_03',
    clientId: 'comp_adnoc_02',
    clientName: 'أدنوك',
    useCase: 'ads',
    characters: 18200,
    grossAmount: 91.00,
    narratorEarning: 36.40,
    createdAt: '2026-10-10T15:30:00Z'
  },
  {
    id: 'use_ev_1000',
    aiVoiceId: 'ai_voice_tareq_01',
    clientId: 'comp_stc_03',
    clientName: 'stc السعودية',
    useCase: 'ivr',
    characters: 11000,
    grossAmount: 55.00,
    narratorEarning: 24.75,
    createdAt: '2026-09-19T14:10:00Z'
  },
  {
    id: 'use_ev_1001',
    aiVoiceId: 'ai_voice_tareq_01',
    clientId: 'comp_saudia_05',
    clientName: 'الخطوط السعودية',
    useCase: 'podcast',
    characters: 19400,
    grossAmount: 97.00,
    narratorEarning: 43.65,
    createdAt: '2026-09-05T08:30:00Z'
  },
  {
    id: 'use_ev_1002',
    aiVoiceId: 'ai_voice_tareq_01',
    clientId: 'comp_aramco_01',
    clientName: 'أرامكو السعودية',
    useCase: 'corporate',
    characters: 32000,
    grossAmount: 160.00,
    narratorEarning: 72.00,
    createdAt: '2026-08-22T11:00:00Z'
  },
  {
    id: 'use_ev_1003',
    aiVoiceId: 'ai_voice_tareq_01',
    clientId: 'comp_jarir_06',
    clientName: 'جرير للتسويق',
    useCase: 'ads',
    characters: 14200,
    grossAmount: 71.00,
    narratorEarning: 31.95,
    createdAt: '2026-08-11T16:45:00Z'
  },
  {
    id: 'use_ev_1004',
    aiVoiceId: 'ai_voice_karim_03',
    clientId: 'comp_dubai_08',
    clientName: 'سياحة دبي',
    useCase: 'social',
    characters: 9500,
    grossAmount: 47.50,
    narratorEarning: 19.00,
    createdAt: '2026-09-12T10:15:00Z'
  },
  {
    id: 'use_ev_1005',
    aiVoiceId: 'ai_voice_karim_03',
    clientId: 'comp_almarai_09',
    clientName: 'المراعي',
    useCase: 'audiobook',
    characters: 24000,
    grossAmount: 120.00,
    narratorEarning: 48.00,
    createdAt: '2026-08-14T13:40:00Z'
  }
];

// Pre-seeded Voice Samples (2 per narrator so 1 slot is open for testing up to 3 samples max, always with price)
const INITIAL_VOICE_SAMPLES: VoiceSample[] = [
  // Tareq Al-Shammary (2 samples: 1 published, 1 pending_review)
  {
    id: 'sample_tareq_01',
    narratorId: 'narrator_tareq_01',
    title: 'إعلان وطني فاخر - يوم التأسيس',
    category: 'إعلان',
    dialect: 'سعودي نجدي',
    audioUrl: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
    durationSec: 42,
    pricePerMinute: 85,
    status: 'published',
    createdAt: '2026-08-10T10:00:00Z'
  },
  {
    id: 'sample_tareq_02',
    narratorId: 'narrator_tareq_01',
    title: 'فيديو تعريفي لشركة تقنية سحابية',
    category: 'فيديو شركة',
    dialect: 'فصحى معاصرة',
    audioUrl: 'https://cdn.freesound.org/previews/387/387641_7255533-lq.mp3',
    durationSec: 75,
    pricePerMinute: 90,
    status: 'pending_review',
    createdAt: '2026-09-02T14:30:00Z'
  },

  // Sara Al-Dosari (2 samples: 1 published, 1 pending_review)
  {
    id: 'sample_sara_01',
    narratorId: 'narrator_sara_02',
    title: 'إعلان تطبيق توصيل ذكي سريع',
    category: 'إعلان',
    dialect: 'سعودي حجازي',
    audioUrl: 'https://cdn.freesound.org/previews/387/387641_7255533-lq.mp3',
    durationSec: 32,
    pricePerMinute: 70,
    status: 'published',
    createdAt: '2026-08-15T12:00:00Z'
  },
  {
    id: 'sample_sara_02',
    narratorId: 'narrator_sara_02',
    title: 'نظام الرد الآلي IVR لبنك استثماري',
    category: 'IVR',
    dialect: 'فصحى وثائقية',
    audioUrl: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
    durationSec: 54,
    pricePerMinute: 75,
    status: 'pending_review',
    createdAt: '2026-10-16T15:40:00Z'
  },

  // Karim Al-Mansour (2 samples: 1 published, 1 rejected)
  {
    id: 'sample_karim_01',
    narratorId: 'narrator_karim_03',
    title: 'فيلم وثائقي عن مبادرات الطاقة النظيفة',
    category: 'وثائقي',
    dialect: 'فصحى رسمية',
    audioUrl: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
    durationSec: 88,
    pricePerMinute: 95,
    status: 'published',
    createdAt: '2026-08-20T08:00:00Z'
  },
  {
    id: 'sample_karim_03',
    narratorId: 'narrator_karim_03',
    title: 'تقرير مالي ربع سنوي لصندوق سيادي',
    category: 'فيديو شركة',
    dialect: 'فصحى رسمية',
    audioUrl: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
    durationSec: 62,
    pricePerMinute: 90,
    status: 'rejected',
    rejectionReason: 'وجود تداخل نغمي وترددات كهربائية في الخلفية. نوصي باستخدام مرشح pop filter وإعادة التسجيل.',
    createdAt: '2026-09-24T10:10:00Z'
  },

  // Nour Al-Huda Ibrahim (2 samples: 1 published, 1 pending_review)
  {
    id: 'sample_nour_01',
    narratorId: 'narrator_nour_04',
    title: 'إعلان موسم التخفيضات الكبرى',
    category: 'إعلان',
    dialect: 'مصري تسويقي',
    audioUrl: 'https://cdn.freesound.org/previews/387/387641_7255533-lq.mp3',
    durationSec: 28,
    pricePerMinute: 60,
    status: 'published',
    createdAt: '2026-08-28T14:00:00Z'
  },
  {
    id: 'sample_nour_02',
    narratorId: 'narrator_nour_04',
    title: 'موشن جرافيك توعوي للرعاية الصحية',
    category: 'تعليمي',
    dialect: 'فصحى إذاعية',
    audioUrl: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
    durationSec: 65,
    pricePerMinute: 65,
    status: 'pending_review',
    createdAt: '2026-10-14T09:30:00Z'
  }
];

// Pre-seeded Voice Over Bookings (Human Voice-Over earnings across last 3 months)
const INITIAL_VOICE_OVER_BOOKINGS: VoiceOverBooking[] = [
  // Tareq Al-Shammary:
  {
    id: 'vob_tareq_101',
    narratorId: 'narrator_tareq_01',
    projectTitle: 'مشروع إعلان اليوم الوطني - أرامكو السعودية',
    date: '2026-10-14',
    status: 'paid',
    amount: 450,
    createdAt: '2026-10-14T10:00:00Z'
  },
  {
    id: 'vob_tareq_102',
    narratorId: 'narrator_tareq_01',
    projectTitle: 'تعليق صوتي لبوابة وزارة الاستثمار الرسمية',
    date: '2026-10-06',
    status: 'completed',
    amount: 380,
    createdAt: '2026-10-06T12:00:00Z'
  },
  {
    id: 'vob_tareq_103',
    narratorId: 'narrator_tareq_01',
    projectTitle: 'رد آلي موحد (IVR) لمصرف الراجحي',
    date: '2026-10-02',
    status: 'in_progress',
    amount: 250,
    createdAt: '2026-10-02T15:30:00Z'
  },
  {
    id: 'vob_tareq_104',
    narratorId: 'narrator_tareq_01',
    projectTitle: 'وثائقي مسار الدرعية التاريخي والقصور الطينية',
    date: '2026-09-22',
    status: 'paid',
    amount: 520,
    createdAt: '2026-09-22T09:00:00Z'
  },
  {
    id: 'vob_tareq_105',
    narratorId: 'narrator_tareq_01',
    projectTitle: 'فيديو تدريبي تفاعلي لمنسوبي شركة STC',
    date: '2026-09-10',
    status: 'paid',
    amount: 350,
    createdAt: '2026-09-10T14:15:00Z'
  },
  {
    id: 'vob_tareq_106',
    narratorId: 'narrator_tareq_01',
    projectTitle: 'حملة مهرجان شتاء طنطورة والعلا',
    date: '2026-08-18',
    status: 'paid',
    amount: 480,
    createdAt: '2026-08-18T11:45:00Z'
  },

  // Sara Al-Dosari:
  {
    id: 'vob_sara_201',
    narratorId: 'narrator_sara_02',
    projectTitle: 'إعلان تطبيق توصيل الأطعمة جاهز',
    date: '2026-10-11',
    status: 'paid',
    amount: 320,
    createdAt: '2026-10-11T16:00:00Z'
  },
  {
    id: 'vob_sara_202',
    narratorId: 'narrator_sara_02',
    projectTitle: 'تسجيل دروس تفاعلية لمنصة مدرستي الرقمية',
    date: '2026-10-04',
    status: 'completed',
    amount: 280,
    createdAt: '2026-10-04T13:20:00Z'
  },
  {
    id: 'vob_sara_203',
    narratorId: 'narrator_sara_02',
    projectTitle: 'كتاب صوتي كامل "فن القيادة والإلهام"',
    date: '2026-09-15',
    status: 'paid',
    amount: 400,
    createdAt: '2026-09-15T10:00:00Z'
  },
  {
    id: 'vob_sara_204',
    narratorId: 'narrator_sara_02',
    projectTitle: 'حملة إطلاق العطور الملكية لعبدالصمد القرشي',
    date: '2026-08-25',
    status: 'paid',
    amount: 350,
    createdAt: '2026-08-25T17:00:00Z'
  },

  // Karim Al-Mansour:
  {
    id: 'vob_karim_301',
    narratorId: 'narrator_karim_03',
    projectTitle: 'مؤتمر إكسبو سيتي دبي للطاقة المستدامة',
    date: '2026-10-12',
    status: 'paid',
    amount: 500,
    createdAt: '2026-10-12T09:30:00Z'
  },
  {
    id: 'vob_karim_302',
    narratorId: 'narrator_karim_03',
    projectTitle: 'رد آلي مالي لبنك أبوظبي الأول FAB',
    date: '2026-09-28',
    status: 'paid',
    amount: 420,
    createdAt: '2026-09-28T11:00:00Z'
  },
  {
    id: 'vob_karim_303',
    narratorId: 'narrator_karim_03',
    projectTitle: 'فيلم تسويقي لصالح طيران الإمارات الدولي',
    date: '2026-08-20',
    status: 'paid',
    amount: 450,
    createdAt: '2026-08-20T15:00:00Z'
  }
];

// Append-only audit logs
const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit_init_001',
    narratorId: 'narrator_tareq_01',
    action: 'profile_claimed',
    payload: { phoneMasked: '+966 ••• •• 4567', method: 'otp_verified' },
    at: '2026-02-14T18:22:00Z',
    ip: '151.254.12.89',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'audit_init_002',
    narratorId: 'narrator_tareq_01',
    action: 'contract_signed',
    payload: { 
      version: '1.2.0', 
      noticePeriodDays: 365, 
      revenueSharePercent: 45,
      signatureName: 'طارق بن عبدالعزيز الشمري' 
    },
    at: '2026-02-15T09:30:00Z',
    ip: '151.254.12.89',
    hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'
  },
  {
    id: 'audit_init_003',
    narratorId: 'narrator_tareq_01',
    action: 'consent_sentence_recorded',
    payload: { 
      duration: '7.8s', 
      tokenText: 'أنا طارق الشمري أوافق على استنساخ صوتي لدى قيمة فويس' 
    },
    at: '2026-02-15T09:38:00Z',
    ip: '151.254.12.89',
    hash: '3f79bb7b435b05321651daefd374cd681cd06b7571414e810571034377bf1038'
  },
  {
    id: 'audit_init_004',
    narratorId: 'narrator_tareq_01',
    action: 'narrator_approved_publish',
    payload: { 
      voiceEngine: 'ElevenLabs Instant Voice Clone API', 
      voiceModel: 'eleven_multilingual_v2',
      publishedState: 'published' 
    },
    at: '2026-02-15T10:00:00Z',
    ip: '151.254.12.89',
    hash: '7d793037a0760186574b0282f2f435e7b1e73777d790f970e8083cd0b8ef60fa'
  }
];

class NarratorService {
  private narrators: Narrator[] = [];
  private aiVoices: Record<string, AIVoice> = {};
  private contracts: Record<string, VoiceContract> = {};
  private usageEvents: UsageEvent[] = [];
  private auditLogs: AuditLog[] = [];
  private voiceSamples: VoiceSample[] = [];
  private voiceOverBookings: VoiceOverBooking[] = [];
  private verificationCodes: Record<string, string> = {};

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedNarrators = localStorage.getItem('qeema_narrators');
      this.narrators = storedNarrators ? JSON.parse(storedNarrators) : [...INITIAL_NARRATORS];

      const storedVoices = localStorage.getItem('qeema_ai_voices');
      this.aiVoices = storedVoices ? JSON.parse(storedVoices) : { ...INITIAL_AI_VOICES };

      const storedContracts = localStorage.getItem('qeema_contracts');
      this.contracts = storedContracts ? JSON.parse(storedContracts) : { ...INITIAL_CONTRACTS };

      const storedUsage = localStorage.getItem('qeema_usage_events');
      this.usageEvents = storedUsage ? JSON.parse(storedUsage) : [...INITIAL_USAGE_EVENTS];

      const storedSamples = localStorage.getItem('qeema_voice_samples_v3');
      this.voiceSamples = storedSamples ? JSON.parse(storedSamples) : [...INITIAL_VOICE_SAMPLES];

      const storedBookings = localStorage.getItem('qeema_voice_over_bookings');
      this.voiceOverBookings = storedBookings ? JSON.parse(storedBookings) : [...INITIAL_VOICE_OVER_BOOKINGS];
    } catch {
      this.narrators = [...INITIAL_NARRATORS];
      this.aiVoices = { ...INITIAL_AI_VOICES };
      this.contracts = { ...INITIAL_CONTRACTS };
      this.usageEvents = [...INITIAL_USAGE_EVENTS];
      this.auditLogs = [...INITIAL_AUDIT_LOGS];
      this.voiceSamples = [...INITIAL_VOICE_SAMPLES];
      this.voiceOverBookings = [...INITIAL_VOICE_OVER_BOOKINGS];
    }
  }

  private saveState() {
    try {
      localStorage.setItem('qeema_narrators', JSON.stringify(this.narrators));
      localStorage.setItem('qeema_ai_voices', JSON.stringify(this.aiVoices));
      localStorage.setItem('qeema_contracts', JSON.stringify(this.contracts));
      localStorage.setItem('qeema_usage_events', JSON.stringify(this.usageEvents));
      localStorage.setItem('qeema_audit_logs', JSON.stringify(this.auditLogs));
      localStorage.setItem('qeema_voice_samples_v3', JSON.stringify(this.voiceSamples));
      localStorage.setItem('qeema_voice_over_bookings', JSON.stringify(this.voiceOverBookings));
    } catch {
      // ignore
    }
  }

  private async writeAuditLog(narratorId: string, action: string, payload: Record<string, any>): Promise<AuditLog> {
    const entry: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      narratorId,
      action,
      payload,
      at: new Date().toISOString(),
      ip: '151.254.12.89',
      hash: Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2)
    };
    // Append-only: never edit or delete
    this.auditLogs.unshift(entry);
    this.saveState();
    return entry;
  }

  public async getAllNarrators(): Promise<Narrator[]> {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 200));
      return [...this.narrators];
    }
    const res = await fetch('/api/v1/narrators');
    return res.json();
  }

  public async getNarratorById(id: string): Promise<Narrator | null> {
    const n = this.narrators.find(item => item.id === id);
    return n ? { ...n } : null;
  }

  public async getNarratorByClaimToken(token: string): Promise<{ 
    narrator: Narrator; 
    isExpired: boolean; 
  }> {
    await new Promise(r => setTimeout(r, 300));
    const narrator = this.narrators.find(n => n.claimToken === token);
    if (!narrator) {
      throw new Error('رمز التفعيل غير صالح أو غير موجود في النظام.');
    }
    const isExpired = narrator.claimTokenExpiresAt 
      ? new Date(narrator.claimTokenExpiresAt).getTime() < Date.now()
      : false;

    return { narrator: { ...narrator }, isExpired };
  }

  public async requestNewClaimLink(phoneOrEmail: string): Promise<{ success: boolean; message: string }> {
    await new Promise(r => setTimeout(r, 600));
    const narrator = this.narrators.find(n => n.phone.includes(phoneOrEmail) || n.email?.includes(phoneOrEmail));
    if (narrator) {
      narrator.claimToken = `token_${narrator.id}_${Date.now()}`;
      narrator.claimTokenExpiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
      narrator.status = 'invited';
      this.saveState();
      await this.writeAuditLog(narrator.id, 'claim_link_reissued', { target: phoneOrEmail });
      return { 
        success: true, 
        message: 'تم توليد وإرسال رابط تفعيل جديد بنجاح عبر رسالة نصية SMS.' 
      };
    }
    return {
      success: true,
      message: 'إذا كان رقم الجوال مسجلاً، تم إرسال رابط التفعيل الجديد.'
    };
  }

  public async submitManualReviewRequest(payload: {
    fullName: string;
    newPhone: string;
    notes?: string;
    token?: string;
  }): Promise<{ success: boolean; referenceNumber: string }> {
    await new Promise(r => setTimeout(r, 700));
    const ref = `MAN-${Math.floor(100000 + Math.random() * 900000)}`;
    await this.writeAuditLog('manual_review', 'manual_activation_requested', { ...payload, ref });
    return {
      success: true,
      referenceNumber: ref
    };
  }

  public async verifyOtp(token: string, otp: string): Promise<{ verified: boolean }> {
    await new Promise(r => setTimeout(r, 500));
    // Accepts 123456 or any 6-digit numeric string for quick preview demo
    if (otp === '123456' || otp.length === 6) {
      return { verified: true };
    }
    throw new Error('رمز التحقق غير صحيح. يرجى إدخال 123456 للتجربة السريعة.');
  }

  public async completeProfileClaim(
    narratorId: string, 
    updatedFields: Partial<Narrator>
  ): Promise<Narrator> {
    await new Promise(r => setTimeout(r, 600));
    const index = this.narrators.findIndex(n => n.id === narratorId);
    if (index === -1) throw new Error('المعلق غير موجود');

    this.narrators[index] = {
      ...this.narrators[index],
      ...updatedFields,
      status: 'active'
    };

    await this.writeAuditLog(narratorId, 'profile_claimed', {
      updatedFields: Object.keys(updatedFields),
      activatedAt: new Date().toISOString()
    });

    this.saveState();
    return { ...this.narrators[index] };
  }

  public async sendInvite(narratorId: string): Promise<Narrator> {
    await new Promise(r => setTimeout(r, 400));
    const narrator = this.narrators.find(n => n.id === narratorId);
    if (!narrator) throw new Error('المعلق غير موجود');

    narrator.status = 'invited';
    narrator.claimToken = `token_${narrator.id.replace('narrator_', '')}_${Math.floor(1000 + Math.random() * 9000)}`;
    narrator.claimTokenExpiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
    
    await this.writeAuditLog(narratorId, 'invite_dispatched', {
      token: narrator.claimToken,
      expiresAt: narrator.claimTokenExpiresAt
    });

    this.saveState();
    return { ...narrator };
  }

  public async bulkSendInvites(): Promise<{ count: number }> {
    await new Promise(r => setTimeout(r, 800));
    let count = 0;
    this.narrators.forEach(n => {
      if (n.status === 'unclaimed') {
        n.status = 'invited';
        n.claimToken = `token_${n.id.replace('narrator_', '')}_${Math.floor(1000 + Math.random() * 9000)}`;
        n.claimTokenExpiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
        count++;
        this.writeAuditLog(n.id, 'bulk_invite_sent', { token: n.claimToken });
      }
    });
    this.saveState();
    return { count };
  }

  // -----------------------------------------------------------------
  // Feature B — "صوتي الذكي" (My AI Voice) Clone Wizard & Management
  // -----------------------------------------------------------------

  public async getAIVoice(narratorId: string): Promise<AIVoice | null> {
    await new Promise(r => setTimeout(r, 200));
    const voice = this.aiVoices[narratorId];
    return voice ? { ...voice } : null;
  }

  public async getVoiceContract(contractId: string): Promise<VoiceContract | null> {
    const c = this.contracts[contractId];
    return c ? { ...c } : null;
  }

  public async submitKyc(narratorId: string, idPhotoName: string, selfieName: string): Promise<Narrator> {
    await new Promise(r => setTimeout(r, 800));
    const narrator = this.narrators.find(n => n.id === narratorId);
    if (!narrator) throw new Error('المعلق غير موجود');

    narrator.kycStatus = 'approved';
    await this.writeAuditLog(narratorId, 'kyc_submitted_and_verified', {
      idPhoto: idPhotoName,
      selfie: selfieName,
      status: 'approved'
    });

    this.saveState();
    return { ...narrator };
  }

  public async signVoiceContract(contractData: {
    narratorId: string;
    allowedUseCases: UseCase[];
    noticePeriodDays: 30 | 180 | 365 | 730;
    revenueSharePercent: number;
    signatureName: string;
  }): Promise<VoiceContract> {
    await new Promise(r => setTimeout(r, 700));
    const contractId = `contract_${contractData.narratorId}_${Date.now()}`;
    const contract: VoiceContract = {
      id: contractId,
      narratorId: contractData.narratorId,
      version: '1.2.0-elevenlabs-cloning',
      allowedUseCases: contractData.allowedUseCases,
      blockedUseCases: ['political', 'religious', 'adult', 'gambling', 'impersonation'],
      noticePeriodDays: contractData.noticePeriodDays,
      revenueSharePercent: contractData.revenueSharePercent,
      signedAt: new Date().toISOString(),
      signatureName: contractData.signatureName,
      ipAddress: '151.254.12.89'
    };

    this.contracts[contractId] = contract;

    // Link into AI voice draft
    if (!this.aiVoices[contractData.narratorId]) {
      this.aiVoices[contractData.narratorId] = {
        id: `ai_voice_${contractData.narratorId}`,
        narratorId: contractData.narratorId,
        contractId,
        dialect: 'سعودي نجدي',
        status: 'contract_signed',
        consentRecordingUrl: '',
        sampleRecordingUrls: [],
        previewUrls: []
      };
    } else {
      this.aiVoices[contractData.narratorId].contractId = contractId;
      this.aiVoices[contractData.narratorId].status = 'contract_signed';
    }

    await this.writeAuditLog(contractData.narratorId, 'contract_signed', {
      contractId,
      noticePeriodDays: contract.noticePeriodDays,
      revenueSharePercent: contract.revenueSharePercent,
      allowedUseCases: contract.allowedUseCases,
      signatureName: contract.signatureName
    });

    this.saveState();
    return { ...contract };
  }

  public async saveSpokenConsent(narratorId: string, consentSentence: string, audioBlobUrl: string): Promise<void> {
    await new Promise(r => setTimeout(r, 400));
    if (!this.aiVoices[narratorId]) {
      this.aiVoices[narratorId] = {
        id: `ai_voice_${narratorId}`,
        narratorId,
        contractId: '',
        dialect: 'سعودي نجدي',
        status: 'recording',
        consentRecordingUrl: audioBlobUrl,
        sampleRecordingUrls: [],
        previewUrls: []
      };
    } else {
      this.aiVoices[narratorId].consentRecordingUrl = audioBlobUrl;
      this.aiVoices[narratorId].status = 'recording';
    }

    await this.writeAuditLog(narratorId, 'spoken_consent_recorded', {
      sentence: consentSentence,
      timestamp: new Date().toISOString()
    });

    this.saveState();
  }

  public async processCloningWithElevenLabs(narratorId: string, payload: {
    dialect: string;
    sampleUrls: string[];
    qualityMetrics: {
      durationSeconds: number;
      clippingDetected: boolean;
      noiseScore: 'excellent' | 'acceptable' | 'high_noise';
      isClean: boolean;
    };
  }): Promise<AIVoice> {
    // Simulated processing delay for instant voice cloning via backend
    await new Promise(r => setTimeout(r, 2000));

    const aiVoice = this.aiVoices[narratorId] || {
      id: `ai_voice_${narratorId}`,
      narratorId,
      contractId: `contract_${narratorId}`,
      dialect: payload.dialect,
      status: 'preview_ready',
      consentRecordingUrl: '',
      sampleRecordingUrls: [],
      previewUrls: []
    };

    aiVoice.elevenLabsVoiceId = `el_voice_${narratorId}_${Math.floor(1000 + Math.random() * 9000)}`;
    aiVoice.dialect = payload.dialect;
    aiVoice.status = 'preview_ready';
    aiVoice.sampleRecordingUrls = payload.sampleUrls;
    aiVoice.qualityMetrics = payload.qualityMetrics;
    aiVoice.previewUrls = [
      'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
      'https://cdn.freesound.org/previews/387/387641_7255533-lq.mp3',
      'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
      'https://cdn.freesound.org/previews/387/387641_7255533-lq.mp3',
      'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3'
    ];
    aiVoice.clonedAt = new Date().toISOString();

    this.aiVoices[narratorId] = aiVoice;

    await this.writeAuditLog(narratorId, 'elevenlabs_voice_cloned', {
      elevenLabsVoiceId: aiVoice.elevenLabsVoiceId,
      duration: payload.qualityMetrics.durationSeconds,
      status: 'preview_ready'
    });

    this.saveState();
    return { ...aiVoice };
  }

  public async approveAndPublishVoice(narratorId: string): Promise<AIVoice> {
    await new Promise(r => setTimeout(r, 800));
    const aiVoice = this.aiVoices[narratorId];
    if (!aiVoice) throw new Error('لا يوجد صوت ذكي جاهز للنشر');

    aiVoice.status = 'published';
    aiVoice.publishedAt = new Date().toISOString();

    await this.writeAuditLog(narratorId, 'narrator_approved_publish', {
      publishedAt: aiVoice.publishedAt,
      elevenLabsVoiceId: aiVoice.elevenLabsVoiceId
    });

    this.saveState();
    return { ...aiVoice };
  }

  public async togglePauseAIVoice(narratorId: string): Promise<AIVoice> {
    await new Promise(r => setTimeout(r, 400));
    const aiVoice = this.aiVoices[narratorId];
    if (!aiVoice) throw new Error('لا يوجد صوت ذكي');

    const newStatus = aiVoice.status === 'published' ? 'paused' : 'published';
    aiVoice.status = newStatus;

    await this.writeAuditLog(narratorId, newStatus === 'paused' ? 'ai_voice_paused' : 'ai_voice_resumed', {
      newStatus,
      timestamp: new Date().toISOString()
    });

    this.saveState();
    return { ...aiVoice };
  }

  public async startNoticePeriodWithdrawal(narratorId: string, reason?: string): Promise<AIVoice> {
    await new Promise(r => setTimeout(r, 700));
    const aiVoice = this.aiVoices[narratorId];
    if (!aiVoice) throw new Error('لا يوجد صوت ذكي');

    const contract = this.contracts[aiVoice.contractId] || { noticePeriodDays: 365 };
    const days = contract.noticePeriodDays || 365;
    const disableAt = new Date(Date.now() + days * 86400000).toISOString();

    aiVoice.status = 'notice_period';
    aiVoice.disableAt = disableAt;

    await this.writeAuditLog(narratorId, 'notice_period_started', {
      noticePeriodDays: days,
      disableAt,
      reason: reason || 'طلب المعلق سحب الموافقة على الاستنساخ',
      timestamp: new Date().toISOString()
    });

    this.saveState();
    return { ...aiVoice };
  }

  public async cancelNoticePeriod(narratorId: string): Promise<AIVoice> {
    await new Promise(r => setTimeout(r, 400));
    const aiVoice = this.aiVoices[narratorId];
    if (!aiVoice) throw new Error('لا يوجد صوت ذكي');

    aiVoice.status = 'published';
    aiVoice.disableAt = undefined;

    await this.writeAuditLog(narratorId, 'notice_period_cancelled', {
      timestamp: new Date().toISOString()
    });

    this.saveState();
    return { ...aiVoice };
  }

  public async updateAllowedUseCases(narratorId: string, allowedUseCases: UseCase[]): Promise<VoiceContract> {
    await new Promise(r => setTimeout(r, 400));
    const aiVoice = this.aiVoices[narratorId];
    if (!aiVoice || !aiVoice.contractId) throw new Error('لا يوجد عقد مرتبط بهذا المعلق');
    
    let contract = this.contracts[aiVoice.contractId];
    if (!contract) throw new Error('العقد غير موجود');

    // Create a new version silently
    const currentVer = contract.version || '1.0.0';
    const parts = currentVer.split('.');
    const nextVer = `${parts[0] || '1'}.${parts[1] || '0'}.${parseInt(parts[2] || '0', 10) + 1}`;

    contract = {
      ...contract,
      allowedUseCases,
      version: nextVer
    };
    this.contracts[aiVoice.contractId] = contract;

    // Append-only audit log
    await this.writeAuditLog(narratorId, 'contract_use_cases_updated', {
      version: contract.version,
      allowedUseCases,
      updatedAt: new Date().toISOString()
    });

    this.saveState();
    return { ...contract };
  }

  public async updateNoticePeriod(narratorId: string, noticePeriodDays: 30 | 180 | 365 | 730): Promise<VoiceContract> {
    await new Promise(r => setTimeout(r, 400));
    const aiVoice = this.aiVoices[narratorId];
    if (!aiVoice || !aiVoice.contractId) throw new Error('لا يوجد عقد مرتبط بهذا المعلق');
    
    let contract = this.contracts[aiVoice.contractId];
    if (!contract) throw new Error('العقد غير موجود');

    // Rule: only longer options can be chosen
    if (noticePeriodDays < contract.noticePeriodDays) {
      throw new Error('لا يمكن تقليص فترة الإشعار الحالية وفق بنود العقد المبرم.');
    }

    const shareMap: Record<number, number> = {
      30: 20,
      180: 30,
      365: 40,
      730: 50
    };

    const currentVer = contract.version || '1.0.0';
    const parts = currentVer.split('.');
    const nextVer = `${parseInt(parts[0] || '1', 10) + 1}.0.0`;

    contract = {
      ...contract,
      noticePeriodDays,
      revenueSharePercent: shareMap[noticePeriodDays] || 45,
      version: nextVer
    };
    this.contracts[aiVoice.contractId] = contract;

    await this.writeAuditLog(narratorId, 'contract_notice_period_updated', {
      version: contract.version,
      noticePeriodDays,
      newRevenueSharePercent: contract.revenueSharePercent,
      updatedAt: new Date().toISOString()
    });

    this.saveState();
    return { ...contract };
  }

  public async requestPayout(narratorId: string, amount: number, payoutMethod: string): Promise<{ success: boolean; newBalance: number }> {
    await new Promise(r => setTimeout(r, 600));
    await this.writeAuditLog(narratorId, 'payout_requested', {
      amountUsd: amount,
      payoutMethod,
      requestedAt: new Date().toISOString()
    });
    return { success: true, newBalance: 0 };
  }

  public async submitEmergencyStopRequest(narratorId: string, reason: string, details?: string): Promise<{ success: boolean }> {
    await new Promise(r => setTimeout(r, 500));
    await this.writeAuditLog(narratorId, 'emergency_stop_requested', {
      reason,
      details,
      status: 'pending_admin_escalation',
      requestedAt: new Date().toISOString()
    });
    return { success: true };
  }

  public async setMockVoiceStatus(narratorId: string, status: AIVoiceStatus): Promise<AIVoice> {
    let aiVoice = this.aiVoices[narratorId];
    if (!aiVoice) {
      aiVoice = {
        id: `ai_voice_${narratorId}`,
        narratorId,
        contractId: `contract_${narratorId}`,
        dialect: 'سعودي نجدي',
        status,
        consentRecordingUrl: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
        sampleRecordingUrls: [],
        previewUrls: ['https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3'],
        publishedAt: status === 'published' ? new Date().toISOString() : undefined,
        disableAt: status === 'notice_period' ? new Date(Date.now() + 365 * 86400000).toISOString() : undefined
      };
    } else {
      aiVoice.status = status;
      if (status === 'published' && !aiVoice.publishedAt) {
        aiVoice.publishedAt = new Date().toISOString();
      }
      if (status === 'notice_period' && !aiVoice.disableAt) {
        aiVoice.disableAt = new Date(Date.now() + 365 * 86400000).toISOString();
      }
    }
    this.aiVoices[narratorId] = aiVoice;
    this.saveState();
    return { ...aiVoice };
  }

  public async getUsageEvents(aiVoiceId: string): Promise<UsageEvent[]> {
    await new Promise(r => setTimeout(r, 200));
    return this.usageEvents.filter(ev => ev.aiVoiceId === aiVoiceId);
  }

  public async getAuditLogs(narratorId: string): Promise<AuditLog[]> {
    await new Promise(r => setTimeout(r, 200));
    return this.auditLogs.filter(log => log.narratorId === narratorId || narratorId === 'admin_all');
  }

  // ==========================================
  // VOICE SAMPLES MANAGEMENT
  // ==========================================

  public async getVoiceSamples(narratorId: string): Promise<VoiceSample[]> {
    await new Promise(r => setTimeout(r, 200));
    return this.voiceSamples.filter(s => s.narratorId === narratorId);
  }

  public async getAllVoiceSamples(): Promise<VoiceSample[]> {
    await new Promise(r => setTimeout(r, 200));
    return [...this.voiceSamples];
  }

  public async getAllPendingVoiceSamples(): Promise<VoiceSample[]> {
    await new Promise(r => setTimeout(r, 200));
    return this.voiceSamples.filter(s => s.status === 'pending_review');
  }

  public async addVoiceSample(data: {
    narratorId: string;
    title: string;
    category: string;
    dialect: string;
    pricePerMinute?: number;
    audioUrl?: string;
    durationSec?: number;
  }): Promise<VoiceSample> {
    await new Promise(r => setTimeout(r, 400));
    const existing = this.voiceSamples.filter(s => s.narratorId === data.narratorId);
    if (existing.length >= 3) {
      throw new Error('متاح إضافة 3 عينات فقط بشرط التوافق مع شروط العينات في المنصة');
    }

    const fallbackAudios = [
      'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
      'https://cdn.freesound.org/previews/387/387641_7255533-lq.mp3'
    ];
    const chosenAudio = data.audioUrl || fallbackAudios[Math.floor(Math.random() * fallbackAudios.length)];
    const chosenPrice = data.pricePerMinute && data.pricePerMinute > 0 ? data.pricePerMinute : 80;

    const newSample: VoiceSample = {
      id: `sample_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      narratorId: data.narratorId,
      title: data.title,
      category: data.category,
      dialect: data.dialect,
      audioUrl: chosenAudio,
      durationSec: data.durationSec || Math.floor(Math.random() * 50) + 30,
      pricePerMinute: chosenPrice,
      status: 'pending_review',
      createdAt: new Date().toISOString()
    };

    this.voiceSamples.unshift(newSample);
    await this.writeAuditLog(data.narratorId, 'voice_sample_submitted', {
      sampleId: newSample.id,
      title: newSample.title,
      category: newSample.category,
      dialect: newSample.dialect,
      pricePerMinute: chosenPrice,
      status: 'pending_review'
    });

    this.saveState();
    return { ...newSample };
  }

  public async updateVoiceSamplePrice(sampleId: string, pricePerMinute: number): Promise<VoiceSample> {
    await new Promise(r => setTimeout(r, 300));
    const sample = this.voiceSamples.find(s => s.id === sampleId);
    if (!sample) throw new Error('العينة غير موجودة');

    const previousPrice = sample.pricePerMinute;
    sample.pricePerMinute = pricePerMinute;

    await this.writeAuditLog(sample.narratorId, 'sample_price_updated_by_narrator', {
      sampleId: sample.id,
      title: sample.title,
      previousPrice,
      newPrice: pricePerMinute,
      updatedAt: new Date().toISOString()
    });

    this.saveState();
    return { ...sample };
  }

  public async deleteVoiceSample(sampleId: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 300));
    const index = this.voiceSamples.findIndex(s => s.id === sampleId);
    if (index === -1) return false;

    const sample = this.voiceSamples[index];
    // Narrator can only delete samples that are pending_review or rejected
    if (sample.status !== 'pending_review' && sample.status !== 'rejected') {
      throw new Error('لا يمكن حذف العينات المعتمدة وفق لوائح المنصة');
    }

    this.voiceSamples.splice(index, 1);
    await this.writeAuditLog(sample.narratorId, 'voice_sample_deleted', {
      sampleId,
      title: sample.title,
      status: sample.status
    });

    this.saveState();
    return true;
  }

  public async toggleHideVoiceSample(sampleId: string): Promise<VoiceSample> {
    await new Promise(r => setTimeout(r, 300));
    const sample = this.voiceSamples.find(s => s.id === sampleId);
    if (!sample) throw new Error('العينة غير موجودة');

    if (sample.status === 'published') {
      sample.status = 'hidden';
    } else if (sample.status === 'hidden') {
      sample.status = 'published';
    } else {
      throw new Error('الإخفاء متاح فقط للعينات المنشورة');
    }

    await this.writeAuditLog(sample.narratorId, 'voice_sample_visibility_toggled', {
      sampleId,
      newStatus: sample.status
    });

    this.saveState();
    return { ...sample };
  }

  public async adminApproveSample(sampleId: string, pricePerMinute: number): Promise<VoiceSample> {
    await new Promise(r => setTimeout(r, 400));
    const sample = this.voiceSamples.find(s => s.id === sampleId);
    if (!sample) throw new Error('العينة غير موجودة');

    const previousPrice = sample.pricePerMinute;
    sample.status = 'published';
    sample.pricePerMinute = pricePerMinute;
    sample.rejectionReason = undefined;

    await this.writeAuditLog(sample.narratorId, 'sample_approved_and_priced', {
      sampleId,
      title: sample.title,
      pricePerMinute,
      previousPrice,
      approvedBy: 'admin_team',
      approvedAt: new Date().toISOString()
    });

    this.saveState();
    return { ...sample };
  }

  public async adminRejectSample(sampleId: string, reason: string): Promise<VoiceSample> {
    await new Promise(r => setTimeout(r, 400));
    const sample = this.voiceSamples.find(s => s.id === sampleId);
    if (!sample) throw new Error('العينة غير موجودة');

    sample.status = 'rejected';
    sample.rejectionReason = reason;

    await this.writeAuditLog(sample.narratorId, 'sample_rejected_by_admin', {
      sampleId,
      title: sample.title,
      reason,
      rejectedBy: 'admin_team',
      rejectedAt: new Date().toISOString()
    });

    this.saveState();
    return { ...sample };
  }

  // ==========================================
  // VOICE OVER BOOKINGS & EARNINGS
  // ==========================================

  public async getVoiceOverBookings(narratorId: string): Promise<VoiceOverBooking[]> {
    await new Promise(r => setTimeout(r, 200));
    return this.voiceOverBookings.filter(b => b.narratorId === narratorId);
  }

  public async getMonthlyEarnings(narratorId: string): Promise<{
    voThisMonth: number;
    aiThisMonth: number;
    totalMonthly: number;
    availableBalance: number;
  }> {
    await new Promise(r => setTimeout(r, 150));
    // Calculate October 2026 earnings
    const currentMonthPrefix = '2026-10';

    // Voice-Over bookings for narrator
    const bookings = this.voiceOverBookings.filter(b => b.narratorId === narratorId);
    const voThisMonth = bookings
      .filter(b => b.date.startsWith(currentMonthPrefix) && (b.status === 'paid' || b.status === 'completed'))
      .reduce((sum, b) => sum + b.amount, 0);

    // AI voice usage earnings
    const aiVoice = this.aiVoices[narratorId];
    let aiThisMonth = 0;
    if (aiVoice) {
      const usages = this.usageEvents.filter(u => u.aiVoiceId === aiVoice.id);
      aiThisMonth = usages
        .filter(u => u.createdAt.startsWith(currentMonthPrefix))
        .reduce((sum, u) => sum + u.narratorEarning, 0);
    }

    // Available balance calculation: paid/completed VO bookings + AI earnings
    const totalAllTimeVo = bookings
      .filter(b => b.status === 'paid')
      .reduce((sum, b) => sum + b.amount, 0);

    const totalAllTimeAi = aiVoice
      ? this.usageEvents
          .filter(u => u.aiVoiceId === aiVoice.id)
          .reduce((sum, u) => sum + u.narratorEarning, 0)
      : 0;

    const availableBalance = Number((totalAllTimeVo + totalAllTimeAi).toFixed(2));

    return {
      voThisMonth: Number(voThisMonth.toFixed(2)),
      aiThisMonth: Number(aiThisMonth.toFixed(2)),
      totalMonthly: Number((voThisMonth + aiThisMonth).toFixed(2)),
      availableBalance
    };
  }

  // ==========================================
  // PROFILE & VERIFICATION CODE
  // ==========================================

  public async sendVerificationCode(target: string, type: 'email' | 'phone'): Promise<{ success: boolean; code: string }> {
    await new Promise(r => setTimeout(r, 400));
    // Generate realistic 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.verificationCodes[target] = code;
    return { success: true, code };
  }

  public async verifyCode(target: string, code: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 300));
    // Accept the stored code OR demo shortcut code '839201' OR '123456'
    const valid = this.verificationCodes[target] === code.trim() || code.trim() === '839201' || code.trim() === '123456';
    if (valid) {
      delete this.verificationCodes[target];
    }
    return valid;
  }

  public async updateNarratorContact(narratorId: string, data: {
    displayName?: string;
    email?: string;
    phone?: string;
  }): Promise<Narrator> {
    await new Promise(r => setTimeout(r, 400));
    const index = this.narrators.findIndex(n => n.id === narratorId);
    if (index === -1) throw new Error('المعلق غير مسجل');

    const narrator = this.narrators[index];
    const prevEmail = narrator.email;
    const prevPhone = narrator.phone;

    if (data.displayName) narrator.displayName = data.displayName;
    if (data.email) narrator.email = data.email;
    if (data.phone) narrator.phone = data.phone;

    this.narrators[index] = { ...narrator };
    await this.writeAuditLog(narratorId, 'narrator_contact_updated', {
      prevEmail,
      newEmail: data.email,
      prevPhone,
      newPhone: data.phone,
      displayName: data.displayName
    });

    this.saveState();
    return { ...narrator };
  }
}

export const narratorService = new NarratorService();
