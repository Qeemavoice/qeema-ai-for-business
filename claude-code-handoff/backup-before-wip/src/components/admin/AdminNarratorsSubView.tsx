import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Search, 
  Filter, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  UserCheck,
  Music,
  Play,
  Pause,
  DollarSign,
  X,
  Lock,
  ThumbsUp,
  ThumbsDown,
  Volume2
} from 'lucide-react';
import { narratorService } from '../../services/narratorService';
import { Narrator, NarratorStatus, VoiceSample, VoiceSampleStatus } from '../../types';

interface AdminNarratorsSubViewProps {
  onNavigateToClaim?: (token: string) => void;
  /** Which inner tab to show (the admin sidebar opens "معلقين" and "العينات" separately) */
  view?: 'narrators' | 'samples';
}

export const AdminNarratorsSubView: React.FC<AdminNarratorsSubViewProps> = ({
  onNavigateToClaim,
  view
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'narrators' | 'samples'>(view || 'narrators');
  useEffect(() => { if (view) setActiveSubTab(view); }, [view]);

  // Narrators State
  const [narrators, setNarrators] = useState<Narrator[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | NarratorStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [sendingNarratorId, setSendingNarratorId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Samples Review State
  const [samples, setSamples] = useState<VoiceSample[]>([]);
  const [sampleStatusFilter, setSampleStatusFilter] = useState<'all' | VoiceSampleStatus>('pending_review');
  const [sampleSearchQuery, setSampleSearchQuery] = useState('');
  const [playingSampleId, setPlayingSampleId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Modals for Admin Actions on Samples
  const [approvingSample, setApprovingSample] = useState<VoiceSample | null>(null);
  const [approvalPrice, setApprovalPrice] = useState<string>('75');
  const [rejectingSample, setRejectingSample] = useState<VoiceSample | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isSubmittingSampleAction, setIsSubmittingSampleAction] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [narratorList, sampleList] = await Promise.all([
        narratorService.getAllNarrators(),
        narratorService.getAllVoiceSamples()
      ]);
      setNarrators(narratorList);
      setSamples(sampleList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Audio Playback
  const handleTogglePlaySample = (sample: VoiceSample) => {
    if (playingSampleId === sample.id) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingSampleId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(sample.audioUrl);
      audioPlayerRef.current = audio;
      audio.play().catch(err => console.log('Playback error:', err));
      setPlayingSampleId(sample.id);

      audio.onended = () => {
        setPlayingSampleId(null);
      };
    }
  };

  // Copy Claim Token
  const handleCopyLink = (token: string) => {
    const fullUrl = `${window.location.origin}/?view=claim&token=${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Send Single Invite
  const handleSendInvite = async (narratorId: string) => {
    setSendingNarratorId(narratorId);
    try {
      const updated = await narratorService.sendInvite(narratorId);
      setNarrators(prev => prev.map(n => n.id === narratorId ? updated : n));
      setActionSuccessMsg(`تم إرسال رابط التفعيل إلى المعلق بنجاح`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } finally {
      setSendingNarratorId(null);
    }
  };

  // Bulk Invite
  const handleBulkInvite = async () => {
    setIsBulkSending(true);
    try {
      const res = await narratorService.bulkSendInvites();
      await loadAllData();
      setActionSuccessMsg(`تم توليد وإرسال الدعوات الجماعية لـ (${res.count}) معلقين`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } finally {
      setIsBulkSending(false);
    }
  };

  // Admin Approve Sample
  const handleConfirmApprove = async () => {
    if (!approvingSample) return;
    const priceNum = parseFloat(approvalPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('يرجى إدخال سعر صحيح للدقيقة');
      return;
    }

    setIsSubmittingSampleAction(true);
    try {
      const updated = await narratorService.adminApproveSample(approvingSample.id, priceNum);
      setSamples(prev => prev.map(s => s.id === updated.id ? updated : s));
      setActionSuccessMsg(`تم اعتماد العينة وتحديد السعر: $${priceNum} / دقيقة وكتابة سجل التدقيق بنجاح`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      setApprovingSample(null);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الاعتماد');
    } finally {
      setIsSubmittingSampleAction(false);
    }
  };

  // Admin Reject Sample
  const handleConfirmReject = async () => {
    if (!rejectingSample) return;
    if (!rejectionReason.trim()) {
      alert('يرجى كتابة سبب الرفض لتوجيه المعلق الصوتي');
      return;
    }

    setIsSubmittingSampleAction(true);
    try {
      const updated = await narratorService.adminRejectSample(rejectingSample.id, rejectionReason.trim());
      setSamples(prev => prev.map(s => s.id === updated.id ? updated : s));
      setActionSuccessMsg(`تم رفض العينة مع توثيق السبب وإبلاغ المعلق`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      setRejectingSample(null);
      setRejectionReason('');
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الرفض');
    } finally {
      setIsSubmittingSampleAction(false);
    }
  };

  // Filtered Narrators
  const filteredNarrators = narrators.filter(n => {
    const matchesStatus = statusFilter === 'all' || n.status === statusFilter;
    const matchesSearch = 
      n.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.phone.includes(searchQuery) ||
      (n.email && n.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      n.dialects.some(d => d.includes(searchQuery));
    return matchesStatus && matchesSearch;
  });

  // Filtered Samples
  const filteredSamples = samples.filter(s => {
    const matchesStatus = sampleStatusFilter === 'all' || s.status === sampleStatusFilter;
    const narratorName = narrators.find(n => n.id === s.narratorId)?.displayName || '';
    const matchesSearch = 
      s.title.toLowerCase().includes(sampleSearchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(sampleSearchQuery.toLowerCase()) ||
      s.dialect.toLowerCase().includes(sampleSearchQuery.toLowerCase()) ||
      narratorName.toLowerCase().includes(sampleSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingSamplesCount = samples.filter(s => s.status === 'pending_review').length;

  const getStatusBadge = (st: NarratorStatus) => {
    switch (st) {
      case 'active':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>مفعّل</span>
          </span>
        );
      case 'invited':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>تمت الدعوة</span>
          </span>
        );
      case 'unclaimed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>غير مطالب به</span>
          </span>
        );
      case 'suspended':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>موقوف</span>
          </span>
        );
    }
  };

  const getSampleStatusBadge = (status: VoiceSampleStatus) => {
    switch (status) {
      case 'pending_review':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>قيد المراجعة</span>
          </span>
        );
      case 'published':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>معتمد</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>مرفوضة</span>
          </span>
        );
      case 'hidden':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>مخفية</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Toast message */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Main Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSubTab('narrators')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'narrators'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>المعلقين وتفعيل الحسابات</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
              {narrators.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('samples')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'samples'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>مراجعة العينات الصوتية</span>
            {pendingSamplesCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                activeSubTab === 'samples' ? 'bg-white text-orange-600' : 'bg-orange-500 text-white animate-pulse'
              }`}>
                {pendingSamplesCount} بانتظار الاعتماد
              </span>
            )}
          </button>
        </div>

        <button
          onClick={loadAllData}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="تحديث البيانات"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: NARRATORS & CLAIM INVITATIONS */}
      {/* ========================================================= */}
      {activeSubTab === 'narrators' && (
        <div className="space-y-6">
          {/* Top Actions & Filters Bar */}
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                الكل ({narrators.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'active'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                المفعلين ({narrators.filter(n => n.status === 'active').length})
              </button>
              <button
                onClick={() => setStatusFilter('invited')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'invited'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                تمت الدعوة ({narrators.filter(n => n.status === 'invited').length})
              </button>
              <button
                onClick={() => setStatusFilter('unclaimed')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'unclaimed'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                غير مطالب به ({narrators.filter(n => n.status === 'unclaimed').length})
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم، الهاتف، اللهجة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-orange-500 transition-colors"
                />
              </div>

              <button
                onClick={handleBulkInvite}
                disabled={isBulkSending}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isBulkSending ? 'جاري الإرسال...' : 'إرسال دعوات جماعية'}</span>
              </button>
            </div>
          </div>

          {/* Narrators Table */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950/50">
                    <th className="p-4">المعلق الصوتي</th>
                    <th className="p-4">بيانات التواصل</th>
                    <th className="p-4">اللهجات المعتمدة</th>
                    <th className="p-4">حالة الحساب</th>
                    <th className="p-4">رمز ورابط التفعيل</th>
                    <th className="p-4 text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredNarrators.map(n => (
                    <tr key={n.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={n.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'}
                            alt={n.displayName}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                          />
                          <div>
                            <span className="font-bold text-white block">{n.displayName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{n.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1 text-slate-300">
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span dir="ltr">{n.phone}</span>
                          </div>
                          {n.email && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span>{n.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {n.dialects.map((d, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-4">
                        {getStatusBadge(n.status)}
                      </td>

                      <td className="p-4">
                        {n.claimToken ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <code className="px-2 py-0.5 rounded bg-slate-950 text-orange-400 font-mono text-[10px] border border-slate-800">
                                {n.claimToken}
                              </code>
                              <button
                                onClick={() => handleCopyLink(n.claimToken!)}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                title="نسخ رابط التفعيل"
                              >
                                {copiedToken === n.claimToken ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            {n.claimTokenExpiresAt && (
                              <span className="text-[9px] text-slate-500 block">
                                ينتهي في {new Date(n.claimTokenExpiresAt).toLocaleDateString('ar-SA')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">لا يوجد رمز فعال</span>
                        )}
                      </td>

                      <td className="p-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          {n.claimToken && (
                            <button
                              onClick={() => onNavigateToClaim?.(n.claimToken!)}
                              className="px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              title="معاينة صفحة التفعيل كما يراها المعلق"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>معاينة التفعيل</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleSendInvite(n.id)}
                            disabled={sendingNarratorId === n.id}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {sendingNarratorId === n.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>{n.status === 'unclaimed' ? 'إرسال دعوة' : 'إعادة إرسال'}</span>
                          </button>
                        </div>
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
      {/* TAB 2: SAMPLES REVIEW & PRICING (مراجعة العينات) */}
      {/* ========================================================= */}
      {activeSubTab === 'samples' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSampleStatusFilter('pending_review')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  sampleStatusFilter === 'pending_review'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>قيد المراجعة</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
                  {samples.filter(s => s.status === 'pending_review').length}
                </span>
              </button>
              <button
                onClick={() => setSampleStatusFilter('published')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sampleStatusFilter === 'published'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                معتمدة ومسعرة ({samples.filter(s => s.status === 'published').length})
              </button>
              <button
                onClick={() => setSampleStatusFilter('rejected')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sampleStatusFilter === 'rejected'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                مرفوضة ({samples.filter(s => s.status === 'rejected').length})
              </button>
              <button
                onClick={() => setSampleStatusFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sampleStatusFilter === 'all'
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                كل العينات ({samples.length})
              </button>
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث بالعنوان، المعلق، التصنيف..."
                value={sampleSearchQuery}
                onChange={(e) => setSampleSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Audit Log Transparency Banner */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>سجل تدقيق ملزم:</strong> تحديد الأسعار أو تغييرها محصور بفريق إدارة قيمة فويس فقط، وكل اعتماد أو رفض يُسجل فورياً في سجل التدقيق المالي غير القابل للتعديل.
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">سجل تدقيق رقمي غير قابل للتعديل</span>
          </div>

          {/* Samples List Table */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950/50">
                    <th className="p-4">العينة والاستماع</th>
                    <th className="p-4">المعلق الصوتي</th>
                    <th className="p-4">التصنيف واللهجة</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">السعر الرسمي / دقيقة</th>
                    <th className="p-4 text-left">إجراءات المراجعة والاعتماد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSamples.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 text-xs font-medium">
                        لا توجد عينات تطابق هذا التصفية
                      </td>
                    </tr>
                  ) : (
                    filteredSamples.map(sample => {
                      const narrator = narrators.find(n => n.id === sample.narratorId);
                      const isPlaying = playingSampleId === sample.id;

                      return (
                        <tr key={sample.id} className="hover:bg-slate-800/40 transition-colors">
                          {/* Sample & Audio Play */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleTogglePlaySample(sample)}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                  isPlaying
                                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 animate-pulse'
                                    : 'bg-slate-800 text-slate-200 hover:bg-orange-500 hover:text-white border border-slate-700'
                                }`}
                                title={isPlaying ? 'إيقاف' : 'تشغيل ومعاينة العينة'}
                              >
                                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                              </button>

                              <div>
                                <span className="font-bold text-white block">{sample.title}</span>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                                  <span>{Math.floor(sample.durationSec / 60)}:{String(sample.durationSec % 60).padStart(2, '0')} دقيقة</span>
                                  <span>•</span>
                                  <span>{new Date(sample.createdAt).toLocaleDateString('ar-SA')}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Narrator */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <img
                                src={narrator?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80'}
                                alt=""
                                className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                              />
                              <span className="font-bold text-slate-200">{narrator?.displayName || sample.narratorId}</span>
                            </div>
                          </td>

                          {/* Category & Dialect */}
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                {sample.category}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                                {sample.dialect}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <div className="space-y-1">
                              {getSampleStatusBadge(sample.status)}
                              {sample.status === 'rejected' && sample.rejectionReason && (
                                <p className="text-[10px] text-rose-400/80 max-w-[200px] leading-tight line-clamp-2">
                                  السبب: {sample.rejectionReason}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Price */}
                          <td className="p-4">
                            {sample.pricePerMinute ? (
                              <div className="flex items-center gap-1 font-mono font-bold text-emerald-400 text-sm">
                                <span>${sample.pricePerMinute}</span>
                                <span className="text-[10px] text-slate-400 font-sans">/ دقيقة</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 font-medium">غير محدد (بانتظار التسعير)</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-left">
                            <div className="flex items-center justify-end gap-2">
                              {/* Approve & Set Price button */}
                              <button
                                onClick={() => {
                                  setApprovingSample(sample);
                                  setApprovalPrice(sample.pricePerMinute?.toString() || '80');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{sample.status === 'published' ? 'تعديل السعر' : 'اعتماد وتحديد السعر'}</span>
                              </button>

                              {/* Reject button */}
                              {sample.status !== 'rejected' && (
                                <button
                                  onClick={() => {
                                    setRejectingSample(sample);
                                    setRejectionReason('');
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>رفض</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: APPROVE SAMPLE & SET PRICE PER MINUTE */}
      {/* ========================================================= */}
      {approvingSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-right space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <DollarSign className="w-5 h-5" />
                <h3 className="font-bold text-sm text-white">اعتماد العينة وتحديد السعر الرسمي</h3>
              </div>
              <button
                onClick={() => setApprovingSample(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">عنوان العينة:</span>
                <span className="font-bold text-white">{approvingSample.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">التصنيف واللهجة:</span>
                <span className="text-slate-200">{approvingSample.category} • {approvingSample.dialect}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">المدة:</span>
                <span className="font-mono text-slate-200">{approvingSample.durationSec} ثانية</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                سعر الدقيقة المعتمد (بالدولار الأمريكي USD) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="500"
                  step="5"
                  value={approvalPrice}
                  onChange={(e) => setApprovalPrice(e.target.value)}
                  placeholder="مثال: 75"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-base font-mono font-bold text-white focus:outline-hidden focus:border-emerald-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                  USD / دقيقة
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                * المعلق لا يمكنه تعديل هذا السعر إطلاقاً، ويظهر لديه بحالة مقفلة 🔒 مع توضيح أنه محدد من الإدارة.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={handleConfirmApprove}
                disabled={isSubmittingSampleAction}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmittingSampleAction ? 'جاري الاعتماد...' : 'تأكيد الاعتماد ونشر العينة'}</span>
              </button>
              <button
                onClick={() => setApprovingSample(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REJECT SAMPLE */}
      {/* ========================================================= */}
      {rejectingSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-right space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold text-sm text-white">رفض العينة الصوتية</h3>
              </div>
              <button
                onClick={() => setRejectingSample(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              سيتم إشعار المعلق الصوتي بسبب الرفض ليتمكن من حذف العينة أو رفع تسجيل بجودة أعلى:
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                سبب الرفض والملاحظات التوجيهية *
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="مثال: مستوى الصدى بالغرفة غير مناسب، أو وجود ضوضاء ميكروفون في الخلفية..."
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 resize-none"
              />

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  'جودة التسجيل تحتوي على صدى بالغرفة',
                  'وجود تشويش ميكروفون في الترددات المنخفضة',
                  'النبرة لا تتطابق مع التصنيف المحدد'
                ].map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectionReason(sug)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={handleConfirmReject}
                disabled={isSubmittingSampleAction}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                <span>{isSubmittingSampleAction ? 'جاري الحفظ...' : 'تأكيد الرفض'}</span>
              </button>
              <button
                onClick={() => setRejectingSample(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
