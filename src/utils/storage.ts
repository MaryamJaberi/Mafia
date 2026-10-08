import { GameHistoryItem, RoomState, Language } from '../types/mafia';

const HISTORY_KEY = 'mafia_host_games_history_v1';
const SETTINGS_KEY = 'mafia_host_settings_v1';
const ACTIVE_ROOM_KEY = 'mafia_host_active_room_v1';

export interface HostSettings {
  language: Language;
  isSoundMuted: boolean;
  hapticFeedback: boolean;
  defaultTimerSeconds: number;
  defenseTimerSeconds: number;
  defaultViewMode: 'HOST' | 'PLAYER' | 'DUAL';
  showGodGuidance?: boolean;
  autoPlayNightAmbiance?: boolean;
  enableVibration?: boolean;
  defaultDaySpeechTime?: number;
  defaultChallengeTime?: number;
  defaultDefenseTime?: number;
  enableAIAssistant?: boolean;
  enableNightWhisperMode?: boolean;
  enableSoundEffects?: boolean;
  enableAccusationLiveGraph?: boolean;
}

export const defaultSettings: HostSettings = {
  language: 'fa',
  isSoundMuted: false,
  hapticFeedback: true,
  defaultTimerSeconds: 60,
  defenseTimerSeconds: 45,
  defaultViewMode: 'HOST',
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
};

export function getLocalSettings(): HostSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveLocalSettings(settings: Partial<HostSettings>): void {
  try {
    const current = getLocalSettings();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...settings }));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export const loadAppSettings = getLocalSettings;
export const saveAppSettings = saveLocalSettings;

export function getLocalGameHistory(): GameHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export const loadGameHistory = getLocalGameHistory;

export function saveGameToHistory(historyOrRoom: RoomState | GameHistoryItem | Record<string, unknown>): GameHistoryItem {
  const history = getLocalGameHistory();
  
  let item: GameHistoryItem;
  if ('roomId' in historyOrRoom && 'players' in historyOrRoom && 'accusations' in historyOrRoom) {
    const room = historyOrRoom as RoomState;
    const durationMinutes = room.gameStartedAt
      ? Math.max(1, Math.round(((room.gameEndedAt || Date.now()) - room.gameStartedAt) / 60000))
      : 15;

    item = {
      id: `game_${room.roomId}_${Date.now()}`,
      roomId: room.roomId,
      scenarioName: room.scenarioId || 'کلاسیک',
      date: new Date().toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      durationMinutes,
      winner: (room.winner as any) || 'CITIZEN',
      playerCount: room.players.length,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        role: p.role,
        isAlive: p.isAlive,
        avatar: p.avatar
      })),
      totalAccusations: room.accusations.length,
      accusations: room.accusations,
      nightActions: room.nightActions || [],
      announcements: room.announcements || [],
      snapshotJson: JSON.stringify(room)
    };
  } else {
    item = historyOrRoom as unknown as GameHistoryItem;
  }

  const updated = [item, ...history.filter(h => h.id !== item.id)].slice(0, 50);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save history to localStorage:', err);
  }
  return item;
}

export const saveGameHistory = saveGameToHistory;

export function deleteGameFromHistory(id: string): void {
  const history = getLocalGameHistory();
  const filtered = history.filter(h => h.id !== id);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete history item:', err);
  }
}

export const deleteGameHistoryEntry = deleteGameFromHistory;

export function exportHistoryAsJson(): string {
  const history = getLocalGameHistory();
  const jsonStr = JSON.stringify(history, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mafia_host_history_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  return jsonStr;
}

export function importHistoryFromJson(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(parsed));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function saveActiveRoomLocally(room: RoomState | null): void {
  try {
    if (!room) {
      localStorage.removeItem(ACTIVE_ROOM_KEY);
    } else {
      localStorage.setItem(ACTIVE_ROOM_KEY, JSON.stringify(room));
    }
  } catch {
    // Ignore storage quota
  }
}

export const saveActiveRoomState = saveActiveRoomLocally;

export function getActiveRoomLocally(): RoomState | null {
  try {
    const raw = localStorage.getItem(ACTIVE_ROOM_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const loadActiveRoomState = getActiveRoomLocally;
