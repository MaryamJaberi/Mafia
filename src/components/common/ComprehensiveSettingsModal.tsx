import React, { useState } from 'react';
import { 
  X, Sliders, Volume2, VolumeX, Moon, Sun, Smartphone, 
  RotateCcw, Sparkles, Check, Globe, HelpCircle, Shield, Music,
  Bell, Eye, EyeOff, LayoutTemplate, Layers, Cpu, Award, Bug, Terminal, Wrench
} from 'lucide-react';
import { Language } from '../../types/mafia';
import { HostSettings, defaultSettings } from '../../utils/storage';
import { soundEngine } from '../../utils/audioSynth';
import { bugTracker } from '../../utils/bugTracker';

export interface ExtendedAppSettings extends HostSettings {
  showGodGuidance: boolean;
  autoPlayNightAmbiance: boolean;
  enableVibration: boolean;
  defaultDaySpeechTime: number;
  defaultChallengeTime: number;
  defaultDefenseTime: number;
  enableAIAssistant: boolean;
  enableNightWhisperMode: boolean;
  enableSoundEffects: boolean;
  enableAccusationLiveGraph: boolean;
}

interface ComprehensiveSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  settings: ExtendedAppSettings;
  onSaveSettings: (newSettings: ExtendedAppSettings) => void;
  onResetToDefaults: () => void;
  onOpenBugReport?: () => void;
}

export const ComprehensiveSettingsModal: React.FC<ComprehensiveSettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  settings,
  onSaveSettings,
  onResetToDefaults,
  onOpenBugReport
}) => {
  const [localSettings, setLocalSettings] = useState<ExtendedAppSettings>(settings);
  const [activeCategory, setActiveCategory] = useState<'GENERAL' | 'TIMERS' | 'GOD_ASSIST' | 'AUDIO_VISUAL' | 'DIAGNOSTICS'>('GENERAL');

  React.useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof ExtendedAppSettings) => {
    soundEngine.playTick();
    const updated = {
      ...localSettings,
      [key]: !localSettings[key]
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleNumberChange = (key: keyof ExtendedAppSettings, delta: number, min = 10, max = 300) => {
    soundEngine.playTick();
    const current = (localSettings[key] as number) || 60;
    const next = Math.min(max, Math.max(min, current + delta));
    const updated = {
      ...localSettings,
      [key]: next
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleLangSelect = (lang: Language) => {
    soundEngine.playTick();
    onLanguageChange(lang);
    const updated = { ...localSettings, language: lang };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const isFa = language === 'fa';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-hidden animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0d0d16] border border-amber-500/35 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 bg-[#131320] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-2">
                <span>{isFa ? 'تنظیمات جامع اپلیکیشن و پنل گرداننده' : 'Comprehensive App & Host Settings'}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {isFa 
                  ? 'شخصی‌سازی زبان، زمان‌سنج‌ها، راهنمای گام‌به‌گام خدا، صداها و قابلیت‌های هوشمند' 
                  : 'Customize language, timers, step-by-step God guidance, audio, and AI features'}
              </p>
            </div>
          </div>

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

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-2 bg-[#09090e] border-b border-white/10 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveCategory('GENERAL')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'GENERAL'
                ? 'bg-amber-500 text-black font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isFa ? 'زبان و عمومی' : 'General & Language'}</span>
          </button>

          <button
            onClick={() => setActiveCategory('GOD_ASSIST')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'GOD_ASSIST'
                ? 'bg-amber-500 text-black font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isFa ? 'راهنمای گام‌به‌گام خدا' : 'God Guidance Assistant'}</span>
          </button>

          <button
            onClick={() => setActiveCategory('TIMERS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'TIMERS'
                ? 'bg-amber-500 text-black font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isFa ? 'زمان‌سنج‌ها و تایمرها' : 'Timers & Clocks'}</span>
          </button>

          <button
            onClick={() => setActiveCategory('AUDIO_VISUAL')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'AUDIO_VISUAL'
                ? 'bg-amber-500 text-black font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isFa ? 'صدا و افکت‌ها' : 'Audio & Ambiance'}</span>
          </button>

          <button
            onClick={() => setActiveCategory('DIAGNOSTICS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'DIAGNOSTICS'
                ? 'bg-rose-500 text-white font-black shadow-md'
                : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>{isFa ? 'گزارش باگ و عیب‌یابی' : 'Bug Report & Diagnostics'}</span>
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* CATEGORY 1: GENERAL & LANGUAGE */}
          {activeCategory === 'GENERAL' && (
            <div className="space-y-4">
              
              {/* Language Selector */}
              <div className="p-4 rounded-2xl bg-[#131322] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-slate-100">{isFa ? 'زبان برنامه (Application Language)' : 'App Language'}</span>
                  </div>
                  <span className="text-xs text-amber-400 font-mono font-bold uppercase">{language}</span>
                </div>
                <p className="text-xs text-slate-400">
                  {isFa ? 'زبان رابط کاربری، متن کارت‌ها، تله‌پروپمتر خدا و گزارش‌ها را انتخاب کنید.' : 'Choose the language for UI, cards, God scripts, and logs.'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { id: 'fa', label: 'فارسی (Persian)', icon: '🇮🇷' },
                    { id: 'en', label: 'English', icon: '🇬🇧' },
                    { id: 'ar', label: 'العربية (Arabic)', icon: '🇸🇦' },
                    { id: 'tr', label: 'Türkçe (Turkish)', icon: '🇹🇷' }
                  ].map(langItem => (
                    <button
                      key={langItem.id}
                      onClick={() => handleLangSelect(langItem.id as Language)}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        language === langItem.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{langItem.icon}</span>
                        <span>{langItem.label}</span>
                      </span>
                      {language === langItem.id && <Check className="w-4 h-4 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI & Automation Features */}
              <div className="p-4 rounded-2xl bg-[#131322] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-bold text-slate-100">{isFa ? 'روزنامه‌نگار و هوش مصنوعی صبحگاهی' : 'Morning AI Journalist'}</span>
                  </div>
                  <button
                    onClick={() => handleToggle('enableAIAssistant')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      localSettings.enableAIAssistant ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-transform ${
                      localSettings.enableAIAssistant ? (isFa ? 'left-1' : 'right-1') : (isFa ? 'right-1' : 'left-1')
                    }`} />
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  {isFa ? 'تولید خودکار داستان ژورنالیستی و جذاب از وقایع شب گذشته برای خواندن خدا اول صبح.' : 'Auto-generates cinematic morning news chronicles after each night.'}
                </p>
              </div>

              {/* Live Network & Accusation Graph Engine */}
              <div className="p-4 rounded-2xl bg-[#131322] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-bold text-slate-100">{isFa ? 'محاسبه زنده گراف شبکه‌ای اتهامات' : 'Live Accusation Graph'}</span>
                  </div>
                  <button
                    onClick={() => handleToggle('enableAccusationLiveGraph')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      localSettings.enableAccusationLiveGraph ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-transform ${
                      localSettings.enableAccusationLiveGraph ? (isFa ? 'left-1' : 'right-1') : (isFa ? 'right-1' : 'left-1')
                    }`} />
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  {isFa ? 'ترسیم بردارها و گره‌های ارتباطی بازیکنان در هر لحظه از بازی.' : 'Calculates directed accusation vectors and conflict clusters in real-time.'}
                </p>
              </div>

            </div>
          )}

          {/* CATEGORY 2: GOD GUIDANCE & TELEPROMPTER */}
          {activeCategory === 'GOD_ASSIST' && (
            <div className="space-y-4">
              
              {/* Toggle God Guidance Visibility */}
              <div className="p-4 rounded-2xl bg-[#131322] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-slate-100">{isFa ? 'نمایش تله‌پروپمتر و راهنمای مرحله‌به‌مرحله خدا' : 'Show God Step-by-Step Guidance'}</span>
                  </div>
                  <button
                    onClick={() => handleToggle('showGodGuidance')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      localSettings.showGodGuidance ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-transform ${
                      localSettings.showGodGuidance ? (isFa ? 'left-1' : 'right-1') : (isFa ? 'right-1' : 'left-1')
                    }`} />
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isFa 
                    ? 'در هر فاز بازی (شب، نطق روز، اتهام، دفاع، رأی‌گیری و وصیت)، دقیقاً متنی که باید بخوانید، کاری که باید از بازیکنان بخواهید و زمان پایان فاز را جلوی چشمان شما قرار می‌دهد.'
                    : 'Shows exact announcements, player demands, and phase completion criteria for each game stage.'}
                </p>
              </div>

              {/* Night Whisper / Discreet Mode */}
              <div className="p-4 rounded-2xl bg-[#131322] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-bold text-slate-100">{isFa ? 'حالت نجوا و تم تاریک ویژه شب (Night Whisper)' : 'Night Discreet Whisper Theme'}</span>
                  </div>
                  <button
                    onClick={() => handleToggle('enableNightWhisperMode')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      localSettings.enableNightWhisperMode ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-transform ${
                      localSettings.enableNightWhisperMode ? (isFa ? 'left-1' : 'right-1') : (isFa ? 'right-1' : 'left-1')
                    }`} />
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  {isFa ? 'نور صفحه نمایش را در فاز شب به حداقل می‌رساند تا سایه نور روی صورت بازیکنان نیفتد.' : 'Dims screen and reduces glare during night phases so players cannot detect light shifts.'}
                </p>
              </div>

            </div>
          )}

          {/* CATEGORY 3: TIMERS */}
          {activeCategory === 'TIMERS' && (
            <div className="space-y-4">
              
              {/* Day Speech Timer */}
              <div className="p-4 rounded-2xl bg-[#131322] border border-white/10 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{isFa ? 'مدت نطق اصلی روز' : 'Main Day Speech Duration'}</h4>
                  <p className="text-xs text-slate-400">{isFa ? 'زمان استاندارد صحبت هر بازیکن در نوبت روز' : 'Standard time per speaking turn'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNumberChange('defaultDaySpeechTime', -10, 20, 180)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-amber-400 text-sm min-w-[50px] text-center">
                    {localSettings.defaultDaySpeechTime || 60} {isFa ? 'ثانیه' : 's'}
                  </span>
                  <button
                    onClick={() => handleNumberChange('defaultDaySpeechTime', 10, 20, 180)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Challenge Timer */}
              <div className="p-4 rounded-2xl bg-[#131322] border border-white/10 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{isFa ? 'مدت زمان وقت چالش' : 'Challenge Time Duration'}</h4>
                  <p className="text-xs text-slate-400">{isFa ? 'زمان صحبت بازیکن درخواست‌کننده چالش' : 'Time for requested challenges'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNumberChange('defaultChallengeTime', -5, 10, 90)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-amber-400 text-sm min-w-[50px] text-center">
                    {localSettings.defaultChallengeTime || 30} {isFa ? 'ثانیه' : 's'}
                  </span>
                  <button
                    onClick={() => handleNumberChange('defaultChallengeTime', 5, 10, 90)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Defense Timer */}
              <div className="p-4 rounded-2xl bg-[#131322] border border-white/10 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{isFa ? 'مدت زمان دفاعیه دادگاه' : 'Court Defense Duration'}</h4>
                  <p className="text-xs text-slate-400">{isFa ? 'زمان دفاع متهمان راه‌یافته به مرحله اتهامات' : 'Time allowed for suspects on the stand'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNumberChange('defaultDefenseTime', -5, 15, 120)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-amber-400 text-sm min-w-[50px] text-center">
                    {localSettings.defaultDefenseTime || 45} {isFa ? 'ثانیه' : 's'}
                  </span>
                  <button
                    onClick={() => handleNumberChange('defaultDefenseTime', 5, 15, 120)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* CATEGORY 4: AUDIO & SOUND FX */}
          {activeCategory === 'AUDIO_VISUAL' && (
            <div className="space-y-4">
              
              {/* Sound Engine Master Mute */}
              <div className="p-4 rounded-2xl bg-[#131322] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-slate-100">{isFa ? 'افکت‌های صوتی و گانگ بازی' : 'Sound Effects & Gong'}</span>
                  </div>
                  <button
                    onClick={() => handleToggle('enableSoundEffects')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      localSettings.enableSoundEffects ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-transform ${
                      localSettings.enableSoundEffects ? (isFa ? 'left-1' : 'right-1') : (isFa ? 'right-1' : 'left-1')
                    }`} />
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  {isFa ? 'پخش صدای گانگ ورود به فازها، تیک‌تاک پایان زمان صحبت و بوق هشدار.' : 'Plays synthesizer gongs, ticking countdowns, and warning beeps.'}
                </p>
              </div>

              {/* Auto Night Ambiance Generator */}
              <div className="p-4 rounded-2xl bg-[#131322] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-bold text-slate-100">{isFa ? 'پخش خودکار نویز سفید و موسیقی شب' : 'Auto Night Noise Ambiance'}</span>
                  </div>
                  <button
                    onClick={() => handleToggle('autoPlayNightAmbiance')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      localSettings.autoPlayNightAmbiance ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-transform ${
                      localSettings.autoPlayNightAmbiance ? (isFa ? 'left-1' : 'right-1') : (isFa ? 'right-1' : 'left-1')
                    }`} />
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  {isFa ? 'پخش صدای ملایم محیطی در فاز شب برای جلوگیری از شنیده شدن صدای حرکت بازیکنان.' : 'Plays ambient background noise during night to mask room movement sounds.'}
                </p>
              </div>

            </div>
          )}

          {/* CATEGORY 5: DIAGNOSTICS & BUG REPORTING */}
          {activeCategory === 'DIAGNOSTICS' && (
            <div className="space-y-4">
              
              {/* Quick Bug Report Trigger Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bug className="w-5 h-5 text-rose-400" />
                    <div>
                      <span className="text-sm font-black text-rose-300 block">
                        {isFa ? 'سامانه خودکار ارسال باگ و خرابی' : 'Automatic Bug & Crash Telemetry'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {isFa ? 'ثبت خطاها، انجماد بازی یا ناهماهنگی در سناریو' : 'Captures freezes, logic faults, and runtime crashes'}
                      </span>
                    </div>
                  </div>
                  {onOpenBugReport && (
                    <button
                      onClick={() => {
                        soundEngine.playTick();
                        onClose();
                        onOpenBugReport();
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-extrabold text-xs shadow-md shadow-rose-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Bug className="w-3.5 h-3.5" />
                      <span>{isFa ? 'باز کردن فرم گزارش باگ' : 'Open Bug Reporter'}</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isFa 
                    ? 'سامانه هنگام بروز هرگونه خطای جاوااسکریپت یا گیر کردن تایمر، اطلاعات بازی را برای توسعه‌دهنده ارسال می‌کند تا در ریلیزهای بعدی بدون نیاز به توضیح فنی برطرف شود.' 
                    : 'System automatically logs runtime faults and stalls to the telemetry queue for upcoming releases.'}
                </p>
              </div>

              {/* Diagnostic Logs Counter & Info */}
              <div className="p-4 rounded-2xl bg-[#131322] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    {isFa ? 'وضعیت بافر لاگ‌های تشخیصی:' : 'Diagnostic Logs Buffer:'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                    {bugTracker.getRecentLogs().length} لاگ فعال
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isFa ? 'تمامی خطاهای کنسول و شبکه به صورت خودکار در حافظه کلاینت و سرور ذخیره می‌شوند.' : 'All runtime exceptions and telemetry events are indexed in client & server buffer.'}
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#131320] flex items-center justify-between">
          <button
            onClick={() => {
              soundEngine.playTick();
              onResetToDefaults();
              setLocalSettings({
                ...defaultSettings,
                showGodGuidance: true,
                autoPlayNightAmbiance: true,
                enableVibration: true,
                defaultDaySpeechTime: 60,
                defaultChallengeTime: 30,
                defaultDefenseTime: 45,
                enableAIAssistant: true,
                enableNightWhisperMode: false,
                enableSoundEffects: true,
                enableAccusationLiveGraph: true
              });
            }}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isFa ? 'بازنشانی به پیش‌فرض' : 'Reset Defaults'}</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playGong();
              onSaveSettings(localSettings);
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Check className="w-4 h-4" />
            <span>{isFa ? 'ذخیره و اعمال تنظیمات' : 'Save & Apply'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
