import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { db } from '../db/store';

export const assistantRouter = Router();

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// 1. GET /config - Public assistant config status
assistantRouter.get('/config', (req: Request, res: Response) => {
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  const hasAgent = Boolean(agentId && agentId.trim().length > 3);
  res.json({
    status: 'ok',
    hasAgent,
    agentId: hasAgent ? agentId : undefined,
    supportedLanguages: ['ar', 'en'],
    capabilities: [
      'voice_search',
      'pricing_calculation',
      'licensing_compliance',
      'voice_twins_guidance',
      'human_talent_booking',
      'b2b_sales_routing'
    ]
  });
});

// 2. GET /signed-url - ElevenLabs Conversational AI signed URL
assistantRouter.get('/signed-url', async (req: Request, res: Response) => {
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!agentId || !apiKey) {
    return res.status(400).json({
      error: 'لم يتم تكوين ELEVENLABS_AGENT_ID أو ELEVENLABS_API_KEY على الخادم'
    });
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey
      }
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.warn('[ElevenLabs signed-url error]:', errBody);
      return res.status(502).json({ error: 'تعذر توليد رابط محادثة معتمد من ElevenLabs' });
    }

    const data = await response.json();
    return res.json({ signedUrl: data.signed_url });
  } catch (err: any) {
    console.error('[Assistant signed-url exception]:', err);
    return res.status(500).json({ error: 'خطأ في الاتصال بمزود الخدمة الصوتية' });
  }
});

// 3. POST /chat - Intelligent Qeema conversational endpoint with Gemini AI
assistantRouter.post('/chat', async (req: Request, res: Response) => {
  const { message, language = 'ar', history = [] } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'الرسالة مطلوبة' });
  }

  const isEn = language === 'en';
  const allVoices = Array.from(db.voices.values()).filter(v => v.isActive);

  // Check if Gemini is available
  const ai = getAIClient();

  if (ai) {
    try {
      const systemInstruction = `
You are the official QeemaVoice Voice Discovery and Support Assistant for QeemaVoice (منصة قيمة فويس).
QeemaVoice is the leading Arabic B2B voice platform combining:
1. Authentic Arabic AI text-to-speech with full dialectal mastery (Saudi/Gulf, Egyptian, Levantine, Maghrebi, Modern Standard Arabic/Fusha).
2. Certified human voice talent marketplace with vetted professional voice actors and full commercial broadcast licensing.
3. Proprietary Enterprise Brand Voice Twins (custom voice cloning trained on verified corporate speakers).
4. Subscription and token-based pricing:
   - Starter: $49/mo (50k credits, studio WAV exports)
   - Growth: $149/mo (200k credits, 1 Voice Twin, 15% discount on human talent, API keys)
   - Enterprise: $499/mo (1M credits, unlimited twins, SLA support)

Rules:
- Respond politely and concisely in the requested language (${isEn ? 'English' : 'Arabic'}).
- Understand user intents (voice search, pricing, licensing, voice cloning, how to use, contact sales).
- DO NOT invent non-existent products or fake pricing.
- You must output ONLY a valid JSON object with:
{
  "text": "Your conversational response here (clean, formatted, concise)",
  "cardType": "voice_list" | "pricing" | "licensing" | "cloning" | "how_it_works" | null,
  "searchParams": {
    "dialect": "gulf" | "egyptian" | "levantine" | "maghrebi" | "fusha" | "all" | undefined,
    "gender": "male" | "female" | "all" | undefined,
    "type": "human" | "ai" | "all" | undefined,
    "useCase": string | undefined,
    "query": string | undefined
  } | undefined,
  "suggestedReplies": ["string", "string", "string"]
}
`;

      const prompt = `User Query: "${message}"\nLanguage: ${language}\nRecent History: ${JSON.stringify(history.slice(-4))}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      const responseText = response.text?.trim() || '';
      if (responseText) {
        try {
          const parsed = JSON.parse(responseText);
          return res.json(parsed);
        } catch {
          // If json parse failed, return text directly
          return res.json({
            text: responseText,
            cardType: null,
            suggestedReplies: isEn ? ['Find a Voice', 'View Pricing', 'Contact Sales'] : ['ابحث عن صوت', 'الأسعار والباقات', 'تواصل مع المبيعات']
          });
        }
      }
    } catch (err) {
      console.warn('[Gemini Assistant API error]:', err);
      // Fallback handled below
    }
  }

  // Fallback intelligent response logic
  const q = message.toLowerCase();

  // Pricing intent
  if (q.includes('سعر') || q.includes('اسعار') || q.includes('باقة') || q.includes('price') || q.includes('cost') || q.includes('plan')) {
    return res.json({
      text: isEn 
        ? 'Here are our transparent flexible plans tailored for creators, agencies, and enterprise production:'
        : 'إليك باقات منصة «قيمة» الشفافة المصممة لصناع المحتوى، والوكالات، والشركات:',
      cardType: 'pricing',
      suggestedReplies: isEn ? ['Find a Saudi Voice', 'Commercial Licensing', 'Contact Sales'] : ['ابحث عن صوت سعودي', 'التراخيص التجارية', 'تواصل مع المبيعات']
    });
  }

  // Licensing intent
  if (q.includes('ترخيص') || q.includes('حقوق') || q.includes('ملكية') || q.includes('license') || q.includes('copyright')) {
    return res.json({
      text: isEn
        ? 'All audio generated or recorded through QeemaVoice includes 100% full commercial and broadcast rights with certified PDF documentation.'
        : 'جميع التسجيلات والأصوات المولدة عبر منصة «قيمة» تأتي مع ترخيص تجاري وبث كامل 100% معتمد قانونياً وخالٍ من أي حقوق ملكية متكررة.',
      cardType: 'licensing',
      suggestedReplies: isEn ? ['Pricing & Plans', 'Explore Voices', 'Book Talent'] : ['الأسعار والباقات', 'استعراض الأصوات', 'حجز معلق صوتي']
    });
  }

  // Voice search intent
  let dialect: any = undefined;
  if (q.includes('سعود') || q.includes('خليج') || q.includes('saudi') || q.includes('gulf')) dialect = 'gulf';
  else if (q.includes('مصر') || q.includes('egypt')) dialect = 'egyptian';
  else if (q.includes('شام') || q.includes('سور') || q.includes('لبنان') || q.includes('اردن') || q.includes('levant')) dialect = 'levantine';
  else if (q.includes('مغرب') || q.includes('تونس') || q.includes('جزائر') || q.includes('maghreb')) dialect = 'maghrebi';
  else if (q.includes('فصح') || q.includes('fusha') || q.includes('msa')) dialect = 'fusha';

  const gender = (q.includes('رجل') || q.includes('ذكر') || q.includes('male'))
    ? 'male'
    : (q.includes('امرأة') || q.includes('انثى') || q.includes('أنثى') || q.includes('female'))
    ? 'female'
    : undefined;

  const type = (q.includes('بشري') || q.includes('معلق') || q.includes('human'))
    ? 'human'
    : (q.includes('ذكاء') || q.includes('ai'))
    ? 'ai'
    : undefined;

  let filtered = allVoices;
  if (dialect) filtered = filtered.filter(v => v.dialect === dialect);
  if (gender) filtered = filtered.filter(v => v.gender === gender);
  if (type) filtered = filtered.filter(v => v.type === type);

  if (dialect || gender || type || q.includes('صوت') || q.includes('voice')) {
    return res.json({
      text: isEn
        ? `I found ${filtered.length || allVoices.length} voice options ready for your project. You can preview them directly below:`
        : `وجدت لك ${filtered.length || allVoices.length} صوتاً مناسباً لاحتياجات مشروعك. يمكنك الاستماع للمعاينة الفورية أدناه:`,
      cardType: 'voice_list',
      searchParams: { dialect, gender, type, query: dialect ? undefined : q },
      suggestedReplies: isEn ? ['How much does it cost?', 'Female Voices', 'Explore All'] : ['كم تكلفة الاستخدام؟', 'أصوات نسائية', 'استعراض الكل']
    });
  }

  // Default response
  return res.json({
    text: isEn
      ? 'Welcome to QeemaVoice AI! I can help you find suitable voices across all Arabic dialects, explain commercial licensing and pricing, or guide you through voice cloning.'
      : 'أهلاً بك في منصة «قيمة للذكاء الصوتي». يمكنني مساعدتك في اختيار النبرة واللهجة الأنسب لإعلاناتك أو مشروعك، وشرح التراخيص والباقات، أو استنساخ توأم صوتي لمؤسستك.',
    cardType: null,
    suggestedReplies: isEn
      ? ['Find a Saudi Voice', 'Find an Egyptian Voice', 'Pricing & Plans', 'Contact Sales']
      : ['ابحث عن صوت سعودي', 'ابحث عن صوت مصري', 'الأسعار والباقات', 'تواصل مع المبيعات']
  });
});
