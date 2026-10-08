import { HouseRulesConfig } from '../data/matrixData';

export type GamePhase =
  | 'SETUP'
  | 'LOBBY'
  | 'RULES_REVIEW'
  | 'ROLE_DEAL'
  | 'INTRO_DAY'
  | 'INTRO_NIGHT'
  | 'DAY_DISCUSSION'
  | 'DAY_ACCUSATION'
  | 'DAY_DEFENSE'
  | 'DAY_VOTING'
  | 'DAY_LAST_WORDS'
  | 'NIGHT'
  | 'GAME_OVER';

export type RoleAffiliation = 'CITIZEN' | 'MAFIA' | 'INDEPENDENT';

export type RoleId =
  | 'GODFATHER'
  | 'MAFIA_SIMPLE'
  | 'DOCTOR_LECTER'
  | 'NATASHA'
  | 'TERRORIST'
  | 'MATADOR'
  | 'SAUL_GOODMAN'
  | 'SHAH_KOSH'
  | 'SWEETHEART'
  | 'NEGOTIATOR'
  | 'NATO'
  | 'HOSTAGE_TAKER'
  | 'POISONER'
  | 'HACKER'
  | 'CHURCHILL'
  | 'DEXTER'
  | 'LOBBYIST'
  | 'SPY'
  | 'STRONG_MAN'
  | 'MAFIA_GANGSTER'
  | 'CITIZEN_SIMPLE'
  | 'DOCTOR'
  | 'DOCTOR_WATSON'
  | 'DETECTIVE'
  | 'SNIPER'
  | 'ARMORED'
  | 'MAYOR'
  | 'PSYCHOLOGIST'
  | 'DIE_HARD'
  | 'GUNNER'
  | 'RANGER'
  | 'INQUISITOR'
  | 'CONSTANTINE'
  | 'PRIEST'
  | 'JUDGE'
  | 'SACRIFICE'
  | 'CITIZEN_KANE'
  | 'GUARD'
  | 'JOURNALIST'
  | 'GUNSMITH'
  | 'SCIENTIST'
  | 'GRAVEDIGGER'
  | 'BRIDESMAID'
  | 'KNIGHT'
  | 'HERO'
  | 'COWBOY'
  | 'FREEMASON'
  | 'BARTENDER'
  | 'THIEF'
  | 'HUNTER'
  | 'JOKER'
  | 'NOSTRADAMUS'
  | 'ZODIAC'
  | 'WEREWOLF'
  | 'JACK_SPARROW'
  | 'DENTIST'
  | 'CUSTOM'
  | string;

export interface RoleInteractionMatchup {
  targetRoleId: RoleId;
  targetRoleName: string;
  effect: string;
  interactionType: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'LETHAL';
}

export interface RoleActDetail {
  phase: 'NIGHT' | 'DAY' | 'PASSIVE';
  title: string;
  description: string;
  priorityOrder?: number;
}

export interface RoleDefinition {
  id: RoleId;
  nameKey: string;
  affiliation: RoleAffiliation;
  descriptionKey: string;
  nightPriority: number; // 0 = no night action, 1 = first, etc.
  hasInquiryImmunity?: boolean;
  hasNightShield?: boolean;
  iconName: string;
  teamColor: string;
  acts?: RoleActDetail[];
  exceptions?: string[];
  matchups?: RoleInteractionMatchup[];
  counterpartRoleId?: RoleId;
  counterpartRoleName?: string;
  recommendedBundleName?: string;
}

export interface RoleBundle {
  id: string;
  name: string;
  description: string;
  category: 'DUEL' | 'BALANCE' | 'ADVANCED' | 'CHAOS';
  roles: RoleId[];
  tag: string;
  icon: string;
}

export interface DeckRoleItem {
  id: string;
  roleId: RoleId;
  customName?: string;
  customAffiliation?: RoleAffiliation;
}

export interface ChallengeRequest {
  id: string;
  requesterPlayerId: string;
  targetSpeakerId?: string;
  isPermanentUntilAccepted: boolean;
  timingPreference: 'BEFORE' | 'AFTER' | 'ANY';
  status: 'PENDING' | 'ACCEPTED' | 'WITHDRAWN';
  createdAt: number;
}

export interface VotingSessionState {
  isOpen: boolean;
  stage: 'DEFENSE_ENTRY' | 'EXIT_VOTE';
  targetPlayerId: string | null;
  defenseCandidates: string[];
  votes: Record<string, boolean>; // playerId -> true (voted yes) / false (voted no)
  manualCount?: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  role: RoleId;
  isAlive: boolean;
  isConnected: boolean;
  isReady?: boolean;
  isHost: boolean;
  isPlaceholder?: boolean;
  isBot?: boolean;
  isMuted?: boolean;
  speechMuted?: boolean; // God muted/skipped their speech turn
  fouls?: number; // 0, 1, 2, 3, 4
  hasShield?: boolean;
  roleRevealedAndConfirmed?: boolean;
  customRoleName?: string;
  customRoleAffiliation?: RoleAffiliation;
  joinedAt?: number;
  lastActiveAt?: number;
  seatNumber?: number;
  notes?: string;
  inDefense?: boolean;
  votesReceived?: number;
}

export interface Accusation {
  id: string;
  accuserId: string;
  targetId: string;
  dayNumber: number;
  phase?: GamePhase;
  timestamp: number;
  note?: string;
}

export interface NightActionRecord {
  id: string;
  dayNumber: number;
  actorId: string;
  actorRole: RoleId;
  actionType: 'KILL' | 'SAVE' | 'INQUIRE' | 'SNIPE' | 'MUTE' | 'HEAL' | 'SHIELD';
  targetId: string;
  result?: string;
  isSuccessful?: boolean;
  timestamp: number;
}

export interface VotingRecord {
  id: string;
  dayNumber: number;
  voterId: string;
  targetId: string;
  timestamp: number;
}

export interface GameAnnouncement {
  id: string;
  title: string;
  content: string;
  phase: GamePhase;
  dayNumber: number;
  timestamp: number;
  isPublic: boolean;
  type: 'INFO' | 'DEATH' | 'WARNING' | 'VICTORY' | 'CHRONICLE';
}

export interface RoomState {
  roomId: string;
  scenarioId: string;
  hostToken: string;
  joinToken: string;
  isLobbyLocked: boolean;
  phase: GamePhase;
  dayNumber: number;
  timerSeconds: number;
  timerTotal: number;
  isTimerRunning: boolean;
  // Live Speaker & Speech Engine
  defaultSpeechSeconds?: number;
  defaultChallengeSeconds?: number;
  activeSpeakerId?: string | null;
  activeSpeakerType?: 'SPEECH' | 'CHALLENGE' | 'DEFENSE' | null;
  speakerTimeRemaining?: number;
  speakerTimerTotal?: number;
  isSpeakerTimerRunning?: boolean;
  activeDefensePlayers?: string[];
  currentSpeakerSeat?: number | null;
  currentChallengeSpeakerSeat?: number | null;
  // Challenge & Voting Sessions
  challengeRequests?: ChallengeRequest[];
  votingState?: VotingSessionState;
  // Deck & Table Distribution
  deckRoles?: DeckRoleItem[];
  tableShuffled?: boolean;
  rolesDistributed?: boolean;
  daySpeakingStartSeat?: number;
  nightScriptStep?: number;
  players: Player[];
  accusations: Accusation[];
  nightActions: NightActionRecord[];
  votes: VotingRecord[];
  announcements: GameAnnouncement[];
  morningChronicle?: string;
  houseRules?: HouseRulesConfig;
  winner?: RoleAffiliation | 'DRAW' | null;
  meetingUrl?: string;
  meetingPlatform?: 'google_meet' | 'discord' | 'jitsi' | 'telegram' | 'custom';
  // 16-Step Game Flow Specifications
  targetSeatsCount?: number;
  firstNightAwakeRoles?: RoleId[];
  rulesAcknowledgedPlayers?: string[];
  rulesReadByHost?: boolean;
  nightMusicBroadcast?: boolean;
  gameLanguage?: Language;
  votingStage?: 'DEFENSE_ENTRY' | 'EXIT_VOTE' | null;
  currentDefenseCandidates?: string[];
  votingTargetPlayerId?: string | null;
  defenseVotes?: Record<string, boolean>;
  eliminationVotes?: Record<string, boolean>;
  createdAt: number;
  updatedAt: number;
  gameStartedAt?: number;
  gameEndedAt?: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  recommendedPlayerCount: number;
  roles: RoleId[];
  isCustom?: boolean;
  tag?: string;
  difficulty?: 'ساده' | 'متوسط' | 'پیشرفته' | string;
}

export interface ScenarioValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  roleCounts: {
    total: number;
    mafia: number;
    citizen: number;
    independent: number;
    recommendedMafia: number;
  };
  duplicateUniqueRoles: string[];
}

export interface AccusationMatrixData {
  players: Player[];
  matrix: Record<string, Record<string, number>>; // accuserId -> targetId -> count
  totalGivenByPlayer: Record<string, number>;
  totalReceivedByPlayer: Record<string, number>;
  mutualAccusations: {
    playerA: Player;
    playerB: Player;
    countAtoB: number;
    countBtoA: number;
    total: number;
  }[];
  mostAggressiveAccuser?: { player: Player; count: number };
  mostTargetedPlayer?: { player: Player; count: number };
  totalAccusations: number;
}

export interface AccusationPatternAnalysis {
  mostAggressive?: { player: Player; totalGiven: number };
  mostTargeted?: { player: Player; totalReceived: number };
  mutualConflicts: {
    playerA: string;
    playerB: string;
    total: number;
    aToB: number;
    bToA: number;
  }[];
  oneSidedPressure: {
    accuser: string;
    target: string;
    count: number;
  }[];
  accusationClusters: {
    label: string;
    playerIds: string[];
    description: string;
  }[];
  dayByDayEvolution: {
    day: number;
    total: number;
    topTargetName: string;
  }[];
}

export interface GameHistoryItem {
  id: string;
  roomId: string;
  scenarioName: string;
  date: string;
  durationMinutes: number;
  winner: RoleAffiliation | 'DRAW';
  playerCount: number;
  players: {
    id: string;
    name: string;
    role: RoleId;
    isAlive: boolean;
    avatar: string;
  }[];
  totalAccusations: number;
  accusations: Accusation[];
  nightActions: NightActionRecord[];
  announcements: GameAnnouncement[];
  snapshotJson: string;
}

export type GameHistoryEntry = GameHistoryItem;

export type Language = 'fa' | 'en' | 'ar' | 'tr';
