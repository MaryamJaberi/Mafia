import React, { useState } from 'react';
import { 
  Eye, EyeOff, Shield, Skull, CheckCircle2, AlertTriangle, 
  HelpCircle, Lock, BookOpen, Sparkles, Check, Swords, ShieldCheck
} from 'lucide-react';
import { RoleId, Player, Language } from '../../types/mafia';
import { getCompleteRoleInfo } from '../../utils/rolesDatabase';
import { ROLE_DEFINITIONS } from '../../utils/scenarios';
import { soundEngine } from '../../utils/audioSynth';

interface SecretRoleCardModalProps {
  isOpen: boolean;
  player: Player;
  onConfirmSeen?: () => void;
  onClose?: () => void;
  language?: Language;
}

export const SecretRoleCardModal: React.FC<SecretRoleCardModalProps> = ({
  isOpen,
  player,
  onConfirmSeen,
  onClose,
  language = 'fa'
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLockedOpen, setIsLockedOpen] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsRevealed(false);
      setIsLockedOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isEn = language === 'en';
  const roleInfo = getCompleteRoleInfo(player.role, language);
  const roleDef = ROLE_DEFINITIONS[player.role];

  const displayName = player.customRoleName || roleInfo.localizedName;
  const affiliationText = player.customRoleAffiliation
    ? (player.customRoleAffiliation === 'MAFIA' ? (isEn ? 'Mafia Team' : 'تیم مافیا') : player.customRoleAffiliation === 'INDEPENDENT' ? (isEn ? 'Independent' : 'نقش مستقل') : (isEn ? 'Citizen Team' : 'تیم شهروند'))
    : roleInfo.localizedAffiliation;

  const handleHoldStart = () => {
    soundEngine.playRoleReveal();
    setIsRevealed(true);
    if (onConfirmSeen) onConfirmSeen();
  };

  const handleHoldEnd = () => {
    if (!isLockedOpen) {
      setIsRevealed(false);
    }
  };

  const toggleLock = () => {
    soundEngine.playTick();
    const nextState = !isLockedOpen;
    setIsLockedOpen(nextState);
    setIsRevealed(nextState);
    if (nextState && onConfirmSeen) onConfirmSeen();
  };

  const handleConfirm = () => {
    soundEngine.playTick();
    if (onConfirmSeen) onConfirmSeen();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="bg-[#101016] border border-white/15 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl flex flex-col items-center text-center space-y-4 max-h-[95vh] overflow-y-auto">
        
        {/* Anti-Peeking Privacy Warning */}
        <div className="w-full p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 text-xs font-bold text-amber-300">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {isEn 
                ? 'Confidential: Hold button to inspect your role in privacy.' 
                : 'محرمانه: دکمه را نگه‌دارید تا در خلوت نقش خود را ببینید.'}
            </span>
          </div>
          <button
            onClick={toggleLock}
            className="px-2.5 py-1 rounded-xl bg-black/40 hover:bg-black/70 text-[10px] text-amber-300 border border-amber-500/30 cursor-pointer"
          >
            {isLockedOpen ? (isEn ? 'Auto-Cover ON' : 'حالت امن فعال') : (isEn ? 'Lock Open' : 'قفل نمایش')}
          </button>
        </div>

        {/* Hold to Reveal Touch / Mouse Pad */}
        <div className="w-full">
          <button
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer select-none shadow-lg ${
              isRevealed
                ? 'bg-emerald-500 text-black shadow-emerald-500/20'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-600 active:scale-95'
            }`}
          >
            {isRevealed ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            <span>
              {isRevealed 
                ? (isEn ? 'Displaying Role (Release to cover)' : 'در حال نمایش نقش (رها کنید تا پوشانده شود)') 
                : (isEn ? 'Hold to View Role (Auto-Covers on release)' : 'برای دیدن نقش نگه‌دارید (به محض رها کردن پنهان می‌شود)')}
            </span>
          </button>
        </div>

        {/* The Confidential Card Container */}
        <div 
          className="w-full p-5 rounded-3xl bg-gradient-to-b from-[#181822] to-[#101016] border-2 border-zinc-700/60 shadow-2xl flex flex-col justify-between text-right relative overflow-hidden min-h-[360px]"
          dir={isEn ? 'ltr' : 'rtl'}
        >
          {!isRevealed ? (
            /* Card Covered State */
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-10">
              <div className="w-20 h-20 rounded-3xl bg-zinc-800/80 border border-zinc-600/40 flex items-center justify-center text-4xl shadow-inner">
                🔒
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">
                  {isEn ? 'Confidential Role Card' : 'کارت محرمانه بازیکن'}
                </h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  {isEn 
                    ? 'Protected by anti-peeking shield. Keep finger on the hold button to inspect.' 
                    : 'محافظت‌شده با پوشش ضدتقلب و دید با زاویه. دکمه بالا را نگه‌دارید تا جزئیات نمایان شود.'}
                </p>
              </div>
            </div>
          ) : (
            /* Card Revealed State - Meets All 5 Points of User Specification */
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Point 1: نام نقش & Affiliation */}
              <div className="flex items-center justify-between border-b border-zinc-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{player.avatar}</span>
                  <div>
                    <div className="text-xs font-bold text-zinc-300">{player.name}</div>
                    <div className="text-[10px] text-zinc-400">صندلی شماره {player.seatNumber || 1}</div>
                  </div>
                </div>
                
                <span className={`text-[11px] font-black px-3 py-1 rounded-xl border ${
                  affiliationText.includes('مافیا')
                    ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                    : affiliationText.includes('مستقل')
                    ? 'bg-purple-950/40 text-purple-300 border-purple-500/40'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                }`}>
                  {affiliationText}
                </span>
              </div>

              <div className="text-center py-1">
                <h2 className="text-2xl font-black text-white tracking-tight">{displayName}</h2>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{roleInfo.localizedDescription}</p>
              </div>

              {/* Point 2 & 3: نکات نقش و پیشنهاد بازی */}
              <div className="p-3.5 rounded-2xl bg-black/50 border border-zinc-800 text-xs space-y-2 text-right">
                <div className="font-black text-amber-300 flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>نکات نقش و پیشنهاد بازی (Tactical Strategy):</span>
                </div>
                <div className="text-[11px] text-zinc-300 space-y-1 leading-relaxed">
                  {roleInfo.localizedActs && roleInfo.localizedActs.length > 0 ? (
                    roleInfo.localizedActs.map((act, i) => (
                      <div key={i}>
                        <strong className="text-white ml-1">• {act.title}:</strong>
                        <span>{act.description}</span>
                      </div>
                    ))
                  ) : (
                    <div>• در فاز روز به تارگت‌های بدون استدلال دقت کنید و رأی‌های خود را هماهنگ سازید.</div>
                  )}
                </div>
              </div>

              {/* Point 4: قوانین همان نقش */}
              <div className="p-3 rounded-2xl bg-black/50 border border-zinc-800 text-xs space-y-1.5 text-right">
                <div className="font-black text-sky-300 flex items-center gap-1.5 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>قوانین اختصاصی این نقش:</span>
                </div>
                <div className="text-[11px] text-zinc-300 space-y-1 leading-relaxed">
                  {roleInfo.localizedExceptions && roleInfo.localizedExceptions.length > 0 ? (
                    roleInfo.localizedExceptions.map((ex, i) => (
                      <div key={i}>• {ex}</div>
                    ))
                  ) : (
                    <div>• مشمول قوانین عمومی سناریو و شلیک‌های استاندارد شبانه.</div>
                  )}
                </div>
              </div>

              {/* Point 5: نقش‌های متقابل */}
              {roleDef?.matchups && roleDef.matchups.length > 0 && (
                <div className="p-3 rounded-2xl bg-black/50 border border-zinc-800 text-xs space-y-1.5 text-right">
                  <div className="font-black text-rose-300 flex items-center gap-1.5 text-[11px]">
                    <Swords className="w-3.5 h-3.5" />
                    <span>نقش‌های متقابل و تقابل‌های مستقیم:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {roleDef.matchups.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-zinc-800/80 text-zinc-200 border border-zinc-700 text-[10px]">
                        ⚔️ {m.targetRoleName}: {m.effect}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center text-[10px] text-zinc-500 pt-1">
                به محض برداشتن انگشت، کارت برای جلوگیری از نگاه دیگران فوراً مخفی می‌شود.
              </div>

            </div>
          )}
        </div>

        {/* Bottom Done / Close Button */}
        <div className="w-full pt-1 flex items-center gap-2">
          <button
            onClick={handleConfirm}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isEn 
                ? 'Role Acknowledged & Understood' 
                : 'نقشم را دیدم و تأیید می‌کنم (سبز شدن وضعیت صندلی)'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
