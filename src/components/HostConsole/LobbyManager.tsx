import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, Copy, Check, Lock, Unlock, Play, Users, 
  Bot, Trash2, Edit3, ShieldAlert, Sparkles, CheckCircle2,
  GripVertical, ArrowRightLeft, Layers, BookOpen, Shuffle,
  Sliders, Bookmark, HelpCircle, Plus, ArrowRight, Save, Crown, Eye
} from 'lucide-react';
import { Player, RoleId, RoomState, Scenario, RoleBundle, DeckRoleItem } from '../../types/mafia';
import { 
  DEFAULT_SCENARIOS, 
  ROLE_DEFINITIONS, 
  ROLE_BUNDLES, 
  loadCustomScenarios, 
  getAllScenarios,
  deleteCustomScenario,
  balanceScenarioRoles
} from '../../utils/scenarios';
import { Language } from '../../types/mafia';
import { translations, isRtlLanguage } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';
const RoleGuideModal = React.lazy(() => import('../common/RoleGuideModal').then(m => ({ default: m.RoleGuideModal })));
const HouseRulesModal = React.lazy(() => import('../common/HouseRulesModal').then(m => ({ default: m.HouseRulesModal })));
const GameProfileModal = React.lazy(() => import('../common/GameProfileModal').then(m => ({ default: m.GameProfileModal })));
const InteractiveMatrixModal = React.lazy(() => import('../common/InteractiveMatrixModal').then(m => ({ default: m.InteractiveMatrixModal })));
const PresetScenariosModal = React.lazy(() => import('./PresetScenariosModal').then(m => ({ default: m.PresetScenariosModal })));
const DeckBuilderModal = React.lazy(() => import('./DeckBuilderModal').then(m => ({ default: m.DeckBuilderModal })));
import { HouseRulesConfig } from '../../data/matrixData';
import { localizeScenario, getLocalizedRoleName } from '../../utils/scenarioLocalization';

interface LobbyManagerProps {
  room: RoomState;
  onUpdateScenario: (scenarioId: string) => void;
  onLockLobby: (locked: boolean) => void;
  onStartGame: () => void;
  onAddTestBots: () => void;
  onKickPlayer: (playerId: string) => void;
  onRenamePlayer: (playerId: string, newName: string) => void;
  onChangeRole: (playerId: string, newRole: RoleId) => void;
  onReorderPlayers?: (reorderedPlayers: Player[]) => void;
  onUpdateHouseRules?: (rules: HouseRulesConfig) => void;
  language: Language;
}

export const LobbyManager: React.FC<LobbyManagerProps> = ({
  room,
  onUpdateScenario,
  onLockLobby,
  onStartGame,
  onAddTestBots,
  onKickPlayer,
  onRenamePlayer,
  onChangeRole,
  onReorderPlayers,
  onUpdateHouseRules,
  language
}) => {
  const t = translations[language];
  const isRtl = isRtlLanguage(language);
  const isEn = language === 'en';
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editNameInput, setEditNameInput] = useState('');
  const [lobbyViewTab, setLobbyViewTab] = useState<'SCENARIOS' | 'MY_SCENARIOS' | 'BUNDLES'>('SCENARIOS');
  const [isRoleGuideOpen, setIsRoleGuideOpen] = useState(false);
  const [isHouseRulesOpen, setIsHouseRulesOpen] = useState(false);
  const [isGameProfileOpen, setIsGameProfileOpen] = useState(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [isPresetScenariosModalOpen, setIsPresetScenariosModalOpen] = useState(false);
  const [isDeckBuilderOpen, setIsDeckBuilderOpen] = useState(false);
  const [editingScenarioForDeck, setEditingScenarioForDeck] = useState<Scenario | null>(null);
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>(() => loadCustomScenarios());

  const [draggedPlayerIndex, setDraggedPlayerIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Reload custom scenarios whenever modal closes or tab changes
  useEffect(() => {
    setCustomScenarios(loadCustomScenarios());
  }, [lobbyViewTab, isPresetScenariosModalOpen, isDeckBuilderOpen]);

  // Join Link URL
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

  const copyJoinLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    soundEngine.playTick();
    setTimeout(() => setCopied(false), 2500);
  };

  // Drag & Drop Handlers for Table Seating Reorder
  const handleDragStart = (index: number) => {
    setDraggedPlayerIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedPlayerIndex === null || draggedPlayerIndex === dropIndex) {
      setDraggedPlayerIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...room.players];
    const [moved] = updated.splice(draggedPlayerIndex, 1);
    updated.splice(dropIndex, 0, moved);

    // Reassign seat numbers according to new table sequence
    const withSeats = updated.map((p, idx) => ({
      ...p,
      seatNumber: idx + 1
    }));

    if (onReorderPlayers) {
      onReorderPlayers(withSeats);
    }
    soundEngine.playTick();
    setDraggedPlayerIndex(null);
    setDragOverIndex(null);
  };

  // Randomize / Shuffle Seats
  const handleShuffleSeats = () => {
    soundEngine.playTick();
    const shuffled = [...room.players].sort(() => Math.random() - 0.5);
    const withSeats = shuffled.map((p, idx) => ({
      ...p,
      seatNumber: idx + 1
    }));
    if (onReorderPlayers) {
      onReorderPlayers(withSeats);
    }
  };

  // Apply Role Bundle to Players in room
  const handleApplyBundle = (bundle: RoleBundle) => {
    soundEngine.playTick();
    const bundleRoles = [...bundle.roles];
    room.players.forEach((p, idx) => {
      if (idx < bundleRoles.length) {
        onChangeRole(p.id, bundleRoles[idx]);
      }
    });
  };

  // Open Deck Builder with a specific Scenario
  const handleOpenDeckWithScenario = (scenario: Scenario) => {
    soundEngine.playTick();
    setEditingScenarioForDeck(scenario);
    setIsDeckBuilderOpen(true);
  };

  // Apply a scenario's roles to active players in room with automatic balancing for odd/dynamic counts
  const handleSelectScenario = (scenario: Scenario) => {
    soundEngine.playGong();
    onUpdateScenario(scenario.id);

    // Distribute roles to players with tournament balancing for exact player count
    const targetCount = room.players.length > 0 ? room.players.length : scenario.roles.length;
    const balancedRoles = balanceScenarioRoles(scenario.roles, targetCount, scenario.id);
    balancedRoles.forEach((roleId, idx) => {
      if (room.players[idx]) {
        onChangeRole(room.players[idx].id, roleId);
      }
    });
  };

  // Confirm modified deck from DeckBuilder
  const handleConfirmDeck = (deck: DeckRoleItem[], scenarioName?: string) => {
    soundEngine.playGong();
    const roleIds = deck.map(item => item.roleId);
    const targetCount = room.players.length > 0 ? room.players.length : roleIds.length;
    const balancedRoles = balanceScenarioRoles(roleIds, targetCount);
    balancedRoles.forEach((roleId, idx) => {
      if (room.players[idx]) {
        onChangeRole(room.players[idx].id, roleId);
      }
    });
    setCustomScenarios(loadCustomScenarios());
  };

  const handleStart = () => {
    soundEngine.playGong();
    onStartGame();
  };

  const handleSaveRename = (playerId: string) => {
    if (editNameInput.trim()) {
      onRenamePlayer(playerId, editNameInput.trim());
      soundEngine.playTick();
    }
    setEditingPlayerId(null);
  };

  const rawCurrentScenario = getAllScenarios().find(s => s.id === room.scenarioId) || DEFAULT_SCENARIOS[0];
  const currentScenario = localizeScenario(rawCurrentScenario, language);
  const minPlayers = currentScenario.recommendedPlayerCount || currentScenario.roles.length || 6;
  const currentCount = room.players.length;
  const isCountValid = currentCount >= minPlayers;
  const canStart = true; // Host can always start; system auto-allocates placeholders for empty seats!

  return (
    <div className="space-y-6 animate-in fade-in duration-200" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* Top Banner: QR Code & Join Credentials & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: QR & Join Token */}
        <div className="bg-[#0f0f12] border border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <QrCode className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-[#e2e2e7] text-base">{t.joinWithQr}</h3>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {isEn ? 'Live Lobby' : 'لابی زنده'}
            </span>
          </div>

          {/* QR Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/5">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="Room Join QR Code" 
                className="w-48 h-48 rounded-xl bg-black p-2 border border-white/10 shadow-2xl" 
              />
            ) : (
              <div className="w-48 h-48 rounded-xl bg-white/5 animate-pulse flex items-center justify-center text-xs text-slate-500">
                {isEn ? 'Loading QR...' : 'در حال بارگذاری QR...'}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-3 text-center">
              {isEn ? 'Players can scan the QR code with their mobile camera or you can copy the link below.' : 'بازیکنان می‌توانند با دوربین گوشی بارکد را اسکن کنند یا لینک زیر را کپی کنید.'}
            </p>
          </div>

          {/* Room ID & Token Copy Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{isEn ? 'Room ID: ' : 'شناسه اتاق: '}<strong className="text-amber-400 font-mono font-black">{room.roomId}</strong></span>
              <span>{isEn ? 'Security Code: ' : 'کد امنیتی: '}<strong className="text-slate-200 font-mono">{room.joinToken}</strong></span>
            </div>

            <button
              id="btn-copy-join-link"
              onClick={copyJoinLink}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10 hover:border-amber-500/40'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isEn ? 'Invite link copied!' : 'لینک دعوت کپی شد!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>{t.copyJoinLink}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 2: Preset Scenarios & Ready-Made Scenario Bank */}
        <div className="lg:col-span-2 bg-[#0f0f12] border border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-xl">
          
          <div className="space-y-4">
            
            {/* Header & Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-[#e2e2e7] text-base">{isEn ? 'Preset Mafia Scenarios' : 'سناریوهای آماده بازی مافیا'}</h3>
                <span className="text-xs text-slate-400">
                  ({isEn ? 'Active: ' : 'سناریوی فعال: '}<strong className="text-amber-400 font-extrabold">{currentScenario.name}</strong>)
                </span>
              </div>

              {/* Action Modals Bar */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Preset Scenarios Bank Full Modal */}
                <button
                  onClick={() => {
                    soundEngine.playTick();
                    setIsPresetScenariosModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Scenario Bank & Creator' : 'بانک سناریوها و ساخت جدید'}</span>
                </button>

                {/* 17-Scenario Matrix */}
                <button
                  onClick={() => {
                    soundEngine.playTick();
                    setIsMatrixModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#171728] hover:bg-[#202038] text-slate-200 border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEn ? '17 Scenarios Matrix' : 'جدول ۱۷ سناریو'}</span>
                </button>

                {/* Role Guide Encyclopedia Trigger */}
                <button
                  onClick={() => setIsRoleGuideOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Encyclopedia' : 'دانشنامه'}</span>
                </button>

                {/* Lobby Lock Toggle */}
                <button
                  id="btn-lock-lobby"
                  onClick={() => onLockLobby(!room.isLobbyLocked)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    room.isLobbyLocked
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {room.isLobbyLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{room.isLobbyLocked ? t.unlockLobby : t.lockLobby}</span>
                </button>
              </div>
            </div>

            {/* View Mode Toggle: Standard Scenarios vs My Saved vs Counterpart Role Bundles */}
            <div className="flex flex-wrap items-center gap-2 p-1 bg-black/40 rounded-xl border border-white/5 text-xs font-bold w-fit">
              <button
                onClick={() => setLobbyViewTab('SCENARIOS')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  lobbyViewTab === 'SCENARIOS'
                    ? 'bg-amber-500 text-black font-extrabold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isEn ? `Official Scenarios (${DEFAULT_SCENARIOS.length})` : `سناریوهای رسمی (${DEFAULT_SCENARIOS.length})`}</span>
              </button>

              <button
                onClick={() => setLobbyViewTab('MY_SCENARIOS')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  lobbyViewTab === 'MY_SCENARIOS'
                    ? 'bg-amber-500 text-black font-extrabold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isEn ? `My Saved (${customScenarios.length})` : `سناریوهای ذخیره‌شده من (${customScenarios.length})`}</span>
              </button>

              <button
                onClick={() => setLobbyViewTab('BUNDLES')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  lobbyViewTab === 'BUNDLES'
                    ? 'bg-amber-500 text-black font-extrabold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>{isEn ? 'Counterpart Role Bundles' : 'دسته‌های نقش‌های متقابل'}</span>
              </button>
            </div>

            {/* Tab 1: Standard Scenarios with Prominent Recommended Player Count & Direct Edit Role button */}
            {lobbyViewTab === 'SCENARIOS' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {DEFAULT_SCENARIOS.map(sc => {
                  const isSelected = room.scenarioId === sc.id;
                  const recommendedCount = sc.recommendedPlayerCount || sc.roles.length;
                  return (
                    <div
                      key={sc.id}
                      className={`p-3.5 rounded-2xl text-right transition-all border flex flex-col justify-between space-y-2.5 ${
                        isSelected
                          ? 'bg-[#181928] border-amber-500 text-white shadow-lg shadow-amber-500/10'
                          : 'bg-[#0a0a0c] border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        {/* Title and Recommended Player Count Badge in front */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-xs sm:text-sm text-slate-200 truncate">{sc.name}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                          </div>

                          {/* Prominent Recommended Player Count Badge */}
                          <div className="shrink-0 flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-black">
                            <Users className="w-3 h-3 text-amber-400" />
                            <span>{recommendedCount} {isEn ? 'players rec.' : 'نفر پیشنهادی'}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {sc.description}
                        </p>
                      </div>

                      {/* Scenario Action Buttons: Apply & Edit Roles */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                        <button
                          onClick={() => handleOpenDeckWithScenario(sc)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-[11px] font-bold border border-white/10 transition-all cursor-pointer"
                          title={isEn ? "Customize roles in editor" : "کم و زیاد کردن نقش‌ها در ویرایشگر"}
                        >
                          <Edit3 className="w-3 h-3 text-amber-400" />
                          <span>{isEn ? 'Edit Roles' : 'ویرایش نقش‌ها'}</span>
                        </button>

                        <button
                          onClick={() => handleSelectScenario(sc)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-black shadow'
                              : 'bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30'
                          }`}
                        >
                          {isSelected ? (isEn ? 'Active on Table' : 'فعال روی میز') : (isEn ? 'Select Scenario' : 'انتخاب سناریو')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Custom Saved Scenarios */}
            {lobbyViewTab === 'MY_SCENARIOS' && (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs text-slate-400">{isEn ? 'Scenarios you customized and saved:' : 'سناریوهایی که خودتان شخصی‌سازی و ذخیره کرده‌اید:'}</span>
                  <button
                    onClick={() => {
                      handleOpenDeckWithScenario({
                        id: `custom_${Date.now()}`,
                        name: isEn ? 'New Custom Scenario' : 'سناریوی جدید شخصی',
                        description: isEn ? 'Design role combination' : 'طراحی ترکیب نقش‌ها',
                        recommendedPlayerCount: 10,
                        roles: ['GODFATHER', 'DOCTOR', 'DETECTIVE', 'SNIPER', 'CITIZEN_SIMPLE'],
                        isCustom: true
                      });
                    }}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isEn ? '+ Create New' : '+ ساخت سناریوی جدید'}</span>
                  </button>
                </div>

                {customScenarios.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-black/30 border border-dashed border-white/10 space-y-2">
                    <Save className="w-8 h-8 text-slate-600 mx-auto" />
                    <div className="text-xs font-bold text-slate-300">{isEn ? 'No custom scenarios saved yet' : 'هنوز سناریوی شخصی ذخیره نکرده‌اید'}</div>
                    <p className="text-[11px] text-slate-500">{isEn ? 'You can edit any scenario and click "Save as New Scenario" to store it.' : 'می‌توانید هر کدام از سناریوها را ادیت کنید و با دکمه «ذخیره به عنوان سناریوی جدید» ذخیره نمایید.'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customScenarios.map(sc => {
                      const isSelected = room.scenarioId === sc.id;
                      const recommendedCount = sc.recommendedPlayerCount || sc.roles.length;
                      return (
                        <div
                          key={sc.id}
                          className={`p-3.5 rounded-2xl text-right transition-all border flex flex-col justify-between space-y-2.5 ${
                            isSelected
                              ? 'bg-[#181928] border-purple-500 text-white shadow-lg shadow-purple-500/10'
                              : 'bg-[#0a0a0c] border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="font-bold text-xs sm:text-sm text-purple-300 truncate">{sc.name}</span>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />}
                              </div>

                              <div className="shrink-0 flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-black">
                                <Users className="w-3 h-3 text-purple-400" />
                                <span>{recommendedCount} {isEn ? 'players rec.' : 'نفر پیشنهادی'}</span>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {sc.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenDeckWithScenario(sc)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-[11px] font-bold border border-white/10 transition-all cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3 text-purple-400" />
                                <span>{isEn ? 'Edit Roles' : 'ویرایش نقش‌ها'}</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(isEn ? 'Are you sure you want to delete this scenario?' : 'آیا از حذف این سناریو اطمینان دارید؟')) {
                                    const updated = deleteCustomScenario(sc.id);
                                    setCustomScenarios(updated);
                                    soundEngine.playTick();
                                  }
                                }}
                                className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all cursor-pointer"
                                title={isEn ? "Delete scenario" : "حذف سناریو"}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => handleSelectScenario(sc)}
                              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-purple-600 text-white shadow'
                                  : 'bg-purple-500/15 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30'
                              }`}
                            >
                              {isSelected ? (isEn ? 'Active on Table' : 'فعال روی میز') : (isEn ? 'Select Scenario' : 'انتخاب سناریو')}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Counterpart Role Bundles */}
            {lobbyViewTab === 'BUNDLES' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {ROLE_BUNDLES.map(bundle => (
                  <div
                    key={bundle.id}
                    className="p-3.5 rounded-2xl bg-[#0a0a0c] border border-white/10 flex flex-col justify-between hover:border-amber-500/40 transition-all space-y-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{bundle.icon}</span>
                          <span className="font-bold text-xs sm:text-sm text-white">{bundle.name}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                          {bundle.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{bundle.description}</p>
                    </div>

                    <button
                      onClick={() => handleApplyBundle(bundle)}
                      className="w-full py-1.5 px-3 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 text-xs font-bold border border-white/10 hover:border-amber-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isEn ? 'Apply Bundle to Players' : 'اعمال این دسته روی بازیکنان'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Start Game Action & Validation Bar */}
          <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs">
              {!isCountValid ? (
                <div className="text-amber-400 flex items-center gap-1.5 font-medium">
                  <ShieldAlert className="w-4 h-4" />
                  <span>
                    {isEn 
                      ? `Player count (${currentCount}) is less than scenario capacity (${minPlayers}); clicking start will fill empty seats with temporary placeholders.` 
                      : `تعداد بازیکنان (${currentCount}) کمتر از ظرفیت سناریو (${minPlayers}) است؛ با کلیک روی شروع، صندلی‌های خالی با پلیس‌هولدر موقت پر می‌شوند.`}
                  </span>
                </div>
              ) : (
                <div className="text-emerald-400 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isEn 
                      ? `Player count (${currentCount}) and scenario are ready to begin competition.` 
                      : `تعداد بازیکنان (${currentCount} نفر) و سناریو برای آغاز رقابت آماده است.`}
                  </span>
                </div>
              )}
            </div>

            <button
              id="btn-start-game-lobby"
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm sm:text-base transition-all shadow-xl bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t.startGame}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Connected Players in Lobby with Drag & Drop Table Seating */}
      <div className="bg-[#0f0f12] border border-white/10 rounded-3xl p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-[#e2e2e7] text-base">{isEn ? `Seating & Players at Table (${room.players.length})` : `چینش و لیست بازیکنان دور میز (${room.players.length})`}</h3>
          </div>
          
          <div className="flex items-center gap-2.5">
            {room.players.length < minPlayers && (
              <button
                id="btn-add-sample-players"
                onClick={onAddTestBots}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 transition-colors cursor-pointer shadow-sm shadow-amber-500/10"
                title={isEn ? "Auto-fill seats with temporary placeholders (assigned to real players when they connect)" : "تکمیل خودکار صندلی‌ها با بازیکنان پلیس‌هولدر موقت (با آنلاین شدن بازیکنان اصلی به آنها اختصاص داده می‌شود)"}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{isEn ? `Auto-Fill (${minPlayers} seats)` : `تکمیل با پلیس‌هولدر موقت (${minPlayers} نفره)`}</span>
              </button>
            )}

            <button
              onClick={handleShuffleSeats}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
              title={isEn ? "Shuffle seat numbers randomly" : "بر زدن و تغییر تصادفی شماره صندلی‌ها"}
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? 'Shuffle Seats' : 'تغییر تصادفی صندلی‌ها'}</span>
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">{isEn ? 'Drag player card to rearrange seating.' : 'برای جابه‌جایی جای افراد دور میز، کارت بازیکن را درگ کنید.'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {room.players.map((player, idx) => {
            const roleDef = ROLE_DEFINITIONS[player.role] || ROLE_DEFINITIONS.CITIZEN_SIMPLE;
            const isEditing = editingPlayerId === player.id;
            const isDragging = draggedPlayerIndex === idx;
            const isDragOver = dragOverIndex === idx;

            return (
              <div 
                key={player.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={() => handleDrop(idx)}
                className={`bg-[#0a0a0c] border rounded-2xl p-4 flex flex-col justify-between transition-all shadow-sm group select-none ${
                  isDragging ? 'opacity-40 border-amber-500 scale-95' :
                  isDragOver ? 'border-amber-400 bg-amber-500/10 scale-105' :
                  'border-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-amber-400">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <span className="text-2xl p-1 rounded-xl bg-white/5 border border-white/5">{player.avatar}</span>
                      <div>
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editNameInput}
                              onChange={(e) => setEditNameInput(e.target.value)}
                              className="bg-white/10 text-white text-base sm:text-xs px-2 py-1 rounded border border-amber-500 focus:outline-none w-28"
                              autoFocus
                            />
                            <button 
                              onClick={() => handleSaveRename(player.id)}
                              className="p-1 text-emerald-400 hover:bg-white/10 rounded text-xs cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-[#e2e2e7]">{player.name}</span>
                            {player.isHost && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                                {isEn ? 'Host' : 'گرداننده'}
                              </span>
                            )}
                          </div>
                        )}
                        <span className="text-[11px] text-slate-400">{isEn ? `Seat #${player.seatNumber || idx + 1}` : `صندلی شماره ${player.seatNumber || idx + 1}`}</span>
                      </div>
                    </div>

                    {/* Rename and Kick Actions */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingPlayerId(player.id);
                          setEditNameInput(player.name);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title={isEn ? "Edit player name" : "ویرایش نام بازیکن"}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      
                      {!player.isHost && (
                        <button
                          onClick={() => onKickPlayer(player.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title={isEn ? "Kick from room" : "اخراج از اتاق"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Role Selection Dropdown */}
                  <div className="mt-3">
                    <label className="block text-[10px] text-slate-400 mb-1">{isEn ? 'Player Role:' : 'نقش بازیکن:'}</label>
                    <select
                      value={player.role}
                      onChange={(e) => onChangeRole(player.id, e.target.value as RoleId)}
                      className={`w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border appearance-none focus:outline-none transition-all cursor-pointer ${
                        roleDef.affiliation === 'MAFIA'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : roleDef.affiliation === 'INDEPENDENT'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {Object.keys(ROLE_DEFINITIONS).map((rId) => {
                        const rDef = ROLE_DEFINITIONS[rId as RoleId];
                        return (
                          <option key={rId} value={rId} className="bg-[#141418] text-white">
                            {rDef.affiliation === 'MAFIA' ? '🔴' : rDef.affiliation === 'INDEPENDENT' ? '🟡' : '🟢'} {rDef.nameKey.replace('role_', '')}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${player.isConnected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    <span>{player.isConnected ? (isEn ? 'Connected' : 'متصل') : (isEn ? 'Offline' : 'آفلاین')}</span>
                  </div>
                  {player.isBot && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                      Bot
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preset Scenarios Full Modal */}
      <PresetScenariosModal
        isOpen={isPresetScenariosModalOpen}
        onClose={() => setIsPresetScenariosModalOpen(false)}
        language={language}
        currentScenarioId={room.scenarioId}
        onSelectScenario={(sc) => handleSelectScenario(sc)}
        onOpenDeckEditorWithScenario={(sc) => handleOpenDeckWithScenario(sc)}
      />

      {/* Deck Builder & Role Customizer Modal */}
      {isDeckBuilderOpen && (
        <DeckBuilderModal
          language={language}
          isOpen={isDeckBuilderOpen}
          onClose={() => setIsDeckBuilderOpen(false)}
          onConfirmDeck={handleConfirmDeck}
          initialDeck={
            editingScenarioForDeck
              ? editingScenarioForDeck.roles.map((r, i) => ({ id: `role_${i}_${r}`, roleId: r }))
              : undefined
          }
          initialScenarioName={editingScenarioForDeck?.name}
        />
      )}

      {/* Other Modals */}
      <RoleGuideModal
        isOpen={isRoleGuideOpen}
        onClose={() => setIsRoleGuideOpen(false)}
        language={language}
      />

      <HouseRulesModal
        isOpen={isHouseRulesOpen}
        onClose={() => setIsHouseRulesOpen(false)}
        room={room}
        onSaveRules={(rules) => {
          if (onUpdateHouseRules) {
            onUpdateHouseRules(rules);
          }
        }}
        language={language}
      />

      {room && (
        <GameProfileModal
          isOpen={isGameProfileOpen}
          onClose={() => setIsGameProfileOpen(false)}
          room={room}
          language={language}
        />
      )}

      <InteractiveMatrixModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
        language={language}
        initialScenarioId={room.scenarioId}
      />

    </div>
  );
};
