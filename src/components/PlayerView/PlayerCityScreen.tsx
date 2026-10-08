import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  Target, Shield, Eye, EyeOff, Newspaper, Table, 
  Network, Moon, Sun, Clock, Users, Skull, Volume2, VolumeX, CheckCircle2, 
  Zap, AlertCircle, QrCode, BookOpen, Copy, Check, X, ArrowRightLeft, Sparkles,
  FileText, MessageSquare, Search, HelpCircle, Video, ThumbsUp, ThumbsDown, Vote
} from 'lucide-react';
import { Player, RoleId, RoomState, Language } from '../../types/mafia';
import { ROLE_DEFINITIONS } from '../../utils/scenarios';
import { getCompleteRoleInfo } from '../../utils/rolesDatabase';
import { AccusationMatrixView } from '../HostConsole/AccusationMatrixView';
import { AccusationGraphView } from '../HostConsole/AccusationGraphView';
import { RoleGuideModal } from '../common/RoleGuideModal';
import { SecretRoleCardModal } from './SecretRoleCardModal';
import { PlayerPrivateScratchpad } from './PlayerPrivateScratchpad';
import { RuleSearchModal } from '../common/RuleSearchModal';
import { NightAudioWidget } from '../common/NightAudioWidget';
import { GameProfileModal } from '../common/GameProfileModal';
import { InteractiveMatrixModal } from '../common/InteractiveMatrixModal';
import { HouseRulesModal } from '../common/HouseRulesModal';
import { OnlineMeetingModal } from '../common/OnlineMeetingModal';
import { translations, isRtlLanguage } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';
import { Sliders, Bookmark } from 'lucide-react';

interface PlayerCityScreenProps {
  room: RoomState;
  currentPlayer: Player;
  onSendAccusation: (targetId: string) => void;
  onVote?: (targetPlayerId: string, voteValue: boolean) => void;
  language: Language;
}

export const PlayerCityScreen: React.FC<PlayerCityScreenProps> = ({
  room,
  currentPlayer,
  onSendAccusation,
  onVote,
  language
}) => {
  const t = translations[language] || translations.fa;
  const isRtl = isRtlLanguage(language);
  const isEn = language === 'en';
  const [activeTab, setActiveTab] = useState<'CITY' | 'ROLE_CARD' | 'SCRATCHPAD' | 'CHRONICLE' | 'MATRIX' | 'RULES'>('CITY');
  const [matrixSubTab, setMatrixSubTab] = useState<'MATRIX' | 'GRAPH'>('MATRIX');
  const [showSecretRoleModal, setShowSecretRoleModal] = useState(false);
  const [accuseTargetPlayer, setAccuseTargetPlayer] = useState<Player | null>(null);
  const [recentAccuseTarget, setRecentAccuseTarget] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isRoleGuideOpen, setIsRoleGuideOpen] = useState(false);
  const [isRuleSearchOpen, setIsRuleSearchOpen] = useState(false);
  const [isGameProfileOpen, setIsGameProfileOpen] = useState(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [isHouseRulesOpen, setIsHouseRulesOpen] = useState(false);
  const [isOnlineMeetingOpen, setIsOnlineMeetingOpen] = useState(false);
  const [guideInitialRole, setGuideInitialRole] = useState<RoleId>(currentPlayer.role || 'GODFATHER');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(soundEngine.getMuted());
  const [requestedChallenge, setRequestedChallenge] = useState(false);

  const roleDef = ROLE_DEFINITIONS[currentPlayer.role] || ROLE_DEFINITIONS.CITIZEN_SIMPLE;
  const livingPlayers = room.players.filter(p => p.isAlive);
  const deadPlayers = room.players.filter(p => !p.isAlive);
  const isNight = room.phase === 'NIGHT';

  // Join Link URL for QR Code
  const joinUrl = `${window.location.origin}${window.location.pathname}?join=${room.roomId}&token=${room.joinToken}`;

  useEffect(() => {
    QRCode.toDataURL(joinUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#ffffff',
        light: '#0a0a0c'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR generation error:', err));
  }, [joinUrl]);

  // Gentle night ambient noise during NIGHT phase on mobile / companion
  useEffect(() => {
    if (isNight) {
      soundEngine.startNightAmbiance(0.12);
    } else {
      soundEngine.stopNightAmbiance();
    }

    return () => {
      soundEngine.stopNightAmbiance();
    };
  }, [isNight]);

  const handleToggleMute = () => {
    const nextMute = !isAudioMuted;
    setIsAudioMuted(nextMute);
    soundEngine.setMuted(nextMute);
  };

  const copyJoinLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    soundEngine.playTick();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenGuide = (roleId?: RoleId) => {
    setGuideInitialRole(roleId || currentPlayer.role || 'GODFATHER');
    setIsRoleGuideOpen(true);
  };

  const handleConfirmAccuse = () => {
    if (!accuseTargetPlayer) return;
    soundEngine.playAccuse();
    onSendAccusation(accuseTargetPlayer.id);
    setRecentAccuseTarget(accuseTargetPlayer.name);
    setAccuseTargetPlayer(null);
    setTimeout(() => setRecentAccuseTarget(null), 3000);
  };

  // Request Challenge
  const handleRequestChallenge = async () => {
    soundEngine.playTick();
    setRequestedChallenge(true);
    try {
      await fetch(`/api/rooms/${room.roomId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REQUEST_CHALLENGE',
          payload: { playerId: currentPlayer.id }
        })
      });
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setRequestedChallenge(false), 8000);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-200 pb-16">
      
      {/* Live Voice / Video Meeting Banner */}
      {room.meetingUrl && (
        <div className="p-3 sm:p-4 rounded-3xl bg-gradient-to-r from-teal-500/20 via-emerald-500/15 to-teal-500/20 border border-teal-500/40 text-white shadow-lg shadow-teal-500/10 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-teal-500/30 border border-teal-500/50 flex items-center justify-center text-teal-300 shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-black text-teal-300 flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span>
                    {language === 'fa' 
                      ? 'اتاق آنلاین Google Meet فعال است' 
                      : language === 'ar' 
                      ? 'محادثة Google Meet المباشرة نشطة' 
                      : language === 'tr' 
                      ? 'Canlı Google Meet Odası Aktif' 
                      : 'Live Google Meet Active'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate">
                  {language === 'fa' 
                    ? 'همه بازیکنان در تماس تصویری حاضرند • این صفحه را برای دیدن کارت و رأی‌گیری باز نگه دارید' 
                    : 'Players in call • Keep app open for live card, timer & voting'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsOnlineMeetingOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                {language === 'fa' ? 'جزئیات' : 'Details'}
              </button>
              <a
                href={room.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-black font-black text-xs transition-all shadow-md flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'fa' ? 'ورود به میت' : 'Join Meet'}</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Live Interactive Voting Chamber Banner when Host opens voting */}
      {(() => {
        const votingState = (room as any).votingState;
        if (!votingState || !votingState.isOpen) return null;

        const targetP = room.players.find(p => p.id === votingState.targetPlayerId);
        const isDead = !currentPlayer.isAlive;
        const candidates = votingState.defenseCandidates || [];
        const isDuelRestricted = votingState.stage === 'EXIT_VOTE' && candidates.length === 2 && candidates.includes(currentPlayer.id);
        const myVote = votingState.votes?.[currentPlayer.id];
        const yesVotesCount = Object.values(votingState.votes || {}).filter(Boolean).length;
        const totalLiving = room.players.filter(p => p.isAlive).length;
        const threshold = votingState.stage === 'EXIT_VOTE' 
          ? Math.floor(totalLiving / 2) + 1 
          : Math.ceil(totalLiving / 2);

        const handleCastVote = async (value: boolean) => {
          soundEngine.playTick();
          if (onVote && votingState.targetPlayerId) {
            onVote(votingState.targetPlayerId, value);
          } else {
            try {
              await fetch(`/api/rooms/${room.roomId}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'SUBMIT_VOTE',
                  payload: { targetPlayerId: votingState.targetPlayerId, voteValue: value }
                })
              });
            } catch (e) {
              console.error('Failed to submit vote:', e);
            }
          }
        };

        return (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-950/80 via-neutral-900 to-amber-950/80 border-2 border-rose-500/60 shadow-2xl shadow-rose-950/50 space-y-3.5 animate-in slide-in-from-top-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Vote className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <h3 className="text-sm sm:text-base font-black text-white">
                      {votingState.stage === 'EXIT_VOTE' 
                        ? (isEn ? '🗳️ Live Exit Vote Chamber' : '🗳️ رأی‌گیری خروج از بازی (اعدام)') 
                        : (isEn ? '🗳️ Live Defense Entry Vote' : '🗳️ رأی‌گیری ورود به دفاعیه')}
                    </h3>
                  </div>
                  <p className="text-xs text-rose-200/80">
                    {votingState.stage === 'EXIT_VOTE'
                      ? (isEn ? 'Decide whether this suspect should be eliminated from the game.' : 'تصمیم‌گیری شهر برای خروج یا بقای متهم در بازی.')
                      : (isEn ? 'Vote whether this player should be brought to defense.' : 'رأی دهید آیا این بازیکن باید برای دفاع به جایگاه بیاید؟')}
                  </p>
                </div>
              </div>

              {targetP && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/60 border border-white/10">
                  <span className="text-2xl">{targetP.avatar}</span>
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <span className="text-xs font-black text-amber-300 block">{targetP.name}</span>
                    <span className="text-[10px] text-slate-400">صندلی #{targetP.seatNumber}</span>
                  </div>
                </div>
              )}
            </div>

            {isDead ? (
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center text-xs text-slate-400">
                {isEn ? 'You are eliminated and cannot cast votes.' : 'شما از بازی خارج شده‌اید و حق رأی ندارید.'}
              </div>
            ) : isDuelRestricted ? (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center text-xs text-amber-300">
                {isEn 
                  ? '⚠️ Duel Rule: Since exactly 2 suspects are on defense, you cannot vote for each other.'
                  : '⚠️ قانون دوئل دفاعیه: چون دقیقاً ۲ نفر در دفاع هستید، به یکدیگر حق رأی ندارید.'}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300">{isEn ? 'Current Yes Votes:' : 'مجموع آرای موافق:'}</span>
                    <span className="font-mono font-black text-amber-400 text-sm px-2 py-0.5 rounded-lg bg-black/60 border border-white/10">
                      {yesVotesCount} / {threshold} {isEn ? 'needed' : 'حدنصاب'}
                    </span>
                  </div>

                  {myVote !== undefined && (
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      myVote 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {myVote 
                        ? (isEn ? '✓ You voted: YES' : '✓ رأی شما: موافق خروج') 
                        : (isEn ? '✗ You voted: NO / Abstain' : '✗ رأی شما: مخالف')}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleCastVote(true)}
                    className={`py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                      myVote === true
                        ? 'bg-emerald-500 text-black ring-4 ring-emerald-500/30 scale-102'
                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{isEn ? 'Vote YES (Agree)' : 'رأی موافق (دست بالا 👍)'}</span>
                  </button>

                  <button
                    onClick={() => handleCastVote(false)}
                    className={`py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                      myVote === false
                        ? 'bg-rose-500 text-white ring-4 ring-rose-500/30 scale-102'
                        : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>{isEn ? 'Vote NO / Abstain' : 'مخالف / بدون رأی (دست پایین 👎)'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Top Mobile Status Header */}
      <div className={`p-5 rounded-3xl border transition-all shadow-xl backdrop-blur-md ${
        isNight ? 'bg-[#12121e] border-indigo-500/30 shadow-indigo-950/30' : 'bg-[#0f0f12] border-white/10'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-[#0a0a0c] rounded-2xl border border-white/10">
              {currentPlayer.avatar}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-[#e2e2e7] text-base sm:text-lg">{currentPlayer.name}</h2>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                  currentPlayer.isAlive
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {currentPlayer.isAlive ? (t.alive || (isEn ? 'Alive' : 'زنده')) : (t.eliminated || (isEn ? 'Eliminated 💀' : 'حذف‌شده 💀'))}
                </span>
                {currentPlayer.fouls && currentPlayer.fouls > 0 ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                    {currentPlayer.fouls} {t.foul || (isEn ? 'Foul' : 'خطا')}
                  </span>
                ) : null}
              </div>
              <span className="text-xs text-slate-400">{t.seatNumberLabel || (isEn ? 'Seat' : 'صندلی')} #{currentPlayer.seatNumber || '—'}</span>
            </div>
          </div>

          {/* Quick Access Tools: Meet & QR Code & Mute & Live Timer */}
          <div className="flex items-center gap-2">
            
            {/* Google Meet Online Call Button */}
            <button
              onClick={() => setIsOnlineMeetingOpen(true)}
              className="p-2.5 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title={isEn ? 'Google Meet Call Details' : 'اتاق آنلاین Google Meet'}
            >
              <Video className="w-4 h-4" />
              <span className="hidden md:inline">{isEn ? 'Meet' : 'گوگل میت'}</span>
            </button>

            {/* Quick Rule/FAQ Search Button */}
            <button
              onClick={() => setIsRuleSearchOpen(true)}
              className="p-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title={t.ruleSearch || (isEn ? 'Instant Mafia Rules & FAQ Search' : 'جستجوی فوری سوالات و قوانین مافیا')}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">{t.ruleSearch || (isEn ? 'Search Rules' : 'جستجوی قوانین')}</span>
            </button>

            {/* Quick QR Code Button */}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-amber-400 border border-white/10 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="QR Code"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">QR</span>
            </button>

            {/* Night Ambient Audio Mute Button */}
            <button
              onClick={handleToggleMute}
              className={`p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                isAudioMuted
                  ? 'bg-white/5 text-slate-500 border-white/10'
                  : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
              }`}
              title={isAudioMuted ? 'Muted' : 'Sound Active'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Live Timer */}
            <div className="flex items-center gap-2 pl-1">
              <div className="text-right hidden xs:block">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-300 justify-end">
                  {isNight ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{isNight ? t.nightNumber : t.dayNumber} {room.dayNumber}</span>
                </div>
                <span className="text-[11px] text-amber-400 font-bold block">
                  {translations[language][`phase_${room.phase}`] || room.phase}
                </span>
              </div>

              <div className="px-3.5 py-1.5 rounded-2xl bg-[#0a0a0c] border border-white/10 font-mono font-bold text-base sm:text-lg text-amber-400">
                {formatTimer(room.timerSeconds)}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Primary Sticky Top Tab Navigation for Player Screen */}
      <div className="sticky top-12 sm:top-14 z-30 bg-[#090b11]/90 backdrop-blur-xl py-2 px-1 border-y border-white/[0.08] shadow-xl space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          <button
            onClick={() => {
              soundEngine.playTick();
              setActiveTab('CITY');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 active:scale-95 ${
              activeTab === 'CITY'
                ? 'bg-amber-500 text-black shadow-sm font-black'
                : 'text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>{t.tabCitySquare || (isEn ? 'City Square' : 'میدان شهر')} ({livingPlayers.length})</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTick();
              setActiveTab('ROLE_CARD');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 active:scale-95 ${
              activeTab === 'ROLE_CARD'
                ? 'bg-amber-500 text-black shadow-sm font-black'
                : 'text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span>{t.tabRoleCard || (isEn ? 'My Role Card' : 'کارت نقش من')}</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTick();
              setActiveTab('SCRATCHPAD');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 active:scale-95 ${
              activeTab === 'SCRATCHPAD'
                ? 'bg-amber-500 text-black shadow-sm font-black'
                : 'text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>{t.tabScratchpad || (isEn ? 'Scratchpad' : 'دفترچه یادداشت')}</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTick();
              setActiveTab('CHRONICLE');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 active:scale-95 ${
              activeTab === 'CHRONICLE'
                ? 'bg-amber-500 text-black shadow-sm font-black'
                : 'text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5 shrink-0" />
            <span>{t.tabChronicle || (isEn ? 'Daily Chronicle' : 'وقایع‌نامه')}</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTick();
              setActiveTab('MATRIX');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 active:scale-95 ${
              activeTab === 'MATRIX'
                ? 'bg-amber-500 text-black shadow-sm font-black'
                : 'text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
            }`}
          >
            <Table className="w-3.5 h-3.5 shrink-0" />
            <span>{t.tabAccusationMatrix || (isEn ? 'Accusation Matrix' : 'ماتریس اتهامات')}</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTick();
              setActiveTab('RULES');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 active:scale-95 ${
              activeTab === 'RULES'
                ? 'bg-amber-500 text-black shadow-sm font-black'
                : 'text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>{t.tabRuleSearch || (isEn ? 'Rules' : 'قوانین')}</span>
          </button>
        </div>

        {/* Sub-tab for MATRIX */}
        {activeTab === 'MATRIX' && (
          <div className="flex items-center gap-1.5 pt-1 border-t border-white/5 overflow-x-auto">
            <button
              onClick={() => setMatrixSubTab('MATRIX')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                matrixSubTab === 'MATRIX' ? 'bg-white/20 text-white font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.matrixNumeric || (isEn ? 'Numeric Accusation Matrix' : 'ماتریس عددی اتهامات')}
            </button>
            <button
              onClick={() => setMatrixSubTab('GRAPH')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                matrixSubTab === 'GRAPH' ? 'bg-white/20 text-white font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.interactionGraph || (isEn ? 'City Interaction Graph' : 'گراف ارتباطی شهر')}
            </button>
          </div>
        )}
      </div>

      {/* Success Accusation Toast */}
      {recentAccuseTarget && (
        <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 shadow-lg">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>{isEn ? `Your target against "${recentAccuseTarget}" was recorded in city matrix!` : `اتهام مستقیم شما علیه «${recentAccuseTarget}» در ماتریس شهر ثبت شد!`}</span>
        </div>
      )}

      {/* TAB 1: CITY (میدان شهر) */}
      {activeTab === 'CITY' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Quick Action Bar in City */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#0f0f12] border border-white/10 rounded-2xl">
            <div>
              <h4 className="text-sm font-bold text-white">{t.activePlayersList || 'فهرست بازیکنان فعال و صندلی‌ها'}</h4>
              <p className="text-xs text-slate-400">{t.clickToAccuse || 'روی هر بازیکن کلیک کنید تا به او اتهام بزنید یا سابقه‌اش را ببینید.'}</p>
            </div>
            {!isNight && currentPlayer.isAlive && (
              <button
                onClick={handleRequestChallenge}
                disabled={requestedChallenge}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  requestedChallenge
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{requestedChallenge ? (t.challengeRequested || 'درخواست چالش ارسال شد') : (t.requestChallengeTime || 'درخواست چالش وقت ⚡')}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {room.players.map((p) => {
              const isSelf = p.id === currentPlayer.id;
              const isDead = !p.isAlive;

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isDead
                      ? 'bg-[#09090b] border-white/5 opacity-50'
                      : isSelf
                      ? 'bg-[#0f0f12]/60 border-white/5'
                      : 'bg-[#0f0f12] border-white/10 hover:border-white/20 shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1 bg-[#0a0a0c] rounded-xl border border-white/10">
                      {p.avatar}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className={`font-bold text-sm ${isDead ? 'line-through text-slate-500' : 'text-[#e2e2e7]'}`}>
                          {p.name}
                        </h4>
                        {isSelf && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30">
                            {language === 'fa' ? 'شما' : language === 'ar' ? 'أنت' : language === 'tr' ? 'Sen' : 'You'}
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-slate-400 font-mono">
                          {t.seatNumberLabel || (isEn ? 'Seat' : 'صندلی')} {p.seatNumber || '—'}
                        </span>
                      </div>
                      <span className={`text-xs block mt-0.5 ${isDead ? 'text-slate-600' : 'text-slate-400'}`}>
                        {isDead ? (t.deadStatus || (isEn ? 'Eliminated' : 'از بازی خارج شده')) : (t.aliveStatus || (isEn ? 'Active Citizen' : 'شهروند فعال'))}
                      </span>
                    </div>
                  </div>

                  {!isSelf && !isDead && (
                    <button
                      onClick={() => setAccuseTargetPlayer(p)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Target className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t.accuseButton || (isEn ? 'Shoot Accusation' : 'شلیک اتهام')}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ROLE_CARD (کارت نقش من) */}
      {activeTab === 'ROLE_CARD' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-[#0f0f12] border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">{t.secretRoleCard || (isEn ? 'Confidential Role Card & Night Mission' : 'کارت نقش محرمانه و وظایف شب')}</h3>
                  <p className="text-xs text-slate-400">
                    {language === 'fa' ? 'نقش شما فقط برای خودتان و گرداننده مسابقه محرمانه است.' : language === 'ar' ? 'دورك سري لك وللراوي فقط.' : language === 'tr' ? 'Rolünüz yalnızca sizinle moderatör arasında gizlidir.' : 'Your role is confidential to you and the host.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSecretRoleModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>{t.viewRoleCardFull || (isEn ? 'Full Screen View with Security Lock' : 'نمایش تمام‌صفحه با قفل امنیتی')}</span>
              </button>
            </div>

            {/* Quick Preview Card Body */}
            {(() => {
              const completeRole = getCompleteRoleInfo(currentPlayer.role, language);
              return (
                <div className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">{t.assignedRoleToYou || (isEn ? 'Role Assigned to You:' : 'نقش اختصاص‌یافته به شما:')}</span>
                      <h2 className="text-2xl font-black text-amber-400 flex items-center gap-2">
                        <span>{currentPlayer.customRoleName || completeRole.localizedName}</span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-normal">
                          {currentPlayer.customRoleAffiliation
                            ? (currentPlayer.customRoleAffiliation === 'MAFIA' ? (isEn ? 'Mafia Team' : 'تیم مافیا') : currentPlayer.customRoleAffiliation === 'INDEPENDENT' ? (isEn ? 'Independent' : 'نقش مستقل') : (isEn ? 'Citizen Team' : 'تیم شهروند'))
                            : completeRole.localizedAffiliation}
                        </span>
                      </h2>
                    </div>
                    <div className="text-3xl p-3 bg-white/5 rounded-2xl border border-white/10">
                      {currentPlayer.avatar}
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                    <strong className="text-amber-300 block mb-1.5">{t.roleMissionDesc || (isEn ? 'Abilities & Night Mission:' : 'شرح توانایی و ماموریت:')}</strong>
                    <p>{completeRole.localizedDescription}</p>
                  </div>

                  {completeRole.localizedActs && completeRole.localizedActs.length > 0 && (
                    <div className="space-y-2">
                      {completeRole.localizedActs.map((act, idx) => (
                        <div key={idx} className="text-xs text-amber-200/90 leading-relaxed bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 flex items-start gap-2">
                          <Moon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block mb-0.5 text-amber-400">{act.title}:</strong>
                            <span>{act.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {completeRole.localizedExceptions && completeRole.localizedExceptions.length > 0 && (
                    <div className="text-xs text-amber-300/85 bg-black/40 p-3 rounded-xl border border-zinc-800 space-y-1">
                      <strong className="block text-amber-400 font-bold">{isEn ? 'Important Exceptions & Guidelines:' : 'استثناها و نکات کلیدی:'}</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                        {completeRole.localizedExceptions.map((ex, idx) => (
                          <li key={idx}>{ex}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 3: SCRATCHPAD (دفترچه یادداشت) */}
      {activeTab === 'SCRATCHPAD' && (
        <PlayerPrivateScratchpad
          room={room}
          currentPlayer={currentPlayer}
          language={language}
        />
      )}

      {/* TAB 4: CHRONICLE (وقایع‌نامه) */}
      {activeTab === 'CHRONICLE' && (
        <div className="p-6 bg-[#0f0f12] border border-white/10 rounded-3xl space-y-4 animate-in fade-in">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Newspaper className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-[#e2e2e7] text-base">{t.officialDailyChronicle || (isEn ? 'Official Daily Chronicle' : 'وقایع‌نامه و اخبار روزنامه شهر')}</h3>
          </div>

          <div className="p-4 rounded-2xl bg-[#0a0a0c] border border-white/10 text-sm text-slate-200 leading-relaxed font-serif">
            {room.morningChronicle || (
              <span className="text-slate-500 italic">
                {t.noChronicleYet || (isEn ? "The host has not published a morning report yet." : "هنوز گرداننده گزارشی از وقایع دیشب منتشر نکرده است.")}
              </span>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: MATRIX (ماتریس اتهام و گراف تعامل) */}
      {activeTab === 'MATRIX' && (
        <div className="space-y-4 animate-in fade-in">
          {matrixSubTab === 'MATRIX' ? (
            <AccusationMatrixView 
              players={room.players} 
              accusations={room.accusations} 
              onAddAccusation={(_accuserId, targetId) => onSendAccusation(targetId)} 
              language={language} 
            />
          ) : (
            <AccusationGraphView 
              players={room.players} 
              accusations={room.accusations} 
              onAddAccusation={(_accuserId, targetId) => onSendAccusation(targetId)} 
              language={language} 
            />
          )}
        </div>
      )}

      {/* TAB 6: RULES (قوانین و راهنماها) */}
      {activeTab === 'RULES' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                soundEngine.playTick();
                setIsGameProfileOpen(true);
              }}
              className={`p-4 rounded-2xl bg-[#12121e] border border-amber-500/30 hover:border-amber-500 hover:bg-[#18182a] transition-all flex items-center justify-between ${isRtl ? 'text-right' : 'text-left'} cursor-pointer group`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200 group-hover:text-amber-300">{t.gameProfile || (isEn ? "Game Profile" : "شناسنامه بازی")}</div>
                  <div className="text-xs text-slate-400">{t.gameProfileDesc || (isEn ? "Role composition & factions" : "ترکیب نقش‌ها و تعداد سایدها")}</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                soundEngine.playTick();
                setIsMatrixModalOpen(true);
              }}
              className={`p-4 rounded-2xl bg-[#12121e] border border-white/10 hover:border-amber-500/40 hover:bg-[#18182a] transition-all flex items-center justify-between ${isRtl ? 'text-right' : 'text-left'} cursor-pointer group`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200 group-hover:text-amber-300">{t.scenarioTable17 || (isEn ? "17 Scenarios Matrix" : "جدول ۱۷ سناریو")}</div>
                  <div className="text-xs text-slate-400">{t.scenarioTable17Desc || (isEn ? "Role interactions across scenarios" : "تلاقی تمام نقش‌ها در مسابقات")}</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                soundEngine.playTick();
                setIsHouseRulesOpen(true);
              }}
              className={`p-4 rounded-2xl bg-[#12121e] border border-white/10 hover:border-amber-500/40 hover:bg-[#18182a] transition-all flex items-center justify-between ${isRtl ? 'text-right' : 'text-left'} cursor-pointer group`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-300 flex-shrink-0">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200 group-hover:text-amber-300">{t.tableRules || (isEn ? "Table Rules" : "قوانین میز")}</div>
                  <div className="text-xs text-slate-400">{t.tableRulesDesc || (isEn ? "Disciplinary code & turns" : "توافق‌نامه انضباطی و نوبت‌دهی")}</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                soundEngine.playTick();
                setIsRuleSearchOpen(true);
              }}
              className={`p-4 rounded-2xl bg-[#12121e] border border-white/10 hover:border-amber-500/40 hover:bg-[#18182a] transition-all flex items-center justify-between ${isRtl ? 'text-right' : 'text-left'} cursor-pointer group`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200 group-hover:text-amber-300">{t.ruleSearch || (isEn ? "Search Rules" : "جستجوی قوانین")}</div>
                  <div className="text-xs text-slate-400">{t.ruleSearchDesc || (isEn ? "Answers to FAQs & rules" : "پاسخ به سوالات متداول و شبهات بازی")}</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Secret Role Card Modal */}
      <SecretRoleCardModal
        isOpen={showSecretRoleModal}
        onClose={() => setShowSecretRoleModal(false)}
        player={currentPlayer}
        language={language}
      />

      {/* Accusation Confirmation Modal */}
      {accuseTargetPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className={`bg-[#0f0f12] border border-amber-500/40 rounded-3xl p-6 w-full max-w-sm ${isRtl ? 'text-right' : 'text-left'} space-y-4 shadow-2xl`} dir={isRtl ? "rtl" : "ltr"}>
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 bg-[#0a0a0c] rounded-2xl border border-white/10">
                {accuseTargetPlayer.avatar}
              </span>
              <div>
                <h3 className="font-extrabold text-[#e2e2e7] text-base">{t.targetShootConfirm || (isEn ? "Register Target & Accusation" : "ثبت تارگت و شلیک اتهام")}</h3>
                <p className="text-xs text-slate-400">{isEn ? `Do you want to accuse "${accuseTargetPlayer.name}"?` : `آیا می‌خواهید به «${accuseTargetPlayer.name}» اتهام بزنید؟`}</p>
              </div>
            </div>

            <p className="text-xs text-amber-300/90 leading-relaxed bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
              {t.accusationReflectNote || (isEn ? "This accusation is immediately reflected on the host screen and interaction graph." : "این اتهام بلافاصله روی نمایشگر گرداننده (گاد) و نمودار تحلیل تعاملات تمام بازیکنان منعکس می‌شود.")}
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setAccuseTargetPlayer(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer"
              >
                {t.cancel || (isEn ? "Cancel" : "انصراف")}
              </button>
              <button
                onClick={handleConfirmAccuse}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold shadow-lg shadow-amber-500/25 cursor-pointer"
              >
                {t.confirmAccuseBtn || (isEn ? "Confirm Accusation 🎯" : "تایید شلیک اتهام 🎯")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Quick Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f0f12] border border-white/10 rounded-3xl p-6 w-full max-w-sm text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-[#e2e2e7] text-sm">{t.qrCodeRoomTitle || (isEn ? "Room QR Code" : "QR کد ورود به اتاق")}</h3>
              <button onClick={() => setIsQrModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="bg-white p-3 rounded-2xl w-fit mx-auto shadow-xl">
              {qrDataUrl && <img src={qrDataUrl} alt="Room QR Code" className="w-56 h-56 rounded-xl" />}
            </div>

            <div className="text-xs text-slate-400">
              {t.roomCode || (isEn ? "Room Code" : "کد اتاق")}: <span className="text-amber-400 font-mono font-bold text-sm">{room.roomId}</span>
            </div>

            <button
              onClick={copyJoinLink}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? (t.linkCopied || (isEn ? 'Link copied!' : 'لینک کپی شد!')) : (t.copyDirectLink || (isEn ? 'Copy direct join link' : 'کپی لینک مستقیم ورود'))}</span>
            </button>
          </div>
        </div>
      )}

      {/* Role Guide Modal */}
      <RoleGuideModal
        isOpen={isRoleGuideOpen}
        onClose={() => setIsRoleGuideOpen(false)}
        initialRoleId={guideInitialRole}
        language={language}
      />

      {/* Instant Rules & FAQ Search Modal */}
      <RuleSearchModal
        isOpen={isRuleSearchOpen}
        onClose={() => setIsRuleSearchOpen(false)}
        language={language}
      />

      {/* Game Match Profile Modal */}
      <GameProfileModal
        isOpen={isGameProfileOpen}
        onClose={() => setIsGameProfileOpen(false)}
        room={room}
        isHost={false}
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

      {/* 17 Scenarios Matrix Modal */}
      <InteractiveMatrixModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
        language={language}
        initialScenarioId={room.scenarioId}
      />

      {/* House Rules Agreement Modal (Read-Only for player) */}
      <HouseRulesModal
        isOpen={isHouseRulesOpen}
        onClose={() => setIsHouseRulesOpen(false)}
        currentRules={room.houseRules}
        isHost={false}
        language={language}
      />

      {/* Online Video / Google Meet Meeting Modal */}
      <OnlineMeetingModal
        isOpen={isOnlineMeetingOpen}
        onClose={() => setIsOnlineMeetingOpen(false)}
        room={room}
        isHost={false}
        language={language}
      />

    </div>
  );
};
