import React, { useState, useEffect, useRef } from 'react';
import { 
  Crown, Smartphone, BookOpen, Globe, ArrowLeft, ArrowRight,
  Shield, Users, Sparkles, Check, QrCode, Play, Video, Cloud,
  Search, Bot, Sliders, Volume2, VolumeX, CheckCircle2, ChevronDown, Radio
} from 'lucide-react';
import { Language, RoomState } from '../types/mafia';
import { soundEngine } from '../utils/audioSynth';
import { auth, onAuthStateChanged, User as FirebaseUser } from '../lib/firebase';

interface HomeScreenProps {
  onOpenCreateGame: () => void;
  onOpenJoinGame: () => void;
  onOpenScenarios: () => void;
  onOpenRuleSearch?: () => void;
  onOpenMatrixModal?: () => void;
  onOpenAiScenarioBuilder?: () => void;
  onOpenDualSimulator?: () => void;
  onOpenAuthProfile?: () => void;
  onOpenOnlineMeeting?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  activeRoom?: RoomState | null;
  onReturnToActiveRoom?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenCreateGame,
  onOpenJoinGame,
  onOpenScenarios,
  onOpenRuleSearch,
  onOpenMatrixModal,
  onOpenAiScenarioBuilder,
  onOpenDualSimulator,
  onOpenAuthProfile,
  onOpenOnlineMeeting,
  isMuted = false,
  onToggleMute,
  language,
  onSelectLanguage,
  activeRoom,
  onReturnToActiveRoom
}) => {
  const isEn = language === 'en';
  const isRtl = language !== 'en';
  const Arrow = isEn ? ArrowRight : ArrowLeft;

  // Single-Icon Language Selector State & Ref
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // User auth state for Google Play & Cloud profile
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsub();
  }, []);

  // Close language popup on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    if (isLangMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLangMenuOpen]);

  const languages: { code: Language; label: string; short: string; flag: string }[] = [
    { code: 'fa', label: 'فارسی', short: 'FA', flag: '🇮🇷' },
    { code: 'en', label: 'English', short: 'EN', flag: '🇬🇧' },
    { code: 'ar', label: 'العربية', short: 'AR', flag: '🇸🇦' },
    { code: 'tr', label: 'Türkçe', short: 'TR', flag: '🇹🇷' }
  ];

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  return (
    <div 
      className="min-h-screen bg-[#090b11] text-slate-100 flex flex-col justify-between p-3.5 sm:p-6 select-none overflow-x-hidden font-sans" 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* 1. Ultra-Compact, Minimal Glass Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between gap-3 py-2 px-3 sm:px-4 rounded-2xl bg-[#0f121d]/85 border border-white/10 backdrop-blur-xl shadow-2xl shrink-0">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-[1px] shadow-md shadow-amber-500/25 shrink-0 animate-float">
            <div className="w-full h-full bg-[#0a0c14] rounded-[11px] flex items-center justify-center text-lg">
              🎭
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-black tracking-tight text-white truncate">
                {isEn ? 'Mafia OS' : 'سیستم‌عامل مافیا'}
              </h1>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30 shrink-0">
                PRO ✨
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate hidden xs:block">
              {isEn ? 'Smart Tournament Host Console & Player Client' : 'کنسول هوشمند مسابقات و میز بازی مافیا'}
            </p>
          </div>
        </div>

        {/* Compact Right Controls Hub */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Google Play / Cloud Sync Button */}
          {onOpenAuthProfile && (
            <button
              id="btn-home-google-auth"
              onClick={() => {
                soundEngine.playTick();
                onOpenAuthProfile();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 text-xs font-bold transition-all cursor-pointer group active:scale-95"
              title={authUser ? (isEn ? 'Google Account Connected' : 'حساب گوگل متصل است') : (isEn ? 'Sign in with Google / Google Play' : 'ورود با گوگل پلی و ذخیره ابری')}
            >
              {authUser?.photoURL ? (
                <img 
                  src={authUser.photoURL} 
                  alt="Google Avatar" 
                  className="w-4 h-4 rounded-full border border-amber-400/50 object-cover shrink-0" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              )}
              <span className="hidden sm:inline text-[11px]">
                {authUser ? (isEn ? 'Google Synced' : 'گوگل متصل') : (isEn ? 'Google Play' : 'گوگل پلی')}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${authUser ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </button>
          )}

          {/* Google Meet Online Room Button */}
          {onOpenOnlineMeeting && (
            <button
              id="btn-home-google-meet"
              onClick={() => {
                soundEngine.playTick();
                onOpenOnlineMeeting();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/25 text-xs font-bold transition-all cursor-pointer active:scale-95"
              title={isEn ? 'Online Video Play via Google Meet' : 'بازی آنلاین ویدیویی با Google Meet'}
            >
              <Video className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="hidden md:inline text-[11px]">{isEn ? 'Google Meet' : 'گوگل میت'}</span>
            </button>
          )}

          {/* Sound Toggle */}
          {onToggleMute && (
            <button
              onClick={() => {
                soundEngine.playTick();
                onToggleMute();
              }}
              className="p-1.5 sm:px-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 transition-all cursor-pointer active:scale-95"
              title={isMuted ? (isEn ? 'Unmute Sound' : 'فعال‌سازی صدا') : (isEn ? 'Mute Sound' : 'قطع صدا')}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
            </button>
          )}

          {/* SINGLE ICON Language Switcher */}
          <div className="relative" ref={langMenuRef}>
            <button
              id="btn-single-icon-language"
              onClick={() => {
                soundEngine.playTick();
                setIsLangMenuOpen(!isLangMenuOpen);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 transition-all cursor-pointer text-xs font-bold active:scale-95"
              title={isEn ? 'Change Language' : 'تغییر زبان'}
              aria-label="Language Selector"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[10px] font-mono uppercase text-amber-300 font-extrabold">{currentLangObj.short}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Language Popover Dropdown */}
            {isLangMenuOpen && (
              <div 
                className={`absolute top-full mt-2 w-44 bg-[#121624] border border-amber-500/30 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl ${
                  isRtl ? 'left-0 sm:left-auto sm:right-0' : 'right-0 sm:right-auto sm:left-0'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400 px-2 py-1 border-b border-white/5 mb-1">
                  {isEn ? 'Select Interface Language' : 'انتخاب زبان برنامه'}
                </div>
                <div className="space-y-0.5">
                  {languages.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        soundEngine.playTick();
                        onSelectLanguage(item.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        language === item.code
                          ? 'bg-amber-500 text-black font-black shadow-sm'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{item.flag}</span>
                        <span>{item.label}</span>
                      </span>
                      {language === item.code && <Check className="w-3.5 h-3.5 text-black" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="max-w-5xl mx-auto w-full my-auto py-3 sm:py-5 space-y-4 sm:space-y-5">
        
        {/* Playful Minimal Hero Greeting */}
        <div className="text-center pt-1 pb-1 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-amber-300 shadow-sm">
            <span className="text-sm">🍿</span>
            <span>{isEn ? 'Smart Mafia Game Night OS' : 'دورهمی هوشمند و حرفه‌ای مافیا'}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{isEn ? 'Minimal & Fast' : 'ساده، باحال و بی‌نقص ✨'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            {isEn ? 'Run Flawless Mafia Nights 🎭' : 'بازی مافیا؛ فوق‌العاده باحال و روون 🎭'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            {isEn
              ? 'Smart referee console, instant QR sync for players, anti-peeking secret cards, and live voting.'
              : 'کنسول همه‌کاره گرداننده، کارت‌های محرمانه با قفل ضددید روی گوشی بازیکنان، و رأی‌گیری همگام.'}
          </p>
        </div>

        {/* Active Game Alert Banner (Ultra-compact 1-line bar) */}
        {activeRoom && onReturnToActiveRoom && (
          <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-between gap-3 shadow-lg shadow-amber-500/5 animate-in fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-black text-amber-300 truncate">
                  {isEn ? 'Match in Progress' : 'مسابقه فعال در حافظه'}
                </div>
                <div className="text-[11px] text-slate-300 font-mono truncate">
                  {isEn ? `Room: ${activeRoom.roomId} • Phase: ${activeRoom.phase}` : `اتاق: ${activeRoom.roomId} • فاز: ${activeRoom.phase}`}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                soundEngine.playGong();
                onReturnToActiveRoom();
              }}
              className="shrink-0 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <span>{isEn ? 'Return to Room' : 'بازگشت به بازی'}</span>
              <Arrow className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 2 Core Main Doors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          
          {/* Door 1: Create / Host Game */}
          <button
            id="btn-home-create-game"
            onClick={() => {
              soundEngine.playGong();
              onOpenCreateGame();
            }}
            className="group p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#161a29] via-[#101320] to-[#0b0d16] border border-amber-500/30 hover:border-amber-400 text-right transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/15 flex flex-col justify-between cursor-pointer relative overflow-hidden active:scale-[0.98]"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors pointer-events-none" />
            
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all shadow-md shrink-0">
                👑
              </div>
              <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/15 border border-amber-500/25 px-2.5 py-1 rounded-full">
                {isEn ? 'Host (God) Console' : 'کنسول گرداننده (گاد)'}
              </span>
            </div>

            <div className="space-y-2 text-right">
              <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                <span>{isEn ? 'Host Game' : '۱. ساخت و مدیریت بازی'}</span>
                <span className="text-xs text-amber-400/80 font-normal">✨</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isEn 
                  ? 'Select scenario, auto-balance roles, speech timer, night order checklist, and live referee tools.' 
                  : 'انتخاب سناریو، بالانس هوشمند نقش‌ها، تایمر صوتی صحبت، استعلام شب و ابزارهای داوری.'}
              </p>
              {/* Cute mini feature tags */}
              <div className="flex items-center gap-2 text-[10px] text-amber-300/80 pt-1 font-semibold">
                <span>⏱️ تایمر صوتی</span>
                <span>·</span>
                <span>🌙 استعلام شب</span>
                <span>·</span>
                <span>⚖️ بالانس خودکار</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-black text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>{isEn ? 'Launch Host Room' : 'ورود و راه‌اندازی مسابقه'}</span>
              <Arrow className="w-4 h-4" />
            </div>
          </button>

          {/* Door 2: Join Game */}
          <button
            id="btn-home-join-game"
            onClick={() => {
              soundEngine.playTick();
              onOpenJoinGame();
            }}
            className="group p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#10201d] via-[#0b1715] to-[#07100e] border border-emerald-500/30 hover:border-emerald-400 text-right transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/15 flex flex-col justify-between cursor-pointer relative overflow-hidden active:scale-[0.98]"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />
            
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-black transition-all shadow-md shrink-0">
                📱
              </div>
              <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-1 rounded-full">
                {isEn ? 'Player Seat' : 'گوشی بازیکن'}
              </span>
            </div>

            <div className="space-y-2 text-right">
              <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                <span>{isEn ? 'Join Game' : '۲. ورود با کد یا اسکن QR'}</span>
                <span className="text-xs text-emerald-400/80 font-normal">🚀</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isEn
                  ? 'Scan table QR code, see secret role with anti-peek stealth mask, request challenge time, and vote live.'
                  : 'اسکن سریع بارکد اتاق، دیدن کارت نقش با قفل ضددید، درخواست وقت چالش و رأی‌گیری زنده.'}
              </p>
              {/* Cute mini feature tags */}
              <div className="flex items-center gap-2 text-[10px] text-emerald-300/80 pt-1 font-semibold">
                <span>🕶️ کارت محرمانه</span>
                <span>·</span>
                <span>⚡ درخواست چالش</span>
                <span>·</span>
                <span>🗳️ رأی‌گیری آنلاین</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-black text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>{isEn ? 'Enter Code or Camera Scan' : 'اتصال به صندلی بازی'}</span>
              <Arrow className="w-4 h-4" />
            </div>
          </button>

        </div>

        {/* 3. Quick-Access Bento Grid */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 px-1 mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? 'Quick Tool Suite & Tournament Details' : 'جعبه‌ابزار باحال و دسترسی سریع به امکانات'}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium">{isEn ? 'Tap to explore' : 'یک لمس ساده ✨'}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
            
            {/* Tile 1: 17 Scenarios & Clash Matrix */}
            <button
              onClick={() => {
                soundEngine.playTick();
                onOpenScenarios();
              }}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-cyan-500/40 text-right transition-all flex flex-col justify-between gap-2.5 group cursor-pointer active:scale-95"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform text-lg shrink-0">
                📜
              </div>
              <div>
                <div className="text-xs font-black text-white group-hover:text-cyan-300 truncate">
                  {isEn ? '17 Scenarios' : '۱۷ سناریو'}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {isEn ? 'Rules & Matrix' : 'پدرخوانده، زودیاک...'}
                </div>
              </div>
            </button>

            {/* Tile 2: Google Meet Online Call & Sync */}
            <button
              onClick={() => {
                soundEngine.playTick();
                if (onOpenOnlineMeeting) onOpenOnlineMeeting();
              }}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-teal-500/40 text-right transition-all flex flex-col justify-between gap-2.5 group cursor-pointer active:scale-95"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform text-lg shrink-0">
                📹
              </div>
              <div>
                <div className="text-xs font-black text-white group-hover:text-teal-300 truncate">
                  {isEn ? 'Google Meet' : 'گوگل میت آنلاین'}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {isEn ? 'Video & Voice Sync' : 'مکالمه همگام با بازی'}
                </div>
              </div>
            </button>

            {/* Tile 3: Rule Search & Disciplinary Code */}
            <button
              onClick={() => {
                soundEngine.playTick();
                if (onOpenRuleSearch) onOpenRuleSearch();
              }}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-amber-500/40 text-right transition-all flex flex-col justify-between gap-2.5 group cursor-pointer active:scale-95"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform text-lg shrink-0">
                🔎
              </div>
              <div>
                <div className="text-xs font-black text-white group-hover:text-amber-300 truncate">
                  {isEn ? 'Rulebook Search' : 'جستجوی قوانین'}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {isEn ? 'FAQ & Disciplinary' : 'آیین‌نامه و شبهات'}
                </div>
              </div>
            </button>

            {/* Tile 4: AI Scenario Builder */}
            <button
              onClick={() => {
                soundEngine.playTick();
                if (onOpenAiScenarioBuilder) onOpenAiScenarioBuilder();
              }}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-purple-500/40 text-right transition-all flex flex-col justify-between gap-2.5 group cursor-pointer active:scale-95"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform text-lg shrink-0">
                🤖
              </div>
              <div>
                <div className="text-xs font-black text-white group-hover:text-purple-300 truncate">
                  {isEn ? 'AI Builder' : 'طراح هوشمند AI'}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {isEn ? 'Scenario Balance' : 'تحلیل بالانس نقش‌ها'}
                </div>
              </div>
            </button>

            {/* Tile 5: Dual Simulator */}
            <button
              onClick={() => {
                soundEngine.playTick();
                if (onOpenDualSimulator) onOpenDualSimulator();
              }}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-indigo-500/40 text-right transition-all flex flex-col justify-between gap-2.5 group cursor-pointer active:scale-95"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform text-lg shrink-0">
                🎮
              </div>
              <div>
                <div className="text-xs font-black text-white group-hover:text-indigo-300 truncate">
                  {isEn ? 'Dual Simulator' : 'شبیه‌ساز مسابقه'}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {isEn ? 'Host + Player live' : 'تست همزمان دو پنل'}
                </div>
              </div>
            </button>

            {/* Tile 6: Google Play & Cloud Saves */}
            <button
              onClick={() => {
                soundEngine.playTick();
                if (onOpenAuthProfile) onOpenAuthProfile();
              }}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-amber-500/40 text-right transition-all flex flex-col justify-between gap-2.5 group cursor-pointer active:scale-95"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform text-lg shrink-0">
                ☁️
              </div>
              <div>
                <div className="text-xs font-black text-white group-hover:text-amber-300 truncate">
                  {isEn ? 'Cloud & Saves' : 'ذخیره ابری گوگل'}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {isEn ? 'Firestore sync' : 'پشتیبان مسابقات'}
                </div>
              </div>
            </button>

          </div>
        </div>

        {/* 4. Feature Highlights (Clean unboxed text metadata with separators) */}
        <div className="py-2.5 px-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center justify-center sm:justify-between gap-3 text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🕶️</span>
            <span>{isEn ? 'Anti-Peeking Stealth Privacy Filter' : 'حفاظت محرمانه دید کارت با قفل دیجیتال'}</span>
          </div>
          <span className="hidden sm:inline text-slate-700">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">⚡</span>
            <span>{isEn ? 'Real-Time SSE Sync & Offline Resilient' : 'همگام‌سازی بلادرنگ رویدادها و تایمر هماهنگ'}</span>
          </div>
          <span className="hidden sm:inline text-slate-700">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🏆</span>
            <span>{isEn ? 'Official 10-21 Player Tournament Ready' : 'پشتیبانی از مسابقات ۱۰ تا ۲۱ نفره رسمی'}</span>
          </div>
        </div>

      </main>

      {/* 5. Minimalist Footer */}
      <footer className="max-w-5xl mx-auto w-full py-2.5 text-center border-t border-white/5 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-1.5 shrink-0">
        <span>
          {isEn 
            ? 'Mafia God Tournament Operating System • Official Version' 
            : 'سیستم‌عامل داوری و مسابقات مافیا • نگارش رسمی و هوشمند'}
        </span>
        <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Google Play & Meet Ready</span>
          </span>
          <span>v2.5.0</span>
        </div>
      </footer>

    </div>
  );
};
