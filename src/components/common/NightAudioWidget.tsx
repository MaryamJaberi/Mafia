import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Moon, Music, Sliders } from 'lucide-react';
import { soundEngine } from '../../utils/audioSynth';
import { Language } from '../../types/mafia';
import { translations, isRtlLanguage } from '../../utils/translations';

interface NightAudioWidgetProps {
  isNightPhase?: boolean;
  className?: string;
  language?: Language;
}

export const NightAudioWidget: React.FC<NightAudioWidgetProps> = ({
  isNightPhase = false,
  className = '',
  language = 'fa'
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());
  const [volume, setVolume] = useState<number>(soundEngine.getNightVolume() * 100);
  const [isNightActive, setIsNightActive] = useState<boolean>(soundEngine.getIsNightPlaying());
  const [showSlider, setShowSlider] = useState<boolean>(false);

  const t = translations[language] || translations.fa;
  const isRtl = isRtlLanguage(language);

  // Synchronize when game phase enters/exits night
  useEffect(() => {
    if (isNightPhase && !isMuted) {
      soundEngine.startNightAmbiance(volume / 100);
      setIsNightActive(true);
    } else if (!isNightPhase && isNightActive) {
      soundEngine.stopNightAmbiance();
      setIsNightActive(false);
    }
  }, [isNightPhase, isMuted]);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
    if (nextMuted) {
      setIsNightActive(false);
    } else if (isNightPhase) {
      soundEngine.startNightAmbiance(volume / 100);
      setIsNightActive(true);
    }
  };

  const handleManualPlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isNightActive) {
      soundEngine.stopNightAmbiance();
      setIsNightActive(false);
    } else {
      if (isMuted) {
        setIsMuted(false);
        soundEngine.setMuted(false);
      }
      soundEngine.startNightAmbiance(volume / 100);
      setIsNightActive(true);
    }
  };

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    soundEngine.setNightVolume(newVal / 100);
    if (newVal > 0 && isMuted) {
      setIsMuted(false);
      soundEngine.setMuted(false);
    }
  };

  return (
    <div className={`relative flex items-center gap-1.5 ${className}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Ambient Play / Mute Badge */}
      <div 
        onClick={() => setShowSlider(!showSlider)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all cursor-pointer select-none ${
          isNightActive
            ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/30'
            : isMuted
            ? 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
            : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:border-white/20'
        }`}
        title={t.nightAmbianceSettings || (language === 'en' ? 'Night ambiance settings' : 'تنظیمات موسیقی ملایم شب')}
      >
        <button
          onClick={handleToggleMute}
          className="hover:scale-110 transition-transform p-0.5 cursor-pointer"
          title={isMuted ? (t.unmuteDevice || 'فعال‌سازی صدا') : (t.muteDevice || 'بی‌صدا کردن این دستگاه')}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className={`w-4 h-4 ${isNightActive ? 'text-indigo-400 animate-pulse' : 'text-slate-300'}`} />
          )}
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold">
          <Moon className={`w-3.5 h-3.5 ${isNightActive ? 'text-indigo-400' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">
            {isNightActive 
              ? (t.nightAmbiancePlaying || 'موسیقی ملایم شب (در حال پخش)') 
              : isMuted 
              ? (t.nightAmbianceMuted || 'صدا بی‌صدا') 
              : (t.nightAmbiance || 'آهنگ شب')}
          </span>
        </div>

        {/* Animated wave bars if playing */}
        {isNightActive && !isMuted && (
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 h-full bg-indigo-400 animate-bounce rounded-full" style={{ animationDelay: '0ms' }} />
            <span className="w-0.5 h-2/3 bg-indigo-300 animate-bounce rounded-full" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 h-4/5 bg-indigo-400 animate-bounce rounded-full" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Floating Popover Volume Slider */}
      {showSlider && (
        <div 
          className={`absolute top-full mt-2 ${isRtl ? 'right-0' : 'left-0 sm:right-0 sm:left-auto'} z-50 bg-[#12141c] border border-white/15 rounded-2xl p-3 shadow-2xl min-w-[200px] space-y-2.5 animate-fadeIn`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold border-b border-white/10 pb-1.5">
            <span>{t.deviceVolume || 'ولوم صدای این دستگاه'}</span>
            <span className="font-mono text-amber-400">{Math.round(volume)}%</span>
          </div>

          <div className="flex items-center gap-2">
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={e => handleVolumeChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <button
              onClick={handleManualPlayToggle}
              className={`w-full py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                isNightActive 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isNightActive 
                ? (t.stopAmbiance || 'توقف پخش ملودی') 
                : (t.testAmbiance || 'پخش آزمایشی ملودی شب')}
            </button>
          </div>

          <p className="text-[10px] text-slate-500 text-center">
            {t.volumeLocalOnly || 'تغییر ولوم یا بی‌صدا کردن فقط روی این دستگاه اعمال می‌شود.'}
          </p>
        </div>
      )}
    </div>
  );
};
