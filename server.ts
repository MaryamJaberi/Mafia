import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

type RoleId = string;

interface Player {
  id: string;
  name: string;
  avatar: string;
  role: string;
  isAlive: boolean;
  isConnected: boolean;
  isReady: boolean;
  isHost: boolean;
  isPlaceholder?: boolean;
  isBot?: boolean;
  isMuted?: boolean;
  speechMuted?: boolean;
  fouls?: number;
  hasShield?: boolean;
  roleRevealedAndConfirmed?: boolean;
  joinedAt: number;
  lastActiveAt?: number;
  seatNumber?: number;
  notes?: string;
  inDefense?: boolean;
  votesReceived?: number;
}

interface Accusation {
  id: string;
  accuserId: string;
  targetId: string;
  dayNumber: number;
  phase: string;
  timestamp: number;
  note?: string;
}

interface NightActionRecord {
  id: string;
  dayNumber: number;
  actorId: string;
  actorRole: string;
  actionType: 'KILL' | 'SAVE' | 'INQUIRE' | 'SNIPE' | 'MUTE' | 'HEAL' | 'SHIELD';
  targetId: string;
  result?: string;
  isSuccessful?: boolean;
  timestamp: number;
}

interface VotingRecord {
  id: string;
  dayNumber: number;
  voterId: string;
  targetId: string;
  timestamp: number;
}

interface GameAnnouncement {
  id: string;
  title: string;
  content: string;
  phase: string;
  dayNumber: number;
  timestamp: number;
  isPublic: boolean;
  type: 'INFO' | 'DEATH' | 'WARNING' | 'VICTORY' | 'CHRONICLE';
}

interface RoomState {
  roomId: string;
  scenarioId: string;
  hostToken: string;
  joinToken: string;
  isLobbyLocked: boolean;
  phase: string;
  dayNumber: number;
  timerSeconds: number;
  timerTotal: number;
  isTimerRunning: boolean;
  activeDefensePlayers?: string[];
  currentSpeakerSeat?: number | null;
  currentChallengeSpeakerSeat?: number | null;
  players: Player[];
  accusations: Accusation[];
  nightActions: NightActionRecord[];
  votes: VotingRecord[];
  announcements: GameAnnouncement[];
  winner?: string | null;
  meetingUrl?: string;
  meetingPlatform?: 'google_meet' | 'discord' | 'jitsi' | 'telegram' | 'custom';
  createdAt: number;
  updatedAt: number;
  gameStartedAt?: number;
  gameEndedAt?: number;
}

// In-Memory Room Store
const rooms = new Map<string, RoomState>();
const sseClients = new Map<string, Set<express.Response>>();
const bugReports: any[] = [];

function broadcastRoomUpdate(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  const clients = sseClients.get(roomId);
  if (clients && clients.size > 0) {
    const payload = JSON.stringify(room);
    clients.forEach(res => {
      try {
        res.write(`data: ${payload}\n\n`);
      } catch {
        clients.delete(res);
      }
    });
  }
}

function generateRandomCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Initialize Gemini safely
let genAI: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (e) {
      console.error('Failed to init Gemini SDK:', e);
    }
  }
  return genAI;
}

const SCENARIO_ROLES_MAP: Record<string, string[]> = {
  'classic-9': ['GODFATHER', 'DOCTOR_LECTER', 'MAFIA_SIMPLE', 'DOCTOR', 'DETECTIVE', 'SNIPER', 'ARMORED', 'CITIZEN_SIMPLE', 'CITIZEN_SIMPLE'],
  'classic-10': ['GODFATHER', 'DOCTOR_LECTER', 'MAFIA_SIMPLE', 'DOCTOR', 'DETECTIVE', 'SNIPER', 'ARMORED', 'CITIZEN_SIMPLE', 'CITIZEN_SIMPLE', 'CITIZEN_SIMPLE'],
  'godfather-11': ['GODFATHER', 'SAUL_GOODMAN', 'MATADOR', 'NOSTRADAMUS', 'DOCTOR_WATSON', 'SNIPER', 'CITIZEN_KANE', 'CONSTANTINE', 'CITIZEN_SIMPLE', 'CITIZEN_SIMPLE', 'CITIZEN_SIMPLE'],
  'zodiac-12': ['GODFATHER', 'TERRORIST', 'MATADOR', 'ZODIAC', 'DOCTOR', 'DETECTIVE', 'GUNNER', 'GUARD', 'SCIENTIST', 'CITIZEN_SIMPLE', 'CITIZEN_SIMPLE', 'CITIZEN_SIMPLE'],
  'bazpors-10': ['GODFATHER', 'SHAH_KOSH', 'MAFIA_SIMPLE', 'INQUISITOR', 'DOCTOR', 'DETECTIVE', 'SNIPER', 'MAYOR', 'CITIZEN_SIMPLE', 'CITIZEN_SIMPLE']
};

const MULTI_ALLOWED_ROLES = new Set(['CITIZEN_SIMPLE', 'MAFIA_SIMPLE', 'CUSTOM']);

/**
 * Server-side dynamic role balancer for tournament accuracy.
 * Balances any role deck to the exact player count, ensuring fair ~1/3 mafia ratio
 * and avoiding missing/extra cards or duplicate unique roles for odd counts (e.g. 7, 9, 11).
 */
function serverBalanceRoles(baseRoles: string[], targetCount: number): string[] {
  if (targetCount <= 0) return [];

  const defaultStarter = [
    'GODFATHER', 'DOCTOR_LECTER', 'MAFIA_SIMPLE', 'NATASHA',
    'DOCTOR', 'DETECTIVE', 'SNIPER', 'ARMORED', 'MAYOR',
    'CITIZEN_SIMPLE', 'CITIZEN_SIMPLE', 'CITIZEN_SIMPLE', 'CITIZEN_SIMPLE'
  ];

  const sourceList = (baseRoles && baseRoles.length > 0) ? [...baseRoles] : defaultStarter.slice(0, targetCount);

  // Sanitize duplicate unique roles
  const seenUnique = new Set<string>();
  const isMafia = (r: string) => [
    'GODFATHER', 'MAFIA_SIMPLE', 'DOCTOR_LECTER', 'NATASHA',
    'TERRORIST', 'MATADOR', 'SAUL_GOODMAN', 'SHAH_KOSH', 'POISONER', 'NEGOTIATOR'
  ].includes(r);

  const sanitized = sourceList.map(r => {
    if (!MULTI_ALLOWED_ROLES.has(r)) {
      if (seenUnique.has(r)) {
        return isMafia(r) ? 'MAFIA_SIMPLE' : 'CITIZEN_SIMPLE';
      }
      seenUnique.add(r);
    }
    return r;
  });

  const list = [...sanitized];
  const targetMafia = Math.max(1, Math.floor(targetCount / 3));

  if (list.length > targetCount) {
    while (list.length > targetCount) {
      const currentMafia = list.filter(isMafia).length;
      if (currentMafia > targetMafia) {
        const simpleMafiaIdx = list.lastIndexOf('MAFIA_SIMPLE');
        if (simpleMafiaIdx >= 0) {
          list.splice(simpleMafiaIdx, 1);
          continue;
        }
        const nonGfIdx = list.findIndex(r => isMafia(r) && r !== 'GODFATHER');
        if (nonGfIdx >= 0) {
          list.splice(nonGfIdx, 1);
          continue;
        }
      }
      const simpleCitIdx = list.lastIndexOf('CITIZEN_SIMPLE');
      if (simpleCitIdx >= 0) {
        list.splice(simpleCitIdx, 1);
        continue;
      }
      const secondaryCitIdx = list.findIndex(r => !isMafia(r) && r !== 'DOCTOR' && r !== 'DETECTIVE');
      if (secondaryCitIdx >= 0) {
        list.splice(secondaryCitIdx, 1);
        continue;
      }
      list.pop();
    }
  }

  if (list.length < targetCount) {
    while (list.length < targetCount) {
      const currentMafia = list.filter(isMafia).length;
      if (currentMafia < targetMafia) {
        list.push('MAFIA_SIMPLE');
      } else {
        list.push('CITIZEN_SIMPLE');
      }
    }
  }

  // Final verification: ensure exact mafia ratio
  let finalMafia = list.filter(isMafia).length;
  if (finalMafia > targetMafia) {
    for (let i = list.length - 1; i >= 0 && finalMafia > targetMafia; i--) {
      if (isMafia(list[i]) && list[i] !== 'GODFATHER') {
        list[i] = 'CITIZEN_SIMPLE';
        finalMafia--;
      }
    }
  } else if (finalMafia < targetMafia) {
    for (let i = list.length - 1; i >= 0 && finalMafia < targetMafia; i--) {
      if (list[i] === 'CITIZEN_SIMPLE') {
        list[i] = 'MAFIA_SIMPLE';
        finalMafia++;
      }
    }
  }

  // Ensure 1 Godfather and 1 Doctor
  if (!list.includes('GODFATHER')) {
    const mafiaIdx = list.findIndex(isMafia);
    if (mafiaIdx >= 0) list[mafiaIdx] = 'GODFATHER';
    else list[0] = 'GODFATHER';
  }

  if (targetCount >= 6 && !list.includes('DOCTOR') && !list.includes('DOCTOR_WATSON')) {
    const citIdx = list.findIndex(r => r === 'CITIZEN_SIMPLE');
    if (citIdx >= 0) list[citIdx] = 'DOCTOR';
  }

  return list.slice(0, targetCount);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', activeRooms: rooms.size, timestamp: Date.now() });
  });

  // Ping & Latency Endpoint for Sync & Compensation
  app.get('/api/rooms/:roomId/ping', (req, res) => {
    res.json({
      status: 'ok',
      serverTime: Date.now(),
      roomId: req.params.roomId
    });
  });

  // Create Room
  app.post('/api/rooms', (req, res) => {
    const { scenarioId = 'classic-9', hostName = 'گرداننده' } = req.body;
    let roomId = generateRandomCode();
    while (rooms.has(roomId)) {
      roomId = generateRandomCode();
    }

    const hostToken = `host_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const joinToken = `join_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newRoom: RoomState = {
      roomId,
      scenarioId,
      hostToken,
      joinToken,
      isLobbyLocked: false,
      phase: 'LOBBY',
      dayNumber: 1,
      timerSeconds: 60,
      timerTotal: 60,
      isTimerRunning: false,
      players: [],
      accusations: [],
      nightActions: [],
      votes: [],
      announcements: [
        {
          id: `ann_${Date.now()}`,
          title: 'اتاق بازی ایجاد شد',
          content: `اتاق با شناسه ${roomId} آماده پیوستن بازیکنان است. برای ورود از بارکد QR یا کد اتاق استفاده کنید.`,
          phase: 'LOBBY',
          dayNumber: 1,
          timestamp: Date.now(),
          isPublic: true,
          type: 'INFO'
        }
      ],
      meetingUrl: `https://meet.jit.si/MafiaGod_${roomId}`,
      meetingPlatform: 'jitsi',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    rooms.set(roomId, newRoom);
    res.json({ success: true, room: newRoom });
  });

  // Get Room Details
  app.get('/api/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    const room = rooms.get(roomId.toUpperCase());
    if (!room) {
      return res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'اتاق یافت نشد' });
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    const isHost = token === room.hostToken;
    const playerId = req.query.playerId as string;

    if (isHost || room.phase === 'GAME_OVER') {
      return res.json({ success: true, room });
    }

    // Sanitize for player (hide other players' roles unless host revealed or game ended)
    const sanitizedRoom: RoomState = {
      ...room,
      players: room.players.map(p => {
        if (p.id === playerId) {
          return p; // can see their own role
        }
        return {
          ...p,
          role: 'CITIZEN_SIMPLE' // hide other players' roles from network inspect
        };
      }),
      hostToken: '', // do not leak host token
      nightActions: room.nightActions.filter(na => na.isSuccessful === true) // only sanitized
    };

    res.json({ success: true, room: sanitizedRoom });
  });

  // SSE Stream / Events for Real-Time synchronization
  const handleSSEStream = (req: any, res: any) => {
    const { roomId } = req.params;
    const roomKey = roomId.toUpperCase();
    const room = rooms.get(roomKey);

    if (!room) {
      return res.status(404).send('Room not found');
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    if (!sseClients.has(roomKey)) {
      sseClients.set(roomKey, new Set());
    }
    const clientSet = sseClients.get(roomKey)!;
    clientSet.add(res);

    // Initial push
    res.write(`data: ${JSON.stringify(room)}\n\n`);

    // Keep-alive heartbeat
    const keepAlive = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 20000);

    req.on('close', () => {
      clearInterval(keepAlive);
      clientSet.delete(res);
    });
  };

  app.get('/api/rooms/:roomId/stream', handleSSEStream);
  app.get('/api/rooms/:roomId/events', handleSSEStream);

  // Join Room
  app.post('/api/rooms/:roomId/join', (req, res) => {
    const { roomId } = req.params;
    const roomKey = roomId.toUpperCase();
    const room = rooms.get(roomKey);

    if (!room) {
      return res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'اتاق یافت نشد' });
    }

    if (room.isLobbyLocked) {
      return res.status(403).json({ error: 'LOBBY_LOCKED', message: 'ورود به این اتاق توسط گرداننده قفل شده است.' });
    }

    const { name, avatar = '🕵️‍♂️' } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'INVALID_NAME', message: 'نام بازیکن معتبر نیست.' });
    }

    const sanitizedName = name.trim().slice(0, 30);
    const existingPlayer = room.players.find(p => p.name.toLowerCase() === sanitizedName.toLowerCase());

    if (existingPlayer) {
      // Reconnection of existing player
      existingPlayer.isConnected = true;
      existingPlayer.lastActiveAt = Date.now();
      room.updatedAt = Date.now();
      broadcastRoomUpdate(roomKey);
      return res.json({ success: true, player: existingPlayer, room });
    }

    // Check for an available placeholder/bot to take over
    const placeholder = room.players.find(p => (p.isPlaceholder || p.isBot) && !p.isHost);
    if (placeholder) {
      placeholder.name = sanitizedName;
      placeholder.avatar = avatar;
      placeholder.isConnected = true;
      placeholder.isPlaceholder = false;
      placeholder.isBot = false;
      placeholder.lastActiveAt = Date.now();
      room.updatedAt = Date.now();

      room.announcements.unshift({
        id: `ann_${Date.now()}`,
        title: 'ورود و واگذاری صندلی',
        content: `${sanitizedName} آنلاین شد و صندلی شماره ${placeholder.seatNumber} به ایشان اختصاص یافت.`,
        phase: room.phase,
        dayNumber: room.dayNumber,
        timestamp: Date.now(),
        isPublic: true,
        type: 'INFO'
      });

      broadcastRoomUpdate(roomKey);
      return res.json({ success: true, player: placeholder, room });
    }

    const newPlayer: Player = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: sanitizedName,
      avatar,
      role: 'CITIZEN_SIMPLE',
      isAlive: true,
      isConnected: true,
      isReady: true,
      isHost: false,
      joinedAt: Date.now(),
      lastActiveAt: Date.now(),
      seatNumber: room.players.length + 1
    };

    room.players.push(newPlayer);
    room.updatedAt = Date.now();

    room.announcements.unshift({
      id: `ann_${Date.now()}`,
      title: 'ورود بازیکن جدید',
      content: `${newPlayer.name} به اتاق پیوست.`,
      phase: room.phase,
      dayNumber: room.dayNumber,
      timestamp: Date.now(),
      isPublic: true,
      type: 'INFO'
    });

    broadcastRoomUpdate(roomKey);
    res.json({ success: true, player: newPlayer, room });
  });

  // Add Placeholder / Test Bots Endpoint
  app.post('/api/rooms/:roomId/bots', (req, res) => {
    const { roomId } = req.params;
    const roomKey = roomId.toUpperCase();
    const room = rooms.get(roomKey);

    if (!room) {
      return res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'اتاق یافت نشد' });
    }

    const { count = 10 } = req.body;
    const occupiedSeats = new Set(room.players.map(p => p.seatNumber).filter(Boolean));
    const defaultBotRoles: RoleId[] = [
      'GODFATHER', 'MAFIA_SIMPLE', 'DOCTOR_LECTER',
      'DOCTOR', 'DETECTIVE', 'SNIPER', 'ARMORED',
      'CITIZEN_SIMPLE', 'CITIZEN_SIMPLE', 'CITIZEN_SIMPLE'
    ];
    const botNames = [
      'آرش (پلیس‌هولدر)', 'سارا (پلیس‌هولدر)', 'نیما (پلیس‌هولدر)', 'رویا (پلیس‌هولدر)',
      'کیان (پلیس‌هولدر)', 'مهسا (پلیس‌هولدر)', 'سامان (پلیس‌هولدر)', 'یلدا (پلیس‌هولدر)',
      'فرهاد (پلیس‌هولدر)', 'ترانه (پلیس‌هولدر)'
    ];

    let seat = 1;
    const added: Player[] = [];
    for (let i = 0; i < count; i++) {
      while (occupiedSeats.has(seat)) seat++;
      occupiedSeats.add(seat);

      const botPlayer: Player = {
        id: `bot_${Date.now()}_${seat}_${Math.random().toString(36).substring(2, 6)}`,
        name: botNames[i % botNames.length] || `صندلی ${seat} (پلیس‌هولدر)`,
        avatar: ['🤖', '👤', '🎭', '🦊', '🦉', '🐱'][i % 6],
        role: defaultBotRoles[i % defaultBotRoles.length] || 'CITIZEN_SIMPLE',
        isAlive: true,
        isConnected: true,
        isReady: true,
        isHost: false,
        isPlaceholder: true,
        isBot: true,
        seatNumber: seat,
        joinedAt: Date.now()
      };

      room.players.push(botPlayer);
      added.push(botPlayer);
    }

    room.updatedAt = Date.now();
    broadcastRoomUpdate(roomKey);
    res.json({ success: true, count: added.length, room });
  });

  // Accuse Endpoint (Player or Host)
  app.post('/api/rooms/:roomId/accuse', (req, res) => {
    const { roomId } = req.params;
    const roomKey = roomId.toUpperCase();
    const room = rooms.get(roomKey);

    if (!room) {
      return res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'اتاق یافت نشد' });
    }

    const { accuserId, targetId, note } = req.body;

    const accuser = room.players.find(p => p.id === accuserId);
    const target = room.players.find(p => p.id === targetId);

    if (!accuser || !target) {
      return res.status(400).json({ error: 'INVALID_PLAYERS', message: 'شناسه متهم‌کننده یا هدف نامعتبر است.' });
    }

    if (!accuser.isAlive) {
      return res.status(400).json({ error: 'PLAYER_DEAD', message: 'بازیکن حذف‌شده نمی‌تواند اتهام بزند.' });
    }

    if (!target.isAlive) {
      return res.status(400).json({ error: 'TARGET_DEAD', message: 'نمی‌توان به بازیکن حذف‌شده اتهام زد.' });
    }

    if (accuser.id === target.id) {
      return res.status(400).json({ error: 'SELF_ACCUSATION', message: 'نمی‌توانید به خودتان اتهام بزنید.' });
    }

    const newAccusation: Accusation = {
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      accuserId,
      targetId,
      dayNumber: room.dayNumber,
      phase: room.phase,
      timestamp: Date.now(),
      note: note ? String(note).slice(0, 100) : undefined
    };

    room.accusations.unshift(newAccusation);
    room.updatedAt = Date.now();

    broadcastRoomUpdate(roomKey);
    res.json({ success: true, accusation: newAccusation, total: room.accusations.length });
  });

  // Host Action Endpoint
  app.post('/api/rooms/:roomId/action', (req, res) => {
    const { roomId } = req.params;
    const roomKey = roomId.toUpperCase();
    const room = rooms.get(roomKey);

    if (!room) {
      return res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'اتاق یافت نشد' });
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token !== room.hostToken) {
      return res.status(403).json({ error: 'UNAUTHORIZED_HOST', message: 'فقط گرداننده مجاز به تغییر تنظیمات است.' });
    }

    const { actionType, payload } = req.body;

    switch (actionType) {
      case 'SET_PHASE': {
        room.phase = payload.phase;
        if (payload.dayNumber) room.dayNumber = payload.dayNumber;
        if (payload.phase === 'NIGHT') {
          room.announcements.unshift({
            id: `ann_${Date.now()}`,
            title: `شب ${room.dayNumber} فرا رسید`,
            content: 'شهر به خواب می‌رود. تمامی بازیکنان چشم‌های خود را می‌بندند.',
            phase: 'NIGHT',
            dayNumber: room.dayNumber,
            timestamp: Date.now(),
            isPublic: true,
            type: 'INFO'
          });
        } else if (payload.phase === 'DAY_DISCUSSION' || payload.phase === 'DAY_ACCUSATION') {
          room.announcements.unshift({
            id: `ann_${Date.now()}`,
            title: `صبح روز ${room.dayNumber}`,
            content: 'شهر بیدار می‌شود. فاز بحث و اتهام‌زنی آغاز شد.',
            phase: payload.phase,
            dayNumber: room.dayNumber,
            timestamp: Date.now(),
            isPublic: true,
            type: 'INFO'
          });
        }
        break;
      }

      case 'UPDATE_MEETING_LINK': {
        room.meetingUrl = payload?.meetingUrl || '';
        room.meetingPlatform = payload?.meetingPlatform || 'jitsi';
        room.announcements.unshift({
          id: `ann_${Date.now()}`,
          title: 'اتاق گفتگوی آنلاین به‌روزرسانی شد',
          content: room.meetingUrl ? `لینک تماس صوتی/ویدیویی (${room.meetingPlatform}) ثبت شد. تمام بازیکنان می‌توانند متصل شوند.` : 'لینک تماس صوتی متوقف شد.',
          phase: room.phase as any,
          dayNumber: room.dayNumber,
          timestamp: Date.now(),
          isPublic: true,
          type: 'INFO'
        });
        break;
      }

      case 'START_GAME': {
        // Ensure at least 6 players minimum if empty or insufficient
        const occupiedSeats = new Set(room.players.map(p => p.seatNumber).filter(Boolean));
        const botNames = [
          'آرش (پلیس‌هولدر)', 'سارا (پلیس‌هولدر)', 'نیما (پلیس‌هولدر)', 'رویا (پلیس‌هولدر)',
          'کیان (پلیس‌هولدر)', 'مهسا (پلیس‌هولدر)', 'سامان (پلیس‌هولدر)', 'یلدا (پلیس‌هولدر)',
          'فرهاد (پلیس‌هولدر)', 'ترانه (پلیس‌هولدر)'
        ];

        let seat = 1;
        while (room.players.length < 6) {
          while (occupiedSeats.has(seat)) seat++;
          occupiedSeats.add(seat);

          const idx = room.players.length;
          room.players.push({
            id: `bot_${Date.now()}_${seat}_${Math.random().toString(36).substring(2, 6)}`,
            name: botNames[idx % botNames.length] || `صندلی ${seat} (پلیس‌هولدر)`,
            avatar: ['🤖', '👤', '🎭', '🦊', '🦉', '🐱'][idx % 6],
            role: 'CITIZEN_SIMPLE',
            isAlive: true,
            isConnected: true,
            isReady: true,
            isHost: false,
            isPlaceholder: true,
            isBot: true,
            seatNumber: seat,
            joinedAt: Date.now()
          });
        }

        // Dynamically auto-balance roles to the exact player count (odd or even, e.g. 7, 9, 10, 11, 12)
        const customDeckRoles: string[] = ((room as any).deckRoles || []).map((d: any) => d.roleId);
        const baseDeck = customDeckRoles.length > 0 
          ? customDeckRoles 
          : (SCENARIO_ROLES_MAP[room.scenarioId] || SCENARIO_ROLES_MAP['classic-9']);
        const balancedRoles = serverBalanceRoles(baseDeck, room.players.length);
        const shuffledRoles = [...balancedRoles].sort(() => Math.random() - 0.5);

        room.players.forEach((p, idx) => {
          p.role = shuffledRoles[idx] || p.role || 'CITIZEN_SIMPLE';
          p.isAlive = true;
          p.inDefense = false;
        });

        room.phase = 'DAY_DISCUSSION';
        room.gameStartedAt = Date.now();
        room.announcements.unshift({
          id: `ann_${Date.now()}`,
          title: 'بازی آغاز شد!',
          content: 'نقش‌ها تعیین شد و بازی به طور رسمی آغاز گردید. موفق باشید!',
          phase: 'DAY_DISCUSSION',
          dayNumber: 1,
          timestamp: Date.now(),
          isPublic: true,
          type: 'INFO'
        });
        break;
      }

      case 'END_GAME': {
        room.phase = 'GAME_OVER';
        room.winner = payload.winner || 'CITIZEN';
        room.gameEndedAt = Date.now();
        room.announcements.unshift({
          id: `ann_${Date.now()}`,
          title: 'پایان بازی!',
          content: `بازی با پیروزی ${room.winner === 'CITIZEN' ? 'شهروندان' : room.winner === 'MAFIA' ? 'تیم مافیا' : 'مستقل'} به پایان رسید!`,
          phase: 'GAME_OVER',
          dayNumber: room.dayNumber,
          timestamp: Date.now(),
          isPublic: true,
          type: 'VICTORY'
        });
        break;
      }

      case 'REPLAY_SET': {
        if (Array.isArray(payload.players)) {
          room.players = payload.players.map((p: any, idx: number) => ({
            ...p,
            isAlive: true,
            isConnected: true,
            isReady: true,
            seatNumber: p.seatNumber || idx + 1
          }));
        }
        if (payload.scenarioId) {
          room.scenarioId = payload.scenarioId;
        }
        room.phase = payload.phase || 'LOBBY';
        room.dayNumber = 1;
        room.accusations = [];
        room.nightActions = [];
        room.votes = [];
        room.winner = null;
        room.announcements.unshift({
          id: `ann_${Date.now()}`,
          title: 'بارگذاری ست بازی از سوابق (History Replay)',
          content: 'ترکیب بازیکنان و نقش‌های ست قبلی با موفقیت برای اجرای مجدد بارگذاری شد.',
          phase: room.phase,
          dayNumber: 1,
          timestamp: Date.now(),
          isPublic: true,
          type: 'INFO'
        });
        break;
      }

      case 'UPDATE_PLAYERS': {
        if (Array.isArray(payload.players)) {
          room.players = payload.players;
        }
        break;
      }

      case 'KILL_PLAYER': {
        const player = room.players.find(p => p.id === payload.playerId);
        if (player) {
          player.isAlive = false;
          room.announcements.unshift({
            id: `ann_${Date.now()}`,
            title: 'حذف از بازی',
            content: `${player.name} از بازی خارج شد.`,
            phase: room.phase,
            dayNumber: room.dayNumber,
            timestamp: Date.now(),
            isPublic: true,
            type: 'DEATH'
          });
        }
        break;
      }

      case 'REVIVE_PLAYER': {
        const player = room.players.find(p => p.id === payload.playerId);
        if (player) {
          player.isAlive = true;
        }
        break;
      }

      case 'KICK_PLAYER': {
        room.players = room.players.filter(p => p.id !== payload.playerId);
        break;
      }

      case 'ADD_SINGLE_PLAYER': {
        const playerName = (payload.name && typeof payload.name === 'string' && payload.name.trim().length > 0)
          ? payload.name.trim().slice(0, 30)
          : `بازیکن ${room.players.length + 1}`;
        const targetSeat = typeof payload.seatNumber === 'number' ? payload.seatNumber : (room.players.length + 1);
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

        // If a player exists on this exact seat number, reassign or push
        room.players.push(newP);
        room.announcements.unshift({
          id: `ann_${Date.now()}`,
          title: 'استقرار بازیکن روی صندلی',
          content: `${playerName} روی صندلی شماره ${targetSeat} مستقر شد.`,
          phase: room.phase,
          dayNumber: room.dayNumber,
          timestamp: Date.now(),
          isPublic: true,
          type: 'INFO'
        });
        break;
      }

      case 'LOCK_LOBBY': {
        room.isLobbyLocked = payload.locked ?? true;
        break;
      }

      case 'TIMER_CONTROL': {
        if (payload.seconds !== undefined) room.timerSeconds = payload.seconds;
        if (payload.total !== undefined) room.timerTotal = payload.total;
        if (payload.isRunning !== undefined) room.isTimerRunning = payload.isRunning;
        break;
      }

      case 'RECORD_NIGHT_ACTION': {
        if (payload.action) {
          room.nightActions.push(payload.action);
        }
        break;
      }

      case 'POST_ANNOUNCEMENT': {
        if (payload.announcement) {
          room.announcements.unshift(payload.announcement);
        }
        break;
      }

      case 'EMERGENCY_UNSTICK_RECOVERY': {
        room.isTimerRunning = false;
        room.timerSeconds = 60;
        room.timerTotal = 60;
        room.activeDefensePlayers = [];
        room.currentSpeakerSeat = null;
        room.currentChallengeSpeakerSeat = null;
        room.players.forEach(p => {
          p.inDefense = false;
        });
        room.announcements.unshift({
          id: `ann_recover_${Date.now()}`,
          title: '🛠️ رفع توقف و بازیابی اضطراری وضعیت بازی',
          content: 'سامانه عیب‌یابی خودکار وضعیت اتاق را به حالت پایدار بازگرداند. تایمرها و قفل‌های فاز آزاد شدند.',
          phase: room.phase,
          dayNumber: room.dayNumber,
          timestamp: Date.now(),
          isPublic: true,
          type: 'WARNING'
        });
        break;
      }

      case 'ADD_BOTS': {
        const count = typeof payload.count === 'number' ? Math.max(9, Math.min(21, payload.count)) : 10;
        
        const persianNames = [
          'علی تهرانی', 'سارا رستمی', 'امیرحسین شایسته', 'مریم احمدی', 
          'رضا کریمی', 'نیلوفر فرهمند', 'پویان صادقی', 'مهسا نجفی', 
          'آرش باقری', 'الناز شاکری', 'کسری نوری', 'فرناز بیات', 
          'کیانوش راد', 'شیدا مقدسی', 'بهرام کاظمی', 'سهراب سپهری', 
          'ترانه رهنما', 'شهاب منصوری', 'پیمان سعادت', 'رویا افشار', 'داریوش مهرجو'
        ];
        
        const avatars = [
          '🕵️‍♂️', '🕵️‍♀️', '🎩', '🩺', '🔍', '🔫', '🛡️', '🎭', 
          '💼', '🧠', '🎖️', '🃏', '🎯', '💣', '🤐', '🏛️', 
          '👑', '🕶️', '⚔️', '⚖️', '🎲'
        ];

        // Balanced tournament role generation for 9 to 21
        const mafiaCount = count <= 11 ? 3 : count <= 15 ? 4 : count <= 18 ? 5 : 6;
        const hasIndependent = count >= 14;

        const mafiaRoles: string[] = ['GODFATHER', 'DOCTOR_LECTER'];
        if (mafiaCount >= 3) mafiaRoles.push('MAFIA_SIMPLE');
        if (mafiaCount >= 4) mafiaRoles.push(count >= 12 ? 'NATASHA' : 'TERRORIST');
        if (mafiaCount >= 5) mafiaRoles.push('TERRORIST');
        if (mafiaCount >= 6) mafiaRoles.push('MAFIA_SIMPLE');

        const citizenRoles: string[] = ['DOCTOR', 'DETECTIVE', 'SNIPER', 'ARMORED'];
        if (count >= 10) citizenRoles.push('DIE_HARD');
        if (count >= 11) citizenRoles.push('MAYOR');
        if (count >= 12) citizenRoles.push('PSYCHOLOGIST');

        const assignedCount = mafiaRoles.length + citizenRoles.length + (hasIndependent ? 1 : 0);
        const remainingCitizens = count - assignedCount;
        for (let k = 0; k < remainingCitizens; k++) {
          citizenRoles.push('CITIZEN_SIMPLE');
        }

        const allRoles: string[] = [...mafiaRoles, ...citizenRoles];
        if (hasIndependent) {
          allRoles.push('JOKER');
        }

        // Shuffle roles
        const shuffledRoles = allRoles.sort(() => Math.random() - 0.5);

        const newPlayers: any[] = [];
        for (let i = 0; i < count; i++) {
          newPlayers.push({
            id: `bot_${i + 1}_${Date.now()}`,
            name: persianNames[i % persianNames.length],
            avatar: avatars[i % avatars.length],
            role: (shuffledRoles[i] as any) || 'CITIZEN_SIMPLE',
            isAlive: true,
            isConnected: true,
            isReady: true,
            isHost: false,
            joinedAt: Date.now() + i * 100,
            seatNumber: i + 1,
            fouls: 0,
            speechMuted: false,
            inDefense: false,
            roleRevealedAndConfirmed: true
          });
        }

        room.players = newPlayers;
        room.announcements.unshift({
          id: `ann_bot_${Date.now()}`,
          title: `تزریق شبیه‌ساز ${count} بازیکن به بازی`,
          content: `${count} بازیکن با بالانس نقش‌های استاندارد تورنمنت اضافه شدند.`,
          phase: room.phase,
          dayNumber: room.dayNumber,
          timestamp: Date.now(),
          isPublic: true,
          type: 'INFO'
        });
        break;
      }

      case 'SET_PLAYERS': {
        if (Array.isArray(payload.players)) {
          room.players = payload.players;
        }
        break;
      }

      case 'SIMULATE_DAY_ACCUSATIONS': {
        const alive = room.players.filter(p => p.isAlive);
        if (alive.length >= 2) {
          const simAccCount = Math.min(15, Math.floor(alive.length * 1.3));
          for (let i = 0; i < simAccCount; i++) {
            const accuser = alive[i % alive.length];
            const others = alive.filter(p => p.id !== accuser.id);
            const target = others[Math.floor(Math.random() * others.length)];
            if (target) {
              room.accusations.push({
                id: `acc_sim_${Date.now()}_${i}`,
                accuserId: accuser.id,
                targetId: target.id,
                dayNumber: room.dayNumber || 1,
                phase: 'DAY_ACCUSATION',
                timestamp: Date.now() + i * 10,
                note: `تارگت تحلیلی به صندلی ${target.seatNumber}`
              });
            }
          }
        }
        break;
      }

      case 'SET_DECK': {
        if (Array.isArray(payload.deckRoles)) {
          (room as any).deckRoles = payload.deckRoles;
        }
        break;
      }

      case 'SHUFFLE_TABLE': {
        // Randomize seat numbers for all players in room
        const shuffledPlayers = [...room.players].sort(() => Math.random() - 0.5);
        shuffledPlayers.forEach((p, idx) => {
          p.seatNumber = idx + 1;
        });
        room.players = shuffledPlayers;
        (room as any).tableShuffled = true;
        room.announcements.unshift({
          id: `ann_${Date.now()}`,
          title: 'بر زدن صندلی‌ها (شافل میز)',
          content: 'صندلی‌های دور میز شافل شد. لطفاً بازیکنان به صندلی‌های جدید خود منتقل شوند.',
          phase: room.phase,
          dayNumber: room.dayNumber,
          timestamp: Date.now(),
          isPublic: true,
          type: 'INFO'
        });
        break;
      }

      case 'DISTRIBUTE_ROLES': {
        const deck: any[] = (room as any).deckRoles || [];
        const baseRoleIds = deck.length > 0 ? deck.map(d => d.roleId) : room.players.map(p => p.role);
        const balanced = serverBalanceRoles(baseRoleIds, room.players.length);
        const shuffledDeck = [...balanced].sort(() => Math.random() - 0.5);

        room.players.forEach((player, idx) => {
          player.role = shuffledDeck[idx] || player.role || 'CITIZEN_SIMPLE';
          if (deck[idx]?.customName) {
            (player as any).customRoleName = deck[idx].customName;
          }
          if (deck[idx]?.customAffiliation) {
            (player as any).customRoleAffiliation = deck[idx].customAffiliation;
          }
        });

        (room as any).rolesDistributed = true;
        room.announcements.unshift({
          id: `ann_${Date.now()}`,
          title: 'توزیع کارت‌های نقش',
          content: `کارت‌های نقش به صورت متوازن برای ${room.players.length} بازیکن توزیع شد.`,
          phase: room.phase,
          dayNumber: room.dayNumber,
          timestamp: Date.now(),
          isPublic: true,
          type: 'INFO'
        });
        break;
      }

      case 'RESOLVE_VOTING_TIE': {
        const { resolution, candidateIds = [] } = payload;
        const candidates = room.players.filter(p => candidateIds.includes(p.id));
        const candidateNames = candidates.map(c => c.name).join(' و ');

        if (resolution === 'REVOTE') {
          // Reset votes and place tied candidates back in defense for quick 30s revote
          room.votes = [];
          if ((room as any).votingState) {
            (room as any).votingState.votes = {};
            (room as any).votingState.manualCount = 0;
            (room as any).votingState.defenseCandidates = candidateIds;
            (room as any).votingState.stage = 'EXIT_VOTE';
          }
          room.announcements.unshift({
            id: `ann_tie_revote_${Date.now()}`,
            title: '⚖️ رأی‌گیری مجدد برای شکستن تساوی',
            content: `آرای خروج بین ${candidateNames} مساوی شد. نوبت رأی‌گیری مجدد برگزار می‌گردد.`,
            phase: room.phase,
            dayNumber: room.dayNumber,
            timestamp: Date.now(),
            isPublic: true,
            type: 'WARNING'
          });
        } else if (resolution === 'NO_ELIMINATION') {
          // Tournament rule: a tie in final vote results in no elimination
          room.activeDefensePlayers = [];
          room.players.forEach(p => {
            if (candidateIds.includes(p.id)) p.inDefense = false;
          });
          if ((room as any).votingState) {
            (room as any).votingState.isOpen = false;
            (room as any).votingState.defenseCandidates = [];
          }
          room.announcements.unshift({
            id: `ann_tie_safe_${Date.now()}`,
            title: '🛡️ تساوی آرا و بقای متهمان در شهر',
            content: `بر اساس قانون استاندارد مسابقات، تساوی آرا منجر به عدم خروج شد و متهمان (${candidateNames}) در بازی باقی ماندند.`,
            phase: room.phase,
            dayNumber: room.dayNumber,
            timestamp: Date.now(),
            isPublic: true,
            type: 'INFO'
          });
        } else if (resolution === 'RANDOM_DRAW') {
          // Fate / random draw picks one tied candidate to eliminate
          if (candidates.length > 0) {
            const unlucky = candidates[Math.floor(Math.random() * candidates.length)];
            unlucky.isAlive = false;
            unlucky.inDefense = false;
            room.announcements.unshift({
              id: `ann_tie_draw_${Date.now()}`,
              title: '🎲 قرعه سرنوشت برای رفع تساوی آرا',
              content: `قرعه مرگ بین متهمان مساوی کشیده شد و ${unlucky.name} از بازی خارج گردید.`,
              phase: room.phase,
              dayNumber: room.dayNumber,
              timestamp: Date.now(),
              isPublic: true,
              type: 'DEATH'
            });
          }
        } else if (resolution === 'ELIMINATE_BOTH') {
          candidates.forEach(c => {
            c.isAlive = false;
            c.inDefense = false;
          });
          room.announcements.unshift({
            id: `ann_tie_both_${Date.now()}`,
            title: '💀 خروج همزمان متهمان با تساوی آرا',
            content: `هر دو متهم (${candidateNames}) با حکم شهر و تصمیم گرداننده همزمان از بازی خارج شدند.`,
            phase: room.phase,
            dayNumber: room.dayNumber,
            timestamp: Date.now(),
            isPublic: true,
            type: 'DEATH'
          });
        }
        break;
      }

      case 'START_SPEAKER_TIMER': {
        (room as any).activeSpeakerId = payload.playerId;
        (room as any).activeSpeakerType = payload.speakerType || 'SPEECH';
        (room as any).speakerTimeRemaining = payload.seconds || (room as any).defaultSpeechSeconds || 60;
        (room as any).speakerTimerTotal = (room as any).speakerTimeRemaining;
        (room as any).isSpeakerTimerRunning = true;
        break;
      }

      case 'STOP_SPEAKER_TIMER': {
        (room as any).isSpeakerTimerRunning = false;
        (room as any).activeSpeakerId = null;
        (room as any).activeSpeakerType = null;
        break;
      }

      case 'TICK_SPEAKER_TIMER': {
        if ((room as any).speakerTimeRemaining !== undefined && (room as any).speakerTimeRemaining > 0) {
          (room as any).speakerTimeRemaining -= 1;
        }
        break;
      }

      case 'SET_TIMER_SETTINGS': {
        if (payload.defaultSpeechSeconds !== undefined) {
          (room as any).defaultSpeechSeconds = payload.defaultSpeechSeconds;
        }
        if (payload.defaultChallengeSeconds !== undefined) {
          (room as any).defaultChallengeSeconds = payload.defaultChallengeSeconds;
        }
        break;
      }

      case 'RECORD_FOUL': {
        const player = room.players.find(p => p.id === payload.playerId);
        if (player) {
          (player as any).fouls = Math.min(((player as any).fouls || 0) + 1, 4);
          room.announcements.unshift({
            id: `ann_${Date.now()}`,
            title: 'ثبت خطا (فول)',
            content: `برای ${player.name} خطای شماره ${(player as any).fouls} ثبت شد.`,
            phase: room.phase,
            dayNumber: room.dayNumber,
            timestamp: Date.now(),
            isPublic: true,
            type: 'WARNING'
          });
        }
        break;
      }

      case 'REMOVE_FOUL': {
        const player = room.players.find(p => p.id === payload.playerId);
        if (player && (player as any).fouls > 0) {
          (player as any).fouls -= 1;
        }
        break;
      }

      case 'MUTE_SPEECH': {
        const player = room.players.find(p => p.id === payload.playerId);
        if (player) {
          (player as any).speechMuted = payload.speechMuted ?? !(player as any).speechMuted;
        }
        break;
      }

      case 'START_VOTING': {
        (room as any).votingState = {
          isOpen: true,
          stage: payload.stage || 'DEFENSE_ENTRY',
          targetPlayerId: payload.targetPlayerId || null,
          defenseCandidates: (room as any).votingState?.defenseCandidates || [],
          votes: {},
          manualCount: 0
        };
        break;
      }

      case 'SUBMIT_VOTE_MANUAL': {
        if ((room as any).votingState) {
          (room as any).votingState.manualCount = payload.count;
        }
        break;
      }

      case 'CLOSE_VOTING': {
        if ((room as any).votingState) {
          const vs = (room as any).votingState;
          const target = room.players.find(p => p.id === vs.targetPlayerId);
          const livingCount = room.players.filter(p => p.isAlive).length;
          const threshold = Math.floor((livingCount - 1) / 2);
          
          let totalYes = Object.values(vs.votes || {}).filter(Boolean).length;
          if (vs.manualCount !== undefined && vs.manualCount > 0) {
            totalYes = vs.manualCount;
          }

          if (vs.stage === 'DEFENSE_ENTRY' && target) {
            if (totalYes >= threshold) {
              if (!vs.defenseCandidates.includes(target.id)) {
                vs.defenseCandidates.push(target.id);
              }
              target.inDefense = true;
              room.announcements.unshift({
                id: `ann_${Date.now()}`,
                title: 'ورود به دفاعیه',
                content: `${target.name} با کسب ${totalYes} رأی وارد جایگاه دفاعیه شد (حداقل حد نصاب: ${threshold}).`,
                phase: room.phase,
                dayNumber: room.dayNumber,
                timestamp: Date.now(),
                isPublic: true,
                type: 'INFO'
              });
            }
          }
          vs.isOpen = false;
        }
        break;
      }

      case 'SET_SPEAKING_START_SEAT': {
        (room as any).daySpeakingStartSeat = payload.seatNumber;
        break;
      }

      case 'UPDATE_HOUSE_RULES': {
        if (payload.houseRules) {
          (room as any).houseRules = payload.houseRules;
          room.announcements.unshift({
            id: `ann_hr_${Date.now()}`,
            title: 'ثبت و تصویب توافق‌نامه قوانین میز',
            content: 'قوانین و تقابل‌های اختصاصی بازی توسط گرداننده ثبت و بروزرسانی شد.',
            phase: room.phase,
            dayNumber: room.dayNumber,
            timestamp: Date.now(),
            isPublic: true,
            type: 'INFO'
          });
        }
        break;
      }

      case 'ADD_MANUAL_PLAYER': {
        const targetSeat = payload.seatNumber || (room.players.length + 1);
        const playerName = (payload.name && payload.name.trim()) || `بازیکن ${targetSeat}`;
        const playerAvatar = payload.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(playerName)}`;
        const playerRole = payload.role || 'CITIZEN_SIMPLE';

        const existingAtSeat = room.players.find(p => p.seatNumber === targetSeat);
        if (existingAtSeat) {
          existingAtSeat.name = playerName;
          existingAtSeat.role = playerRole as any;
          existingAtSeat.isAlive = true;
          existingAtSeat.isConnected = true;
        } else {
          const newPlayer: Player = {
            id: `p_manual_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: playerName,
            avatar: playerAvatar,
            role: playerRole as any,
            isAlive: true,
            isConnected: true,
            isReady: true,
            isHost: false,
            joinedAt: Date.now(),
            lastActiveAt: Date.now(),
            seatNumber: targetSeat
          };
          room.players.push(newPlayer);
        }

        room.announcements.unshift({
          id: `ann_add_${Date.now()}`,
          title: 'استقرار بازیکن روی میز',
          content: `${playerName} روی صندلی شماره ${targetSeat} مستقر شد.`,
          phase: room.phase,
          dayNumber: room.dayNumber,
          timestamp: Date.now(),
          isPublic: true,
          type: 'INFO'
        });
        break;
      }

      default:
        break;
    }

    room.updatedAt = Date.now();
    broadcastRoomUpdate(roomKey);
    res.json({ success: true, room });
  });

  // Public Player Action Endpoint (claiming seat, confirming role, challenge, voting)
  app.post('/api/rooms/:roomId/player-action', (req, res) => {
    const { roomId } = req.params;
    const roomKey = roomId.toUpperCase();
    const room = rooms.get(roomKey);

    if (!room) {
      return res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'اتاق یافت نشد' });
    }

    const { playerId, actionType, payload = {} } = req.body;
    const player = room.players.find(p => p.id === playerId);

    if (!player && actionType !== 'CLAIM_SEAT') {
      return res.status(400).json({ error: 'PLAYER_NOT_FOUND', message: 'بازیکن یافت نشد' });
    }

    switch (actionType) {
      case 'CONFIRM_ROLE': {
        if (player) {
          (player as any).roleRevealedAndConfirmed = true;
        }
        break;
      }

      case 'CLAIM_SEAT': {
        const { seatNumber, playerName, avatar } = payload;
        if (player) {
          player.seatNumber = seatNumber;
          if (playerName) player.name = playerName;
          if (avatar) player.avatar = avatar;
        } else {
          // New player seating
          const newP: Player = {
            id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: playerName || `بازیکن صندلی ${seatNumber}`,
            avatar: avatar || '🕵️‍♂️',
            role: 'CITIZEN_SIMPLE',
            isAlive: true,
            isConnected: true,
            isReady: true,
            isHost: false,
            seatNumber,
            joinedAt: Date.now()
          };
          room.players.push(newP);
        }
        break;
      }

      case 'REQUEST_CHALLENGE': {
        if (player) {
          const reqs: any[] = (room as any).challengeRequests || [];
          // Remove previous request if any
          const filtered = reqs.filter(r => r.requesterPlayerId !== player.id);
          filtered.push({
            id: `ch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            requesterPlayerId: player.id,
            targetSpeakerId: payload.targetSpeakerId,
            isPermanentUntilAccepted: payload.isPermanentUntilAccepted ?? false,
            timingPreference: payload.timingPreference || 'ANY',
            status: 'PENDING',
            createdAt: Date.now()
          });
          (room as any).challengeRequests = filtered;
        }
        break;
      }

      case 'WITHDRAW_CHALLENGE': {
        if (player && (room as any).challengeRequests) {
          (room as any).challengeRequests = (room as any).challengeRequests.filter(
            (r: any) => r.requesterPlayerId !== player.id
          );
        }
        break;
      }

      case 'SUBMIT_VOTE': {
        if ((room as any).votingState && (room as any).votingState.isOpen) {
          if (!(room as any).votingState.votes) {
            (room as any).votingState.votes = {};
          }
          (room as any).votingState.votes[player!.id] = payload.voteValue ?? true;
        }
        break;
      }

      default:
        break;
    }

    room.updatedAt = Date.now();
    broadcastRoomUpdate(roomKey);
    res.json({ success: true, room });
  });

  // Morning Chronicle Generator for specific room
  app.post('/api/rooms/:roomId/chronicle', async (req, res) => {
    const { roomId } = req.params;
    const { language = 'fa' } = req.body;
    const room = rooms.get(roomId.toUpperCase());

    const dayNumber = room?.dayNumber || 1;
    const deadPlayers = room?.players.filter(p => !p.isAlive).map(p => p.name) || [];
    const killedPlayerNames: string[] = req.body.killedPlayerNames || deadPlayers;
    const doctorSaved: boolean = req.body.doctorSaved ?? false;
    const detectiveInquiry: boolean = req.body.detectiveInquiry ?? false;

    let generatedStory = '';
    const gemini = getGemini();

    if (gemini) {
      try {
        const langDesc = language === 'en' ? 'English' : language === 'ar' ? 'Arabic' : language === 'tr' ? 'Turkish' : 'Persian';
        const prompt = `You are a dramatic noir narrator and journalist for a Mafia party game.
Write a concise, engaging newspaper report in ${langDesc} for Day ${dayNumber} of the Mafia game (max 3 short paragraphs with an exciting headline).
Last night's events:
- Casualties discovered this morning: ${killedPlayerNames.length > 0 ? killedPlayerNames.join(', ') : 'No deaths recorded (peaceful night)'}
- Doctor protection: ${doctorSaved ? 'Doctor successfully guarded someone' : 'None'}
- Detective investigation: ${detectiveInquiry ? 'Detective discovered crucial leads' : 'Detective conducted secret patrol'}

Tone: Noir, atmospheric, suspenseful, dramatic.`;

        const response = await gemini.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        generatedStory = response.text || '';
      } catch (err) {
        console.error('Gemini chronicle generation error:', err);
      }
    }

    if (!generatedStory) {
      if (language === 'en') {
        generatedStory = killedPlayerNames.length > 0
          ? `📰 Morning Gazette - Day ${dayNumber}\n\nAt 3:00 AM, sudden gunfire pierced the damp night air. As dawn crept over the city, the body of ${killedPlayerNames.join(' and ')} was discovered near the square.\n\nTension is reaching its boiling point among the citizens. Look closely at who speaks and who avoids your gaze!`
          : `📰 Morning Gazette - Day ${dayNumber}\n\nThe city survived a restless night in eerie silence. Thanks to sharp instincts or the doctor's watchful shield, no blood was shed on the cobblestones today.\n\nYet the mafia still walks among us in broad daylight. Stay alert!`;
      } else if (language === 'ar') {
        generatedStory = killedPlayerNames.length > 0
          ? `📰 وقائع الصباح - اليوم ${dayNumber}\n\nفي عتمة الفجر، مزّق صوت الرصاص هدوء أزقة المدينة. ومع بزوغ الصباح، عُثر على جثمان ${killedPlayerNames.join(' و ')}.\n\nالخوف والشكوك يخيمان على الجميع. افتحوا أعينكم ولا تأمنوا لأحد!`
          : `📰 وقائع الصباح - اليوم ${dayNumber}\n\nمرت الليلة الماضية في ترقب هادئ، وبفضل يقظة الحراس وبراعة الطبيب، لم تسجل أي خسائر اليوم.\n\nلكن المؤامرة مستمرة تحت جنح الظلام، فاحذروا الهمسات المريبة!`;
      } else if (language === 'tr') {
        generatedStory = killedPlayerNames.length > 0
          ? `📰 Sabah Gazetesi - Gün ${dayNumber}\n\nGece yarısı şehrin sokaklarında yankılanan bir el silah sesi duyuldu. Şafak sökerken ${killedPlayerNames.join(' ve ')} meydanın yakınında hareketsiz bulundu.\n\nŞehirde şüphe ve gerilim tırmanıyor. Kimseye güvenmeyin!`
          : `📰 Sabah Gazetesi - Gün ${dayNumber}\n\nKaranlık gece fırtınalı geçti ancak şans ve doktorun müdahalesiyle bu sabah hiç can kaybı yaşanmadı.\n\nFakat mafya hala aramızda gizleniyor, gözünüzü dört açın!`;
      } else {
        generatedStory = killedPlayerNames.length > 0
          ? `📰 روزنامه وقایع شهر - روز ${dayNumber}\n\nساعت ۳ بامداد، صدای شلیکی سهمگین سکوت سنگین کوچه‌های مه‌آلود را شکست. با طلوع آفتاب، جسد بی‌جان ${killedPlayerNames.join(' و ')} در حوالی میدان اصلی پیدا شد.\n\nسوءظن و هراس به اوج رسیده و شهروندان خواهان پیدا کردن عاملان این جنایت هستند!`
          : `📰 روزنامه وقایع شهر - روز ${dayNumber}\n\nشب گذشته شهر در مه‌ای غلیظ و پر از اضطراب فرو رفت. شلیک‌ها به خطا رفت یا دستان ماهر پزشک در آخرین لحظات مانع از فاجعه شد! هیچ خونی بر سنگفرش‌های شهر نریخت، اما نگاه‌های مشکوک میان شهروندان عمیق‌تر از همیشه است.`;
      }
    }

    if (room) {
      (room as any).morningChronicle = generatedStory;
      broadcastRoomUpdate(room.roomId);
    }

    res.json({ success: true, chronicle: generatedStory, story: generatedStory });
  });

  // AI Morning Chronicle / Story Generator using Gemini SDK
  app.post('/api/ai/chronicle', async (req, res) => {
    const { roomId, dayNumber, killedPlayerNames, doctorSaved, detectiveInquiry } = req.body;
    
    let generatedStory = '';
    const gemini = getGemini();

    if (gemini) {
      try {
        const prompt = `شما راوی و روزنامه‌نگار مرموز و دراماتیک بازی مافیا هستید.
یک گزارش کوتاه و جذاب روزنامه‌ای به زبان فارسی برای روز ${dayNumber} بازی مافیا بنویسید (حداکثر ۳ پاراگراف کوتاه با تیتر هیجان‌انگیز).
اطلاعات دیشب:
- کشته‌شدگان شب: ${killedPlayerNames && killedPlayerNames.length > 0 ? killedPlayerNames.join('، ') : 'هیچ کشته‌ای نداشتیم (سکوت در شهر)'}
- آیا پزشک کسی را نجات داد: ${doctorSaved ? 'بله، جان فردی را نجات داد' : 'خیر'}
- استعلام کارآگاه انجام شد: ${detectiveInquiry ? 'کارآگاه سرنخ مهمی کشف کرده است' : 'کارآگاه در تاریکی شب گشت‌زنی کرد'}

لحن داستان: نوآر، سینمایی، مهیج و متناسب با فرهنگ بازی مافیای ایران.`;

        const response = await gemini.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
        });

        generatedStory = response.text || '';
      } catch (err) {
        console.error('Gemini error:', err);
      }
    }

    // Fallback if Gemini key is not configured or throws error
    if (!generatedStory) {
      if (killedPlayerNames && killedPlayerNames.length > 0) {
        generatedStory = `📰 روزنامه وقایع شهر - روز ${dayNumber}\n\nساعت ۳ بامداد، صدای شلیکی سهمگین سکوت سنگین کوچه‌های مه‌آلود را شکست. با طلوع آفتاب، جسد بی‌جان ${killedPlayerNames.join(' و ')} در حوالی میدان اصلی پیدا شد. سوءظن و هراس به اوج رسیده و شهروندان خواهان پیدا کردن عاملان این جنایت هستند!`;
      } else {
        generatedStory = `📰 روزنامه وقایع شهر - روز ${dayNumber}\n\nشب گذشته شهر در مه‌ای غلیظ و پر از اضطراب فرو رفت. شلیک‌ها به خطا رفت یا دستان ماهر پزشک در آخرین لحظات مانع از فاجعه شد! هیچ خونی بر سنگفرش‌های شهر نریخت، اما نگاه‌های مشکوک میان شهروندان عمیق‌تر از همیشه است.`;
      }
    }

    res.json({ success: true, story: generatedStory });
  });

  // AI Intelligent Scenario Builder & Role Clash Analyzer Endpoint
  app.post('/api/ai/analyze-scenario', async (req, res) => {
    const { scenarioText, conversationHistory = [], currentDraft } = req.body;

    if (!scenarioText || typeof scenarioText !== 'string') {
      res.status(400).json({ success: false, error: 'توضیحات یا نام سناریو الزامی است.' });
      return;
    }

    const gemini = getGemini();

    if (gemini) {
      try {
        const systemPrompt = `شما یک داور و طراح ارشد و متخصص حرفه‌ای بازی‌های مافیا (Mafia / Werewolf) به زبان فارسی هستید.
وظیفه شما این است که توضیحات، قوانین یا یادداشت‌های کاربر درباره یک سناریوی جدید را به دقت تحلیل کرده و خروجی ساختاریافته و کاملاً منطقی با فرمت JSON تولید کنید.

قواعد مهم تحلیل سناریو:
۱. تمام نقش‌ها (شهروند، مافیا، مستقل) را استخراج یا پیشنهاد دهید.
۲. برای هر نقش، شناسه لاتین یکتا (id)، نام فارسی (name)، ساید (team: 'CITIZEN' | 'MAFIA' | 'INDEPENDENT')، اولویت بیداری در شب (nightPriority: عدد ۱ تا ۲۰، و عدد ۰ برای نقش‌های بدون اکشن شب)، اکشن شب (nightAction)، اکشن روز (dayAction)، توضیحات کامل قابلیت (description)، و مثال اجرایی (examples) بنویسید.
۳. ترتیب دقیق بیداری شبانه (nightSequence) را مشخص کنید.
۴. ماتریس تقابل نقش‌ها (roleClashes) را برای تمام جفت‌نقش‌های حساس و کلیدی به صورت دقیق توضیح دهید (مثلاً تقابل دکتر با شات‌ها، کارآگاه با رئیس، زره‌پوش با شات‌ها، فدایی، ناتاشا، گرگینه، و...).
۵. اگر هرگونه ابهام، تعارض، یا قانون نیازمند توافق (مانند استعلام لیدر، نحوه خروج تساوی، فایربک اسنایپر، شات روی مستقل) وجود دارد، در بخش clarifyingQuestions سوالات مشخص با گزینه‌های پیش‌بینی‌شده برای کاربر قرار دهید.

پاسخ را صرفاً در یک ساختار JSON معتبر بدون تگ‌های اضافی به این شکل بازگردانید:
{
  "scenarioName": "نام سناریو",
  "recommendedPlayers": "مثلاً ۱۰ تا ۱۲ نفر",
  "summary": "خلاصه و کانسپت اصلی سناریو",
  "roles": [
    {
      "id": "slug_id",
      "name": "نام فارسی نقش",
      "team": "CITIZEN" | "MAFIA" | "INDEPENDENT",
      "nightPriority": 1,
      "nightAction": "توضیح اکشن شب",
      "dayAction": "توضیح اکشن روز",
      "description": "توضیح کامل قابلیت",
      "examples": "مثال کاربردی"
    }
  ],
  "nightSequence": [
    { "roleId": "slug_id", "roleName": "نام نقش", "action": "شرح اقدام شبانه" }
  ],
  "roleClashes": [
    {
      "roleA": "slug_id_1",
      "roleB": "slug_id_2",
      "roleAName": "نام نقش اول",
      "roleBName": "نام نقش دوم",
      "interaction": "توضیح کامل و فنی تلاقی دو نقش در بازی"
    }
  ],
  "clarifyingQuestions": [
    {
      "id": "q1",
      "question": "متن سوال از کاربر در صورت وجود ابهام",
      "options": ["گزینه ۱", "گزینه ۲"],
      "recommendedOption": "گزینه پیشنهادی استاندارد",
      "reason": "دلیل اهمیت این سوال"
    }
  ],
  "suggestedHouseRules": {
    "sniperOnLeader": "NO_KILL",
    "armoredShieldVsSniper": "MAFIA_ONLY",
    "doctorSelfSaveLimit": "ONCE",
    "independentInquiryResult": "NEGATIVE",
    "tiedVoteOutcome": "BOTH_STAY",
    "notes": "نکات تکمیلی پیشنهادی"
  }
}`;

        const userPrompt = `لطفاً سناریوی زیر را به صورت فوق‌حرفه‌ای و دقیق تحلیل کنید و خروجی JSON ارائه دهید:
${scenarioText}

${conversationHistory.length > 0 ? `تاریخچه گفتگو و پاسخ‌های کاربر:\n${JSON.stringify(conversationHistory, null, 2)}` : ''}
${currentDraft ? `پیش‌نویس قبلی سناریو:\n${JSON.stringify(currentDraft, null, 2)}` : ''}`;

        const response = await gemini.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: `${systemPrompt}\n\n${userPrompt}`,
          config: {
            responseMimeType: 'application/json',
          }
        });

        const rawText = response.text || '{}';
        let parsed;
        try {
          parsed = JSON.parse(rawText);
        } catch {
          const match = rawText.match(/\{[\s\S]*\}/);
          if (match) {
            parsed = JSON.parse(match[0]);
          }
        }

        if (parsed && parsed.scenarioName && parsed.roles) {
          res.json({ success: true, analysis: parsed });
          return;
        }
      } catch (err) {
        console.error('Error in Gemini scenario analysis:', err);
      }
    }

    // Heuristic Fallback Analysis Engine if AI is unavailable or offline
    const detectedName = scenarioText.split('\n')[0].replace(/[#*:-]/g, '').trim() || 'سناریوی اختصاصی جدید';
    
    // Heuristic roles extraction based on keywords
    const fallbackRoles: any[] = [];
    const keywords = [
      { key: 'پدرخوانده', id: 'godfather', team: 'MAFIA', p: 2, nAction: 'شلیک شب با توافق مافیا', desc: 'رهبر مافیا؛ استعلامش برای کارآگاه منفی است.' },
      { key: 'گرگ', id: 'werewolf', team: 'INDEPENDENT', p: 3, nAction: 'شات شب در میان', desc: 'نقش مستقل؛ هدفش حذف همه شهروندان و مافیاست.' },
      { key: 'مافیا', id: 'mafia_simple', team: 'MAFIA', p: 2, nAction: 'مشارکت در شات', desc: 'یار مافیا؛ در شب هم‌فکری می‌کند.' },
      { key: 'ناتاشا', id: 'natasha', team: 'MAFIA', p: 1, nAction: 'ساکت کردن یک بازیکن', desc: 'بازیکن انتخابی در روز بعد نمی‌تواند صحبت کند.' },
      { key: 'ماتادور', id: 'matador', team: 'MAFIA', p: 1, nAction: 'بلاک کردن ابیلیتی', desc: 'توانایی شب یک بازیکن را بی‌اثر می‌کند.' },
      { key: 'دکتر لکتور', id: 'dr_lector', team: 'MAFIA', p: 5, nAction: 'نجات یار مافیا', desc: 'پزشک تیم مافیا در برابر تیر تکاور.' },
      { key: 'دکتر', id: 'doctor', team: 'CITIZEN', p: 4, nAction: 'نجات جان بازیکن', desc: 'هر شب یک نفر را از مرگ نجات می‌دهد.' },
      { key: 'کارآگاه', id: 'detective', team: 'CITIZEN', p: 6, nAction: 'استعلام هویت شبانه', desc: 'استعلام مافیا مثبت و شهروند/پدرخوانده منفی است.' },
      { key: 'تکاور', id: 'sniper', team: 'CITIZEN', p: 7, nAction: 'شلیک به مافیا', desc: 'شلیک به شهروند موجب خروج خودش می‌شود.' },
      { key: 'تفنگدار', id: 'gunner', team: 'CITIZEN', p: 8, nAction: 'دادن تیر جنگی/مشقی', desc: 'روز بعد بازیکنان می‌توانند شلیک کنند.' },
      { key: 'زره‌پوش', id: 'armored', team: 'CITIZEN', p: 0, nAction: 'بدون اکشن شب', desc: 'یک بار در شب از شات و یک بار در روز از رای‌گیری نجات می‌یابد.' },
      { key: 'فدایی', id: 'fadaee', team: 'CITIZEN', p: 0, nAction: 'بدون اکشن شب', desc: 'در روز می‌تواند یک نفر را همراه خود بیرون ببرد.' },
      { key: 'گورکن', id: 'gravedigger', team: 'CITIZEN', p: 9, nAction: 'استعلام نبش قبر', desc: 'هویت نقش‌های خارج‌شده را فاش می‌کند.' },
      { key: 'شهروند ساده', id: 'citizen_simple', team: 'CITIZEN', p: 0, nAction: 'بدون اکشن شب', desc: 'شهروند وفادار با قدرت رای در فاز روز.' },
    ];

    keywords.forEach(k => {
      if (scenarioText.includes(k.key)) {
        fallbackRoles.push({
          id: k.id,
          name: k.key,
          team: k.team,
          nightPriority: k.p,
          nightAction: k.nAction,
          dayAction: 'مشارکت در فاز روز و رای‌گیری',
          description: k.desc,
          examples: `در این سناریو، ${k.key} نقش کلیدی در تعادل ساید ایفا می‌کند.`
        });
      }
    });

    if (fallbackRoles.length < 4) {
      fallbackRoles.push(
        { id: 'godfather', name: 'پدرخوانده', team: 'MAFIA', nightPriority: 2, nightAction: 'تصمیم‌گیری شات مافیا', dayAction: 'رای‌گیری', description: 'رهبر گروه مافیا؛ استعلام منفی.', examples: 'در شب به اهداف شهروند شلیک می‌کند.' },
        { id: 'doctor', name: 'دکتر شهروند', team: 'CITIZEN', nightPriority: 4, nightAction: 'سیو نجات جان', dayAction: 'رای‌گیری', description: 'نجات جان شهروندان از ترور شب.', examples: 'اگر هدف شات را درست انتخاب کند، صبح هیچ کشته‌ای نخواهیم داشت.' },
        { id: 'detective', name: 'کارآگاه', team: 'CITIZEN', nightPriority: 6, nightAction: 'استعلام استعلام هویت', dayAction: 'رای‌گیری', description: 'کشف هویت مافیا در شب.', examples: 'استعلام مافیای ساده مثبت و پدرخوانده منفی است.' },
        { id: 'citizen_simple', name: 'شهروند ساده', team: 'CITIZEN', nightPriority: 0, nightAction: 'بدون اکشن', dayAction: 'رای‌گیری', description: 'بازیکن شهروندی متکی بر تحلیل روز.', examples: 'در روز با بیان استدلال مافیا را پیدا می‌کند.' }
      );
    }

    const nightSeq = fallbackRoles
      .filter(r => r.nightPriority > 0)
      .sort((a, b) => a.nightPriority - b.nightPriority)
      .map(r => ({ roleId: r.id, roleName: r.name, action: r.nightAction }));

    const clashes: any[] = [];
    for (let i = 0; i < fallbackRoles.length; i++) {
      for (let j = i + 1; j < fallbackRoles.length; j++) {
        const ra = fallbackRoles[i];
        const rb = fallbackRoles[j];
        clashes.push({
          roleA: ra.id,
          roleB: rb.id,
          roleAName: ra.name,
          roleBName: rb.name,
          interaction: `بررسی تعامل میان ${ra.name} (${ra.team}) و ${rb.name} (${rb.team}): در صورت برخورد در فاز شب، اولویت با نقشی است که اولویت بیداری پایین‌تری دارد (${ra.nightPriority < rb.nightPriority ? ra.name : rb.name}).`
        });
      }
    }

    const fallbackAnalysis = {
      scenarioName: detectedName,
      recommendedPlayers: `${fallbackRoles.length + 2} تا ${fallbackRoles.length + 4} نفر`,
      summary: `سناریوی پردازش‌شده شامل ${fallbackRoles.length} نقش فعال با تفکیک ساید شهروند و مافیا.`,
      roles: fallbackRoles,
      nightSequence: nightSeq,
      roleClashes: clashes,
      clarifyingQuestions: [
        {
          id: 'q_inquiry_godfather',
          question: 'در این سناریو، آیا استعلام پدرخوانده توسط کارآگاه منفی (شهروند) است یا مثبت؟',
          options: ['استعلام منفی (قانون استاندارد)', 'استعلام مثبت (قانون کلاسیک صلب)'],
          recommendedOption: 'استعلام منفی (قانون استاندارد)',
          reason: 'تعیین کننده نحوه تعامل کارآگاه و لیدر مافیاست.'
        },
        {
          id: 'q_tied_defense',
          question: 'در صورت تساوی آرا در دفاعیه روز، تصمیم میز چیست؟',
          options: ['هر دو بازیکن در بازی می‌مانند', 'قرعه‌کشی کارت مرگ انجام می‌شود', 'رای‌گیری مجدد در همان روز'],
          recommendedOption: 'هر دو بازیکن در بازی می‌مانند',
          reason: 'جلوگیری از خروج ناعادلانه در وضعیت برابر.'
        }
      ],
      suggestedHouseRules: {
        sniperOnLeader: 'NO_KILL',
        armoredShieldVsSniper: 'MAFIA_ONLY',
        doctorSelfSaveLimit: 'ONCE',
        independentInquiryResult: 'NEGATIVE',
        tiedVoteOutcome: 'BOTH_STAY',
        notes: 'قوانین میز بر اساس تعادل نقش‌های سناریو پیشنهاد گردید.'
      }
    };

    res.json({ success: true, analysis: fallbackAnalysis });
  });

  // Bug report ingestion endpoint
  app.post('/api/report-bug', (req, res) => {
    const report = req.body;
    if (!report || !report.id) {
      return res.status(400).json({ error: 'INVALID_REPORT', message: 'ساختار گزارش معتبر نیست' });
    }

    // Discard benign noise (e.g. WebSocket connection drops when HMR is off, ResizeObserver, fetch aborts)
    const errText = `${report.title || ''} ${report.errorMessage || ''} ${report.errorStack || ''}`.toLowerCase();
    if (
      errText.includes('websocket') ||
      errText.includes('web socket') ||
      errText.includes('resizeobserver') ||
      errText.includes('aborterror')
    ) {
      return res.json({
        success: true,
        ignored: true,
        message: 'گزارش غیربحرانی و وابسته به محیط کلاینت نادیده گرفته شد.',
        reportId: report.id
      });
    }

    const enrichedReport = {
      ...report,
      serverReceivedAt: Date.now(),
      serverIp: req.ip || req.socket?.remoteAddress
    };

    bugReports.unshift(enrichedReport);
    if (bugReports.length > 200) {
      bugReports.pop();
    }

    console.info(`[TELEMETRY] Report registered: ${enrichedReport.id} (${enrichedReport.type}) - ${enrichedReport.title}`);

    res.json({
      success: true,
      message: 'گزارش باگ با موفقیت ثبت شد و در اولویت بررسی و اصلاح قرار گرفت.',
      reportId: enrichedReport.id
    });
  });

  // Bug reports listing endpoint (for debug / developer overview)
  app.get('/api/bug-reports', (req, res) => {
    res.json({
      success: true,
      count: bugReports.length,
      reports: bugReports
    });
  });

  // Emergency unstick endpoint for stuck or frozen rooms
  app.post('/api/rooms/:roomId/emergency-unstick', (req, res) => {
    const { roomId } = req.params;
    const roomKey = roomId.toUpperCase();
    const room = rooms.get(roomKey);
    if (!room) {
      return res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'اتاق یافت نشد' });
    }

    room.isTimerRunning = false;
    room.timerSeconds = 60;
    room.timerTotal = 60;
    room.activeDefensePlayers = [];
    room.currentSpeakerSeat = null;
    room.currentChallengeSpeakerSeat = null;
    room.players.forEach(p => {
      p.inDefense = false;
    });

    room.announcements.unshift({
      id: `ann_recover_${Date.now()}`,
      title: '🛠️ رفع توقف و بازیابی اضطراری وضعیت بازی',
      content: 'سامانه عیب‌یابی خودکار وضعیت اتاق را به حالت پایدار بازگرداند. تایمرها و قفل‌های فاز آزاد شدند.',
      phase: room.phase,
      dayNumber: room.dayNumber,
      timestamp: Date.now(),
      isPublic: true,
      type: 'WARNING'
    });

    room.updatedAt = Date.now();
    broadcastRoomUpdate(roomKey);
    res.json({ success: true, message: 'اتاق با موفقیت بازیابی شد.', room });
  });

  // ==========================================
  // GEMINI AI INTEGRATIONS: Chatbot, Search Grounding & Maps Grounding
  // ==========================================

  // Multi-turn Gemini Chatbot Endpoint
  app.post('/api/ai/chat', async (req, res) => {
    const { messages = [], systemInstruction, taskType = 'general' } = req.body;

    const gemini = getGemini();
    if (!gemini) {
      return res.json({
        success: true,
        reply: 'سرویس هوش مصنوعی آفلاین است یا کلید Gemini در تنظیمات تعیین نشده است. در حالت شبیه‌ساز آفلاین پاسخ داده می‌شود: گرداننده هوشمند پیشنهاد می‌کند به تناقض‌های کلامی بازیکنان در فاز روز و نتایج شات‌های شب دقت کنید.'
      });
    }

    try {
      // Model selection rule:
      // gemini-3.5-flash for general tasks, gemini-3.1-flash-lite for fast tasks, gemini-3.8-flash for default text
      let selectedModel = 'gemini-3.5-flash';
      if (taskType === 'fast') {
        selectedModel = 'gemini-3.1-flash-lite';
      } else if (taskType === 'complex') {
        selectedModel = 'gemini-3.5-flash';
      }

      const defaultInstruction = systemInstruction || 
        'شما دستیار فوق‌هوشمند داوری و مشاوره بازی‌های مافیا (Mafia God & Referee AI) هستید. شما قوانین، تعارض‌های نقش، روانشناسی زبان بدن، تحلیل‌های فاز روز و شب، و سناریوهای کلاسیک و مدرن (شب‌های مافیا، زودیاک، ارتش سری، پدرخوانده و گرگینه) را با دقت و به زبان فارسی تشریح می‌کنید.';

      // Format messages into contents array
      const contents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content || m.text || '' }]
      }));

      const response = await gemini.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction: defaultInstruction,
        }
      });

      res.json({
        success: true,
        reply: response.text || 'پاسخی از مدل دریافت نشد.',
        modelUsed: selectedModel
      });
    } catch (err: any) {
      console.error('Gemini Chat error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'خطا در ارتباط با هوش مصنوعی Gemini',
        fallback: 'گرداننده هوشمند: خطایی موقت رخ داد، اما استراتژی پیشنهادی دقت به اتهام‌های صندلی‌های ابتدایی است.'
      });
    }
  });

  // Google Search Grounding for Live Mafia Tournament & Rule Insights
  app.post('/api/ai/search-grounding', async (req, res) => {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'پرسش معتبر برای جستجو الزامی است.' });
    }

    const gemini = getGemini();
    if (!gemini) {
      return res.json({
        success: true,
        answer: `اطلاعات آرشیوی درباره "${query}": سناریوها و قوانین مافیا در ایران بر اساس تورنمنت‌های فدراسیونی و بازی‌های televised به استعلام‌های صلب، کارت‌های حرکت آخر و سکوت‌های شب استوار است.`,
        sources: []
      });
    }

    try {
      const response = await gemini.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: query,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: 'شما متخصص جستجوی زنده قوانین، تورنمنت‌ها، بازیکنان معروف و اخبار بازی مافیا هستید. پاسخ‌ها را مستند، دقیق و به همراه تحلیل فنی ارائه دهید.'
        }
      });

      // Extract web sources from grounding metadata
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: { title: string; uri: string }[] = [];
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || 'منبع وب',
            uri: chunk.web.uri
          });
        }
      });

      res.json({
        success: true,
        answer: response.text || '',
        sources,
        modelUsed: 'gemini-3.5-flash'
      });
    } catch (err: any) {
      console.error('Search Grounding error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'خطا در اجرای Search Grounding'
      });
    }
  });

  // Google Maps Grounding for Mafia Cafes & Tournament Venues
  app.post('/api/ai/maps-grounding', async (req, res) => {
    const { query, latitude, longitude } = req.body;
    const userQuery = query || 'کافه‌ها و باشگاه‌های بردگیم و مافیا در نزدیکی';

    const gemini = getGemini();
    if (!gemini) {
      return res.json({
        success: true,
        answer: 'مکان‌یاب باشگاه‌های مافیا (حالت آفلاین): کافه‌های بردگیم و ایونت‌های بازی مافیا معمولاً در مراکز فرهنگی، کافه‌کتاب‌ها و سالن‌های تخصصی بازی‌های رومیزی برگزار می‌شوند.',
        places: [
          { title: 'کافه بردگیم و بازی‌های فکری', uri: 'https://maps.google.com' },
          { title: 'باشگاه رسمی تورنمنت مافیا', uri: 'https://maps.google.com' }
        ]
      });
    }

    try {
      const config: any = {
        tools: [{ googleMaps: {} }]
      };

      if (typeof latitude === 'number' && typeof longitude === 'number') {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude,
              longitude
            }
          }
        };
      }

      const response = await gemini.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: userQuery,
        config
      });

      // Extract places and reviews URLs as mandated by Google Maps grounding rules
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const places: { title: string; uri: string }[] = [];

      chunks.forEach((chunk: any) => {
        if (chunk.maps?.uri) {
          places.push({
            title: chunk.maps.title || 'موقعیت نقشه گوگل',
            uri: chunk.maps.uri
          });
        }
      });

      res.json({
        success: true,
        answer: response.text || '',
        places,
        modelUsed: 'gemini-3.5-flash'
      });
    } catch (err: any) {
      console.error('Maps Grounding error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'خطا در ارتباط با Google Maps Grounding'
      });
    }
  });

  // Ensure any unmatched /api route returns JSON 404 instead of falling through to Vite SPA HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'API_ENDPOINT_NOT_FOUND',
      message: `API endpoint ${req.method} ${req.path} not found`
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mafia Host OS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
