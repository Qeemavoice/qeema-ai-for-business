import React, { useState, useEffect } from 'react';
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
  Users
} from 'lucide-react';
import { api } from '../lib/api';
import { Voice, HumanBooking, TalentPayout, SystemSettings } from '../types';

interface AdminViewProps {
  voices: Voice[];
  onVoiceToggled: (voiceId: string, isActive: boolean) => void;
  onVoiceAdded?: (voice: Voice) => void;
  onVoiceUpdated?: (voice: Voice) => void;
}

type AdminTab = 'overview' | 'bookings' | 'voices' | 'companies' | 'financials' | 'audit' | 'settings';

export const AdminView: React.FC<AdminViewProps> = ({ voices, onVoiceToggled, onVoiceAdded, onVoiceUpdated }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
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

  // Settings state
  const [settingsForm, setSettingsForm] = useState<SystemSettings>({
    platformCommissionPercent: 25,
    elevenLabsStatus: 'operational',
    geminiAiStatus: 'operational',
    cdnStorageStatus: 'operational',
    maintenanceMode: false,
    creditRatePer10kCharsUsd: 4.0,
    paymentEscrowModel: 'direct_100_percent'
  });
  const [settingsSaveMsg, setSettingsSaveMsg] = useState<string | null>(null);
  const [ttsProviders, setTtsProviders] = useState<any>({
    active: 'elevenlabs',
    providers: {
      elevenlabs: { label: 'ElevenLabs', configured: false, enabled: false },
      munsit: { label: 'منصّت', configured: false, enabled: false }
    }
  });
  const [savingTtsProviders, setSavingTtsProviders] = useState(false);
  const [ttsProvidersMessage, setTtsProvidersMessage] = useState('');

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

      if (overviewData.systemSettings) {
        setSettingsForm(overviewData.systemSettings);
      }

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
    api.getTtsProviderSettings().then(setTtsProviders).catch((error) => {
      console.warn('TTS provider settings could not be loaded:', error);
    });
  }, []);

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
      onVoiceToggled(voice.id, res.isActive);
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
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
          bookingsCount: 140
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
    if (!confirm(`هل أنت متأكد من تحويل مستحقات بقيمة $${amount.toLocaleString()} USD لحساب المعلق البنكي؟`)) {
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

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSystemSettings(settingsForm);
      setSettingsSaveMsg('تم حفظ وتطبيق إعدادات المنصة بنجاح');
      setTimeout(() => setSettingsSaveMsg(null), 3500);
    } catch (err) {
      setSettingsSaveMsg('فشل حفظ الإعدادات');
      setTimeout(() => setSettingsSaveMsg(null), 3500);
    }
  };

  const saveTtsProviders = async () => {
    const enabledProviders = Object.entries(ttsProviders.providers)
      .filter(([, provider]: [string, any]) => provider.enabled)
      .map(([provider]) => provider);
    if (!enabledProviders.length) {
      setTtsProvidersMessage('فعّل مزوّداً واحداً على الأقل.');
      return;
    }
    if (!enabledProviders.includes(ttsProviders.active)) {
      setTtsProvidersMessage('اختر المزوّد الافتراضي من المزوّدات المفعّلة.');
      return;
    }

    setSavingTtsProviders(true);
    setTtsProvidersMessage('');
    try {
      const saved = await api.updateTtsProviderSettings({ enabledProviders, activeProvider: ttsProviders.active });
      setTtsProviders(saved);
      setTtsProvidersMessage('تم حفظ إعدادات مزوّدي الصوت.');
    } catch (error) {
      setTtsProvidersMessage(error instanceof Error ? error.message : 'تعذر حفظ إعدادات مزوّدي الصوت.');
    } finally {
      setSavingTtsProviders(false);
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

  const pendingBookingsCount = bookings.filter(b => b.status === 'pending' || b.status === 'in_studio').length;

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-12 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-[#FF5500] mb-4" />
        <p className="text-sm font-bold text-slate-700">جاري تحميل لوحة التحكم الإدارية المتقدمة...</p>
        <p className="text-xs text-slate-400 mt-1">قراءة مؤشرات النظام، خط الإنتاج، ودفاتر الأستاذ</p>
      </div>
    );
  }

  const navGroups = [
    {
      title: 'العمليات والإنتاج الصوتي',
      items: [
        { id: 'overview', label: 'المؤشرات والعمليات', icon: Activity, desc: 'نظرة شاملة ومصفوفة الأداء' },
        { id: 'bookings', label: 'طلبات الاستوديو البشري', icon: FileAudio, badge: pendingBookingsCount, desc: 'خط التسجيل والتسليم' },
        { id: 'voices', label: 'كتالوج الأصوات والمعلقين', icon: Layers, count: voices.length, desc: 'الأصوات البشرية والذكاء الاصطناعي' },
      ]
    },
    {
      title: 'إدارة الأعمال والمالية',
      items: [
        { id: 'companies', label: 'الشركات وسجل الأرصدة', icon: Building2, count: overview?.companies?.length, desc: 'حسابات B2B وتراخيص الحروف' },
        { id: 'financials', label: 'المالية ومستحقات المعلقين', icon: Wallet, desc: 'تسويات أتعاب المعلقين وعمولات المنصة' },
      ]
    },
    {
      title: 'الحماية وإعدادات النظام',
      items: [
        { id: 'audit', label: 'سجل التدقيق والأمان', icon: ShieldCheck, desc: 'متابعة الأنشطة والتعديلات' },
        { id: 'settings', label: 'إعدادات النظام والسحابة', icon: Sliders, desc: 'التسعير، العمولات، ونقاط الربط' },
      ]
    }
  ];

  const currentTabMeta = navGroups.flatMap(g => g.items).find(i => i.id === activeTab) || {
    label: 'لوحة الإدارة',
    desc: 'مركز عمليات المنصة'
  };

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6 pb-20 text-right" dir="rtl">
      {/* ========================================================= */}
      {/* ADMIN SIDEBAR */}
      {/* ========================================================= */}
      <aside className="w-full lg:w-72 shrink-0 bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 lg:sticky lg:top-24 shadow-xl space-y-6">
        {/* Sidebar Header Brand */}
        <div className="pb-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF5500] to-[#FF7733] flex items-center justify-center text-white font-black text-sm shadow-md shadow-[#FF5500]/25">
                ق
              </div>
              <div>
                <div className="font-black text-sm text-white flex items-center gap-1.5">
                  <span>قيمة فويس</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">لوحة الإدارة والعمليات</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live</span>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={() => setShowAddVoiceModal(true)}
          className="w-full py-2.5 px-3.5 bg-gradient-to-r from-[#FF5500] to-[#FF6611] hover:from-[#E04800] hover:to-[#FF5500] text-white rounded-xl text-xs font-bold shadow-md shadow-[#FF5500]/20 flex items-center justify-center gap-2 transition-all cursor-pointer group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          <span>إضافة صوت للكتالوج</span>
        </button>

        {/* Navigation Categories & Links */}
        <nav className="space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as AdminTab)}
                      className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? 'bg-[#FF5500] text-white shadow-md shadow-[#FF5500]/25'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-white text-[#FF5500]' : 'bg-[#FF5500] text-white'
                        }`}>
                          {item.badge}
                        </span>
                      )}

                      {item.count !== undefined && item.badge === undefined && (
                        <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-300">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* System Pulse & Refresh in Sidebar Footer */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">حالة المحركات السحابية</span>
              <span className="text-emerald-400 font-bold font-mono">99.9%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full w-[99.9%]" />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>ElevenLabs + Gemini</span>
              <span className="text-emerald-400 font-mono">Operational</span>
            </div>
          </div>

          <button
            onClick={loadAdminData}
            disabled={refreshing}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin text-[#FF5500]' : ''}`} />
            <span>{refreshing ? 'جاري التحديث...' : 'تحديث البيانات'}</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT WORKSPACE */}
      {/* ========================================================= */}
      <main className="flex-1 min-w-0 w-full space-y-6">
        {/* Active Page Header Banner */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1">
              <span>لوحة الإدارة</span>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-slate-700 font-bold">{currentTabMeta.label}</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {currentTabMeta.label}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentTabMeta.desc}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadAdminData}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#FF5500]' : ''}`} />
              <span>مزامنة فورية</span>
            </button>
          </div>
        </div>

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
                  ${overview?.totalBookingsRevenueUsd?.toLocaleString() ?? '2,360'}
                </span>
                <span className="text-xs font-bold text-slate-500">USD</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+28% نمو الطلبات هذا الشهر</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">صافي عمولة المنصة (25%)</span>
                <span className="p-2 bg-orange-50 text-[#FF5500] rounded-xl">
                  <Percent className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-[#FF5500]">
                  ${overview?.platformBookingMarginUsd?.toLocaleString() ?? '590'}
                </span>
                <span className="text-xs font-bold text-slate-500">USD</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                مستحقات المعلقين: ${overview?.totalTalentPayoutsUsd?.toLocaleString() ?? '1,770'} USD
              </div>
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
                  {overview?.totalCharsGenerated?.toLocaleString() ?? '62,500'}
                </span>
                <span className="text-xs font-bold text-slate-500">حرف</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                {overview?.totalGenerations ?? 14} عملية صوتية منجزة
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
                  ${overview?.totalSystemCostUsd ?? '0.0009'}
                </span>
                <span className="text-xs font-bold text-slate-500">USD</span>
              </div>
              <div className="mt-2 text-[11px] text-emerald-600 font-medium">
                هامش ربحية عالي (كفاءة التوليد السحابي)
              </div>
            </div>
          </div>

          {/* Infrastructure Pulse Matrix */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-[#FF5500]" />
                <span>مصفوفة صحة الخدمات السحابية (Infrastructure Pulse)</span>
              </h3>
              <span className="text-xs font-semibold text-slate-400">زمن الاستجابة اللحظي</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">ElevenLabs Turbo v2</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-500">الحالة: نشط</span>
                  <span className="font-mono text-slate-700 font-bold">185 ms</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Gemini Prompt Tuner</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-500">الحالة: نشط</span>
                  <span className="font-mono text-slate-700 font-bold">210 ms</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Studio Audio CDN (48kHz)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-500">التوافر: 99.99%</span>
                  <span className="font-mono text-slate-700 font-bold">42 ms</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Webhook Dispatcher</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-500">الأخطاء: 0</span>
                  <span className="font-mono text-slate-700 font-bold">Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Operations & Recent Generations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent Live Generations (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-blue-600" />
                  <span>أحدث التوليدات الصوتية بالمنصة (Live Generation Feed)</span>
                </h3>
                <span className="text-[11px] text-slate-400">آخر 15 عملية</span>
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
                              ? 'bg-[#FF5500] text-white'
                              : 'bg-white text-slate-700 hover:bg-[#FF5500] hover:text-white border border-slate-200'
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
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-100/80 text-[#FF5500]">
                              {gen.dialect}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5 max-w-[280px]">
                            {gen.text}
                          </p>
                        </div>
                      </div>

                      <div className="text-left shrink-0 font-mono text-[11px]">
                        <span className="font-bold text-slate-800">
                          {gen.creditsConsumed?.toLocaleString()} حرف
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {new Date(gen.createdAt).toLocaleTimeString('ar-SA')}
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
                  <Coins className="w-4 h-4 text-[#FF5500]" />
                  <span>منح رصيد استثنائي لشركة (Credit Grant)</span>
                </h3>
              </div>

              <form onSubmit={handleGrantCredits} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">اختر الشركة</label>
                  <select
                    value={grantingCompanyId}
                    onChange={(e) => setGrantingCompanyId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#FF5500]"
                  >
                    {overview?.companies?.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (الرصيد: {c.balance?.toLocaleString()} حرف)
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-[#FF5500]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">السبب المحاسبي للتوثيق</label>
                  <input
                    type="text"
                    value={grantReason}
                    onChange={(e) => setGrantReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#FF5500]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5 text-[#FF5500]" />
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
                { id: 'approved', label: 'معتمد ومكتمل' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setBookingFilterStatus(f.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bookingFilterStatus === f.id
                      ? 'bg-slate-900 text-white shadow-xs'
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
                className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#FF5500]"
              />
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileAudio className="w-4 h-4 text-[#FF5500]" />
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
                      approved: { label: 'معتمد ومكتمل', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
                    }[b.status];

                    return (
                      <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{b.companyName}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
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
                          <span className="font-bold text-slate-900 block">${b.priceUsd?.toLocaleString()} USD</span>
                          <span className="text-[10px] text-slate-400">
                            مستحق المعلق (75%): ${b.talentPayoutUsd?.toLocaleString()} USD
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusConfig.bg}`}>
                            {statusConfig.label}
                          </span>
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
                                    ? 'bg-[#FF5500] text-white'
                                    : 'bg-orange-50 hover:bg-orange-100 text-[#FF5500]'
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
                                onClick={() => handleUpdateBookingStatus(b.id, 'in_studio')}
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
      {activeTab === 'voices' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVoiceTypeFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  voiceTypeFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                كافة الأصوات ({voices.length})
              </button>
              <button
                onClick={() => setVoiceTypeFilter('human')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  voiceTypeFilter === 'human'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الأصوات البشرية ({voices.filter(v => v.type === 'human').length})
              </button>
              <button
                onClick={() => setVoiceTypeFilter('ai')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  voiceTypeFilter === 'ai'
                    ? 'bg-slate-900 text-white'
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
                  className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#FF5500]"
                />
              </div>

              <button
                onClick={() => setShowAddVoiceModal(true)}
                className="px-3.5 py-2 bg-[#FF5500] hover:bg-[#E04800] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
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
                        ? 'bg-[#FF5500] text-white'
                        : 'bg-slate-100 hover:bg-[#FF5500] hover:text-white text-slate-600'
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
                      <Briefcase className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
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
      {activeTab === 'companies' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#FF5500]" />
                  <span>قائمة حسابات الشركات المسجلة (B2B Accounts & Multi-tenancy)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  إدارة الأرصدة، مستويات الاشتراك، ومعدلات الاستهلاك
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
                {overview?.companies?.length ?? 3} شركات مسجلة
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-[11px]">
                    <th className="py-3 px-4 font-bold">اسم الشركة</th>
                    <th className="py-3 px-4 font-bold">المجال والدولة</th>
                    <th className="py-3 px-4 font-bold">الباقة الحالية</th>
                    <th className="py-3 px-4 font-bold font-mono">الرصيد المتاح (حرف)</th>
                    <th className="py-3 px-4 font-bold font-mono">عمليات التوليد</th>
                    <th className="py-3 px-4 font-bold text-center">إجراءات الحساب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overview?.companies?.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span>{c.industry}</span>
                        <span className="text-slate-400 text-[10px] block font-mono">📍 {c.country}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={c.planId}
                          onChange={(e) => handleUpgradeCompanyPlan(c.id, e.target.value)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-800 border-none cursor-pointer focus:outline-hidden"
                        >
                          <option value="plan-starter">Starter (50K)</option>
                          <option value="plan-pro">Pro (250K)</option>
                          <option value="plan-enterprise">Enterprise</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#FF5500]">
                        {c.balance?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {c.generationsCount ?? 0}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            setGrantingCompanyId(c.id);
                            setActiveTab('overview');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-all cursor-pointer"
                        >
                          منح رصيد
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: FINANCIALS & TALENT PAYOUTS */}
      {/* ========================================================= */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          {/* Executive Revenue Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">إجمالي إيرادات المبيعات</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-slate-900">
                  ${overview?.totalBookingsRevenueUsd?.toLocaleString() ?? '2,360'}
                </span>
                <span className="text-xs font-bold text-slate-500">USD</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">حجوزات الاستوديو البشري والاشتراكات</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">عمولات المنصة المكتسبة (25%)</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-emerald-600">
                  ${overview?.platformBookingMarginUsd?.toLocaleString() ?? '590'}
                </span>
                <span className="text-xs font-bold text-slate-500">USD</span>
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">صافي أرباح المنصة المعتمدة</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">مستحقات المعلقين المعلقة (Pending)</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-amber-600">
                  ${payouts.reduce((acc, p) => acc + (p.pendingBalanceUsd || 0), 0).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-500">USD</span>
              </div>
              <p className="text-[11px] text-amber-600 font-medium mt-1">بانتظار التحويل البنكي</p>
            </div>
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
                  حساب الأتعاب (75%)، أرقام الآيبان، والتحويلات المعتمدة بالدولار الأمريكي
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
                        ${p.totalEarningsUsd?.toLocaleString()} USD
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        ${p.paidOutUsd?.toLocaleString()} USD
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-600">
                        ${p.pendingBalanceUsd?.toLocaleString()} USD
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
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-slate-400 font-mono text-[11px] block mt-0.5">
                        Actor: {log.actor} • Company: {log.companyId}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {new Date(log.createdAt).toLocaleString('ar-SA')}
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
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900"><Server className="h-5 w-5 text-[#FF5500]" /> مزوّدو تحويل النص إلى صوت</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">فعّل المحركات التي تريد إتاحتها في الاستديو، ثم حدد المحرك الافتراضي. تُحفظ مفاتيح API على الخادم داخل ملف البيئة فقط.</p>
              </div>
              <button type="button" onClick={() => void saveTtsProviders()} disabled={savingTtsProviders} className="rounded-xl bg-[#FF5500] px-4 py-2.5 text-xs font-black text-white disabled:opacity-60">
                {savingTtsProviders ? 'جارٍ الحفظ...' : 'حفظ إعدادات المحركات'}
              </button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {Object.entries(ttsProviders.providers).map(([providerId, provider]: [string, any]) => (
                <label key={providerId} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${provider.enabled ? 'border-orange-300 bg-orange-50/60' : 'border-slate-200 bg-slate-50'}`}>
                  <input type="checkbox" checked={Boolean(provider.enabled)} disabled={!provider.configured} onChange={(event) => setTtsProviders({
                    ...ttsProviders,
                    providers: { ...ttsProviders.providers, [providerId]: { ...provider, enabled: event.target.checked } },
                    active: event.target.checked ? ttsProviders.active || providerId : (ttsProviders.active === providerId ? '' : ttsProviders.active)
                  })} className="mt-1 h-4 w-4 accent-[#FF5500]" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2"><strong className="text-sm text-slate-900">{provider.label}</strong><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${provider.configured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{provider.configured ? 'المفتاح مهيّأ' : 'أضف المفتاح إلى .env.staging'}</span></span>
                    <span className="mt-1 block text-xs text-slate-500">{providerId === 'munsit' ? 'أصوات عربية، لهجات مسجلة، تشكيل الفصحى، وتوجيه المشاعر.' : 'الأصوات المرتبطة بنماذج قيمة فويس البشرية.'}</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-4 max-w-md">
              <label className="mb-1.5 block text-xs font-bold text-slate-800">المزوّد الافتراضي</label>
              <select value={ttsProviders.active} onChange={(event) => setTtsProviders({ ...ttsProviders, active: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold" disabled={!Object.values(ttsProviders.providers).some((provider: any) => provider.enabled)}>
                {Object.entries(ttsProviders.providers).filter(([, provider]: [string, any]) => provider.enabled).map(([providerId, provider]: [string, any]) => <option key={providerId} value={providerId}>{provider.label}</option>)}
              </select>
            </div>
            {ttsProvidersMessage && <p className="mt-3 text-xs font-bold text-slate-700" role="status">{ttsProvidersMessage}</p>}
          </section>
          <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#FF5500]" />
                <span>إعدادات النظام العامة ومعدلات التسعير</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                تكوين معايير المنصة، نسب العمولات، ونظام شراء الأرصدة
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  نسبة عمولة المنصة من طلبات الاستوديو البشري (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={settingsForm.platformCommissionPercent}
                    onChange={(e) => setSettingsForm({ ...settingsForm, platformCommissionPercent: Number(e.target.value) })}
                    min="5"
                    max="50"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-[#FF5500]"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">المعدل القياسي: 25% منصة، 75% للمعلق الصوتي</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  سعر كل 10,000 حرف إضافي للشركات ($ USD)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={settingsForm.creditRatePer10kCharsUsd}
                    onChange={(e) => setSettingsForm({ ...settingsForm, creditRatePer10kCharsUsd: Number(e.target.value) })}
                    min="1"
                    max="100"
                    step="0.5"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-[#FF5500]"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">USD</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">سعر الشحن بالدولار عند نفاد باقة الـ B2B الشهرية</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  نموذج الدفع لحجز الأصوات البشرية (Escrow Model)
                </label>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>دفع وخصم مباشر 100% بنظام الضمان المالي</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    متوافق مع نظام النقاط/الكريدتس: يتم خصم 100% من القيمة فور تأكيد الحجز واحتجازها في الضمان حتى اعتماد التسجيل، ثم تحرير مستحقات المعلق (75%).
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">وضع الصيانة (Maintenance Mode)</label>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setSettingsForm({ ...settingsForm, maintenanceMode: !settingsForm.maintenanceMode })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      settingsForm.maintenanceMode
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{settingsForm.maintenanceMode ? 'وضع الصيانة مفعّل' : 'المنصة تعمل بصورة طبيعية'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#FF5500] hover:bg-[#E04800] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#FF5500]/25 flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>حفظ وتطبيق الإعدادات</span>
              </button>

              {settingsSaveMsg && (
                <span className="text-xs font-bold text-emerald-600 animate-fade-in">
                  {settingsSaveMsg}
                </span>
              )}
            </div>
          </form>
        </div>
      )}
      </main>

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
                      className="p-2 rounded-lg bg-[#FF5500] text-white cursor-pointer"
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
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-hidden focus:border-[#FF5500]"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#FF5500]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع الصوت *</label>
                  <select
                    value={newVoiceForm.type}
                    onChange={(e) => setNewVoiceForm({ ...newVoiceForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#FF5500]"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#FF5500]"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#FF5500]"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#FF5500]"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-[#FF5500]"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-[#FF5500]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط صورة المعلق / الأفاتار</label>
                <input
                  type="url"
                  value={newVoiceForm.avatar}
                  onChange={(e) => setNewVoiceForm({ ...newVoiceForm, avatar: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-[#FF5500]"
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
                  className="px-5 py-2 bg-[#FF5500] hover:bg-[#E04800] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#FF5500]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اللهجة والتصنيف</label>
                  <input
                    type="text"
                    value={editVoiceForm.dialectLabel}
                    onChange={(e) => setEditVoiceForm({ ...editVoiceForm, dialectLabel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#FF5500]"
                  />
                </div>

                {/* Bookings count for human voices or general */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span>عدد المرات التي تم حجز الصوت فيها *</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editVoiceForm.bookingsCount}
                    onChange={(e) => setEditVoiceForm({ ...editVoiceForm, bookingsCount: parseInt(e.target.value) || 0 })}
                    placeholder="مثال: 142"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-[#FF5500]"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-[#FF5500]"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-[#FF5500]"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#FF5500]"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#FF5500]"
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
                  className="px-5 py-2 bg-[#FF5500] hover:bg-[#E04800] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingVoiceEdit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>حفظ التعديلات وتحديث المنصة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
