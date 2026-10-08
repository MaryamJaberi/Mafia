import React, { useState } from 'react';
import { 
  X, Shield, Users, Sparkles, Volume2, Copy, Check, 
  Bookmark, Sliders, Play, Award, Clock, Moon, Sun, AlertCircle
} from 'lucide-react';
import { RoomState, RoleId, Language } from '../../types/mafia';
import { ROLE_DEFINITIONS, DEFAULT_SCENARIOS } from '../../utils/scenarios';
import { DEFAULT_HOUSE_RULES } from '../../data/matrixData';
import { soundEngine } from '../../utils/audioSynth';

interface GameProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomState;
  isHost?: boolean;
  language: Language;
  onOpenMatrix?: () => void;
  onOpenHouseRules?: () => void;
  onSelectRoleForClash?: () => void;
}

export const GameProfileModal: React.FC<GameProfileModalProps> = ({
  isOpen,
  onClose,
  room,
  isHost = true,
  language,
  onOpenMatrix,
  onOpenHouseRules,
  onSelectRoleForClash
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [scriptViewTab, setScriptViewTab] = useState<'OVERVIEW' | 'SCRIPT'>('OVERVIEW');

  if (!isOpen) return null;

  const currentScenario = DEFAULT_SCENARIOS.find(s => s.id === room.scenarioId) || {
    id: 'custom',
    name: 'سناریوی سفارشی میز',
    description: 'ترکیب نقش‌های تعیین‌شده توسط گرداننده',
    recommendedPlayerCount: room.players.length,
    roles: []
  };

  const houseRules = room.houseRules || DEFAULT_HOUSE_RULES;

  // Calculate team balance from player roles in room
  const mafiaPlayers = room.players.filter(p => ROLE_DEFINITIONS[p.role]?.affiliation === 'MAFIA');
  const citizenPlayers = room.players.filter(p => ROLE_DEFINITIONS[p.role]?.affiliation === 'CITIZEN');
  const independentPlayers = room.players.filter(p => ROLE_DEFINITIONS[p.role]?.affiliation === 'INDEPENDENT');

  // Active unique roles present in room
  const presentRoles: RoleId[] = Array.from(new Set(room.players.map(p => p.role)));

  // Generate read-aloud script for God before introduction
  const readAloudScript = `
«بسم‌الله و با سلام به تمام بازیکنان محترم میز.

ما در حال آغاز مسابقه مافیا با سناریوی «${currentScenario.name}» هستیم.
تعداد کل بازیکنان حاضر در بازی: ${room.players.length} نفر است.
ترکیب سایدها: شامل ${citizenPlayers.length} شهروند، ${mafiaPlayers.length} مافیا${independentPlayers.length > 0 ? ` و ${independentPlayers.length} بازیکن مستقل` : ''} می‌باشد.

قوانین توافق‌شدهٔ رسمی این بازی:
۱. شلیک اسنایپر به رئیس مافیا: ${houseRules.sniperOnLeader === 'NO_KILL' ? 'هیچ‌کس نمی‌میرد و تیر هدر می‌رود.' : 'فایربک و حذف اسنایپر.'}
۲. سپر زره‌پوش: ${houseRules.armoredShieldVsSniper === 'MAFIA_ONLY' ? 'فقط در برابر تیر مافیا محافظت دارد.' : 'در برابر تمام شلیک‌ها محافظت دارد.'}
۳. محدودیت نجات خود توسط دکتر: ${houseRules.doctorSelfSaveLimit === 'ONCE' ? 'حداکثر ۱ بار' : houseRules.doctorSelfSaveLimit === 'TWICE' ? 'حداکثر ۲ بار' : 'نامحدود'}.
۴. تساوی آرا در دفاعیه: ${houseRules.tiedVoteOutcome === 'BOTH_STAY' ? 'هر دو متهم در بازی می‌مانند.' : houseRules.tiedVoteOutcome === 'DEATH_LOTTERY' ? 'قرعه مرگ (کارت سیاه)' : 'رأی‌گیری مجدد'}.
۵. قانون کلیم و افشای نقش: ${houseRules.roleClaimPolicy === 'STRICT_BANNED' ? 'ممنوع است و تکرار آن اخراج انضباطی به همراه دارد.' : 'مجاز است.'}
۶. شلیک به مستقل‌ها: ${houseRules.shotOnIndependent === 'BULLET_WASTED_NO_FIREBACK' ? 'هدر رفتن تیر بدون فایربک.' : 'فایربک کشنده برای تیرانداز.'}
۷. کارت‌های حرکت آخر: ${houseRules.lastMoveCardsActive ? 'فعال است و خروجی با رأی روز کارت می‌کشد.' : 'غیرفعال است.'}

زمان صحبت نوبت عادی ${room.defaultSpeechSeconds || 60} ثانیه و زمان چالش ${room.defaultChallengeSeconds || 30} ثانیه است.
سکوت شب و احترام به نوبت صحبت الزامی است.
هم‌اکنون وارد روز معارفه می‌شویم و شماره صندلی‌ها به ترتیب صحبت خواهند کرد.
موفق و پیروز باشید!»
  `.trim();

  const handleCopyScript = () => {
    navigator.clipboard.writeText(readAloudScript);
    setCopiedScript(true);
    soundEngine.playTick();
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in">
      
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0c0c14] border border-amber-500/35 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-[#12121e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-2">
                <span>شناسنامه و پروفایل رسمی بازی</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Match Profile
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                مشخصات سناریو، ترکیب سایدها، قوانین توافق‌شده و متن قرائت قبل از معارفه
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playTick();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex px-5 pt-3 border-b border-white/5 bg-[#0f0f18] gap-2">
          <button
            onClick={() => {
              soundEngine.playTick();
              setScriptViewTab('OVERVIEW');
            }}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              scriptViewTab === 'OVERVIEW'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>مشخصات فنی و ترکیب نقش‌ها</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTick();
              setScriptViewTab('SCRIPT');
            }}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              scriptViewTab === 'SCRIPT'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>متن رسمی قرائت برای بازیکنان (توسط گاد)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {scriptViewTab === 'OVERVIEW' ? (
            <div className="space-y-6">

              {/* Scenario Summary Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#161628] to-[#12121e] border border-amber-500/25 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-black text-amber-300">
                      سناریو: {currentScenario.name}
                    </h3>
                  </div>
                  <span className="text-xs px-3 py-1 bg-amber-500/10 text-amber-300 rounded-full border border-amber-500/20 font-bold">
                    {room.players.length} بازیکن در اتاق
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentScenario.description}
                </p>

                {/* Team Distribution Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                    <div className="text-[11px] text-blue-300 font-medium">ساید شهروند</div>
                    <div className="text-xl font-black text-blue-400 mt-0.5">{citizenPlayers.length} نفر</div>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                    <div className="text-[11px] text-rose-300 font-medium">تیم مافیا</div>
                    <div className="text-xl font-black text-rose-400 mt-0.5">{mafiaPlayers.length} نفر</div>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center col-span-2 sm:col-span-1">
                    <div className="text-[11px] text-purple-300 font-medium">ساید مستقل</div>
                    <div className="text-xl font-black text-purple-400 mt-0.5">{independentPlayers.length} نفر</div>
                  </div>
                </div>
              </div>

              {/* Active Roles in Match */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-200 flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>نقش‌های حاضر در این مسابقه</span>
                  </h4>
                  {onOpenMatrix && (
                    <button
                      onClick={() => {
                        soundEngine.playTick();
                        onOpenMatrix();
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>مشاهده جدول تلاقی ۱۷ سناریو</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {presentRoles.map((roleId) => {
                    const def = ROLE_DEFINITIONS[roleId];
                    if (!def) return null;

                    const count = room.players.filter(p => p.role === roleId).length;

                    return (
                      <div
                        key={roleId}
                        className="p-3 rounded-xl bg-[#131322] border border-white/10 flex items-start gap-3 hover:border-amber-500/30 transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lg flex-shrink-0">
                          {def.iconName === 'Crown' ? '👑' : def.iconName === 'Crosshair' ? '🎯' : def.iconName === 'Heart' ? '❤️' : '🕵️'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-100 truncate">
                              {def.nameKey}
                            </span>
                            {count > 1 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-amber-300 font-bold">
                                {count}×
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            ساید {def.affiliation === 'MAFIA' ? 'مافیا' : def.affiliation === 'CITIZEN' ? 'شهروند' : 'مستقل'}
                          </span>
                          {def.nightPriority > 0 && (
                            <span className="text-[10px] text-amber-400/90 font-medium block mt-0.5">
                              اولویت شب: {def.nightPriority}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Agreed House Rules Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-200 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>خلاصه قوانین تصویب‌شده میز (House Rules)</span>
                  </h4>
                  {isHost && onOpenHouseRules && (
                    <button
                      onClick={() => {
                        soundEngine.playTick();
                        onOpenHouseRules();
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>تغییر تنظیمات قوانین</span>
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#131322] border border-white/10 flex items-center justify-between">
                    <span className="text-slate-400">شلیک اسنایپر به رئیس مافیا:</span>
                    <span className="text-amber-300 font-bold">
                      {houseRules.sniperOnLeader === 'NO_KILL' ? 'هیچ‌کس نمی‌میرد' : 'فایربک (مرگ اسنایپر)'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#131322] border border-white/10 flex items-center justify-between">
                    <span className="text-slate-400">پوشش زره زره‌پوش:</span>
                    <span className="text-amber-300 font-bold">
                      {houseRules.armoredShieldVsSniper === 'MAFIA_ONLY' ? 'فقط شات مافیا' : 'تمام تیرها'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#131322] border border-white/10 flex items-center justify-between">
                    <span className="text-slate-400">محدودیت خود-نجاتی دکتر:</span>
                    <span className="text-amber-300 font-bold">
                      {houseRules.doctorSelfSaveLimit === 'ONCE' ? 'حداکثر ۱ بار' : houseRules.doctorSelfSaveLimit === 'TWICE' ? 'حداکثر ۲ بار' : 'نامحدود'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#131322] border border-white/10 flex items-center justify-between">
                    <span className="text-slate-400">تساوی آرا در دفاعیه:</span>
                    <span className="text-amber-300 font-bold">
                      {houseRules.tiedVoteOutcome === 'BOTH_STAY' ? 'هر دو می‌مانند' : houseRules.tiedVoteOutcome === 'DEATH_LOTTERY' ? 'قرعه مرگ' : 'رأی مجدد'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#131322] border border-white/10 flex items-center justify-between">
                    <span className="text-slate-400">قانون کلیم و افشای نقش:</span>
                    <span className="text-amber-300 font-bold">
                      {houseRules.roleClaimPolicy === 'STRICT_BANNED' ? 'ممنوع با اخراج (کیک)' : 'مجاز (اسکام)'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#131322] border border-white/10 flex items-center justify-between">
                    <span className="text-slate-400">کارت‌های حرکت آخر:</span>
                    <span className="text-amber-300 font-bold">
                      {houseRules.lastMoveCardsActive ? 'فعال (قرعه روز)' : 'غیرفعال'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* SCRIPT VIEW FOR GOD */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="text-xs text-amber-200 leading-relaxed">
                  گرداننده گرامی، پیش از اعلام فاز معارفه، متن زیر را برای هماهنگی نهایی با صدای رسا برای بازیکنان قرائت نمایید:
                </div>
                <button
                  onClick={handleCopyScript}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center gap-1.5 cursor-pointer flex-shrink-0 transition-all"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'کپی شد' : 'کپی متن'}</span>
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-[#11111d] border border-white/10 font-sans text-sm text-slate-200 leading-loose whitespace-pre-line shadow-inner">
                {readAloudScript}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#12121e] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            این پروفایل در تمام طول بازی در دسترس تمام بازیکنان و گرداننده است.
          </span>

          <button
            onClick={() => {
              soundEngine.playTick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-colors cursor-pointer"
          >
            متوجه شدم
          </button>
        </div>

      </div>

    </div>
  );
};
