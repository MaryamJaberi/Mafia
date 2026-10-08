import React, { useState, useEffect } from 'react';
import { 
  X, Shield, Check, Sliders, AlertTriangle, Sparkles, 
  HelpCircle, BookOpen, CheckCircle2, RefreshCw, BookmarkCheck
} from 'lucide-react';
import { HouseRulesConfig, DEFAULT_HOUSE_RULES } from '../../data/matrixData';
import { Language, RoomState } from '../../types/mafia';
import { soundEngine } from '../../utils/audioSynth';

interface HouseRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: RoomState;
  currentRules?: HouseRulesConfig;
  onSaveRules?: (rules: HouseRulesConfig) => void;
  isHost?: boolean;
  language: Language;
}

export const HouseRulesModal: React.FC<HouseRulesModalProps> = ({
  isOpen,
  onClose,
  room,
  currentRules,
  onSaveRules,
  isHost = true,
  language
}) => {
  const initialRules = room?.houseRules || currentRules || DEFAULT_HOUSE_RULES;
  const [rules, setRules] = useState<HouseRulesConfig>(initialRules);

  useEffect(() => {
    if (room?.houseRules) {
      setRules(room.houseRules);
    } else if (currentRules) {
      setRules(currentRules);
    }
  }, [room?.houseRules, currentRules, isOpen]);

  if (!isOpen) return null;

  const handleToggleOrChange = <K extends keyof HouseRulesConfig>(key: K, value: HouseRulesConfig[K]) => {
    if (!isHost) return;
    soundEngine.playTick();
    setRules(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    soundEngine.playGong();
    onSaveRules(rules);
    onClose();
  };

  const handleResetToDefault = () => {
    soundEngine.playTick();
    setRules(DEFAULT_HOUSE_RULES);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-hidden animate-in fade-in">
      
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0d0d16] border border-amber-500/35 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-[#131320] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-2">
                <span>توافق‌نامه قوانین میز (قبل از پخش نقش‌ها)</span>
              </h2>
              <p className="text-xs text-slate-400">
                {isHost 
                  ? 'قوانین مورد توافق بازیکنان را قبل از تقسیم کارت‌ها انتخاب و ثبت کنید.'
                  : 'مشاهده قوانین رسمی تصویب‌شده توسط گرداننده و گروه'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playTick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* Banner Info */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong>قانون طلایی گرداننده:</strong> طبق اصل رسمی بازی مافیا، تمامی قوانین و تقابل‌های بحث‌برانگیز باید <strong>قبل از آغاز بازی و پیش از معارفه</strong> با کل بازیکنان هماهنگ و شفاف‌سازی شود.
            </div>
          </div>

          {/* Form Rules Grid */}
          <div className="space-y-4">

            {/* Rule 1: Sniper on Leader */}
            <div className="p-4 rounded-2xl bg-[#131322] border border-white/10 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-100">
                  ۱. شلیک اسنایپر به رئیس مافیا / پدرخوانده
                </span>
                <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  تقابل شب
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                در صورتی که اسنایپر در شب به رئیس مافیا / پدرخوانده شلیک کند:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleToggleOrChange('sniperOnLeader', 'NO_KILL')}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                    rules.sniperOnLeader === 'NO_KILL'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>هیچ‌کس نمی‌میرد (تیر هدر می‌رود)</span>
                  {rules.sniperOnLeader === 'NO_KILL' && <Check className="w-4 h-4 text-amber-400" />}
                </button>

                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleToggleOrChange('sniperOnLeader', 'FIREBACK')}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                    rules.sniperOnLeader === 'FIREBACK'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>فایربک اسنایپر (مرگ اسنایپر)</span>
                  {rules.sniperOnLeader === 'FIREBACK' && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              </div>
            </div>

            {/* Rule 2: Armored Shield vs Sniper */}
            <div className="p-4 rounded-2xl bg-[#131322] border border-white/10 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-100">
                  ۲. پوشش زره زره‌پوش / جان‌سخت در برابر اسنایپر
                </span>
                <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  سپر شب
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                آیا زره علاوه بر تیر مافیا، جلوی شلیک اشتباه اسنایپر را هم می‌گیرد؟
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleToggleOrChange('armoredShieldVsSniper', 'MAFIA_ONLY')}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                    rules.armoredShieldVsSniper === 'MAFIA_ONLY'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>فقط جلوی شات مافیا</span>
                  {rules.armoredShieldVsSniper === 'MAFIA_ONLY' && <Check className="w-4 h-4 text-amber-400" />}
                </button>

                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleToggleOrChange('armoredShieldVsSniper', 'ALL_SHOTS')}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                    rules.armoredShieldVsSniper === 'ALL_SHOTS'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>تمام شلیک‌ها (مافیا + اسنایپر)</span>
                  {rules.armoredShieldVsSniper === 'ALL_SHOTS' && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              </div>
            </div>

            {/* Rule 3: Doctor Self Save */}
            <div className="p-4 rounded-2xl bg-[#131322] border border-white/10 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-100">
                  ۳. محدودیت خود-نجاتی دکتر
                </span>
                <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  پزشک
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                دکتر در طول کل بازی چند بار اجازه دارد خود را نجات دهد؟
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleToggleOrChange('doctorSelfSaveLimit', 'ONCE')}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                    rules.doctorSelfSaveLimit === 'ONCE'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>حداکثر ۱ بار</span>
                  {rules.doctorSelfSaveLimit === 'ONCE' && <Check className="w-4 h-4 text-amber-400" />}
                </button>

                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleToggleOrChange('doctorSelfSaveLimit', 'TWICE')}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                    rules.doctorSelfSaveLimit === 'TWICE'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>حداکثر ۲ بار</span>
                  {rules.doctorSelfSaveLimit === 'TWICE' && <Check className="w-4 h-4 text-amber-400" />}
                </button>

                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleToggleOrChange('doctorSelfSaveLimit', 'UNLIMITED')}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                    rules.doctorSelfSaveLimit === 'UNLIMITED'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>نامحدود</span>
                  {rules.doctorSelfSaveLimit === 'UNLIMITED' && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              </div>
            </div>

            {/* Rule 4: Tied Vote Outcome */}
            <div className="p-4 rounded-2xl bg-[#131322] border border-white/10 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-100">
                  ۴. نتیجه تساوی آرا در دفاعیه روز
                </span>
                <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  رأی‌گیری
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                اگر در دور دوم رأی‌گیری خروج آرا برابر شود:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleToggleOrChange('tiedVoteOutcome', 'BOTH_STAY')}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                    rules.tiedVoteOutcome === 'BOTH_STAY'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>هر دو می‌مانند (رسمی)</span>
                  {rules.tiedVoteOutcome === 'BOTH_STAY' && <Check className="w-4 h-4 text-amber-400" />}
                </button>

                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleToggleOrChange('tiedVoteOutcome', 'DEATH_LOTTERY')}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                    rules.tiedVoteOutcome === 'DEATH_LOTTERY'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>قرعه مرگ (کارت سیاه)</span>
                  {rules.tiedVoteOutcome === 'DEATH_LOTTERY' && <Check className="w-4 h-4 text-amber-400" />}
                </button>

                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleToggleOrChange('tiedVoteOutcome', 'REVOTE')}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                    rules.tiedVoteOutcome === 'REVOTE'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>رأی‌گیری مجدد</span>
                  {rules.tiedVoteOutcome === 'REVOTE' && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              </div>
            </div>

            {/* Rule 5: Role Claim Policy */}
            <div className="p-4 rounded-2xl bg-[#131322] border border-white/10 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-100">
                  ۵. قانون کلیم و افشای مستقیم نقش در روز
                </span>
                <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  انضباطی
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                آیا بازیکنان اجازه ادعای نقش علنی دارند؟
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleToggleOrChange('roleClaimPolicy', 'STRICT_BANNED')}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                    rules.roleClaimPolicy === 'STRICT_BANNED'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>ممنوع با جریمه/اخراج انضباطی (کیک)</span>
                  {rules.roleClaimPolicy === 'STRICT_BANNED' && <Check className="w-4 h-4 text-amber-400" />}
                </button>

                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleToggleOrChange('roleClaimPolicy', 'ALLOWED_SCAM_STYLE')}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                    rules.roleClaimPolicy === 'ALLOWED_SCAM_STYLE'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>مجاز و آزاد (مانند سناریوی اسکام)</span>
                  {rules.roleClaimPolicy === 'ALLOWED_SCAM_STYLE' && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              </div>
            </div>

            {/* Rule 6: Shot on Independent */}
            <div className="p-4 rounded-2xl bg-[#131322] border border-white/10 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-100">
                  ۶. شلیک لئون / اسنایپر به مستقل‌ها (نوستراداموس / زودیاک)
                </span>
                <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  مستقل
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                نتیجه شلیک تیرانداز به نقش مستقل چیست؟
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleToggleOrChange('shotOnIndependent', 'BULLET_WASTED_NO_FIREBACK')}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                    rules.shotOnIndependent === 'BULLET_WASTED_NO_FIREBACK'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>هدر رفتن تیر بدون فایربک (هر دو می‌مانند)</span>
                  {rules.shotOnIndependent === 'BULLET_WASTED_NO_FIREBACK' && <Check className="w-4 h-4 text-amber-400" />}
                </button>

                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleToggleOrChange('shotOnIndependent', 'FIREBACK_LETHAL')}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                    rules.shotOnIndependent === 'FIREBACK_LETHAL'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>فایربک کشنده برای تیرانداز</span>
                  {rules.shotOnIndependent === 'FIREBACK_LETHAL' && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              </div>
            </div>

            {/* Rule 7: Last Move Cards */}
            <div className="p-4 rounded-2xl bg-[#131322] border border-white/10 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-100">
                  ۷. کارت‌های حرکت آخر (خروج با رأی روز)
                </span>
                <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  کارت‌ها
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                آیا کارت‌های حرکت آخر (فرش قرمز، مسیر سبز، ذهن زیبا، ...) در این دست فعال باشند؟
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleToggleOrChange('lastMoveCardsActive', true)}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                    rules.lastMoveCardsActive
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>فعال (قرعه‌کشی تصادفی هنگام خروج)</span>
                  {rules.lastMoveCardsActive && <Check className="w-4 h-4 text-amber-400" />}
                </button>

                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleToggleOrChange('lastMoveCardsActive', false)}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                    !rules.lastMoveCardsActive
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>غیرفعال (فقط وصیت ساده و خروج)</span>
                  {!rules.lastMoveCardsActive && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#131320] flex items-center justify-between">
          {isHost ? (
            <button
              onClick={handleResetToDefault}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>بازنشانی به پیش‌فرض</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400">قوانین فوق توسط گرداننده ثبت گردیده است.</span>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundEngine.playTick();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
            >
              {isHost ? 'انصراف' : 'بستن'}
            </button>

            {isHost && (
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>تصویب و ثبت قوانین میز</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
