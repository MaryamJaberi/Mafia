import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Play, RefreshCw, Copy, Check, 
  ShieldCheck, AlertTriangle, Layers, Award, Terminal, Filter,
  ChevronDown, ChevronUp, Sparkles, Activity, FileText, Bug
} from 'lucide-react';
import { runFullAutomatedQASuite, QAFullReport, QAScenarioSuiteResult } from '../../utils/qaTestEngine';
import { Language } from '../../types/mafia';
import { translations } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';

interface AutomatedQASuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const AutomatedQASuiteModal: React.FC<AutomatedQASuiteModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<{
    currentScenarioIndex: number;
    totalScenarios: number;
    currentRunIndex: number;
    totalRuns: number;
    scenarioName: string;
    percent: number;
  } | null>(null);
  const [report, setReport] = useState<QAFullReport | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedScenarioId, setExpandedScenarioId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'FAILED' | 'PASSED'>('ALL');

  const t = translations[language];

  const handleStartFullQA = async () => {
    setIsRunning(true);
    soundEngine.playTick();
    try {
      const result = await runFullAutomatedQASuite((p) => {
        setProgress(p);
      });
      setReport(result);
      if (result.overallStatus === 'PASSED') {
        soundEngine.playVictory();
      } else {
        soundEngine.playFoulSound();
      }
    } catch (err) {
      console.error('QA Suite Error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyReport = () => {
    if (!report) return;
    const summary = `
=== MAFIA OS AUTOMATED QA SUITE AUDIT REPORT ===
Date: ${new Date(report.timestamp).toLocaleString()}
Status: ${report.overallStatus}
System Integrity Score: ${report.systemIntegrityScore}%
Scenarios Tested: ${report.totalScenarios} (5 runs each = ${report.totalRunsCompleted} total full matches)
Total Runs Passed: ${report.totalPassedRuns} / ${report.totalRunsCompleted}
Total Assertions: ${report.totalAssertionsPassed} / ${report.totalAssertionsChecked} passed
Execution Time: ${(report.executionDurationMs / 1000).toFixed(2)}s

Subsystems:
${report.subsystemChecks.map(s => `- ${s.name}: ${s.passed ? 'PASSED' : 'FAILED'} (${s.details})`).join('\n')}

Scenario Breakdown:
${report.scenarioSuites.map(s => `- [${s.allPassed ? 'PASS' : 'FAIL'}] ${s.scenario.name}: ${s.totalPassed}/5 runs passed`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const filteredSuites = report?.scenarioSuites.filter(s => {
    if (filterMode === 'FAILED') return !s.allPassed;
    if (filterMode === 'PASSED') return s.allPassed;
    return true;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#0f0f12] border border-emerald-500/30 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        dir={language === 'en' ? 'ltr' : 'rtl'}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-[#0f0f12] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                {language === 'fa' ? 'سیستم تست خودکار و اعتبارسنجی جامع (QA Suite)' : 'Automated QA & Simulation Engine'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  85 Runs (17 × 5)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'fa' 
                  ? 'اجرای خودکار ۵ دست بازی کامل برای تمام ۱۷ سناریوی استاندارد همراه با ثبت لاگ و راستی‌آزمایی منطق بازی' 
                  : 'Automated 5-game simulations for all 17 presets testing night resolution, voting, ties, and victory states.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {report && (
              <button
                onClick={handleCopyReport}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (language === 'fa' ? 'کپی شد' : 'Copied') : (language === 'fa' ? 'کپی گزارش QA' : 'Copy Report')}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Action / Overview Bar */}
        <div className="p-4 sm:p-5 bg-neutral-900/60 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="btn-run-all-qa"
              onClick={handleStartFullQA}
              disabled={isRunning}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>{language === 'fa' ? 'در حال اجرای شبیه‌سازی‌های ۸۵ گانه...' : 'Simulating 85 Games...'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black text-black" />
                  <span>{language === 'fa' ? 'اجرای آزمون ۸۵ بازی (۵ بار هر سناریو)' : 'Run Full 85-Game QA Suite'}</span>
                </>
              )}
            </button>

            {report && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">
                  {language === 'fa' ? 'امتیاز سلامت سیستم:' : 'Integrity Score:'}
                </span>
                <span className={`text-sm font-black px-2.5 py-0.5 rounded-xl border ${
                  report.systemIntegrityScore === 100 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                }`}>
                  {report.systemIntegrityScore}%
                </span>
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          {report && (
            <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
              <div className="px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-white/5 text-slate-300">
                <span className="text-slate-400">{language === 'fa' ? 'تست‌های موفق:' : 'Passed Runs:'} </span>
                <span className="font-bold text-emerald-400">{report.totalPassedRuns}</span> / {report.totalRunsCompleted}
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-white/5 text-slate-300">
                <span className="text-slate-400">{language === 'fa' ? 'تأییدیه‌ها:' : 'Assertions:'} </span>
                <span className="font-bold text-teal-400">{report.totalAssertionsPassed}</span> / {report.totalAssertionsChecked}
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-white/5 text-slate-300">
                <span className="text-slate-400">{language === 'fa' ? 'زمان اجرا:' : 'Duration:'} </span>
                <span className="font-bold text-amber-300">{(report.executionDurationMs / 1000).toFixed(2)}s</span>
              </div>
            </div>
          )}
        </div>

        {/* Live Progress Bar when Running */}
        {isRunning && progress && (
          <div className="p-4 bg-emerald-950/20 border-b border-emerald-500/20 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse text-emerald-400" />
                <span>
                  {language === 'fa' 
                    ? `در حال تست سناریو [${progress.currentScenarioIndex}/${progress.totalScenarios}]: «${progress.scenarioName}» (دور ${progress.currentRunIndex} از ۵)`
                    : `Testing Scenario [${progress.currentScenarioIndex}/${progress.totalScenarios}]: "${progress.scenarioName}" (Run ${progress.currentRunIndex}/5)`}
                </span>
              </div>
              <span>{progress.percent}%</span>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-150"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!report && !isRunning ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-lg">
                <Terminal className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-white">
                {language === 'fa' ? 'موتور تست و تضمین کیفیت مافیا (QA Suite)' : 'Mafia Quality Assurance Test Engine'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'fa' 
                  ? 'این بخش به صورت کاملاً خودکار تمام ۱۷ سناریوی رسمی را ۵ بار با شاخه‌های رویدادی متفاوت (شات مافیا، سیو دکتر، استعلام کارآگاه، سایلنس، دادگاه، رأی‌گیری و پیروزی) اجرا و ارزیابی می‌کند.'
                  : 'This engine runs 5 complete game simulations for all 17 official scenarios with varied permutations, verifying all assertions without manual overhead.'}
              </p>
              <button
                onClick={handleStartFullQA}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black text-black" />
                <span>{language === 'fa' ? 'شروع اجرای آزمون‌های ۸۵ گانه' : 'Start 85-Game QA Suite'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Subsystem Health Checks */}
              {report?.subsystemChecks && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'fa' ? 'بررسی سلامت زیرسیستم‌های پایه' : 'Core Subsystems Health Checks'}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {report.subsystemChecks.map((sub, sidx) => (
                      <div 
                        key={sidx}
                        className="p-3 rounded-2xl bg-neutral-900/80 border border-white/5 flex items-start justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white mb-1">{sub.name}</div>
                          <div className="text-[11px] text-slate-400">{sub.details}</div>
                        </div>
                        {sub.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scenario Suites Filter & List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-400" />
                    <span>
                      {language === 'fa' ? 'نتایج سناریوها (۱۷ سناریو × ۵ دست بازی)' : 'Scenario Suites (17 Presets × 5 Runs)'}
                    </span>
                  </h4>

                  <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-white/10 text-[11px] font-bold">
                    <button
                      onClick={() => setFilterMode('ALL')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${filterMode === 'ALL' ? 'bg-white/15 text-white' : 'text-slate-400'}`}
                    >
                      {language === 'fa' ? 'همه (۱۷)' : 'All (17)'}
                    </button>
                    <button
                      onClick={() => setFilterMode('PASSED')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${filterMode === 'PASSED' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'}`}
                    >
                      {language === 'fa' ? 'موفق' : 'Passed'}
                    </button>
                    <button
                      onClick={() => setFilterMode('FAILED')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${filterMode === 'FAILED' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400'}`}
                    >
                      {language === 'fa' ? 'ناموفق' : 'Failed'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {filteredSuites.map((suite, idx) => {
                    const isExpanded = expandedScenarioId === suite.scenario.id;
                    return (
                      <div 
                        key={suite.scenario.id}
                        className="bg-neutral-900/70 border border-white/5 rounded-2xl overflow-hidden transition-all"
                      >
                        {/* Header Bar */}
                        <div 
                          onClick={() => setExpandedScenarioId(isExpanded ? null : suite.scenario.id)}
                          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-slate-500 w-5 text-center">{idx + 1}</span>
                            <div>
                              <div className="text-xs font-black text-white flex items-center gap-2">
                                <span>{suite.scenario.name}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 font-mono">
                                  {suite.scenario.recommendedPlayerCount} {language === 'fa' ? 'نفره' : 'Players'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {suite.scenario.description}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                              suite.allPassed 
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}>
                              {suite.allPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              <span>{suite.totalPassed} / 5 {language === 'fa' ? 'دست موفق' : 'Runs Pass'}</span>
                            </span>

                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>

                        {/* Expanded Runs Details */}
                        {isExpanded && (
                          <div className="p-4 bg-black/40 border-t border-white/5 space-y-3">
                            <div className="text-xs font-bold text-slate-300">
                              {language === 'fa' ? 'جزئیات ۵ دور شبیه‌سازی بازی:' : '5 Simulation Runs Details:'}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                              {suite.runs.map((run, rIdx) => (
                                <div 
                                  key={rIdx}
                                  className={`p-3 rounded-xl border text-xs flex flex-col justify-between space-y-2 ${
                                    run.passed ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200' : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between font-bold">
                                    <span>{language === 'fa' ? `دست ${rIdx + 1}` : `Run ${rIdx + 1}`}</span>
                                    {run.passed ? (
                                      <span className="text-[10px] text-emerald-400">تأیید ✓</span>
                                    ) : (
                                      <span className="text-[10px] text-rose-400">خطا ✗</span>
                                    )}
                                  </div>

                                  <div className="text-[11px] text-slate-400 space-y-1">
                                    <div>{language === 'fa' ? 'برنده:' : 'Winner:'} <span className="font-bold text-white">{run.winner}</span></div>
                                    <div>{language === 'fa' ? 'طول بازی:' : 'Days:'} {run.daysPlayed} روز</div>
                                    <div>{language === 'fa' ? 'تأییدیه‌ها:' : 'Assertions:'} {run.assertions.filter(a => a.passed).length}/{run.assertions.length}</div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Sample Event Log from First Run */}
                            <div className="mt-3 p-3 rounded-xl bg-neutral-950 border border-white/5 font-mono text-[11px] text-slate-400 max-h-36 overflow-y-auto space-y-1">
                              <div className="text-emerald-400 font-bold mb-1">
                                {language === 'fa' ? 'نمونه لاگ وقایع دور ۱:' : 'Event Stream (Run 1):'}
                              </div>
                              {suite.runs[0]?.eventsLog.map((log, lidx) => (
                                <div key={lidx} className="leading-relaxed">› {log}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
