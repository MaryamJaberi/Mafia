import React, { useState } from 'react';
import { 
  X, Sparkles, Layers, Brain, BookOpen, Bot, Cloud, Video,
  Search, Sliders, Music, History, CheckSquare, Bug, Award,
  ChevronRight, ArrowRightLeft, Shield, Users, HelpCircle
} from 'lucide-react';
import { Language } from '../../types/mafia';
import { translations } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';

interface ToolsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onOpenMatrixModal?: () => void;
  onOpenPresetScenarios?: () => void;
  onOpenAiScenarioBuilder?: () => void;
  onOpenRoleGuide?: () => void;
  onOpenGeminiAssistant?: () => void;
  onOpenAuthProfile?: () => void;
  onOpenOnlineMeeting?: () => void;
  onOpenRuleSearch?: () => void;
  onOpenGameProfileModal?: () => void;
  onOpenSoundboard?: () => void;
  onOpenHistory?: () => void;
  onOpenUserStories?: () => void;
  onOpenSettings?: () => void;
  onOpenBugReport?: () => void;
  onOpenAutomatedQA?: () => void;
  onOpenGodTable?: () => void;
  onOpenFullGameReport?: () => void;
}

export const ToolsHubModal: React.FC<ToolsHubModalProps> = ({
  isOpen,
  onClose,
  language,
  onOpenMatrixModal,
  onOpenPresetScenarios,
  onOpenAiScenarioBuilder,
  onOpenRoleGuide,
  onOpenGeminiAssistant,
  onOpenAuthProfile,
  onOpenOnlineMeeting,
  onOpenRuleSearch,
  onOpenGameProfileModal,
  onOpenSoundboard,
  onOpenHistory,
  onOpenUserStories,
  onOpenSettings,
  onOpenBugReport,
  onOpenAutomatedQA,
  onOpenGodTable,
  onOpenFullGameReport
}) => {
  const [activeCategory, setActiveCategory] = useState<'SCENARIOS' | 'AI_LIVE' | 'MODERATOR'>('SCENARIOS');
  const t = translations[language] || translations.fa;
  const isRtl = language !== 'en';

  if (!isOpen) return null;

  const handleAction = (cb?: () => void) => {
    soundEngine.playTick();
    onClose();
    if (cb) {
      setTimeout(() => cb(), 100);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-[#0b0f17] border border-white/15 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#070a0f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl font-bold shadow-inner">
              🧰
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{language === 'en' ? 'Tools & Features Hub' : 'منوی ابزارها و امکانات بازی'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                  {language === 'en' ? 'All-in-One' : 'جامع و دسته‌بندی‌شده'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'en' 
                  ? 'Access scenarios, Gemini AI assistant, cloud sync, soundboard, and official referee tools' 
                  : 'دسترسی سریع به سناریوها، هوش مصنوعی Gemini، همگام‌سازی ابری، ساندبورد و ابزارهای رسمی داوری'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-[#0d121c] border-b border-white/5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              soundEngine.playTick();
              setActiveCategory('SCENARIOS');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeCategory === 'SCENARIOS'
                ? 'bg-amber-500 text-black shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{language === 'en' ? 'Scenarios & Roles' : 'سناریوها و نقش‌ها'}</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTick();
              setActiveCategory('AI_LIVE');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeCategory === 'AI_LIVE'
                ? 'bg-purple-500 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-300" />
            <span>{language === 'en' ? 'AI & Online Features' : 'هوش مصنوعی و امکانات آنلاین'}</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTick();
              setActiveCategory('MODERATOR');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeCategory === 'MODERATOR'
                ? 'bg-cyan-500 text-black shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{language === 'en' ? 'Moderator & Settings' : 'ابزارهای داوری و تنظیمات'}</span>
          </button>
        </div>

        {/* Modal Body: Cards per Category */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Category 1: Scenarios & Roles */}
          {activeCategory === 'SCENARIOS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* 17 Scenarios Matrix */}
              {onOpenMatrixModal && (
                <div 
                  onClick={() => handleAction(onOpenMatrixModal)}
                  className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[#131926] to-[#0d121c] border border-amber-500/30 hover:border-amber-500/60 p-4 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {language === 'en' ? '17 Standard Scenarios Matrix' : 'جدول ۱۷ سناریوی استاندارد'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {language === 'en' 
                          ? 'Explore all 17 TV and classic setups (Godfather, Zodiac, Russian, Inquisitor, Ranger) with full role breakdowns.' 
                          : 'ماتریس کامل ۱۷ سناریوی تلویزیونی و رسمی (پدرخوانده، زودیاک، بازپرس، ارتش سری، گرگینه، روسی و...) با تمام نقش‌ها.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-amber-400 font-bold">
                    <span>{language === 'en' ? 'Open Matrix View' : 'مشاهده جدول و مقایسه'}</span>
                    <span>→</span>
                  </div>
                </div>
              )}

              {/* Scenario Bank & Deck Builder */}
              {onOpenPresetScenarios && (
                <div 
                  onClick={() => handleAction(onOpenPresetScenarios)}
                  className="p-4 rounded-2xl bg-[#131926] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {language === 'en' ? 'Scenario Bank & Custom Deck' : 'بانک سناریوها و چیدمان دک'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {language === 'en'
                          ? 'Choose balanced presets, add or remove roles, adjust seat numbers, and save custom configurations.'
                          : 'انتخاب سریع سناریوهای آماده، کم و زیاد کردن کارت‌ها، ساخت سناریوی سفارشی و ذخیره در حافظه بازی.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400 group-hover:text-amber-300 font-bold">
                    <span>{language === 'en' ? 'Manage Presets' : 'مدیریت و چیدمان کارت‌ها'}</span>
                    <span>→</span>
                  </div>
                </div>
              )}

              {/* AI Scenario Designer */}
              {onOpenAiScenarioBuilder && (
                <div 
                  onClick={() => handleAction(onOpenAiScenarioBuilder)}
                  className="p-4 rounded-2xl bg-[#131926] border border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                        {language === 'en' ? 'AI Scenario Architect' : 'معمار سناریو با هوش مصنوعی'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {language === 'en'
                          ? 'Generate perfectly balanced custom scenarios based on player count and desired complexity via Gemini.'
                          : 'طراحی خودکار سناریوی کاملاً متعادل با هوش مصنوعی بر اساس تعداد نفرات، درجه سختی و تم دلخواه شما.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-purple-400 font-bold">
                    <span>{language === 'en' ? 'Launch Generator' : 'طراحی سناریو هوشمند'}</span>
                    <span>→</span>
                  </div>
                </div>
              )}

              {/* Full Role Encyclopedia */}
              {onOpenRoleGuide && (
                <div 
                  onClick={() => handleAction(onOpenRoleGuide)}
                  className="p-4 rounded-2xl bg-[#131926] border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {language === 'en' ? 'Role Encyclopedia & Rulings' : 'دانشنامه و راهنمای جامع نقش‌ها'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {language === 'en'
                          ? 'Detailed guide for 50+ roles: day/night acts, exceptions, official referee rulings, and matchups.'
                          : 'مرجع کامل بیش از ۵۰ نقش: تمام اکت‌ها، استثناهای داوری، ترتیب بیداری شب و تقابل‌های دوطرفه.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-cyan-400 font-bold">
                    <span>{language === 'en' ? 'Open Encyclopedia' : 'ورود به دانشنامه'}</span>
                    <span>→</span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Category 2: AI & Live Online */}
          {activeCategory === 'AI_LIVE' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Gemini AI Assistant */}
              {onOpenGeminiAssistant && (
                <div 
                  onClick={() => handleAction(onOpenGeminiAssistant)}
                  className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/15 via-[#131926] to-[#0d121c] border border-purple-500/35 hover:border-purple-500/65 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                          {language === 'en' ? 'Gemini AI Assistant & Referee' : 'دستیار و داور هوش مصنوعی Gemini'}
                        </h3>
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {language === 'en'
                          ? 'Multi-turn AI assistant with live Google Search grounding for rule disputes and Maps grounding for nearby board-game cafes.'
                          : 'چت هوشمند چندمرحله‌ای با جستجوی زنده در گوگل برای حل اختلافات داوری و مپ برای یافتن کافه‌بازی‌های مافیا.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-purple-400 font-bold">
                    <span>{language === 'en' ? 'Open AI Chat & Search' : 'گفتگو با دستیار Gemini'}</span>
                    <span>→</span>
                  </div>
                </div>
              )}

              {/* Firebase Cloud Sync & Google Auth */}
              {onOpenAuthProfile && (
                <div 
                  onClick={() => handleAction(onOpenAuthProfile)}
                  className="p-4 rounded-2xl bg-[#131926] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {language === 'en' ? 'Firebase Cloud Sync & Account' : 'حساب کاربری و همگام‌سازی ابری'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {language === 'en'
                          ? 'Sign in with Google, save matches to cloud database, and sync game state across multiple devices.'
                          : 'ورود امن با حساب گوگل، ذخیره آنلاین نتایج مسابقات و همگام‌سازی بی‌درنگ بین گوشی و لپ‌تاپ گرداننده.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-amber-400 font-bold">
                    <span>{language === 'en' ? 'Manage Cloud Sync' : 'تنظیمات حساب و همگام‌سازی'}</span>
                    <span>→</span>
                  </div>
                </div>
              )}

              {/* Live Video / Voice Room */}
              {onOpenOnlineMeeting && (
                <div 
                  onClick={() => handleAction(onOpenOnlineMeeting)}
                  className="p-4 rounded-2xl bg-[#131926] border border-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {language === 'en' ? 'Live Online Meeting Room' : 'اتاق صوتی و تصویری آنلاین'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {language === 'en'
                          ? 'Generate Google Meet, Jitsi, or Discord voice link for players joining remotely.'
                          : 'ایجاد لینک تماس گروهی برای بازی‌های آنلاین و اتصال سریع تمام بازیکنان از راه دور.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-emerald-400 font-bold">
                    <span>{language === 'en' ? 'Configure Voice Room' : 'تنظیمات تماس تصویری'}</span>
                    <span>→</span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Category 3: Moderator Utilities & Settings */}
          {activeCategory === 'MODERATOR' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Quick Rule Search & House Rules */}
              {onOpenRuleSearch && (
                <div 
                  onClick={() => handleAction(onOpenRuleSearch)}
                  className="p-4 rounded-2xl bg-[#131926] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {language === 'en' ? 'Rule Search & Referee Clarifications' : 'جستجوی قوانین و استعلام داوری'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {language === 'en'
                          ? 'Instant search across hundreds of official rulings, challenges, night interactions, and foul guidelines.'
                          : 'جستجوی فوری سوالات پرتکرار داوری، تقابل‌های شبانه، جریمه خطاها و رفع ابهامات پیچیده میز.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-amber-400 font-bold">
                    <span>{language === 'en' ? 'Search Rules' : 'جستجو در قوانین'}</span>
                    <span>→</span>
                  </div>
                </div>
              )}

              {/* Game Profile & Identification */}
              {onOpenGameProfileModal && (
                <div 
                  onClick={() => handleAction(onOpenGameProfileModal)}
                  className="p-4 rounded-2xl bg-[#131926] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {language === 'en' ? 'Match Certificate & Profile' : 'شناسنامه و پروفایل مسابقه'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {language === 'en'
                          ? 'View official match code, seed number, room token, and referee accreditation.'
                          : 'مشاهده مشخصات رسمی مسابقه، سید تصادفی، کد اتاق و اطلاعات معتبر داوری.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-amber-400 font-bold">
                    <span>{language === 'en' ? 'View Certificate' : 'مشاهده شناسنامه'}</span>
                    <span>→</span>
                  </div>
                </div>
              )}

              {/* Sound FX Board */}
              {onOpenSoundboard && (
                <div 
                  onClick={() => handleAction(onOpenSoundboard)}
                  className="p-4 rounded-2xl bg-[#131926] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {language === 'en' ? 'Audio Soundboard & SFX' : 'ساندبورد و افکت‌های صوتی'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {language === 'en'
                          ? 'Play synthesized gunshot, gong, suspense clock, voting bell, and night transition sound effects.'
                          : 'پخش صدای گونگ، شلیک گلوله، ساعت معکوس، زنگ دفاع و افکت‌های رسمی شب و روز با سینث‌سایزر.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-amber-400 font-bold">
                    <span>{language === 'en' ? 'Open Soundboard' : 'پنل افکت‌های صوتی'}</span>
                    <span>→</span>
                  </div>
                </div>
              )}

              {/* Match History */}
              {onOpenHistory && (
                <div 
                  onClick={() => handleAction(onOpenHistory)}
                  className="p-4 rounded-2xl bg-[#131926] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <History className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {language === 'en' ? 'Match History & Chronicle Logs' : 'تاریخچه بازی‌ها و وقایع‌نامه'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {language === 'en'
                          ? 'Review past matches, winner statistics, faction kill graphs, and AI-generated morning newspapers.'
                          : 'مرور بازی‌های قبلی، نمودار پیروزی‌های مافیا و شهر، گزارش صبحگاهی و لاگ دقیق آرا.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-amber-400 font-bold">
                    <span>{language === 'en' ? 'View Past Matches' : 'مشاهده تاریخچه'}</span>
                    <span>→</span>
                  </div>
                </div>
              )}

              {/* User Stories & QA Suite */}
              {onOpenUserStories && (
                <div 
                  onClick={() => handleAction(onOpenUserStories)}
                  className="p-4 rounded-2xl bg-[#131926] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {language === 'en' ? 'User Stories & Test Scenarios' : 'داستان‌های کاربری و تست سناریوها'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {language === 'en'
                          ? 'Interactive test scenarios covering all player flows, voting mechanics, and edge case validations.'
                          : 'چک‌لیست تعاملی آزمون‌های کاربری برای تست دقیق تمام فازها، چالش‌ها و قوانین پیشرفته.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-amber-400 font-bold">
                    <span>{language === 'en' ? 'Open Test Suite' : 'ورود به بخش تست'}</span>
                    <span>→</span>
                  </div>
                </div>
              )}

              {/* App Settings */}
              {onOpenSettings && (
                <div 
                  onClick={() => handleAction(onOpenSettings)}
                  className="p-4 rounded-2xl bg-[#131926] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {language === 'en' ? 'Comprehensive Settings' : 'تنظیمات و شخصی‌سازی'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {language === 'en'
                          ? 'Configure audio volumes, timer defaults, theme options, and display preferences.'
                          : 'تنظیم زمان‌های پیش‌فرض فازها، میزان صدای موسیقی، تم گرافیکی و ترجیحات بصری.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-amber-400 font-bold">
                    <span>{language === 'en' ? 'Open Settings' : 'باز کردن تنظیمات'}</span>
                    <span>→</span>
                  </div>
                </div>
              )}

              {/* Bug Report */}
              {onOpenBugReport && (
                <div 
                  onClick={() => handleAction(onOpenBugReport)}
                  className="p-4 rounded-2xl bg-[#131926] border border-white/10 hover:border-rose-500/40 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Bug className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                        {language === 'en' ? 'Bug Report & Diagnostics' : 'گزارش باگ و خطایاب'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {language === 'en'
                          ? 'Report unexpected gameplay glitches, view system error logs, or reset cached room states.'
                          : 'ثبت و گزارش هرگونه خطای احتمالی در جریان بازی، ریست کش و عیب‌یابی حافظه لابی.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-rose-400 font-bold">
                    <span>{language === 'en' ? 'Send Diagnostics' : 'ارسال گزارش خطا'}</span>
                    <span>→</span>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
