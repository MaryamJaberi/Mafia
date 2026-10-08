import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  GamePhase, Language, RoleId, RoomState, Player, Accusation 
} from './types/mafia';
import { Header } from './components/common/Header';
import { HostConsoleView } from './components/HostConsole/HostConsoleView';
import { PlayerCityScreen } from './components/PlayerView/PlayerCityScreen';
import { QRScannerModal } from './components/PlayerView/QRScannerModal';
import { DualSimulatorView } from './components/DualSimulator/DualSimulatorView';
import { WelcomeChoiceModal } from './components/common/WelcomeChoiceModal';
import { GlobalGodInfoDrawer } from './components/common/GlobalGodInfoDrawer';
import type { ExtendedAppSettings } from './components/common/ComprehensiveSettingsModal';

// Performance Optimization: Lazy-load heavy and secondary modals on demand
const SoundboardModal = React.lazy(() => import('./components/common/SoundboardModal').then(m => ({ default: m.SoundboardModal })));
const GameHistoryModal = React.lazy(() => import('./components/History/GameHistoryModal').then(m => ({ default: m.GameHistoryModal })));
const FlutterExportModal = React.lazy(() => import('./components/FlutterExporter/FlutterExportModal').then(m => ({ default: m.FlutterExportModal })));
const DeckBuilderModal = React.lazy(() => import('./components/HostConsole/DeckBuilderModal').then(m => ({ default: m.DeckBuilderModal })));
const MultiPlayerTestBenchModal = React.lazy(() => import('./components/common/MultiPlayerTestBenchModal').then(m => ({ default: m.MultiPlayerTestBenchModal })));
const RuleSearchModal = React.lazy(() => import('./components/common/RuleSearchModal').then(m => ({ default: m.RuleSearchModal })));
const FullGameTestReportModal = React.lazy(() => import('./components/common/FullGameTestReportModal').then(m => ({ default: m.FullGameTestReportModal })));
const InteractiveMatrixModal = React.lazy(() => import('./components/common/InteractiveMatrixModal').then(m => ({ default: m.InteractiveMatrixModal })));
const AiScenarioBuilderModal = React.lazy(() => import('./components/common/AiScenarioBuilderModal').then(m => ({ default: m.AiScenarioBuilderModal })));
const GameProfileModal = React.lazy(() => import('./components/common/GameProfileModal').then(m => ({ default: m.GameProfileModal })));
const RoleGuideModal = React.lazy(() => import('./components/common/RoleGuideModal').then(m => ({ default: m.RoleGuideModal })));
const PresetScenariosModal = React.lazy(() => import('./components/HostConsole/PresetScenariosModal').then(m => ({ default: m.PresetScenariosModal })));
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { BugReportModal } from './components/common/BugReportModal';
import { OnlineMeetingModal } from './components/common/OnlineMeetingModal';
import { bugTracker } from './utils/bugTracker';
const ComprehensiveSettingsModal = React.lazy(() => import('./components/common/ComprehensiveSettingsModal').then(m => ({ default: m.ComprehensiveSettingsModal })));
const AutomatedQASuiteModal = React.lazy(() => import('./components/common/AutomatedQASuiteModal').then(m => ({ default: m.AutomatedQASuiteModal })));
import { UserStoriesChecklistModal } from './components/common/UserStoriesChecklistModal';
import { AuthProfileModal } from './components/common/AuthProfileModal';
import { GeminiAssistantModal } from './components/common/GeminiAssistantModal';
import { DEFAULT_SCENARIOS, ROLE_DEFINITIONS, balanceScenarioRoles } from './utils/scenarios';
import { DeckRoleItem, Scenario } from './types/mafia';
import { 
  loadAppSettings, saveAppSettings, saveGameHistory, 
  saveActiveRoomState, loadActiveRoomState,
  getLocalSettings, saveLocalSettings, defaultSettings
} from './utils/storage';
import { soundEngine } from './utils/audioSynth';
import { translations } from './utils/translations';
import { QrCode, Smartphone, Crown, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { HomeScreen } from './components/HomeScreen';
import { GameCreatorScreen } from './components/HostConsole/GameCreatorScreen';
import { RulesBriefingChecklistModal } from './components/HostConsole/RulesBriefingChecklistModal';
import { GamePhaseStepper } from './components/common/GamePhaseStepper';

export default function App() {
  const [appSettings, setAppSettings] = useState(() => loadAppSettings());
  const [activeScreen, setActiveScreen] = useState<'HOME' | 'GAME_CREATOR' | 'PLAYING'>('HOME');
  const [viewMode, setViewMode] = useState<'HOST' | 'PLAYER' | 'DUAL'>('HOST');
  const [language, setLanguage] = useState<Language>(appSettings.language);
  const [isMuted, setIsMuted] = useState(appSettings.isSoundMuted);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // Active Room State - initialize with immediate local room for zero-delay rendering
  const [room, setRoom] = useState<RoomState>(() => ({
    roomId: 'MAFIA-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
    hostToken: 'host_' + Date.now(),
    joinToken: Math.random().toString(36).substring(2, 8),
    scenarioId: 'classic-9',
    phase: 'LOBBY',
    dayNumber: 1,
    isTimerRunning: false,
    timerSeconds: 60,
    timerTotal: 60,
    isLobbyLocked: false,
    players: [],
    accusations: [],
    nightActions: [],
    votes: [],
    announcements: [
      {
        id: `ann_${Date.now()}`,
        title: language === 'en' ? 'System is Ready' : 'سیستم آماده به کار است',
        content: language === 'en' ? 'Mafia host table loaded successfully. Players can now connect.' : 'میز گرداننده مافیا با موفقیت بارگذاری شد. بازیکنان می‌توانند متصل شوند.',
        phase: 'LOBBY',
        dayNumber: 1,
        timestamp: Date.now(),
        isPublic: true,
        type: 'INFO'
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }));
  const [isOnline, setIsOnline] = useState(true);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const reconnectTimeoutRef = useRef<any>(null);

  // Modals (start with false so the live host console is immediately visible)
  const [isWelcomeChoiceOpen, setIsWelcomeChoiceOpen] = useState(false);
  const [isDeckBuilderOpen, setIsDeckBuilderOpen] = useState(false);
  const [isTestBenchOpen, setIsTestBenchOpen] = useState(false);
  const [isRuleSearchOpen, setIsRuleSearchOpen] = useState(false);
  const [isFullGameReportOpen, setIsFullGameReportOpen] = useState(false);
  const [isSoundboardOpen, setIsSoundboardOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFlutterExportOpen, setIsFlutterExportOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [activeMatrixScenarioId, setActiveMatrixScenarioId] = useState<string>('classic');
  const [isAiScenarioBuilderOpen, setIsAiScenarioBuilderOpen] = useState(false);
  const [isPresetScenariosOpen, setIsPresetScenariosOpen] = useState(false);
  const [editingScenarioForDeck, setEditingScenarioForDeck] = useState<Scenario | null>(null);
  const [isGameProfileOpen, setIsGameProfileOpen] = useState(false);
  const [isRoleGuideOpen, setIsRoleGuideOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [isAutomatedQAOpen, setIsAutomatedQAOpen] = useState(false);
  const [isGlobalGodDrawerOpen, setIsGlobalGodDrawerOpen] = useState(false);
  const [isOnlineMeetingOpen, setIsOnlineMeetingOpen] = useState(false);
  const [isUserStoriesOpen, setIsUserStoriesOpen] = useState(false);
  const [isAuthProfileOpen, setIsAuthProfileOpen] = useState(false);
  const [isGeminiAssistantOpen, setIsGeminiAssistantOpen] = useState(false);
  const [extendedSettings, setExtendedSettings] = useState<ExtendedAppSettings>(() => getLocalSettings() as ExtendedAppSettings);
  const [joinUrlParams, setJoinUrlParams] = useState<{ roomId?: string; token?: string }>({});

  const sseRef = useRef<EventSource | null>(null);

  // Parse URL search parameters on mount (e.g. ?join=MAFIA-123&token=xyz)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinRoom = params.get('join') || params.get('room');
    const joinToken = params.get('token');

    if (joinRoom) {
      setActiveScreen('PLAYING');
      setViewMode('PLAYER');
      setJoinUrlParams({ roomId: joinRoom, token: joinToken || '' });
      setIsJoinModalOpen(true);
    }
  }, []);

  // Save settings on update
  useEffect(() => {
    saveAppSettings({
      language,
      isSoundMuted: isMuted,
      defaultViewMode: viewMode
    });
  }, [language, isMuted, viewMode]);

  // Connect to SSE for real-time room synchronization with resilient auto-reconnect & latency tracking
  const connectToRoomSSE = useCallback((roomId: string) => {
    if (sseRef.current) {
      sseRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const eventSource = new EventSource(`/api/rooms/${roomId}/events`);
    sseRef.current = eventSource;

    eventSource.onopen = () => {
      setIsOnline(true);
      setConnectionError(null);
    };

    eventSource.onmessage = (e) => {
      try {
        const updatedRoom = JSON.parse(e.data) as RoomState;
        setRoom(prev => {
          // Monotonic update check: do not overwrite newer local timestamps with delayed packet
          if (prev?.updatedAt && updatedRoom?.updatedAt && updatedRoom.updatedAt < prev.updatedAt) {
            return prev;
          }
          return updatedRoom;
        });
        saveActiveRoomState(updatedRoom);

        // If game ended, record into local history
        if (updatedRoom.winner) {
          saveGameHistory({
            id: `game_${Date.now()}`,
            roomId: updatedRoom.roomId,
            scenarioName: updatedRoom.scenarioId,
            winner: updatedRoom.winner,
            date: new Date().toLocaleDateString('fa-IR'),
            timestamp: Date.now(),
            totalDays: updatedRoom.dayNumber,
            playersCount: updatedRoom.players.length,
            accusationsCount: updatedRoom.accusations.length,
            players: updatedRoom.players,
            killLogs: []
          });
        }
      } catch (err) {
        console.error('Failed to parse SSE event data:', err);
      }
    };

    eventSource.onerror = () => {
      setIsOnline(false);
      // Auto-reconnect with exponential backoff
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        if (roomId) {
          connectToRoomSSE(roomId);
        }
      }, 3000);
    };
  }, []);

  // Force Resync: Immediately queries room state and measures ping
  const forceSyncRoom = useCallback(async () => {
    if (!room?.roomId) return;
    setIsSyncing(true);
    const start = performance.now();
    try {
      const res = await fetch(`/api/rooms/${room.roomId}${currentPlayerId ? `?playerId=${currentPlayerId}` : ''}`, {
        headers: room.hostToken ? { 'Authorization': `Bearer ${room.hostToken}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.room) {
          setRoom(data.room);
          saveActiveRoomState(data.room);
          setLatencyMs(Math.round(performance.now() - start));
          setIsOnline(true);
          soundEngine.playTick();
        }
      }
    } catch (err) {
      console.warn('Force sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [room?.roomId, room?.hostToken, currentPlayerId]);

  // Periodic heartbeat & latency ping (every 6 seconds)
  useEffect(() => {
    if (!room?.roomId) return;
    const interval = setInterval(async () => {
      try {
        const t0 = performance.now();
        const res = await fetch(`/api/rooms/${room.roomId}/ping`);
        if (res.ok) {
          setLatencyMs(Math.round(performance.now() - t0));
          setIsOnline(true);
        }
      } catch {
        // Network may be transiently down
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [room?.roomId]);

  // Create a brand new Host Room on server with automatic retry during server boot
  const handleCreateNewGame = useCallback(async () => {
    let lastError: unknown = null;

    // Retry up to 3 times to allow server warm-up without falling back prematurely
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            hostName: language === 'en' ? 'Game Host' : 'گرداننده مسابقه',
            scenarioId: 'classic-9'
          })
        });

        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) {
          throw new Error(`Server returned status ${res.status} (${contentType})`);
        }

        const data = await res.json();
        if (data && data.room) {
          setRoom(data.room);
          setCurrentPlayerId(data.room.players[0]?.id || null);
          connectToRoomSSE(data.room.roomId);
          soundEngine.playGong();
          return;
        }
      } catch (err) {
        lastError = err;
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 400 * attempt));
        }
      }
    }

    console.warn('Server room creation not available, creating local fallback room:', lastError);
    // Fallback local room creation
    const localRoomId = 'MAFIA-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const localRoom: RoomState = {
      roomId: localRoomId,
      hostToken: 'host_token_' + Date.now(),
      joinToken: Math.random().toString(36).substring(2, 8),
      scenarioId: 'classic-9',
      phase: 'LOBBY',
      dayNumber: 1,
      isTimerRunning: false,
      timerSeconds: 60,
      timerTotal: 60,
      isLobbyLocked: false,
      players: [],
      accusations: [],
      nightActions: [],
      votes: [],
      announcements: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setRoom(localRoom);
    setCurrentPlayerId('');
  }, [connectToRoomSSE]);

  // Initial load: create or restore room
  useEffect(() => {
    handleCreateNewGame();
    return () => {
      if (sseRef.current) sseRef.current.close();
    };
  }, [handleCreateNewGame]);

  // Room Action Dispatcher (posts to /api/rooms/:roomId/action)
  const dispatchAction = useCallback(async (actionType: string, payload: Record<string, unknown> = {}) => {
    if (!room) return;

    try {
      const res = await fetch(`/api/rooms/${room.roomId}/action`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ action: actionType, payload })
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.room) {
          setRoom(data.room);
        }
      }
    } catch (err) {
      console.warn('Backend action request failed, applying optimistic local state:', err);
      
      // Fallback local mutations
      setRoom(prev => {
        if (!prev) return null;
        const copy: RoomState = JSON.parse(JSON.stringify(prev));

        if (actionType === 'SET_PHASE') {
          copy.phase = (payload.phase as GamePhase) || copy.phase;
          if (typeof payload.dayNumber === 'number') copy.dayNumber = payload.dayNumber;
        } else if (actionType === 'TIMER_CONTROL') {
          copy.timerSeconds = payload.seconds as number;
          copy.timerTotal = payload.total as number;
          copy.isTimerRunning = payload.isRunning as boolean;
        } else if (actionType === 'KILL_PLAYER') {
          const p = copy.players.find(x => x.id === payload.playerId);
          if (p) p.isAlive = false;
        } else if (actionType === 'REVIVE_PLAYER') {
          const p = copy.players.find(x => x.id === payload.playerId);
          if (p) p.isAlive = true;
        } else if (actionType === 'ADD_ACCUSATION') {
          const newAcc: Accusation = {
            id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            accuserId: payload.accuserId as string,
            targetId: payload.targetId as string,
            dayNumber: copy.dayNumber,
            timestamp: Date.now()
          };
          copy.accusations.push(newAcc);
        } else if (actionType === 'CHANGE_ROLE') {
          const p = copy.players.find(x => x.id === payload.playerId);
          if (p) p.role = payload.role as RoleId;
        } else if (actionType === 'RENAME_PLAYER') {
          const p = copy.players.find(x => x.id === payload.playerId);
          if (p) p.name = payload.newName as string;
        } else if (actionType === 'KICK_PLAYER') {
          copy.players = copy.players.filter(x => x.id !== payload.playerId);
        } else if (actionType === 'ADD_SINGLE_PLAYER') {
          const playerName = (payload.name && typeof payload.name === 'string' && payload.name.trim().length > 0)
            ? (payload.name as string).trim().slice(0, 30)
            : `${language === 'en' ? 'Player' : 'بازیکن'} ${copy.players.length + 1}`;
          const targetSeat = typeof payload.seatNumber === 'number' ? payload.seatNumber : (copy.players.length + 1);
          const playerRole = (payload.role && typeof payload.role === 'string') ? payload.role : 'CITIZEN_SIMPLE';
          const playerAvatar = (payload.avatar && typeof payload.avatar === 'string') ? payload.avatar : '🕵️‍♂️';

          const newP: Player = {
            id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: playerName,
            avatar: playerAvatar,
            role: playerRole as any,
            isAlive: true,
            isConnected: true,
            isReady: true,
            isHost: false,
            joinedAt: Date.now(),
            seatNumber: targetSeat
          };
          copy.players.push(newP);
        } else if (actionType === 'LOCK_LOBBY') {
          copy.isLobbyLocked = payload.locked as boolean;
        } else if (actionType === 'UPDATE_SCENARIO') {
          copy.scenarioId = payload.scenarioId as string;
        } else if (actionType === 'REPLAY_SET') {
          if (Array.isArray(payload.players)) {
            copy.players = (payload.players as Player[]).map((p, idx) => ({
              ...p,
              isAlive: true,
              isConnected: true,
              isReady: true,
              seatNumber: p.seatNumber || idx + 1
            }));
          }
          if (payload.scenarioId) copy.scenarioId = payload.scenarioId as string;
          copy.phase = (payload.phase as GamePhase) || 'LOBBY';
          copy.dayNumber = 1;
          copy.accusations = [];
          copy.nightActions = [];
          copy.votes = [];
          copy.winner = null;
        } else if (actionType === 'UPDATE_PLAYERS') {
          if (Array.isArray(payload.players)) {
            copy.players = payload.players as Player[];
          }
        } else if (actionType === 'UPDATE_HOUSE_RULES') {
          copy.houseRules = payload.rules as any;
        } else if (actionType === 'PUBLISH_CHRONICLE') {
          copy.morningChronicle = payload.text as string;
        } else if (actionType === 'DEAL_ROLES') {
          const deck = ((copy as any).deckRoles || []) as DeckRoleItem[];
          const baseRoles: RoleId[] = deck.length > 0 
            ? deck.map(d => d.roleId)
            : (DEFAULT_SCENARIOS.find(s => s.id === copy.scenarioId)?.roles || ['GODFATHER', 'DOCTOR_LECTER', 'MAFIA_SIMPLE', 'DOCTOR', 'DETECTIVE', 'SNIPER', 'ARMORED', 'CITIZEN_SIMPLE', 'CITIZEN_SIMPLE', 'CITIZEN_SIMPLE']);

          // Dynamically balance roles to the exact player count (odd or even, e.g. 7, 9, 11)
          const balancedRoles = balanceScenarioRoles(baseRoles, copy.players.length, copy.scenarioId);
          const shuffledRoles = [...balancedRoles].sort(() => Math.random() - 0.5);
          copy.players = copy.players.map((p, idx) => ({
            ...p,
            role: shuffledRoles[idx] || p.role || 'CITIZEN_SIMPLE',
            roleRevealedAndConfirmed: false
          }));
        } else if (actionType === 'RESOLVE_VOTING_TIE') {
          const resolution = payload.resolution as string;
          const candidateIds = (payload.candidateIds as string[]) || [];
          const candidates = copy.players.filter(p => candidateIds.includes(p.id));

          if (resolution === 'REVOTE') {
            copy.votes = [];
            if ((copy as any).votingState) {
              (copy as any).votingState.votes = {};
              (copy as any).votingState.manualCount = 0;
              (copy as any).votingState.defenseCandidates = candidateIds;
              (copy as any).votingState.stage = 'EXIT_VOTE';
            }
          } else if (resolution === 'NO_ELIMINATION') {
            copy.activeDefensePlayers = [];
            copy.players.forEach(p => {
              if (candidateIds.includes(p.id)) p.inDefense = false;
            });
            if ((copy as any).votingState) {
              (copy as any).votingState.isOpen = false;
            }
          } else if (resolution === 'RANDOM_DRAW') {
            if (candidates.length > 0) {
              const unlucky = candidates[Math.floor(Math.random() * candidates.length)];
              unlucky.isAlive = false;
              unlucky.inDefense = false;
            }
          } else if (resolution === 'ELIMINATE_BOTH') {
            candidates.forEach(c => {
              c.isAlive = false;
              c.inDefense = false;
            });
          }
        } else if (actionType === 'REVEAL_AND_CONFIRM_ROLE') {
          const p = copy.players.find(x => x.id === payload.playerId);
          if (p) p.roleRevealedAndConfirmed = true;
        } else if (actionType === 'CONVERT_TO_BOT') {
          const p = copy.players.find(x => x.id === payload.playerId);
          if (p) {
            p.isBot = true;
            if (!p.name.includes('🤖')) {
              p.name = `🤖 ${p.name}`;
            }
          }
        }

        copy.updatedAt = Date.now();
        return copy;
      });
    }
  }, [room]);

  // Join Room Handler for Mobile Player
  const handleJoinRoom = async (roomIdToJoin: string, playerName: string, avatar: string, token?: string) => {
    try {
      const res = await fetch(`/api/rooms/${roomIdToJoin}/join`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name: playerName, avatar, joinToken: token })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        let errMessage = language === 'en' ? 'Room code is invalid or the game has already started.' : 'کد اتاق معتبر نیست یا بازی آغاز شده است.';
        if (contentType.includes('application/json')) {
          try {
            const errData = await res.json();
            errMessage = errData.error || errData.message || errMessage;
          } catch {
            // ignore
          }
        }
        throw new Error(errMessage);
      }

      const data = await res.json();
      setRoom(data.room);
      setCurrentPlayerId(data.player.id);
      connectToRoomSSE(roomIdToJoin);
      setViewMode('PLAYER');
      soundEngine.playGong();
    } catch (err: unknown) {
      console.error('Join error:', err);
      const message = err instanceof Error ? err.message : (language === 'en' ? 'Room code is invalid or the game has already started.' : 'کد اتاق معتبر نیست یا بازی آغاز شده است.');
      setConnectionError(message);
    }
  };

  // Add 10 quick simulated bots for testing
  const handleAddTestBots = async () => {
    if (!room) return;
    try {
      const res = await fetch(`/api/rooms/${room.roomId}/bots`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ count: 10 })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.room) {
          setRoom(data.room);
          soundEngine.playGong();
        }
      }
    } catch (err) {
      console.error('Failed to add test bots:', err);
    }
  };

  // Current Player entity for player mode
  const currentPlayer = room?.players.find(p => p.id === currentPlayerId) || room?.players[0];

  // Handle game creation from GameCreatorScreen (Point 2 of 16-point spec)
  const handleGameCreated = async (params: {
    scenarioId: string;
    totalSeats: number;
    deckRoles: DeckRoleItem[];
    prefilledNames: string[];
    firstNightAwakeRoles: RoleId[];
    gameLanguage: Language;
    hostName: string;
  }) => {
    const newRoomId = 'MAFIA-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newJoinToken = Math.random().toString(36).substring(2, 8);
    const newHostToken = 'host_' + Date.now();

    const newPlayers: Player[] = Array.from({ length: params.totalSeats }).map((_, idx) => {
      const name = params.prefilledNames[idx] || `${language === 'en' ? 'Player' : 'بازیکن'} ${idx + 1}`;
      const roleItem = params.deckRoles[idx];
      return {
        id: `p_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        name,
        avatar: '🕵️‍♂️',
        role: roleItem ? roleItem.roleId : 'CITIZEN_SIMPLE',
        isAlive: true,
        isConnected: true,
        isReady: true,
        isHost: false,
        joinedAt: Date.now(),
        seatNumber: idx + 1,
        fouls: 0,
        roleRevealedAndConfirmed: false
      };
    });

    const newRoomState: RoomState = {
      roomId: newRoomId,
      hostToken: newHostToken,
      joinToken: newJoinToken,
      scenarioId: params.scenarioId,
      phase: 'RULES_REVIEW',
      dayNumber: 1,
      isTimerRunning: false,
      timerSeconds: 60,
      timerTotal: 60,
      isLobbyLocked: false,
      players: newPlayers,
      accusations: [],
      nightActions: [],
      votes: [],
      announcements: [
        {
          id: `ann_${Date.now()}`,
          title: language === 'en' ? 'Game Created' : 'بازی ایجاد شد',
          content: language === 'en'
            ? `Host table successfully initialized with selected scenario and ${params.totalSeats} players.`
            : `میز گرداننده با سناریوی انتخابی و ${params.totalSeats} بازیکن با موفقیت آماده شد.`,
          phase: 'RULES_REVIEW',
          dayNumber: 1,
          timestamp: Date.now(),
          isPublic: true,
          type: 'INFO'
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deckRoles: params.deckRoles,
      firstNightAwakeRoles: params.firstNightAwakeRoles
    } as any;

    setRoom(newRoomState);
    saveActiveRoomState(newRoomState);
    setActiveScreen('PLAYING');
    setViewMode('HOST');
    setIsRulesModalOpen(true);
    soundEngine.playGong();

    try {
      await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: newRoomId,
          hostToken: newHostToken,
          scenarioId: params.scenarioId,
          totalSeats: params.totalSeats,
          deckRoles: params.deckRoles,
          players: newPlayers
        })
      });
      connectToRoomSSE(newRoomId);
    } catch (e) {
      console.warn('Backend creation failed, using local room state:', e);
    }

    return { roomId: newRoomId, joinToken: newJoinToken };
  };

  // 1. Landing Screen (Point 1 of 16-point spec)
  if (activeScreen === 'HOME') {
    return (
      <ErrorBoundary language={language} onRecover={() => dispatchAction('EMERGENCY_UNSTICK_RECOVERY')}>
        <HomeScreen
          onOpenCreateGame={() => {
            setActiveScreen('GAME_CREATOR');
            soundEngine.playTick();
          }}
          onOpenJoinGame={() => {
            setActiveScreen('PLAYING');
            setViewMode('PLAYER');
            setIsJoinModalOpen(true);
            soundEngine.playTick();
          }}
          onOpenScenarios={() => {
            setIsPresetScenariosOpen(true);
            soundEngine.playTick();
          }}
          onOpenRuleSearch={() => {
            setIsRuleSearchOpen(true);
            soundEngine.playTick();
          }}
          onOpenMatrixModal={() => {
            setActiveMatrixScenarioId(room?.scenarioId || 'classic');
            setIsMatrixModalOpen(true);
            soundEngine.playTick();
          }}
          onOpenAiScenarioBuilder={() => {
            setIsAiScenarioBuilderOpen(true);
            soundEngine.playTick();
          }}
          onOpenDualSimulator={() => {
            setActiveScreen('PLAYING');
            setViewMode('DUAL');
            soundEngine.playTick();
          }}
          onOpenAuthProfile={() => {
            setIsAuthProfileOpen(true);
            soundEngine.playTick();
          }}
          onOpenOnlineMeeting={() => {
            setIsOnlineMeetingOpen(true);
            soundEngine.playTick();
          }}
          isMuted={isMuted}
          onToggleMute={() => {
            setIsMuted(!isMuted);
            soundEngine.toggleMute();
          }}
          language={language}
          onSelectLanguage={setLanguage}
          activeRoom={room}
          onReturnToActiveRoom={() => {
            setActiveScreen('PLAYING');
            soundEngine.playTick();
          }}
        />

        <React.Suspense fallback={null}>
          {isPresetScenariosOpen && (
            <PresetScenariosModal
              isOpen={isPresetScenariosOpen}
              onClose={() => setIsPresetScenariosOpen(false)}
              language={language}
              currentScenarioId={room?.scenarioId}
              onSelectScenario={(scenario) => {
                dispatchAction('UPDATE_SCENARIO', { scenarioId: scenario.id });
                setIsPresetScenariosOpen(false);
              }}
              onOpenDeckEditorWithScenario={(scenario) => {
                setEditingScenarioForDeck(scenario);
                setIsPresetScenariosOpen(false);
                setIsDeckBuilderOpen(true);
              }}
            />
          )}

          {isDeckBuilderOpen && (
            <DeckBuilderModal
              isOpen={isDeckBuilderOpen}
              onClose={() => {
                setIsDeckBuilderOpen(false);
                setEditingScenarioForDeck(null);
              }}
              language={language}
              onConfirmDeck={(deck: DeckRoleItem[]) => {
                dispatchAction('SET_DECK', { deckRoles: deck });
                setIsDeckBuilderOpen(false);
                setEditingScenarioForDeck(null);
              }}
              initialDeck={
                editingScenarioForDeck
                  ? editingScenarioForDeck.roles.map((r, i) => ({ id: `role_${i}_${r}`, roleId: r }))
                  : (room as any)?.deckRoles
              }
              initialScenarioName={editingScenarioForDeck?.name}
            />
          )}

          {isOnlineMeetingOpen && (
            <OnlineMeetingModal
              isOpen={isOnlineMeetingOpen}
              onClose={() => setIsOnlineMeetingOpen(false)}
              room={room}
              isHost={viewMode === 'HOST' || viewMode === 'DUAL'}
              language={language}
              onUpdateMeetingLink={(url, platform) => {
                dispatchAction('UPDATE_MEETING_LINK', { meetingUrl: url, meetingPlatform: platform });
              }}
            />
          )}

          {isAuthProfileOpen && (
            <AuthProfileModal
              isOpen={isAuthProfileOpen}
              onClose={() => setIsAuthProfileOpen(false)}
              language={language}
              activeRoomId={room?.roomId}
            />
          )}

          {isRuleSearchOpen && (
            <RuleSearchModal
              isOpen={isRuleSearchOpen}
              onClose={() => setIsRuleSearchOpen(false)}
              language={language}
            />
          )}

          {isMatrixModalOpen && (
            <InteractiveMatrixModal
              isOpen={isMatrixModalOpen}
              onClose={() => setIsMatrixModalOpen(false)}
              language={language}
              initialScenarioId={activeMatrixScenarioId}
              onApplyScenario={(scenarioId) => {
                dispatchAction('UPDATE_SCENARIO', { scenarioId });
                setIsMatrixModalOpen(false);
              }}
              onOpenDeckEditorWithScenario={(scenario) => {
                setEditingScenarioForDeck(scenario);
                setIsMatrixModalOpen(false);
                setIsDeckBuilderOpen(true);
              }}
              onAddRoleToDeck={(roleNameOrId) => {
                const matchedRole = Object.keys(ROLE_DEFINITIONS).find(k => 
                  k.toLowerCase() === roleNameOrId.toLowerCase() || 
                  ROLE_DEFINITIONS[k as RoleId]?.nameKey === roleNameOrId
                ) as RoleId || 'CITIZEN_SIMPLE';
                
                if (room) {
                  const currentDeck = (room as any).deckRoles || [];
                  const updatedDeck = [...currentDeck, { id: `role_${Date.now()}_${matchedRole}`, roleId: matchedRole }];
                  dispatchAction('SET_DECK', { deckRoles: updatedDeck });
                }
              }}
              onOpenRoleGuide={() => {
                setIsMatrixModalOpen(false);
                setIsRoleGuideOpen(true);
              }}
            />
          )}

          {isAiScenarioBuilderOpen && (
            <AiScenarioBuilderModal
              isOpen={isAiScenarioBuilderOpen}
              onClose={() => setIsAiScenarioBuilderOpen(false)}
              language={language}
              onScenarioAdded={(scenario) => {
                setActiveMatrixScenarioId(scenario.id);
                setIsMatrixModalOpen(true);
              }}
              onOpenMatrixWithScenario={(scenarioId) => {
                setActiveMatrixScenarioId(scenarioId);
                setIsMatrixModalOpen(true);
              }}
            />
          )}

          {isJoinModalOpen && (
            <QRScannerModal
              isOpen={isJoinModalOpen}
              onClose={() => setIsJoinModalOpen(false)}
              onJoinRoom={handleJoinRoom}
              language={language}
              initialRoomId={joinUrlParams.roomId || room?.roomId || ''}
              initialToken={joinUrlParams.token || ''}
            />
          )}
        </React.Suspense>
      </ErrorBoundary>
    );
  }

  // 2. Game Creator Screen for God (Point 2 of 16-point spec)
  if (activeScreen === 'GAME_CREATOR') {
    return (
      <ErrorBoundary language={language} onRecover={() => dispatchAction('EMERGENCY_UNSTICK_RECOVERY')}>
        <GameCreatorScreen
          onBackToHome={() => {
            setActiveScreen('HOME');
            soundEngine.playTick();
          }}
          onGameCreated={handleGameCreated}
          language={language}
          onSelectLanguage={setLanguage}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary language={language} onRecover={() => dispatchAction('EMERGENCY_UNSTICK_RECOVERY')}>
      <div className="min-h-screen bg-[#0a0a0c] text-[#e2e2e7] flex flex-col font-sans selection:bg-amber-500 selection:text-black" dir={language === 'en' ? 'ltr' : 'rtl'}>
      
      {/* Universal Top Header */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        language={language}
        setLanguage={setLanguage}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onOpenSoundboard={() => setIsSoundboardOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenFlutterExport={() => setIsFlutterExportOpen(true)}
        onOpenTestBench={() => setIsTestBenchOpen(true)}
        onOpenRuleSearch={() => setIsRuleSearchOpen(true)}
        onOpenFullGameReport={() => setIsFullGameReportOpen(true)}
        onOpenMatrixModal={() => {
          setActiveMatrixScenarioId(room?.scenarioId || 'classic');
          setIsMatrixModalOpen(true);
        }}
        onOpenPresetScenarios={() => setIsPresetScenariosOpen(true)}
        onOpenRoleGuide={() => setIsRoleGuideOpen(true)}
        onOpenAiScenarioBuilder={() => setIsAiScenarioBuilderOpen(true)}
        onOpenGameProfileModal={() => setIsGameProfileOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenBugReport={() => setIsBugReportOpen(true)}
        onOpenAutomatedQA={() => setIsAutomatedQAOpen(true)}
        onOpenGodTable={() => setIsGlobalGodDrawerOpen(true)}
        onOpenOnlineMeeting={() => setIsOnlineMeetingOpen(true)}
        onOpenUserStories={() => setIsUserStoriesOpen(true)}
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
        onOpenAuthProfile={() => setIsAuthProfileOpen(true)}
        onOpenGeminiAssistant={() => setIsGeminiAssistantOpen(true)}
        onNewGame={handleCreateNewGame}
        onGoHome={() => setActiveScreen('HOME')}
        roomId={room?.roomId}
        isOnline={isOnline}
        isNightPhase={room?.phase === 'NIGHT'}
        onForceSync={forceSyncRoom}
        latencyMs={latencyMs}
        isSyncing={isSyncing}
      />

      {/* 16-Point Game Phase Stepper (Point 8 of 16-point spec) */}
      {room && (
        <div className="max-w-7xl mx-auto w-full px-2 sm:px-6 pt-3">
          <GamePhaseStepper
            currentPhase={room.phase}
            dayNumber={room.dayNumber}
            language={language}
            onSelectPhase={(phase) => dispatchAction('SET_PHASE', { phase })}
          />
        </div>
      )}

      {/* Main Screen Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-1.5 sm:p-6">
        
        {connectionError && (
          <div className="mb-4 p-4 rounded-2xl bg-[#1a0f12] border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span>{connectionError}</span>
            </div>
            <button
              onClick={() => setConnectionError(null)}
              className="text-xs px-3 py-1.5 bg-white/10 rounded-xl text-slate-200 hover:text-white"
            >
              {translations[language]?.understood || 'متوجه شدم'}
            </button>
          </div>
        )}

        {!room ? (
          <div className="flex flex-col items-center justify-center py-28 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 animate-pulse">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-[#e2e2e7]">
              {translations[language]?.preparingSystem || 'در حال آماده‌سازی سیستم‌عامل مافیا...'}
            </h3>
            <p className="text-xs text-slate-400">
              {translations[language]?.connectingServer || 'اتصال به وب‌سرور و پیکربندی پروتکل همگام‌سازی بی‌درنگ'}
            </p>
          </div>
        ) : viewMode === 'HOST' ? (
          <HostConsoleView
            room={room}
            onSetPhase={(phase, dayNum) => dispatchAction('SET_PHASE', { phase, dayNumber: dayNum })}
            onTimerControl={(seconds, total, isRunning) => dispatchAction('TIMER_CONTROL', { seconds, total, isRunning })}
            onUpdateScenario={(scenarioId) => dispatchAction('UPDATE_SCENARIO', { scenarioId })}
            onLockLobby={(locked) => dispatchAction('LOCK_LOBBY', { locked })}
            onStartGame={() => dispatchAction('START_GAME')}
            onAddTestBots={handleAddTestBots}
            onKickPlayer={(playerId) => dispatchAction('KICK_PLAYER', { playerId })}
            onRenamePlayer={(playerId, newName) => dispatchAction('RENAME_PLAYER', { playerId, newName })}
            onChangeRole={(playerId, newRole) => dispatchAction('CHANGE_ROLE', { playerId, role: newRole })}
            onReorderPlayers={(reordered) => dispatchAction('UPDATE_PLAYERS', { players: reordered })}
            onUpdateHouseRules={(rules) => dispatchAction('UPDATE_HOUSE_RULES', { rules })}
            onKillPlayer={(playerId) => dispatchAction('KILL_PLAYER', { playerId })}
            onRevivePlayer={(playerId) => dispatchAction('REVIVE_PLAYER', { playerId })}
            onSendToDefense={(playerId) => dispatchAction('SEND_TO_DEFENSE', { playerId })}
            onAddAccusation={(accuserId, targetId) => dispatchAction('ADD_ACCUSATION', { accuserId, targetId })}
            onResolveNight={(deadPlayerIds, mutedPlayerId, narrative) => 
              dispatchAction('RESOLVE_NIGHT', { deadPlayerIds, mutedPlayerId, narrative })
            }
            onPublishChronicle={(text) => dispatchAction('PUBLISH_CHRONICLE', { text })}
            onEliminatePlayer={(playerId) => dispatchAction('ELIMINATE_PLAYER', { playerId })}
            onClearDefense={() => dispatchAction('CLEAR_DEFENSE')}
            onAddPlayer={(name, seatNumber, role) => dispatchAction('ADD_SINGLE_PLAYER', { name, seatNumber, role })}
            onResolveTie={(resolution, candidateIds) => dispatchAction('RESOLVE_VOTING_TIE', { resolution, candidateIds })}
            language={language}
          />
        ) : viewMode === 'PLAYER' ? (
          currentPlayer ? (
            <PlayerCityScreen
              room={room}
              currentPlayer={currentPlayer}
              onSendAccusation={(targetId) => dispatchAction('ADD_ACCUSATION', { accuserId: currentPlayer.id, targetId })}
              onVote={(targetPlayerId, voteValue) => dispatchAction('SUBMIT_VOTE', { targetPlayerId, voteValue })}
              language={language}
            />
          ) : (
            <div className="p-8 text-center bg-[#0f0f12] border border-white/10 rounded-3xl space-y-4 max-w-md mx-auto my-12">
              <QrCode className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="text-lg font-bold text-[#e2e2e7]">
                {translations[language]?.notConnectedYet || 'شما هنوز به هیچ اتاقی متصل نیستید'}
              </h3>
              <p className="text-xs text-slate-400">
                {translations[language]?.joinRoomPrompt || 'برای ورود به بازی گرداننده، روی دکمه زیر کلیک کنید و کد اتاق یا بارکد را وارد نمایید.'}
              </p>
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                {translations[language]?.enterRoomCodeOrScanQr || 'ورود با کد اتاق یا اسکن QR'}
              </button>
            </div>
          )
        ) : (
          /* Dual Simulator View */
          <DualSimulatorView
            room={room}
            onSetPhase={(phase, dayNum) => dispatchAction('SET_PHASE', { phase, dayNumber: dayNum })}
            onTimerControl={(seconds, total, isRunning) => dispatchAction('TIMER_CONTROL', { seconds, total, isRunning })}
            onUpdateScenario={(scenarioId) => dispatchAction('UPDATE_SCENARIO', { scenarioId })}
            onLockLobby={(locked) => dispatchAction('LOCK_LOBBY', { locked })}
            onStartGame={() => dispatchAction('START_GAME')}
            onAddTestBots={handleAddTestBots}
            onKickPlayer={(playerId) => dispatchAction('KICK_PLAYER', { playerId })}
            onRenamePlayer={(playerId, newName) => dispatchAction('RENAME_PLAYER', { playerId, newName })}
            onChangeRole={(playerId, newRole) => dispatchAction('CHANGE_ROLE', { playerId, role: newRole })}
            onReorderPlayers={(reordered) => dispatchAction('UPDATE_PLAYERS', { players: reordered })}
            onUpdateHouseRules={(rules) => dispatchAction('UPDATE_HOUSE_RULES', { rules })}
            onKillPlayer={(playerId) => dispatchAction('KILL_PLAYER', { playerId })}
            onRevivePlayer={(playerId) => dispatchAction('REVIVE_PLAYER', { playerId })}
            onSendToDefense={(playerId) => dispatchAction('SEND_TO_DEFENSE', { playerId })}
            onAddAccusation={(accuserId, targetId) => dispatchAction('ADD_ACCUSATION', { accuserId, targetId })}
            onResolveNight={(deadPlayerIds, mutedPlayerId, narrative) => 
              dispatchAction('RESOLVE_NIGHT', { deadPlayerIds, mutedPlayerId, narrative })
            }
            onPublishChronicle={(text) => dispatchAction('PUBLISH_CHRONICLE', { text })}
            onEliminatePlayer={(playerId) => dispatchAction('ELIMINATE_PLAYER', { playerId })}
            onClearDefense={() => dispatchAction('CLEAR_DEFENSE')}
            onHostAction={(actionType, payload) => dispatchAction(actionType, payload)}
            onAddPlayer={(name, seatNumber, role) => {
              dispatchAction('ADD_MANUAL_PLAYER', { name, seatNumber, role });
            }}
            onVote={(targetPlayerId, voteValue) => dispatchAction('SUBMIT_VOTE', { targetPlayerId, voteValue })}
            onResolveTie={(resolution, candidateIds) => dispatchAction('RESOLVE_VOTING_TIE', { resolution, candidateIds })}
            language={language}
          />
        )}

      </main>

      {/* Floating Modals & Lazy-Loaded Overlays */}
      {isRulesModalOpen && room && (
        <RulesBriefingChecklistModal
          room={room}
          isHost={viewMode === 'HOST' || viewMode === 'DUAL'}
          onHostConfirmRead={() => {
            setIsRulesModalOpen(false);
            dispatchAction('SET_PHASE', { phase: 'ROLE_DEAL' });
          }}
          onDealRoles={() => {
            setIsRulesModalOpen(false);
            dispatchAction('DEAL_ROLES');
            dispatchAction('SET_PHASE', { phase: 'INTRO_DAY' });
          }}
          language={language}
        />
      )}

      <QRScannerModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoinRoom={handleJoinRoom}
        language={language}
        initialRoomId={joinUrlParams.roomId}
        initialToken={joinUrlParams.token}
      />

      {/* Entry Screen: Create or Join Game choice */}
      <WelcomeChoiceModal
        isOpen={isWelcomeChoiceOpen}
        onCreateGame={() => {
          setIsWelcomeChoiceOpen(false);
          setViewMode('HOST');
          setIsDeckBuilderOpen(true);
          soundEngine.playGong();
        }}
        onJoinGame={() => {
          setIsWelcomeChoiceOpen(false);
          setViewMode('PLAYER');
          setIsJoinModalOpen(true);
          soundEngine.playTick();
        }}
        onOpenMatrix={() => {
          setActiveMatrixScenarioId(room?.scenarioId || 'classic');
          setIsMatrixModalOpen(true);
        }}
        onOpenAiStudio={() => {
          setIsAiScenarioBuilderOpen(true);
        }}
        onOpenOnlineMeeting={() => {
          setIsOnlineMeetingOpen(true);
        }}
        onOpenUserStories={() => {
          setIsUserStoriesOpen(true);
        }}
        language={language}
        onSelectLanguage={setLanguage}
      />

      {/* Online Voice & Video Meeting Modal */}
      <OnlineMeetingModal
        isOpen={isOnlineMeetingOpen}
        onClose={() => setIsOnlineMeetingOpen(false)}
        room={room}
        isHost={viewMode === 'HOST' || viewMode === 'DUAL'}
        language={language}
        onUpdateMeetingLink={(url, platform) => {
          dispatchAction('UPDATE_MEETING_LINK', { meetingUrl: url, meetingPlatform: platform });
        }}
      />

      <React.Suspense fallback={null}>
        {isSoundboardOpen && (
          <SoundboardModal
            isOpen={isSoundboardOpen}
            onClose={() => setIsSoundboardOpen(false)}
            language={language}
          />
        )}

        {isHistoryOpen && (
          <GameHistoryModal
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            onReplaySet={(players, scenarioId, autoStart) => {
              const phase = autoStart ? 'DAY_DISCUSSION' : 'LOBBY';
              dispatchAction('REPLAY_SET', { players, scenarioId, phase });
            }}
            language={language}
          />
        )}

        {isFlutterExportOpen && (
          <FlutterExportModal
            isOpen={isFlutterExportOpen}
            onClose={() => setIsFlutterExportOpen(false)}
            language={language}
          />
        )}

        {isPresetScenariosOpen && (
          <PresetScenariosModal
            isOpen={isPresetScenariosOpen}
            onClose={() => setIsPresetScenariosOpen(false)}
            language={language}
            currentScenarioId={room?.scenarioId}
            onSelectScenario={(scenario) => {
              dispatchAction('UPDATE_SCENARIO', { scenarioId: scenario.id });
              scenario.roles.forEach((roleId, idx) => {
                if (room?.players[idx]) {
                  dispatchAction('CHANGE_ROLE', { playerId: room.players[idx].id, role: roleId });
                }
              });
            }}
            onOpenDeckEditorWithScenario={(scenario) => {
              setEditingScenarioForDeck(scenario);
              setIsDeckBuilderOpen(true);
            }}
          />
        )}

        {isDeckBuilderOpen && (
          <DeckBuilderModal
            isOpen={isDeckBuilderOpen}
            onClose={() => {
              setIsDeckBuilderOpen(false);
              setEditingScenarioForDeck(null);
            }}
            language={language}
            onConfirmDeck={(deck: DeckRoleItem[], scenarioName?: string) => {
              dispatchAction('SET_DECK', { deckRoles: deck });
              deck.forEach((item, idx) => {
                if (room?.players[idx]) {
                  dispatchAction('CHANGE_ROLE', { playerId: room.players[idx].id, role: item.roleId });
                }
              });
              setIsDeckBuilderOpen(false);
              setEditingScenarioForDeck(null);
            }}
            initialDeck={
              editingScenarioForDeck
                ? editingScenarioForDeck.roles.map((r, i) => ({ id: `role_${i}_${r}`, roleId: r }))
                : (room as any)?.deckRoles
            }
            initialScenarioName={editingScenarioForDeck?.name}
          />
        )}

        {isTestBenchOpen && (
          <MultiPlayerTestBenchModal
            isOpen={isTestBenchOpen}
            onClose={() => setIsTestBenchOpen(false)}
            room={room || undefined}
            onApplyBotsToRoom={(players) => {
              dispatchAction('SET_PLAYERS', { players });
            }}
            onSimulateAccusations={() => {
              dispatchAction('SIMULATE_DAY_ACCUSATIONS');
            }}
            onSimulateNightActions={() => {
              if (room) {
                const alive = room.players.filter(p => p.isAlive);
                if (alive.length > 2) {
                  const victim = alive[Math.floor(Math.random() * alive.length)];
                  dispatchAction('RESOLVE_NIGHT', { 
                    deadPlayerIds: [victim.id],
                    narrative: language === 'en'
                      ? `Night Simulation: "${victim.name}" was targeted and eliminated by mafia shot.`
                      : `شبیه‌سازی شب: «${victim.name}» مورد هدف شلیک مافیا قرار گرفت.`
                  });
                }
              }
            }}
            onSimulateVotes={() => {
              if (room) {
                const alive = room.players.filter(p => p.isAlive);
                if (alive.length > 0) {
                  dispatchAction('SEND_TO_DEFENSE', { playerId: alive[0].id });
                }
              }
            }}
            language={language}
          />
        )}

        {isRuleSearchOpen && (
          <RuleSearchModal
            isOpen={isRuleSearchOpen}
            onClose={() => setIsRuleSearchOpen(false)}
            language={language}
          />
        )}

        {isFullGameReportOpen && (
          <FullGameTestReportModal
            isOpen={isFullGameReportOpen}
            onClose={() => setIsFullGameReportOpen(false)}
            onApplyGameToRoom={(players) => {
              dispatchAction('SET_PLAYERS', { players });
            }}
            language={language}
          />
        )}

        {isMatrixModalOpen && (
          <InteractiveMatrixModal
            isOpen={isMatrixModalOpen}
            onClose={() => setIsMatrixModalOpen(false)}
            language={language}
            initialScenarioId={activeMatrixScenarioId}
            onApplyScenario={(scenarioId) => {
              dispatchAction('UPDATE_SCENARIO', { scenarioId });
              setIsMatrixModalOpen(false);
            }}
            onOpenDeckEditorWithScenario={(scenario) => {
              setEditingScenarioForDeck(scenario);
              setIsMatrixModalOpen(false);
              setIsDeckBuilderOpen(true);
            }}
            onAddRoleToDeck={(roleNameOrId) => {
              const matchedRole = Object.keys(ROLE_DEFINITIONS).find(k => 
                k.toLowerCase() === roleNameOrId.toLowerCase() || 
                ROLE_DEFINITIONS[k as RoleId]?.nameKey === roleNameOrId
              ) as RoleId || 'CITIZEN_SIMPLE';
              
              if (room) {
                const currentDeck = (room as any).deckRoles || [];
                const updatedDeck = [...currentDeck, { id: `role_${Date.now()}_${matchedRole}`, roleId: matchedRole }];
                dispatchAction('SET_DECK', { deckRoles: updatedDeck });
              }
            }}
            onOpenRoleGuide={(roleId) => {
              setIsMatrixModalOpen(false);
              setIsRoleGuideOpen(true);
            }}
          />
        )}

        {isAiScenarioBuilderOpen && (
          <AiScenarioBuilderModal
            isOpen={isAiScenarioBuilderOpen}
            onClose={() => setIsAiScenarioBuilderOpen(false)}
            language={language}
            onScenarioAdded={(scenario) => {
              setActiveMatrixScenarioId(scenario.id);
              setIsMatrixModalOpen(true);
            }}
            onOpenMatrixWithScenario={(scenarioId) => {
              setActiveMatrixScenarioId(scenarioId);
              setIsMatrixModalOpen(true);
            }}
          />
        )}

        {isGameProfileOpen && room && (
          <GameProfileModal
            isOpen={isGameProfileOpen}
            onClose={() => setIsGameProfileOpen(false)}
            room={room}
            language={language}
            onSelectRoleForClash={() => {
              setIsGameProfileOpen(false);
              setActiveMatrixScenarioId(room.scenarioId || 'classic');
              setIsMatrixModalOpen(true);
            }}
          />
        )}

        {isRoleGuideOpen && (
          <RoleGuideModal
            isOpen={isRoleGuideOpen}
            onClose={() => setIsRoleGuideOpen(false)}
            language={language}
            onAddRoleToDeck={(roleId) => {
              if (room) {
                const currentDeck = (room as any).deckRoles || [];
                const updatedDeck = [...currentDeck, { id: `role_${Date.now()}_${roleId}`, roleId }];
                dispatchAction('SET_DECK', { deckRoles: updatedDeck });
              }
            }}
            onOpenMatrixForRole={(roleId) => {
              setIsRoleGuideOpen(false);
              setActiveMatrixScenarioId(room?.scenarioId || 'classic');
              setIsMatrixModalOpen(true);
            }}
          />
        )}

        {isSettingsOpen && (
          <ComprehensiveSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            language={language}
            onLanguageChange={setLanguage}
            settings={extendedSettings}
            onSaveSettings={(newSettings) => {
              setExtendedSettings(newSettings);
              saveLocalSettings(newSettings);
            }}
            onResetToDefaults={() => {
              const defaults = defaultSettings as ExtendedAppSettings;
              setExtendedSettings(defaults);
              saveLocalSettings(defaults);
            }}
            onOpenBugReport={() => setIsBugReportOpen(true)}
          />
        )}

        {isAutomatedQAOpen && (
          <AutomatedQASuiteModal
            isOpen={isAutomatedQAOpen}
            onClose={() => setIsAutomatedQAOpen(false)}
            language={language}
          />
        )}

        {isUserStoriesOpen && (
          <UserStoriesChecklistModal
            isOpen={isUserStoriesOpen}
            onClose={() => setIsUserStoriesOpen(false)}
            language={language}
          />
        )}

        {/* Join Room Modal (QR / Room Code / Nickname) */}
        {isJoinModalOpen && (
          <QRScannerModal
            isOpen={isJoinModalOpen}
            onClose={() => setIsJoinModalOpen(false)}
            onJoinRoom={handleJoinRoom}
            language={language}
            initialRoomId={joinUrlParams.roomId || room?.roomId || ''}
            initialToken={joinUrlParams.token || ''}
          />
        )}

        {isBugReportOpen && (
          <BugReportModal
            isOpen={isBugReportOpen}
            onClose={() => setIsBugReportOpen(false)}
            language={language}
            room={room}
            onEmergencyUnstick={() => dispatchAction('EMERGENCY_UNSTICK_RECOVERY')}
          />
        )}

        {/* Firebase Authentication & Cloud Database Sync Modal */}
        <AuthProfileModal
          isOpen={isAuthProfileOpen}
          onClose={() => setIsAuthProfileOpen(false)}
          language={language}
          activeRoomId={room?.roomId}
        />

        {/* Multi-turn Gemini AI Assistant with Search Grounding & Maps Grounding */}
        <GeminiAssistantModal
          isOpen={isGeminiAssistantOpen}
          onClose={() => setIsGeminiAssistantOpen(false)}
          language={language}
        />
      </React.Suspense>

      {/* Omnipresent Floating God Table & Reference Drawer */}
      <GlobalGodInfoDrawer
        room={room}
        language={language}
        onOpenMatrixModal={() => {
          setActiveMatrixScenarioId(room?.scenarioId || 'classic');
          setIsMatrixModalOpen(true);
        }}
        onOpenRoleGuide={(roleId) => {
          setIsRoleGuideOpen(true);
        }}
      />

    </div>
    </ErrorBoundary>
  );
}
