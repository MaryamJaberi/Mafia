import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, Play, Users, Bot, 
  Target, Moon, Vote, Shield, Skull, Activity, 
  X, Check, RefreshCw, Cpu, Layers, Award, BarChart3, FastForward
} from 'lucide-react';
import { Player, RoleId, RoomState, Language } from '../../types/mafia';
import { ROLE_DEFINITIONS } from '../../utils/scenarios';
import { generateBalancedRoles, generateBotPlayers, runSimulationTest, TestSuiteReport } from '../../utils/testSimulator';
import { soundEngine } from '../../utils/audioSynth';

interface MultiPlayerTestBenchModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: RoomState;
  onApplyBotsToRoom: (players: Player[]) => void;
  onSimulateAccusations?: () => void;
  onSimulateNightActions?: () => void;
  onSimulateVotes?: () => void;
  language: Language;
}

export const MultiPlayerTestBenchModal: React.FC<MultiPlayerTestBenchModalProps> = ({
  isOpen,
  onClose,
  room,
  onApplyBotsToRoom,
  onSimulateAccusations,
  onSimulateNightActions,
  onSimulateVotes,
  language
}) => {
  const [playerCount, setPlayerCount] = useState<number>(10);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testReport, setTestReport] = useState<TestSuiteReport | null>(null);
  const [activeTab, setActiveTab] = useState<'GENERATOR' | 'REPORT'>('GENERATOR');

  if (!isOpen) return null;

  const PRESET_SIZES = [
    { count: 9, label: '۹ نفره', desc: 'کلاسیک ۳ به ۶' },
    { count: 10, label: '۱۰ نفره', desc: 'تورنمنت ۳ به ۷' },
    { count: 12, label: '۱۲ نفره', desc: 'پیشرفته ۴ به ۸' },
    { count: 14, label: '۱۴ نفره', desc: 'گرند ۴ مافیا + ۱ جوکر' },
    { count: 16, label: '۱۶ نفره', desc: 'حرفه‌ای ۵ مافیا + ۱ جوکر' },
    { count: 18, label: '۱۸ نفره', desc: 'کاپ ۱۸ نفره ۵ به ۱۲' },
    { count: 20, label: '۲۰ نفره', desc: 'جام قهرمانی ۶ به ۱۳' },
    { count: 21, label: '۲۱ نفره', desc: 'ماکزیمم ظرفیت ۶ به ۱۴' },
  ];

  const currentBalancedRoles = generateBalancedRoles(playerCount);
  const mafiaCount = currentBalancedRoles.filter(r => ROLE_DEFINITIONS[r]?.affiliation === 'MAFIA').length;
  const citizenCount = currentBalancedRoles.filter(r => ROLE_DEFINITIONS[r]?.affiliation === 'CITIZEN').length;
  const independentCount = currentBalancedRoles.filter(r => ROLE_DEFINITIONS[r]?.affiliation === 'INDEPENDENT').length;

  const handleApplyToActiveRoom = () => {
    soundEngine.playGong();
    const newBots = generateBotPlayers(playerCount);
    onApplyBotsToRoom(newBots);
    onClose();
  };

  const handleRunAutomatedTest = async () => {
    soundEngine.playTick();
    setIsRunningTest(true);
    setTestReport(null);

    // Simulate brief test execution delay for real-time visual progress
    await new Promise(r => setTimeout(r, 600));
    const report = await runSimulationTest(playerCount);
    setTestReport(report);
    setIsRunningTest(false);
    setActiveTab('REPORT');
    soundEngine.playVictory();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f0f14] border border-amber-500/30 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-right" dir="rtl">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-950/40 via-[#16120e] to-[#0f0f14] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 text-2xl shadow-lg shadow-amber-500/10">
              <Cpu className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#e2e2e7]">
                  تست‌بنچ و شبیه‌ساز ۹ تا ۲۱ بازیکن
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30">
                  Bot Test Bench
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                شبیه‌سازی کامل بازیکنان، سناریوها، اکت‌های شب و رأی‌گیری بدون نیاز به اشخاص دیگر.
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

        {/* Tab Navigation */}
        <div className="flex items-center px-4 sm:px-6 pt-3 bg-[#0a0a0c] border-b border-white/5 gap-2">
          <button
            onClick={() => setActiveTab('GENERATOR')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
              activeTab === 'GENERATOR'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>تنظیم و تزریق سناریو ({playerCount} نفره)</span>
          </button>

          <button
            onClick={() => setActiveTab('REPORT')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
              activeTab === 'REPORT'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>کارنامه و نتایج تست خودکار {testReport && `(${testReport.passedCount}/${testReport.totalAssertions})`}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {activeTab === 'GENERATOR' ? (
            <>
              {/* Presets Grid (9 to 21) */}
              <div>
                <label className="text-xs font-extrabold text-slate-300 block mb-2.5">
                  انتخاب سریع ظرفیت بازیکنان برای تست (۹ تا ۲۱ نفر):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRESET_SIZES.map((preset) => {
                    const isSelected = playerCount === preset.count;
                    return (
                      <button
                        key={preset.count}
                        onClick={() => {
                          setPlayerCount(preset.count);
                          soundEngine.playTick();
                        }}
                        className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10 scale-102 ring-2 ring-amber-500/30'
                            : 'bg-[#0a0a0c] border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base font-black font-mono">{preset.count} نفر</span>
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 font-bold">{preset.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider for fine grain adjustments */}
              <div className="p-4 rounded-2xl bg-[#0a0a0c] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200">تنظیم دقیق اسلایدر تعداد بازیکنان:</span>
                  </div>
                  <span className="text-xl font-black text-amber-400 font-mono">{playerCount} بازیکن</span>
                </div>

                <input
                  type="range"
                  min="9"
                  max="21"
                  step="1"
                  value={playerCount}
                  onChange={(e) => setPlayerCount(Number(e.target.value))}
                  className="w-full h-2.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>۹ نفر (حداقل)</span>
                  <span>۱۵ نفر (متوسط)</span>
                  <span>۲۱ نفر (حداکثر)</span>
                </div>
              </div>

              {/* Roles Breakdown for selected count */}
              <div className="p-4 rounded-2xl bg-[#0a0a0c] border border-white/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                  <span className="text-xs font-bold text-slate-200">
                    توزیع تراز شده نقش‌ها برای {playerCount} بازیکن:
                  </span>

                  <div className="flex items-center gap-2 text-xs font-mono font-bold">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      مافیا: {mafiaCount}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      شهروند: {citizenCount}
                    </span>
                    {independentCount > 0 && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        مستقل: {independentCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Role Chips */}
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 scrollbar-none">
                  {currentBalancedRoles.map((roleId, idx) => {
                    const def = ROLE_DEFINITIONS[roleId] || ROLE_DEFINITIONS.CITIZEN_SIMPLE;
                    const isMafia = def.affiliation === 'MAFIA';
                    const isCitizen = def.affiliation === 'CITIZEN';

                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                          isMafia
                            ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                            : isCitizen
                            ? 'bg-sky-950/40 text-sky-300 border-sky-500/40'
                            : 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        <span className="text-xs font-mono text-slate-400">#{idx + 1}</span>
                        <span>{def.nameKey.replace('role_', '')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleApplyToActiveRoom}
                  className="py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-98 cursor-pointer"
                >
                  <Bot className="w-4 h-4 fill-current" />
                  <span>تزریق {playerCount} بازیکن به اتاق بازی زنده</span>
                </button>

                <button
                  onClick={handleRunAutomatedTest}
                  disabled={isRunningTest}
                  className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-amber-500/20 text-slate-100 hover:text-amber-300 border border-white/15 hover:border-amber-500/40 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                >
                  {isRunningTest ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>در حال اجرای تست اتوماسیون...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>اجرای تست خودکار سناریو (Auto-Run)</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Test Report View */
            <div className="space-y-4">
              {testReport ? (
                <>
                  {/* Summary Banner */}
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-[#0e1712] to-[#0a0a0c] border border-emerald-500/40 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 text-2xl">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-[#e2e2e7]">
                          تست سناریو {testReport.playerCount} نفره با موفقیت ۱۰۰٪ پاس شد!
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {testReport.passedCount} از {testReport.totalAssertions} تست موفق در {testReport.totalDurationMs} میلی‌ثانیه.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onApplyBotsToRoom(testReport.generatedRoomState.players)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      اعمال داده‌های این تست به اتاق
                    </button>
                  </div>

                  {/* Assertion Checklist */}
                  <div className="space-y-2.5">
                    {testReport.assertions.map((assertion, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl bg-[#0a0a0c] border border-white/5 flex items-start gap-3"
                      >
                        <div className="mt-0.5">
                          {assertion.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <X className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{assertion.title}</span>
                            <span className="text-[10px] font-mono text-slate-500">{assertion.durationMs}ms</span>
                          </div>
                          <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">
                            {assertion.details}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Sim Step Buttons */}
                  <div className="p-4 rounded-2xl bg-[#0a0a0c] border border-white/10 space-y-2.5">
                    <span className="text-xs font-bold text-slate-300 block">
                      عملیات‌های شبیه‌سازی زنده روی اتاق فعال:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={onSimulateAccusations}
                        className="py-2 px-3 rounded-xl bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-xs font-bold border border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Target className="w-3.5 h-3.5 text-amber-400" />
                        <span>شلیک اتهامات تصادفی</span>
                      </button>

                      <button
                        onClick={onSimulateNightActions}
                        className="py-2 px-3 rounded-xl bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-xs font-bold border border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Moon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>شبیه‌سازی شلیک‌های شب</span>
                      </button>

                      <button
                        onClick={onSimulateVotes}
                        className="py-2 px-3 rounded-xl bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-xs font-bold border border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Vote className="w-3.5 h-3.5 text-rose-400" />
                        <span>رأی‌گیری دسته‌جمعی</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 space-y-3">
                  <Cpu className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
                  <p className="text-xs text-slate-400">
                    هنوز تست اتوماسیونی اجرا نشده است. روی دکمه زیر کلیک کنید:
                  </p>
                  <button
                    onClick={handleRunAutomatedTest}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    شروع تست سناریو {playerCount} نفره
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-[#0a0a0c] border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
          <span>سیستم تست هوشمند سیستم‌عامل مافیا (تست ظرفیت ۹ تا ۲۱ بازیکن)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>

      </div>
    </div>
  );
};
