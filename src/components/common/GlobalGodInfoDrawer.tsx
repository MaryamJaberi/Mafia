import React, { useState, useEffect } from 'react';
import { 
  Table, Users, BookOpen, Music, Shield, Sparkles, X, 
  Search, Eye, Volume2, VolumeX, Moon, Sun, Layers, 
  ChevronRight, ChevronLeft, Zap, Info, Skull, Crown,
  Sliders, Play, Square, Filter
} from 'lucide-react';
import { RoomState, Language, RoleId, Player } from '../../types/mafia';
import { ROLE_DEFINITIONS, DEFAULT_SCENARIOS } from '../../utils/scenarios';
import { translations } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';
import { getRoleIcon } from '../HostConsole/GodTableView';
import { localizeScenario, getLocalizedRoleName, getLocalizedAffiliation } from '../../utils/scenarioLocalization';

interface GlobalGodInfoDrawerProps {
  room: RoomState | null;
  language: Language;
  onOpenMatrixModal?: () => void;
  onOpenRoleGuide?: (roleId?: RoleId) => void;
}

export const GlobalGodInfoDrawer: React.FC<GlobalGodInfoDrawerProps> = ({
  room,
  language,
  onOpenMatrixModal,
  onOpenRoleGuide
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'PLAYERS' | 'MATRIX' | 'ROLES' | 'MUSIC'>('PLAYERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(room?.scenarioId || 'classic-10');
  const [currentMusicTrack, setCurrentMusicTrack] = useState<'NOIR_MYSTERY' | 'NIGHT_SUSPENSE' | 'COURT_DRAMA' | 'VICTORY_ANTHEM' | null>(null);
  const [musicVolume, setMusicVolume] = useState<number>(0.25);
  const [isNightAmbianceOn, setIsNightAmbianceOn] = useState<boolean>(false);

  const t = translations[language];

  // Sync music states
  useEffect(() => {
    setCurrentMusicTrack(soundEngine.getActiveTrack());
    setIsNightAmbianceOn(soundEngine.getIsNightPlaying());
  }, [isOpen]);

  const handlePlayMusicTrack = (trackId: 'NOIR_MYSTERY' | 'NIGHT_SUSPENSE' | 'COURT_DRAMA' | 'VICTORY_ANTHEM') => {
    if (currentMusicTrack === trackId) {
      soundEngine.stopBackgroundTrack();
      setCurrentMusicTrack(null);
    } else {
      soundEngine.playBackgroundTrack(trackId, musicVolume);
      setCurrentMusicTrack(trackId);
    }
  };

  const handleToggleNightAmbiance = () => {
    if (isNightAmbianceOn) {
      soundEngine.stopNightAmbiance();
      setIsNightAmbianceOn(false);
    } else {
      soundEngine.startNightAmbiance(musicVolume);
      setIsNightAmbianceOn(true);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setMusicVolume(vol);
    soundEngine.setNightVolume(vol);
    if (currentMusicTrack) {
      soundEngine.playBackgroundTrack(currentMusicTrack, vol);
    }
  };

  const allRoles = Object.values(ROLE_DEFINITIONS);
  const filteredRoles = allRoles.filter(role => {
    const name = t[`role_${role.id}`] || role.id;
    const desc = role.descriptionKey || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || desc.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const rawScenario = DEFAULT_SCENARIOS.find(s => s.id === selectedScenarioId) || DEFAULT_SCENARIOS[0];
  const selectedScenario = localizeScenario(rawScenario, language);

  const tracksInfo: Record<string, Record<Language, { title: string; desc: string }>> = {
    NOIR_MYSTERY: {
      fa: { title: 'پدرخوانده و نوآر رازآلود', desc: 'تم جز و پیانو ملانکولیک' },
      en: { title: 'Godfather Noir Mystery', desc: 'Melancholic jazz piano and subtle bass' },
      ar: { title: 'غموض العراب ونوار السري', desc: 'موسيقى الجاز والبيانو الدرامي' },
      tr: { title: 'Godfather Kara Film Gizemi', desc: 'Melankolik caz piyanosu ve gerilim' }
    },
    NIGHT_SUSPENSE: {
      fa: { title: 'تیک‌تاک و اضطراب شب', desc: 'ساعت‌کوکی و صدای زیر زمزمه' },
      en: { title: 'Night Suspense & Clockwork', desc: 'Ticking heartbeat and ambient whispers' },
      ar: { title: 'دقات الساعة وتشويق الليل', desc: 'نبضات متسارعة وأجواء ليلية غامضة' },
      tr: { title: 'Gece Gerilimi ve Saat Tik-Takı', desc: 'Zaman sayacı ve karanlık fısıltılar' }
    },
    COURT_DRAMA: {
      fa: { title: 'دادگاه و تلاطم روز', desc: 'ضرباهنگ استاکاتو ویولنسل' },
      en: { title: 'City Court & Heated Trial', desc: 'Staccato strings and accusation pulse' },
      ar: { title: 'دراما المحكمة والنقاش الساخن', desc: 'وتريات تصاعدية ونقاش حاد' },
      tr: { title: 'Şehir Mahkemesi ve Hararetli Duruşma', desc: 'Staccato yaylılar ve suçlama ritmi' }
    },
    VICTORY_ANTHEM: {
      fa: { title: 'مارش پیروزی و افتخار', desc: 'هارمونی حماسی فرجام بازی' },
      en: { title: 'Triumphant Victory March', desc: 'Epic orchestral resolution and brass' },
      ar: { title: 'نشيد النصر والمجد الأخير', desc: 'أوركسترا ملحمية بنهاية اللعبة' },
      tr: { title: 'Büyük Zafer ve Zafer Marşı', desc: 'Epik orkestral zafer teması' }
    }
  };

  const alivePlayers = room?.players.filter(p => p.isAlive) || [];
  const deadPlayers = room?.players.filter(p => !p.isAlive) || [];

  return (
    <>
      {/* Omnipresent Floating Access Button (Sticky at Bottom-Right or Bottom-Left) */}
      <div 
        className={`fixed bottom-5 z-40 flex items-center gap-2 ${
          language === 'en' ? 'right-5' : 'left-5'
        }`}
      >
        <button
          id="btn-global-god-drawer"
          onClick={() => {
            setIsOpen(!isOpen);
            soundEngine.playTick();
          }}
          className={`px-4 py-3 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer border ${
            isOpen
              ? 'bg-amber-500 text-black border-amber-400 shadow-amber-500/30'
              : 'bg-neutral-900/95 text-amber-400 hover:bg-neutral-800 border-amber-500/40 shadow-black/80 backdrop-blur-md'
          }`}
          title={language === 'fa' ? 'جدول اطلاعات همه‌کاره و راهنمای نقش‌ها' : 'Omnipresent God Table & Reference Drawer'}
        >
          <Table className="w-4 h-4" />
          <span className="hidden sm:inline">
            {language === 'fa' ? 'جدول اطلاعات و راهنما' : 'God Table & Reference'}
          </span>
          {currentMusicTrack && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>
      </div>

      {/* Slide-over Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-over Content Panel */}
      <div
        className={`fixed top-0 bottom-0 z-50 w-full sm:w-[480px] bg-[#0c0c0f] border-x border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : (language === 'en' ? 'translate-x-full' : '-translate-x-full')
        } ${language === 'en' ? 'right-0' : 'left-0'}`}
        dir={language === 'en' ? 'ltr' : 'rtl'}
      >
        {/* Drawer Header */}
        <div className="p-4 bg-neutral-900 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">
                {language === 'fa' ? 'جدول اطلاعات و راهنمای گرداننده' : 'God Cheat Sheet & Matrix'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'fa' ? 'دسترسی سریع و همیشگی در تمامی صفحات' : 'Omnipresent Reference across all screens'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="p-2 bg-neutral-950 border-b border-white/5 grid grid-cols-4 gap-1 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('PLAYERS')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeTab === 'PLAYERS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'fa' ? 'بازیکنان' : 'Players'}</span>
          </button>

          <button
            onClick={() => setActiveTab('MATRIX')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeTab === 'MATRIX' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'fa' ? 'ماتریس' : 'Matrix'}</span>
          </button>

          <button
            onClick={() => setActiveTab('ROLES')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeTab === 'ROLES' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'fa' ? 'نقش‌ها' : 'Roles'}</span>
          </button>

          <button
            onClick={() => setActiveTab('MUSIC')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeTab === 'MUSIC' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>{language === 'fa' ? 'موسیقی' : 'Music'}</span>
          </button>
        </div>

        {/* Tab 1: Live Players & Status Roster */}
        {activeTab === 'PLAYERS' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!room || room.players.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {language === 'fa' ? 'هیچ بازیکنی در بازی فعال نیست.' : 'No active players.'}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">
                    {language === 'fa' ? 'لیست زنده بازیکنان و نقش‌های مخفی:' : 'Live Players & Hidden Roles:'}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {alivePlayers.length} {language === 'fa' ? 'زنده' : 'Alive'} / {room.players.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {room.players.map((player) => {
                    const roleDef = ROLE_DEFINITIONS[player.role] || ROLE_DEFINITIONS.CITIZEN_SIMPLE;
                    const roleName = t[`role_${player.role}`] || player.role;
                    const isMafia = roleDef.affiliation === 'MAFIA';
                    const isCitizen = roleDef.affiliation === 'CITIZEN';

                    return (
                      <div
                        key={player.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                          player.isAlive
                            ? isMafia
                              ? 'bg-rose-950/20 border-rose-500/30 text-white'
                              : isCitizen
                              ? 'bg-blue-950/20 border-blue-500/30 text-white'
                              : 'bg-amber-950/20 border-amber-500/30 text-white'
                            : 'bg-neutral-950/80 border-white/5 opacity-50 grayscale'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-neutral-800 text-slate-300 text-[11px] font-mono flex items-center justify-center font-bold">
                            {player.seatNumber}
                          </span>
                          <span className="text-xl select-none">{player.avatar}</span>
                          <div>
                            <div className="text-xs font-black text-white flex items-center gap-1.5">
                              <span>{player.name}</span>
                              {player.isHost && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                                  {language === 'fa' ? 'گرداننده' : 'Host'}
                                </span>
                              )}
                              {!player.isAlive && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">
                                  {language === 'fa' ? 'حذف‌شده' : 'Eliminated'}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-bold flex items-center gap-1.5 mt-0.5">
                              <span className={roleDef.teamColor.split(' ')[0]}>{roleName}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-[10px] text-slate-400">
                                {roleDef.affiliation === 'MAFIA' ? 'مافیا' : roleDef.affiliation === 'CITIZEN' ? 'شهروند' : 'مستقل'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-1">
                          {player.fouls > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono">
                              ⚠️ {player.fouls} خطا
                            </span>
                          )}
                          {player.speechMuted && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300">
                              🤐 سایلنس
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: 17 Scenarios & Clash Matrix */}
        {activeTab === 'MATRIX' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">
                {language === 'fa' ? 'انتخاب سناریوی فعال (۱۷ سناریو):' : 'Select Active Preset Scenario:'}
              </label>
              <select
                value={selectedScenarioId}
                onChange={(e) => setSelectedScenarioId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white text-xs font-bold focus:border-indigo-500 outline-none"
              >
                {DEFAULT_SCENARIOS.map((sc) => {
                  const loc = localizeScenario(sc, language);
                  return (
                    <option key={sc.id} value={sc.id}>
                      {loc.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900/80 border border-white/5 space-y-2">
              <div className="text-xs font-black text-indigo-400">{selectedScenario.name}</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{selectedScenario.description}</p>
              
              <div className="pt-2 border-t border-white/5 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-300">
                  {language === 'fa' ? 'ترکیب نقش‌ها:' : 'Role Composition:'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedScenario.roles.map((rId, ridx) => {
                    const rDef = ROLE_DEFINITIONS[rId];
                    const rName = t[`role_${rId}`] || rId;
                    return (
                      <span
                        key={ridx}
                        className={`text-[10px] px-2 py-1 rounded-lg border font-bold ${
                          rDef?.affiliation === 'MAFIA'
                            ? 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                            : rDef?.affiliation === 'CITIZEN'
                            ? 'bg-blue-950/40 text-blue-300 border-blue-500/30'
                            : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {rName}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {onOpenMatrixModal && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenMatrixModal();
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>{language === 'fa' ? 'مشاهده ماتریس کامل تقابل و تضاد نقش‌ها' : 'Open Full Clash Matrix Modal'}</span>
              </button>
            )}
          </div>
        )}

        {/* Tab 3: Roles Encyclopedia & Priority Guide */}
        {activeTab === 'ROLES' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'fa' ? 'جستجوی نقش، قابلیت یا اولویت...' : 'Search roles or acts...'}
                className="w-full pr-9 pl-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              {filteredRoles.map((role) => {
                const roleName = t[`role_${role.id}`] || role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => {
                      if (onOpenRoleGuide) {
                        setIsOpen(false);
                        onOpenRoleGuide(role.id as RoleId);
                      }
                    }}
                    className="p-3 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getRoleIcon(role.id as RoleId)}</span>
                        <span className="text-xs font-black text-white">{roleName}</span>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border ${role.teamColor}`}>
                        {role.affiliation === 'MAFIA' ? 'مافیا' : role.affiliation === 'CITIZEN' ? 'شهروند' : 'مستقل'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {role.descriptionKey}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Cinematic Noir Music & Audio Synthesizer */}
        {activeTab === 'MUSIC' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/30 to-neutral-900 border border-rose-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black text-rose-300 flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  <span>{language === 'fa' ? 'موسیقی فضاساز و سینمایی مافیا' : 'Atmospheric Cinematic Soundtracks'}</span>
                </div>
                {currentMusicTrack && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse font-mono">
                    در حال پخش ♫
                  </span>
                )}
              </div>

              {/* Tracks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'NOIR_MYSTERY',
                  'NIGHT_SUSPENSE',
                  'COURT_DRAMA',
                  'VICTORY_ANTHEM'
                ].map((trackKey) => {
                  const tr = tracksInfo[trackKey][language] || tracksInfo[trackKey]['fa'];
                  const isPlaying = currentMusicTrack === trackKey;
                  return (
                    <button
                      key={trackKey}
                      onClick={() => handlePlayMusicTrack(trackKey as any)}
                      className={`p-3 rounded-xl border text-right transition-all flex items-start justify-between cursor-pointer ${
                        isPlaying
                          ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/30'
                          : 'bg-neutral-800/80 hover:bg-neutral-800 text-slate-200 border-white/5'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-black">{tr.title}</div>
                        <div className={`text-[10px] mt-0.5 ${isPlaying ? 'text-rose-100' : 'text-slate-400'}`}>
                          {tr.desc}
                        </div>
                      </div>
                      {isPlaying ? (
                        <Square className="w-4 h-4 fill-white shrink-0 mt-0.5" />
                      ) : (
                        <Play className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Volume Slider */}
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span>{language === 'fa' ? 'ولوم موسیقی:' : 'Music Volume:'}</span>
                  <span className="font-mono">{Math.round(musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Night Whispers Masking Noise */}
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-white flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>{language === 'fa' ? 'نویز پوششی حرکات شب (Whisper Mask)' : 'Night Whispers Noise Mask'}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {language === 'fa' ? 'پوشش صوتی ملایم برای جلوگیری از لو رفتن صدای مافیا' : 'Masks physical movement sounds during night phase'}
                </p>
              </div>

              <button
                onClick={handleToggleNightAmbiance}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                  isNightAmbianceOn
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-white/5 text-slate-400 border-white/10'
                }`}
              >
                {isNightAmbianceOn ? (language === 'fa' ? 'فعال ✓' : 'ON') : (language === 'fa' ? 'غیرفعال' : 'OFF')}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
