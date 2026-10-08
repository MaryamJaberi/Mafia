import React, { useState } from 'react';
import { 
  X, Sparkles, Brain, Bot, Send, CheckCircle2, AlertCircle, 
  HelpCircle, Layers, Shield, Swords, Plus, RefreshCw, Copy, Check,
  BookOpen, Play, Trash2, ArrowRight
} from 'lucide-react';
import { Language } from '../../types/mafia';
import { soundEngine } from '../../utils/audioSynth';
import { 
  MatrixScenario, MatrixRole, MatrixCell, pair, 
  saveCustomMatrixScenario 
} from '../../data/matrixData';

interface ClarifyingQuestion {
  id: string;
  question: string;
  options: string[];
  recommendedOption: string;
  reason?: string;
  selectedAnswer?: string;
}

interface ScenarioRole {
  id: string;
  name: string;
  team: 'CITIZEN' | 'MAFIA' | 'INDEPENDENT';
  nightPriority: number;
  nightAction: string;
  dayAction: string;
  description: string;
  examples: string;
}

interface RoleClashItem {
  roleA: string;
  roleB: string;
  roleAName?: string;
  roleBName?: string;
  interaction: string;
}

interface ScenarioAnalysisResult {
  scenarioName: string;
  recommendedPlayers: string;
  summary: string;
  roles: ScenarioRole[];
  nightSequence: Array<{ roleId: string; roleName: string; action: string }>;
  roleClashes: RoleClashItem[];
  clarifyingQuestions: ClarifyingQuestion[];
  suggestedHouseRules?: {
    sniperOnLeader?: string;
    armoredShieldVsSniper?: string;
    doctorSelfSaveLimit?: string;
    independentInquiryResult?: string;
    tiedVoteOutcome?: string;
    notes?: string;
  };
}

interface AiScenarioBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onScenarioAdded?: (scenario: MatrixScenario) => void;
  onOpenMatrixWithScenario?: (scenarioId: string) => void;
}

export const AiScenarioBuilderModal: React.FC<AiScenarioBuilderModalProps> = ({
  isOpen,
  onClose,
  language,
  onScenarioAdded,
  onOpenMatrixWithScenario
}) => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ScenarioAnalysisResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [chatMessage, setChatMessage] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedScenarioId, setSavedScenarioId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isEn = language === 'en';

  const presets = isEn ? [
    {
      title: 'Russian Mafia with Werewolf & Gravedigger',
      text: `Scenario: Russian Mafia (10 players)
Mafia Roles: Godfather (negative inquiry), Doctor Lector (save mafia ally), Matador (block ability).
Independent: Werewolf (kills every other night, must eliminate everyone to win).
Citizen Roles: Doctor (save), Detective (inquiry), Ranger (shoot mafia), Armored (has vest), Devotee (suicide exit during day), Gravedigger (exhume dead player roles), Simple Citizen (2 players).
Rules: Werewolf shot breaks Armored vest. Werewolf inquiry is negative.`
    },
    {
      title: 'Dark Knight & Terrorist Scenario',
      text: `Scenario: Dark Knight (12 players)
Mafia: Mafia Boss, King Killer, Terrorist (if eliminated by daytime vote, takes someone along).
Citizen: Detective, Doctor, Sniper, Priest (revive enchanted player), Judge (veto defense vote), 2 Simple Citizens.
Independent: Demon (infects one person every night).`
    },
    {
      title: 'Interrogator & Gunsmith Scenario',
      text: `Scenario: Interrogator & Gunsmith
Mafia: Godfather, Natasha (24-hour silence), Simple Mafia.
Citizen: Interrogator (in-person inquiry before voting), Gunsmith (hands out live and blank guns), Doctor, Detective, Simple Citizen (3 players).
House Rules: In case of tie in defense, both players survive.`
    }
  ] : [
    {
      title: 'مافیای روسی با گرگینه و گورکن',
      text: `سناریو: مافیای روسی
نقش‌های مافیا: پدرخوانده (استعلام منفی)، دکتر لکتور (سیو یار مافیا)، ماتادور (بلاک قابلیت).
نقش‌های مستقل: گرگینه (شب در میان شات می‌زند و برای پیروزی باید همه را حذف کند).
نقش‌های شهروند: دکتر (سیو جان)، کارآگاه (استعلام)، تکاور (شلیک به مافیا)، زره‌پوش (دارای جلیقه)، فدایی (توانایی خروج انتحاری در روز)، گورکن (استعلام نبش قبر نقش‌های فوت‌شده)، شهروند ساده (۲ نفر).
قوانین: شات گرگ روی زره‌پوش جلیقه را می‌اندازد. استعلام گرگ منفی است.`
    },
    {
      title: 'سناریو شوالیه‌های تاریکی و تروریست',
      text: `سناریو: شوالیه‌های تاریکی (۱۲ نفره)
مافیا: رئیس مافیا، شاه‌کش، تروریست (اگر با رای روز برود یک نفر را همراه خود حذف می‌کند).
شهروندان: کارآگاه، پزشک، اسنایپر، کشیش (بیدار کردن بازیکن طلسم‌شده)، قاضی (حق وتوی رای‌گیری دفاعیه)، ۲ شهروند ساده.
مستقل: شیطان (هر شب یک نفر را آلوده می‌کند).`
    },
    {
      title: 'سناریوی بازپرس و تفنگدار کافه‌ای',
      text: `سناریو: بازپرس و ساقی
مافیا: پدرخوانده، ناتاشا (سکوت ۲۴ ساعته)، مافیای ساده.
شهروند: بازپرس (استعلام حضوری قبل از رای‌گیری)، تفنگدار (توزیع تفنگ جنگی و مشقی)، دکتر، کارآگاه، شهروند ساده (۳ نفر).
قوانین میز: در صورت تساوی در دفاعیه هر دو بازیکن می‌مانند.`
    }
  ];

  const handleAnalyze = async (customPrompt?: string) => {
    const textToAnalyze = customPrompt || inputText;
    if (!textToAnalyze.trim()) {
      setErrorMessage(isEn ? 'Please enter a scenario description or role names.' : 'لطفاً توضیحات سناریو یا نام نقش‌ها را وارد کنید.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/ai/analyze-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioText: textToAnalyze,
          currentDraft: analysis || undefined
        })
      });

      if (!res.ok) throw new Error(isEn ? 'Failed to communicate with AI server' : 'خطا در ارتباط با سرور هوش مصنوعی');
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        soundEngine.playGong();

        // Initialize default answers for clarifying questions
        const initialAnswers: Record<string, string> = {};
        data.analysis.clarifyingQuestions?.forEach((q: ClarifyingQuestion) => {
          initialAnswers[q.id] = q.recommendedOption || q.options?.[0] || '';
        });
        setAnswers(initialAnswers);
      } else {
        throw new Error(data.error || (isEn ? 'Invalid response from scenario analyzer' : 'پاسخ نامعتبر از تحلیل‌گر'));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || (isEn ? 'Error analyzing scenario' : 'خطا در تحلیل سناریو'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefineChat = async () => {
    if (!chatMessage.trim() || !analysis) return;
    setIsRefining(true);

    try {
      const prompt = isEn
        ? `Current scenario: ${analysis.scenarioName}
User modification or addition: ${chatMessage}

Please apply these updates and return the revised, balanced scenario with full clash matrix.`
        : `سناریوی فعلی: ${analysis.scenarioName}
دستور اصلاح یا افزودن کاربر: ${chatMessage}

لطفاً این اصلاحات را اعمال کرده و سناریو را مجدداً به‌روز و سازمان‌یافته با بررسی کامل تلاقی نقش‌ها برگردانید.`;

      const res = await fetch('/api/ai/analyze-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioText: prompt,
          currentDraft: analysis,
          conversationHistory: [{ role: 'user', content: chatMessage }]
        })
      });

      if (!res.ok) throw new Error(isEn ? 'Error refining scenario' : 'خطا در اصلاح سناریو');
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        setChatMessage('');
        soundEngine.playTick();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || (isEn ? 'Error applying refinements' : 'خطا در اعمال اصلاحات'));
    } finally {
      setIsRefining(false);
    }
  };

  const handleSaveToApp = () => {
    if (!analysis) return;

    // Convert analysis roles to MatrixRole and MatrixCell format
    const slug = 'custom_' + Date.now().toString(36);
    const matrixRoles: MatrixRole[] = analysis.roles.map(r => ({
      id: r.id || `role_${Math.random().toString(36).substring(2, 6)}`,
      n: r.name
    }));

    const matrixCells: MatrixCell[] = [];

    // Diagonal self entries
    analysis.roles.forEach(r => {
      matrixCells.push({
        a: r.id,
        b: r.id,
        t: `${r.description}\n\n**اکت شب:** ${r.nightAction || 'ندارد'}\n**اکت روز:** ${r.dayAction || 'مشارکت در رای‌گیری'}\n**اولویت شب:** ${r.nightPriority > 0 ? r.nightPriority : 'بدون بیداری'}\n\n${r.examples ? `**مثال:**\n${r.examples}` : ''}`
      });
    });

    // Cross-clash entries
    analysis.roleClashes.forEach(clash => {
      matrixCells.push({
        a: clash.roleA,
        b: clash.roleB,
        t: clash.interaction
      });
    });

    const newMatrixScenario: MatrixScenario = {
      id: slug,
      name: analysis.scenarioName || 'سناریوی اختصاصی هوش مصنوعی',
      players: analysis.recommendedPlayers || '۱۰ تا ۱۲ نفر',
      notes: analysis.summary || 'طراحی و تحلیل‌شده توسط طراح هوشمند هوش مصنوعی',
      warn: analysis.clarifyingQuestions?.length 
        ? `قوانین توافق‌شده میز: ${Object.values(answers).join(' | ')}`
        : undefined,
      roles: matrixRoles,
      cells: matrixCells
    };

    saveCustomMatrixScenario(newMatrixScenario);
    setSavedSuccess(true);
    setSavedScenarioId(slug);
    soundEngine.playGong();

    if (onScenarioAdded) {
      onScenarioAdded(newMatrixScenario);
    }
  };

  const handleCopyJson = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-hidden animate-in fade-in duration-200" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[920px] bg-[#0d0d16] border border-amber-500/30 rounded-3xl flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#141422] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-cyan-500/20 to-purple-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-amber-400">
                  {isEn ? 'AI Scenario Designer & Analyzer' : 'طراح و تحلیل‌گر سناریو با هوش مصنوعی'}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Gemini 3.7 Flash Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isEn ? 'Extract roles, analyze nighttime conflicts, resolve ambiguities, and add directly to matrix table' : 'استخراج نقش‌ها، تحلیل تعامل و تقابل‌های شبانه، رفع ابهامات و اضافه کردن مستقیم به جدول برنامه'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playTick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Input Section */}
          <div className="space-y-3 bg-[#12121e] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-inner">
            <div className="flex items-center justify-between">
              <label className="text-sm font-black text-slate-200 flex items-center gap-2">
                <span>{isEn ? 'Write or paste your scenario description, scenario name, or role list:' : 'توضیحات، نام سناریو یا لیست نقش‌های خود را بنویسید یا جای‌گذاری کنید:'}</span>
              </label>
              <span className="text-xs text-slate-400">
                {isEn ? 'Supports any number of roles and factions' : 'پشتیبانی از هر تعداد نقش و ساید'}
              </span>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isEn 
                ? "e.g. 10-player scenario with Godfather, Werewolf, Matador, Doctor, Detective, Ranger, Armored, Devotee, and 2 Simple Citizens. Werewolf shoots every other night..." 
                : "مثلاً: سناریوی ۱۰ نفره شامل پدرخوانده، گرگ، ماتادور، دکتر، کارآگاه، تکاور، زره‌پوش، فدایی و ۲ شهروند ساده. گرگ هر شب در میان شات می‌زند..."}
              rows={4}
              className="w-full bg-[#0a0a10] border border-white/10 focus:border-amber-500 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all leading-relaxed"
            />

            {/* Presets */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold text-slate-400">{isEn ? 'Ready presets for quick test:' : 'پیش‌فرض‌های آماده برای تست سریع:'}</div>
              <div className="flex flex-wrap gap-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(p.text);
                      handleAnalyze(p.text);
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/15 text-slate-300 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 transition-all text-right"
                  >
                    ⚡ {p.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Analyze Trigger Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => handleAnalyze()}
                disabled={isAnalyzing || !inputText.trim()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all cursor-pointer shadow-lg ${
                  isAnalyzing || !inputText.trim()
                    ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-black hover:scale-[1.02] shadow-amber-500/20'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>{isEn ? 'Analyzing roles and clash matrix with AI...' : 'در حال تحلیل هوشمند نقش‌ها و ماتریس تقابل‌ها...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{isEn ? 'Smart Analysis & Generate Clash Matrix' : 'تحلیل هوشمند و تولید ماتریس تقابل‌ها'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Results Display */}
          {analysis && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Top Banner with Action Buttons */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#17172a] via-[#1a1a32] to-[#17172a] border border-amber-500/30 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-amber-400">
                      {analysis.scenarioName}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      👥 {analysis.recommendedPlayers}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? (isEn ? 'Copied!' : 'کپی شد!') : (isEn ? 'Copy Output' : 'کپی خروجی')}</span>
                  </button>

                  <button
                    onClick={handleSaveToApp}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isEn ? 'Save & Add to App' : 'ذخیره و افزودن به برنامه'}</span>
                  </button>
                </div>
              </div>

              {/* Saved Success Notice */}
              {savedSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex flex-wrap items-center justify-between gap-3 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>{isEn ? 'Scenario successfully added to scenario bank and matrix table!' : 'سناریو با موفقیت به بانک سناریوهای برنامه و جدول ماتریس اضافه شد!'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {savedScenarioId && onOpenMatrixWithScenario && (
                      <button
                        onClick={() => {
                          onOpenMatrixWithScenario(savedScenarioId);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black font-black text-xs hover:bg-emerald-400 transition-all flex items-center gap-1"
                      >
                        <span>{isEn ? 'View in 17-Scenario Matrix' : 'مشاهده در جدول ۱۷ سناریو'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Clarifying Questions Section (If Any) */}
              {analysis.clarifyingQuestions && analysis.clarifyingQuestions.length > 0 && (
                <div className="p-5 rounded-2xl bg-[#141424] border border-amber-500/30 space-y-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <HelpCircle className="w-5 h-5" />
                    <h4 className="text-sm font-black">
                      {isEn ? 'Ambiguity Review & Specialist Questions from AI:' : 'بررسی ابهامات و طرح سوالات تخصصی از طرف هوش مصنوعی:'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400">
                    {isEn ? 'To resolve potential conflicts or table rule misalignments, please choose your preferred options:' : 'برای رفع تعارضات احتمالی یا ناهماهنگی قوانین میز، گزینه‌های مورد نظر خود را مشخص فرمایید:'}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {analysis.clarifyingQuestions.map((q) => (
                      <div key={q.id} className="p-4 rounded-xl bg-[#0a0a10] border border-white/10 space-y-2.5">
                        <div className="text-xs font-bold text-slate-200 leading-relaxed">
                          {q.question}
                        </div>
                        {q.reason && (
                          <div className="text-[11px] text-amber-400/80">
                            💡 {q.reason}
                          </div>
                        )}
                        <div className="space-y-1.5 pt-1">
                          {q.options?.map((opt, oIdx) => (
                            <label
                              key={oIdx}
                              className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition-all ${
                                answers[q.id] === opt 
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' 
                                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-transparent'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q_${q.id}`}
                                value={opt}
                                checked={answers[q.id] === opt}
                                onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                className="accent-amber-500"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Roles Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-200 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>{isEn ? `Extracted Roles & Abilities (${analysis.roles?.length || 0} roles)` : `لیست نقش‌ها و قابلیت‌های استخراج‌شده (${analysis.roles?.length || 0} نقش)`}</span>
                  </h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                      {isEn ? 'Citizen: ' : 'شهروند: '}{analysis.roles?.filter(r => r.team === 'CITIZEN').length || 0}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                      {isEn ? 'Mafia: ' : 'مافیا: '}{analysis.roles?.filter(r => r.team === 'MAFIA').length || 0}
                    </span>
                    {analysis.roles?.some(r => r.team === 'INDEPENDENT') && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                        {isEn ? 'Independent: ' : 'مستقل: '}{analysis.roles?.filter(r => r.team === 'INDEPENDENT').length || 0}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analysis.roles?.map((role) => (
                    <div 
                      key={role.id} 
                      className={`p-4 rounded-2xl border space-y-2 ${
                        role.team === 'CITIZEN'
                          ? 'bg-[#101928] border-cyan-500/30'
                          : role.team === 'MAFIA'
                          ? 'bg-[#221217] border-rose-500/30'
                          : 'bg-[#1e1328] border-purple-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-black text-sm text-white flex items-center gap-1.5">
                          <span>{role.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            role.team === 'CITIZEN' ? 'bg-cyan-500/20 text-cyan-300' :
                            role.team === 'MAFIA' ? 'bg-rose-500/20 text-rose-300' :
                            'bg-purple-500/20 text-purple-300'
                          }`}>
                            {role.team === 'CITIZEN' ? (isEn ? 'Citizen' : 'شهروند') : role.team === 'MAFIA' ? (isEn ? 'Mafia' : 'مافیا') : (isEn ? 'Independent' : 'مستقل')}
                          </span>
                        </div>
                        {role.nightPriority > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                            {isEn ? `Night #${role.nightPriority}` : `شب #${role.nightPriority}`}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {role.description}
                      </p>

                      <div className="pt-2 border-t border-white/5 space-y-1 text-[11px] text-slate-400">
                        <div><strong className="text-slate-300">{isEn ? 'Night Action: ' : 'اکت شب:'}</strong> {role.nightAction || (isEn ? 'None' : 'بدون بیداری')}</div>
                        <div><strong className="text-slate-300">{isEn ? 'Day Action: ' : 'اکت روز:'}</strong> {role.dayAction || (isEn ? 'Voting' : 'رای‌گیری')}</div>
                        {role.examples && (
                          <div className="text-slate-400 italic">💡 {role.examples}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Night Sequence */}
              {analysis.nightSequence && analysis.nightSequence.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#12121e] border border-white/10 space-y-3">
                  <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>{isEn ? 'Night Sequence & Waking Order' : 'ترتیب بیداری و عملکرد شبانه (Night Sequence)'}</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.nightSequence.map((ns, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-200">{ns.roleName}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-[11px] text-slate-400">{ns.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Role Clashes Matrix Preview */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-200 flex items-center gap-2">
                  <Swords className="w-4 h-4 text-amber-400" />
                  <span>{isEn ? `Role Clash & Interaction Matrix (${analysis.roleClashes?.length || 0} clashes)` : `ماتریس تلاقی و اثر متقابل نقش‌ها (${analysis.roleClashes?.length || 0} تلاقی)`}</span>
                </h4>

                <div className="space-y-2">
                  {analysis.roleClashes?.map((clash, cIdx) => (
                    <div key={cIdx} className="p-3.5 rounded-xl bg-[#10101c] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 font-black text-amber-300 sm:w-1/3 flex-shrink-0">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">{clash.roleAName || clash.roleA}</span>
                        <span>×</span>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">{clash.roleBName || clash.roleB}</span>
                      </div>
                      <div className="text-slate-300 leading-relaxed sm:w-2/3">
                        {clash.interaction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refinement & Chat with AI */}
              <div className="p-4 rounded-2xl bg-[#12121e] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span>{isEn ? 'Want to add/remove a role or change a rule? Chat with AI:' : 'می‌خواهید نقشی اضافه، کم یا قانونی را تغییر دهید؟ با هوش مصنوعی گفتگو کنید:'}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRefineChat();
                    }}
                    placeholder={isEn 
                      ? "e.g. Please add Joker as independent or make Werewolf shoot every night..." 
                      : "مثلاً: لطفاً نقش جوکر رو هم به عنوان مستقل اضافه کن یا شات گرگ رو هر شب بکن..."}
                    className="flex-1 bg-[#0a0a10] border border-white/10 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
                  />
                  <button
                    onClick={handleRefineChat}
                    disabled={isRefining || !chatMessage.trim()}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
                  >
                    {isRefining ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{isEn ? 'Apply' : 'اعمال'}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#12121e] flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>{isEn ? '✨ 17 Reference Scenarios + Custom Scenarios created by you' : '✨ بانک ۱۷ سناریوی مرجع + سناریوهای سفارشی ساخته‌شده توسط شما'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playTick();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all"
            >
              {isEn ? 'Close' : 'بستن'}
            </button>
            {analysis && (
              <button
                onClick={handleSaveToApp}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all shadow-md shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEn ? 'Save & Register in App' : 'ذخیره و ثبت سناریو در برنامه'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
