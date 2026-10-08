import React, { useState } from 'react';
import { 
  X, HelpCircle, Volume2, Shield, Moon, Sun, MessageSquare, 
  Vote, CheckCircle2, ChevronRight, Sparkles, BookOpen, AlertTriangle, 
  Eye, EyeOff, Clock, UserCheck, ShieldAlert, Layers
} from 'lucide-react';
import { GamePhase, Language } from '../../types/mafia';
import { GOD_PHASE_SCRIPTS, GodPhaseGuidance } from '../../data/godPhaseGuidance';
import { soundEngine } from '../../utils/audioSynth';

interface GodPhaseGuidanceWidgetProps {
  phase: GamePhase;
  dayNumber: number;
  scenarioId?: string;
  language: Language;
  showGuidance: boolean;
  onToggleShowGuidance: (show: boolean) => void;
  onNextPhase?: () => void;
}

export const GodPhaseGuidanceWidget: React.FC<GodPhaseGuidanceWidgetProps> = ({
  phase,
  dayNumber,
  scenarioId = 'classic',
  language,
  showGuidance,
  onToggleShowGuidance,
  onNextPhase
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'ANNOUNCEMENTS' | 'DEMANDS' | 'CRITERIA' | 'RULES'>('ANNOUNCEMENTS');

  const scriptData: GodPhaseGuidance = 
    GOD_PHASE_SCRIPTS[language]?.[phase] || GOD_PHASE_SCRIPTS['fa'][phase] || GOD_PHASE_SCRIPTS['fa']['DAY_DISCUSSION'];

  const getPhaseColor = () => {
    switch (phase) {
      case 'NIGHT': return 'from-indigo-600/30 to-purple-600/30 border-indigo-500/40 text-indigo-300';
      case 'DAY_DISCUSSION': return 'from-amber-600/30 to-yellow-600/30 border-amber-500/40 text-amber-300';
      case 'DAY_ACCUSATION': return 'from-orange-600/30 to-rose-600/30 border-orange-500/40 text-orange-300';
      case 'DAY_DEFENSE': return 'from-cyan-600/30 to-blue-600/30 border-cyan-500/40 text-cyan-300';
      case 'DAY_VOTING': return 'from-rose-600/30 to-red-600/30 border-rose-500/40 text-rose-300';
      case 'DAY_LAST_WORDS': return 'from-emerald-600/30 to-teal-600/30 border-emerald-500/40 text-emerald-300';
      default: return 'from-slate-600/30 to-zinc-600/30 border-white/20 text-slate-300';
    }
  };

  const getPhaseIcon = () => {
    switch (phase) {
      case 'NIGHT': return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'DAY_DISCUSSION': return <Sun className="w-5 h-5 text-amber-400" />;
      case 'DAY_ACCUSATION': return <ShieldAlert className="w-5 h-5 text-orange-400" />;
      case 'DAY_DEFENSE': return <Shield className="w-5 h-5 text-cyan-400" />;
      case 'DAY_VOTING': return <Vote className="w-5 h-5 text-rose-400" />;
      case 'DAY_LAST_WORDS': return <MessageSquare className="w-5 h-5 text-emerald-400" />;
      default: return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  // If host opted out of seeing guidance completely
  if (!showGuidance) {
    return (
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0f0f16]/90 border border-white/10 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>{language === 'fa' ? 'راهنمای گام‌به‌گام و تله‌پروپمتر گرداننده غیرفعال است.' : 'Host Step-by-Step Teleprompter is hidden.'}</span>
        </div>
        <button
          onClick={() => {
            soundEngine.playTick();
            onToggleShowGuidance(true);
          }}
          className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{language === 'fa' ? 'نمایش راهنما برای خدا' : 'Show God Guidance'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl border bg-gradient-to-br ${getPhaseColor()} p-4 sm:p-5 shadow-2xl backdrop-blur-md transition-all duration-300`}>
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black/40 border border-white/20 flex items-center justify-center shadow-md">
            {getPhaseIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                {scriptData.badge} • {language === 'fa' ? `روز/شب ${dayNumber}` : `Day/Night ${dayNumber}`}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                ⚡ {language === 'fa' ? 'تله‌پروپمتر زنده خدا' : 'Live God Teleprompter'}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white mt-1">
              {scriptData.phaseTitle}
            </h3>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playTick();
              setIsExpanded(!isExpanded);
            }}
            className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-slate-200 border border-white/15 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isExpanded ? (language === 'fa' ? 'جمع‌وجور کردن' : 'Collapse') : (language === 'fa' ? 'مشاهده جزئیات کامل' : 'Full Guidance')}</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
          </button>

          <button
            onClick={() => {
              soundEngine.playTick();
              onToggleShowGuidance(false);
            }}
            className="p-2 rounded-xl bg-black/30 hover:bg-black/50 text-slate-400 hover:text-white border border-white/10 transition-colors"
            title={language === 'fa' ? 'بستن و عدم نمایش راهنما' : 'Hide guidance'}
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Highlights (Always Visible) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
        
        {/* Box 1: What to announce */}
        <div className="p-3 rounded-2xl bg-black/30 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 mb-1.5">
            <Volume2 className="w-4 h-4" />
            <span>{language === 'fa' ? 'چی به بازیکنان اعلام کنم؟' : 'What God Announces:'}</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-medium line-clamp-3">
            {scriptData.whatToSay[0]}
          </p>
        </div>

        {/* Box 2: What to demand */}
        <div className="p-3 rounded-2xl bg-black/30 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-black text-cyan-400 mb-1.5">
            <UserCheck className="w-4 h-4" />
            <span>{language === 'fa' ? 'از بقیه چی بخوام؟' : 'What God Demands:'}</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-medium line-clamp-3">
            {scriptData.whatToDemand[0]}
          </p>
        </div>

        {/* Box 3: When does phase end */}
        <div className="p-3 rounded-2xl bg-black/30 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 mb-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'fa' ? 'کی این فاز تموم میشه؟' : 'When Phase Ends:'}</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium line-clamp-2">
              {scriptData.completionCriteria[0]}
            </p>
          </div>
          {onNextPhase && (
            <button
              onClick={() => {
                soundEngine.playGong();
                onNextPhase();
              }}
              className="mt-2 w-full py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
            >
              <span>{language === 'fa' ? 'اتمام فاز و رفتن به مرحله بعد' : 'Finish & Next Phase'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Expanded Full Guidance View */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-in fade-in duration-200">
          
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/10 overflow-x-auto">
            <button
              onClick={() => setActiveTab('ANNOUNCEMENTS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'ANNOUNCEMENTS' ? 'bg-amber-500 text-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              🎙️ {language === 'fa' ? 'جملات و نطق‌های دقیق خدا' : 'Exact Speech Script'}
            </button>
            <button
              onClick={() => setActiveTab('DEMANDS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'DEMANDS' ? 'bg-cyan-500 text-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              ✋ {language === 'fa' ? 'انتظارات و اکشن‌های بازیکنان' : 'Player Demands'}
            </button>
            <button
              onClick={() => setActiveTab('CRITERIA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'CRITERIA' ? 'bg-emerald-500 text-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              🏁 {language === 'fa' ? 'معیار پایان این مرحله' : 'Completion Criteria'}
            </button>
            <button
              onClick={() => setActiveTab('RULES')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'RULES' ? 'bg-purple-500 text-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              📖 {language === 'fa' ? 'نکات سناریو و استثناها' : 'Scenario & Role Notes'}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
            {activeTab === 'ANNOUNCEMENTS' && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4" />
                  <span>{language === 'fa' ? 'متن خوانی گرداننده (پشت میکروفون):' : 'Host Microphone Teleprompter:'}</span>
                </h4>
                <div className="space-y-2">
                  {scriptData.whatToSay.map((sentence, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-100 font-serif leading-relaxed">
                      {sentence}
                    </div>
                  ))}
                </div>
                {scriptData.timeRecommendation && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-300/80 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{language === 'fa' ? `زمان استاندارد پیشنهادی: ${scriptData.timeRecommendation}` : `Suggested duration: ${scriptData.timeRecommendation}`}</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'DEMANDS' && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>{language === 'fa' ? 'اقداماتی که باید از بازیکنان مطالبه کنید:' : 'Actions to demand from the players:'}</span>
                </h4>
                <ul className="space-y-2">
                  {scriptData.whatToDemand.map((demand, idx) => (
                    <li key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{demand}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'CRITERIA' && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'fa' ? 'شرایط پایان قانونی این فاز:' : 'Official phase conclusion criteria:'}</span>
                </h4>
                <ul className="space-y-2">
                  {scriptData.completionCriteria.map((criterion, idx) => (
                    <li key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'RULES' && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-black text-purple-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>{language === 'fa' ? 'تقابل نقش‌ها و قوانین خاص در این فاز:' : 'Role Interactions & Exceptions in this phase:'}</span>
                </h4>
                <ul className="space-y-2">
                  {scriptData.specialRoleNotes?.map((note, idx) => (
                    <li key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-purple-200 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
