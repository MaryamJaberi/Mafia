import React from 'react';
import { X, Volume2, Bell, Sparkles, Moon, Sun, Target, Zap, Trophy, Flame } from 'lucide-react';
import { soundEngine } from '../../utils/audioSynth';
import { Language } from '../../types/mafia';
import { translations } from '../../utils/translations';

interface SoundboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const SoundboardModal: React.FC<SoundboardModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const soundList = [
    {
      id: 'gong',
      name: 'زنگ آغاز / پایان فاز (Gong)',
      icon: Bell,
      color: 'from-amber-600 to-amber-900',
      action: () => soundEngine.playGong()
    },
    {
      id: 'gunshot',
      name: 'شلیک حذف بازیکن (Gunshot)',
      icon: Target,
      color: 'from-rose-600 to-red-950',
      action: () => soundEngine.playGunshot()
    },
    {
      id: 'dawn',
      name: 'طلوع صبح / بیداری شهر (Dawn)',
      icon: Sun,
      color: 'from-orange-500 to-amber-800',
      action: () => soundEngine.playMorningDawn()
    },
    {
      id: 'night',
      name: 'فضای تعلیق شب (Suspense Drone)',
      icon: Moon,
      color: 'from-indigo-700 to-slate-950',
      action: () => soundEngine.playNightSuspense()
    },
    {
      id: 'accuse',
      name: 'شلیک لیزر اتهام (Accuse Zap)',
      icon: Zap,
      color: 'from-red-500 to-rose-900',
      action: () => soundEngine.playAccuse()
    },
    {
      id: 'tick',
      name: 'تیک‌تاک ثانیه‌شمار (Countdown)',
      icon: Flame,
      color: 'from-yellow-600 to-neutral-900',
      action: () => soundEngine.playTick()
    },
    {
      id: 'victory',
      name: 'مارش پیروزی (Victory Fanfare)',
      icon: Trophy,
      color: 'from-emerald-600 to-teal-950',
      action: () => soundEngine.playVictory()
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{t.soundboard}</h3>
              <p className="text-xs text-neutral-400">سنتز صوتی اختصاصی Web Audio برای افکت‌های زنده گرداننده</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sound buttons grid */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
          {soundList.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-br ${item.color} text-white font-bold text-xs sm:text-sm text-right hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg border border-white/10`}
              >
                <div className="w-9 h-9 rounded-lg bg-black/30 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="leading-snug">{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950/40 text-center text-xs text-neutral-500">
          بدون نیاز به دانلود فایل خارجی • کامپایل مستقیم فرکانس‌ها روی پردازنده صوتی دستگاه
        </div>

      </div>
    </div>
  );
};
