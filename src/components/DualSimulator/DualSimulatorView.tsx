import React, { useState } from 'react';
import { 
  Columns, Smartphone, Crown, Users, RefreshCw, 
  ArrowLeftRight, Sparkles, Volume2, Shield 
} from 'lucide-react';
import { GamePhase, Language, RoleId, RoomState, Player } from '../../types/mafia';
import { HouseRulesConfig } from '../../data/matrixData';
import { HostConsoleView } from '../HostConsole/HostConsoleView';
import { PlayerCityScreen } from '../PlayerView/PlayerCityScreen';
import { translations } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';

interface DualSimulatorViewProps {
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
  onAddPlayer?: (name: string, seatNumber?: number, role?: RoleId) => void;
  onHostAction?: (actionType: string, payload?: any) => void;
  onVote?: (targetPlayerId: string, voteValue: boolean) => void;
  onResolveTie?: (resolution: 'REVOTE' | 'NO_ELIMINATION' | 'RANDOM_DRAW' | 'ELIMINATE_BOTH', candidateIds: string[]) => void;
  language: Language;
}

export const DualSimulatorView: React.FC<DualSimulatorViewProps> = (props) => {
  const { room, language, onAddAccusation, onVote } = props;
  const t = translations[language];
  const isEn = language === 'en';

  const livingPlayers = room.players.filter(p => p.isAlive);
  const [selectedSimPlayerId, setSelectedSimPlayerId] = useState<string>(
    livingPlayers[0]?.id || room.players[0]?.id || ''
  );
  const [mobileTab, setMobileTab] = useState<'SPLIT' | 'HOST' | 'PLAYER'>('SPLIT');

  const simulatedPlayer = room.players.find(p => p.id === selectedSimPlayerId) || room.players[0];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Top Banner explaining Dual Simulator */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f0f12] p-4 rounded-3xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Columns className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#e2e2e7] text-base flex items-center gap-2">
              <span>{t.dualSimulator}</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Live Dual Screen
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isEn ? 'Simultaneous preview and testing of Host Console (left) and Player Mobile Screen (right).' : 'مشاهده و تست همزمان کنسول گرداننده (چپ) و صفحه اختصاصی گوشی موبایل بازیکن (راست).'}
            </p>
          </div>
        </div>

        {/* Mobile View Tab Switcher on Smaller Screens */}
        <div className="flex xl:hidden items-center bg-[#0a0a0c] border border-white/10 rounded-2xl p-1 gap-1">
          <button
            onClick={() => setMobileTab('SPLIT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mobileTab === 'SPLIT' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isEn ? 'Both' : 'هر دو'}
          </button>
          <button
            onClick={() => setMobileTab('HOST')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mobileTab === 'HOST' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isEn ? 'Host Console' : 'کنسول گرداننده'}
          </button>
          <button
            onClick={() => setMobileTab('PLAYER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mobileTab === 'PLAYER' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isEn ? 'Player Phone' : 'گوشی بازیکن'}
          </button>
        </div>

        {/* Simulated Player Switcher */}
        {room.players.length > 0 && (
          <div className="flex items-center gap-2 bg-[#0a0a0c] p-1.5 px-3 rounded-2xl border border-white/10">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400 font-bold">{isEn ? 'Simulate Player Phone:' : 'شبیه‌سازی گوشی بازیکن:'}</span>
            <select
              value={selectedSimPlayerId}
              onChange={(e) => setSelectedSimPlayerId(e.target.value)}
              className="bg-[#0f0f12] border border-white/10 text-slate-200 text-xs font-bold rounded-xl px-2.5 py-1 focus:outline-none"
            >
              {room.players.map(p => (
                <option key={p.id} value={p.id} className="bg-[#0f0f12] text-slate-200">
                  {p.avatar} {p.name} ({p.role}) {p.isAlive ? (isEn ? '• Alive' : '• زنده') : (isEn ? '• Out' : '• حذف')}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Two Columns Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Host Console OS */}
        {(mobileTab === 'SPLIT' || mobileTab === 'HOST') && (
          <div className={`${mobileTab === 'HOST' ? 'xl:col-span-12' : 'xl:col-span-7'} space-y-4`}>
            <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-400">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Crown className="w-4 h-4" />
                <span>{isEn ? 'Host / Narrator Console (God Console)' : 'کنسول گرداننده مسابقه (God Console)'}</span>
              </div>
              <span className="font-mono text-slate-500">{isEn ? 'Room: ' : 'اتاق: '}{room.roomId}</span>
            </div>

            <div className="bg-[#0a0a0c] p-3 sm:p-4 rounded-3xl border border-white/10 shadow-2xl">
              <HostConsoleView {...props} />
            </div>
          </div>
        )}

        {/* Right Column: Player Mobile Screen Mockup */}
        {(mobileTab === 'SPLIT' || mobileTab === 'PLAYER') && (
          <div className={`${mobileTab === 'PLAYER' ? 'xl:col-span-12' : 'xl:col-span-5'} space-y-4`}>
            <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-400">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Smartphone className="w-4 h-4" />
                <span>{isEn ? `Player Mobile Screen: ${simulatedPlayer?.name || ''}` : `نمای گوشی موبایل بازیکن: ${simulatedPlayer?.name || ''}`}</span>
              </div>
              <span className="text-[11px] text-slate-500">Live SSE Sync</span>
            </div>

            <div className="bg-[#0a0a0c] p-4 sm:p-5 rounded-3xl border border-white/10 shadow-2xl relative min-h-[600px] overflow-hidden">
              {simulatedPlayer ? (
                <PlayerCityScreen
                  room={room}
                  currentPlayer={simulatedPlayer}
                  onSendAccusation={(targetId) => {
                    soundEngine.playAccuse();
                    onAddAccusation(simulatedPlayer.id, targetId);
                  }}
                  onVote={onVote}
                  language={language}
                />
              ) : (
                <div className="text-center py-20 text-slate-500 text-xs">
                  {isEn ? 'Add players to the lobby first to simulate their mobile screen.' : 'ابتدا بازیکنان را به لابی اضافه کنید تا صفحه موبایل آنان شبیه‌سازی شود.'}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
