import React, { useState } from 'react';
import { 
  Vote, ShieldAlert, Skull, Heart, Clock, 
  Check, UserCheck, AlertCircle, Play, Pause 
} from 'lucide-react';
import { Player, RoomState, Language } from '../../types/mafia';
import { translations } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';

interface VotingManagerProps {
  room: RoomState;
  onEliminatePlayer: (playerId: string) => void;
  onClearDefense: () => void;
  language: Language;
  onResolveTie?: (resolution: 'REVOTE' | 'NO_ELIMINATION' | 'RANDOM_DRAW' | 'ELIMINATE_BOTH', candidateIds: string[]) => void;
}

export const VotingManager: React.FC<VotingManagerProps> = ({
  room,
  onEliminatePlayer,
  onClearDefense,
  language,
  onResolveTie
}) => {
  const t = translations[language];
  const isEn = language === 'en';
  const [suspectVotes, setSuspectVotes] = useState<Record<string, number>>({});
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);

  const livingPlayers = room.players.filter(p => p.isAlive);
  const majorityThreshold = Math.floor(livingPlayers.length / 2) + 1;

  // Detect vote ties among candidates reaching majority threshold
  const maxVotes = Math.max(0, ...Object.values(suspectVotes));
  const topVotedPlayers = livingPlayers.filter(p => (suspectVotes[p.id] || 0) === maxVotes && maxVotes >= majorityThreshold);
  const isTie = topVotedPlayers.length > 1;

  const handleVoteChange = (playerId: string, delta: number) => {
    setSuspectVotes(prev => {
      const current = prev[playerId] || 0;
      const next = Math.max(0, Math.min(livingPlayers.length, current + delta));
      return { ...prev, [playerId]: next };
    });
    soundEngine.playTick();
  };

  const handleEliminate = (playerId: string) => {
    soundEngine.playGunshot();
    onEliminatePlayer(playerId);
  };

  const handleTieAction = (action: 'REVOTE' | 'NO_ELIMINATION' | 'RANDOM_DRAW' | 'ELIMINATE_BOTH') => {
    const candidateIds = topVotedPlayers.map(p => p.id);
    if (action === 'REVOTE') {
      soundEngine.playGong();
      setSuspectVotes({});
    } else if (action === 'NO_ELIMINATION') {
      soundEngine.playTick();
      onClearDefense();
    } else if (action === 'RANDOM_DRAW') {
      soundEngine.playGunshot();
      const unlucky = topVotedPlayers[Math.floor(Math.random() * topVotedPlayers.length)];
      if (unlucky) onEliminatePlayer(unlucky.id);
    } else if (action === 'ELIMINATE_BOTH') {
      soundEngine.playGunshot();
      topVotedPlayers.forEach(p => onEliminatePlayer(p.id));
    }

    if (onResolveTie) {
      onResolveTie(action, candidateIds);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
              <Vote className="w-5 h-5 text-rose-500" />
              <span>{t.phase_DAY_VOTING} {isEn ? '(Defense & Voting Chamber)' : '(تالار دفاع و رأی‌گیری)'}</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isEn ? 'Manage suspect defense turns, tally exit votes, and execute town verdicts.' : 'مدیریت نوبت‌های دفاع متهمان، شمارش آرای خروج و اجرای حکم اعدام شهر.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
              <span>{isEn ? 'Exit vote threshold: ' : 'حدنصاب رای خروج: '}</span>
              <span className="font-black text-rose-400 font-mono">{majorityThreshold} {isEn ? 'votes' : 'رای'}</span>
            </div>
            
            <button
              onClick={onClearDefense}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
            >
              {isEn ? 'Clear Suspects' : 'پاکسازی لیست متهمان'}
            </button>
          </div>
        </div>
      </div>

      {/* Tie Resolution Box */}
      {isTie && (
        <div className="p-5 rounded-3xl bg-amber-950/40 border-2 border-amber-500/60 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/30 pb-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-6 h-6 text-amber-400 animate-bounce" />
              <div>
                <h4 className="font-black text-white text-sm sm:text-base">
                  {isEn ? '⚠️ Voting Tie Detected!' : '⚠️ تساوی آرا در حد نصاب خروج!'}
                </h4>
                <p className="text-xs text-amber-200/90">
                  {isEn 
                    ? `Equal exit votes (${maxVotes}) between: ${topVotedPlayers.map(p => p.name).join(' and ')}`
                    : `آرای مساوی (${maxVotes} رأی) بین بازیکنان: ${topVotedPlayers.map(p => p.name).join(' و ')}`}
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black">
              {isEn ? 'Rule-Guided Tiebreaker' : 'حل تساوی طبق قوانین استاندارد'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* 1. Revote */}
            <button
              onClick={() => handleTieAction('REVOTE')}
              className="p-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 text-right flex flex-col justify-between transition-all cursor-pointer group"
            >
              <div className="text-xs font-black text-amber-400 group-hover:text-amber-300">
                🔄 {isEn ? '1. Revote (Tiebreak)' : '۱. رأی‌گیری مجدد'}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                {isEn ? 'Reset votes and conduct an instant revote among tied suspects.' : 'آرا ریست شده و بین متهمان مساوی رأی‌گیری مجدد انجام می‌شود.'}
              </p>
            </button>

            {/* 2. No Elimination (Standard Tournament Rule) */}
            <button
              onClick={() => handleTieAction('NO_ELIMINATION')}
              className="p-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-emerald-500/40 text-right flex flex-col justify-between transition-all cursor-pointer group"
            >
              <div className="text-xs font-black text-emerald-400 group-hover:text-emerald-300">
                🛡️ {isEn ? '2. No Exit (Both Survive)' : '۲. بقای هر دو متهم (رسمی)'}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                {isEn ? 'Standard tournament rule: a tied final vote causes nobody to be executed.' : 'قانون رسمی مسابقات: تساوی آرا منجر به عدم خروج و بقای هر دو در بازی می‌شود.'}
              </p>
            </button>

            {/* 3. Random Draw / Card of Fate */}
            <button
              onClick={() => handleTieAction('RANDOM_DRAW')}
              className="p-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-purple-500/40 text-right flex flex-col justify-between transition-all cursor-pointer group"
            >
              <div className="text-xs font-black text-purple-400 group-hover:text-purple-300">
                🎲 {isEn ? '3. Random Fate Draw' : '۳. قرعه مرگ (کارت شانس)'}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                {isEn ? 'Draw random lot to eliminate one tied suspect fairly.' : 'گرداننده یا سیستم یک نفر را تصادفی برای خروج انتخاب می‌کند.'}
              </p>
            </button>

            {/* 4. Eliminate Both */}
            <button
              onClick={() => handleTieAction('ELIMINATE_BOTH')}
              className="p-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-rose-500/40 text-right flex flex-col justify-between transition-all cursor-pointer group"
            >
              <div className="text-xs font-black text-rose-400 group-hover:text-rose-300">
                💀 {isEn ? '4. Eliminate Both' : '۴. اعدام همزمان هر دو'}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                {isEn ? 'If house rules allow double execution on a voting tie.' : 'در صورتی که طبق اساسنامه هر دو نفر باید همزمان حذف گردند.'}
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Suspects Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {livingPlayers.map((player) => {
          const votesCount = suspectVotes[player.id] || 0;
          const hasMajority = votesCount >= majorityThreshold;
          const isSpeaking = activeSpeakerId === player.id;

          return (
            <div
              key={player.id}
              className={`rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                hasMajority
                  ? 'bg-rose-950/60 border-rose-500 shadow-xl shadow-rose-950/50 ring-2 ring-rose-500/40'
                  : isSpeaking
                  ? 'bg-amber-950/40 border-amber-500'
                  : 'bg-neutral-900/90 border-neutral-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-1 bg-neutral-950 rounded-2xl border border-neutral-800">
                      {player.avatar}
                    </span>
                    <div>
                      <h4 className="font-black text-white text-base">{player.name}</h4>
                      <span className="text-xs text-neutral-400">{isEn ? `Seat ${player.seatNumber || '—'}` : `صندلی ${player.seatNumber || '—'}`}</span>
                    </div>
                  </div>

                  {hasMajority && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                      {isEn ? 'Condemned' : 'محکوم به اعدام'}
                    </span>
                  )}
                </div>

                {/* Vote Counter Bar */}
                <div className="my-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-bold">{isEn ? 'Exit votes counted:' : 'آرای خروج اخذ شده:'}</span>
                    <span className={`font-mono text-lg font-black ${hasMajority ? 'text-rose-400' : 'text-neutral-200'}`}>
                      {votesCount} / {livingPlayers.length}
                    </span>
                  </div>

                  <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        hasMajority ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${(votesCount / Math.max(1, livingPlayers.length)) * 100}%` }}
                    />
                  </div>

                  {/* Vote Increment / Decrement */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      onClick={() => handleVoteChange(player.id, -1)}
                      className="w-8 h-8 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-300 font-black flex items-center justify-center border border-neutral-800 text-sm cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-mono font-black text-white text-sm">
                      {votesCount}
                    </span>
                    <button
                      onClick={() => handleVoteChange(player.id, 1)}
                      className="w-8 h-8 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-300 font-black flex items-center justify-center border border-neutral-800 text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveSpeakerId(isSpeaking ? null : player.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isSpeaking
                      ? 'bg-amber-600 text-white border-amber-400'
                      : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isSpeaking ? (isEn ? 'End Defense' : 'پایان دفاع') : (isEn ? 'Start Defense Time' : 'شروع زمان دفاع')}</span>
                </button>

                <button
                  onClick={() => handleEliminate(player.id)}
                  className="flex items-center gap-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md shadow-rose-950 transition-transform active:scale-95 cursor-pointer"
                >
                  <Skull className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Execute' : 'اجرای اعدام'}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
