import React, { useEffect, useState } from 'react';
import { 
  Users, Table, Network, ArrowLeftRight, Activity, 
  Vote, Moon, Shield, Skull, Trophy, Play, Sparkles, AlertTriangle, BookOpen, Volume2, VolumeX, LayoutGrid, Disc,
  Plus, Copy, Check, Settings, X, Crown, Clock
} from 'lucide-react';
import { GamePhase, Language, RoleId, RoomState, Player } from '../../types/mafia';
import { LobbyManager } from './LobbyManager';
import { PhaseControlBar } from './PhaseControlBar';
import { PlayerGrid } from './PlayerGrid';
import { GodTableView } from './GodTableView';
import { AccusationMatrixView } from './AccusationMatrixView';
import { AccusationGraphView } from './AccusationGraphView';
import { AccusationComparison } from './AccusationComparison';
import { AccusationPatternAnalysisView } from './AccusationPatternAnalysis';
import { VotingManager } from './VotingManager';
import { NightEngineModal } from './NightEngineModal';
import { DailyChronicleModal } from './DailyChronicleModal';
const RoleGuideModal = React.lazy(() => import('../common/RoleGuideModal').then(m => ({ default: m.RoleGuideModal })));
import { GodPhaseGuidanceWidget } from './GodPhaseGuidanceWidget';
const HouseRulesModal = React.lazy(() => import('../common/HouseRulesModal').then(m => ({ default: m.HouseRulesModal })));
const GameProfileModal = React.lazy(() => import('../common/GameProfileModal').then(m => ({ default: m.GameProfileModal })));
const InteractiveMatrixModal = React.lazy(() => import('../common/InteractiveMatrixModal').then(m => ({ default: m.InteractiveMatrixModal })));
import { HouseRulesConfig } from '../../data/matrixData';
import { ROLE_DEFINITIONS } from '../../utils/scenarios';
import { translations, isRtlLanguage } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';
import { getLocalSettings, saveLocalSettings } from '../../utils/storage';
import { Sliders, Bookmark } from 'lucide-react';

interface HostConsoleViewProps {
  room: RoomState;
  onSetPhase: (phase: GamePhase, dayNumber?: number) => void;
  onTimerControl: (seconds: number, total: number, isRunning: boolean) => void;
  onUpdateScenario: (scenarioId: string) => void;
  onLockLobby: (locked: boolean) => void;
  onStartGame: () => void;
  onAddTestBots: () => void;
  onKickPlayer: (playerId: string) => void;
  onRenamePlayer: (playerId: string, newName: string) => void;
  onChangeRole: (playerId: string, newRole: RoleId) => void;
  onReorderPlayers?: (reorderedPlayers: Player[]) => void;
  onUpdateHouseRules?: (rules: HouseRulesConfig) => void;
  onKillPlayer: (playerId: string) => void;
  onRevivePlayer: (playerId: string) => void;
  onSendToDefense: (playerId: string) => void;
  onAddAccusation: (accuserId: string, targetId: string) => void;
  onResolveNight: (deadPlayerIds: string[], mutedPlayerId?: string, narrative?: string) => void;
  onPublishChronicle: (text: string) => void;
  onEliminatePlayer: (playerId: string) => void;
  onClearDefense: () => void;
  onHostAction?: (actionType: string, payload?: any) => void;
  onAddPlayer?: (name?: string, seatNumber?: number, role?: RoleId) => void;
  onResolveTie?: (resolution: 'REVOTE' | 'NO_ELIMINATION' | 'RANDOM_DRAW' | 'ELIMINATE_BOTH', candidateIds: string[]) => void;
  language: Language;
}

export const HostConsoleView: React.FC<HostConsoleViewProps> = ({
  room,
  onSetPhase,
  onTimerControl,
  onUpdateScenario,
  onLockLobby,
  onStartGame,
  onAddTestBots,
  onKickPlayer,
  onRenamePlayer,
  onChangeRole,
  onReorderPlayers,
  onUpdateHouseRules,
  onKillPlayer,
  onRevivePlayer,
  onSendToDefense,
  onAddAccusation,
  onResolveNight,
  onPublishChronicle,
  onEliminatePlayer,
  onClearDefense,
  onHostAction,
  onAddPlayer,
  onResolveTie,
  language
}) => {
  const activeLang = language || 'fa';
  const t = translations[activeLang] || translations.fa;
  const isRtl = isRtlLanguage(activeLang);
  const [activeTab, setActiveTab] = useState<'GOD_TABLE' | 'PHASES' | 'PLAYERS' | 'LOBBY' | 'MATRIX' | 'CHRONICLE'>('GOD_TABLE');
  const [matrixSubTab, setMatrixSubTab] = useState<'MATRIX' | 'GRAPH' | 'COMPARE' | 'PATTERNS'>('MATRIX');
  const [isNightModalOpen, setIsNightModalOpen] = useState(false);
  const [isChronicleModalOpen, setIsChronicleModalOpen] = useState(false);
  const [isRoleGuideOpen, setIsRoleGuideOpen] = useState(false);
  const [isHouseRulesOpen, setIsHouseRulesOpen] = useState(false);
  const [isGameProfileOpen, setIsGameProfileOpen] = useState(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [isLobbySettingsOpen, setIsLobbySettingsOpen] = useState(false);
  const [quickPlayerName, setQuickPlayerName] = useState('');
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [showGuidance, setShowGuidance] = useState<boolean>(() => {
    return getLocalSettings().showGodGuidance ?? true;
  });

  const handleCopyRoomLink = () => {
    const url = `${window.location.origin}/?room=${room.roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedInvite(true);
    soundEngine.playTick();
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleQuickAddPlayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (quickPlayerName.trim()) {
      soundEngine.playTick();
      if (onAddPlayer) {
        onAddPlayer(quickPlayerName.trim());
      }
      setQuickPlayerName('');
    }
  };

  const handleToggleGuidance = (show: boolean) => {
    setShowGuidance(show);
    const curr = getLocalSettings();
    saveLocalSettings({ ...curr, showGodGuidance: show });
  };

  const handleAdvancePhase = () => {
    switch (room.phase) {
      case 'NIGHT':
        onSetPhase('DAY_DISCUSSION', room.dayNumber);
        break;
      case 'DAY_DISCUSSION':
        onSetPhase('DAY_ACCUSATION', room.dayNumber);
        break;
      case 'DAY_ACCUSATION':
        onSetPhase('DAY_DEFENSE', room.dayNumber);
        break;
      case 'DAY_DEFENSE':
        onSetPhase('DAY_VOTING', room.dayNumber);
        break;
      case 'DAY_VOTING':
        onSetPhase('DAY_LAST_WORDS', room.dayNumber);
        break;
      case 'DAY_LAST_WORDS':
        onSetPhase('NIGHT', room.dayNumber + 1);
        break;
      default:
        break;
    }
  };

  // Trigger gentle night ambiance noise automatically during NIGHT phase
  useEffect(() => {
    if (room.phase === 'NIGHT') {
      soundEngine.startNightAmbiance(0.12);
    } else {
      soundEngine.stopNightAmbiance();
    }

    return () => {
      soundEngine.stopNightAmbiance();
    };
  }, [room.phase]);

  // Win condition check
  const livingPlayers = room.players.filter(p => p.isAlive);
  const livingMafia = livingPlayers.filter(p => ROLE_DEFINITIONS[p.role]?.affiliation === 'MAFIA');
  const livingCitizens = livingPlayers.filter(p => ROLE_DEFINITIONS[p.role]?.affiliation === 'CITIZEN');

  const isMafiaVictory = room.phase !== 'LOBBY' && livingMafia.length >= livingCitizens.length && livingMafia.length > 0;
  const isCitizenVictory = room.phase !== 'LOBBY' && livingMafia.length === 0 && room.players.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Victory Announcement Banner if game over condition reached */}
      {(isMafiaVictory || isCitizenVictory || room.phase === 'GAME_OVER') && (
        <div className={`p-6 rounded-3xl border shadow-2xl flex flex-wrap items-center justify-between gap-4 ${
          isMafiaVictory 
            ? 'bg-[#1a1012] border-rose-500/50 text-[#e2e2e7]' 
            : 'bg-[#101a14] border-emerald-500/50 text-[#e2e2e7]'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-3xl border border-white/10">
              <Trophy className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {isMafiaVictory 
                  ? (t.mafiaVictoryTitle || 'پیروزی قطعی تیم مافیا! 🔴') 
                  : (t.citizenVictoryTitle || 'پیروزی شهروندان شریف! 🟢')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isMafiaVictory 
                  ? (t.mafiaVictoryDesc || 'تعداد اعضای مافیا با شهروندان برابر شد و کنترل کامل شهر به دست مافیا افتاد.') 
                  : (t.citizenVictoryDesc || 'تمامی اعضای مافیا شناسایی و از شهر حذف شدند.')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onSetPhase('LOBBY', 1)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            {t.startNewGameBtn || 'شروع بازی جدید'}
          </button>
        </div>
      )}

      {/* Primary Top Tab Navigation for Host (Sticky at top) */}
      <div className="sticky top-12 sm:top-14 z-30 bg-[#090b11]/90 backdrop-blur-xl py-2 px-2 border-y border-white/[0.08] shadow-xl space-y-2">
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-0.5">
          <div className="flex items-center gap-1 shrink-0 p-1 bg-black/40 border border-white/5 rounded-2xl">
            <button
              onClick={() => {
                soundEngine.playTick();
                setActiveTab('GOD_TABLE');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'GOD_TABLE'
                  ? 'bg-amber-500 text-black shadow-sm font-black'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Crown className="w-3.5 h-3.5 shrink-0" />
              <span>{t.tabHostTable || 'میز گرداننده'}</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playTick();
                setActiveTab('PHASES');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'PHASES'
                  ? 'bg-amber-500 text-black shadow-sm font-black'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{t.tabPhasesTimer || 'کنترل فازها و تایمر'}</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playTick();
                setActiveTab('PLAYERS');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'PLAYERS'
                  ? 'bg-amber-500 text-black shadow-sm font-black'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>{t.tabPlayerManager || 'مدیریت بازیکنان'} ({room.players.length})</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playTick();
                setActiveTab('LOBBY');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'LOBBY'
                  ? 'bg-amber-500 text-black shadow-sm font-black'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span>{t.tabLobbyScenario || 'لابی و سناریو'}</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playTick();
                setActiveTab('MATRIX');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'MATRIX'
                  ? 'bg-amber-500 text-black shadow-sm font-black'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Table className="w-3.5 h-3.5 shrink-0" />
              <span>{t.tabMatrixAnalytics || 'ماتریس و تحلیل'}</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playTick();
                setActiveTab('CHRONICLE');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'CHRONICLE'
                  ? 'bg-amber-500 text-black shadow-sm font-black'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Vote className="w-3.5 h-3.5 shrink-0" />
              <span>{t.tabChronicleVotes || 'وقایع‌نامه و آرا'}</span>
            </button>
          </div>

          {/* Single Consolidated Guide & Knowledge Base Button */}
          <div className="flex items-center gap-1.5 shrink-0 pr-1">
            <button
              onClick={() => {
                soundEngine.playTick();
                setIsRoleGuideOpen(true);
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition-all cursor-pointer flex items-center gap-1.5"
              title={t.roleGuide || 'دانشنامه جامع نقش‌ها'}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.roleGuide || 'دانشنامه نقش‌ها'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs for MATRIX section */}
        {activeTab === 'MATRIX' && (
          <div className="flex items-center gap-1 pt-1 border-t border-white/5 overflow-x-auto">
            <button
              onClick={() => setMatrixSubTab('MATRIX')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                matrixSubTab === 'MATRIX' ? 'bg-white/20 text-white font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.accusationMatrixTab || 'ماتریس اتهامات'}
            </button>
            <button
              onClick={() => setMatrixSubTab('GRAPH')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                matrixSubTab === 'GRAPH' ? 'bg-white/20 text-white font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.interactionGraphTab || 'گراف شبکه تعاملات'}
            </button>
            <button
              onClick={() => setMatrixSubTab('COMPARE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                matrixSubTab === 'COMPARE' ? 'bg-white/20 text-white font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.playerComparisonTab || 'مقایسه بازیکنان'}
            </button>
            <button
              onClick={() => setMatrixSubTab('PATTERNS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                matrixSubTab === 'PATTERNS' ? 'bg-white/20 text-white font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.patternAnalysisTab || 'تحلیل الگوها و سوءظن'}
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: GOD_TABLE (میز زنده گرداننده مسابقه) */}
      {activeTab === 'GOD_TABLE' && (
        <div className="space-y-4">
          <GodTableView
            room={room}
            onKillPlayer={onKillPlayer}
            onRevivePlayer={onRevivePlayer}
            onKickPlayer={onKickPlayer}
            onRenamePlayer={onRenamePlayer}
            onChangeRole={onChangeRole}
            onSendToDefense={onSendToDefense}
            onAccuseOnBehalf={onAddAccusation}
            onNextPhase={() => {
              if (room.phase === 'LOBBY') {
                onStartGame();
              } else if (room.phase === 'DAY_DISCUSSION') {
                onSetPhase('DAY_VOTING');
              } else if (room.phase === 'DAY_VOTING' || room.phase === 'DAY_DEFENSE') {
                onSetPhase('NIGHT');
              } else if (room.phase === 'NIGHT') {
                onSetPhase('DAY_DISCUSSION', (room.dayNumber || 1) + 1);
              }
            }}
            onOpenDailyChronicle={() => setIsChronicleModalOpen(true)}
            onOpenNightEngine={() => setIsNightModalOpen(true)}
            onOpenRoleGuide={() => setIsRoleGuideOpen(true)}
            onHostAction={onHostAction}
            onAddPlayer={onAddPlayer}
            onStartGame={onStartGame}
            onResolveTie={onResolveTie}
            language={language}
          />
        </div>
      )}

      {/* TAB 2: PHASES (کنترل فازها، تایمر و راهنمای گرداننده) */}
      {activeTab === 'PHASES' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Phase Control Bar */}
          {room.phase === 'LOBBY' ? (
            <div className="bg-[#0e0e14] border border-amber-500/30 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{t.waitingInLobby || 'در لابی انتظار هستید'}</h3>
                  <p className="text-xs text-slate-400">{t.playerCountLabel || 'تعداد بازیکنان:'} {room.players.length} {t.playersCountWord || 'نفر'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundEngine.playGong();
                  onStartGame();
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>{t.startAndGoToDayOne || 'شروع بازی و رفتن به روز اول'}</span>
              </button>
            </div>
          ) : (
            <PhaseControlBar
              room={room}
              onSetPhase={onSetPhase}
              onTimerControl={onTimerControl}
              onOpenNightEngine={() => setIsNightModalOpen(true)}
              onOpenDailyChronicle={() => setIsChronicleModalOpen(true)}
              language={language}
            />
          )}

          {/* God Step-by-Step Guidance Widget */}
          <GodPhaseGuidanceWidget
            phase={room.phase}
            dayNumber={room.dayNumber}
            scenarioId={room.scenarioId}
            language={language}
            showGuidance={showGuidance}
            onToggleShowGuidance={handleToggleGuidance}
            onNextPhase={handleAdvancePhase}
          />

          {/* Team Balance Indicator Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#0f0f12] border border-white/10 p-5 rounded-3xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.aliveCitizensCount || 'شهروندان زنده'}</p>
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <h3 className="text-3xl font-extrabold text-[#e2e2e7] font-mono">{livingCitizens.length}</h3>
                <span className="text-xs text-slate-500">{t.playersCountWord || 'نفر'}</span>
              </div>
              <div className="mt-2 text-[11px] text-emerald-400/90">● {t.majorityActiveCity || 'اکثریت فعال شهر'}</div>
            </div>

            <div className="bg-[#0f0f12] border border-white/10 p-5 rounded-3xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.aliveMafiaCount || 'مافیای زنده'}</p>
                <Skull className="w-4 h-4 text-rose-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <h3 className="text-3xl font-extrabold text-rose-400 font-mono">{livingMafia.length}</h3>
                <span className="text-xs text-slate-500">{t.playersCountWord || 'نفر'}</span>
              </div>
              <div className="mt-2 text-[11px] text-rose-400/90">● {t.organizedMinority || 'اقلیت سازمان‌یافته'}</div>
            </div>

            <div className="bg-[#0f0f12] border border-white/10 p-5 rounded-3xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.totalAccusationsLabel || 'کل اتهامات'}</p>
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <h3 className="text-3xl font-extrabold text-amber-400 font-mono">{room.accusations.length}</h3>
                <span className="text-xs text-slate-500">{language === 'en' ? 'cases' : language === 'ar' ? 'حالة' : language === 'tr' ? 'vaka' : 'مورد'}</span>
              </div>
              <div className="mt-2 text-[11px] text-amber-400/80">↑ {t.recordedInMatrix || 'ثبت‌شده در ماتریس'}</div>
            </div>

            <div className="bg-[#0f0f12] border border-white/10 p-5 rounded-3xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.cycleStatusLabel || 'وضعیت چرخه'}</p>
                <Moon className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-3">
                <h3 className="text-xl font-bold text-[#e2e2e7]">
                  {room.phase === 'NIGHT' ? (t.nightSecret || 'شب محرمانه') : (t.dayPublic || 'روز علنی')}
                </h3>
              </div>
              <div className="mt-2 text-[11px] text-slate-400">{t.currentPhaseTag || 'فاز'} {room.phase}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PLAYERS (مدیریت بازیکنان) */}
      {activeTab === 'PLAYERS' && (
        <PlayerGrid
          room={room}
          onKillPlayer={onKillPlayer}
          onRevivePlayer={onRevivePlayer}
          onKickPlayer={onKickPlayer}
          onRenamePlayer={onRenamePlayer}
          onChangeRole={onChangeRole}
          onSendToDefense={onSendToDefense}
          onAccuseOnBehalf={onAddAccusation}
          language={language}
        />
      )}

      {/* TAB 4: LOBBY (لابی، سناریو و تنظیمات کارت‌ها) */}
      {activeTab === 'LOBBY' && (
        <LobbyManager
          room={room}
          onUpdateScenario={onUpdateScenario}
          onLockLobby={onLockLobby}
          onStartGame={onStartGame}
          onAddTestBots={onAddTestBots}
          onKickPlayer={onKickPlayer}
          onRenamePlayer={onRenamePlayer}
          onChangeRole={onChangeRole}
          onReorderPlayers={onReorderPlayers}
          onUpdateHouseRules={onUpdateHouseRules}
          language={language}
        />
      )}

      {/* TAB 5: MATRIX (ماتریس و تحلیل‌های تحلیلی) */}
      {activeTab === 'MATRIX' && (
        <div className="space-y-4">
          {matrixSubTab === 'MATRIX' && (
            <AccusationMatrixView
              players={room.players}
              accusations={room.accusations}
              onAddAccusation={onAddAccusation}
              language={language}
            />
          )}

          {matrixSubTab === 'GRAPH' && (
            <AccusationGraphView
              players={room.players}
              accusations={room.accusations}
              onAddAccusation={onAddAccusation}
              language={language}
            />
          )}

          {matrixSubTab === 'COMPARE' && (
            <AccusationComparison
              players={room.players}
              accusations={room.accusations}
              language={language}
            />
          )}

          {matrixSubTab === 'PATTERNS' && (
            <AccusationPatternAnalysisView
              players={room.players}
              accusations={room.accusations}
              language={language}
            />
          )}
        </div>
      )}

      {/* TAB 6: CHRONICLE (وقایع‌نامه و آرا) */}
      {activeTab === 'CHRONICLE' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-[#121218] border border-white/10 rounded-2xl p-4">
            <div>
              <h3 className="font-bold text-white text-sm">{t.officialDailyChronicle || 'وقایع‌نامه رسمی روزانه'}</h3>
              <p className="text-xs text-slate-400">{t.chronicleDesc || 'ثبت اخبار، اعلام کشته‌شدگان و رویدادهای شب'}</p>
            </div>
            <button
              onClick={() => setIsChronicleModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs cursor-pointer shadow-md shadow-amber-500/20"
            >
              {t.editPublishChronicle || 'ویرایش و انتشار وقایع‌نامه 📝'}
            </button>
          </div>

          <VotingManager
            room={room}
            onEliminatePlayer={onEliminatePlayer}
            onClearDefense={onClearDefense}
            onResolveTie={onResolveTie}
            language={language}
          />
        </div>
      )}

      {/* Night Engine Modal */}
      <NightEngineModal
        isOpen={isNightModalOpen}
        onClose={() => setIsNightModalOpen(false)}
        room={room}
        onResolveNight={onResolveNight}
        language={language}
      />

      {/* Daily Chronicle Modal */}
      <DailyChronicleModal
        isOpen={isChronicleModalOpen}
        onClose={() => setIsChronicleModalOpen(false)}
        room={room}
        onPublishChronicle={onPublishChronicle}
        language={language}
      />

      <React.Suspense fallback={null}>
        {/* Role Guide Encyclopedia Modal */}
        {isRoleGuideOpen && (
          <RoleGuideModal
            isOpen={isRoleGuideOpen}
            onClose={() => setIsRoleGuideOpen(false)}
            language={language}
          />
        )}

        {/* House Rules Agreement Modal */}
        {isHouseRulesOpen && (
          <HouseRulesModal
            isOpen={isHouseRulesOpen}
            onClose={() => setIsHouseRulesOpen(false)}
            currentRules={room.houseRules}
            onSaveRules={(rules) => {
              if (onUpdateHouseRules) {
                onUpdateHouseRules(rules);
              }
            }}
            isHost={true}
            language={language}
          />
        )}

        {/* Game Match Profile Modal */}
        {isGameProfileOpen && (
          <GameProfileModal
            isOpen={isGameProfileOpen}
            onClose={() => setIsGameProfileOpen(false)}
            room={room}
            isHost={true}
            language={language}
            onOpenMatrix={() => {
              setIsGameProfileOpen(false);
              setIsMatrixModalOpen(true);
            }}
            onOpenHouseRules={() => {
              setIsGameProfileOpen(false);
              setIsHouseRulesOpen(true);
            }}
          />
        )}

        {/* Interactive Matrix Modal */}
        {isMatrixModalOpen && (
          <InteractiveMatrixModal
            isOpen={isMatrixModalOpen}
            onClose={() => setIsMatrixModalOpen(false)}
            language={language}
            initialScenarioId={room.scenarioId}
          />
        )}
      </React.Suspense>

      {/* Lobby Settings & Scenario Modal */}
      {isLobbySettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className={`bg-[#0c0c12] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl relative ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">{t.scenarioSettingsTitle || 'تنظیمات سناریو و مدیریت لابی'}</h3>
                  <p className="text-xs text-slate-400">{t.scenarioSettingsDesc || 'تغییر سناریو، قفل اتاق، و چیدمان بازی'}</p>
                </div>
              </div>

              <button
                onClick={() => setIsLobbySettingsOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <LobbyManager
              room={room}
              onUpdateScenario={(scId) => {
                onUpdateScenario(scId);
              }}
              onLockLobby={onLockLobby}
              onStartGame={() => {
                setIsLobbySettingsOpen(false);
                onStartGame();
              }}
              onAddTestBots={onAddTestBots}
              onKickPlayer={onKickPlayer}
              onRenamePlayer={onRenamePlayer}
              onChangeRole={onChangeRole}
              onReorderPlayers={onReorderPlayers}
              onUpdateHouseRules={onUpdateHouseRules}
              language={language}
            />
          </div>
        </div>
      )}

    </div>
  );
};
