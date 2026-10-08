import React, { useState } from 'react';
import { 
  Users, ArrowLeftRight, Check, Target, 
  Flame, ShieldAlert, Sparkles, BarChart2 
} from 'lucide-react';
import { Accusation, Player, Language } from '../../types/mafia';
import { comparePlayers } from '../../utils/accusationAnalytics';
import { translations } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';

interface AccusationComparisonProps {
  players: Player[];
  accusations: Accusation[];
  language: Language;
}

export const AccusationComparison: React.FC<AccusationComparisonProps> = ({
  players,
  accusations,
  language
}) => {
  const t = translations[language];
  const isEn = language === 'en';
  const [selectedIds, setSelectedIds] = useState<string[]>(
    players.slice(0, Math.min(3, players.length)).map(p => p.id)
  );

  const togglePlayerSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // keep at least 1
        return prev.filter(item => item !== id);
      } else {
        if (prev.length >= 4) return prev; // max 4 for clean layout
        return [...prev, id];
      }
    });
    soundEngine.playTick();
  };

  const comparison = comparePlayers(selectedIds, players, accusations);

  return (
    <div className="space-y-6">
      
      {/* Top Selector Bar */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-amber-400" />
              <span>{t.comparePlayers} {isEn ? '(Compare Players)' : '(مقایسه بازیکنان)'}</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isEn ? 'Select 2 to 4 players to compare accusation metrics, mutual targets, and confrontation intensity.' : 'انتخاب ۲ تا ۴ بازیکن برای مقایسه عملکرد اتهامی، اهداف متقابل و شدت فشار روانی.'}
            </p>
          </div>
        </div>

        {/* Players Multi-Select Chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          {players.map(p => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePlayerSelection(p.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600/30 border-amber-500 text-amber-200 shadow-md shadow-amber-950/40'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <span>{p.avatar}</span>
                <span>{p.name}</span>
                {isSelected && <Check className="w-3 h-3 text-amber-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {comparison.stats.map(stat => (
          <div
            key={stat.player.id}
            className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between"
          >
            <div>
              {/* Player Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
                <span className="text-3xl p-1.5 bg-neutral-950 rounded-2xl border border-neutral-800">
                  {stat.player.avatar}
                </span>
                <div>
                  <h4 className="font-black text-white text-base">{stat.player.name}</h4>
                  <span className="text-xs text-neutral-400">
                    {isEn
                      ? `Seat ${stat.player.seatNumber || '—'} • ${stat.player.isAlive ? 'Alive' : 'Eliminated'}`
                      : `صندلی ${stat.player.seatNumber || '—'} • ${stat.player.isAlive ? 'زنده' : 'حذف‌شده'}`}
                  </span>
                </div>
              </div>

              {/* Stats Metrics */}
              <div className="grid grid-cols-2 gap-2.5 my-4">
                <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 text-center">
                  <span className="text-[11px] text-neutral-400 block font-medium">
                    {isEn ? 'Accusations Made' : 'کل اتهامات زده'}
                  </span>
                  <span className="text-2xl font-black text-rose-400 font-mono">{stat.totalGiven}</span>
                </div>
                <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 text-center">
                  <span className="text-[11px] text-neutral-400 block font-medium">
                    {isEn ? 'Accusations Received' : 'کل اتهامات دریافتی'}
                  </span>
                  <span className="text-2xl font-black text-red-500 font-mono">{stat.totalReceived}</span>
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80">
                  <span className="text-neutral-400">{isEn ? 'Unique Targets:' : 'تعداد اهداف یکتا:'}</span>
                  <span className="font-bold text-neutral-100">
                    {stat.uniqueTargetsCount} {isEn ? 'players' : 'بازیکن'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80">
                  <span className="text-neutral-400">{isEn ? 'Most Targeted:' : 'بیشترین هدف گرفته‌شده:'}</span>
                  <span className="font-bold text-rose-400">
                    {stat.mostAccusedTarget ? `${stat.mostAccusedTarget.name} (${stat.mostAccusedTarget.count})` : '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80">
                  <span className="text-neutral-400">{isEn ? 'Top Accuser:' : 'بیشترین متهم‌کننده به او:'}</span>
                  <span className="font-bold text-amber-400">
                    {stat.mostAccusedBy ? `${stat.mostAccusedBy.name} (${stat.mostAccusedBy.count})` : '—'}
                  </span>
                </div>
              </div>

              {/* Targets Breakdown */}
              {stat.targetsBreakdown.length > 0 && (
                <div className="mt-4">
                  <span className="text-[11px] font-bold text-neutral-400 block mb-1.5">
                    {isEn ? 'Accusation Distribution:' : 'توزیع اتهامات:'}
                  </span>
                  <div className="space-y-1">
                    {stat.targetsBreakdown.slice(0, 4).map((tb, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-1.5 bg-neutral-950/60 rounded-lg">
                        <span className="text-neutral-300 truncate max-w-[120px]">{tb.targetName}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-neutral-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-rose-500 h-full rounded-full" 
                              style={{ width: `${Math.min(100, (tb.count / Math.max(1, stat.totalGiven)) * 100)}%` }} 
                            />
                          </div>
                          <span className="font-bold text-rose-400 font-mono w-4 text-right">{tb.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mutual Interactions between selected players */}
      {comparison.mutualInteractions.length > 0 && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl">
          <h4 className="font-extrabold text-white text-sm flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>{isEn ? 'Direct Mutual Clashes Between Selected Players:' : 'تقابل‌های مستقیم میان بازیکنان انتخاب شده:'}</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {comparison.mutualInteractions.map((mi, idx) => (
              <div key={idx} className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs">
                <div className="flex items-center justify-between font-bold text-neutral-200 mb-1">
                  <span>{mi.playerA}</span>
                  <span className="text-orange-400">↔</span>
                  <span>{mi.playerB}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 pt-2 border-t border-neutral-900">
                  <span>{mi.playerA} {isEn ? 'to' : 'به'} {mi.playerB}: {mi.aToB}</span>
                  <span>{mi.playerB} {isEn ? 'to' : 'به'} {mi.playerA}: {mi.bToA}</span>
                </div>
                <div className="text-center mt-1.5 font-bold text-orange-300 text-[11px]">
                  {isEn ? `Total exchange: ${mi.total} accusations` : `مجموع تبادل: ${mi.total} اتهام`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
