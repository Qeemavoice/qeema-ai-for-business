import { Voice, Generation, CreditTransaction, UsageMetrics, Plan, Company, User } from '../types';

export interface MeResponse {
  authenticated: boolean;
  user: User | null;
  company: Company | null;
  balanceCredits: number;
  availableCompanies: Company[];
}

export interface VoicesResponse {
  total: number;
  voices: Voice[];
  metadata: {
    dialects: { code: string; labelAr: string }[];
    types: { code: string; labelAr: string }[];
  };
}

export interface UsageResponse {
  metrics: UsageMetrics;
  dialectBreakdown: { code: string; label: string; count: number; characters: number }[];
  topVoices: { name: string; count: number; characters: number }[];
  recentRecords: any[];
}

export interface BillingResponse {
  company: Company;
  currentPlan: Plan;
  availablePlans: Plan[];
  balanceCredits: number;
  invoices: {
    id: string;
    date: string;
    description: string;
    creditsAdded: number;
    amountUsd: number;
    status: string;
  }[];
}

function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
}

let csrfToken: string | null = null;

async function getCsrfToken(forceRefresh = false): Promise<string> {
  if (forceRefresh) csrfToken = null;
  if (csrfToken) return csrfToken;

  const res = await fetch('/api/v1/auth/csrf', {
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('تعذر بدء جلسة آمنة. أعد تحميل الصفحة وحاول مجدداً.');

  const data = await res.json();
  csrfToken = data.token;
  return csrfToken as string;
}

export async function authRequest(path: string, payload?: Record<string, unknown>): Promise<Response> {
  const send = async (token: string) => fetch(path, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'X-CSRF-TOKEN': token
      },
      credentials: 'include',
      body: JSON.stringify(payload || {})
    });

  let res = await send(await getCsrfToken());
  if (res.status === 419) {
    res = await send(await getCsrfToken(true));
  }
  return res;
}

async function responseError(res: Response, fallback: string): Promise<Error> {
  try {
    const data = await res.json();
    const validationMessage = data.errors
      ? Object.values(data.errors).flat().find(Boolean)
      : null;
    return new Error(String(validationMessage || data.message || fallback));
  } catch {
    return new Error(fallback);
  }
}

export const api = {
  async submitLead(payload: {
    type: string;
    name: string;
    email: string;
    mobile?: string;
    message: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ success: boolean; id: string }> {
    const res = await authRequest('/api/v1/leads', payload);
    if (!res.ok) throw await responseError(res, 'تعذر إرسال الطلب');
    return res.json();
  },

  // Auth & Company
  async login(payload: { email: string; password: string; remember: boolean }): Promise<MeResponse> {
    const res = await authRequest('/api/v1/auth/login', payload);
    if (!res.ok) throw await responseError(res, 'تعذر تسجيل الدخول');
    return res.json();
  },

  async register(payload: { name: string; email: string; password: string; company?: string }): Promise<MeResponse> {
    const res = await authRequest('/api/v1/auth/register', payload);
    if (!res.ok) throw await responseError(res, 'تعذر إنشاء الحساب');
    return res.json();
  },

  async logout(): Promise<void> {
    const res = await authRequest('/api/v1/auth/logout');
    if (!res.ok) throw await responseError(res, 'تعذر تسجيل الخروج');
    csrfToken = null;
  },

  async getMe(): Promise<MeResponse> {
    const res = await fetch('/api/v1/auth/me', { headers: getHeaders(), credentials: 'include' });
    if (!res.ok) throw new Error('فشل جلب بيانات الشركة');
    return res.json();
  },

  async switchCompany(companyId: string): Promise<MeResponse> {
    const res = await fetch('/api/v1/auth/switch-company', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ companyId })
    });
    if (!res.ok) throw new Error('فشل تبديل الشركة');
    const data = await res.json();
    return data;
  },

  async registerCompany(payload: { companyName: string; industry: string; country: string; contactName: string; email: string }) {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'فشل تسجيل الشركة');
    }
    const data = await res.json();
    return data;
  },

  // Voices (Human + AI)
  async getVoices(params?: { type?: string; dialect?: string; gender?: string; search?: string; useCase?: string }): Promise<VoicesResponse> {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.dialect) query.set('dialect', params.dialect);
    if (params?.gender) query.set('gender', params.gender);
    if (params?.search) query.set('search', params.search);
    if (params?.useCase) query.set('useCase', params.useCase);

    const res = await fetch(`/api/v1/voices?${query.toString()}`, { headers: getHeaders(), credentials: 'include' });
    if (!res.ok) throw new Error('فشل جلب الأصوات');
    return res.json();
  },

  // TTS Generations
  async createGeneration(payload: { voiceId: string; text: string; settings?: Record<string, any> }): Promise<{
    success: boolean;
    generation: Generation;
    newBalanceCredits: number;
    message: string;
  }> {
    const res = await fetch('/api/v1/generations', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'فشل التوليد الصوتي');
    }
    return data;
  },

  async getGenerations(): Promise<{ total: number; generations: Generation[] }> {
    const res = await fetch('/api/v1/generations', { headers: getHeaders() });
    if (!res.ok) throw new Error('فشل جلب سجل التسجيلات');
    return res.json();
  },

  async deleteGeneration(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/v1/generations/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('فشل حذف التسجيل');
    return res.json();
  },

  // Credits & Ledger
  async getCredits(): Promise<{
    balanceCredits: number;
    unitRule: string;
    transactions: CreditTransaction[];
  }> {
    const res = await fetch('/api/v1/credits', { headers: getHeaders() });
    if (!res.ok) throw new Error('فشل جلب رصيد النقاط');
    return res.json();
  },

  async topupCredits(payload: { packId?: string; amountCredits?: number }): Promise<{
    checkoutUrl: string;
  }> {
    const res = await authRequest('/api/v1/credits/checkout', payload);
    if (!res.ok) throw await responseError(res, 'فشل بدء عملية الدفع');
    return res.json();
  },

  async confirmCreditPayment(sessionId: string): Promise<{ balanceCredits: number }> {
    const res = await authRequest('/api/v1/credits/confirm', { sessionId });
    if (!res.ok) throw await responseError(res, 'تعذر تأكيد عملية الدفع');
    return res.json();
  },

  // Usage & Analytics
  async getUsage(): Promise<UsageResponse> {
    const res = await fetch('/api/v1/usage', { headers: getHeaders() });
    if (!res.ok) throw new Error('فشل جلب إحصائيات الاستهلاك');
    return res.json();
  },

  // Billing
  async getBilling(): Promise<BillingResponse> {
    const res = await fetch('/api/v1/billing', { headers: getHeaders(), credentials: 'include' });
    if (!res.ok) throw new Error('فشل جلب الفواتير والاشتراك');
    return res.json();
  },

  async changePlan(planId: string): Promise<{ success: boolean; currentPlan: Plan; newBalanceCredits: number; message: string }> {
    const res = await fetch('/api/v1/billing/change-plan', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ planId })
    });
    if (!res.ok) throw new Error('فشل تغيير الباقة');
    return res.json();
  },

  // Admin
  async getAdminOverview(): Promise<any> {
    const res = await fetch('/api/v1/admin/overview', { headers: getHeaders() });
    if (!res.ok) throw new Error('فشل جلب بيانات الإدارة');
    return res.json();
  },

  async toggleVoiceActive(voiceId: string): Promise<any> {
    const res = await fetch(`/api/v1/admin/voices/${voiceId}/toggle`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('فشل تعديل حالة الصوت');
    return res.json();
  },

  async grantCredits(payload: { companyId: string; amountCredits: number; reason?: string }): Promise<any> {
    const res = await fetch('/api/v1/admin/credits/grant', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('فشل منح النقاط');
    return res.json();
  },

  async getAdminBookings(): Promise<any> {
    const res = await fetch('/api/v1/admin/bookings', { headers: getHeaders() });
    if (!res.ok) throw new Error('فشل جلب طلبات الحجز');
    return res.json();
  },

  async updateBookingStatus(bookingId: string, status: string, deliverableUrl?: string): Promise<any> {
    const res = await fetch(`/api/v1/admin/bookings/${bookingId}/status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status, deliverableUrl })
    });
    if (!res.ok) throw new Error('فشل تحديث حالة الحجز');
    return res.json();
  },

  async getAdminPayouts(): Promise<any> {
    const res = await fetch('/api/v1/admin/payouts', { headers: getHeaders() });
    if (!res.ok) throw new Error('فشل جلب مستحقات المعلقين');
    return res.json();
  },

  async processTalentPayout(talentId: string, amount?: number): Promise<any> {
    const res = await fetch(`/api/v1/admin/payouts/${talentId}/process`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount })
    });
    if (!res.ok) throw new Error('فشل تسوية المستحقات');
    return res.json();
  },

  async createAdminVoice(voiceData: any): Promise<any> {
    const res = await fetch('/api/v1/admin/voices/create', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(voiceData)
    });
    if (!res.ok) throw new Error('فشل إضافة الصوت الجديد');
    return res.json();
  },

  async updateAdminVoice(voiceId: string, updates: Partial<Voice>): Promise<any> {
    const res = await fetch(`/api/v1/admin/voices/${voiceId}/update`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('فشل تحديث بيانات الصوت');
    return res.json();
  },

  async updateAdminCompanyPlan(companyId: string, planId: string): Promise<any> {
    const res = await fetch(`/api/v1/admin/companies/${companyId}/update-plan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ planId })
    });
    if (!res.ok) throw new Error('فشل تعديل باقة الشركة');
    return res.json();
  },

  async updateSystemSettings(settings: any): Promise<any> {
    const res = await fetch('/api/v1/admin/system/settings', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('فشل حفظ إعدادات المنصة');
    return res.json();
  },

  async getTtsProviderSettings(): Promise<any> {
    const res = await fetch('/api/v1/admin/tts/providers', { headers: getHeaders(), credentials: 'include' });
    if (!res.ok) throw new Error('تعذر تحميل إعدادات مزوّدي الصوت');
    return res.json();
  },

  async updateTtsProviderSettings(settings: { enabledProviders: string[]; activeProvider: string }): Promise<any> {
    const res = await authRequest('/api/v1/admin/tts/providers', settings);
    if (!res.ok) throw await responseError(res, 'فشل حفظ مزوّدي الصوت');
    return res.json();
  }
};
