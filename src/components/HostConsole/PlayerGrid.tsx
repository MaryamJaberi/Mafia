import React, { useState } from 'react';
import { 
  Skull, Heart, Shield, ShieldAlert, VolumeX, Volume2, 
  Trash2, Edit3, Target, Crown, Eye, EyeOff, MoreVertical, Check
} from 'lucide-react';
import { Player, RoleId, RoomState } from '../../types/mafia';
import { ROLE_DEFINITIONS } from '../../utils/scenarios';
import { Language } from '../../types/mafia';
import { translations } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';

interface PlayerGridProps {
  room: RoomState;
  onKillPlayer: (playerId: string) => void;
  onRevivePlayer: (playerId: string) => void;
  onKickPlayer: (playerId: string) => void;
  onRenamePlayer: (playerId: string, newName: string) => void;
  onChangeRole: (playerId: string, newRole: RoleId) => void;
  onSendToDefense: (playerId: string) => void;
  onAccuseOnBehalf: (accuserId: string, targetId: string) => void;
  language: Language;
}

export const PlayerGrid: React.FC<PlayerGridProps> = ({
  room,
  onKillPlayer,
  onRevivePlayer,
  onKickPlayer,
  onRenamePlayer,
  onChangeRole,
  onSendToDefense,
  onAccuseOnBehalf,
  language
}) => {
  const t = translations[language];
  const [filter, setFilter] = useState<'ALL' | 'ALIVE' | 'DEAD' | 'MAFIA' | 'CITIZEN'>('ALL');
  const [selectedAccuser, setSelectedAccuser] = useState<string | null>(null);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [newNameInput, setNewNameInput] = useState('');

  const filteredPlayers = room.players.filter(p => {
    if (filter === 'ALIVE') return p.isAlive;
    if (filter === 'DEAD') return !p.isAlive;
    const def = ROLE_DEFINITIONS[p.role];
    if (filter === 'MAFIA') return def?.affiliation === 'MAFIA';
    if (filter === 'CITIZEN') return def?.affiliation === 'CITIZEN';
    return true;
  });

  const handleKillToggle = (player: Player) => {
    if (player.isAlive) {
      soundEngine.playGunshot();
      onKillPlayer(player.id);
    } else {
      soundEngine.playGong();
      onRevivePlayer(player.id);
    }
  };

  const handleAccuseClick = (playerId: string) => {
    if (!selectedAccuser) {
      setSelectedAccuser(playerId);
      soundEngine.playTick();
    } else {
      if (selectedAccuser !== playerId) {
        soundEngine.playAccuse();
        onAccuseOnBehalf(selectedAccuser, playerId);
      }
      setSelectedAccuser(null);
    }
  };

  const handleSaveRename = (playerId: string) => {
    if (newNameInput.trim()) {
      onRenamePlayer(playerId, newNameInput.trim());
    }
    setEditingPlayerId(null);
  };

  const aliveCount = room.players.filter(p => p.isAlive).length;
  const deadCount = room.players.length - aliveCount;

  return (
    <div className="space-y-4">
      
      {/* Filter Tabs & Quick Action Help */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f0f12] p-3.5 rounded-2xl border border-white/10 backdrop-blur-sm">
        
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'ALL' ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-extrabold' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            همه ({room.players.length})
          </button>
          
          <button
            onClick={() => setFilter('ALIVE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'ALIVE' ? 'bg-emerald-500 text-black shadow-md font-extrabold' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            زنده ({aliveCount})
          </button>
          
          <button
            onClick={() => setFilter('DEAD')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'DEAD' ? 'bg-rose-950 text-rose-300 border border-rose-500/40 shadow-md font-extrabold' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            حذف‌شده ({deadCount})
          </button>

          <button
            onClick={() => setFilter('MAFIA')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'MAFIA' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            مافیا
          </button>

          <button
            onClick={() => setFilter('CITIZEN')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'CITIZEN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            شهروند
          </button>
        </div>

        {/* Accuse Instruction Banner */}
        {selectedAccuser && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold animate-pulse">
            <Target className="w-4 h-4 text-amber-400" />
            <span>متهم‌کننده انتخاب شد. حالا روی بازیکن هدف کلیک کنید:</span>
            <button
              onClick={() => setSelectedAccuser(null)}
              className="text-[11px] px-2 py-0.5 rounded-lg bg-white/10 text-slate-300 hover:text-white"
            >
              لغو
            </button>
          </div>
        )}

      </div>

      {/* Players Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPlayers.map((player) => {
          const roleDef = ROLE_DEFINITIONS[player.role] || ROLE_DEFINITIONS.CITIZEN_SIMPLE;
          const isSelectedForAccuse = selectedAccuser === player.id;
          const isDead = !player.isAlive;
          const isEditing = editingPlayerId === player.id;

          return (
            <div
              key={player.id}
              className={`relative rounded-3xl p-4.5 transition-all duration-200 border flex flex-col justify-between ${
                isDead
                  ? 'bg-[#09090b] border-white/5 opacity-55'
                  : isSelectedForAccuse
                  ? 'bg-[#18140e] border-amber-500 ring-2 ring-amber-500/50 shadow-xl shadow-amber-500/20'
                  : 'bg-[#0f0f12] border-white/10 hover:border-white/20 shadow-md'
              }`}
            >
              
              {/* Card Header: Avatar, Name, Seat */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className={`text-3xl p-2 rounded-2xl bg-[#0a0a0c] border flex items-center justify-center ${
                        isDead ? 'border-white/5 grayscale' : 'border-white/10'
                      }`}>
                        {player.avatar}
                      </span>
                      {isDead && (
                        <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white p-0.5 rounded-full shadow">
                          <Skull className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={newNameInput}
                            onChange={(e) => setNewNameInput(e.target.value)}
                            className="bg-white/10 text-white text-xs px-2 py-1 rounded-lg border border-amber-500 focus:outline-none w-28"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(player.id)}
                            className="p-1 text-emerald-400 hover:bg-white/10 rounded text-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <h4 className={`font-bold text-sm ${isDead ? 'line-through text-slate-500' : 'text-[#e2e2e7]'}`}>
                            {player.name}
                          </h4>
                          {player.isHost && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                              گرداننده
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>صندلی {player.seatNumber || '—'}</span>
                        <span>•</span>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${player.isConnected ? 'bg-amber-400' : 'bg-slate-600'}`} />
                        <span>{player.isConnected ? 'آنلاین' : 'آفلاین'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Dropdown / Edit */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingPlayerId(player.id);
                        setNewNameInput(player.name);
                      }}
                      className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                      title={t.renamePlayer}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {!player.isHost && (
                      <button
                        onClick={() => onKickPlayer(player.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors"
                        title={t.kickPlayer}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Role Badge with Selector for God */}
                <div className="mt-3">
                  <select
                    value={player.role}
                    onChange={(e) => onChangeRole(player.id, e.target.value as RoleId)}
                    className={`w-full text-xs font-bold rounded-xl px-2.5 py-1.5 border cursor-pointer focus:outline-none transition-colors ${roleDef.teamColor}`}
                  >
                    {Object.keys(ROLE_DEFINITIONS).map(roleKey => (
                      <option key={roleKey} value={roleKey} className="bg-[#0f0f12] text-slate-200 font-medium">
                        {translations[language][`role_${roleKey}`] || roleKey} ({ROLE_DEFINITIONS[roleKey as RoleId]?.affiliation === 'MAFIA' ? 'مافیا' : 'شهروند'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons: Kill/Revive, Defense, Accuse */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-1.5">
                
                {/* Kill / Revive Button */}
                <button
                  onClick={() => handleKillToggle(player)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                    isDead
                      ? 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border-rose-500/40'
                  }`}
                  title={isDead ? t.revivePlayer : t.markDead}
                >
                  {isDead ? <Heart className="w-3.5 h-3.5 text-emerald-400" /> : <Skull className="w-3.5 h-3.5 text-rose-400" />}
                  <span>{isDead ? t.revivePlayer : t.markDead}</span>
                </button>

                {/* Send to Defense */}
                {player.isAlive && (
                  <button
                    onClick={() => {
                      onSendToDefense(player.id);
                      soundEngine.playTick();
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-amber-500/10 text-slate-300 hover:text-amber-400 border border-white/10 text-xs font-bold transition-colors"
                    title={t.sendToDefense}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                )}

                {/* Accuse Action for God */}
                {player.isAlive && (
                  <button
                    onClick={() => handleAccuseClick(player.id)}
                    className={`flex items-center gap-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      isSelectedForAccuse
                        ? 'bg-amber-500 text-black font-extrabold shadow-lg animate-pulse'
                        : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                    }`}
                    title={t.addAccusation}
                  >
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isSelectedForAccuse ? 'انتخاب هدف' : 'اتهام'}</span>
                  </button>
                )}

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
