import React, { useState, useEffect } from 'react';
import { Shield, Skull, HelpCircle, Check, X, Sparkles, BookOpen, Trash2 } from 'lucide-react';
import { Player, RoomState, Language } from '../../types/mafia';
import { soundEngine } from '../../utils/audioSynth';
import { isRtlLanguage } from '../../utils/translations';

interface PlayerPrivateScratchpadProps {
  room: RoomState;
  currentPlayer: Player;
  language?: Language;
}

type StanceType = 'GREEN' | 'RED' | 'GRAY';

export const PlayerPrivateScratchpad: React.FC<PlayerPrivateScratchpadProps> = ({
  room,
  currentPlayer,
  language = 'fa'
}) => {
  const isRtl = isRtlLanguage(language);
  const storageKey = `scratchpad_${room.roomId}_${currentPlayer.id}`;

  const [stances, setStances] = useState<Record<string, StanceType>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_notes`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(stances));
    } catch (e) {
      console.warn('Failed to save scratchpad stances:', e);
    }
  }, [stances, storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}_notes`, JSON.stringify(notes));
    } catch (e) {
      console.warn('Failed to save scratchpad notes:', e);
    }
  }, [notes, storageKey]);

  const handleToggleStance = (targetId: string, nextStance: StanceType) => {
    soundEngine.playTick();
    setStances(prev => ({
      ...prev,
      [targetId]: prev[targetId] === nextStance ? 'GRAY' : nextStance
    }));
  };

  const handleUpdateNote = (targetId: string, text: string) => {
    setNotes(prev => ({
      ...prev,
      [targetId]: text
    }));
  };

  const handleResetAll = () => {
    soundEngine.playTick();
    setStances({});
    setNotes({});
  };

  // Other players in game (excluding self)
  const otherPlayers = room.players.filter(p => p.id !== currentPlayer.id);

  return (
    <div className={`space-y-4 bg-[#0f0f14] border border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? "rtl" : "ltr"}>
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">دفترچه یادداشت و ماتریس تحلیل شخصی</h3>
            <p className="text-[10px] text-slate-400">این اطلاعات کاملاً خصوصی است و فقط خودتان آن را می‌بینید.</p>
          </div>
        </div>

        <button
          onClick={handleResetAll}
          className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
          title="پاک کردن همه نشان‌ها"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>پاکسازی</span>
        </button>
      </div>

      {/* Quick Legend Guide */}
      <div className="flex flex-wrap items-center gap-3 text-xs bg-black/40 p-2.5 rounded-2xl border border-white/5">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span className="font-bold">سبز: حمایت / شهروند معتمد</span>
        </div>
        <div className="flex items-center gap-1.5 text-rose-400">
          <span className="w-3 h-3 rounded-full bg-rose-500"></span>
          <span className="font-bold">قرمز: اتهام / مشکوک به مافیا</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="w-3 h-3 rounded-full bg-slate-500"></span>
          <span className="font-bold">خاکستری: خنثی / بدون نظر</span>
        </div>
      </div>

      {/* Players List with 3-State Chips */}
      <div className="space-y-2.5">
        {otherPlayers.map(p => {
          const currentStance = stances[p.id] || 'GRAY';
          const playerNote = notes[p.id] || '';

          return (
            <div 
              key={p.id}
              className={`p-3 rounded-2xl border transition-all space-y-2 ${
                currentStance === 'GREEN' 
                  ? 'bg-emerald-950/20 border-emerald-500/40' 
                  : currentStance === 'RED'
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : 'bg-[#15151c] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{p.avatar}</span>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>{p.name}</span>
                      {!p.isAlive && <span className="text-[10px] text-red-400">(خارج‌شده)</span>}
                    </div>
                    <div className="text-[10px] text-slate-400">صندلی #{p.seatNumber || '-'}</div>
                  </div>
                </div>

                {/* 3 State Toggle Buttons */}
                <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
                  {/* Green - Support */}
                  <button
                    onClick={() => handleToggleStance(p.id, 'GREEN')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      currentStance === 'GREEN'
                        ? 'bg-emerald-500 text-black shadow-md font-extrabold'
                        : 'text-slate-400 hover:text-emerald-400'
                    }`}
                    title="حمایت / شهروند"
                  >
                    🟢 حمایت
                  </button>

                  {/* Gray - Neutral */}
                  <button
                    onClick={() => handleToggleStance(p.id, 'GRAY')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                      currentStance === 'GRAY'
                        ? 'bg-slate-600 text-white shadow-md font-extrabold'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="خنثی"
                  >
                    ⚪ خنثی
                  </button>

                  {/* Red - Accuse */}
                  <button
                    onClick={() => handleToggleStance(p.id, 'RED')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      currentStance === 'RED'
                        ? 'bg-rose-500 text-white shadow-md font-extrabold'
                        : 'text-slate-400 hover:text-rose-400'
                    }`}
                    title="تهمت / مافیا"
                  >
                    🔴 تهمت
                  </button>
                </div>
              </div>

              {/* Private mini memo input for this player */}
              <input
                type="text"
                value={playerNote}
                onChange={e => handleUpdateNote(p.id, e.target.value)}
                placeholder="یادداشت شخصی درباره این بازیکن (مثلاً: در چالش به کی تارگت زد...)"
                className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          );
        })}
      </div>

    </div>
  );
};
