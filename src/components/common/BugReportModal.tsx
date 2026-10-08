import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Bug, Send, CheckCircle2, RefreshCw, 
  Terminal, ShieldAlert, Cpu, Copy, Check, Download, 
  Wrench, Activity, ChevronRight, MessageSquare, AlertOctagon, X
} from 'lucide-react';
import { Language, RoomState } from '../../types/mafia';
import { translations } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';
import { bugTracker, BugReportPayload } from '../../utils/bugTracker';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  room?: RoomState | null;
  initialError?: { message: string; stack?: string } | null;
  onEmergencyUnstick?: () => void;
}

export const BugReportModal: React.FC<BugReportModalProps> = ({
  isOpen,
  onClose,
  language,
  room,
  initialError,
  onEmergencyUnstick
}) => {
  const t = translations[language] || translations.fa;
  const isFa = language === 'fa';

  const [category, setCategory] = useState<'FREEZE' | 'CRASH' | 'STUCK_GAME' | 'ROLE_INTERACTION_ERROR' | 'NETWORK_ERROR' | 'USER_FEEDBACK'>('FREEZE');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'NEW_REPORT' | 'DIAGNOSTICS' | 'SERVER_REPORTS'>('NEW_REPORT');
  const [recentLogs, setRecentLogs] = useState<Array<{ time: string; level: string; message: string }>>([]);
  const [serverReports, setServerReports] = useState<any[]>([]);
  const [isLoadingServerReports, setIsLoadingServerReports] = useState(false);
  const [unstickSuccess, setUnstickSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRecentLogs(bugTracker.getRecentLogs());
      setSubmittedReportId(null);
      setUnstickSuccess(false);
      if (initialError) {
        setCategory('CRASH');
        setDescription(`خطای رخ‌داده: ${initialError.message}`);
      }
    }
  }, [isOpen, initialError]);

  const loadServerReports = async () => {
    setIsLoadingServerReports(true);
    try {
      const res = await fetch('/api/bug-reports');
      if (res.ok) {
        const data = await res.json();
        setServerReports(data.reports || []);
      }
    } catch {
      // Offline fallback
      setServerReports(bugTracker.getPendingReports());
    } finally {
      setIsLoadingServerReports(false);
    }
  };

  if (!isOpen) return null;

  const categories = [
    { id: 'FREEZE', label: isFa ? 'انجماد یا گیر کردن بازی' : 'Game Freeze / Stalling', icon: '❄️' },
    { id: 'STUCK_GAME', label: isFa ? 'تایمر یا نوبت صحبت متوقف شده' : 'Timer / Turn Stuck', icon: '⏱️' },
    { id: 'ROLE_INTERACTION_ERROR', label: isFa ? 'خطای اکشن فاز شب یا نقش‌ها' : 'Night Action / Role Conflict', icon: '🎭' },
    { id: 'NETWORK_ERROR', label: isFa ? 'قطعی یا عدم همگام‌سازی شبکه' : 'Sync / Network Issue', icon: '📡' },
    { id: 'CRASH', label: isFa ? 'خطای رندر یا کرش صفحه' : 'App Crash / Exception', icon: '💥' },
    { id: 'USER_FEEDBACK', label: isFa ? 'پیشنهاد یا گزارش عمومی' : 'General Feedback', icon: '💡' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    soundEngine.playTick();

    try {
      const reportId = await bugTracker.captureAutoReport({
        type: category,
        title: categories.find(c => c.id === category)?.label || 'گزارش کاربر',
        description: description.trim() || 'کاربر بدون یادداشت اضافه گزارش ثبت کرد.',
        errorMessage: initialError?.message,
        errorStack: initialError?.stack,
        roomState: room
      });

      setSubmittedReportId(reportId);
      soundEngine.playGong();
      setDescription('');
    } catch (err) {
      console.error('Failed to submit report', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyDiagnosticBundle = () => {
    const bundle = {
      timestamp: new Date().toISOString(),
      roomSnapshot: room,
      deviceInfo: bugTracker.getDeviceInfo(),
      recentLogs: bugTracker.getRecentLogs(),
      initialError
    };
    navigator.clipboard.writeText(JSON.stringify(bundle, null, 2));
    setCopied(true);
    soundEngine.playTick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDiagnosticBundle = () => {
    const bundle = {
      timestamp: new Date().toISOString(),
      roomSnapshot: room,
      deviceInfo: bugTracker.getDeviceInfo(),
      recentLogs: bugTracker.getRecentLogs(),
      initialError
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mafia-bug-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    soundEngine.playTick();
  };

  const handleTriggerUnstick = async () => {
    soundEngine.playGong();
    const ok = await bugTracker.triggerEmergencyUnstick(room?.roomId, onEmergencyUnstick);
    if (ok) {
      setUnstickSuccess(true);
      setTimeout(() => setUnstickSuccess(false), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in" dir={isFa ? 'rtl' : 'ltr'}>
      <div className="relative w-full max-w-2xl bg-[#0e111a] border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#141824] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{isFa ? 'سامانه گزارش باگ و بازیابی اضطراری' : 'Bug Reporter & Emergency Recovery'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                  Telemetry 3.0
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFa 
                  ? 'ارسال خودکار وضعیت زنده بازی به تیم توسعه جهت اصلاح فوری در به‌روزرسانی‌های بعدی' 
                  : 'Auto-dispatch game state & logs to developers for prompt patch releases'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Unstick Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-b border-amber-500/20 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-200 font-semibold">
              {isFa ? 'بازی متوقف یا قفل شده؟' : 'Game frozen or phase stuck?'}
            </span>
          </div>
          <button
            id="btn-emergency-unstick"
            onClick={handleTriggerUnstick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{isFa ? '🛠️ رفع توقف و بازیابی اضطراری (Unstick)' : 'Emergency Unstick & Resume'}</span>
          </button>
        </div>

        {unstickSuccess && (
          <div className="m-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{isFa ? 'دستور بازیابی اضطراری ارسال شد. قفل تایمرها و دفاعیه‌ها آزاد گردید.' : 'Emergency recovery dispatched successfully. Stuck timers and locks cleared.'}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center bg-[#090c14] border-b border-white/5 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('NEW_REPORT')}
            className={`flex items-center gap-1.5 px-4 py-2 border-b-2 text-xs font-bold transition-all ${
              activeTab === 'NEW_REPORT'
                ? 'border-amber-500 text-amber-300 bg-white/5 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>{isFa ? 'ثبت گزارش باگ' : 'Submit Report'}</span>
          </button>

          <button
            onClick={() => setActiveTab('DIAGNOSTICS')}
            className={`flex items-center gap-1.5 px-4 py-2 border-b-2 text-xs font-bold transition-all ${
              activeTab === 'DIAGNOSTICS'
                ? 'border-amber-500 text-amber-300 bg-white/5 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{isFa ? 'لاگ‌های فنی و اسنپ‌شات' : 'Live Diagnostics'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('SERVER_REPORTS');
              loadServerReports();
            }}
            className={`flex items-center gap-1.5 px-4 py-2 border-b-2 text-xs font-bold transition-all ${
              activeTab === 'SERVER_REPORTS'
                ? 'border-amber-500 text-amber-300 bg-white/5 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isFa ? 'گزارش‌های ذخیره‌شده سرور' : 'Saved Reports'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'NEW_REPORT' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {submittedReportId ? (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-emerald-300">
                    {isFa ? 'گزارش باگ با موفقیت ثبت شد!' : 'Bug Report Dispatched Successfully!'}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    {isFa 
                      ? `شناسه رهگیری ${submittedReportId} در دیتابیس عیب‌یابی ذخیره شد. تیم توسعه در انتشار و آپدیت‌های بعدی این مورد را بررسی و رفع خواهد کرد.`
                      : `Tracking ID ${submittedReportId} was saved. It will be analyzed and resolved in upcoming patch releases.`}
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSubmittedReportId(null)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isFa ? 'ثبت گزارش جدید' : 'Submit Another'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-colors cursor-pointer"
                    >
                      {isFa ? 'بستن و ادامه بازی' : 'Close & Resume'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Category Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      {isFa ? 'نوع مشکل رخ‌داده را انتخاب کنید:' : 'Select Problem Category:'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            soundEngine.playTick();
                            setCategory(cat.id as any);
                          }}
                          className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 cursor-pointer ${
                            category === cat.id
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-base">{cat.icon}</span>
                          <span className="text-xs truncate">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {isFa ? 'توضیحات تکمیلی (هنگام توقف چه اتفاقی افتاد؟):' : 'Additional Notes (What happened right before it stuck?):'}
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={isFa ? 'مثال: روی دکمه شروع دفاعیه زدم ولی تایمر صفر موند و مرحله بعد نرفت...' : 'e.g., Clicked on defense button but timer did not advance...'}
                      rows={3}
                      className="w-full bg-black/40 border border-white/10 focus:border-amber-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Attached Auto-Snapshot Preview */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5" />
                        {isFa ? 'داده‌های پیوست خودکار:' : 'Auto-Attached Telemetry Payload:'}
                      </span>
                      <span>{room?.roomId ? `اتاق: ${room.roomId}` : 'حالت لوکال'}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                      <div className="bg-black/30 p-1.5 rounded">فاز: <strong className="text-white">{room?.phase || 'نامشخص'}</strong></div>
                      <div className="bg-black/30 p-1.5 rounded">روز: <strong className="text-white">{room?.dayNumber ?? '-'}</strong></div>
                      <div className="bg-black/30 p-1.5 rounded">بازیکنان: <strong className="text-white">{room?.players?.length ?? 0} نفر</strong></div>
                      <div className="bg-black/30 p-1.5 rounded">تایمر: <strong className="text-white">{room?.timerSeconds ?? 0}s</strong></div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isFa ? 'انصراف' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>{isFa ? 'ارسال گزارش باگ به سرور' : 'Dispatch Bug Report'}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {activeTab === 'DIAGNOSTICS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  {isFa ? 'لاگ‌های زمان اجرای کلاینت (۵۰ رویداد آخر):' : 'Recent Client Telemetry Logs:'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyDiagnosticBundle}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'کپی شد' : 'کپی کل گزارش'}</span>
                  </button>
                  <button
                    onClick={handleDownloadDiagnosticBundle}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>دانلود JSON</span>
                  </button>
                </div>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-xl p-3 font-mono text-[11px] max-h-64 overflow-y-auto space-y-1">
                {recentLogs.length === 0 ? (
                  <div className="text-slate-500 text-center py-4">هیچ لاگ یا خطایی در این نشست ثبت نشده است.</div>
                ) : (
                  recentLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2 leading-tight">
                      <span className="text-slate-500 shrink-0">[{log.time}]</span>
                      <span className={`px-1 rounded text-[9px] font-bold shrink-0 ${
                        log.level === 'error' ? 'bg-rose-500/20 text-rose-400' :
                        log.level === 'warn' ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-slate-300 break-all">{log.message}</span>
                    </div>
                  ))
                )}
              </div>

              {initialError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                  <div className="text-xs font-bold text-rose-400">آخرین استک‌ترک خطا:</div>
                  <pre className="text-[10px] text-rose-300 font-mono overflow-x-auto whitespace-pre-wrap">
                    {initialError.stack || initialError.message}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'SERVER_REPORTS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  {isFa ? 'گزارش‌های ارسال‌شده در حافظه سرور:' : 'Bug Reports Logged on Server:'}
                </span>
                <button
                  onClick={loadServerReports}
                  disabled={isLoadingServerReports}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingServerReports ? 'animate-spin' : ''}`} />
                  <span>تازه‌سازی</span>
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {serverReports.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs bg-white/5 rounded-xl border border-white/5">
                    هنوز گزارش باگی در این جلسه کاری به سرور ارسال نشده است.
                  </div>
                ) : (
                  serverReports.map((rep, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1 text-right">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-300">{rep.title}</span>
                        <span className="text-[10px] text-slate-500">{new Date(rep.timestamp).toLocaleTimeString('fa-IR')}</span>
                      </div>
                      {rep.description && (
                        <p className="text-xs text-slate-300">{rep.description}</p>
                      )}
                      {rep.errorMessage && (
                        <p className="text-[11px] text-rose-400 font-mono bg-rose-500/10 p-1.5 rounded">
                          {rep.errorMessage}
                        </p>
                      )}
                      <div className="text-[10px] text-slate-500 flex items-center gap-3 pt-1">
                        <span>شناسه: {rep.id}</span>
                        <span>فاز: {rep.roomStateSnapshot?.phase || '-'}</span>
                        <span>روز: {rep.roomStateSnapshot?.dayNumber || '-'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
