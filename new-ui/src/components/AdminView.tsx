import React, { useState, useEffect } from 'react';
import { PLANS } from '../../shared/plans';
import { 
  ShieldAlert, 
  Building2, 
  Coins, 
  Power, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  FileAudio, 
  DollarSign, 
  Clock, 
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Download,
  RefreshCw,
  Sliders,
  Server,
  Check,
  X,
  UserCheck,
  Sparkles,
  Eye,
  CreditCard,
  ArrowUpRight,
  FileText,
  Volume2,
  Database,
  Cpu,
  TrendingUp,
  Wallet,
  Percent,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  LayoutDashboard,
  Menu,
  SlidersHorizontal,
  ExternalLink,
  Edit3,
  Briefcase,
  Users,
  BookOpen
} from 'lucide-react';
import { api } from '../lib/api';
import { Voice, HumanBooking, TalentPayout, SystemSettings } from '../types';
import { DevelopmentsDocModal } from './DevelopmentsDocModal';
import { AdminNarratorsSubView } from './admin/AdminNarratorsSubView';
import { AdminShell } from './admin/AdminShell';
import { AdminCollectionView } from './admin/AdminCollectionView';
import { AdminCustomersView } from './admin/AdminCustomersView';
import { AdminTtsView, DIALECT_AR } from './admin/AdminTtsView';
import { AdminTtsVoicesView } from './admin/AdminTtsVoicesView';
import { AI_VOICES_ENABLED } from '../../shared/features';
import { AdminPageEditor } from './admin/AdminPageEditor';
import { AdminGuidesView } from './admin/AdminGuidesView';
import { AdminReviewsView } from './admin/AdminReviewsView';
import { AdminRowadView } from './admin/AdminRowadView';
import { AdminJobsView } from './admin/AdminJobsView';
import { AdminVoicesView } from './admin/AdminVoicesView';
import { AdminSettingsView, type SettingsSection } from './admin/AdminSettingsView';
import { narratorService } from '../services/narratorService';
import type { Narrator } from '../types';
import { COLLECTIONS } from './admin/collectionsConfig';
import type { AdminTab } from './admin/adminNav';
import { ExcelButton } from './admin/adminUi';
import { exportToExcel } from '../lib/exportExcel';
import { fmtNum, fmtDate, fmtTime, fmtDateTime } from '../lib/format';
import { PLATFORM_COMMISSION_PERCENT } from '../../shared/pricing';

interface AdminViewProps {
  voices: Voice[];
  onVoiceToggled?: (voiceId: string, isActive: boolean) => void;
  onVoiceAdded?: (voice: Voice) => void;
  onVoiceUpdated?: (voice: Voice) => void;
  onNavigateToClaim?: (token: string) => void;
}


export const AdminView: React.FC<AdminViewProps> = ({ 
  voices, 
  onVoiceToggled, 
  onVoiceAdded, 
  onVoiceUpdated,
  onNavigateToClaim 
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [voicesSection, setVoicesSection] = useState<'human' | 'ai'>('human');
  const showAiVoices = AI_VOICES_ENABLED && voicesSection === 'ai';
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const [bookings, setBookings] = useState<HumanBooking[]>([]);
  const [payouts, setPayouts] = useState<TalentPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Search states
  const [voiceSearch, setVoiceSearch] = useState('');
  const [voiceTypeFilter, setVoiceTypeFilter] = useState<'all' | 'human' | 'ai'>('all');
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('all');
  const [bookingSearch, setBookingSearch] = useState('');

  // Audio Playback
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const [audioRef] = useState<HTMLAudioElement>(new Audio());

  // Grant Credits Modal / Form
  const [grantingCompanyId, setGrantingCompanyId] = useState('');
  const [grantAmount, setGrantAmount] = useState('50000');
  const [grantReason, setGrantReason] = useState('منحة رصيد تجريبي استثنائي');
  const [grantStatus, setGrantStatus] = useState<string | null>(null);

  // Script Preview Modal
  const [selectedBookingForScript, setSelectedBookingForScript] = useState<HumanBooking | null>(null);

  // Deliver Booking Modal
  const [deliveringBooking, setDeliveringBooking] = useState<HumanBooking | null>(null);
  const [deliverableAudioInput, setDeliverableAudioInput] = useState('');

  // Add Voice Modal
  const [showAddVoiceModal, setShowAddVoiceModal] = useState(false);
  const [newVoiceForm, setNewVoiceForm] = useState({
    name: '',
    nameEn: '',
    type: 'ai' as 'ai' | 'human',
    gender: 'male' as 'male' | 'female',
    dialect: 'gulf',
    dialectLabel: 'سعودي نجدي معاصر',
    style: 'commercial',
    styleLabel: 'إعلاني ورنان',
    provider: 'elevenlabs',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    bookingsCount: 140
  });

  // Edit Voice Modal
  const [editingVoice, setEditingVoice] = useState<Voice | null>(null);
  const [editVoiceForm, setEditVoiceForm] = useState({
    name: '',
    nameEn: '',
    dialectLabel: '',
    styleLabel: '',
    bookingsCount: 0,
    usageCount: '',
    trustYears: '',
    pricing: ''
  });
  const [savingVoiceEdit, setSavingVoiceEdit] = useState(false);

  // Load all admin data
  const loadAdminData = async () => {
    try {
      setRefreshing(true);
      const [overviewData, bookingsData, payoutsData] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminBookings(),
        api.getAdminPayouts()
      ]);

      setOverview(overviewData);
      setBookings(bookingsData.bookings || []);
      setPayouts(payoutsData.payouts || []);

      if (overviewData.companies?.[0] && !grantingCompanyId) {
        setGrantingCompanyId(overviewData.companies[0].id);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Live Generation Feed: refresh overview (incl. latest TTS studio generations) while on the home tab
  useEffect(() => {
    if (activeTab !== 'overview') return;
    const t = setInterval(() => api.getAdminOverview().then(setOverview).catch(() => {}), 15000);
    return () => clearInterval(t);
  }, [activeTab]);

  // Audio Playback effect
  const togglePlayAudio = (url: string) => {
    if (playingAudioUrl === url) {
      audioRef.pause();
      setPlayingAudioUrl(null);
    } else {
      audioRef.src = url;
      audioRef.play().catch(e => console.log('Audio playback error:', e));
      setPlayingAudioUrl(url);
    }
  };

  useEffect(() => {
    const handleEnded = () => setPlayingAudioUrl(null);
    audioRef.addEventListener('ended', handleEnded);
    return () => {
      audioRef.removeEventListener('ended', handleEnded);
      audioRef.pause();
    };
  }, [audioRef]);

  // Voice Toggle
  const handleToggleVoice = async (voice: Voice) => {
    try {
      const res = await api.toggleVoiceActive(voice.id);
      onVoiceToggled?.(voice.id, res.isActive);
      await loadAdminData();
    } catch (err) {
      console.error('Voice toggle failed:', err);
    }
  };

  // Add Voice Handler
  const handleAddVoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createAdminVoice(newVoiceForm);
      if (res.success && res.voice) {
        onVoiceAdded?.(res.voice);
        setShowAddVoiceModal(false);
        setNewVoiceForm({
          name: '',
          nameEn: '',
          type: 'ai',
          gender: 'male',
          dialect: 'gulf',
          dialectLabel: 'سعودي نجدي معاصر',
          style: 'commercial',
          styleLabel: 'إعلاني ورنان',
          provider: 'elevenlabs',
          previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
        });
        await loadAdminData();
      }
    } catch (err) {
      console.error('Add voice failed:', err);
    }
  };

  // Open Edit Voice Modal
  const openEditVoiceModal = (voice: Voice) => {
    setEditingVoice(voice);
    setEditVoiceForm({
      name: voice.name || '',
      nameEn: voice.nameEn || '',
      dialectLabel: voice.dialectLabel || '',
      styleLabel: voice.styleLabel || '',
      bookingsCount: voice.bookingsCount ?? (voice.type === 'human' ? 140 : 0),
      usageCount: voice.usageCount || (voice.type === 'human' ? '68' : '48.2K'),
      trustYears: voice.trustYears || (voice.type === 'human' ? '6y' : '2y'),
      pricing: voice.pricing || (voice.type === 'human' ? 'يبدأ من 50$' : 'مشمول بالرصيد')
    });
  };

  // Save Voice Edit Handler
  const handleSaveVoiceEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoice) return;
    try {
      setSavingVoiceEdit(true);
      const res = await api.updateAdminVoice(editingVoice.id, {
        name: editVoiceForm.name,
        nameEn: editVoiceForm.nameEn,
        dialectLabel: editVoiceForm.dialectLabel,
        styleLabel: editVoiceForm.styleLabel,
        bookingsCount: Number(editVoiceForm.bookingsCount),
        usageCount: editVoiceForm.usageCount,
        trustYears: editVoiceForm.trustYears,
        pricing: editVoiceForm.pricing
      });
      if (res.success && res.voice) {
        onVoiceUpdated?.(res.voice);
        setEditingVoice(null);
        await loadAdminData();
      }
    } catch (err) {
      console.error('Failed to update voice:', err);
    } finally {
      setSavingVoiceEdit(false);
    }
  };

  // Grant Credits
  const handleGrantCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantingCompanyId || !grantAmount) return;

    try {
      setGrantStatus('جاري معالجة المنحة وتحديث دفتر الأستاذ (Ledger)...');
      const res = await api.grantCredits({
        companyId: grantingCompanyId,
        amountCredits: Number(grantAmount),
        reason: grantReason
      });

      setGrantStatus(`✅ ${res.message}`);
      await loadAdminData();
      setTimeout(() => setGrantStatus(null), 4000);
    } catch (err) {
      setGrantStatus('❌ فشل منح النقاط. يرجى مراجعة الصلاحيات');
      setTimeout(() => setGrantStatus(null), 4000);
    }
  };

  // Review a client booking, then forward it to the narrator (shows in their account + notification)
  const [reviewingBooking, setReviewingBooking] = useState<HumanBooking | null>(null);
  const [forwardNarratorId, setForwardNarratorId] = useState('');
  const [narratorsList, setNarratorsList] = useState<Narrator[]>([]);
  const [forwarding, setForwarding] = useState(false);
  const LICENSE_AR: Record<HumanBooking['usageLicense'], string> = {
    commercial_ads: 'إعلانات تجارية', internal_corporate: 'استخدام داخلي', broadcast_tv: 'بث تلفزيوني', elearning: 'تعليم إلكتروني'
  };
  const openForwardReview = async (b: HumanBooking) => {
    const list = await narratorService.getAllNarrators();
    setNarratorsList(list);
    setForwardNarratorId(narratorService.findNarratorByTalentName(b.talentName)?.id || list[0]?.id || '');
    setReviewingBooking(b);
  };
  const confirmForward = async () => {
    if (!reviewingBooking || !forwardNarratorId) return;
    const b = reviewingBooking;
    setForwarding(true);
    try {
      await narratorService.forwardBookingToNarrator(forwardNarratorId, {
        bookingRef: b.id,
        projectTitle: `${LICENSE_AR[b.usageLicense]} (${b.id})`,
        amount: b.talentPayoutUsd,
        scriptText: b.scriptText,
        deadlineDays: b.deadlineDays,
        usageLicense: LICENSE_AR[b.usageLicense],
        notes: b.notes
      });
      setReviewingBooking(null);
      await handleUpdateBookingStatus(b.id, 'in_studio');
    } catch (err: any) {
      alert(err.message || 'تعذر تحويل الحجز');
    } finally { setForwarding(false); }
  };

  // Update Booking Status
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: HumanBooking['status'], deliverableUrl?: string) => {
    try {
      await api.updateBookingStatus(bookingId, newStatus, deliverableUrl);
      setDeliveringBooking(null);
      setDeliverableAudioInput('');
      await loadAdminData();
    } catch (err) {
      console.error('Update booking status failed:', err);
    }
  };

  // Process Talent Payout
  const handleProcessPayout = async (talentId: string, amount: number) => {
    if (!confirm(`هل أنت متأكد من تحويل مستحقات بقيمة $${fmtNum(amount)} USD لحساب المعلق البنكي؟`)) {
      return;
    }

    try {
      await api.processTalentPayout(talentId, amount);
      await loadAdminData();
    } catch (err) {
      console.error('Process payout failed:', err);
    }
  };

  // Update Company Plan
  const handleUpgradeCompanyPlan = async (companyId: string, newPlanId: string) => {
    try {
      await api.updateAdminCompanyPlan(companyId, newPlanId);
      await loadAdminData();
    } catch (err) {
      console.error('Upgrade company plan failed:', err);
    }
  };

  // Filtered Voices
  const filteredVoices = voices.filter(v => {
    const matchesSearch = v.name.includes(voiceSearch) || (v.dialectLabel && v.dialectLabel.includes(voiceSearch));
    const matchesType = voiceTypeFilter === 'all' || v.type === voiceTypeFilter;
    return matchesSearch && matchesType;
  });

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = bookingFilterStatus === 'all' || b.status === bookingFilterStatus;
    const matchesSearch = b.companyName.includes(bookingSearch) || b.talentName.includes(bookingSearch) || b.id.includes(bookingSearch);
    return matchesStatus && matchesSearch;
  });

  const BOOKING_STATUS_AR: Record<HumanBooking['status'], string> = { pending: 'بانتظار المراجعة', in_studio: 'استوديو التسجيل', delivered: 'تم التسليم', approved: 'معتمد ومكتمل', canceled: 'ملغي' };
  const exportBookings = () => exportToExcel<HumanBooking>('bookings', 'الحجوزات', [
    { header: 'رقم الحجز', value: 'id', width: 14 },
    { header: 'العميل', value: 'companyName', width: 26 },
    { header: 'المعلق', value: 'talentName' },
    { header: 'النص', value: 'scriptText', width: 60 },
    { header: 'مدة التسليم (أيام)', value: 'deadlineDays', width: 14 },
    { header: 'الترخيص', value: 'usageLicense', width: 18 },
    { header: 'السعر النهائي ($)', value: 'priceUsd', width: 14 },
    { header: 'سعر المعلق ($)', value: 'talentPayoutUsd', width: 14 },
    { header: 'عمولة المنصة ($)', value: b => Math.round((b.priceUsd - b.talentPayoutUsd) * 100) / 100, width: 14 },
    { header: 'الحالة', value: b => BOOKING_STATUS_AR[b.status] },
    { header: 'تاريخ الإنشاء', value: b => fmtDate(b.createdAt) },
    { header: 'آخر تحديث', value: b => fmtDate(b.updatedAt) }
  ], filteredBookings);
  const exportVoices = () => exportToExcel<Voice>('voices', 'الأصوات', [
    { header: 'المعرّف', value: 'id', width: 24 },
    { header: 'الاسم', value: 'name' },
    { header: 'النوع', value: v => v.type === 'human' ? 'بشري' : 'ذكاء اصطناعي' },
    { header: 'الجنس', value: v => v.gender === 'male' ? 'ذكر' : 'أنثى' },
    { header: 'اللهجة', value: 'dialectLabel' },
    { header: 'الأسلوب', value: 'styleLabel' },
    { header: 'المزوّد', value: 'provider' },
    { header: 'السعر', value: v => v.pricing || '' },
    { header: 'عدد الحجوزات', value: v => v.bookingsCount ?? '' },
    { header: 'مفعّل', value: v => v.isActive ? 'نعم' : 'لا' }
  ], filteredVoices);

  // ── Earnings by source: human bookings vs TTS studio ──
  const [ttsGenerations, setTtsGenerations] = useState<any[]>([]);
  const [aiUsage, setAiUsage] = useState<any[]>([]);
  useEffect(() => {
    if (activeTab !== 'financials') return;
    api.getAdminGenerations().then(setTtsGenerations).catch(() => {});
    fetch('/api/v1/admin/narrator-earnings').then(r => r.json()).then(d => setAiUsage(d.earnings)).catch(() => {});
  }, [activeTab]);
  const money = (n: number) => Math.round(n * 100) / 100;
  // Credits consumed are valued at the customer's plan price per credit (free plans have no cash value)
  const planCreditPrice = (companyId: string) => {
    const planId = overview?.companies?.find((c: any) => c.id === companyId)?.planId;
    const plan = PLANS.find(pl => pl.id === planId);
    return plan && plan.priceUsd && plan.monthlyCredits ? plan.priceUsd / plan.monthlyCredits : 0;
  };
  const bookingsRevenue = bookings.reduce((a, b) => a + (b.priceUsd || 0), 0);
  const bookingsNarrators = bookings.reduce((a, b) => a + (b.talentPayoutUsd || 0), 0);
  const ttsCreditsRevenue = ttsGenerations.reduce((a, g) => a + (g.creditsConsumed || 0) * planCreditPrice(g.companyId), 0);
  const ttsRevenue = ttsCreditsRevenue;
  const ttsNarrators = aiUsage.reduce((a, u) => a + (u.narratorUsd || 0), 0);
  const ttsProviderCost = ttsGenerations.reduce((a, g) => a + (g.costUsd || 0), 0);
  const earningsRows = [
    { source: 'الحجوزات البشرية', revenue: bookingsRevenue, narrators: bookingsNarrators, cost: 0 },
    { source: 'استوديو TTS', revenue: ttsRevenue, narrators: ttsNarrators, cost: ttsProviderCost }
  ].map(r => ({ ...r, platform: r.revenue - r.narrators - r.cost }));
  const earningsTotal = earningsRows.reduce((t, r) => ({ source: 'الإجمالي', revenue: t.revenue + r.revenue, narrators: t.narrators + r.narrators, cost: t.cost + r.cost, platform: t.platform + r.platform }), { source: 'الإجمالي', revenue: 0, narrators: 0, cost: 0, platform: 0 });
  const exportEarningsBreakdown = () => exportToExcel<typeof earningsTotal>('earnings-breakdown', 'تفصيل الأرباح', [
    { header: 'المصدر', value: 'source', width: 22 },
    { header: 'الإيراد ($)', value: r => money(r.revenue), width: 14 },
    { header: 'مستحقات المعلقين ($)', value: r => money(r.narrators), width: 20 },
    { header: 'تكلفة التشغيل ($)', value: r => money(r.cost), width: 16 },
    { header: 'أرباح المنصة ($)', value: r => money(r.platform), width: 16 }
  ], [...earningsRows, earningsTotal]);

  // Money in: one transaction per client booking
  const [transactionSearch, setTransactionSearch] = useState('');
  const filteredTransactions = bookings.filter(b => {
    const q = transactionSearch.trim();
    return !q || b.id.includes(q) || b.companyName.includes(q) || b.talentName.includes(q);
  });
  const exportTransactions = () => exportToExcel<HumanBooking>('transactions', 'المعاملات', [
    { header: 'رقم المعاملة', value: 'id', width: 16 },
    { header: 'الدافع (العميل)', value: 'companyName', width: 26 },
    { header: 'المستفيد (المعلق)', value: 'talentName', width: 22 },
    { header: 'نوع المعاملة', value: () => 'حجز تعليق صوتي', width: 18 },
    { header: 'المبلغ المدفوع ($)', value: 'priceUsd', width: 16 },
    { header: 'حصة المعلق ($)', value: 'talentPayoutUsd', width: 14 },
    { header: 'عمولة المنصة ($)', value: b => Math.round((b.priceUsd - b.talentPayoutUsd) * 100) / 100, width: 14 },
    { header: 'الحالة', value: b => BOOKING_STATUS_AR[b.status] },
    { header: 'تاريخ الإنشاء', value: b => fmtDate(b.createdAt) }
  ], filteredTransactions);
  const exportPayouts = () => exportToExcel<TalentPayout>('earnings', 'الأرباح', [
    { header: 'المعلق الصوتي', value: 'talentName', width: 24 },
    { header: 'اللهجة', value: 'dialect', width: 18 },
    { header: 'المشاريع المنجزة', value: 'completedBookingsCount', width: 14 },
    { header: 'إجمالي الأتعاب ($)', value: 'totalEarningsUsd', width: 16 },
    { header: 'المسدد سابقاً ($)', value: 'paidOutUsd', width: 16 },
    { header: 'الرصيد المعلق ($)', value: 'pendingBalanceUsd', width: 16 },
    { header: 'البنك', value: 'bankName', width: 20 },
    { header: 'الآيبان', value: 'iban', width: 30 }
  ], payouts);

  const pendingBookingsCount = bookings.filter(b => b.status === 'pending' || b.status === 'in_studio').length;

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-12 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-text mb-4" />
        <p className="text-sm font-bold text-slate-700">جاري تحميل لوحة التحكم الإدارية المتقدمة...</p>
        <p className="text-xs text-slate-400 mt-1">قراءة مؤشرات النظام، خط الإنتاج، ودفاتر الأستاذ</p>
      </div>
    );
  }

  return (
    <AdminShell
      activeTab={activeTab}
      onSelect={setActiveTab}
      badges={{ bookings: pendingBookingsCount }}
      actions={
        <>
          {activeTab === 'financials' && <ExcelButton onClick={exportPayouts} disabled={payouts.length === 0} />}
          {activeTab === 'transactions' && <ExcelButton onClick={exportTransactions} disabled={filteredTransactions.length === 0} />}
          {activeTab === 'bookings' && <ExcelButton onClick={exportBookings} disabled={filteredBookings.length === 0} />}
          {activeTab === 'voices' && showAiVoices && <ExcelButton onClick={exportVoices} disabled={filteredVoices.length === 0} />}
          {activeTab === 'voices' && showAiVoices && (
            <button
              onClick={() => setShowAddVoiceModal(true)}
              className="px-3.5 py-2 rounded-xl bg-brand hover:bg-brand-orange text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صوت للكتالوج</span>
            </button>
          )}
          <button
            onClick={loadAdminData}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-text' : ''}`} />
            <span>مزامنة</span>
          </button>
          <button
            onClick={() => setIsDocModalOpen(true)}
            className="hidden md:flex px-3.5 py-2 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-white text-xs font-bold items-center gap-2 cursor-pointer"
            title="تقرير التطويرات والتحديثات المنجزة"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-text" />
            <span>تقرير التطويرات</span>
          </button>
        </>
      }
    >
      {/* Content / constants / mailbox collections (articles, FAQs, guides, ...) */}
      {COLLECTIONS[activeTab] && activeTab !== 'jobs' && <AdminCollectionView key={activeTab} name={activeTab} />}
      {activeTab === 'jobs' && <AdminJobsView />}

      {/* Plans (read-only, single source: shared/plans.ts) */}
      {activeTab === 'plans' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <p className="text-xs text-slate-500">الباقات تُعرَّف في ملف <span className="font-mono">shared/plans.ts</span> وتنعكس تلقائياً في صفحة الأسعار ولوحة العميل والفوترة. لتغيير أي رقم عدّله هناك.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="text-slate-400">
                  <th className="p-3 font-bold">الباقة</th>
                  <th className="p-3 font-bold">السعر الشهري</th>
                  <th className="p-3 font-bold">السعر عند الدفع السنوي</th>
                  <th className="p-3 font-bold">الحروف شهرياً</th>
                  <th className="p-3 font-bold">خصم حجوزات المعلقين</th>
                  <th className="p-3 font-bold">المزايا</th>
                </tr>
              </thead>
              <tbody>
                {PLANS.map(pl => (
                  <tr key={pl.id} className="border-t border-slate-100">
                    <td className="p-3 font-bold text-slate-900">{pl.nameAr}{pl.featured && <span className="mr-2 text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-brand-text border border-orange-200">{pl.badge}</span>}</td>
                    <td className="p-3 font-mono">{pl.priceUsd === null ? 'سعر مخصص' : pl.priceUsd === 0 ? 'مجاني' : `$${pl.priceUsd}`}</td>
                    <td className="p-3 font-mono">{pl.annualPriceUsd === null ? '-' : pl.annualPriceUsd === 0 ? 'مجاني' : `$${pl.annualPriceUsd}`}</td>
                    <td className="p-3 font-mono">{pl.monthlyCredits ? fmtNum(pl.monthlyCredits) : (pl.isCustom ? 'حسب الاتفاق' : '5,000 ترحيبي')}</td>
                    <td className="p-3 font-mono">{pl.bookingDiscountPct ? `${pl.bookingDiscountPct}%` : '-'}</td>
                    <td className="p-3 text-slate-600">{pl.features.map(f => f.text).join(' • ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW & KPIS */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* High-level KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">إيرادات حجوزات الاستوديو</span>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-slate-900">
                  ${fmtNum(overview?.totalBookingsRevenueUsd)}
                </span>
                <span className="text-xs font-bold text-slate-500">USD</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>
                  {(() => {
                    const c = overview?.bookingCounts;
                    if (!c) return 'بدون الطلبات الملغاة';
                    const growth = c.lastMonth ? Math.round(((c.thisMonth - c.lastMonth) / c.lastMonth) * 100) : null;
                    return `هذا الشهر ${fmtNum(c.thisMonth)} طلب · الشهر الماضي ${fmtNum(c.lastMonth)}${growth !== null ? ` (${growth > 0 ? '+' : ''}${growth}%)` : ''}`;
                  })()}
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">طلبات حجز الأصوات</span>
                <span className="p-2 bg-orange-50 text-brand-text rounded-xl">
                  <Percent className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-brand-text">
                  {fmtNum(overview?.bookingCounts?.total ?? bookings.length)}
                </span>
                <span className="text-xs font-bold text-slate-500">طلب</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                {overview?.bookingCounts
                  ? `مكتمل ${fmtNum(overview.bookingCounts.completed)} · قيد التنفيذ ${fmtNum(overview.bookingCounts.active)} · ملغي ${fmtNum(overview.bookingCounts.canceled)}`
                  : `مستحقات المعلقين: $${fmtNum(overview?.totalTalentPayoutsUsd)} USD`}
              </div>
              {overview?.lastBookingAt && (
                <div className="mt-1 text-[10px] text-slate-400">آخر طلب: {fmtDateTime(overview.lastBookingAt)}</div>
              )}
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">حروف AI المولدة</span>
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Coins className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-slate-900">
                  {fmtNum(overview?.totalCharsGenerated)}
                </span>
                <span className="text-xs font-bold text-slate-500">حرف</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                {fmtNum(overview?.totalGenerations ?? 0)} عملية صوتية منجزة
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">تكلفة موفري الذكاء الاصطناعي</span>
                <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Cpu className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-purple-700">
                  ${overview?.totalSystemCostUsd ?? 0}
                </span>
                <span className="text-xs font-bold text-slate-500">USD</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                {overview?.customersCount !== undefined
                  ? `${fmtNum(overview.customersCount)} عميل · ${fmtNum(overview.narratorsCount)} معلق · ${fmtNum(overview.humanVoicesCount)} عينة صوتية`
                  : 'تكلفة التوليد الفعلية من سجل العمليات'}
              </div>
            </div>
          </div>

          {/* Infrastructure Pulse Matrix */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-brand-text" />
                <span>مصفوفة صحة الخدمات السحابية (Infrastructure Pulse)</span>
              </h3>
              <span className="text-xs font-semibold text-slate-400">حالة ربط مفاتيح الخدمة</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'ElevenLabs (استوديو TTS)', on: overview?.providers?.elevenlabs },
                { name: 'Google AI Studio (الشات بوت)', on: overview?.providers?.gemini }
              ].map(p => (
                <div key={p.name} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{p.name}</span>
                    <span className={`w-2 h-2 rounded-full ${p.on ? 'bg-emerald-500' : p.on === false ? 'bg-rose-500' : 'bg-slate-300'}`} />
                  </div>
                  <div className="text-xs text-slate-500">
                    {p.on ? 'المفتاح مضاف ومفعّل' : p.on === false ? 'المفتاح غير مضاف: أضفه من الإعدادات' : 'غير معروف'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Operations & Recent Generations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent Live Generations (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-blue-600" />
                  <span>أحدث توليدات أستوديو TTS</span>
                </h3>
                <button onClick={() => setActiveTab('tts')} className="text-[11px] font-bold text-brand-text hover:underline cursor-pointer">عرض الكل في استوديو TTS</button>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {overview?.recentGenerations && overview.recentGenerations.length > 0 ? (
                  overview.recentGenerations.map((gen: any) => (
                    <div
                      key={gen.id}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <button
                          onClick={() => togglePlayAudio(gen.audioUrl)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                            playingAudioUrl === gen.audioUrl
                              ? 'bg-brand text-white'
                              : 'bg-white text-slate-700 hover:bg-brand hover:text-white border border-slate-200'
                          }`}
                        >
                          {playingAudioUrl === gen.audioUrl ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 mr-0.5" />
                          )}
                        </button>

                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{gen.voiceName}</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-100/80 text-brand-text">
                              {DIALECT_AR[gen.dialect] || gen.dialect}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{gen.companyName} · {gen.userName}</p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5 max-w-[280px]">
                            {gen.text}
                          </p>
                        </div>
                      </div>

                      <div className="text-left shrink-0 font-mono text-[11px]">
                        <span className="font-bold text-slate-800">
                          {fmtNum(gen.creditsConsumed)} حرف
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {fmtDateTime(gen.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">لا توجد عمليات توليد حديثة</p>
                )}
              </div>
            </div>

            {/* Quick Credit Grant Form (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-brand-text" />
                  <span>منح رصيد استثنائي لشركة (Credit Grant)</span>
                </h3>
              </div>

              <form onSubmit={handleGrantCredits} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">اختر الشركة</label>
                  <select
                    value={grantingCompanyId}
                    onChange={(e) => setGrantingCompanyId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-brand"
                  >
                    {overview?.companies?.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (الرصيد: {fmtNum(c.balance)} حرف)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    عدد النقاط / الحروف (1 Credit = 1 Char)
                  </label>
                  <input
                    type="number"
                    value={grantAmount}
                    onChange={(e) => setGrantAmount(e.target.value)}
                    step="5000"
                    min="1000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">السبب المحاسبي للتوثيق</label>
                  <input
                    type="text"
                    value={grantReason}
                    onChange={(e) => setGrantReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-brand"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-ink hover:bg-brand-ink/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5 text-brand-text" />
                  <span>تأكيد الإيداع في رصيد المنشأة</span>
                </button>

                {grantStatus && (
                  <div className="p-2.5 rounded-xl bg-slate-100 text-[11px] font-semibold text-slate-700 text-center animate-fade-in">
                    {grantStatus}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: NARRATORS & CLAIM PROFILES MANAGEMENT */}
      {/* ========================================================= */}
      {(activeTab === 'narrators' || activeTab === 'samples') && (
        <AdminNarratorsSubView
          view={activeTab === 'samples' ? 'samples' : 'narrators'}
          onNavigateToClaim={(token) => onNavigateToClaim?.(token)}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 2: STUDIO BOOKINGS PIPELINE */}
      {/* ========================================================= */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: 'كافة الطلبات' },
                { id: 'pending', label: 'بانتظار المراجعة' },
                { id: 'in_studio', label: 'استوديو التسجيل' },
                { id: 'delivered', label: 'تم التسليم' },
                { id: 'approved', label: 'معتمد ومكتمل' },
                { id: 'canceled', label: 'ملغي' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setBookingFilterStatus(f.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bookingFilterStatus === f.id
                      ? 'bg-brand-ink text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="بحث برقم الحجز أو الشركة أو المعلق..."
                className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-brand"
              />
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileAudio className="w-4 h-4 text-brand-text" />
                <span>قائمة طلبات حجز وتسجيل الأصوات البشرية ({filteredBookings.length})</span>
              </h3>
              <span className="text-xs text-slate-400">معالجة التسجيلات والاستلام والتسليم للمنشآت</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-[11px]">
                    <th className="py-3 px-4 font-bold">رقم الحجز</th>
                    <th className="py-3 px-4 font-bold">الشركة المستفيدة</th>
                    <th className="py-3 px-4 font-bold">المعلق الصوتي</th>
                    <th className="py-3 px-4 font-bold">الترخيص والموعد</th>
                    <th className="py-3 px-4 font-bold">القيمة ($ USD)</th>
                    <th className="py-3 px-4 font-bold">الحالة الحالية</th>
                    <th className="py-3 px-4 font-bold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => {
                    const statusConfig = {
                      pending: { label: 'بانتظار المراجعة', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
                      in_studio: { label: 'في الاستوديو', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
                      delivered: { label: 'تم التسليم', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
                      approved: { label: 'معتمد ومكتمل', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                      canceled: { label: 'ملغي', bg: 'bg-slate-100 text-slate-600 border-slate-200' }
                    }[b.status];

                    return (
                      <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{b.companyName}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand" />
                            <span className="font-bold text-slate-800">{b.talentName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div>
                            <span className="font-semibold block text-[11px]">
                              {b.usageLicense === 'commercial_ads' && 'إعلانات تجارية'}
                              {b.usageLicense === 'broadcast_tv' && 'بث تلفزيوني'}
                              {b.usageLicense === 'elearning' && 'تعليم إلكتروني'}
                              {b.usageLicense === 'internal_corporate' && 'استخدام داخلي'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              خلال {b.deadlineDays} أيام
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-bold text-slate-900 block">${fmtNum(b.priceUsd)} USD</span>
                          <span className="text-[10px] text-slate-400">
                            سعر المعلق (قبل عمولة 30%): ${fmtNum(b.talentPayoutUsd)} USD
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusConfig.bg}`}>
                            {statusConfig.label}
                          </span>
                          {b.review && (
                            <span className="block mt-1.5 text-[11px] text-amber-500 tracking-tight" title={b.review.text || 'بدون تعليق'}>
                              {'★'.repeat(b.review.rating)}{'☆'.repeat(5 - b.review.rating)}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View Script */}
                            <button
                              onClick={() => setSelectedBookingForScript(b)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                              title="عرض الاسكريبت والملاحظات"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Listen if delivered */}
                            {b.deliverableAudioUrl && (
                              <button
                                onClick={() => togglePlayAudio(b.deliverableAudioUrl!)}
                                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                  playingAudioUrl === b.deliverableAudioUrl
                                    ? 'bg-brand text-white'
                                    : 'bg-orange-50 hover:bg-orange-100 text-brand-text'
                                }`}
                                title="الاستماع للملف المسلم"
                              >
                                {playingAudioUrl === b.deliverableAudioUrl ? (
                                  <Pause className="w-3.5 h-3.5" />
                                ) : (
                                  <Play className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}

                            {/* Status transitions */}
                            {b.status === 'pending' && (
                              <button
                                onClick={() => openForwardReview(b)}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-all cursor-pointer"
                              >
                                تحويل للاستوديو
                              </button>
                            )}

                            {b.status === 'in_studio' && (
                              <button
                                onClick={() => setDeliveringBooking(b)}
                                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold transition-all cursor-pointer"
                              >
                                تسليم الملف
                              </button>
                            )}

                            {b.status === 'delivered' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'approved')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-all cursor-pointer"
                              >
                                اعتماد نهائي
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: VOICES & TALENTS DIRECTORY */}
      {/* ========================================================= */}
      {/* AI voices section only while the AI product is enabled (shared/features.ts) */}
      {activeTab === 'voices' && AI_VOICES_ENABLED && (
        <div className="flex items-center gap-2 mb-5">
          {([['human', 'الأصوات البشرية (المكتبة)'], ['ai', 'أصوات الذكاء الاصطناعي']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setVoicesSection(id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${voicesSection === id ? 'bg-brand-ink text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>{label}</button>
          ))}
        </div>
      )}
      {activeTab === 'voices' && showAiVoices && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVoiceTypeFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  voiceTypeFilter === 'all'
                    ? 'bg-brand-ink text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                كافة الأصوات ({voices.length})
              </button>
              <button
                onClick={() => setVoiceTypeFilter('human')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  voiceTypeFilter === 'human'
                    ? 'bg-brand-ink text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الأصوات البشرية ({voices.filter(v => v.type === 'human').length})
              </button>
              <button
                onClick={() => setVoiceTypeFilter('ai')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  voiceTypeFilter === 'ai'
                    ? 'bg-brand-ink text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الذكاء الاصطناعي ({voices.filter(v => v.type === 'ai').length})
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={voiceSearch}
                  onChange={(e) => setVoiceSearch(e.target.value)}
                  placeholder="بحث باسم الصوت أو اللهجة..."
                  className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-brand"
                />
              </div>

              <button
                onClick={() => setShowAddVoiceModal(true)}
                className="px-3.5 py-2 bg-brand hover:bg-brand-orange text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة صوت</span>
              </button>
            </div>
          </div>

          {/* Voices Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVoices.map(voice => (
              <div
                key={voice.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={voice.avatar}
                      alt={voice.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{voice.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            voice.type === 'human'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {voice.type === 'human' ? 'بشري موثق' : 'ذكاء اصطناعي'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{voice.dialectLabel}</p>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        {voice.styleLabel} • {voice.gender === 'male' ? 'صوت رجالي' : 'صوت نسائي'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => togglePlayAudio(voice.previewUrl)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      playingAudioUrl === voice.previewUrl
                        ? 'bg-brand text-white'
                        : 'bg-slate-100 hover:bg-brand hover:text-white text-slate-600'
                    }`}
                  >
                    {playingAudioUrl === voice.previewUrl ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5 mr-0.5" />
                    )}
                  </button>
                </div>

                {/* Metrics Badges Row */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100/80 text-[11px]">
                  {voice.type === 'human' ? (
                    <div className="bg-orange-50/80 p-2 rounded-xl border border-orange-200/60 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-brand-text shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-500">حجوزات الاستوديو</div>
                        <div className="font-bold font-mono text-slate-900">{voice.bookingsCount || 140} حجز</div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50/80 p-2 rounded-xl border border-blue-200/60 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-500">توليد الذكاء الاصطناعي</div>
                        <div className="font-bold text-slate-900">فوري ومخصص</div>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-500">{voice.type === 'human' ? 'عملاء وثقوا به' : 'مستخدمو النموذج'}</div>
                      <div className="font-bold font-mono text-slate-900">{voice.usageCount || (voice.type === 'human' ? '68' : '48.2K')}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                    <span className="font-mono text-slate-400">{voice.provider}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditVoiceModal(voice)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      title="تعديل بيانات وإحصائيات الصوت"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                      <span>تعديل</span>
                    </button>

                    <button
                      onClick={() => handleToggleVoice(voice)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        voice.isActive
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{voice.isActive ? 'مفعل' : 'معطل'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: COMPANIES & CREDIT LEDGER */}
      {/* ========================================================= */}
      {activeTab === 'companies' && <AdminCustomersView />}

      {activeTab === 'tts' && <AdminTtsView />}
      {activeTab === 'ttsVoices' && <AdminTtsVoicesView />}
      {activeTab === 'guides' && <AdminGuidesView />}
      {activeTab === 'reviews' && <AdminReviewsView />}
      {activeTab === 'rowad' && <AdminRowadView />}
      {activeTab.startsWith('settings-') && <AdminSettingsView key={activeTab} section={activeTab.replace('settings-', '') as SettingsSection} />}

      {activeTab === 'voices' && !showAiVoices && <AdminVoicesView />}
      {activeTab === 'page-privacy' && <AdminPageEditor pageKey="privacy" />}
      {activeTab === 'page-terms' && <AdminPageEditor pageKey="terms" />}
      {activeTab === 'page-about' && <AdminPageEditor pageKey="about" />}

      {activeTab === 'financials' && (
        <div className="space-y-6">
          {/* Earnings by source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">إيرادات حجوزات المعلقين البشريين</span>
              <div className="mt-2 text-2xl font-black font-mono text-slate-900">${fmtNum(money(earningsRows[0].revenue))}</div>
              <p className="text-[11px] text-slate-400 mt-1">ما دفعه العملاء مقابل حجز المعلقين</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">إيرادات حجوزات الاستوديو</span>
              <div className="mt-2 text-2xl font-black font-mono text-slate-900">${fmtNum(money(earningsRows[1].revenue))}</div>
              <p className="text-[11px] text-slate-400 mt-1">استوديو TTS (تقديري حسب باقات العملاء)</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">أرباح المنصة</span>
              <div className="mt-2 text-2xl font-black font-mono text-emerald-600">${fmtNum(money(earningsTotal.platform))}</div>
              <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                <div className="flex items-center justify-between"><span className="text-slate-500">من الحجوزات البشرية</span><span className="font-mono font-bold text-slate-800">${fmtNum(money(earningsRows[0].platform))}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-500">من استوديو TTS</span><span className="font-mono font-bold text-slate-800">${fmtNum(money(earningsRows[1].platform))}</span></div>
              </div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">أرباح المعلقين</span>
              <div className="mt-2 text-2xl font-black font-mono text-slate-900">${fmtNum(money(earningsTotal.narrators))}</div>
              <p className="text-[11px] text-amber-600 font-medium mt-1">منها ${fmtNum(payouts.reduce((acc, p) => acc + (p.pendingBalanceUsd || 0), 0))} بانتظار الصرف</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">تفصيل الأرباح حسب المصدر</h3>
                <p className="text-xs text-slate-400 mt-0.5">الإيراد، حصة المعلقين، وما يبقى للمنصة من كل مصدر على حدة</p>
              </div>
              <button onClick={exportEarningsBreakdown} className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold cursor-pointer whitespace-nowrap">تصدير التفصيل</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-[11px]">
                    <th className="py-3 px-4 font-bold">المصدر</th>
                    <th className="py-3 px-4 font-bold font-mono">الإيراد ($)</th>
                    <th className="py-3 px-4 font-bold font-mono">مستحقات المعلقين ($)</th>
                    <th className="py-3 px-4 font-bold font-mono">تكلفة التشغيل ($)</th>
                    <th className="py-3 px-4 font-bold font-mono text-emerald-600">أرباح المنصة ($)</th>
                    <th className="py-3 px-4 font-bold font-mono">الهامش</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...earningsRows, earningsTotal].map((r, i, arr) => (
                    <tr key={r.source} className={i === arr.length - 1 ? 'bg-slate-50/80 font-black' : 'hover:bg-slate-50/60'}>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{r.source}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-900">${fmtNum(money(r.revenue))}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">${fmtNum(money(r.narrators))}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">${fmtNum(money(r.cost))}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">${fmtNum(money(r.platform))}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{r.revenue > 0 ? `${Math.round((r.platform / r.revenue) * 100)}%` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="px-5 py-3 text-[11px] text-slate-400 border-t border-slate-100 leading-relaxed">
              الحجوزات البشرية: الإيراد = سعر الحجز للعميل، ومستحقات المعلقين = أتعابهم. استوديو TTS: الإيراد = الحروف المستهلكة بسعر باقة العميل (الباقة المجانية بلا قيمة نقدية)، ومستحقات المعلقين = حصتهم من أصواتهم عند كل استخدام، وتكلفة التشغيل = تكلفة مزوّد التوليد.
            </p>
          </div>

          {/* Talent Payouts Ledger Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>دفتر تسويات مستحقات المعلقين الصوتيين (Talent Payouts Ledger)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  حساب الأتعاب (سعر المعلق الخاص)، أرقام الآيبان، والتحويلات المعتمدة بالدولار الأمريكي
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-[11px]">
                    <th className="py-3 px-4 font-bold">المعلق الصوتي</th>
                    <th className="py-3 px-4 font-bold">اللهجة والتخصص</th>
                    <th className="py-3 px-4 font-bold font-mono">المشاريع المنجزة</th>
                    <th className="py-3 px-4 font-bold font-mono">إجمالي الأتعاب ($)</th>
                    <th className="py-3 px-4 font-bold font-mono">المسدد سابقاً ($)</th>
                    <th className="py-3 px-4 font-bold font-mono text-amber-600">الرصيد المعلق ($)</th>
                    <th className="py-3 px-4 font-bold">الحساب البنكي والآيبان</th>
                    <th className="py-3 px-4 font-bold text-center">إجراء الصرف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payouts.map(p => (
                    <tr key={p.talentId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.avatar}
                            alt={p.talentName}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                          />
                          <span className="font-bold text-slate-900">{p.talentName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{p.dialect}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {p.completedBookingsCount} مشروع
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ${fmtNum(p.totalEarningsUsd)} USD
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        ${fmtNum(p.paidOutUsd)} USD
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-600">
                        ${fmtNum(p.pendingBalanceUsd)} USD
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold block text-slate-800">{p.bankName}</span>
                        <span className="font-mono text-[10px] text-slate-400">{p.iban}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {p.pendingBalanceUsd > 0 ? (
                          <button
                            onClick={() => handleProcessPayout(p.talentId, p.pendingBalanceUsd)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                          >
                            صرف وتحويل
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-semibold">مكتمل ومسدد</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">المعاملات</h3>
                <p className="text-xs text-slate-400 mt-0.5">المبالغ المدفوعة من العملاء مقابل حجوزات الأصوات، مع حصة المعلق وعمولة المنصة</p>
              </div>
              <input
                value={transactionSearch}
                onChange={e => setTransactionSearch(e.target.value)}
                placeholder="ابحث برقم المعاملة أو العميل أو المعلق"
                className="w-full sm:w-72 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-brand"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-[11px]">
                    <th className="py-3 px-4 font-bold">رقم المعاملة</th>
                    <th className="py-3 px-4 font-bold">الدافع</th>
                    <th className="py-3 px-4 font-bold">المستفيد</th>
                    <th className="py-3 px-4 font-bold">نوع المعاملة</th>
                    <th className="py-3 px-4 font-bold font-mono">المبلغ المدفوع</th>
                    <th className="py-3 px-4 font-bold font-mono">عمولة المنصة</th>
                    <th className="py-3 px-4 font-bold">الحالة</th>
                    <th className="py-3 px-4 font-bold">تاريخ الإنشاء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-700">{b.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{b.companyName}</td>
                      <td className="py-3.5 px-4 text-slate-700">{b.talentName}</td>
                      <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">حجز تعليق صوتي</span></td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">${fmtNum(b.priceUsd)}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-600">${fmtNum(Math.round((b.priceUsd - b.talentPayoutUsd) * 100) / 100)}</td>
                      <td className="py-3.5 px-4 text-slate-700">{BOOKING_STATUS_AR[b.status]}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{fmtDate(b.createdAt)}</td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr><td colSpan={8} className="py-10 text-center text-slate-400">لا توجد معاملات</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: AUDIT & SECURITY TRAIL */}
      {/* ========================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>سجل التدقيق الأمني والعمليات الإدارية (Audit Trail)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  توثيق دقيق لكافة التحركات الإدارية، شحن الأرصدة، وتغيير حالات الأصوات والطلبات
                </p>
              </div>

              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                {overview?.recentLogs?.length ?? 0} عملية مسجلة
              </span>
            </div>

            <div className="space-y-2.5">
              {overview?.recentLogs?.map((log: any, i: number) => (
                <div
                  key={i}
                  className="p-3.5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-100 text-xs flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-slate-400 font-mono text-[11px] block mt-0.5">
                        Actor: {log.actor} • Company: {log.companyId}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {fmtDateTime(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: SYSTEM & PROVIDER SETTINGS */}
      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* MODAL: VIEW SCRIPT & PERFORMANCE DIRECTION */}
      {/* ========================================================= */}
      {selectedBookingForScript && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-right" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  تفاصيل اسكريبت الحجز: {selectedBookingForScript.id}
                </h3>
                <p className="text-xs text-slate-500">
                  الشركة: {selectedBookingForScript.companyName} • المعلق: {selectedBookingForScript.talentName}
                </p>
              </div>
              <button
                onClick={() => setSelectedBookingForScript(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="block text-xs font-bold text-slate-700 mb-1">نص الاسكريبت للتسجيل:</span>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm leading-relaxed text-slate-800 select-text">
                  "{selectedBookingForScript.scriptText}"
                </div>
              </div>

              {selectedBookingForScript.notes && (
                <div>
                  <span className="block text-xs font-bold text-slate-700 mb-1">توجيهات الأداء والنبرة:</span>
                  <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100 text-xs text-slate-700">
                    {selectedBookingForScript.notes}
                  </div>
                </div>
              )}

              {selectedBookingForScript.deliverableAudioUrl && (
                <div>
                  <span className="block text-xs font-bold text-slate-700 mb-1">الملف الصوتي المسلّم:</span>
                  <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-xl">
                    <button
                      onClick={() => togglePlayAudio(selectedBookingForScript.deliverableAudioUrl!)}
                      className="p-2 rounded-lg bg-brand text-white cursor-pointer"
                    >
                      {playingAudioUrl === selectedBookingForScript.deliverableAudioUrl ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <span className="text-xs font-mono text-slate-600 truncate">
                      {selectedBookingForScript.deliverableAudioUrl}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBookingForScript(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DELIVER AUDIO FILE */}
      {/* ========================================================= */}
      {reviewingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl" onClick={() => setReviewingBooking(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl w-full max-w-xl p-6 space-y-4 text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">مراجعة الحجز وتحويله للمعلق</h3>
                <p className="text-xs text-slate-500 mt-1">{reviewingBooking.id} · {reviewingBooking.companyName}</p>
              </div>
              <button onClick={() => setReviewingBooking(null)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
              <p className="font-bold text-slate-700">النص المطلوب تسجيله</p>
              <p className="text-slate-800 leading-7 whitespace-pre-wrap">{reviewingBooking.scriptText}</p>
              <p className="text-[11px] text-slate-400 font-mono">{fmtNum(Array.from(reviewingBooking.scriptText).length)} حرف</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 p-3"><span className="text-slate-500 block">الترخيص</span><b>{LICENSE_AR[reviewingBooking.usageLicense]}</b></div>
              <div className="rounded-xl border border-slate-200 p-3"><span className="text-slate-500 block">مدة التسليم</span><b>{reviewingBooking.deadlineDays} أيام</b></div>
              <div className="rounded-xl border border-slate-200 p-3"><span className="text-slate-500 block">السعر النهائي (العميل)</span><b className="font-mono">${fmtNum(reviewingBooking.priceUsd)}</b></div>
              <div className="rounded-xl border border-slate-200 p-3"><span className="text-slate-500 block">أتعاب المعلق</span><b className="font-mono text-emerald-600">${fmtNum(reviewingBooking.talentPayoutUsd)}</b></div>
            </div>
            {reviewingBooking.notes && (
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs"><span className="font-bold text-amber-800 block mb-1">ملاحظات العميل</span>{reviewingBooking.notes}</div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">المعلق الذي سيستلم الحجز</label>
              <select value={forwardNarratorId} onChange={e => setForwardNarratorId(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-hidden cursor-pointer">
                {narratorsList.map(n => <option key={n.id} value={n.id}>{n.displayName}</option>)}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">طلب العميل: {reviewingBooking.talentName}. سيظهر الحجز في حساب المعلق ويصله إشعار بذلك.</p>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setReviewingBooking(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">إلغاء</button>
              <button onClick={confirmForward} disabled={forwarding || !forwardNarratorId} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50">{forwarding ? 'جارٍ التحويل...' : 'اعتماد وتحويل للمعلق'}</button>
            </div>
          </div>
        </div>
      )}

      {deliveringBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-right" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  تسليم التسجيل الصوتي للحجز: {deliveringBooking.id}
                </h3>
                <p className="text-xs text-slate-500">
                  المعلق: {deliveringBooking.talentName} • الشركة: {deliveringBooking.companyName}
                </p>
              </div>
              <button
                onClick={() => setDeliveringBooking(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                رابط الملف الصوتي النهائي بصيغة الاستوديو (48kHz WAV / MP3)
              </label>
              <input
                type="url"
                value={deliverableAudioInput}
                onChange={(e) => setDeliverableAudioInput(e.target.value)}
                placeholder="https://cdn.example.com/recordings/audio-file.wav"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-hidden focus:border-brand"
              />
              <p className="text-[11px] text-slate-400">
                سيصل إشعار للشركة مع إمكانية الاستماع والتحميل المباشر للتسجيل
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeliveringBooking(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleUpdateBookingStatus(deliveringBooking.id, 'delivered', deliverableAudioInput || 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-sound.mp3')}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                تأكيد التسليم للعميل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD VOICE TO CATALOG */}
      {/* ========================================================= */}
      {showAddVoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-right max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">إضافة صوت جديد لكتالوج المنصة</h3>
                <p className="text-xs text-slate-500">إدراج معلق بشري موثق أو نموذج صوتي ذكي جديد</p>
              </div>
              <button
                onClick={() => setShowAddVoiceModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVoice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم باللغة العربية *</label>
                  <input
                    type="text"
                    required
                    value={newVoiceForm.name}
                    onChange={(e) => setNewVoiceForm({ ...newVoiceForm, name: e.target.value })}
                    placeholder="مثال: فيصل.ع أو سارة النجدية"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع الصوت *</label>
                  <select
                    value={newVoiceForm.type}
                    onChange={(e) => setNewVoiceForm({ ...newVoiceForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-brand"
                  >
                    <option value="ai">ذكاء اصطناعي (AI Voice Model)</option>
                    <option value="human">معلق بشري معتمد (Human Talent)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الجنس *</label>
                  <select
                    value={newVoiceForm.gender}
                    onChange={(e) => setNewVoiceForm({ ...newVoiceForm, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-brand"
                  >
                    <option value="male">صوت رجالي</option>
                    <option value="female">صوت نسائي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اللهجة (مسمى العرض) *</label>
                  <input
                    type="text"
                    required
                    value={newVoiceForm.dialectLabel}
                    onChange={(e) => setNewVoiceForm({ ...newVoiceForm, dialectLabel: e.target.value })}
                    placeholder="مثال: سعودي حجازي، مصري إعلاني"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نمط الأداء *</label>
                  <input
                    type="text"
                    required
                    value={newVoiceForm.styleLabel}
                    onChange={(e) => setNewVoiceForm({ ...newVoiceForm, styleLabel: e.target.value })}
                    placeholder="مثال: وثائقي هادئ، إعلاني رنان"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الموفر / المصدر *</label>
                  <input
                    type="text"
                    required
                    value={newVoiceForm.provider}
                    onChange={(e) => setNewVoiceForm({ ...newVoiceForm, provider: e.target.value })}
                    placeholder="elevenlabs أو human_marketplace"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط العينة الصوتية (Preview URL) *</label>
                <input
                  type="url"
                  required
                  value={newVoiceForm.previewUrl}
                  onChange={(e) => setNewVoiceForm({ ...newVoiceForm, previewUrl: e.target.value })}
                  placeholder="https://cdn.example.com/samples/voice-sample.mp3"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط صورة المعلق / الأفاتار</label>
                <input
                  type="url"
                  value={newVoiceForm.avatar}
                  onChange={(e) => setNewVoiceForm({ ...newVoiceForm, avatar: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-brand"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddVoiceModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand hover:bg-brand-orange text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  حفظ ونشر الصوت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT VOICE METADATA & STATS */}
      {/* ========================================================= */}
      {editingVoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-right max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={editingVoice.avatar}
                  alt={editingVoice.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    تعديل بيانات وإحصائيات الصوت: {editingVoice.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    تحديث عدد مرات الحجز، مؤشرات الثقة، والتسعير
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingVoice(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVoiceEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم بالعربية</label>
                  <input
                    type="text"
                    required
                    value={editVoiceForm.name}
                    onChange={(e) => setEditVoiceForm({ ...editVoiceForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اللهجة والتصنيف</label>
                  <input
                    type="text"
                    value={editVoiceForm.dialectLabel}
                    onChange={(e) => setEditVoiceForm({ ...editVoiceForm, dialectLabel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-brand"
                  />
                </div>

                {/* Bookings count for human voices or general */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-brand-text" />
                    <span>عدد المرات التي تم حجز الصوت فيها *</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editVoiceForm.bookingsCount}
                    onChange={(e) => setEditVoiceForm({ ...editVoiceForm, bookingsCount: parseInt(e.target.value) || 0 })}
                    placeholder="مثال: 142"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-brand"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    يظهر كأيقونة ومؤشر ثقة في بطاقة الصوت بمكتبة الأصوات البشرية
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sky-600" />
                    <span>مستخدمو النموذج / عملاء وثقوا بالصوت</span>
                  </label>
                  <input
                    type="text"
                    value={editVoiceForm.usageCount}
                    onChange={(e) => setEditVoiceForm({ ...editVoiceForm, usageCount: e.target.value })}
                    placeholder="مثال: 48.2K أو 95"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>سنوات الموثوقية والاعتماد (Trust Years)</span>
                  </label>
                  <input
                    type="text"
                    value={editVoiceForm.trustYears}
                    onChange={(e) => setEditVoiceForm({ ...editVoiceForm, trustYears: e.target.value })}
                    placeholder="مثال: 6y أو 2y"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    <span>التسعير التجاري المقترح</span>
                  </label>
                  <input
                    type="text"
                    value={editVoiceForm.pricing}
                    onChange={(e) => setEditVoiceForm({ ...editVoiceForm, pricing: e.target.value })}
                    placeholder="مثال: يبدأ من 50$ أو مشمول بالرصيد"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نمط الأداء الصوتي</label>
                <input
                  type="text"
                  value={editVoiceForm.styleLabel}
                  onChange={(e) => setEditVoiceForm({ ...editVoiceForm, styleLabel: e.target.value })}
                  placeholder="مثال: إعلاني ورنان، وثائقي فخم"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-brand"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingVoice(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingVoiceEdit}
                  className="px-5 py-2 bg-brand hover:bg-brand-orange text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingVoiceEdit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>حفظ التعديلات وتحديث المنصة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Developments Report & Documentation Modal */}
      <DevelopmentsDocModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
      />
    </AdminShell>
  );
};
