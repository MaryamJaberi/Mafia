import React, { useState, useRef, useEffect } from 'react';
import { 
  Crown, Smartphone, Volume2, VolumeX, 
  History, Music, RefreshCw, Sparkles,
  Search, Layers, BookOpen, Brain, Award, Sliders, ChevronDown, Bug, Video, CheckSquare,
  Cloud, Bot, LayoutGrid, Home, Globe, Check
} from 'lucide-react';
import { Language } from '../../types/mafia';
import { translations, isRtlLanguage } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';
import { PwaInstallBanner } from './PwaInstallBanner';
import { NightAudioWidget } from './NightAudioWidget';
import { ToolsHubModal } from './ToolsHubModal';

interface HeaderProps {
  viewMode: 'HOST' | 'PLAYER' | 'DUAL';
  setViewMode: (mode: 'HOST' | 'PLAYER' | 'DUAL') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onOpenSoundboard: () => void;
  onOpenHistory: () => void;
  onOpenFlutterExport: () => void;
  onOpenTestBench?: () => void;
  onOpenRuleSearch?: () => void;
  onOpenFullGameReport?: () => void;
  onOpenMatrixModal?: () => void;
  onOpenPresetScenarios?: () => void;
  onOpenRoleGuide?: () => void;
  onOpenAiScenarioBuilder?: () => void;
  onOpenGameProfileModal?: () => void;
  onOpenSettings?: () => void;
  onOpenBugReport?: () => void;
  onOpenAutomatedQA?: () => void;
  onOpenGodTable?: () => void;
  onOpenOnlineMeeting?: () => void;
  onOpenUserStories?: () => void;
  onOpenJoinModal?: () => void;
  onOpenAuthProfile?: () => void;
  onOpenGeminiAssistant?: () => void;
  onNewGame: () => void;
  onGoHome?: () => void;
  roomId?: string;
  isOnline: boolean;
  isNightPhase?: boolean;
  onForceSync?: () => void;
  latencyMs?: number | null;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  language,
  setLanguage,
  isMuted,
  setIsMuted,
  onOpenSoundboard,
  onOpenHistory,
  onOpenFlutterExport,
  onOpenTestBench,
  onOpenRuleSearch,
  onOpenFullGameReport,
  onOpenMatrixModal,
  onOpenPresetScenarios,
  onOpenRoleGuide,
  onOpenAiScenarioBuilder,
  onOpenGameProfileModal,
  onOpenSettings,
  onOpenBugReport,
  onOpenAutomatedQA,
  onOpenGodTable,
  onOpenOnlineMeeting,
  onOpenUserStories,
  onOpenJoinModal,
  onOpenAuthProfile,
  onOpenGeminiAssistant,
  onNewGame,
  onGoHome,
  roomId,
  isOnline,
  isNightPhase = false,
  onForceSync,
  latencyMs,
  isSyncing
}) => {
  const [isToolsHubOpen, setIsToolsHubOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [copiedRoom, setCopiedRoom] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

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

  const handleCopyRoom = () => {
    if (!roomId) return;
    const url = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard.writeText(url);
    soundEngine.playTick();
    setCopiedRoom(true);
    setTimeout(() => setCopiedRoom(false), 2000);
  };

  const t = translations[language] || translations.fa;
  const isRtl = isRtlLanguage(language);

  return (
    <>
      <header className="bg-[#090b11]/90 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-40" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3">
          
          {/* 1. Brand & Room Info */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink-0">
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="w-8 h-8 sm:w-9 sm:h-9 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl flex items-center justify-center border border-white/[0.08] transition-all cursor-pointer active:scale-95"
                title={t.homeScreen || (language === 'en' ? 'Home Screen' : 'صفحه اصلی')}
              >
                <Home className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-black font-black text-lg shadow-sm shrink-0 hover:scale-105 active:scale-95 transition-transform cursor-pointer">
              🎩
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-black tracking-tight text-white truncate">
                  {t.appTitle}
                </h1>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-extrabold border border-amber-500/30">
                  PRO
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${isOnline ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-rose-500'}`} />
                <span className={isOnline ? 'text-slate-300 font-medium' : 'text-rose-400'}>{isOnline ? t.connected : t.disconnected}</span>
              </div>
            </div>
          </div>

          {/* 2. Room Code & Mode Switcher Center Hub */}
          <div className="flex items-center gap-2">
            {roomId && (
              <button
                onClick={handleCopyRoom}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs transition-all cursor-pointer active:scale-95 group"
                title={copiedRoom ? (language === 'en' ? 'Copied!' : 'کپی شد!') : (language === 'en' ? 'Click to copy room link' : 'کلیک برای کپی لینک دعوت')}
              >
                <span className="text-slate-400 text-[10px] font-bold">{t.roomCode}:</span>
                <span className="font-mono font-black text-amber-400 tracking-wide text-xs">{roomId}</span>
                {copiedRoom ? (
                  <Check className="w-3 h-3 text-emerald-400 animate-in zoom-in" />
                ) : (
                  <span className="text-[10px] text-slate-500 group-hover:text-amber-300 transition-colors">📋</span>
                )}
              </button>
            )}

            <div className="flex items-center bg-[#07090e]/90 p-1 rounded-xl border border-white/[0.08] shadow-inner">
              <button
                id="btn-mode-host"
                onClick={() => setViewMode('HOST')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'HOST'
                    ? 'bg-amber-500 text-black shadow-sm font-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{t.host}</span>
              </button>
              
              <button
                id="btn-mode-player"
                onClick={() => {
                  setViewMode('PLAYER');
                  if (onOpenJoinModal) {
                    onOpenJoinModal();
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'PLAYER'
                    ? 'bg-amber-500 text-black shadow-sm font-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{t.player}</span>
              </button>
            </div>
          </div>

          {/* 3. Essential Quick Actions & Utility Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Gemini AI Assistant */}
            {onOpenGeminiAssistant && (
              <button
                id="btn-header-gemini"
                onClick={onOpenGeminiAssistant}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/25 text-xs font-bold transition-all cursor-pointer"
                title={t.geminiAiAssistantTitle || 'Gemini AI'}
              >
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">{t.geminiAiShort || 'Gemini AI'}</span>
              </button>
            )}

            {/* Cloud Sync */}
            {onOpenAuthProfile && (
              <button
                id="btn-header-cloud"
                onClick={onOpenAuthProfile}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 text-xs font-bold transition-all cursor-pointer"
                title={t.cloudSyncTitle || 'Cloud'}
              >
                <Cloud className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">{t.cloudShort || 'Cloud'}</span>
              </button>
            )}

            {/* Consolidated Tools Hub */}
            <button
              id="btn-header-tools-hub"
              onClick={() => {
                soundEngine.playTick();
                setIsToolsHubOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 font-bold text-xs transition-all cursor-pointer"
              title={t.toolsHubSubtitle || t.toolsAndScenarios}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.toolsAndScenarios || 'Tools'}</span>
            </button>

            {/* Night audio widget */}
            <NightAudioWidget isNightPhase={isNightPhase} language={language} />

            {/* Single Icon Language Switcher (یک آیکون برای تغییر زبان) */}
            <div className="relative" ref={langMenuRef}>
              <button
                id="btn-header-single-lang"
                onClick={() => {
                  soundEngine.playTick();
                  setIsLangMenuOpen(!isLangMenuOpen);
                }}
                className="p-1.5 sm:px-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/10 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                title={t.language || 'Change Language'}
                aria-label="Language Selector"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[10px] uppercase font-mono text-amber-300 font-black">
                  {language.toUpperCase()}
                </span>
                <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangMenuOpen && (
                <div 
                  className={`absolute top-full mt-2 w-36 bg-[#10121a] border border-amber-500/30 rounded-2xl p-1 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
                    isRtl ? 'left-0' : 'right-0'
                  }`}
                >
                  {[
                    { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
                    { code: 'en', label: 'English', flag: '🇬🇧' },
                    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
                    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
                  ].map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        soundEngine.playTick();
                        setLanguage(item.code as Language);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        language === item.code
                          ? 'bg-amber-500 text-black font-black'
                          : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{item.flag}</span>
                        <span>{item.label}</span>
                      </span>
                      {language === item.code && <Check className="w-3.5 h-3.5 text-black" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Live Sync & Latency Status */}
            {roomId && (
              <button
                type="button"
                onClick={onForceSync}
                disabled={isSyncing}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 text-xs transition-all cursor-pointer"
                title={language === 'en' ? 'Click to force synchronize room state' : 'کلیک برای همگام‌سازی فوری وضعیت اتاق'}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'} ${isSyncing ? 'animate-ping' : ''}`} />
                <span className="font-mono text-[10px] text-slate-400">
                  {latencyMs !== null ? `${latencyMs}ms` : (isOnline ? 'Live' : 'Offline')}
                </span>
                <RefreshCw className={`w-3 h-3 text-slate-400 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            )}

            {/* New Game */}
            {viewMode === 'HOST' && (
              <button
                id="btn-new-game"
                onClick={onNewGame}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 text-xs transition-all flex items-center gap-1 cursor-pointer"
                title={t.createGame}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-xs font-bold">{t.createGame}</span>
              </button>
            )}

            <PwaInstallBanner language={language} />
          </div>

        </div>
      </header>

      {/* Unified Tools Hub Modal */}
      <ToolsHubModal
        isOpen={isToolsHubOpen}
        onClose={() => setIsToolsHubOpen(false)}
        language={language}
        onOpenMatrixModal={onOpenMatrixModal}
        onOpenPresetScenarios={onOpenPresetScenarios}
        onOpenAiScenarioBuilder={onOpenAiScenarioBuilder}
        onOpenRoleGuide={onOpenRoleGuide}
        onOpenGeminiAssistant={onOpenGeminiAssistant}
        onOpenAuthProfile={onOpenAuthProfile}
        onOpenOnlineMeeting={onOpenOnlineMeeting}
        onOpenRuleSearch={onOpenRuleSearch}
        onOpenGameProfileModal={onOpenGameProfileModal}
        onOpenSoundboard={onOpenSoundboard}
        onOpenHistory={onOpenHistory}
        onOpenUserStories={onOpenUserStories}
        onOpenSettings={onOpenSettings}
        onOpenBugReport={onOpenBugReport}
        onOpenAutomatedQA={onOpenAutomatedQA}
        onOpenGodTable={onOpenGodTable}
        onOpenFullGameReport={onOpenFullGameReport}
      />
    </>
  );
};
