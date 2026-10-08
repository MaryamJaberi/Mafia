import React from 'react';
import { GamePhase, Language } from '../../types/mafia';

interface GamePhaseStepperProps {
  currentPhase: GamePhase;
  dayNumber: number;
  language?: Language;
  onSelectPhase?: (phase: GamePhase) => void;
}

export const GamePhaseStepper: React.FC<GamePhaseStepperProps> = ({
  currentPhase,
  dayNumber,
  language = 'fa',
  onSelectPhase
}) => {
  const isEn = language === 'en';

  const steps = [
    { key: 'SETUP', labelFa: 'ساخت', labelEn: 'Setup' },
    { key: 'LOBBY', labelFa: 'انتظار', labelEn: 'Lobby' },
    { key: 'RULES_REVIEW', labelFa: 'مرور قوانین', labelEn: 'Rules' },
    { key: 'ROLE_DEAL', labelFa: 'پخش نقش', labelEn: 'Deal' },
    { key: 'INTRO_DAY', labelFa: 'روز معارفه', labelEn: 'Intro Day' },
    { key: 'INTRO_NIGHT', labelFa: 'شب معارفه', labelEn: 'Intro Night' },
    { key: 'DAY_DISCUSSION', labelFa: `روز ${dayNumber > 1 ? dayNumber : 1}`, labelEn: `Day ${dayNumber > 1 ? dayNumber : 1}` },
    { key: 'DAY_VOTING', labelFa: 'رأی', labelEn: 'Vote' },
    { key: 'DAY_DEFENSE', labelFa: 'دفاع', labelEn: 'Defense' },
    { key: 'NIGHT', labelFa: `شب ${dayNumber > 1 ? dayNumber : 1}`, labelEn: `Night ${dayNumber > 1 ? dayNumber : 1}` },
    { key: 'GAME_OVER', labelFa: 'پایان', labelEn: 'End' }
  ];

  // Map phase to active step index
  const getActiveIndex = (phase: GamePhase): number => {
    switch (phase) {
      case 'SETUP': return 0;
      case 'LOBBY': return 1;
      case 'RULES_REVIEW': return 2;
      case 'ROLE_DEAL': return 3;
      case 'INTRO_DAY': return 4;
      case 'INTRO_NIGHT': return 5;
      case 'DAY_DISCUSSION':
      case 'DAY_ACCUSATION': return 6;
      case 'DAY_VOTING': return 7;
      case 'DAY_DEFENSE':
      case 'DAY_LAST_WORDS': return 8;
      case 'NIGHT': return 9;
      case 'GAME_OVER': return 10;
      default: return 1;
    }
  };

  const activeIndex = getActiveIndex(currentPhase);

  return (
    <div className="w-full bg-[#0d0d12] border-y border-white/10 px-2 sm:px-4 py-2 overflow-x-auto no-scrollbar" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="flex items-center min-w-max mx-auto justify-center gap-1 sm:gap-2">
        {steps.map((step, idx) => {
          const isCurrent = idx === activeIndex;
          const isPast = idx < activeIndex;

          return (
            <React.Fragment key={step.key}>
              <button
                type="button"
                onClick={() => onSelectPhase && onSelectPhase(step.key as GamePhase)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  onSelectPhase ? 'cursor-pointer hover:opacity-90' : ''
                } ${
                  isCurrent 
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black scale-105' 
                    : isPast 
                    ? 'text-zinc-400 bg-white/5 hover:bg-white/10' 
                    : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                  isCurrent ? 'bg-black text-amber-400' : isPast ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-800 text-zinc-600'
                }`}>
                  {idx + 1}
                </span>
                <span>{isEn ? step.labelEn : step.labelFa}</span>
              </button>

              {idx < steps.length - 1 && (
                <span className={`text-[10px] ${idx < activeIndex ? 'text-amber-500/50' : 'text-zinc-800'}`}>
                  {isEn ? '→' : '←'}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
