# TECHNICAL ARCHITECTURE — معمارية منصة قيمة فويس للذكاء الصوتي (Qeema AI)
**تاريخ الاعتماد:** 2026-09-08  
**المعايير المعتمدة:** Enterprise Micro-modular Monolith / Async Event-Driven Queues / Zero-Leak Secret Isolation

---

## 1. المخطط المعماري العام (System Architecture Diagram)

```text
                                  ┌────────────────────────┐
                                  │      CLIENT APPS       │
                                  │  Web App / Mobile Web  │
                                  │   Developer REST API   │
                                  └───────────┬────────────┘
                                              │ HTTPS / WSS
                                              ▼
                                  ┌────────────────────────┐
                                  │     REVERSE PROXY      │
                                  │    Nginx / Cloud Run   │
                                  │  Rate Limiter / SSL /  │
                                  │   DDoS & WAF Shield    │
                                  └───────────┬────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      │                                               │
                      ▼                                               ▼
         ┌────────────────────────┐                      ┌────────────────────────┐
         │  HUMAN MARKETPLACE     │                      │    QEEMA AI SERVICE    │
         │  (Legacy Rails/Laravel)│                      │ (Node.js / Modular API)│
         │  • 1000+ Human Talents │                      │  • Text-to-Speech      │
         │  • Custom Orders       │                      │  • Voice Cloning       │
         │  • Audio Mastering     │                      │  • Speech-to-Text      │
         │  • Studio Contracts    │                      │  • Multi-Scene Studio  │
         └───────────┬────────────┘                      └───────────┬────────────┘
                     │                                               │
                     └───────────────────────┬───────────────────────┘
                                             │
                                             ▼
                               ┌───────────────────────────┐
                               │     CORE SERVICE BUS      │
                               │  Auth, RBAC, User Wallets │
                               │  Credit Billing Engine    │
                               └─────────────┬─────────────┘
                                             │
                     ┌───────────────────────┴───────────────────────┐
                     │                                               │
                     ▼                                               ▼
       ┌───────────────────────────┐                   ┌───────────────────────────┐
       │     TASK QUEUE & ASYNC    │                   │   DATA & STORAGE LAYER    │
       │        (Redis / BullMQ)   │                   │ • Relational (PostgreSQL) │
       │ • Job Dispatcher          │                   │ • Audio Bucket (S3/GCS)   │
       │ • Retry & Backoff Engine  │                   │ • Voice Embeddings Store  │
       │ • Webhook Callbacks       │                   │ • Redis Memory Cache      │
       └─────────────┬─────────────┘                   └───────────────────────────┘
                     │
                     ▼
       ┌───────────────────────────┐
       │   AI PROVIDER ADAPTER     │
       │  (Unified Abstraction)   │
       │ ├── TTS Provider Engine   │
       │ ├── STT Transcription     │
       │ ├── Voice Clone Adapter   │
       │ └── Fallback Failover     │
       └─────────────┬─────────────┘
                     │
     ┌───────────────┼───────────────┬───────────────┐
     ▼               ▼               ▼               ▼
┌───────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Eleven   │ │ Google Cloud│ │ Whisper /   │ │ Proprietary │
│   Labs    │ │  Vertex AI  │ │ Local PyTorch│ │ Qeema Arab │
│  Adapter  │ │  (Gemini)   │ │  Models     │ │   Models    │
└───────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

---

## 2. طبقة التجريد لمزودي الذكاء الاصطناعي (AI Provider Abstraction Layer)

تعد هذه الطبقة الركيزة التقنية الأهم لمنع الارتباط الأحادي (Vendor Lock-in) بمزود خارجي واحد.

### 2.1 الواجهة البرمجية الموحدة (Service Interface):

```typescript
// src/services/ai/types.ts
export interface SpeechGenerationRequest {
  text: string;
  voiceId: string;
  dialect: 'gulf' | 'levantine' | 'egyptian' | 'maghrebi' | 'fusha';
  speed: number;       // 0.5 to 2.0
  pitch: number;       // -20 to +20
  emotion?: 'neutral' | 'warm' | 'authoritative' | 'cheerful' | 'dramatic';
  format: 'mp3' | 'wav_48khz';
  userId: string;
}

export interface SpeechGenerationResult {
  audioBuffer: Buffer;
  durationSeconds: number;
  samplingRate: number;
  charactersCount: number;
  provider: string;
  model: string;
  latencyMs: number;
}

export interface ITTSProviderAdapter {
  providerName: string;
  synthesize(request: SpeechGenerationRequest): Promise<SpeechGenerationResult>;
  validateVoiceAvailability(voiceId: string): Promise<boolean>;
  estimateCredits(characterCount: number): number;
}
```

### 2.2 محرك التبديل والاحتياط (Failover Dispatcher):
يقوم محرك `QeemaAIService` بتوجيه الطلب للمزود الأنسب بناءً على اللهجة المطلوبة وتوفر الخدمة:
1. فحص توفر المزود الأساسي (Health Check).
2. في حال حدوث خطأ أو زيادة زمن الاستجابة عن 3 ثوانٍ، يتم التبديل التلقائي لمزود بديل (Failover).
3. احتساب الرصيد بشكل موحد للمستخدم بغض النظر عن المزود الفعلي خلف الكواليس.

---

## 3. بنية طوابير المهام والمعالجة غير التزامنية (Queue Architecture)

تتطلب عمليات الذكاء الاصطناعي الصوتي معالجة ثقيلة لا يمكن تشغيلها داخل دورة طلب HTTP عادية (Request/Response Cycle):

1. **المهام اللحظية خفيفة الوزن (Synchronous Streaming TTS):**
   * للفقرات القصيرة (أقل من 300 حرف)، يتم البث اللحظي بصيغة Audio Stream مباشرة للمتصفح بزمن استجابة أقل من 250ms.
2. **المهام الثقيلة المجدولة (Async Queues via Redis/BullMQ):**
   * استنساخ الأصوات (Voice Cloning Training).
   * تفريغ الملفات الصوتية الكبيرة (Speech-to-Text).
   * دبلجة الفيديو متعددة الخطوات (AI Dubbing).
   * استوديو المشاريع الطويلة المجمعة (Multi-Scene Rendering).

### دورة حياة المهمة (Job Lifecycle):
```text
HTTP Request → Push to Redis Queue → Worker Pulls Job → AI Adapter Exec → Upload Audio to S3 → Update DB (Status: Ready) → Push WebSocket / Webhook Event to Client
```

---

## 4. بنية التخزين السحابي للملفات الصوتية (Audio Storage Architecture)

تعتمد المنصة تصنيفاً دقيقاً للملفات لضمان أقصى حماية وأقل تكلفة تخزين:

| نوع الملف | وسيط التخزين | مدة البقاء (Retention) | سياسة الوصول (Access Control) |
| :--- | :--- | :--- | :--- |
| **ملفات الرفع الخام (Raw Uploads)** | `s3://qeema-uploads-inbound/` | 30 يوماً | روابط موقعة مؤقتة (Signed URLs) بمدة 15 دقيقة |
| **عينات الصوت الرسمية (Voice Demos)** | `s3://qeema-public-assets/` | دائمة | CDN عام فائق السرعة عبر Cloudflare مع Cache |
| **الصوت المولد (TTS Cache)** | `s3://qeema-generated-cache/` | 90 يوماً (أو دائمة للمشاريع) | روابط موقعة مرتبطة بحساب المستخدم فقط |
| **تضمينات الأصوات (Voice Embeddings)** | `s3://qeema-voice-models-secure/` | مشفرة دائمة | تشفير AES-256، لا يمكن تحميلها خارج خوادم التدريب |

---

## 5. ميثاق الأمان والعزل (Security & Secrets Isolation)

1. **عزل مفاتيح الذكاء الاصطناعي (Zero Frontend Secret Policy):**
   * جميع مفاتيح API الخاصة بمزودي الذكاء الاصطناعي (Google Cloud, ElevenLabs, OpenAI...) تُخزن فقط في متغيرات البيئة لخادم الباك إند (`process.env.*`).
   * المتصفح لا يعلم إطلاقاً هوية المزود الخارجي ولا يتصل به مباشرة.
2. **التحقق من الهوية والأدوار (RBAC):**
   * التحقق من صلاحيات العميل قبل توليد أي صوت أو خصم أي نقطة.
   * منع استنساخ أي صوت إلا بعد استيفاء شروط التحقق الصوتي الحي (Voice Consent Liveness Check).
3. **مكافحة سوء الاستخدام والـ Rate Limiting:**
   * تحديد حد أقصى للطلبات في الدقيقة لكل مستخدم حسب خطة الاشتراك لمنع الهجمات وهدر الرصيد.
   * فحص الكلمات المحظورة والمحتوى الضار قبل إرسال النصوص لمحركات التوليد.
