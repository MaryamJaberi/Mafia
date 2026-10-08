// Bug Report, Error Logging, and Freeze Recovery Telemetry for Mafia Host OS

export interface BugReportPayload {
  id: string;
  timestamp: number;
  type: 'CRASH' | 'FREEZE' | 'STUCK_GAME' | 'USER_FEEDBACK' | 'UNHANDLED_ERROR' | 'NETWORK_ERROR' | 'ROLE_INTERACTION_ERROR';
  title: string;
  description?: string;
  errorMessage?: string;
  errorStack?: string;
  roomStateSnapshot?: {
    roomId?: string;
    scenarioId?: string;
    phase?: string;
    dayNumber?: number;
    playersCount?: number;
    aliveCount?: number;
    currentSpeakerSeat?: number | null;
    isTimerRunning?: boolean;
    timerSeconds?: number;
    activeDefensePlayers?: number[];
    recentAnnouncements?: string[];
  };
  deviceInfo: {
    userAgent: string;
    language: string;
    platform: string;
    screen: string;
    url: string;
    isOnline: boolean;
    timestampIso: string;
  };
  recentLogs: Array<{ time: string; level: string; message: string }>;
}

const STORAGE_KEY_PENDING = 'mafia_pending_bug_reports';
const STORAGE_KEY_LOGS = 'mafia_client_diagnostic_logs';
const MAX_LOGS = 50;

class BugTracker {
  private logs: Array<{ time: string; level: string; message: string }> = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private isBenignError(message?: string, stack?: string, filename?: string): boolean {
    const text = `${message || ''} ${stack || ''} ${filename || ''}`.toLowerCase();
    if (!text.trim()) return true;
    
    // Ignore WebSocket transport closures (Vite HMR disabled, proxy drops, WebChannel transitions)
    if (text.includes('websocket') || text.includes('web socket') || text.includes('socket closed')) {
      return true;
    }
    // Ignore benign browser layout notifications
    if (text.includes('resizeobserver') || text.includes('undelivered notifications')) {
      return true;
    }
    // Ignore intentional fetch aborts / tab navigation
    if (text.includes('aborterror') || text.includes('the user aborted a request') || text.includes('operation was aborted')) {
      return true;
    }
    // Ignore browser extension script errors
    if (
      text.includes('chrome-extension://') || 
      text.includes('moz-extension://') || 
      text.includes('safari-extension://') ||
      text.includes('script error')
    ) {
      return true;
    }
    return false;
  }

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Load persisted diagnostic logs
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LOGS);
      if (stored) {
        this.logs = JSON.parse(stored).slice(-MAX_LOGS);
      }
    } catch {
      this.logs = [];
    }

    // Global Unhandled Exception Catcher
    window.addEventListener('error', (event) => {
      if (this.isBenignError(event.message, event.error?.stack, event.filename)) {
        this.log('debug', `Benign error ignored: ${event.message}`);
        return;
      }
      this.log('error', `Global Error: ${event.message} at ${event.filename}:${event.lineno}`);
      // Auto-dispatch crash report
      this.captureAutoReport({
        type: 'UNHANDLED_ERROR',
        title: `خطای زمان اجرا: ${event.message || 'خطای ناشناخته'}`,
        errorMessage: event.message,
        errorStack: event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`,
      });
    });

    // Global Unhandled Promise Rejection Catcher
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      const msg = reason?.message || String(reason) || 'Unhandled Promise Rejection';
      const stack = reason?.stack || '';
      if (this.isBenignError(msg, stack)) {
        this.log('debug', `Benign unhandled rejection ignored: ${msg}`);
        return;
      }
      this.log('error', `Unhandled Rejection: ${msg}`);
      this.captureAutoReport({
        type: 'UNHANDLED_ERROR',
        title: `رد پرامیس بی‌پاسخ: ${msg}`,
        errorMessage: msg,
        errorStack: stack,
      });
    });

    // Attempt to flush pending reports if online
    window.addEventListener('online', () => {
      this.flushPendingReports();
    });

    this.log('info', 'BugTracker Telemetry Subsystem initialized');
  }

  public log(level: 'info' | 'warn' | 'error' | 'debug', message: string) {
    const entry = {
      time: new Date().toLocaleTimeString('fa-IR'),
      level,
      message
    };
    this.logs.push(entry);
    if (this.logs.length > MAX_LOGS) {
      this.logs.shift();
    }
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(this.logs));
    } catch {
      // Ignore quota errors
    }
  }

  public getRecentLogs() {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem(STORAGE_KEY_LOGS);
    } catch {}
  }

  public getDeviceInfo() {
    if (typeof window === 'undefined') {
      return {
        userAgent: 'server',
        language: 'fa',
        platform: 'node',
        screen: '0x0',
        url: '',
        isOnline: true,
        timestampIso: new Date().toISOString()
      };
    }
    return {
      userAgent: navigator.userAgent || 'unknown',
      language: navigator.language || 'fa',
      platform: navigator.platform || 'unknown',
      screen: `${window.innerWidth}x${window.innerHeight} (pixelRatio: ${window.devicePixelRatio || 1})`,
      url: window.location.href,
      isOnline: navigator.onLine,
      timestampIso: new Date().toISOString()
    };
  }

  public async captureAutoReport(params: {
    type: BugReportPayload['type'];
    title: string;
    description?: string;
    errorMessage?: string;
    errorStack?: string;
    roomState?: any;
  }): Promise<string> {
    if (this.isBenignError(params.title, params.errorStack, params.errorMessage)) {
      return '';
    }

    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    let roomSnapshot;
    if (params.roomState) {
      roomSnapshot = {
        roomId: params.roomState.roomId,
        scenarioId: params.roomState.scenarioId,
        phase: params.roomState.phase,
        dayNumber: params.roomState.dayNumber,
        playersCount: params.roomState.players?.length,
        aliveCount: params.roomState.players?.filter((p: any) => p.isAlive)?.length,
        currentSpeakerSeat: params.roomState.currentSpeakerSeat,
        isTimerRunning: params.roomState.isTimerRunning,
        timerSeconds: params.roomState.timerSeconds,
        activeDefensePlayers: params.roomState.activeDefensePlayers,
        recentAnnouncements: params.roomState.announcements?.slice(0, 5).map((a: any) => `${a.title}: ${a.content}`)
      };
    }

    const payload: BugReportPayload = {
      id: reportId,
      timestamp: Date.now(),
      type: params.type,
      title: params.title,
      description: params.description,
      errorMessage: params.errorMessage,
      errorStack: params.errorStack,
      roomStateSnapshot: roomSnapshot,
      deviceInfo: this.getDeviceInfo(),
      recentLogs: this.getRecentLogs()
    };

    // Try sending immediately
    try {
      const response = await fetch('/api/report-bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        this.log('info', `Bug report ${reportId} dispatched successfully to server`);
        return reportId;
      }
    } catch {
      // Server unreachable, cache locally
    }

    this.savePendingReport(payload);
    return reportId;
  }

  private savePendingReport(report: BugReportPayload) {
    try {
      const pending: BugReportPayload[] = JSON.parse(localStorage.getItem(STORAGE_KEY_PENDING) || '[]');
      pending.unshift(report);
      // Keep max 20 pending
      localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(pending.slice(0, 20)));
      this.log('warn', `Bug report ${report.id} cached locally for retry`);
    } catch {
      // Ignore
    }
  }

  public async flushPendingReports() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PENDING);
      if (!raw) return;
      const pending: BugReportPayload[] = JSON.parse(raw);
      if (pending.length === 0) return;

      const remaining: BugReportPayload[] = [];
      for (const rep of pending) {
        try {
          const res = await fetch('/api/report-bug', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rep)
          });
          if (!res.ok) {
            remaining.push(rep);
          }
        } catch {
          remaining.push(rep);
        }
      }
      localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(remaining));
      if (remaining.length < pending.length) {
        this.log('info', `Flushed ${pending.length - remaining.length} pending bug reports to server`);
      }
    } catch {
      // Ignore
    }
  }

  public getPendingReports(): BugReportPayload[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_PENDING) || '[]');
    } catch {
      return [];
    }
  }

  public async triggerEmergencyUnstick(roomId?: string, localDispatch?: (action: string, data?: any) => void): Promise<boolean> {
    this.log('warn', `Emergency unstick triggered for room ${roomId || 'local'}`);
    
    // 1. If online and has roomId, call server unstick endpoint
    if (roomId) {
      try {
        const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/emergency-unstick`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          this.log('info', 'Server acknowledged emergency room recovery');
          return true;
        }
      } catch (e) {
        this.log('error', `Server unstick failed: ${e}`);
      }
    }

    // 2. Local fallback dispatch
    if (localDispatch) {
      localDispatch('EMERGENCY_UNSTICK_RECOVERY');
      return true;
    }

    return false;
  }
}

export const bugTracker = new BugTracker();
