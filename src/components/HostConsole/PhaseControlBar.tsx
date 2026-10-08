import React, { useEffect, useState } from 'react';
import { 
  Play, Pause, RotateCcw, Plus, Moon, Sun, ShieldAlert, 
  Vote, MessageSquare, ChevronRight, ChevronLeft, Volume2, Clock, Sparkles
} from 'lucide-react';
import { GamePhase, Language, RoomState } from '../../types/mafia';
import { translations } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';

interface PhaseControlBarProps {
  room: RoomState;
  onSetPhase: (phase: GamePhase, dayNumber?: number) => void;
  onTimerControl: (seconds: number, total: number, isRunning: boolean) => void;
  onOpenNightEngine: () => void;
  onOpenDailyChronicle: () => void;
  language: Language;
}

export const PhaseControlBar: React.FC<PhaseControlBarProps> = ({
  room,
  onSetPhase,
  onTimerControl,
  onOpenNightEngine,
  onOpenDailyChronicle,
  language
}) => {
  const t = translations[language];
  const [secondsLeft, setSecondsLeft] = useState(room.timerSeconds);
  const [isRunning, setIsRunning] = useState(room.isTimerRunning);

  // Synchronize local timer state with room updates
  useEffect(() => {
    setSecondsLeft(room.timerSeconds);
    setIsRunning(room.isTimerRunning);
  }, [room.timerSeconds, room.isTimerRunning]);

  // Local interval loop for smooth second-by-second countdown
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          onTimerControl(0, room.timerTotal, false);
          soundEngine.playGong();
          return 0;
        }
        if (prev <= 6) {
          soundEngine.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, room.timerTotal, onTimerControl]);

  const toggleTimer = () => {
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    onTimerControl(secondsLeft, room.timerTotal, nextRunning);
    soundEngine.playTick();
  };

  const resetTimer = (newTotal = 60) => {
    setIsRunning(false);
    setSecondsLeft(newTotal);
    onTimerControl(newTotal, newTotal, false);
    soundEngine.playTick();
  };

  const addSeconds = (amount = 30) => {
    const next = secondsLeft + amount;
    setSecondsLeft(next);
    onTimerControl(next, Math.max(room.timerTotal, next), isRunning);
    soundEngine.playTick();
  };

  const phases: { id: GamePhase; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'DAY_DISCUSSION', label: t.phase_DAY_DISCUSSION, icon: MessageSquare },
    { id: 'DAY_ACCUSATION', label: t.phase_DAY_ACCUSATION, icon: ShieldAlert },
    { id: 'DAY_DEFENSE', label: t.phase_DAY_DEFENSE, icon: ShieldAlert },
    { id: 'DAY_VOTING', label: t.phase_DAY_VOTING, icon: Vote },
    { id: 'DAY_LAST_WORDS', label: t.phase_DAY_LAST_WORDS, icon: MessageSquare },
    { id: 'NIGHT', label: t.phase_NIGHT, icon: Moon }
  ];

  const currentPhaseIndex = phases.findIndex(p => p.id === room.phase);

  const goToNextPhase = () => {
    if (currentPhaseIndex >= 0 && currentPhaseIndex < phases.length - 1) {
      const nextP = phases[currentPhaseIndex + 1].id;
      onSetPhase(nextP, room.dayNumber);
      soundEngine.playGong();
    } else if (room.phase === 'NIGHT') {
      onSetPhase('DAY_DISCUSSION', room.dayNumber + 1);
      soundEngine.playMorningDawn();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isNight = room.phase === 'NIGHT';

  return (
    <div className={`rounded-3xl border p-4 sm:p-5 transition-all shadow-xl backdrop-blur-md ${
      isNight 
        ? 'bg-[#12121d] border-indigo-500/30 shadow-indigo-950/30' 
        : 'bg-[#0f0f12] border-white/10'
    }`}>
      
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Phase Badges & Day Counter */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-start">
          
          <div className="flex items-center gap-1.5 bg-[#0a0a0c] px-3 py-2 rounded-2xl border border-white/10 shadow-inner">
            <button
              onClick={() => onSetPhase(room.phase, Math.max(1, room.dayNumber - 1))}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="کاهش روز"
            >
              -
            </button>
            <div className="flex items-center gap-1.5 px-2 font-bold text-sm text-[#e2e2e7]">
              {isNight ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span>{isNight ? t.nightNumber : t.dayNumber}</span>
              <span className="text-amber-400 text-base font-extrabold">{room.dayNumber}</span>
            </div>
            <button
              onClick={() => onSetPhase(room.phase, room.dayNumber + 1)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="افزایش روز"
            >
              +
            </button>
          </div>

          {/* Quick AI Daily Newspaper button */}
          <button
            id="btn-daily-chronicle"
            onClick={onOpenDailyChronicle}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.dailyChronicle}</span>
          </button>

          {/* Night Engine Button if in night */}
          <button
            id="btn-night-engine"
            onClick={onOpenNightEngine}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              isNight
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-900/50 animate-pulse'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t.nightEngine}</span>
          </button>

        </div>

        {/* Phase Selector Tabs */}
        <div className="flex items-center overflow-x-auto max-w-full pb-1 lg:pb-0 gap-1.5 p-1 bg-[#0a0a0c] rounded-2xl border border-white/10 shadow-inner scrollbar-none">
          {phases.map((p) => {
            const Icon = p.icon;
            const isActive = room.phase === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  onSetPhase(p.id, room.dayNumber);
                  soundEngine.playTick();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Timer Controls */}
        <div className="flex items-center gap-2 bg-[#0a0a0c] px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-inner w-full lg:w-auto justify-center">
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <div className={`font-mono text-xl sm:text-2xl font-bold tracking-wider ${
              secondsLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-[#e2e2e7]'
            }`}>
              {formatTime(secondsLeft)}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-timer-toggle"
              onClick={toggleTimer}
              className={`p-2 rounded-xl font-bold transition-all ${
                isRunning
                  ? 'bg-white/10 hover:bg-white/20 text-amber-400 border border-white/10'
                  : 'bg-amber-500 hover:bg-amber-400 text-black font-extrabold shadow-sm'
              }`}
              title={isRunning ? t.pauseGame : t.resumeGame}
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              id="btn-timer-add"
              onClick={() => addSeconds(30)}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold border border-white/10 transition-colors"
              title={t.addTime}
            >
              {t.addTime}
            </button>

            <button
              id="btn-timer-reset"
              onClick={() => resetTimer(60)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
              title={t.resetTimer}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Next Phase Quick Arrow */}
          <button
            onClick={goToNextPhase}
            className="flex items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-amber-500/10 text-slate-300 hover:text-amber-400 border border-white/10 transition-colors text-xs font-bold"
            title={t.nextPhase}
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
          </button>

        </div>

      </div>

    </div>
  );
};
