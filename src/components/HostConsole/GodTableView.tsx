import React, { useState, useEffect } from 'react';
import { 
  Crown, Skull, Shield, Target, Search, Heart, 
  User, Sparkles, Volume2, VolumeX, Eye, EyeOff, 
  Check, ArrowRight, Sun, Moon, Zap, Edit3, Trash2, 
  AlertTriangle, RotateCcw, Award, Play, BookOpen, Layers,
  Shuffle, Clock, Vote, MessageSquare, AlertCircle, Users, Copy, QrCode, Plus, Minus
} from 'lucide-react';
import { Player, RoleId, RoomState, Language, DeckRoleItem } from '../../types/mafia';
import { ROLE_DEFINITIONS, DEFAULT_SCENARIOS } from '../../utils/scenarios';
import { translations, isRtlLanguage } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';
import { DeckBuilderModal } from './DeckBuilderModal';
import { VotingDefenseModal } from './VotingDefenseModal';

export const getScenarioCapacity = (scenarioId?: string): number => {
  if (!scenarioId) return 9;
  const found = DEFAULT_SCENARIOS.find(s => s.id === scenarioId || s.id.toLowerCase() === scenarioId.toLowerCase());
  if (found) {
    if (found.roles && found.roles.length > 0) return found.roles.length;
    if (found.recommendedPlayerCount) return found.recommendedPlayerCount;
  }
  return 9;
};

export type SeatSlot =
  | { type: 'OCCUPIED'; seatNumber: number; player: Player }
  | { type: 'EMPTY'; seatNumber: number };

interface GodTableViewProps {
  room: RoomState;
  onKillPlayer: (playerId: string) => void;
  onRevivePlayer: (playerId: string) => void;
  onKickPlayer: (playerId: string) => void;
  onRenamePlayer: (playerId: string, newName: string) => void;
  onChangeRole: (playerId: string, newRole: RoleId) => void;
  onSendToDefense: (playerId: string) => void;
  onAccuseOnBehalf: (accuserId: string, targetId: string) => void;
  onNextPhase: () => void;
  onOpenDailyChronicle: () => void;
  onOpenNightEngine: () => void;
  onOpenRoleGuide?: (roleId?: RoleId) => void;
  onHostAction?: (actionType: string, payload?: any) => void;
  onAddPlayer?: (name?: string, seatNumber?: number, role?: RoleId) => void;
  onStartGame?: () => void;
  onResolveTie?: (resolution: 'REVOTE' | 'NO_ELIMINATION' | 'RANDOM_DRAW' | 'ELIMINATE_BOTH', candidateIds: string[]) => void;
  language: Language;
}

// Role specific visual icons matching the uploaded reference
export const getRoleIcon = (roleId: RoleId) => {
  switch (roleId) {
    case 'GODFATHER':
      return (
        <span className="text-2xl sm:text-3xl select-none" role="img" aria-hidden="true">
          🎩
        </span>
      );
    case 'MAFIA_SIMPLE':
      return (
        <span className="text-2xl sm:text-3xl select-none filter drop-shadow" role="img" aria-hidden="true">
          🔫
        </span>
      );
    case 'DOCTOR_LECTER':
      return (
        <span className="text-2xl sm:text-3xl select-none" role="img" aria-hidden="true">
          💉
        </span>
      );
    case 'TERRORIST':
      return (
        <span className="text-2xl sm:text-3xl select-none" role="img" aria-hidden="true">
          💣
        </span>
      );
    case 'NATASHA':
      return (
        <span className="text-2xl sm:text-3xl select-none" role="img" aria-hidden="true">
          🤐
        </span>
      );
    case 'DETECTIVE':
      return (
        <span className="text-2xl sm:text-3xl select-none" role="img" aria-hidden="true">
          🔍
        </span>
      );
    case 'DOCTOR':
      return (
        <span className="text-2xl sm:text-3xl select-none" role="img" aria-hidden="true">
          🩺
        </span>
      );
    case 'SNIPER':
      return (
        <span className="text-2xl sm:text-3xl select-none" role="img" aria-hidden="true">
          🎯
        </span>
      );
    case 'ARMORED':
      return (
        <span className="text-2xl sm:text-3xl select-none" role="img" aria-hidden="true">
          🛡️
        </span>
      );
    case 'MAYOR':
      return (
        <span className="text-2xl sm:text-3xl select-none" role="img" aria-hidden="true">
          🏛️
        </span>
      );
    case 'PSYCHOLOGIST':
      return (
        <span className="text-2xl sm:text-3xl select-none" role="img" aria-hidden="true">
          🧠
        </span>
      );
    case 'DIE_HARD':
      return (
        <span className="text-2xl sm:text-3xl select-none" role="img" aria-hidden="true">
          🎖️
        </span>
      );
    case 'CITIZEN_SIMPLE':
      return (
        <span className="text-2xl sm:text-3xl select-none opacity-80" role="img" aria-hidden="true">
          👤
        </span>
      );
    case 'JOKER':
      return (
        <span className="text-2xl sm:text-3xl select-none" role="img" aria-hidden="true">
          🃏
        </span>
      );
    default:
      return (
        <span className="text-2xl sm:text-3xl select-none" role="img" aria-hidden="true">
          👤
        </span>
      );
  }
};

export const GodTableView: React.FC<GodTableViewProps> = ({
  room,
  onKillPlayer,
  onRevivePlayer,
  onKickPlayer,
  onRenamePlayer,
  onChangeRole,
  onSendToDefense,
  onAccuseOnBehalf,
  onNextPhase,
  onOpenDailyChronicle,
  onOpenNightEngine,
  onOpenRoleGuide,
  onHostAction,
  onAddPlayer,
  onStartGame,
  onResolveTie,
  language
}) => {
  const t = translations[language] || translations.fa;
  const isRtl = isRtlLanguage(language);
  const isEn = language === 'en';
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [accuseSourcePlayer, setAccuseSourcePlayer] = useState<Player | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [isDeckBuilderOpen, setIsDeckBuilderOpen] = useState(false);
  const [isVotingModalOpen, setIsVotingModalOpen] = useState(false);
  const [showShuffleConfirmModal, setShowShuffleConfirmModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'STADIUM' | 'GRID'>('STADIUM');

  // Quick seat filling modal state
  const [emptySeatTarget, setEmptySeatTarget] = useState<number | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<RoleId>('CITIZEN_SIMPLE');
  const [tableCapacityOverride, setTableCapacityOverride] = useState<number | null>(null);
  const [quickAddName, setQuickAddName] = useState('');

  // Local speaker timer ticker
  const [speakerSeconds, setSpeakerSeconds] = useState<number>((room as any).speakerTimeRemaining || 60);
  const isSpeakerRunning = (room as any).isSpeakerTimerRunning || false;
  const activeSpeakerId = (room as any).activeSpeakerId;
  const activeSpeakerType = (room as any).activeSpeakerType || 'SPEECH';
  const activeSpeakerPlayer = room.players.find(p => p.id === activeSpeakerId);

  useEffect(() => {
    if ((room as any).speakerTimeRemaining !== undefined) {
      setSpeakerSeconds((room as any).speakerTimeRemaining);
    }
  }, [(room as any).speakerTimeRemaining]);

  useEffect(() => {
    let interval: any = null;
    if (isSpeakerRunning && speakerSeconds > 0) {
      interval = setInterval(() => {
        setSpeakerSeconds(prev => {
          const next = prev - 1;
          if (next <= 5 && next > 0) {
            soundEngine.playWarningBeep();
          } else if (next === 0) {
            soundEngine.playEndBuzzer();
            if (onHostAction) {
              onHostAction('STOP_SPEAKER_TIMER');
            }
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSpeakerRunning, speakerSeconds, onHostAction]);

  const players = [...room.players].sort((a, b) => (a.seatNumber || 0) - (b.seatNumber || 0));

  // Determine total seats based on scenario capacity, manual override, or current players count
  const scenarioCapacity = tableCapacityOverride !== null 
    ? tableCapacityOverride 
    : getScenarioCapacity(room.scenarioId);
  const targetCapacity = Math.max(room.players.length, scenarioCapacity, 9);

  // Build seatSlots array (occupied vs empty)
  const seatSlots: SeatSlot[] = [];
  for (let sNum = 1; sNum <= targetCapacity; sNum++) {
    const found = room.players.find(p => p.seatNumber === sNum) ||
                  (!room.players.some(p => p.seatNumber === sNum) && room.players[sNum - 1] && !room.players[sNum - 1].seatNumber ? room.players[sNum - 1] : undefined);
    if (found) {
      seatSlots.push({ type: 'OCCUPIED', seatNumber: sNum, player: found });
    } else {
      seatSlots.push({ type: 'EMPTY', seatNumber: sNum });
    }
  }

  const total = seatSlots.length;

  // Calculate balanced, symmetrical perimeter distribution around the 4 sides of the table
  let topCount = 0;
  let bottomCount = 0;
  let leftCount = 0;
  let rightCount = 0;

  if (total <= 6) {
    topCount = Math.ceil(total / 2);
    bottomCount = Math.floor(total / 2);
    rightCount = 0;
    leftCount = 0;
  } else if (total <= 8) {
    topCount = 3;
    rightCount = 1;
    bottomCount = 3;
    leftCount = total - 7;
  } else if (total <= 10) {
    topCount = 3;
    rightCount = 2;
    bottomCount = 3;
    leftCount = total - 8;
  } else if (total <= 12) {
    topCount = 4;
    rightCount = 2;
    bottomCount = 4;
    leftCount = total - 10;
  } else if (total <= 14) {
    topCount = 4;
    rightCount = 3;
    bottomCount = 4;
    leftCount = total - 11;
  } else {
    // 15+ players
    const side = Math.floor((total - 8) / 2);
    topCount = 4 + Math.ceil(side / 2);
    bottomCount = 4 + Math.floor(side / 2);
    rightCount = 2;
    leftCount = total - topCount - bottomCount - rightCount;
  }

  const topSlots = seatSlots.slice(0, topCount);
  const rightSlots = seatSlots.slice(topCount, topCount + rightCount);
  const bottomSlots = seatSlots.slice(topCount + rightCount, topCount + rightCount + bottomCount).reverse();
  const leftSlots = seatSlots.slice(topCount + rightCount + bottomCount, total).reverse();

  const isNight = room.phase === 'NIGHT';
  const isDay = !isNight;
  const livingCitizens = room.players.filter(p => p.isAlive && (ROLE_DEFINITIONS[p.role]?.affiliation === 'CITIZEN' || p.customRoleAffiliation === 'CITIZEN'));
  const livingMafia = room.players.filter(p => p.isAlive && (ROLE_DEFINITIONS[p.role]?.affiliation === 'MAFIA' || p.customRoleAffiliation === 'MAFIA'));

  // Copy Room Link
  const handleCopyInvite = () => {
    const url = `${window.location.origin}/?room=${room.roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    soundEngine.playTick();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Handle clicking a player seat tile
  const handlePlayerTileClick = (player: Player) => {
    if (accuseSourcePlayer) {
      if (accuseSourcePlayer.id !== player.id) {
        soundEngine.playAccuse();
        onAccuseOnBehalf(accuseSourcePlayer.id, player.id);
      }
      setAccuseSourcePlayer(null);
      return;
    }

    soundEngine.playTick();
    setSelectedPlayer(player);
    setNameInput(player.name);
    setIsRenaming(false);
    setShowRoleSelect(false);
  };

  const handleToggleKill = (player: Player) => {
    if (player.isAlive) {
      soundEngine.playGunshot();
      onKillPlayer(player.id);
    } else {
      soundEngine.playGong();
      onRevivePlayer(player.id);
    }
    setSelectedPlayer(null);
  };

  const handleStartAccuseFromSelected = () => {
    if (!selectedPlayer) return;
    setAccuseSourcePlayer(selectedPlayer);
    setSelectedPlayer(null);
  };

  const handleSaveRename = () => {
    if (selectedPlayer && nameInput.trim()) {
      onRenamePlayer(selectedPlayer.id, nameInput.trim());
      setIsRenaming(false);
      setSelectedPlayer(null);
    }
  };

  const handleRoleChange = (newRole: RoleId) => {
    if (selectedPlayer) {
      onChangeRole(selectedPlayer.id, newRole);
      setShowRoleSelect(false);
      setSelectedPlayer(null);
      soundEngine.playTick();
    }
  };

  // Start Speech Timer
  const handleStartSpeechTimer = (player: Player, type: 'SPEECH' | 'CHALLENGE') => {
    soundEngine.playTick();
    const duration = type === 'SPEECH' ? ((room as any).defaultSpeechSeconds || 60) : ((room as any).defaultChallengeSeconds || 30);
    setSpeakerSeconds(duration);
    if (onHostAction) {
      onHostAction('START_SPEAKER_TIMER', {
        playerId: player.id,
        speakerType: type,
        seconds: duration
      });
    }
    setSelectedPlayer(null);
  };

  // Stop Speaker Timer
  const handleStopSpeakerTimer = () => {
    soundEngine.playTick();
    if (onHostAction) {
      onHostAction('STOP_SPEAKER_TIMER');
    }
  };

  // Fouls Management
  const handleAddFoul = (player: Player) => {
    soundEngine.playFoulSound();
    if (onHostAction) {
      onHostAction('RECORD_FOUL', { playerId: player.id });
    }
  };

  const handleRemoveFoul = (player: Player) => {
    soundEngine.playTick();
    if (onHostAction) {
      onHostAction('REMOVE_FOUL', { playerId: player.id });
    }
  };

  // Toggle Mute
  const handleToggleMute = (player: Player) => {
    soundEngine.playTick();
    if (onHostAction) {
      onHostAction('MUTE_SPEECH', { playerId: player.id });
    }
  };

  // Shuffle Table
  const handleConfirmShuffleTable = () => {
    soundEngine.playGong();
    setShowShuffleConfirmModal(false);
    if (onHostAction) {
      onHostAction('SHUFFLE_TABLE');
    }
  };

  // Deal Roles
  const handleDealRoles = () => {
    soundEngine.playRoleReveal();
    if (onHostAction) {
      onHostAction('DISTRIBUTE_ROLES');
    }
  };

  // Handle Deck Updated
  const handleConfirmDeck = (deck: DeckRoleItem[]) => {
    if (onHostAction) {
      onHostAction('SET_DECK', { deckRoles: deck });
    }
  };

  // Render an individual seat square tile
  const renderSeatTile = (player: Player) => {
    const roleDef = ROLE_DEFINITIONS[player.role] || ROLE_DEFINITIONS.CITIZEN_SIMPLE;
    const isDead = !player.isAlive;
    const isHost = Boolean(player.isHost);
    const isMafia = !isHost && (roleDef.affiliation === 'MAFIA' || player.customRoleAffiliation === 'MAFIA');
    const isCitizen = !isHost && (roleDef.affiliation === 'CITIZEN' || player.customRoleAffiliation === 'CITIZEN');
    const isTargeting = accuseSourcePlayer?.id === player.id;
    const isAccused = room.accusations.some(a => a.targetId === player.id);
    const isSpeaking = activeSpeakerId === player.id;
    const foulsCount = player.fouls || 0;
    const isMuted = player.speechMuted;

    // Adaptive sizing for 9 to 21 players
    const sizeClasses = total >= 16 
      ? 'w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-xl sm:rounded-2xl'
      : total >= 12
      ? 'w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 rounded-xl sm:rounded-2xl'
      : 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl';

    const labelMaxWidth = total >= 16 ? 'max-w-[50px] sm:max-w-[65px] md:max-w-[80px]' : 'max-w-[65px] sm:max-w-[85px]';

    return (
      <div 
        key={player.id} 
        onClick={() => handlePlayerTileClick(player)}
        className="flex flex-col items-center group cursor-pointer select-none transition-all active:scale-95 duration-150"
      >
        {/* The Card Pod */}
        <div 
          className={`relative ${sizeClasses} flex items-center justify-center rounded-2xl transition-all ${
            isDead
              ? 'bg-black/60 border border-white/5 opacity-40 grayscale'
              : isSpeaking
              ? 'bg-amber-500/20 border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-105'
              : isTargeting
              ? 'bg-amber-500/15 border border-amber-400 shadow-md shadow-amber-500/20 scale-105'
              : isHost
              ? 'bg-[#18130c] border border-amber-500/50 shadow-md shadow-amber-950/40 hover:border-amber-400'
              : isMafia
              ? 'bg-[#180e12] border border-rose-500/50 shadow-md shadow-rose-950/30 hover:border-rose-400'
              : isCitizen
              ? 'bg-[#0d1422] border border-sky-500/50 shadow-md shadow-sky-950/30 hover:border-sky-400'
              : 'bg-[#14100c] border border-amber-500/50 shadow-md shadow-amber-950/30 hover:border-amber-400'
          }`}
        >
          {/* Seat Number Badge */}
          <div className="absolute top-1.5 right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-black/80 border border-white/10 flex items-center justify-center text-[8px] sm:text-[9px] font-mono font-bold text-slate-300">
            {player.seatNumber || '•'}
          </div>

          {/* Role Seen Green Indicator per Requirement 5 */}
          {player.roleRevealedAndConfirmed && !isDead && (
            <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-emerald-500 border border-black flex items-center justify-center text-[9px] text-black font-extrabold shadow-sm" title={t.roleSeenByPlayer || (isEn ? "Role confirmed by player" : "نقش توسط بازیکن مشاهده شد")}>
              ✓
            </div>
          )}

          {/* Defense status indicator */}
          {player.inDefense && (
            <div className="absolute -top-1 -left-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-black font-extrabold text-[7px] sm:text-[8px] shadow">
              {t.defense || 'DEF'}
            </div>
          )}

          {/* Muted Speech badge */}
          {isMuted && (
            <div className="absolute -bottom-1 -left-1 px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[7px] font-bold">
              {t.silenced || 'MUTE'}
            </div>
          )}

          {/* Fouls Indicators Dots */}
          {foulsCount > 0 && (
            <div className="absolute -top-1.5 right-1/2 translate-x-1/2 flex items-center gap-0.5 bg-black/90 px-1.5 py-0.5 rounded-full border border-rose-500/40">
              {Array.from({ length: foulsCount }).map((_, i) => (
                <span key={i} className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-rose-500"></span>
              ))}
            </div>
          )}

          {/* Accused marker */}
          {isAccused && !isDead && (
            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-rose-500 text-white shadow animate-ping">
              <span className="block w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          )}

          {/* Role Icon */}
          <div className="flex items-center justify-center">
            {isDead ? (
              <Skull className="w-5 h-5 sm:w-7 sm:h-7 text-rose-500/80" />
            ) : isHost ? (
              <span className="text-2xl sm:text-3xl select-none" role="img" aria-hidden="true">
                👑
              </span>
            ) : (
              getRoleIcon(player.role)
            )}
          </div>
        </div>

        {/* Name & Role Text Under Tile */}
        <div className={`mt-1.5 text-center ${labelMaxWidth}`}>
          <div className="flex items-center justify-center gap-1">
            <h4 className={`text-xs sm:text-sm font-bold truncate ${isDead ? 'line-through text-slate-500' : 'text-slate-100'}`}>
              {player.name}
            </h4>
            {player.isHost && (
              <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {t.host || 'Host'}
              </span>
            )}
          </div>
          <span className={`text-[10px] sm:text-xs font-semibold block truncate mt-0.5 ${
            isDead
              ? 'text-slate-600'
              : player.isHost
              ? 'text-amber-400 font-extrabold'
              : isMafia
              ? 'text-rose-400'
              : isCitizen
              ? 'text-sky-400'
              : 'text-amber-400'
          }`}>
            {player.isHost 
              ? (t.host || 'Game Host')
              : (player.customRoleName || translations[language][`role_${player.role}`] || player.role)}
          </span>
        </div>
      </div>
    );
  };

  // Render a generic SeatSlot: Occupied player or Empty reserved seat
  const renderSeatSlot = (slot: SeatSlot) => {
    if (slot.type === 'OCCUPIED') {
      return renderSeatTile(slot.player);
    }

    const sizeClasses = total <= 10 
      ? 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl'
      : total <= 14
      ? 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl'
      : 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg';

    const labelMaxWidth = total <= 10 
      ? 'max-w-[70px] sm:max-w-[85px] md:max-w-[100px]'
      : 'max-w-[55px] sm:max-w-[70px] md:max-w-[80px]';

    return (
      <div 
        key={`empty_seat_${slot.seatNumber}`}
        onClick={() => {
          soundEngine.playTick();
          setEmptySeatTarget(slot.seatNumber);
          setNewPlayerName(`${t.defaultPlayerPrefix || "Player"} ${slot.seatNumber}`);
        }}
        className="flex flex-col items-center select-none group cursor-pointer transition-all hover:-translate-y-0.5"
      >
        <div 
          className={`relative ${sizeClasses} flex flex-col items-center justify-center transition-all rounded-2xl border border-white/10 hover:border-amber-400/60 bg-[#0c0f17]/70 hover:bg-amber-500/10 shadow-sm`}
          title={`${t.seatNumberPrefix || "Seat"} ${slot.seatNumber} (${t.emptySeat || "Empty"})`}
        >
          {/* Seat Number Badge */}
          <div className="absolute top-1.5 right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-black/80 border border-white/10 flex items-center justify-center text-[8px] sm:text-[9px] font-mono font-bold text-slate-400 group-hover:text-amber-300">
            {slot.seatNumber}
          </div>

          <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-amber-300 transition-colors">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
          </div>
        </div>

        <div className={`mt-1.5 text-center ${labelMaxWidth}`}>
          <h4 className="text-[11px] sm:text-xs font-bold text-slate-400 group-hover:text-amber-300 truncate">
            {t.seatNumberPrefix || "Seat"} {slot.seatNumber}
          </h4>
          <span className="text-[9px] sm:text-[10px] font-semibold block truncate text-slate-500 group-hover:text-amber-400/80">
            {t.emptySeatAdd || (isEn ? "Add" : "افزودن")}
          </span>
        </div>
      </div>
    );
  };

  const challengeRequests: any[] = (room as any).challengeRequests || [];

  return (
    <div className={`relative w-full mx-auto space-y-4 ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
      
      {/* Top God Command Strip: Clean Host Ribbon */}
      <div className="bg-[#090b11]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2.5 shadow-lg">
        
        {/* Quick Add Player Inline */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (quickAddName.trim()) {
              soundEngine.playTick();
              if (onAddPlayer) onAddPlayer(quickAddName.trim());
              setQuickAddName('');
            }
          }}
          className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-2 py-1"
        >
          <input
            type="text"
            value={quickAddName}
            onChange={(e) => setQuickAddName(e.target.value)}
            placeholder={t.playerNamePlaceholder || (isEn ? "Player name..." : "نام بازیکن...")}
            className="bg-transparent text-xs text-white placeholder-slate-500 px-1 py-1 focus:outline-none w-28 sm:w-36"
          />
          <button
            type="submit"
            disabled={!quickAddName.trim()}
            className="p-1 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-black font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-all"
            title={t.add || (isEn ? "Add" : "افزودن")}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.add || (isEn ? "Add" : "افزودن")}</span>
          </button>
        </form>

        {/* Essential Quick God Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Seat Capacity Increase / Decrease Controls for Host */}
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-xl px-2 py-1" title={t.seatsAndCardsCountTooltip || "Seats"}>
            <span className="text-xs text-slate-400 font-bold ml-1">{t.seatNumberLabel || (isEn ? "Seats" : "صندلی‌ها")}:</span>
            <button
              onClick={() => {
                soundEngine.playTick();
                const currentCap = targetCapacity;
                const nextCap = Math.max(9, currentCap - 1);
                setTableCapacityOverride(nextCap);
              }}
              disabled={targetCapacity <= 9 || targetCapacity <= room.players.length}
              className="w-5 h-5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              title={t.decreaseSeatTooltip || "-1 Seat"}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-mono font-black text-amber-400 min-w-[20px] text-center">
              {targetCapacity}
            </span>
            <button
              onClick={() => {
                soundEngine.playTick();
                const currentCap = targetCapacity;
                const nextCap = Math.min(21, currentCap + 1);
                setTableCapacityOverride(nextCap);
              }}
              disabled={targetCapacity >= 21}
              className="w-5 h-5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              title={t.increaseSeatTooltip || "+1 Seat"}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Deck Builder */}
          <button
            onClick={() => setIsDeckBuilderOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.deckLayoutBtn || (isEn ? "Deck" : "دک")}</span>
          </button>

          {/* Shuffle Table */}
          <button
            onClick={() => setShowShuffleConfirmModal(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title={t.shuffleSeats || (isEn ? "Shuffle Seats" : "شافل")}
          >
            <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.shuffleTableBtn || (isEn ? "Shuffle" : "شافل")}</span>
          </button>

          {/* Deal Roles */}
          <button
            onClick={handleDealRoles}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.dealRolesBtn || (isEn ? "Deal Roles" : "پخش نقش‌ها")}</span>
          </button>

          {/* Voting & Defense Modal */}
          <button
            onClick={() => setIsVotingModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Vote className="w-3.5 h-3.5" />
            <span>{t.votingSessionBtn || (isEn ? "Voting" : "رأی‌گیری")}</span>
          </button>

          {/* Stadium vs Grid View Mode Toggle */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5">
            <button
              onClick={() => setLayoutMode('STADIUM')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                layoutMode === 'STADIUM'
                  ? 'bg-amber-500 text-black font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={t.stadiumViewBtn || (isEn ? "Stadium View" : "استادیوم")}
            >
              {t.stadiumViewBtn || (isEn ? "Stadium" : "استادیوم")}
            </button>
            <button
              onClick={() => setLayoutMode('GRID')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                layoutMode === 'GRID'
                  ? 'bg-amber-500 text-black font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={t.seatsViewBtn || (isEn ? "Grid View" : "صندلی‌ها")}
            >
              {t.seatsViewBtn || (isEn ? "Grid" : "شبکه")} ({total})
            </button>
          </div>
        </div>

      </div>

      {/* Live Speaking / Challenge Timer Bar (If Active) */}
      {isSpeakerRunning && activeSpeakerPlayer && (
        <div className="p-4 bg-gradient-to-r from-amber-950/40 via-[#1a140b] to-black border-2 border-amber-500/60 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-xl animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl animate-pulse">
              {activeSpeakerType === 'CHALLENGE' ? '⚡' : '🎙️'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-amber-500 text-black">
                  {activeSpeakerType === 'CHALLENGE' ? (t.challengeTimeTag || 'Challenge') : (t.mainSpeakingTurnTag || 'Main Turn')}
                </span>
                <span className="text-sm font-black text-white">{activeSpeakerPlayer.name}</span>
                <span className="text-xs text-slate-400">({t.seatNumberPrefix || "Seat"} #{activeSpeakerPlayer.seatNumber})</span>
              </div>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                {t.audioTimerHint || "5-second audio ticker active."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Seconds Countdown */}
            <div className={`text-2xl sm:text-3xl font-black font-mono tracking-wider ${
              speakerSeconds <= 5 ? 'text-rose-400 animate-bounce' : 'text-amber-400'
            }`}>
              {speakerSeconds} {t.secondsWord || "s"}
            </div>

            {/* Quick Adjust Buttons */}
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setSpeakerSeconds(Math.max(0, speakerSeconds - 10))}
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold text-white"
                title="-10s"
              >
                -10{t.secondsWord?.[0] || "s"}
              </button>
              <button
                onClick={() => setSpeakerSeconds(speakerSeconds + 15)}
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold text-white"
                title="+15s"
              >
                +15{t.secondsWord?.[0] || "s"}
              </button>
            </div>

            {/* Stop Timer Button */}
            <button
              onClick={handleStopSpeakerTimer}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all shadow-md shadow-rose-600/30 cursor-pointer"
            >
              {t.endTurnBtn || "End Turn ⏹"}
            </button>
          </div>
        </div>
      )}

      {/* Challenge Requests Queue Bar (If any pending) */}
      {challengeRequests.length > 0 && (
        <div className="p-3.5 bg-[#14141e] border border-cyan-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>{t.challengeRequestsLabel || "Challenge Requests"} ({challengeRequests.length}):</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {challengeRequests.map((req: any) => {
              const reqPlayer = room.players.find(p => p.id === req.requesterPlayerId);
              if (!reqPlayer) return null;
              return (
                <div key={req.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-white">
                  <span>{reqPlayer.avatar}</span>
                  <span className="font-bold">{reqPlayer.name} (#{reqPlayer.seatNumber})</span>
                  <button
                    onClick={() => handleStartSpeechTimer(reqPlayer, 'CHALLENGE')}
                    className="mr-1 px-2 py-0.5 rounded bg-cyan-500 text-black font-extrabold text-[10px] hover:bg-cyan-400 transition-colors"
                  >
                    {t.grantChallengeBtn || "Grant ⚡"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Accuse Guidance Toast Bar */}
      {accuseSourcePlayer && (
        <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-200 text-xs font-bold flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            <span>{t.accusationSource || "Accuser"}: «{accuseSourcePlayer.name}». {t.clickTargetSeatPrompt || "Click target player square."}</span>
          </div>
          <button 
            onClick={() => setAccuseSourcePlayer(null)}
            className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer"
          >
            {t.cancelBtn || "Cancel"}
          </button>
        </div>
      )}

      {/* Main Table Layout Container (Stadium or Responsive Grid) */}
      {layoutMode === 'STADIUM' ? (
        <div className="relative bg-[#060608] border border-white/10 rounded-3xl p-3 sm:p-6 shadow-2xl overflow-x-auto min-h-[580px] flex flex-col justify-between items-center">
          
          {/* Subtle Felt & Wood Grain Pattern Overlay */}
          <div className="absolute inset-0 bg-radial from-emerald-950/20 via-transparent to-black pointer-events-none opacity-60" />

          {/* TOP ROW OF SEAT TILES */}
          <div className="w-full flex items-center justify-center gap-1.5 sm:gap-3 md:gap-5 z-10 py-1 flex-wrap sm:flex-nowrap">
            {topSlots.map(renderSeatSlot)}
          </div>

          {/* MIDDLE SECTION: LEFT TILES + CENTER FELT TABLE + RIGHT TILES */}
          <div className="w-full flex items-center justify-between gap-1 sm:gap-4 z-10 my-auto py-2">
            
            {/* LEFT COLUMN OF SEAT TILES */}
            <div className="flex flex-col items-center justify-around gap-2 sm:gap-4">
              {leftSlots.map(renderSeatSlot)}
            </div>

            {/* THE CENTRAL TABLE CORE */}
            <div className="flex-1 max-w-[290px] sm:max-w-sm md:max-w-md mx-1.5 sm:mx-4 bg-[#090d14]/95 border border-emerald-500/25 rounded-[30px] p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center text-center relative overflow-hidden group backdrop-blur-md">
              
              {/* Inner Decorative Perimeter Ring */}
              <div className="absolute inset-1.5 rounded-[24px] border border-white/[0.04] pointer-events-none" />
              <div className="absolute -top-12 -left-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Phase & Day Indicator */}
              <div className="relative z-10 flex items-center gap-2">
                {room.phase === 'LOBBY' ? (
                  <div className="flex items-center gap-2 text-amber-300 font-extrabold text-base sm:text-xl">
                    <Crown className="w-5 h-5 text-amber-400 animate-pulse" />
                    <span>{t.gameSetupTable || (isEn ? "Match Setup" : "آماده‌سازی مسابقه")}</span>
                  </div>
                ) : isNight ? (
                  <div className="flex items-center gap-2 text-indigo-300 font-extrabold text-base sm:text-xl">
                    <Moon className="w-5 h-5 text-indigo-400 animate-pulse" />
                    <span>{t.nightNumber} {room.dayNumber}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-300 font-extrabold text-base sm:text-xl">
                    <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
                    <span>{t.dayNumber} {room.dayNumber}</span>
                  </div>
                )}
              </div>

              {/* Daily Report / Night Summary text */}
              <div className="relative z-10 mt-2.5 px-3.5 py-2 rounded-xl bg-black/50 border border-white/[0.06] text-xs sm:text-sm text-slate-200 leading-relaxed">
                {room.phase === 'LOBBY' ? (
                  <span className="text-amber-200/90 font-medium">
                    🟢 {room.players.length} {t.playersSeatedSummary || (isEn ? "players seated at table" : "بازیکن دور میز نشسته‌اند")} ({isEn ? "Capacity" : (t.seatNumberLabel || "ظرفیت")}: {targetCapacity})
                  </span>
                ) : room.morningChronicle ? (
                  <span className="font-serif italic">{room.morningChronicle}</span>
                ) : isNight ? (
                  <span className="text-indigo-200 font-medium">{t.nightInProgressText || (isEn ? "🌙 The city sleeps; night actions in progress..." : "🌙 شهر در خواب است؛ اعمال شبانه در حال اجراست...")}</span>
                ) : (
                  <span className="text-emerald-200 font-medium">{t.peacefulNightText || (isEn ? "☀️ A peaceful night passed, no eliminations" : "☀️ شب آرام سپری شد و کسی از بازی خارج نشد")}</span>
                )}
              </div>

              {/* Live Faction Counts during active match */}
              {room.phase !== 'LOBBY' && (
                <div className="relative z-10 mt-2 flex items-center justify-center gap-3 text-xs font-bold text-slate-300">
                  <span className="px-2 py-0.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300">
                    🟢 {livingCitizens.length} {t.citizen || (isEn ? "Citizen" : "شهروند")}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300">
                    🔴 {livingMafia.length} {t.mafia || (isEn ? "Mafia" : "مافیا")}
                  </span>
                </div>
              )}

              {/* Primary Action Button (Start Game / End Day / Next Phase / Night Engine) */}
              <div className="relative z-10 mt-3.5 w-full flex flex-col items-center gap-1.5">
                {room.phase === 'LOBBY' ? (
                  <button
                    onClick={() => {
                      soundEngine.playGong();
                      if (onStartGame) {
                        onStartGame();
                      } else {
                        onNextPhase();
                      }
                    }}
                    className="w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:brightness-110 text-black font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>{t.startMatchDayOne || (isEn ? "Start Match ➔ Day 1" : "آغاز مسابقه ➔ روز اول")}</span>
                  </button>
                ) : (
                  <button
                    onClick={isNight ? onOpenNightEngine : onNextPhase}
                    className="w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                  >
                    {isNight ? (
                      <>
                        <Moon className="w-4 h-4" />
                        <span>{t.nightEngineSmart || (isEn ? "Night Engine (Shoot & Save)" : "موتور شب (شلیک و نجات)")}</span>
                      </>
                    ) : (
                      <>
                        <span>{t.endDayPhaseNight || (isEn ? "End Day ➔ Night" : "پایان روز ➔ فاز شب")}</span>
                        <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
                      </>
                    )}
                  </button>
                )}

                <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
                  {room.phase === 'LOBBY' 
                    ? (t.lobbyStartHint || (isEn ? "Start the match whenever you're ready" : 'هر زمان آماده بودید بازی را شروع کنید'))
                    : (t.playerActionHint || (isEn ? "Click player: Turn speech / Foul / Defense / Eliminate" : 'کلیک روی بازیکن: نوبت صحبت / خطا / دفاع / خروج'))
                  }
                </p>
              </div>

            </div>

            {/* RIGHT COLUMN OF SEAT TILES */}
            <div className="flex flex-col items-center justify-around gap-2 sm:gap-4">
              {rightSlots.map(renderSeatSlot)}
            </div>

          </div>

          {/* BOTTOM ROW OF SEAT TILES */}
          <div className="w-full flex items-center justify-center gap-1.5 sm:gap-3 md:gap-5 z-10 py-1 flex-wrap sm:flex-nowrap">
            {bottomSlots.map(renderSeatSlot)}
          </div>

        </div>
      ) : (
        /* GRID MODE: Compact Responsive Cards for Mobile & 21-Player Management */
        <div className="bg-[#08080c] border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5">
          
          {/* Status Header inside Grid */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#0a271c] to-[#04130d] border border-emerald-500/30">
            <div className="flex items-center gap-2.5">
              {room.phase === 'LOBBY' ? (
                <Crown className="w-5 h-5 text-amber-400" />
              ) : isNight ? (
                <Moon className="w-5 h-5 text-indigo-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400" />
              )}
              <span className="font-extrabold text-sm sm:text-base text-slate-200">
                {room.phase === 'LOBBY' ? (t.gameSetupTable || 'Game Setup & Seating') : isNight ? `${t.nightNumber} ${room.dayNumber}` : `${t.dayNumber} ${room.dayNumber}`}
              </span>
              <span className="text-xs text-slate-400">
                ({room.players.filter(p => p.isAlive).length} / {total} {t.seatsViewBtn || "Seats"})
              </span>
            </div>

            {room.phase === 'LOBBY' ? (
              <button
                onClick={() => {
                  soundEngine.playGong();
                  if (onStartGame) onStartGame();
                  else onNextPhase();
                }}
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>{t.startGame || "Start Game"}</span>
              </button>
            ) : (
              <button
                onClick={isNight ? onOpenNightEngine : onNextPhase}
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                {isNight ? (t.nightEngine || 'Night Engine') : (t.endDayPhaseNight || 'End Day ➔ Night')}
              </button>
            )}
          </div>

          {/* Responsive Player Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {seatSlots.map((slot) => {
              if (slot.type === 'EMPTY') {
                return (
                  <div
                    key={`grid_empty_${slot.seatNumber}`}
                    onClick={() => {
                      soundEngine.playTick();
                      setEmptySeatTarget(slot.seatNumber);
                      setNewPlayerName(`${t.defaultPlayerPrefix || "Player"} ${slot.seatNumber}`);
                    }}
                    className="p-3 rounded-2xl border-2 border-dashed border-white/15 hover:border-amber-400/70 bg-white/[0.02] hover:bg-amber-500/10 text-right transition-all cursor-pointer select-none flex flex-col justify-between min-h-[110px]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-6 h-6 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono font-bold flex items-center justify-center text-slate-400">
                        {slot.seatNumber}
                      </span>
                      <span className="text-[10px] font-bold text-amber-400/80">
                        + {t.sitDownBtn || "Sit"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-300">{t.seatNumberPrefix || "Seat"} {slot.seatNumber}</h4>
                        <p className="text-[10px] text-slate-500">{t.emptySeat || "Empty"}</p>
                      </div>
                    </div>
                  </div>
                );
              }

              const p = slot.player;
              const roleDef = ROLE_DEFINITIONS[p.role] || ROLE_DEFINITIONS.CITIZEN_SIMPLE;
              const isMafia = roleDef.affiliation === 'MAFIA' || p.customRoleAffiliation === 'MAFIA';
              const isCitizen = roleDef.affiliation === 'CITIZEN' || p.customRoleAffiliation === 'CITIZEN';
              const isSpeaking = activeSpeakerId === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => handlePlayerTileClick(p)}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer select-none relative ${
                    !p.isAlive
                      ? 'bg-[#0f0f12] border-white/5 opacity-40'
                      : isSpeaking
                      ? 'bg-amber-500/25 border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/30'
                      : isMafia
                      ? 'bg-[#180e12] border-rose-500/40 hover:border-rose-400'
                      : isCitizen
                      ? 'bg-[#0e1422] border-sky-500/40 hover:border-sky-400'
                      : 'bg-[#16120b] border-amber-500/40 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono font-bold flex items-center justify-center text-slate-300">
                      {p.seatNumber}
                    </span>

                    <div className="flex items-center gap-1">
                      {p.inDefense && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black font-black text-[8px]">
                          {t.defense || "DEF"}
                        </span>
                      )}
                      {p.speechMuted && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white font-black text-[8px]">
                          {t.silenced || "MUTE"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-black/40 flex items-center justify-center shrink-0">
                      {!p.isAlive ? <Skull className="w-5 h-5 text-rose-500" /> : getRoleIcon(p.role)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs font-bold truncate ${!p.isAlive ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {p.name}
                      </h4>
                      <p className={`text-[10px] font-bold truncate ${
                        !p.isAlive
                          ? 'text-slate-600'
                          : isMafia
                          ? 'text-rose-400'
                          : isCitizen
                          ? 'text-sky-400'
                          : 'text-amber-400'
                      }`}>
                        {p.customRoleName || translations[language][`role_${p.role}`] || p.role}
                      </p>
                    </div>
                  </div>

                  {/* Foul dots */}
                  {(p.fouls || 0) > 0 && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-[9px] text-slate-500">{t.foulLabel || "Foul"}:</span>
                      {Array.from({ length: p.fouls || 0 }).map((_, i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QUICK HOST ACTION MODAL FOR CLICKED PLAYER */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className={`bg-[#0f0f12] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0a0a0c] border border-white/10 flex items-center justify-center text-2xl">
                  {getRoleIcon(selectedPlayer.role)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-[#e2e2e7] text-lg">{selectedPlayer.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                      {t.seatNumberPrefix || "Seat"} {selectedPlayer.seatNumber || "—"}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-400">
                    {selectedPlayer.customRoleName || translations[language][`role_${selectedPlayer.role}`] || selectedPlayer.role}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedPlayer(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Speaking & Challenge Timers Trigger */}
            <div className="p-3 bg-[#15151e] rounded-2xl border border-white/10 space-y-2">
              <span className="text-xs text-amber-300 font-bold block">{t.speechTimerControlLabel || "Speaking Timer & Turn Control:"}</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStartSpeechTimer(selectedPlayer, 'SPEECH')}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t.startMainTurnBtn || "Start Turn"} ({((room as any).defaultSpeechSeconds || 60)}{t.secondsWord?.[0] || "s"})</span>
                </button>

                <button
                  onClick={() => handleStartSpeechTimer(selectedPlayer, 'CHALLENGE')}
                  className="py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{t.startChallengeBtn || "Start Challenge"} ({((room as any).defaultChallengeSeconds || 30)}{t.secondsWord?.[0] || "s"})</span>
                </button>
              </div>
            </div>

            {/* Fouls & Silence Management */}
            <div className="p-3 bg-[#15151e] rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">{t.gameFoulsLabel || "Game Fouls:"}</span>
                <span className="text-rose-400 font-black">{selectedPlayer.fouls || 0} / 4</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleRemoveFoul(selectedPlayer)}
                    disabled={!selectedPlayer.fouls || selectedPlayer.fouls === 0}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 text-slate-300"
                    title={t.decreaseFoul || "-1 Foul"}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAddFoul(selectedPlayer)}
                    disabled={(selectedPlayer.fouls || 0) >= 4}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{t.registerFoulBtn || "+ Register Foul"}</span>
                  </button>
                </div>

                <button
                  onClick={() => handleToggleMute(selectedPlayer)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    selectedPlayer.speechMuted
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {selectedPlayer.speechMuted ? (t.cancelSilenceBtn || 'Unmute') : (t.muteTurnBtn || 'Silence Turn')}
                </button>
              </div>
            </div>

            {/* Rename Input if Active */}
            {isRenaming ? (
              <div className="p-3 bg-[#0a0a0c] rounded-2xl border border-white/10 space-y-2">
                <span className="text-xs text-slate-400 font-bold block">{t.newPlayerNameLabel || "New Player Name:"}</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                    placeholder={t.playerNamePlaceholder || "Player name..."}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveRename}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs cursor-pointer"
                  >
                    {t.saveBtn || "Save"}
                  </button>
                </div>
              </div>
            ) : null}

            {/* Role Switcher Dropdown if Active */}
            {showRoleSelect ? (
              <div className="p-3 bg-[#0a0a0c] rounded-2xl border border-white/10 space-y-2 max-h-48 overflow-y-auto">
                <span className="text-xs text-slate-400 font-bold block">{t.selectNewRoleLabel || "Select New Role:"}</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(ROLE_DEFINITIONS) as RoleId[]).map((rId) => {
                    const rDef = ROLE_DEFINITIONS[rId];
                    return (
                      <button
                        key={rId}
                        onClick={() => handleRoleChange(rId)}
                        className={`p-2 rounded-xl border text-xs font-bold text-right flex items-center gap-1.5 transition-colors cursor-pointer ${
                          rDef.affiliation === 'MAFIA'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20'
                            : 'bg-sky-500/10 text-sky-300 border-sky-500/20 hover:bg-sky-500/20'
                        }`}
                      >
                        <span>{getRoleIcon(rId)}</span>
                        <span className="truncate">{translations[language][`role_${rId}`] || rId}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              
              {/* Kill / Revive Button */}
              <button
                onClick={() => handleToggleKill(selectedPlayer)}
                className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedPlayer.isAlive
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {selectedPlayer.isAlive ? (
                  <>
                    <Skull className="w-4 h-4 text-rose-400" />
                    <span>{t.shootEliminateBtn || "Shoot & Eliminate"}</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 text-emerald-400" />
                    <span>{t.revivePlayerBtn || "Revive Player"}</span>
                  </>
                )}
              </button>

              {/* Accuse Action */}
              <button
                onClick={handleStartAccuseFromSelected}
                className="py-3 px-4 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Target className="w-4 h-4 text-amber-400" />
                <span>{t.registerAccusationBtn || "Register Accusation"}</span>
              </button>

              {/* Send to Defense */}
              <button
                onClick={() => {
                  onSendToDefense(selectedPlayer.id);
                  setSelectedPlayer(null);
                  soundEngine.playGong();
                }}
                className="py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>{t.defenseStandBtn || "Send to Defense"}</span>
              </button>

              {/* Rename Player */}
              <button
                onClick={() => setIsRenaming(!isRenaming)}
                className="py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-slate-400" />
                <span>{t.renamePlayerBtn || "Rename"}</span>
              </button>

              {/* Change Role */}
              <button
                onClick={() => setShowRoleSelect(!showRoleSelect)}
                className="py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-slate-400" />
                <span>{t.changeRoleCardBtn || "Change Role"}</span>
              </button>

              {/* Role Wiki & Matchups */}
              <button
                onClick={() => {
                  if (onOpenRoleGuide) onOpenRoleGuide(selectedPlayer.role);
                  setSelectedPlayer(null);
                }}
                className="py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-amber-300 border border-white/10 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>{t.roleWikiBtn || "Role Guide"}</span>
              </button>

              {/* Convert to Bot */}
              <button
                onClick={() => {
                  if (onHostAction) onHostAction('CONVERT_TO_BOT', { playerId: selectedPlayer.id });
                  setSelectedPlayer(null);
                  soundEngine.playTick();
                }}
                className="py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🤖 {t.convertToBot || (isEn ? "Convert to Bot" : "تبدیل به بات")}</span>
              </button>

              {/* Kick Player */}
              <button
                onClick={() => {
                  onKickPlayer(selectedPlayer.id);
                  setSelectedPlayer(null);
                  soundEngine.playTick();
                }}
                className="py-2.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.kickFromGame || (isEn ? "Kick from Game" : "اخراج از بازی")}</span>
              </button>

            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedPlayer(null)}
              className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold cursor-pointer"
            >
              {t.closeBtn || "Close"}
            </button>

          </div>
        </div>
      )}

      {/* Shuffle Confirmation Modal with Detailed Guidance */}
      {showShuffleConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className={`bg-[#121218] border border-cyan-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Shuffle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{t.shuffleSeatsConfirmTitle || "Shuffle and randomize seats"}</h3>
                <p className="text-xs text-slate-400">{t.shuffleSeatsSubtitle || "Randomize player seating arrangement"}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 leading-relaxed">
              {t.shuffleExplanation || "All player seats will be randomized; players should switch to their newly assigned seats."}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowShuffleConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
              >
                {t.cancelBtn || "Cancel"}
              </button>
              <button
                onClick={handleConfirmShuffleTable}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-md shadow-cyan-500/20"
              >
                {t.confirmShuffleBtn || "Confirm & Shuffle 🔀"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deck Builder Modal */}
      <DeckBuilderModal
        language={language}
        isOpen={isDeckBuilderOpen}
        onClose={() => setIsDeckBuilderOpen(false)}
        onConfirmDeck={handleConfirmDeck}
        initialDeck={(room as any).deckRoles}
      />

      {/* Voting & Defense Modal */}
      <VotingDefenseModal
        language={language}
        isOpen={isVotingModalOpen}
        room={room}
        onClose={() => setIsVotingModalOpen(false)}
        onStartVoting={(targetId, stage) => {
          if (onHostAction) onHostAction('START_VOTING', { targetPlayerId: targetId, stage });
        }}
        onManualCountChange={(count) => {
          if (onHostAction) onHostAction('SUBMIT_VOTE_MANUAL', { count });
        }}
        onCloseVoting={() => {
          if (onHostAction) onHostAction('CLOSE_VOTING');
        }}
        onKillPlayer={onKillPlayer}
        onResolveTie={(resolution, candidateIds) => {
          if (onResolveTie) {
            onResolveTie(resolution, candidateIds);
          } else if (onHostAction) {
            onHostAction('RESOLVE_VOTING_TIE', { resolution, candidateIds });
          }
        }}
      />

      {/* Quick Add Player to Empty Seat Modal */}
      {emptySeatTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-16 sm:pt-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-sm bg-[#121218] border border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center text-sm">
                  #{emptySeatTarget}
                </span>
                <h3 className="font-bold text-sm text-white">{t.addPlayerModalTitle || "Add Player"} #{emptySeatTarget}</h3>
              </div>
              <button
                onClick={() => setEmptySeatTarget(null)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1.5">{t.playerName || "Player Name"}:</label>
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newPlayerName.trim()) {
                      soundEngine.playTick();
                      if (onAddPlayer) onAddPlayer(newPlayerName.trim(), emptySeatTarget, newPlayerRole);
                      setEmptySeatTarget(null);
                    }
                  }}
                  autoFocus
                  placeholder={t.namePlaceholderExample || "e.g. Alex, Sarah, David..."}
                  className="w-full px-3.5 py-3 rounded-xl bg-black/70 border border-white/20 text-white text-base focus:border-amber-400 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1.5">{t.assignRoleToSeat || "Initial Role:"}</label>
                <select
                  value={newPlayerRole}
                  onChange={(e) => setNewPlayerRole(e.target.value as RoleId)}
                  className="w-full px-3.5 py-3 rounded-xl bg-black/70 border border-white/20 text-slate-200 text-base focus:border-amber-400 focus:outline-none"
                >
                  <option value="CITIZEN_SIMPLE">{t.role_CITIZEN_SIMPLE || "Simple Citizen"} 👤</option>
                  <option value="DOCTOR">{t.role_DOCTOR || "Doctor"} 🩺</option>
                  <option value="DETECTIVE">{t.role_DETECTIVE || "Detective"} 🔍</option>
                  <option value="SNIPER">{t.role_SNIPER || "Sniper"} 🎯</option>
                  <option value="ARMORED">{t.role_ARMORED || "Armored"} 🛡️</option>
                  <option value="GODFATHER">{t.role_GODFATHER || "Godfather"} 🎩</option>
                  <option value="MAFIA_SIMPLE">{t.role_MAFIA_SIMPLE || "Simple Mafia"} 🔫</option>
                  <option value="DOCTOR_LECTER">{t.role_DOCTOR_LECTER || "Doctor Lecter"} 💉</option>
                  <option value="JOKER">{t.role_JOKER || "Joker"} 🃏</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  💡 {t.godfatherRoleNote || "Godfather is a player role in Mafia side, distinct from Game Host/Narrator."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  if (newPlayerName.trim()) {
                    soundEngine.playTick();
                    if (onAddPlayer) onAddPlayer(newPlayerName.trim(), emptySeatTarget, newPlayerRole);
                    setEmptySeatTarget(null);
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm shadow-md shadow-amber-500/20 cursor-pointer transition-all active:scale-98"
              >
                {t.addAndSitPlayerBtn || "Seat Player"}
              </button>
              <button
                onClick={() => setEmptySeatTarget(null)}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs cursor-pointer"
              >
                {t.cancelBtn || "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
