import React from 'react';
import { Crown, Smartphone, Sparkles, Layers, ArrowRight, Video, Globe, CheckSquare } from 'lucide-react';
import { soundEngine } from '../../utils/audioSynth';
import { Language } from '../../types/mafia';

interface WelcomeChoiceModalProps {
  isOpen: boolean;
  onCreateGame: () => void;
  onJoinGame: () => void;
  onOpenMatrix?: () => void;
  onOpenAiStudio?: () => void;
  onOpenRoleGuide?: () => void;
  onOpenOnlineMeeting?: () => void;
  onOpenUserStories?: () => void;
  language?: Language;
  onSelectLanguage?: (lang: Language) => void;
}

export const WelcomeChoiceModal: React.FC<WelcomeChoiceModalProps> = ({
  isOpen,
  onCreateGame,
  onJoinGame,
  onOpenMatrix,
  onOpenAiStudio,
  onOpenOnlineMeeting,
  onOpenUserStories,
  language = 'fa',
  onSelectLanguage
}) => {
  if (!isOpen) return null;

  const isRtl = language !== 'en';

  const strings = {
    fa: {
      title: 'سیستم جامع مسابقه و بازی مافیا',
      subtitle: 'مدیریت زنده مسابقه، ماتریس تقابل نقش‌ها و اتاق صوتی آنلاین',
      question: 'می‌خواهید بازی جدید بسازید یا به عنوان بازیکن وارد شوید؟',
      createGame: 'ساخت بازی جدید',
      hostRole: 'گرداننده / راوی',
      createDesc: 'چیدمان نقش‌ها، بر زدن کارت‌ها، مدیریت نوبت صحبت و موتور شب.',
      createBtn: 'شروع و چیدمان میز',
      joinGame: 'ورود به بازی',
      playerRole: 'بازیکن',
      joinDesc: 'ورود با کد بازی، مشاهده کارت محرمانه و شرکت در چالش و رأی‌گیری.',
      joinBtn: 'پیوستن به بازی',
      openMeeting: 'اتصال به تماس آنلاین (Google Meet / Discord / Jitsi)',
      openMatrix: 'جدول تعاملی سناریوها و تقابل نقش‌ها',
      openAi: 'سناریوساز هوش مصنوعی',
      selectLang: 'زبان بازی:'
    },
    en: {
      title: 'Mafia Operating System',
      subtitle: 'Live Host Controls, Role Matrix & Voice/Video Rooms',
      question: 'Do you want to host a new game or join as a player?',
      createGame: 'Host New Game',
      hostRole: 'Host / Narrator',
      createDesc: 'Configure roles, shuffle seats, control speaking turns and night engine.',
      createBtn: 'Setup & Start Game',
      joinGame: 'Join Game',
      playerRole: 'Player',
      joinDesc: 'Join via room code, reveal private role card, request challenges & vote.',
      joinBtn: 'Join Table',
      openMeeting: 'Online Voice Call (Meet / Discord / Jitsi)',
      openMatrix: 'Interactive Role Clash & Scenarios Matrix',
      openAi: 'AI Scenario Builder',
      selectLang: 'Language:'
    },
    ar: {
      title: 'نظام إدارة ومباريات المافيا الشامل',
      subtitle: 'تحكم مباشر للراوي، جدول تقاطع الأدوار وغرف المحادثة الصوتية',
      question: 'هل ترغب في إنشاء لعبة جديدة أم الانضمام كلاعب؟',
      createGame: 'إنشاء لعبة جديدة',
      hostRole: 'الراوي / المدير',
      createDesc: 'توزيع الأدوار، ترتيب المقاعد، إدارة الأدوار ومحرك الليل.',
      createBtn: 'بدء وتجهيز الطاولة',
      joinGame: 'الدخول إلى اللعبة',
      playerRole: 'لاعب',
      joinDesc: 'الدخول برمز الغرفة، كشف الدور السري والمشاركة في التصويت والتحديات.',
      joinBtn: 'الانضمام للطاولة',
      openMeeting: 'غرفة صوتية أونلاين (Meet / Discord / Jitsi)',
      openMatrix: 'جدول تقاطع الأدوار والسيناريوهات',
      openAi: 'مصمم السيناريو بالذكاء الاصطناعي',
      selectLang: 'لغة اللعبة:'
    },
    tr: {
      title: 'Kapsamlı Mafya Oyun Yönetim Sistemi',
      subtitle: 'Canlı Oyun Yöneticisi, Rol Matrisi ve Sesli Görüşme Odası',
      question: 'Yeni bir oyun kurmak mı yoksa oyuncu olarak katılmak mı istersiniz?',
      createGame: 'Yeni Oyun Kur',
      hostRole: 'Moderatör / Anlatıcı',
      createDesc: 'Rolleri belirleyin, masayı karıştırın, konuşma sürelerini ve geceyi yönetin.',
      createBtn: 'Masayı Kur ve Başlat',
      joinGame: 'Oyuna Katıl',
      playerRole: 'Oyuncu',
      joinDesc: 'Oda koduyla katılın, gizli rolünüzü görün, meydan okuma ve oylamaya katılın.',
      joinBtn: 'Masaya Katıl',
      openMeeting: 'Çevrimiçi Sesli Arama (Meet / Discord / Jitsi)',
      openMatrix: 'Etkileşimli Rol Çatışma Matrisi',
      openAi: 'Yapay Zeka Senaryo Tasarlayıcı',
      selectLang: 'Oyun Dili:'
    }
  }[language] || {
    title: 'سیستم جامع مسابقه و بازی مافیا',
    subtitle: 'مدیریت زنده مسابقه، ماتریس تقابل نقش‌ها و اتاق صوتی آنلاین',
    question: 'می‌خواهید بازی جدید بسازید یا به عنوان بازیکن وارد شوید؟',
    createGame: 'ساخت بازی جدید',
    hostRole: 'گرداننده / راوی',
    createDesc: 'چیدمان نقش‌ها، بر زدن کارت‌ها، مدیریت نوبت صحبت و موتور شب.',
    createBtn: 'شروع و چیدمان میز',
    joinGame: 'ورود به بازی',
    playerRole: 'بازیکن',
    joinDesc: 'ورود با کد بازی، مشاهده کارت محرمانه و شرکت در چالش و رأی‌گیری.',
    joinBtn: 'پیوستن به بازی',
    openMeeting: 'اتصال به تماس آنلاین (Google Meet / Discord / Jitsi)',
    openMatrix: 'جدول تعاملی سناریوها و تقابل نقش‌ها',
    openAi: 'سناریوساز هوش مصنوعی',
    selectLang: 'زبان بازی:'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#0f1015] border border-white/15 rounded-3xl w-full max-w-lg p-5 sm:p-7 shadow-2xl space-y-5 text-center text-white relative overflow-hidden"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Subtle Ambient Border Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-cyan-500 to-indigo-500" />

        {/* Language Selector Bar (Prominent at top) */}
        {onSelectLanguage && (
          <div className="flex items-center justify-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-2xl max-w-sm mx-auto">
            <span className="text-[11px] font-bold text-slate-400 px-1.5 hidden xs:inline">
              <Globe className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
            </span>
            <button
              onClick={() => {
                soundEngine.playTick();
                onSelectLanguage('fa');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                language === 'fa' 
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              🇮🇷 فارسی
            </button>
            <button
              onClick={() => {
                soundEngine.playTick();
                onSelectLanguage('en');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                language === 'en' 
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              🇺🇸 English
            </button>
            <button
              onClick={() => {
                soundEngine.playTick();
                onSelectLanguage('ar');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                language === 'ar' 
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              🇸🇦 العربية
            </button>
            <button
              onClick={() => {
                soundEngine.playTick();
                onSelectLanguage('tr');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                language === 'tr' 
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              🇹🇷 Türkçe
            </button>
          </div>
        )}

        {/* App Title & Subtitle */}
        <div className="space-y-1.5 pt-1">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 items-center justify-center text-2xl shadow-md mb-1">
            🎭
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {strings.title}
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {strings.subtitle}
          </p>
        </div>

        {/* 2 Primary Choice Cards: Host vs Player */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Host / Create Game Option */}
          <button
            onClick={() => {
              soundEngine.playGong();
              onCreateGame();
            }}
            className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#181824] to-[#111118] hover:from-[#202030] hover:to-[#161622] border border-amber-500/30 hover:border-amber-500/60 transition-all flex flex-col items-center text-center space-y-2.5 cursor-pointer shadow-lg hover:shadow-amber-500/10 active:scale-[0.99]"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Crown className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="text-sm sm:text-base font-black text-white flex items-center justify-center gap-1.5">
                <span>{strings.createGame}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                  {strings.hostRole}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {strings.createDesc}
              </p>
            </div>
            <div className="w-full pt-1 flex items-center justify-center gap-1 text-xs font-bold text-amber-400 group-hover:text-amber-300">
              <span>{strings.createBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Join Game Option */}
          <button
            onClick={() => {
              soundEngine.playTick();
              onJoinGame();
            }}
            className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#141520] to-[#0c0d14] hover:from-[#1b1c2a] hover:to-[#12131c] border border-cyan-500/30 hover:border-cyan-500/60 transition-all flex flex-col items-center text-center space-y-2.5 cursor-pointer shadow-lg hover:shadow-cyan-500/10 active:scale-[0.99]"
          >
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="text-sm sm:text-base font-black text-white flex items-center justify-center gap-1.5">
                <span>{strings.joinGame}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                  {strings.playerRole}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {strings.joinDesc}
              </p>
            </div>
            <div className="w-full pt-1 flex items-center justify-center gap-1 text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
              <span>{strings.joinBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

        {/* Online Call & Quick Knowledge Strip */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-center gap-2">
          {onOpenOnlineMeeting && (
            <button
              onClick={() => {
                soundEngine.playTick();
                onOpenOnlineMeeting();
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              <span>{strings.openMeeting}</span>
            </button>
          )}

          {onOpenMatrix && (
            <button
              onClick={() => {
                soundEngine.playTick();
                onOpenMatrix();
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>{strings.openMatrix}</span>
            </button>
          )}

          {onOpenAiStudio && (
            <button
              onClick={() => {
                soundEngine.playTick();
                onOpenAiStudio();
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{strings.openAi}</span>
            </button>
          )}

          {onOpenUserStories && (
            <button
              onClick={() => {
                soundEngine.playTick();
                onOpenUserStories();
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === 'fa' ? 'چک‌لیست و داستان‌های کاربری' : language === 'ar' ? 'قصص وقائمة التحقق' : language === 'tr' ? 'Hikayeler ve Kontrol Listesi' : 'User Stories & Checklist'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
