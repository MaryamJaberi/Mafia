import React, { useState, useEffect } from 'react';
import { 
  Vote, X, Check, ShieldAlert, Skull, Play, Clock, 
  Users, AlertTriangle, ChevronRight, Sparkles, Volume2, VolumeX,
  Scale, RotateCcw, Shield, Dices
} from 'lucide-react';
import { Player, RoomState, Language } from '../../types/mafia';
import { translations, isRtlLanguage } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';

interface VotingDefenseModalProps {
  isOpen: boolean;
  room: RoomState;
  onClose: () => void;
  onStartVoting: (targetPlayerId: string, stage: 'DEFENSE_ENTRY' | 'EXIT_VOTE') => void;
  onManualCountChange: (count: number) => void;
  onCloseVoting: () => void;
  onKillPlayer: (playerId: string) => void;
  onResolveTie?: (resolution: 'REVOTE' | 'NO_ELIMINATION' | 'RANDOM_DRAW' | 'ELIMINATE_BOTH', candidateIds: string[]) => void;
  language?: Language;
}

export const VotingDefenseModal: React.FC<VotingDefenseModalProps> = ({
  isOpen,
  room,
  onClose,
  onStartVoting,
  onManualCountChange,
  onCloseVoting,
  onKillPlayer,
  onResolveTie,
  language = 'fa'
}) => {
  const activeLang = language || 'fa';
  const t = translations[activeLang] || translations.fa;
  const isRtl = isRtlLanguage(activeLang);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [activeStage, setActiveStage] = useState<'DEFENSE_ENTRY' | 'EXIT_VOTE'>('DEFENSE_ENTRY');
  const [manualVoteCount, setManualVoteCount] = useState<number>(0);
  const [defenseTimer, setDefenseTimer] = useState<number>(45);
  const [isDefenseTimerRunning, setIsDefenseTimerRunning] = useState<boolean>(false);

  const livingPlayers = room.players.filter(p => p.isAlive);
  const livingCount = livingPlayers.length;
  // Stage 1 (Defense Entry Threshold): Math.ceil(livingCount / 2)
  const defenseEntryThreshold = Math.ceil(livingCount / 2);
  // Stage 2 (Exit / Elimination Threshold): Math.floor(livingCount / 2) + 1
  const exitVoteThreshold = Math.floor(livingCount / 2) + 1;
  const currentThreshold = activeStage === 'DEFENSE_ENTRY' ? defenseEntryThreshold : exitVoteThreshold;

  const votingState = (room as any).votingState;
  const isVoteOpen = votingState?.isOpen || false;
  const currentTarget = room.players.find(p => p.id === (votingState?.targetPlayerId || selectedTargetId));
  const defenseCandidates = room.players.filter(p => p.inDefense || votingState?.defenseCandidates?.includes(p.id));

  // Audio timer ticker with beeps
  useEffect(() => {
    let interval: any = null;
    if (isDefenseTimerRunning && defenseTimer > 0) {
      interval = setInterval(() => {
        setDefenseTimer(prev => {
          const next = prev - 1;
          if (next <= 5 && next > 0) {
            soundEngine.playWarningBeep();
          } else if (next === 0) {
            soundEngine.playEndBuzzer();
            setIsDefenseTimerRunning(false);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isDefenseTimerRunning, defenseTimer]);

  if (!isOpen) return null;

  const handleStartVoteSession = (stage: 'DEFENSE_ENTRY' | 'EXIT_VOTE') => {
    if (!selectedTargetId) return;
    soundEngine.playTick();
    setActiveStage(stage);
    setManualVoteCount(0);
    onStartVoting(selectedTargetId, stage);
  };

  const handleApplyVotesAndClose = () => {
    soundEngine.playGong();
    onManualCountChange(manualVoteCount);
    onCloseVoting();
  };

  const handleEliminatePlayer = (pId: string) => {
    soundEngine.playGunshot();
    onKillPlayer(pId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`bg-[#111116] border border-white/20 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
        
        {/* Header */}
        <div className="p-5 bg-[#161620] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">{t.votingDefenseTitle || "مدیریت رأی‌گیری روز، حد نصاب دفاعیه و خروج"}</h2>
              <p className="text-xs text-slate-400">{t.votingDefenseDesc || "محاسبه خودکار حد نصاب، رأی‌گیری آنلاین و کنترل زمان دفاع متهمان."}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Info Banner */}
        <div className="p-4 bg-[#0c0c10] border-b border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-slate-400">{t.livingCountLabel || "بازیکنان زنده دور میز:"}</span>
            <span className="font-black text-white text-sm">{livingCount} {t.playersCount || "players"}</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-amber-300">حد نصاب دفاع:</span>
              <span className="font-black text-amber-400 text-sm">
                {defenseEntryThreshold} رأی <span className="text-[10px] text-amber-200">(ceil(n/2))</span>
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-amber-500/20 text-[11px]">
              <span className="text-rose-300">حد نصاب خروج:</span>
              <span className="font-black text-rose-400">
                {exitVoteThreshold} رأی <span className="text-[9px] text-rose-200">(floor(n/2)+1)</span>
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
            <span className="text-rose-300">{t.candidateInDefense || "متهمان در دفاعیه:"}</span>
            <span className="font-black text-rose-400 text-sm">{defenseCandidates.length}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Step 1: Select Target for Vote */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-xs font-black flex items-center justify-center">۱</span>
              <span>{t.selectVoteTargetStep || "انتخاب بازیکن مورد نظر برای رأی‌گیری"}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {livingPlayers.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedTargetId(p.id)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 text-right ${
                    selectedTargetId === p.id 
                      ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-lg shadow-amber-500/20' 
                      : 'bg-[#171722] hover:bg-[#20202e] border-white/10 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-xl shrink-0">{p.avatar}</span>
                    <div className="truncate">
                      <div className="text-xs font-bold truncate">{p.name}</div>
                      <div className="text-[10px] opacity-70">صندلی #{p.seatNumber || '-'}</div>
                    </div>
                  </div>
                  {p.inDefense && <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold shrink-0">{t.defense || "دفاع"}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Launch or Manage Vote Session */}
          {selectedTargetId && (
            <div className="p-4 rounded-3xl bg-[#161622] border border-white/15 space-y-4 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <h4 className="text-sm font-black text-white">
                    {t.votingForPlayer || "رأی‌گیری برای:"} <span className="text-amber-400">{currentTarget?.name}</span> ({t.seatNumberPrefix || "Seat"} #{currentTarget?.seatNumber})
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t.thresholdNeeded || "حد نصاب مورد نیاز:"} <strong className="text-white">{currentThreshold} رأی ({activeStage === 'DEFENSE_ENTRY' ? `حداقل نصف: ${defenseEntryThreshold}` : `نصف+۱: ${exitVoteThreshold}`})</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartVoteSession('DEFENSE_ENTRY')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all shadow-md shadow-amber-500/20"
                  >
                    {t.startDefenseEntryVote || "شروع رأی ورود به دفاعیه 🗳️"}
                  </button>

                  <button
                    onClick={() => handleStartVoteSession('EXIT_VOTE')}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all shadow-md shadow-rose-600/20"
                  >
                    {t.startExitVote || "شروع رأی‌گیری نهایی خروج 💀"}
                  </button>
                </div>
              </div>

              {/* Voting Box Status */}
              {isVoteOpen && (
                <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300">
                      {t.votingIsOpenHint || "رأی‌گیری باز است — بازیکنان در گوشی خود رأی می‌دهند یا دست بلند می‌کنند"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold animate-pulse">
                      درحال رأی‌گیری
                    </span>
                  </div>

                  {/* Manual Hand Count Slider / Stepper */}
                  <div className="flex items-center justify-between gap-4 bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-xs text-slate-300 font-bold">تعداد دست‌های بلند شده / آرا:</span>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setManualVoteCount(Math.max(0, manualVoteCount - 1))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-black text-sm"
                      >
                        -
                      </button>
                      <span className="text-lg font-black text-amber-400 min-w-[2rem] text-center">{manualVoteCount}</span>
                      <button
                        onClick={() => setManualVoteCount(Math.min(livingCount, manualVoteCount + 1))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-black text-sm"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={handleApplyVotesAndClose}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-md shadow-emerald-500/20"
                    >
                      ثبت آرا و بستن رأی‌گیری ✓
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Defense Candidates & Speech Timer */}
          {defenseCandidates.length > 0 && (
            <div className="p-4 rounded-3xl bg-[#181826] border border-rose-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <h4 className="text-sm font-black text-white">جایگاه متهمان در دفاعیه ({defenseCandidates.length} نفر)</h4>
                </div>

                {/* Exit Vote Rule Note */}
                <div className="text-[11px] text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30 font-medium">
                  {defenseCandidates.length === 2 ? (
                    <span>⚠️ قانون دوئل دفاعیه: چون دقیقاً ۲ نفر در دفاع هستند، <strong>به یکدیگر حق رأی ندارند</strong>.</span>
                  ) : (
                    <span>ℹ️ چون تعداد متهمان بیشتر از ۲ نفر است، <strong>به یکدیگر حق رأی دارند</strong>.</span>
                  )}
                </div>
              </div>

              {/* Defense Speech Timer Bar */}
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold text-slate-300">ثانیه‌شمار تایم دفاعیه:</span>
                  <span className={`text-xl font-black ${defenseTimer <= 5 ? 'text-rose-400 animate-bounce' : 'text-white'}`}>
                    {defenseTimer} {t.secondsWord || "ثانیه"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundEngine.playTick();
                      setIsDefenseTimerRunning(!isDefenseTimerRunning);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                      isDefenseTimerRunning ? 'bg-rose-500 text-white' : 'bg-amber-500 text-black'
                    }`}
                  >
                    {isDefenseTimerRunning ? 'توقف تایمر ⏸' : 'شروع تایم دفاع ▶'}
                  </button>
                  <button
                    onClick={() => {
                      setDefenseTimer(45);
                      setIsDefenseTimerRunning(false);
                    }}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-300"
                  >
                    ریست ۴۵ث
                  </button>
                </div>
              </div>

              {/* Candidates Actions List */}
              <div className="space-y-2">
                {defenseCandidates.map(c => (
                  <div 
                    key={c.id}
                    className="p-3 rounded-2xl bg-[#12121c] border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{c.avatar}</span>
                      <div>
                        <div className="text-xs font-black text-white">{c.name}</div>
                        <div className="text-[10px] text-slate-400">صندلی #{c.seatNumber}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedTargetId(c.id);
                          handleStartVoteSession('EXIT_VOTE');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all cursor-pointer"
                      >
                        رأی‌گیری خروج 🗳️
                      </button>
                      <button
                        onClick={() => handleEliminatePlayer(c.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Skull className="w-3.5 h-3.5" />
                        <span>اعدام و خروج</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tie-Break Resolution Controls (When 2+ candidates are in defense or tied) */}
              {defenseCandidates.length >= 2 && onResolveTie && (
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-amber-400" />
                      <h5 className="text-xs font-black text-amber-300">
                        {language === 'en' ? '⚖️ Exit Vote Tie-Break Actions (Host Verdict)' : '⚖️ شکستن تساوی آرای خروج (حکم و تصمیم گرداننده)'}
                      </h5>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {language === 'en' ? 'Tournament Rule Set' : 'قوانین استاندارد مسابقات'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => {
                        soundEngine.playGong();
                        onResolveTie('REVOTE', defenseCandidates.map(c => c.id));
                      }}
                      className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer"
                      title={language === 'en' ? 'Hold a quick 30s revote between tied candidates' : 'رأی‌گیری مجدد و سریع ۳۰ ثانیه‌ای بین کاندیداهای متساوی'}
                    >
                      <RotateCcw className="w-4 h-4 text-amber-400" />
                      <span>{language === 'en' ? 'Revote' : 'رأی‌گیری مجدد'}</span>
                    </button>

                    <button
                      onClick={() => {
                        soundEngine.playTick();
                        onResolveTie('NO_ELIMINATION', defenseCandidates.map(c => c.id));
                      }}
                      className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer"
                      title={language === 'en' ? 'Standard rule: tie results in no elimination' : 'قانون استاندارد تورنمنت: تساوی آرا منجر به عدم خروج هر دو می‌شود'}
                    >
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>{language === 'en' ? 'No Elimination' : 'عدم خروج (بقا)'}</span>
                    </button>

                    <button
                      onClick={() => {
                        soundEngine.playGunshot();
                        onResolveTie('RANDOM_DRAW', defenseCandidates.map(c => c.id));
                      }}
                      className="p-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer"
                      title={language === 'en' ? 'Random draw eliminates one suspect' : 'قرعه مرگ بین متهمان متساوی برای خروج یک نفر'}
                    >
                      <Dices className="w-4 h-4 text-purple-400" />
                      <span>{language === 'en' ? 'Random Draw' : 'قرعه مرگ'}</span>
                    </button>

                    <button
                      onClick={() => {
                        soundEngine.playGunshot();
                        onResolveTie('ELIMINATE_BOTH', defenseCandidates.map(c => c.id));
                      }}
                      className="p-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer"
                      title={language === 'en' ? 'Eliminate both suspects simultaneously' : 'خروج همزمان هر دو متهم مساوی با حکم قطعی'}
                    >
                      <Skull className="w-4 h-4 text-rose-400" />
                      <span>{language === 'en' ? 'Eliminate Both' : 'خروج هر دو نفر'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#161620] border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            مرحله فعلی: <strong className="text-white font-bold">{room.phase === 'DAY_VOTING' ? 'رأی‌گیری روز' : 'بحث روز'}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
          >
            {t.closeBtn || "بستن پنجره"} رأی‌گیری
          </button>
        </div>

      </div>
    </div>
  );
};
