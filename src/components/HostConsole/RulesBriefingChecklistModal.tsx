import React, { useState } from 'react';
import { 
  CheckCircle2, Circle, Shield, Users, Skull, BookOpen, 
  Sparkles, Moon, ArrowLeft, ArrowRight, Play, Volume2
} from 'lucide-react';
import { RoomState, Language, RoleId } from '../../types/mafia';
import { ROLE_DEFINITIONS } from '../../utils/scenarios';
import { soundEngine } from '../../utils/audioSynth';

interface RulesBriefingChecklistProps {
  room: RoomState;
  isHost: boolean;
  onHostConfirmRead: () => void;
  onDealRoles: () => void;
  onPlayerAcknowledge?: () => void;
  currentPlayerId?: string;
  language?: Language;
}

export const RulesBriefingChecklistModal: React.FC<RulesBriefingChecklistProps> = ({
  room,
  isHost,
  onHostConfirmRead,
  onDealRoles,
  onPlayerAcknowledge,
  currentPlayerId,
  language = 'fa'
}) => {
  const isEn = language === 'en';
  const Arrow = isEn ? ArrowRight : ArrowLeft;

  // Track God's checkboxes for the 7 mandatory speech items
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: false,
    6: false,
    7: false
  });

  const toggleCheck = (idx: number) => {
    soundEngine.playTick();
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const allChecked = Object.values(checkedItems).filter(Boolean).length >= 5;

  // Deck role statistics
  const mafiaRoles = (room.deckRoles || []).filter(d => ROLE_DEFINITIONS[d.roleId]?.affiliation === 'MAFIA');
  const citizenRoles = (room.deckRoles || []).filter(d => ROLE_DEFINITIONS[d.roleId]?.affiliation === 'CITIZEN');
  const independentRoles = (room.deckRoles || []).filter(d => ROLE_DEFINITIONS[d.roleId]?.affiliation === 'INDEPENDENT');

  const acknowledgedCount = room.rulesAcknowledgedPlayers?.length || 0;
  const totalPlayersCount = room.players.length || (room.targetSeatsCount || 10);
  const hasCurrentPlayerAcknowledged = currentPlayerId 
    ? room.rulesAcknowledgedPlayers?.includes(currentPlayerId) 
    : false;

  const firstNightRoles = room.firstNightAwakeRoles || ['BARTENDER'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md animate-in fade-in" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="bg-[#101016] border-2 border-amber-500/40 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-[#14141d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xl font-bold">
              📢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {isHost ? 'مرحله ۴: چک‌لیست قبل از پخش نقش' : 'معارفه و قوانین بازی'}
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">
                {isHost 
                  ? 'سخنرانی معارفه و قوانین رسمی گرداننده' 
                  : 'قوانین و چارچوب سناریوی این بازی'}
              </h2>
            </div>
          </div>

          {/* Player Acknowledgement Tracker */}
          <div className="text-left sm:text-right">
            <div className="text-xs font-black text-emerald-400">
              {acknowledgedCount} از {totalPlayersCount} نفر
            </div>
            <div className="text-[10px] text-zinc-400">«متوجهم» زده‌اند</div>
          </div>
        </div>

        {/* Content Body: The 7 Bullet Points from User Specification */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-right">
          
          {isHost && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
              <Volume2 className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                گرداننده گرامی: موارد زیر را با صدای رسا برای بازیکنان حاضر سر میز قرائت نموده و سپس دکمه «خواندم، برو جلو» را بزنید.
              </span>
            </div>
          )}

          {/* 1. این بازی چیست */}
          <div 
            onClick={() => isHost && toggleCheck(1)} 
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              checkedItems[1] ? 'bg-black/50 border-amber-500/50' : 'bg-black/30 border-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-amber-400">۱. این بازی چیست (سناریو)</span>
              {isHost && (
                checkedItems[1] ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-zinc-600" />
              )}
            </div>
            <p className="text-xs text-zinc-300">
              سناریو: <span className="font-bold text-white">{room.scenarioId}</span>. این مسابقه یک نبرد استدلالی، روانشناختی و استنتاجی میان شهروندان ناآگاه و مافیای آگاه است.
            </p>
          </div>

          {/* 2. چند نفر هستیم */}
          <div 
            onClick={() => isHost && toggleCheck(2)} 
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              checkedItems[2] ? 'bg-black/50 border-amber-500/50' : 'bg-black/30 border-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-amber-400">۲. چند نفر هستیم (ظرفیت میز)</span>
              {isHost && (
                checkedItems[2] ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-zinc-600" />
              )}
            </div>
            <p className="text-xs text-zinc-300">
              تعداد بازیکنان حاضر سر میز: <span className="font-bold text-white">{totalPlayersCount} نفر</span>. هر صندلی دارای شماره اختصاصی است.
            </p>
          </div>

          {/* 3. چند مافیا */}
          <div 
            onClick={() => isHost && toggleCheck(3)} 
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              checkedItems[3] ? 'bg-black/50 border-amber-500/50' : 'bg-black/30 border-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-amber-400">۳. چند مافیا و سایدها</span>
              {isHost && (
                checkedItems[3] ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-zinc-600" />
              )}
            </div>
            <p className="text-xs text-zinc-300">
              در این بازی <span className="font-bold text-rose-400">{mafiaRoles.length} مافیا</span>،{' '}
              <span className="font-bold text-emerald-400">{citizenRoles.length} شهروند</span>{' '}
              {independentRoles.length > 0 && <span>و <span className="font-bold text-purple-400">{independentRoles.length} نقش مستقل</span></span>} وجود دارد.
            </p>
          </div>

          {/* 4. چه نقش‌هایی هست */}
          <div 
            onClick={() => isHost && toggleCheck(4)} 
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              checkedItems[4] ? 'bg-black/50 border-amber-500/50' : 'bg-black/30 border-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-amber-400">۴. چه نقش‌هایی در بازی وجود دارد</span>
              {isHost && (
                checkedItems[4] ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-zinc-600" />
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(room.deckRoles || []).map((d, i) => {
                const def = ROLE_DEFINITIONS[d.roleId];
                return (
                  <span 
                    key={i} 
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${
                      def?.affiliation === 'MAFIA'
                        ? 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                        : def?.affiliation === 'INDEPENDENT'
                        ? 'bg-purple-950/40 text-purple-300 border-purple-500/30'
                        : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {def?.nameKey?.replace('role_', '') || d.roleId}
                  </span>
                );
              })}
            </div>
          </div>

          {/* 5. نقش‌های متقابل */}
          <div 
            onClick={() => isHost && toggleCheck(5)} 
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              checkedItems[5] ? 'bg-black/50 border-amber-500/50' : 'bg-black/30 border-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-amber-400">۵. تقابل نقش‌ها (Matchups)</span>
              {isHost && (
                checkedItems[5] ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-zinc-600" />
              )}
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              کارآگاه ⚔️ پدرخوانده (استعلام گادفادر منفی است) • تک‌تیرانداز ⚔️ ماتادور • دکتر شهر ⚔️ تیر مافیا • ساقی ⚔️ مستی شبانه.
            </p>
          </div>

          {/* 6. قوانین بازی */}
          <div 
            onClick={() => isHost && toggleCheck(6)} 
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              checkedItems[6] ? 'bg-black/50 border-amber-500/50' : 'bg-black/30 border-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-amber-400">۶. قوانین زمان و انضباط</span>
              {isHost && (
                checkedItems[6] ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-zinc-600" />
              )}
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              زمان صحبت معمولی: ۴۵ ثانیه • زمان چالش: ۳۰ ثانیه • هرگونه اطلاق فکت خارج از بازی، قسم خوردن و تارگت شب ممنوع و اخراج انضباطی در پی دارد.
            </p>
          </div>

          {/* 7. کدام نقش از شب اول بیدار می‌شود */}
          <div 
            onClick={() => isHost && toggleCheck(7)} 
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              checkedItems[7] ? 'bg-black/50 border-amber-500/50' : 'bg-black/30 border-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-amber-400">۷. وضعیت بیداری شب اول (معارفه)</span>
              {isHost && (
                checkedItems[7] ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-zinc-600" />
              )}
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              پیش‌فرض: شب معارفه خاموش است.{' '}
              {firstNightRoles.length > 0 ? (
                <span>
                  نقش‌های زیر از شب اول بیدار شده و اکشن ثبت می‌کنند:{' '}
                  <span className="text-amber-300 font-bold">
                    {firstNightRoles.map(r => ROLE_DEFINITIONS[r]?.nameKey?.replace('role_', '') || r).join('، ')}
                  </span>
                  . بقیه نقش‌ها از شب دوم فعال می‌شوند.
                </span>
              ) : (
                <span>هیچ اکشنی در شب اول انجام نمی‌شود و فقط معارفه چشمی ساید مافیاست.</span>
              )}
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#14141d]">
          {isHost ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-zinc-400">
                {room.rulesReadByHost 
                  ? 'قوانین قرائت شد. اکنون می‌توانید نقش‌ها را پخش کنید.' 
                  : 'پس از قرائت موارد بالا دکمه «خواندم، برو جلو» را بزنید.'}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {!room.rulesReadByHost ? (
                  <button
                    onClick={() => {
                      soundEngine.playTick();
                      onHostConfirmRead();
                    }}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>خواندم، برو جلو</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      soundEngine.playGong();
                      onDealRoles();
                    }}
                    className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 text-black font-black text-xs shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>پخش نقش</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Player Side Action: «متوجهم» */
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-zinc-400">
                {hasCurrentPlayerAcknowledged 
                  ? 'تأیید شما ثبت شد. منتظر پخش کارت‌ها توسط گرداننده باشید.' 
                  : 'لطفاً با زدن دکمه زیر تأیید کنید که قوانین و معارفه را شنیدید.'}
              </div>

              <button
                onClick={() => {
                  soundEngine.playTick();
                  if (onPlayerAcknowledge) onPlayerAcknowledge();
                }}
                disabled={hasCurrentPlayerAcknowledged}
                className={`px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 cursor-pointer transition-all ${
                  hasCurrentPlayerAcknowledged
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{hasCurrentPlayerAcknowledged ? 'تأیید شد (متوجهم)' : 'متوجهم'}</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
