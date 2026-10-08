import React, { useState } from 'react';
import { 
  Table, Users, Target, ShieldAlert, ArrowDownLeft, 
  Filter, Flame, Zap, ArrowRight, Check, Sparkles 
} from 'lucide-react';
import { Accusation, Player, Language } from '../../types/mafia';
import { buildAccusationMatrix } from '../../utils/accusationAnalytics';
import { translations } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';

interface AccusationMatrixViewProps {
  players: Player[];
  accusations: Accusation[];
  onAddAccusation: (accuserId: string, targetId: string) => void;
  language: Language;
}

export const AccusationMatrixView: React.FC<AccusationMatrixViewProps> = ({
  players,
  accusations,
  onAddAccusation,
  language
}) => {
  const t = translations[language];
  const [selectedDay, setSelectedDay] = useState<number>(0); // 0 = all days

  const matrixData = buildAccusationMatrix(players, accusations, selectedDay);
  const availableDays = Array.from(new Set(accusations.map(a => a.dayNumber))).sort((a: number, b: number) => a - b);

  const handleCellClick = (accuserId: string, targetId: string) => {
    if (accuserId === targetId) return;
    soundEngine.playAccuse();
    onAddAccusation(accuserId, targetId);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Statistical Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Accusations & Filter */}
        <div className="bg-[#0f0f12] border border-white/10 rounded-3xl p-5 flex flex-col justify-between shadow-md hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.totalAccusations}</span>
            <div className="flex items-center gap-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                className="bg-[#0a0a0c] border border-white/10 text-slate-200 text-xs rounded-xl px-2.5 py-1 focus:outline-none"
              >
                <option value={0} className="bg-[#0f0f12]">تمام روزها ({accusations.length})</option>
                {availableDays.map(day => (
                  <option key={day} value={day} className="bg-[#0f0f12]">روز {day}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-amber-400 font-mono">
            {matrixData.totalAccusations}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">تعداد اتهامات ثبت‌شده در ماتریس زنده شهر</p>
        </div>

        {/* Most Aggressive Accuser */}
        <div className="bg-[#0f0f12] border border-white/10 rounded-3xl p-5 flex flex-col justify-between shadow-md hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.mostAggressive}</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          {matrixData.mostAggressiveAccuser && matrixData.mostAggressiveAccuser.count > 0 ? (
            <div className="mt-2 flex items-center gap-3">
              <span className="text-2xl p-1 bg-[#0a0a0c] rounded-xl border border-white/10">
                {matrixData.mostAggressiveAccuser.player.avatar}
              </span>
              <div>
                <h4 className="font-bold text-sm text-[#e2e2e7]">{matrixData.mostAggressiveAccuser.player.name}</h4>
                <span className="text-xs font-bold text-amber-400">{matrixData.mostAggressiveAccuser.count} بار اتهام زده</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 mt-2">هنوز اتهامی ثبت نشده است.</div>
          )}
          <p className="text-[11px] text-slate-500 mt-1">بازیکنی که بیشترین فلش قرمز را روانه دیگران کرده است</p>
        </div>

        {/* Most Targeted Player */}
        <div className="bg-[#0f0f12] border border-white/10 rounded-3xl p-5 flex flex-col justify-between shadow-md hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.mostTargeted}</span>
            <Target className="w-4 h-4 text-rose-400" />
          </div>
          {matrixData.mostTargetedPlayer && matrixData.mostTargetedPlayer.count > 0 ? (
            <div className="mt-2 flex items-center gap-3">
              <span className="text-2xl p-1 bg-[#0a0a0c] rounded-xl border border-white/10">
                {matrixData.mostTargetedPlayer.player.avatar}
              </span>
              <div>
                <h4 className="font-bold text-sm text-[#e2e2e7]">{matrixData.mostTargetedPlayer.player.name}</h4>
                <span className="text-xs font-bold text-rose-400">{matrixData.mostTargetedPlayer.count} بار متهم شده</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 mt-2">هدف مشخصی هنوز وجود ندارد.</div>
          )}
          <p className="text-[11px] text-slate-500 mt-1">کانون اصلی سوءظن و تمرکز اتهام‌زنندگان شهر</p>
        </div>

      </div>

      {/* 2D Accusation Matrix Table */}
      <div className="bg-[#0f0f12] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden backdrop-blur-md">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-[#e2e2e7] text-base">جدول ماتریس تقاطع اتهامات (Accuser ↓ / Target →)</h3>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">برای افزایش اتهام، روی خانه تقاطع کلیک کنید</span>
        </div>

        <div className="overflow-x-auto pb-3">
          <table className="w-full text-center border-collapse min-w-[650px]">
            
            {/* Column Headers (Targets) */}
            <thead>
              <tr className="border-b border-white/10 bg-[#0a0a0c]">
                <th className="p-3 text-xs font-bold text-slate-400 text-right sticky right-0 bg-[#0a0a0c] z-10">
                  متهم‌کننده ↓ / هدف →
                </th>
                {players.map(p => (
                  <th key={p.id} className="p-2.5 text-xs font-bold text-slate-300 min-w-[70px]">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-base">{p.avatar}</span>
                      <span className="truncate max-w-[65px] text-[11px]">{p.name}</span>
                    </div>
                  </th>
                ))}
                <th className="p-2.5 text-xs font-bold text-amber-400 bg-[#0a0a0c] min-w-[65px]">
                  مجموع خروجی
                </th>
              </tr>
            </thead>

            {/* Matrix Body */}
            <tbody>
              {players.map(accuser => {
                const totalGiven = matrixData.totalGivenByPlayer[accuser.id] || 0;

                return (
                  <tr key={accuser.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    
                    {/* Row Header (Accuser) */}
                    <td className="p-2.5 text-right font-bold text-xs text-slate-200 sticky right-0 bg-[#0f0f12] z-10 border-l border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{accuser.avatar}</span>
                        <span className="truncate max-w-[100px]">{accuser.name}</span>
                      </div>
                    </td>

                    {/* Matrix Cells */}
                    {players.map(target => {
                      const isSelf = accuser.id === target.id;
                      const count = matrixData.matrix[accuser.id]?.[target.id] || 0;
                      const mutualCount = matrixData.matrix[target.id]?.[accuser.id] || 0;
                      const isMutual = count > 0 && mutualCount > 0 && !isSelf;

                      let cellColor = 'bg-[#0a0a0c] text-slate-500 hover:bg-white/5';
                      if (isSelf) {
                        cellColor = 'bg-[#0a0a0c]/50 text-slate-700 cursor-not-allowed';
                      } else if (count >= 5) {
                        cellColor = 'bg-rose-600 text-white font-extrabold hover:bg-rose-500 shadow-md shadow-rose-950/40';
                      } else if (count >= 3) {
                        cellColor = 'bg-rose-900/80 text-rose-100 font-bold hover:bg-rose-800';
                      } else if (count >= 1) {
                        cellColor = 'bg-rose-950/50 text-rose-300 font-semibold hover:bg-rose-900/40';
                      }

                      return (
                        <td key={target.id} className="p-1">
                          <button
                            onClick={() => handleCellClick(accuser.id, target.id)}
                            disabled={isSelf}
                            className={`w-full h-10 rounded-xl flex items-center justify-center transition-all text-xs border ${
                              isMutual ? 'border-amber-500/80 ring-1 ring-amber-500/40' : 'border-white/5'
                            } ${cellColor}`}
                            title={isSelf ? 'نمی‌توان به خود اتهام زد' : `${accuser.name} به ${target.name}: ${count} بار اتهام`}
                          >
                            {isSelf ? '—' : count > 0 ? (
                              <span className="flex items-center gap-0.5">
                                {count}
                                {isMutual && <Zap className="w-2.5 h-2.5 text-amber-400 fill-current" />}
                              </span>
                            ) : (
                              '0'
                            )}
                          </button>
                        </td>
                      );
                    })}

                    {/* Total Given by Accuser */}
                    <td className="p-2.5 font-bold text-xs text-amber-400 bg-[#0a0a0c]/60 font-mono">
                      {totalGiven}
                    </td>

                  </tr>
                );
              })}

              {/* Total Received Row (Bottom) */}
              <tr className="bg-[#0a0a0c] font-bold text-xs border-t border-white/10">
                <td className="p-3 text-right text-amber-400 sticky right-0 bg-[#0a0a0c] z-10 border-l border-white/5">
                  مجموع دریافتی
                </td>
                {players.map(target => (
                  <td key={target.id} className="p-2 text-rose-400 font-mono">
                    {matrixData.totalReceivedByPlayer[target.id] || 0}
                  </td>
                ))}
                <td className="p-2 text-amber-400 font-extrabold text-sm font-mono">
                  {matrixData.totalAccusations}
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        {/* Mutual Conflicts List */}
        {matrixData.mutualAccusations.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/5">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2.5">
              <Zap className="w-4 h-4" />
              <span>اتهامات دوطرفه و درگیری‌های متقابل (Mutual Accusations):</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {matrixData.mutualAccusations.map((m, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0a0a0c] border border-amber-500/30 text-xs shadow-sm"
                >
                  <span className="font-bold text-slate-200">{m.playerA.name} ({m.countAtoB})</span>
                  <span className="text-amber-400 font-bold">⇄</span>
                  <span className="font-bold text-slate-200">{m.playerB.name} ({m.countBtoA})</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/20">
                    مجموع: {m.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
