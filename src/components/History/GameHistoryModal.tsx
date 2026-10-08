import React, { useState, useEffect } from 'react';
import { 
  History, X, Download, Upload, Trash2, 
  Trophy, Calendar, Users, Eye, Sparkles, Play, Edit3, ArrowRight, Shield, Skull
} from 'lucide-react';
import { GameHistoryEntry, Language, Player } from '../../types/mafia';
import { 
  loadGameHistory, deleteGameHistoryEntry, 
  exportHistoryAsJson, importHistoryFromJson 
} from '../../utils/storage';
import { translations, isRtlLanguage } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';
import { ROLE_DEFINITIONS } from '../../utils/scenarios';

interface GameHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReplaySet?: (players: Player[], scenarioId?: string, autoStart?: boolean) => void;
  language: Language;
}

export const GameHistoryModal: React.FC<GameHistoryModalProps> = ({
  isOpen,
  onClose,
  onReplaySet,
  language
}) => {
  if (!isOpen) return null;
  const t = translations[language] || translations.fa;
  const isRtl = isRtlLanguage(language);

  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<GameHistoryEntry | null>(null);

  useEffect(() => {
    const loaded = loadGameHistory();
    setHistory(loaded);
    if (loaded.length > 0 && !selectedEntry) {
      setSelectedEntry(loaded[0]);
    }
  }, [isOpen]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteGameHistoryEntry(id);
    const updated = loadGameHistory();
    setHistory(updated);
    if (selectedEntry?.id === id) {
      setSelectedEntry(updated[0] || null);
    }
  };

  const handleExport = () => {
    exportHistoryAsJson();
    soundEngine.playTick();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importHistoryFromJson(content)) {
        const updated = loadGameHistory();
        setHistory(updated);
        setSelectedEntry(updated[0] || null);
        soundEngine.playGong();
      }
    };
    reader.readAsText(file);
  };

  const handleReplay = (autoStart: boolean) => {
    if (!selectedEntry || !onReplaySet) return;
    soundEngine.playGong();
    const replayPlayers: Player[] = selectedEntry.players.map((p, idx) => ({
      id: p.id || `player_${idx + 1}`,
      name: p.name,
      role: p.role,
      isAlive: p.isAlive ?? true,
      avatar: p.avatar || '👤',
      isConnected: true,
      isReady: true,
      isHost: idx === 0,
      seatNumber: (p as any).seatNumber || idx + 1
    }));
    onReplaySet(replayPlayers, selectedEntry.scenarioName, autoStart);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className={`bg-[#0f0f12] border border-white/10 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh] ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#e2e2e7] text-base sm:text-lg">{t.historyLogs}</h3>
              <p className="text-xs text-slate-400">{t.historyLogsDesc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold transition-colors cursor-pointer"
              title={t.exportJsonTooltip}
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.exportJson}</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.importJson}</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>

            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: List on left, details and replay actions on right */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto">
          
          {/* List of Game Sets */}
          <div className="md:col-span-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400">{t.savedSetsCount ? t.savedSetsCount.replace("{count}", String(history.length)) : `Sets (${history.length}):`}</h4>
            {history.length === 0 ? (
              <div className="p-8 text-center bg-[#0a0a0c] rounded-2xl border border-dashed border-white/10 text-slate-500 text-xs">
                {t.noHistorySets}
              </div>
            ) : (
              history.map(item => {
                const isSelected = selectedEntry?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEntry(item)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10'
                        : 'bg-[#0a0a0c] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-xs text-[#e2e2e7]">
                          {t.winnerLabel} {item.winner === 'MAFIA' ? t.mafiaWinner : item.winner === 'CITIZEN' ? t.citizenWinner : t.unknownWinner}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded cursor-pointer"
                        title={t.deleteSetTooltip}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{item.date}</span>
                      <span>{item.playerCount} {t.playersCountWord} • {item.durationMinutes ? `${item.durationMinutes} ${t.durationMinutesWord}` : t.fullGameDuration}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Details & Replay / Edit Actions */}
          <div className="md:col-span-7 bg-[#0a0a0c] rounded-2xl border border-white/10 p-5 overflow-y-auto flex flex-col justify-between">
            {selectedEntry ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-[#e2e2e7] text-base">{t.roomIdPrefix} {selectedEntry.roomId}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t.scenarioWord} {selectedEntry.scenarioName} • {t.totalAccusationsLabel} {selectedEntry.totalAccusations || selectedEntry.accusations?.length || 0}
                    </p>
                  </div>

                  <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                    selectedEntry.winner === 'MAFIA'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {t.victoryWord} {selectedEntry.winner === 'MAFIA' ? t.mafiaTeamVictory : t.citizenTeamVictory}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-bold text-slate-300">{t.playersRolesSeats ? t.playersRolesSeats.replace("{count}", String(selectedEntry.players.length)) : `Players (${selectedEntry.players.length}):`}</h5>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {selectedEntry.players.map((p, idx) => {
                      const rDef = ROLE_DEFINITIONS[p.role];
                      return (
                        <div key={p.id || idx} className="p-2.5 bg-[#0f0f12] border border-white/5 rounded-xl text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{p.avatar || '👤'}</span>
                            <div>
                              <div className="text-[#e2e2e7] font-semibold">{p.name}</div>
                              <div className="text-[10px] text-slate-500">{t.seatNumberPrefix || "Seat"} {(p as any).seatNumber || idx + 1}</div>
                            </div>
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            rDef?.affiliation === 'MAFIA' ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'
                          }`}>
                            {translations[language][`role_${p.role}`] || p.role}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedEntry.announcements && selectedEntry.announcements.filter(a => a.type === 'DEATH').length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-rose-400 mb-2">{t.deathReportLabel}</h5>
                    <div className="space-y-1 text-xs text-slate-300 bg-[#0f0f12] p-3 rounded-xl border border-white/5 max-h-32 overflow-y-auto">
                      {selectedEntry.announcements.filter(a => a.type === 'DEATH').map((ann, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <Skull className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{ann.content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Replay & Edit Actions Buttons */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.replayThisSetTitle}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleReplay(false)}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold transition-all cursor-pointer"
                      title={t.editInLobbyTooltip}
                    >
                      <Edit3 className="w-4 h-4 text-amber-400" />
                      <span>{t.editInLobbyBtn}</span>
                    </button>

                    <button
                      onClick={() => handleReplay(true)}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                      title={t.startDirectlyTooltip}
                    >
                      <Play className="w-4 h-4" />
                      <span>{t.startDirectlyBtn}</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 py-12">
                {t.selectMatchFromListHint}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
