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
  VoiceOverBookingStatus,
  NarratorNotification
} from '../types';
import { SAMPLE_RULES, reasonByCode } from '../../shared/sampleRules';
import { DIALECTS } from '../data/dialects';
import { getToken } from '../lib/api';


import { INITIAL_NARRATORS, INITIAL_AI_VOICES, INITIAL_CONTRACTS, INITIAL_USAGE_EVENTS, INITIAL_VOICE_SAMPLES, INITIAL_VOICE_OVER_BOOKINGS, INITIAL_AUDIT_LOGS } from '../data/narratorSeed';

class NarratorService {
  private narrators: Narrator[] = [];
  private aiVoices: Record<string, AIVoice> = {};
  private contracts: Record<string, VoiceContract> = {};
  private usageEvents: UsageEvent[] = [];
  private auditLogs: AuditLog[] = [];
  private voiceSamples: VoiceSample[] = [];
  private voiceOverBookings: VoiceOverBooking[] = [];
  private notifications: NarratorNotification[] = [];
  private verificationCodes: Record<string, string> = {};

  /** Resolves when the data of the signed-in account (or claim link) has been loaded from the server */
  private ready: Promise<void> = Promise.resolve();
  private claimToken = '';
  private saveTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.ready = this.reload();
  }

  private authHeaders(): Record<string, string> {
    return this.claimToken ? { 'x-claim-token': this.claimToken } : {};
  }

  /** (Re)load from the server: everything for the admin team, own data for a narrator, nothing for visitors */
  public reload(): Promise<void> {
    if (!getToken() && !this.claimToken) { this.applyState(null); return (this.ready = Promise.resolve()); } // visitor
    this.ready = fetch('/api/v1/narrators/state', { headers: this.authHeaders() })
      .then(r => (r.ok ? r.json() : null))
      .then(data => this.applyState(data))
      .catch(() => this.applyState(null));
    return this.ready;
  }

  private applyState(data: any) {
    this.narrators = data?.narrators || [];
    this.aiVoices = data?.aiVoices || {};
    this.contracts = data?.contracts || {};
    this.usageEvents = data?.usageEvents || [];
    this.auditLogs = data?.auditLogs || [];
    this.voiceSamples = data?.voiceSamples || [];
    this.voiceOverBookings = data?.voiceOverBookings || [];
    this.notifications = data?.notifications || [];
    // dialects are picked from the platform list (src/data/dialects.ts); old free-text ones are mapped
    this.narrators = this.narrators.map(n => ({ ...n, dialects: normalizeDialects(n.dialects), humanBadge: n.humanBadge ?? 'none' }));
  }

  /** Saved on the server (debounced); the server keeps admin-only fields and other narrators' data untouched */
  private saveState() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      fetch('/api/v1/narrators/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
        body: JSON.stringify({
          narrators: this.narrators, aiVoices: this.aiVoices, contracts: this.contracts, usageEvents: this.usageEvents,
          auditLogs: this.auditLogs, voiceSamples: this.voiceSamples, voiceOverBookings: this.voiceOverBookings, notifications: this.notifications
        })
      }).catch(() => {});
    }, 300);
  }

  /** Writes now (no debounce) and reloads the server's copy, so protected fields show their real value */
  private async saveNow() {
    clearTimeout(this.saveTimer);
    await fetch('/api/v1/narrators/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
      body: JSON.stringify({
        narrators: this.narrators, aiVoices: this.aiVoices, contracts: this.contracts, usageEvents: this.usageEvents,
        auditLogs: this.auditLogs, voiceSamples: this.voiceSamples, voiceOverBookings: this.voiceOverBookings, notifications: this.notifications
      })
    });
    await this.reload();
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
    await this.ready;
    return [...this.narrators];
  }

  /** Self sign-up from the site («انضم كمعلق صوتي»): the narrator then fills in the profile; the admin team reviews it. */
  public async registerNarrator(data: { name: string; email: string }): Promise<Narrator> {
    await this.ready;
    const existing = this.narrators.find(n => n.email && n.email.toLowerCase() === data.email.toLowerCase());
    if (existing) return { ...existing };
    const narrator: Narrator = {
      id: `narrator_${Date.now().toString(36)}`,
      displayName: data.name,
      email: data.email,
      phone: '',
      dialects: [],
      status: 'active',
      kycStatus: 'none',
      humanBadge: 'none',
      createdAt: new Date().toISOString()
    };
    this.narrators.push(narrator);
    await this.writeAuditLog(narrator.id, 'narrator_registered', { email: data.email });
    await this.saveNow();
    return { ...narrator };
  }

  public async getNarratorById(id: string): Promise<Narrator | null> {
    await this.ready;
    const n = this.narrators.find(item => item.id === id);
    return n ? { ...n } : null;
  }

  public async getNarratorByClaimToken(token: string): Promise<{ 
    narrator: Narrator; 
    isExpired: boolean; 
  }> {
    await this.ready;
    // The claim link itself gives access to that one narrator's data
    if (token !== this.claimToken) { this.claimToken = token; await this.reload(); }
    await this.ready;
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
    await this.ready;
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
    await this.ready;
    await new Promise(r => setTimeout(r, 700));
    const ref = `MAN-${Math.floor(100000 + Math.random() * 900000)}`;
    await this.writeAuditLog('manual_review', 'manual_activation_requested', { ...payload, ref });
    return {
      success: true,
      referenceNumber: ref
    };
  }

  /** Claim link: the server emails a code to the narrator's address on file; returns the masked address */
  public async sendClaimCode(token: string): Promise<string> {
    const res = await fetch('/api/v1/narrators/otp/send', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-claim-token': token }, body: JSON.stringify({ purpose: 'claim' }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'تعذر إرسال رمز التحقق');
    return data.sentTo;
  }

  public async verifyOtp(token: string, otp: string): Promise<{ verified: boolean }> {
    const res = await fetch('/api/v1/narrators/otp/verify', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-claim-token': token }, body: JSON.stringify({ purpose: 'claim', code: otp }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'رمز التحقق غير صحيح');
    return { verified: true };
  }

  public async completeProfileClaim(
    narratorId: string, 
    updatedFields: Partial<Narrator>
  ): Promise<Narrator> {
    await this.ready;
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

    await this.saveNow();
    const saved = this.narrators.find(n => n.id === narratorId);
    if (!saved) throw new Error('تعذر حفظ الملف، حاول مرة أخرى');
    return { ...saved };
  }

  /** After the claim created the account, read the data as its owner instead of through the link */
  public async useAccountInsteadOfClaim() {
    this.claimToken = '';
    await this.reload();
  }

  public async sendInvite(narratorId: string): Promise<Narrator> {
    await this.ready;
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
    await this.ready;
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
    await this.ready;
    await new Promise(r => setTimeout(r, 200));
    const voice = this.aiVoices[narratorId];
    return voice ? { ...voice } : null;
  }

  public async getVoiceContract(contractId: string): Promise<VoiceContract | null> {
    await this.ready;
    const c = this.contracts[contractId];
    return c ? { ...c } : null;
  }

  public async submitKyc(narratorId: string, idPhotoName: string, selfieName: string): Promise<Narrator> {
    await this.ready;
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
    await this.ready;
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
    await this.ready;
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
    await this.ready;
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
    await this.ready;
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
    await this.ready;
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
    await this.ready;
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
    await this.ready;
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
    await this.ready;
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
    await this.ready;
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
    await this.ready;
    await new Promise(r => setTimeout(r, 600));
    await this.writeAuditLog(narratorId, 'payout_requested', {
      amountUsd: amount,
      payoutMethod,
      requestedAt: new Date().toISOString()
    });
    return { success: true, newBalance: 0 };
  }

  public async submitEmergencyStopRequest(narratorId: string, reason: string, details?: string): Promise<{ success: boolean }> {
    await this.ready;
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
    await this.ready;
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
    await this.ready;
    await new Promise(r => setTimeout(r, 200));
    return this.usageEvents.filter(ev => ev.aiVoiceId === aiVoiceId);
  }

  public async getAuditLogs(narratorId: string): Promise<AuditLog[]> {
    await this.ready;
    await new Promise(r => setTimeout(r, 200));
    return this.auditLogs.filter(log => log.narratorId === narratorId || narratorId === 'admin_all');
  }

  // ==========================================
  // VOICE SAMPLES MANAGEMENT
  // ==========================================

  public async getVoiceSamples(narratorId: string): Promise<VoiceSample[]> {
    await this.ready;
    await new Promise(r => setTimeout(r, 200));
    return this.voiceSamples.filter(s => s.narratorId === narratorId);
  }

  public async getAllVoiceSamples(): Promise<VoiceSample[]> {
    await this.ready;
    await new Promise(r => setTimeout(r, 200));
    // every pending sample is checked against the platform rules (duration / format) first
    this.autoReviewPendingSamples();
    return [...this.voiceSamples];
  }

  public async getAllPendingVoiceSamples(): Promise<VoiceSample[]> {
    await this.ready;
    await new Promise(r => setTimeout(r, 200));
    this.autoReviewPendingSamples();
    return this.voiceSamples.filter(s => s.status === 'pending_review');
  }

  /** Rules the system enforces without a human: MP3 only, max 40 seconds. */
  public getAutoRejectionCodes(sample: Pick<VoiceSample, 'durationSec' | 'format'>): string[] {
    const codes: string[] = [];
    if (sample.durationSec > SAMPLE_RULES.maxDurationSec) codes.push('duration');
    if ((sample.format || 'mp3').toLowerCase() !== SAMPLE_RULES.format) codes.push('format');
    return codes;
  }

  private buildReasonTexts(sample: VoiceSample, codes: string[], note?: string): string[] {
    const texts = codes.map(code => {
      if (code === 'duration') return `مدة العينة ${sample.durationSec} ثانية وتتجاوز الحد الأقصى المسموح (${SAMPLE_RULES.maxDurationSec} ثانية).`;
      if (code === 'format') return `صيغة الملف (${(sample.format || '').toUpperCase()}) غير مقبولة، المقبول هو MP3 فقط.`;
      return reasonByCode(code)?.message || code;
    });
    if (note && note.trim()) texts.push(note.trim());
    return texts;
  }

  private pushNotification(n: Omit<NarratorNotification, 'id' | 'createdAt' | 'read'>) {
    this.notifications.unshift({
      ...n,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  private rejectSampleInternal(sample: VoiceSample, codes: string[], note: string | undefined, auto: boolean, by: string) {
    const texts = this.buildReasonTexts(sample, codes, note);
    sample.status = 'rejected';
    sample.rejectionCodes = codes;
    sample.rejectionReason = texts.join(' • ');
    sample.autoRejected = auto;
    sample.reviewedAt = new Date().toISOString();

    this.pushNotification({
      narratorId: sample.narratorId,
      type: 'sample_rejected',
      title: `تم رفض عينتك «${sample.title}»`,
      body: auto
        ? 'رفضها النظام تلقائياً لمخالفتها شروط العينات. يمكنك حذفها ورفع عينة جديدة بعد تصحيح الملاحظات.'
        : 'راجع فريق قيمة فويس العينة ولم تُعتمد. يمكنك حذفها ورفع عينة جديدة بعد تصحيح الملاحظات.',
      reasons: texts,
      sampleId: sample.id
    });

    this.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      narratorId: sample.narratorId,
      action: auto ? 'sample_auto_rejected' : 'sample_rejected_by_admin',
      payload: { sampleId: sample.id, title: sample.title, codes, reasons: texts, rejectedBy: by },
      at: new Date().toISOString(),
      ip: '151.254.12.89',
      hash: Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2)
    });
  }

  /** Rejects (and notifies) every pending sample that breaks the automatic rules. */
  private autoReviewPendingSamples() {
    let changed = false;
    for (const sample of this.voiceSamples) {
      if (sample.status !== 'pending_review') continue;
      const codes = this.getAutoRejectionCodes(sample);
      if (codes.length > 0) {
        this.rejectSampleInternal(sample, codes, undefined, true, 'system');
        changed = true;
      }
    }
    if (changed) this.saveState();
  }

  public async addVoiceSample(data: {
    narratorId: string;
    title: string;
    category: string;
    dialect: string;
    pricePerMinute?: number;
    audioUrl?: string;
    durationSec?: number;
    format?: string;
    sizeMb?: number;
  }): Promise<VoiceSample> {
    await this.ready;
    await new Promise(r => setTimeout(r, 400));
    const existing = this.voiceSamples.filter(s => s.narratorId === data.narratorId);
    if (existing.length >= SAMPLE_RULES.maxSamplesPerNarrator) {
      throw new Error('متاح إضافة 3 عينات فقط بشرط التوافق مع شروط العينات في المنصة');
    }

    const fallbackAudios = [
      'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
      'https://cdn.freesound.org/previews/387/387641_7255533-lq.mp3'
    ];
    const chosenAudio = data.audioUrl || fallbackAudios[Math.floor(Math.random() * fallbackAudios.length)];
    const narrator = this.narrators.find(n => n.id === data.narratorId);
    const chosenPrice = data.pricePerMinute && data.pricePerMinute > 0 ? data.pricePerMinute : (narrator?.rates?.perMinuteUsd ?? 40);

    const newSample: VoiceSample = {
      id: `sample_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      narratorId: data.narratorId,
      title: data.title,
      category: data.category,
      dialect: data.dialect,
      audioUrl: chosenAudio,
      durationSec: data.durationSec ?? 30,
      format: (data.format || 'mp3').toLowerCase(),
      sizeMb: data.sizeMb,
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
      format: newSample.format,
      durationSec: newSample.durationSec,
      status: 'pending_review'
    });

    // automatic rules: > 40s or not MP3 -> rejected immediately + narrator notified
    const autoCodes = this.getAutoRejectionCodes(newSample);
    if (autoCodes.length > 0) {
      this.rejectSampleInternal(newSample, autoCodes, undefined, true, 'system');
    }

    this.saveState();
    return { ...newSample };
  }

  public async updateVoiceSamplePrice(sampleId: string, pricePerMinute: number): Promise<VoiceSample> {
    await this.ready;
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
    await this.ready;
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
    await this.ready;
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

  public async adminApproveSample(sampleId: string): Promise<VoiceSample> {
    await this.ready;
    await new Promise(r => setTimeout(r, 300));
    const sample = this.voiceSamples.find(s => s.id === sampleId);
    if (!sample) throw new Error('العينة غير موجودة');

    const autoCodes = this.getAutoRejectionCodes(sample);
    if (autoCodes.length > 0) {
      throw new Error('لا يمكن اعتماد هذه العينة لأنها تخالف الشروط (أكثر من 40 ثانية أو صيغة غير MP3)');
    }

    sample.status = 'published';
    sample.rejectionReason = undefined;
    sample.rejectionCodes = undefined;
    sample.autoRejected = false;
    sample.reviewedAt = new Date().toISOString();

    this.pushNotification({
      narratorId: sample.narratorId,
      type: 'sample_approved',
      title: `تم اعتماد عينتك «${sample.title}»`,
      body: 'أصبحت العينة منشورة في مكتبة الأصوات البشرية ويمكن للعملاء الاستماع إليها وحجزك.',
      sampleId: sample.id
    });

    await this.writeAuditLog(sample.narratorId, 'sample_approved', {
      sampleId,
      title: sample.title,
      approvedBy: 'admin_team',
      approvedAt: sample.reviewedAt
    });

    this.saveState();
    return { ...sample };
  }

  /** Manual rejection: pick one or more reasons (codes from shared/sampleRules.ts) + optional note. */
  public async adminRejectSample(sampleId: string, codes: string[], note?: string): Promise<VoiceSample> {
    await this.ready;
    await new Promise(r => setTimeout(r, 300));
    const sample = this.voiceSamples.find(s => s.id === sampleId);
    if (!sample) throw new Error('العينة غير موجودة');
    if (codes.length === 0 && !(note && note.trim())) throw new Error('اختر سبب رفض واحداً على الأقل');

    this.rejectSampleInternal(sample, codes, note, false, 'admin_team');
    this.saveState();
    return { ...sample };
  }

  // ==========================================
  // NARRATOR NOTIFICATIONS / ADMIN OPERATIONS
  // ==========================================

  public async getNotifications(narratorId: string): Promise<NarratorNotification[]> {
    await this.ready;
    this.autoReviewPendingSamples();
    return this.notifications.filter(n => n.narratorId === narratorId);
  }

  public async getAllNotifications(): Promise<NarratorNotification[]> {
    await this.ready;
    return [...this.notifications];
  }

  public async markNotificationsRead(narratorId: string): Promise<void> {
    await this.ready;
    this.notifications.forEach(n => { if (n.narratorId === narratorId) n.read = true; });
    this.saveState();
  }

  /** Admin changes the narrator's own per-minute price (kept for support cases; every change is audited). */
  public async setNarratorPrice(narratorId: string, perMinuteUsd: number): Promise<Narrator> {
    await this.ready;
    const n = this.narrators.find(item => item.id === narratorId);
    if (!n) throw new Error('المعلق غير موجود');
    const previous = n.rates?.perMinuteUsd;
    n.rates = {
      standardCommercialUsd: n.rates?.standardCommercialUsd ?? 0,
      perWordRateUsd: n.rates?.perWordRateUsd ?? 0,
      hourlyLiveDirectingUsd: n.rates?.hourlyLiveDirectingUsd ?? 0,
      perMinuteUsd
    };
    await this.writeAuditLog(narratorId, 'narrator_price_changed', { previous, perMinuteUsd, by: 'admin_team' });
    this.saveState();
    return { ...n };
  }

  /** Narrator asks for the «معلق بشري» badge; only the admin can grant it. */
  public async submitHumanVerification(narratorId: string, evidence: { selfieUrl: string; voiceUrl: string; text: string }): Promise<Narrator> {
    await this.ready;
    const n = this.narrators.find(item => item.id === narratorId);
    if (!n) throw new Error('المعلق غير موجود');
    if (n.humanBadge === 'verified') return { ...n };
    n.humanBadge = 'pending';
    n.humanVerification = { ...evidence, submittedAt: new Date().toISOString() };
    await this.writeAuditLog(narratorId, 'human_badge_requested', {});
    this.saveState();
    return { ...n };
  }

  /** Admin only: grant, withdraw or reset the «معلق بشري» badge. */
  public async setHumanBadge(narratorId: string, status: 'none' | 'pending' | 'verified'): Promise<Narrator> {
    await this.ready;
    const n = this.narrators.find(item => item.id === narratorId);
    if (!n) throw new Error('المعلق غير موجود');
    if (status === 'verified' && !n.humanVerification) throw new Error('لا يمكن منح الشارة قبل أن يرفع المعلق صورته وتسجيله');
    n.humanBadge = status;
    if (status !== 'pending') {
      this.pushNotification({
        narratorId,
        type: 'account',
        title: status === 'verified' ? 'تم منحك شارة «معلق بشري»' : 'تم سحب شارة «معلق بشري»',
        body: status === 'verified' ? 'اعتمدت الإدارة توثيقك وتظهر الشارة على ملفك الشخصي.' : 'تواصل مع فريق قيمة فويس لمعرفة السبب.'
      });
    }
    await this.writeAuditLog(narratorId, 'human_badge_' + status, { by: 'admin_team' });
    this.saveState();
    return { ...n };
  }

  public async setNarratorSuspended(narratorId: string, suspended: boolean): Promise<Narrator> {
    await this.ready;
    const n = this.narrators.find(item => item.id === narratorId);
    if (!n) throw new Error('المعلق غير موجود');
    n.status = suspended ? 'suspended' : (n.claimToken && n.kycStatus !== 'none' ? 'active' : 'invited');
    this.pushNotification({
      narratorId,
      type: 'account',
      title: suspended ? 'تم إيقاف حسابك مؤقتاً' : 'تم إعادة تفعيل حسابك',
      body: suspended ? 'تواصل مع فريق قيمة فويس لمعرفة السبب.' : 'يمكنك الآن استقبال الحجوزات من جديد.'
    });
    await this.writeAuditLog(narratorId, suspended ? 'narrator_suspended' : 'narrator_reactivated', { by: 'admin_team' });
    this.saveState();
    return { ...n };
  }

  public async addAdminNote(narratorId: string, text: string): Promise<Narrator> {
    await this.ready;
    const n = this.narrators.find(item => item.id === narratorId);
    if (!n) throw new Error('المعلق غير موجود');
    n.adminNotes = [{ id: `note_${Date.now()}`, text: text.trim(), at: new Date().toISOString() }, ...(n.adminNotes || [])];
    this.saveState();
    return { ...n };
  }

  public async sendAdminMessage(narratorId: string, title: string, body: string): Promise<void> {
    await this.ready;
    this.pushNotification({ narratorId, type: 'info', title, body });
    this.saveState();
  }

  // ==========================================
  // VOICE OVER BOOKINGS & EARNINGS
  // ==========================================

  /** Narrator matching a booking's talent name (e.g. "طارق.ش" -> "طارق الشمري"). */
  public findNarratorByTalentName(talentName: string): Narrator | undefined {
    const first = talentName.split(/[.\s]/)[0];
    return first ? this.narrators.find(n => n.displayName.startsWith(first)) : undefined;
  }

  /** Admin reviewed a client booking and forwarded it to the narrator: shows in their account + notification. */
  public async forwardBookingToNarrator(narratorId: string, b: {
    bookingRef: string; projectTitle: string; amount: number; scriptText: string;
    deadlineDays: number; usageLicense: string; notes?: string;
  }): Promise<VoiceOverBooking> {
    await this.ready;
    const narrator = this.narrators.find(n => n.id === narratorId);
    if (!narrator) throw new Error('المعلق غير موجود');
    const existing = this.voiceOverBookings.find(v => v.bookingRef === b.bookingRef);
    if (existing) return { ...existing };
    const now = new Date().toISOString();
    const booking: VoiceOverBooking = {
      id: `vob_${Date.now()}`, narratorId, status: 'in_progress', date: now.slice(0, 10), createdAt: now, ...b
    };
    this.voiceOverBookings.unshift(booking);
    this.pushNotification({
      narratorId, type: 'info',
      title: `حجز جديد بانتظارك (${b.bookingRef})`,
      body: `${b.projectTitle} · مدة التسليم ${b.deadlineDays} أيام · أتعابك $${b.amount}`
    });
    await this.writeAuditLog(narratorId, 'booking_forwarded', { bookingRef: b.bookingRef, amount: b.amount });
    this.saveState();
    return { ...booking };
  }

  public async getVoiceOverBookings(narratorId: string): Promise<VoiceOverBooking[]> {
    await this.ready;
    await new Promise(r => setTimeout(r, 200));
    return this.voiceOverBookings.filter(b => b.narratorId === narratorId);
  }

  public async getMonthlyEarnings(narratorId: string): Promise<{
    voThisMonth: number;
    aiThisMonth: number;
    totalMonthly: number;
    availableBalance: number;
  }> {
    await this.ready;
    await new Promise(r => setTimeout(r, 150));
    // Calculate October 2026 earnings
    const currentMonthPrefix = '2026-10';

    // Voice-Over bookings for narrator
    const bookings = this.voiceOverBookings.filter(b => b.narratorId === narratorId);
    const voThisMonth = bookings
      .filter(b => b.date.startsWith(currentMonthPrefix) && (b.status === 'paid' || b.status === 'completed'))
      .reduce((sum, b) => sum + b.amount, 0);

    // AI voice earnings are computed on the server (GET /api/v1/narrators/:id/earnings)
    const aiThisMonth = 0;

    // Available balance calculation: paid/completed VO bookings + AI earnings
    const totalAllTimeVo = bookings
      .filter(b => b.status === 'paid')
      .reduce((sum, b) => sum + b.amount, 0);

    const availableBalance = Number(totalAllTimeVo.toFixed(2));

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

  /** Email code (sent by the server) before changing the narrator's email; returns the masked address */
  public async sendVerificationCode(email: string): Promise<string> {
    await this.ready;
    const res = await fetch('/api/v1/narrators/otp/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ purpose: 'email', email }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'تعذر إرسال رمز التحقق');
    return data.sentTo;
  }

  public async verifyCode(email: string, code: string): Promise<void> {
    await this.ready;
    const res = await fetch('/api/v1/narrators/otp/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ purpose: 'email', email, code }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'رمز التحقق غير صحيح');
  }

  public async updateNarratorContact(narratorId: string, data: {
    displayName?: string;
    email?: string;
    phone?: string;
    country?: string;
    dialects?: string[];
  }): Promise<Narrator> {
    await this.ready;
    await new Promise(r => setTimeout(r, 400));
    const index = this.narrators.findIndex(n => n.id === narratorId);
    if (index === -1) throw new Error('المعلق غير مسجل');

    const narrator = this.narrators[index];
    const prevEmail = narrator.email;
    const prevPhone = narrator.phone;

    if (data.displayName) narrator.displayName = data.displayName;
    if (data.email) narrator.email = data.email;
    if (data.phone) narrator.phone = data.phone;
    if (data.country !== undefined) narrator.country = data.country;
    if (data.dialects) narrator.dialects = data.dialects;

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

/** Old free-text dialect names -> platform dialect keys (anything unknown, e.g. «خليجي عام», is dropped). */
const normalizeDialects = (list: string[] = []): string[] => {
  const keys = DIALECTS.map(d => d.key) as string[];
  const mapped = list.map(d => keys.includes(d) ? d
    : d.includes('فصحى') ? 'فصحى'
    : d.includes('سعودي') ? 'السعودية'
    : d.includes('إماراتي') ? 'الإمارات'
    : d.includes('مصري') ? 'مصر'
    : '').filter(Boolean);
  return [...new Set(mapped)];
};

export const narratorService = new NarratorService();
