import { Voice, Generation, CreditTransaction, UsageMetrics, Plan, Company, User, HumanBooking } from '../types';

export interface MeResponse {
  user: User;
  company: Company;
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

// ---------- Login session (token from /auth/login, /auth/signup or /auth/google) ----------
const TOKEN_KEY = 'qeema_token';
export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } };
export const setToken = (t: string) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch {} };

// Every call to our own API carries the session, wherever the fetch is written
if (typeof window !== 'undefined' && !(window as any).__qeemaFetch) {
  const original = window.fetch.bind(window);
  (window as any).__qeemaFetch = true;
  window.fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const token = getToken();
    if (token && (url.startsWith('/api/') || url.startsWith(`${location.origin}/api/`))) {
      const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
      if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
      init = { ...init, headers };
    }
    return original(input, init);
  };
}

// Company the platform admin is looking at (ignored by the server for everyone else)
let currentCompanyId = '';

export function setActiveCompanyId(companyId: string) {
  currentCompanyId = companyId;
}

function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(currentCompanyId ? { 'x-company-id': currentCompanyId } : {})
  };
}

async function authCall(path: string, body: unknown): Promise<{ token: string; user: User }> {
  const res = await fetch(`/api/v1/auth/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'تعذر تسجيل الدخول');
  setToken(data.token);
  return data;
}

export const api = {
  // Auth & Company
  async getMe(): Promise<MeResponse> {
    const res = await fetch('/api/v1/auth/me', { headers: getHeaders() });
    if (!res.ok) throw new Error('فشل جلب بيانات الشركة');
    return res.json();
  },

  signup: (data: { name: string; email: string; password: string; company?: string; accountType: 'client' | 'talent' }) => authCall('signup', data),
  login: (email: string, password: string) => authCall('login', { email, password }),
  loginWithGoogle: (accessToken: string, accountType: 'client' | 'talent') => authCall('google', { accessToken, accountType }),
  async logout() {
    await fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => {});
    setToken('');
  },

  async switchCompany(companyId: string): Promise<MeResponse> {
    setActiveCompanyId(companyId);
    const res = await fetch('/api/v1/auth/switch-company', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ companyId })
    });
    if (!res.ok) throw new Error('فشل تبديل الشركة');
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

    const res = await fetch(`/api/v1/voices?${query.toString()}`, { headers: getHeaders() });
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
    success: boolean;
    newBalanceCredits: number;
    message: string;
  }> {
    const res = await fetch('/api/v1/credits/topup', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('فشل شحن الرصيد');
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
    const res = await fetch('/api/v1/billing', { headers: getHeaders() });
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

  async getSitePage(key: string): Promise<any> {
    const res = await fetch(`/api/v1/pages/${key}`);
    if (!res.ok) throw new Error('فشل جلب الصفحة');
    return (await res.json()).page;
  },

  async getPublishedGuides(): Promise<any[]> {
    const res = await fetch('/api/v1/guides');
    if (!res.ok) throw new Error('فشل جلب الأدلة');
    return (await res.json()).items;
  },

  async getPublishedStories(): Promise<any[]> {
    const res = await fetch('/api/v1/stories');
    if (!res.ok) throw new Error('فشل جلب قصص النجاح');
    return (await res.json()).items;
  },

  // Admin content collections (generic CRUD)
  async listCollection(name: string): Promise<any[]> {
    const res = await fetch(`/api/v1/admin/collections/${name}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('فشل جلب البيانات');
    return (await res.json()).items;
  },
  async createCollectionItem(name: string, data: any): Promise<any> {
    const res = await fetch(`/api/v1/admin/collections/${name}`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'فشل الإضافة');
    return (await res.json()).item;
  },
  async updateCollectionItem(name: string, id: string, data: any): Promise<any> {
    const res = await fetch(`/api/v1/admin/collections/${name}/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'فشل الحفظ');
    return (await res.json()).item;
  },
  async deleteCollectionItem(name: string, id: string): Promise<void> {
    const res = await fetch(`/api/v1/admin/collections/${name}/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error('فشل الحذف');
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

  // Client: own bookings, project reviews, feedback to the admins
  async getMyBookings(): Promise<{ bookings: HumanBooking[]; company: { id: string; name: string; country: string } }> {
    const res = await fetch('/api/v1/client/bookings', { headers: getHeaders() });
    if (!res.ok) throw new Error('فشل جلب الحجوزات');
    return res.json();
  },

  /** The booking form: the request is saved as "pending" for the admins to review */
  async createBooking(data: { sampleId: string; scriptText: string; delivery: string; usageLicense: string; notes: string; customerName: string; customerEmail: string; customerWhatsapp: string }): Promise<HumanBooking> {
    const res = await fetch('/api/v1/client/bookings', { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || 'تعذر إرسال طلب الحجز');
    return body.booking;
  },

  async reviewBooking(id: string, rating: number, text: string): Promise<HumanBooking> {
    const res = await fetch(`/api/v1/client/bookings/${id}/review`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ rating, text }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'تعذر حفظ التقييم');
    return data.booking;
  },

  async sendFeedback(payload: { rating: number; topic: string; message: string }): Promise<void> {
    const res = await fetch('/api/v1/client/feedback', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    if (!res.ok) throw new Error((await res.json()).error || 'تعذر الإرسال');
  },

  async getAdminReviews(): Promise<any[]> {
    const res = await fetch('/api/v1/admin/reviews', { headers: getHeaders() });
    if (!res.ok) throw new Error('فشل جلب التقييمات');
    return (await res.json()).reviews;
  },

  async setReviewStatus(bookingId: string, status: 'approved' | 'rejected' | 'pending'): Promise<void> {
    const res = await fetch(`/api/v1/admin/reviews/${bookingId}`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ status }) });
    if (!res.ok) throw new Error('تعذر تحديث التقييم');
  },

  async getVoiceReviews(sampleId: string): Promise<{ reviews: { rating: number; createdAt: string }[]; average: number; count: number }> {
    const res = await fetch(`/api/v1/human-voices/${sampleId}/reviews`);
    if (!res.ok) throw new Error('فشل جلب التقييمات');
    return res.json();
  },

  async getAdminGenerations(): Promise<any[]> {
    const res = await fetch('/api/v1/admin/generations', { headers: getHeaders() });
    if (!res.ok) throw new Error('فشل جلب عمليات التوليد');
    return (await res.json()).generations;
  },

  async getAdminSettings(): Promise<any> {
    const res = await fetch('/api/v1/admin/settings', { headers: getHeaders() });
    if (!res.ok) throw new Error('فشل جلب الإعدادات');
    const data = await res.json();
    return { ...data.settings, integrations: data.integrations };
  },

  async saveAdminSettings(payload: { settings?: Record<string, any>; integrations?: Record<string, any> }): Promise<any> {
    const res = await fetch('/api/v1/admin/settings', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل حفظ الإعدادات');
    return { ...data.settings, integrations: data.integrations };
  },

  async getAdminCustomers(): Promise<any[]> {
    const res = await fetch('/api/v1/admin/customers', { headers: getHeaders() });
    if (!res.ok) throw new Error('فشل جلب العملاء');
    return (await res.json()).customers;
  },

  async getAdminCustomer(id: string): Promise<any> {
    const res = await fetch(`/api/v1/admin/customers/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('فشل جلب بيانات العميل');
    return res.json();
  },

  async setAdminCustomerStatus(id: string, status: 'active' | 'suspended'): Promise<any> {
    const res = await fetch(`/api/v1/admin/customers/${id}/status`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ status }) });
    if (!res.ok) throw new Error('فشل تعديل حالة العميل');
    return res.json();
  },

  async addAdminCustomerNote(id: string, text: string): Promise<any> {
    const res = await fetch(`/api/v1/admin/customers/${id}/notes`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ text }) });
    if (!res.ok) throw new Error('فشل حفظ الملاحظة');
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
  }
};
