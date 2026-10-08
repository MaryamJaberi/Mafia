import React from 'react';
import { 
  Sparkles, Flame, Target, ArrowRight, ShieldAlert, 
  Layers, TrendingUp, Zap, HelpCircle, Activity 
} from 'lucide-react';
import { Accusation, Player, Language } from '../../types/mafia';
import { analyzeAccusationPatterns } from '../../utils/accusationAnalytics';
import { translations } from '../../utils/translations';

interface AccusationPatternAnalysisProps {
  players: Player[];
  accusations: Accusation[];
  language: Language;
}

export const AccusationPatternAnalysisView: React.FC<AccusationPatternAnalysisProps> = ({
  players,
  accusations,
  language
}) => {
  const t = translations[language];
  const patterns = analyzeAccusationPatterns(players, accusations);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Introduction Banner */}
      <div className="bg-gradient-to-r from-neutral-900/90 via-neutral-900/90 to-rose-950/40 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base sm:text-lg">
              {t.patternAnalysis} (Behavioral Pattern Engine)
            </h3>
            <p className="text-xs text-neutral-400">
              تحلیل قطعی و آماری رفتار بازیکنان، کشف الگوهای فشار یک‌طرفه، دوئل‌های مرگبار و کانون‌های سوءظن.
            </p>
          </div>
        </div>
      </div>

      {/* Top 2 Metric Cards: Most Aggressive & Most Targeted */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Most Aggressive */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-orange-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                {t.mostAggressive}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-mono text-[11px]">
                تهاجمی‌ترین
              </span>
            </div>

            {patterns.mostAggressive ? (
              <div className="flex items-center gap-4 my-3 p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800">
                <span className="text-4xl p-2 bg-neutral-900 rounded-2xl border border-neutral-700">
                  {patterns.mostAggressive.player.avatar}
                </span>
                <div>
                  <h4 className="font-black text-white text-lg">{patterns.mostAggressive.player.name}</h4>
                  <span className="text-xs text-orange-400 font-bold">
                    ثبت مجموع {patterns.mostAggressive.totalGiven} اتهام در شهر
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-neutral-500">اطلاعات کافی ثبت نشده است.</div>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            این بازیکن فعال‌ترین نقش را در پیشبرد گفتمان اتهام و هدایت سوءظن‌ها داشته است.
          </p>
        </div>

        {/* Most Targeted */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-rose-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                {t.mostTargeted}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[11px]">
                سیبل شهر
              </span>
            </div>

            {patterns.mostTargeted ? (
              <div className="flex items-center gap-4 my-3 p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800">
                <span className="text-4xl p-2 bg-neutral-900 rounded-2xl border border-neutral-700">
                  {patterns.mostTargeted.player.avatar}
                </span>
                <div>
                  <h4 className="font-black text-white text-lg">{patterns.mostTargeted.player.name}</h4>
                  <span className="text-xs text-rose-400 font-bold">
                    دریافت {patterns.mostTargeted.totalReceived} اتهام از سوی سایر بازیکنان
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-neutral-500">اطلاعات کافی ثبت نشده است.</div>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            این بازیکن کانون اصلی فشار روانی و نامزد اصلی فرستاده شدن به مرحله دفاع است.
          </p>
        </div>

      </div>

      {/* Behavioral Patterns: Mutual & One-Sided */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Mutual Conflicts */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl">
          <h4 className="font-extrabold text-white text-sm flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>نبردهای متقابل و دوجانبه ({patterns.mutualConflicts.length})</span>
          </h4>

          {patterns.mutualConflicts.length > 0 ? (
            <div className="space-y-2.5">
              {patterns.mutualConflicts.map((mc, idx) => (
                <div key={idx} className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-100">
                    <span>{mc.playerA}</span>
                    <span className="text-amber-400 font-mono">⇄ {mc.total} تبادل ⇄</span>
                    <span>{mc.playerB}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 pt-2 border-t border-neutral-900">
                    <span>{mc.playerA} متهم کرد: {mc.aToB} بار</span>
                    <span>{mc.playerB} متهم کرد: {mc.bToA} بار</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-neutral-500">
              هنوز اتهام دوطرفه‌ای میان دو بازیکن ثبت نشده است.
            </div>
          )}
        </div>

        {/* One-Sided Pressure */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl">
          <h4 className="font-extrabold text-white text-sm flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>فشار و اتهام یک‌طرفه (One-Sided Pressure)</span>
          </h4>

          {patterns.oneSidedPressure.length > 0 ? (
            <div className="space-y-2.5">
              {patterns.oneSidedPressure.map((op, idx) => (
                <div key={idx} className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{op.accuser}</span>
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      ➔ {op.count} اتهام متوالی ➔
                    </span>
                    <span className="font-bold text-neutral-300">{op.target}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-2 pt-2 border-t border-neutral-900">
                    {op.target} هیچ اتهام پاسخی به {op.accuser} نداده است (فشار کاملاً یک‌طرفه).
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-neutral-500">
              هیچ الگوی فشار یک‌طرفه با تکرار بالا مشاهده نشد.
            </div>
          )}
        </div>

      </div>

      {/* Clusters & Evolution */}
      {patterns.accusationClusters.length > 0 && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl">
          <h4 className="font-extrabold text-white text-sm flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>خوشه‌بندی و دسته‌های اتهام‌زنی شهر (Accusation Clusters)</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {patterns.accusationClusters.map((cluster, idx) => (
              <div key={idx} className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-xs text-cyan-300">{cluster.label}</span>
                  <div className="flex items-center gap-1">
                    {cluster.playerIds.map((pName, pIdx) => (
                      <span key={pIdx} className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-200 border border-neutral-800">
                        {pName}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">{cluster.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
