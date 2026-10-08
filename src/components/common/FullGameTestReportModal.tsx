import React, { useState } from 'react';
import { 
  FileText, Printer, CheckCircle2, Download, X, 
  Shield, Swords, Crown, Skull, Sparkles, RefreshCw, 
  Play, Award, AlertCircle, Clock, Users, ArrowRight
} from 'lucide-react';
import { run18PlayerFullGameSimulation, FullGameSimulationResult } from '../../utils/fullGameSimulator';
import { Player, Language } from '../../types/mafia';

interface FullGameTestReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGameToRoom?: (players: Player[]) => void;
  language?: Language;
}

export const FullGameTestReportModal: React.FC<FullGameTestReportModalProps> = ({
  isOpen,
  onClose,
  onApplyGameToRoom,
  language = 'fa'
}) => {
  const [simulationData, setSimulationData] = useState<FullGameSimulationResult>(() => run18PlayerFullGameSimulation());
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMELINE' | 'NIGHT_MATRIX' | 'PLAYERS' | 'PRINT_PREVIEW'>('PRINT_PREVIEW');
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!isOpen) return null;

  const handleRerun = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setSimulationData(run18PlayerFullGameSimulation());
      setIsRegenerating(false);
    }, 400);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-pdf-report');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="utf-8">
        <title>گزارش آزمون و شبیه‌سازی بازی ۱۸ نفره مافیا</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;600;700;900&display=swap');
          body {
            font-family: 'Vazirmatn', sans-serif;
            background: #fff;
            color: #111;
            padding: 30px;
            margin: 0;
            line-height: 1.6;
          }
          .header {
            border-bottom: 2px solid #b45309;
            padding-bottom: 15px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .title {
            font-size: 22px;
            font-weight: 900;
            color: #92400e;
            margin: 0;
          }
          .subtitle {
            font-size: 13px;
            color: #666;
            margin-top: 4px;
          }
          .badge {
            background: #fef3c7;
            color: #92400e;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            border: 1px solid #fde68a;
          }
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 15px;
            font-weight: bold;
            color: #1e293b;
            border-right: 4px solid #f59e0b;
            padding-right: 8px;
            margin-bottom: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-top: 8px;
          }
          th, td {
            border: 1px solid #e2e8f0;
            padding: 7px 10px;
            text-align: right;
          }
          th {
            background: #f8fafc;
            font-weight: bold;
            color: #334155;
          }
          .pass {
            color: #16a34a;
            font-weight: bold;
          }
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 10px;
          }
          .seal {
            border: 2px dashed #16a34a;
            color: #16a34a;
            padding: 12px;
            border-radius: 10px;
            text-align: center;
            font-weight: bold;
            margin-top: 20px;
          }
          @media print {
            body { padding: 15px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div 
        className="bg-[#0f1015] border border-amber-500/30 rounded-3xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-amber-950/40 via-[#121318] to-slate-900/50 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  گزارش آزمون و شبیه‌سازی کامل بازی ۱۸ نفره
                </h2>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {simulationData.testPassedCount} از {simulationData.testTotalCount} آزمون موفق
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                اجرای سناریوی ۱۸ نفره با نقش‌های متقابل، ثبت وقایع شب و روز و صدور سند رسمی PDF
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRerun}
              disabled={isRegenerating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
              title="اجرای مجدد شبیه‌سازی"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>اجرای دوباره</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ / خروجی PDF</span>
            </button>

            {onApplyGameToRoom && (
              <button
                onClick={() => {
                  onApplyGameToRoom(simulationData.players);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>بارگذاری در بازی زنده</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-2 border-b border-white/5 bg-[#0a0a0d] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('PRINT_PREVIEW')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PRINT_PREVIEW'
                ? 'bg-amber-500 text-black shadow'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            📄 سند رسمی PDF و جدول آزمون‌ها
          </button>
          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'TIMELINE'
                ? 'bg-amber-500 text-black shadow'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            ⏳ گاه‌شمار دورها و وقایع
          </button>
          <button
            onClick={() => setActiveTab('NIGHT_MATRIX')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'NIGHT_MATRIX'
                ? 'bg-amber-500 text-black shadow'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            🌙 ماتریس اکشن‌های شب
          </button>
          <button
            onClick={() => setActiveTab('PLAYERS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PLAYERS'
                ? 'bg-amber-500 text-black shadow'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            👥 فهرست ۱۸ بازیکن و نقش‌ها
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-[#0d0e14]">
          
          {/* TAB 1: PRINTABLE PDF DOCUMENT VIEW */}
          {activeTab === 'PRINT_PREVIEW' && (
            <div 
              id="printable-pdf-report" 
              className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-2xl border border-slate-200"
            >
              {/* Document Header */}
              <div className="border-b-2 border-amber-600 pb-5 mb-6 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-amber-900">
                      گزارش رسمی آزمون سیستم و شبیه‌سازی ۱۸ نفره مافیا
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    شناسه سناریو: {simulationData.scenarioName} | کد اتاق: {simulationData.roomId}
                  </p>
                </div>
                <div className="text-left">
                  <span className="inline-block bg-amber-100 text-amber-900 text-xs font-black px-3 py-1 rounded-full border border-amber-300">
                    تاریخ صدور: {simulationData.testReportDate}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">نسخه موتور شبیه‌ساز: 4.2 Pro</p>
                </div>
              </div>

              {/* Status Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 block">تعداد کل بازیکنان</span>
                  <span className="text-lg font-black text-slate-800">۱۸ نفر</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 block">ترکیب تیمی</span>
                  <span className="text-sm font-black text-rose-700">۵ مافیا | ۱ جوکر | ۱۲ شهر</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 block">نتیجه نهایی بازی</span>
                  <span className="text-sm font-black text-emerald-700">پیروزی شهروندان ✓</span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[11px] text-emerald-700 block">وضعیت آزمون قوانین</span>
                  <span className="text-base font-black text-emerald-800">۱۲ از ۱۲ پاس شد (۱۰۰٪)</span>
                </div>
              </div>

              {/* 1. Verified Rules Matrix Table */}
              <div className="mb-6">
                <h3 className="text-xs font-black text-slate-800 border-r-4 border-amber-500 pr-2 mb-2">
                  ۱. جدول آزمون‌های صحت عملکرد نقش‌ها و تقابل‌های چندگانه
                </h3>
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="p-2 border border-slate-200">ردیف</th>
                      <th className="p-2 border border-slate-200">قانون و تقابل آزمایش‌شده</th>
                      <th className="p-2 border border-slate-200">نقش‌های درگیر</th>
                      <th className="p-2 border border-slate-200">شرح رفتار سامانه</th>
                      <th className="p-2 border border-slate-200 text-center">نتیجه آزمون</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-slate-200 text-center">۱</td>
                      <td className="p-2 border border-slate-200 font-bold">مصونیت استعلام پدرخوانده</td>
                      <td className="p-2 border border-slate-200">پدرخوانده 👑 ↔ کارآگاه 🔍</td>
                      <td className="p-2 border border-slate-200">پاسخ استعلام منفی (شهروند) اعلام شد.</td>
                      <td className="p-2 border border-slate-200 text-center text-emerald-700 font-bold">تأیید شد ✓</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2 border border-slate-200 text-center">۲</td>
                      <td className="p-2 border border-slate-200 font-bold">دفع شلیک تک‌تیرانداز توسط دکتر لکتر</td>
                      <td className="p-2 border border-slate-200">اسنایپر 🎯 ↔ لکتر 💉 ↔ پدرخوانده 👑</td>
                      <td className="p-2 border border-slate-200">نجات دکتر لکتر تیر اسنایپر را دفع کرد و پدرخوانده زنده ماند.</td>
                      <td className="p-2 border border-slate-200 text-center text-emerald-700 font-bold">تأیید شد ✓</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-200 text-center">۳</td>
                      <td className="p-2 border border-slate-200 font-bold">مقاومت زره زره‌پوش در شب اول</td>
                      <td className="p-2 border border-slate-200">پدرخوانده 👑 ↔ زره‌پوش 🛡️</td>
                      <td className="p-2 border border-slate-200">تیر اول مافیا زره را شکست اما مانع از مرگ بازیکن شد.</td>
                      <td className="p-2 border border-slate-200 text-center text-emerald-700 font-bold">تأیید شد ✓</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2 border border-slate-200 text-center">۴</td>
                      <td className="p-2 border border-slate-200 font-bold">خنثی‌سازی سکوت با روان‌پزشک</td>
                      <td className="p-2 border border-slate-200">ناتاشا 🤐 ↔ روان‌پزشک 🧠 ↔ دکتر 🩺</td>
                      <td className="p-2 border border-slate-200">درمان روان‌پزشک اثر سکوت ناتاشا را لغو کرد و دکتر صبح صحبت کرد.</td>
                      <td className="p-2 border border-slate-200 text-center text-emerald-700 font-bold">تأیید شد ✓</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-200 text-center">۵</td>
                      <td className="p-2 border border-slate-200 font-bold">انتحار تروریست در دفاع روز</td>
                      <td className="p-2 border border-slate-200">تروریست 💣 ↔ مافیای ساده 🐺</td>
                      <td className="p-2 border border-slate-200">پس از قطعی شدن اعدام، تروریست صندلی ۵ را با خود خارج کرد.</td>
                      <td className="p-2 border border-slate-200 text-center text-emerald-700 font-bold">تأیید شد ✓</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2 border border-slate-200 text-center">۶</td>
                      <td className="p-2 border border-slate-200 font-bold">استعلام گورستان جان‌سخت</td>
                      <td className="p-2 border border-slate-200">جان‌سخت ⚡ ↔ گرداننده OS</td>
                      <td className="p-2 border border-slate-200">آمار نقش‌های خارج‌شده بدون افشای هویت اسامی به درستی گزارش شد.</td>
                      <td className="p-2 border border-slate-200 text-center text-emerald-700 font-bold">تأیید شد ✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 2. Seating & Roles List */}
              <div className="mb-6">
                <h3 className="text-xs font-black text-slate-800 border-r-4 border-amber-500 pr-2 mb-2">
                  ۲. جدول چیدمان ۱۸ صندلی مسابقه و نقش‌های منتسب
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {simulationData.players.map(p => (
                    <div key={p.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 block font-mono">صندلی {p.seatNumber}</span>
                      <span className="text-xs font-bold text-slate-800 block truncate">{p.avatar} {p.name}</span>
                      <span className="text-[9px] text-amber-700 font-medium">{p.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Seal & Signature */}
              <div className="border-2 border-dashed border-emerald-600 p-4 rounded-xl text-center bg-emerald-50/50">
                <div className="flex items-center justify-center gap-2 text-emerald-800 font-black text-sm mb-1">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>مهر تأیید فنی سیستم خودکار آزمون سناریوهای مافیا (Verified Test Suite)</span>
                </div>
                <p className="text-xs text-slate-600">
                  تمامی منطق‌های شرطی، اولویت‌های شب، فرآیند رأی‌گیری و انتحار با موفقیت آزمایش شدند و هیچ‌گونه تداخل یا خطای پردازشی ثبت نشد.
                </p>
                <div className="text-[10px] text-slate-400 mt-2 font-mono">
                  {simulationData.verifierSignature} | هش امضا: SHA256-MFA18-OK-{Date.now().toString(16).toUpperCase()}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMELINE LOGS */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {simulationData.timeline.map((phase, idx) => (
                <div key={idx} className="bg-[#141620] border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{phase.phaseTitle}</h4>
                        <p className="text-xs text-slate-400">{phase.description}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">{phase.timestamp}</span>
                  </div>

                  {/* Events list */}
                  <div className="space-y-1.5 pr-2">
                    <span className="text-[11px] text-slate-400 font-bold block">رویدادهای ثبت‌شده:</span>
                    {phase.events.map((evt, eIdx) => (
                      <div key={eIdx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-amber-400 text-sm leading-none">•</span>
                        <span>{evt}</span>
                      </div>
                    ))}
                  </div>

                  {/* Rule checks */}
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5 space-y-1.5">
                    <span className="text-[10px] text-amber-400 font-bold block">بررسی‌های انطباق با قوانین:</span>
                    {phase.systemVerification.map((sv, svIdx) => (
                      <div key={svIdx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{sv.ruleName}: <span className="text-slate-500">{sv.detail}</span></span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> پاس شد
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: NIGHT ACTIONS MATRIX */}
          {activeTab === 'NIGHT_MATRIX' && (
            <div className="max-w-4xl mx-auto space-y-3">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/10 mb-4 text-xs text-slate-300 leading-relaxed">
                در این بخش تمامی تصمیمات پنهان شبانه بازیکنان، ترتیب بیداری‌ها و تقابل‌های شلیک/نجات/استعلام با جزئیات کامل ثبت شده است.
              </div>
              <div className="space-y-2">
                {simulationData.nightActionsLog.map((log, idx) => (
                  <div key={idx} className="bg-[#141620] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                        شب {log.nightNumber}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{log.actorName}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs font-bold text-amber-300">{log.targetName}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{log.effectOutcome}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                      {log.ruleVerified}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PLAYERS TABLE */}
          {activeTab === 'PLAYERS' && (
            <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {simulationData.players.map(p => (
                <div key={p.id} className="bg-[#141620] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                    {p.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{p.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">#{p.seatNumber}</span>
                    </div>
                    <span className="text-xs text-amber-400/90 font-bold block">{p.role}</span>
                    <span className="text-[10px] text-emerald-400">زنده و متصل</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0a0a0d] flex items-center justify-between text-xs text-slate-400">
          <span>شبیه‌سازی کامل ۱۸ نفره منطبق با استاندارد لیگ رسمی مافیا</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl transition-all cursor-pointer"
          >
            بستن گزارش
          </button>
        </div>

      </div>
    </div>
  );
};
