import React, { useState, useEffect } from 'react';
import { 
  Moon, X, Check, Shield, Target, Crosshair, 
  Search, VolumeX, AlertTriangle, Sparkles, CheckCircle2,
  Volume2, Wine, Zap, FileText, CheckSquare, Square
} from 'lucide-react';
import { NightActionRecord, Player, RoleId, RoomState, Language } from '../../types/mafia';
import { ROLE_DEFINITIONS } from '../../utils/scenarios';
import { translations } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';

interface NightEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomState;
  onResolveNight: (deadPlayerIds: string[], mutedPlayerId?: string, narrative?: string) => void;
  onBroadcastNightAudio?: () => void;
  language: Language;
}

export const NightEngineModal: React.FC<NightEngineModalProps> = ({
  isOpen,
  onClose,
  room,
  onResolveNight,
  onBroadcastNightAudio,
  language
}) => {
  const isEn = language === 'en';
  const t = translations[language];

  // Living players
  const livingPlayers = room.players.filter(p => p.isAlive);
  const mafiaPlayers = livingPlayers.filter(p => ROLE_DEFINITIONS[p.role]?.affiliation === 'MAFIA');
  const doctor = livingPlayers.find(p => p.role === 'DOCTOR');
  const detective = livingPlayers.find(p => p.role === 'DETECTIVE');
  const sniper = livingPlayers.find(p => p.role === 'SNIPER');
  const doctorLecter = livingPlayers.find(p => p.role === 'DOCTOR_LECTER');
  const natasha = livingPlayers.find(p => p.role === 'NATASHA');
  const bartender = livingPlayers.find(p => p.role === 'BARTENDER' || (p.role as string) === 'SAGHI');
  const gunner = livingPlayers.find(p => p.role === 'GUNNER' || (p.role as string) === 'TOOFANGDAR');

  const isIntroNight = room.dayNumber <= 1 && (room.phase === 'INTRO_NIGHT' || room.phase === 'NIGHT');
  const firstNightAwake = room.firstNightAwakeRoles || ['BARTENDER', 'DETECTIVE'];

  // Selected Targets for this night
  const [mafiaKillTarget, setMafiaKillTarget] = useState<string>('');
  const [doctorSaveTarget, setDoctorSaveTarget] = useState<string>('');
  const [doctorLecterSaveTarget, setDoctorLecterSaveTarget] = useState<string>('');
  const [detectiveCheckTarget, setDetectiveCheckTarget] = useState<string>('');
  const [sniperShotTarget, setSniperShotTarget] = useState<string>('');
  const [natashaMuteTarget, setNatashaMuteTarget] = useState<string>('');
  const [bartenderTarget, setBartenderTarget] = useState<string>('');
  const [gunnerTarget, setGunnerTarget] = useState<string>('');
  const [claimsNote, setClaimsNote] = useState<string>('');

  // Step Completion tracking (Tick "Done" per point 10)
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setMafiaKillTarget('');
      setDoctorSaveTarget('');
      setDoctorLecterSaveTarget('');
      setDetectiveCheckTarget('');
      setSniperShotTarget('');
      setNatashaMuteTarget('');
      setBartenderTarget('');
      setGunnerTarget('');
      setClaimsNote('');
      setCompletedSteps({});
    }
  }, [isOpen]);

  const toggleStepDone = (key: string) => {
    soundEngine.playTick();
    setCompletedSteps(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Detective Result computation
  const getDetectiveResult = (targetId: string) => {
    if (!targetId) return null;
    const target = room.players.find(p => p.id === targetId);
    if (!target) return null;
    const roleDef = ROLE_DEFINITIONS[target.role];
    if (roleDef?.hasInquiryImmunity) {
      return { isPositive: false, message: isEn ? 'Negative inquiry (Godfather / Immunity)' : 'استعلام منفی (پدرخوانده / مصونیت)' };
    }
    if (roleDef?.affiliation === 'MAFIA') {
      return { isPositive: true, message: isEn ? 'Positive inquiry (Mafia Member 🔴)' : 'استعلام مثبت (عضو مافیا 🔴)' };
    }
    return { isPositive: false, message: isEn ? 'Negative inquiry (Citizen 🟢)' : 'استعلام منفی (شهروند 🟢)' };
  };

  const detectiveResult = getDetectiveResult(detectiveCheckTarget);

  // Auto Conflict Resolution Preview
  const resolveConflicts = () => {
    const deaths: string[] = [];
    const logs: string[] = [];

    // Saghi / Bartender effect
    if (bartenderTarget) {
      const bTarget = room.players.find(p => p.id === bartenderTarget);
      logs.push(isEn ? `Bartender affected ${bTarget?.name} (became drunk).` : `ساقی روی ${bTarget?.name} اثر گذاشت (مست شد).`);
    }

    // Gunner delivery
    if (gunnerTarget) {
      const gTarget = room.players.find(p => p.id === gunnerTarget);
      logs.push(isEn ? `Gunner delivered weapon to ${gTarget?.name}.` : `تفنگدار اسلحه را به ${gTarget?.name} تحویل داد.`);
    }

    // 1. Mafia Kill
    if (mafiaKillTarget) {
      const target = room.players.find(p => p.id === mafiaKillTarget);
      if (doctorSaveTarget === mafiaKillTarget) {
        logs.push(isEn ? `Doctor saved ${target?.name}'s life from mafia shot.` : `پزشک شهر جان ${target?.name} را در برابر شلیک مافیا نجات داد.`);
      } else if (target?.role === 'ARMORED' && target.hasShield !== false) {
        logs.push(isEn ? `Mafia shot hit Armored (${target?.name}) and destroyed vest.` : `شلیک مافیا به زره‌پوش (${target?.name}) اصابت کرد و جلیقه او از بین رفت.`);
      } else {
        deaths.push(mafiaKillTarget);
        logs.push(isEn ? `${target?.name} was eliminated by mafia shot.` : `${target?.name} با شلیک مافیا کشته شد.`);
      }
    }

    // 2. Sniper Shot
    if (sniperShotTarget && sniper) {
      const target = room.players.find(p => p.id === sniperShotTarget);
      const targetRoleDef = ROLE_DEFINITIONS[target?.role || 'CITIZEN_SIMPLE'];

      if (targetRoleDef?.affiliation === 'MAFIA') {
        if (doctorLecterSaveTarget === sniperShotTarget) {
          logs.push(isEn ? `Doctor Lecter saved mafia (${target?.name}) from sniper shot.` : `دکتر لکتر مافیا (${target?.name}) را از تیر تک‌تیرانداز نجات داد.`);
        } else {
          if (!deaths.includes(sniperShotTarget)) deaths.push(sniperShotTarget);
          logs.push(isEn ? `Sniper successfully eliminated mafia (${target?.name}).` : `تک‌تیرانداز با موفقیت مافیا (${target?.name}) را حذف کرد.`);
        }
      } else {
        // Sniper shot a citizen -> Sniper dies
        if (!deaths.includes(sniper.id)) deaths.push(sniper.id);
        logs.push(isEn ? `Sniper mistakenly shot a citizen and is eliminated from the game.` : `تک‌تیرانداز اشتباهاً به شهروند شلیک کرد و خودش از بازی خارج شد.`);
      }
    }

    // 3. Natasha Mute
    if (natashaMuteTarget) {
      const target = room.players.find(p => p.id === natashaMuteTarget);
      logs.push(isEn ? `Natasha silenced ${target?.name} for tomorrow.` : `ناتاشا ${target?.name} را برای روز بعد سایلنت و لال کرد.`);
    }

    if (claimsNote.trim()) {
      logs.push(isEn ? `Recorded claim: ${claimsNote.trim()}` : `ادعای ثبت‌شده: ${claimsNote.trim()}`);
    }

    return { deaths, logs };
  };

  const { deaths: predictedDeaths, logs: predictedLogs } = resolveConflicts();

  const handleApplyResolution = () => {
    soundEngine.playGong();
    const narrative = predictedLogs.join(' ');
    onResolveNight(predictedDeaths, natashaMuteTarget || undefined, narrative);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="bg-[#111118] border border-white/15 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-[#171722] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {isIntroNight
                  ? (isEn ? 'Intro Night Checklist (Initial Registrations)' : 'چک‌لیست شب معارفه (ثبت‌های آغازین)')
                  : (isEn ? `Night ${room.dayNumber} Engine — Action Log` : `موتور شب ${room.dayNumber} — ثبت اکشن‌ها`)}
              </h2>
              <p className="text-xs text-zinc-400">
                {isEn
                  ? 'Host console is the source of truth. Check off each role as you wake them.'
                  : 'منبع حقیقت فقط صفحه خداست. هر کس را بیدار کردید تیک انجام شد بزنید.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onBroadcastNightAudio && (
              <button
                onClick={() => {
                  soundEngine.playTick();
                  onBroadcastNightAudio();
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                title={isEn ? 'Broadcast night background music to phones' : 'پخش آهنگ شب روی گوشی‌ها'}
              >
                <Volume2 className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">{isEn ? 'Play Night Music' : 'پخش آهنگ شب'}</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Action Items */}
        <div className={`flex-1 overflow-y-auto p-5 space-y-4 ${isEn ? 'text-left' : 'text-right'}`}>
          
          {/* Intro Night Info */}
          {isIntroNight && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
              <strong>{isEn ? 'Intro Night:' : 'شب معارفه:'}</strong> {isEn ? 'Mafia shots and doctor saves activate from Night 2 onwards. Only awake intro roles (like Bartender, Researcher, or Mafia eye contact) are recorded.' : 'شلیک مافیا و نجات‌ها معمولاً از شب دوم فعال می‌شوند. تنها نقش‌های بیدار در شب معارفه (مانند ساقی، محقق یا معارفه چشم‌در‌چشم مافیا) ثبت می‌شوند.'}
            </div>
          )}

          {/* 1. Mafia Action */}
          {(!isIntroNight || firstNightAwake.includes('GODFATHER') || firstNightAwake.includes('MAFIA_SIMPLE')) && (
            <div className={`p-4 rounded-2xl border transition-all ${
              completedSteps['MAFIA'] ? 'bg-rose-950/20 border-rose-500/40' : 'bg-black/40 border-zinc-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs sm:text-sm text-rose-400 flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  <span>{isEn ? 'Mafia Team Elimination Shot:' : 'شلیک مافیا (تیم مافیا):'}</span>
                </span>
                <button 
                  onClick={() => toggleStepDone('MAFIA')}
                  className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white cursor-pointer"
                >
                  {completedSteps['MAFIA'] ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-zinc-500" />}
                  <span className={completedSteps['MAFIA'] ? 'text-emerald-400 font-bold' : ''}>
                    {completedSteps['MAFIA'] ? (isEn ? 'Completed' : 'انجام شد') : (isEn ? 'Mark Done' : 'انجام شد')}
                  </span>
                </button>
              </div>
              <select
                value={mafiaKillTarget}
                onChange={(e) => setMafiaKillTarget(e.target.value)}
                className="w-full text-xs font-bold rounded-xl px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-rose-500"
              >
                <option value="">{isEn ? '-- No shot fired / Empty shot --' : '-- شلیکی انجام نشد / شلیک بی‌هدف --'}</option>
                {livingPlayers.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({isEn ? 'Seat' : 'صندلی'} {p.seatNumber || '-'})</option>
                ))}
              </select>
            </div>
          )}

          {/* 2. Doctor Action */}
          {doctor && !isIntroNight && (
            <div className={`p-4 rounded-2xl border transition-all ${
              completedSteps['DOCTOR'] ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-black/40 border-zinc-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs sm:text-sm text-emerald-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>{isEn ? `Doctor Save (${doctor.name}):` : `نجات دکتر شهر (${doctor.name}):`}</span>
                </span>
                <button 
                  onClick={() => toggleStepDone('DOCTOR')}
                  className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white cursor-pointer"
                >
                  {completedSteps['DOCTOR'] ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-zinc-500" />}
                  <span className={completedSteps['DOCTOR'] ? 'text-emerald-400 font-bold' : ''}>
                    {completedSteps['DOCTOR'] ? (isEn ? 'Completed' : 'انجام شد') : (isEn ? 'Mark Done' : 'انجام شد')}
                  </span>
                </button>
              </div>
              <select
                value={doctorSaveTarget}
                onChange={(e) => setDoctorSaveTarget(e.target.value)}
                className="w-full text-xs font-bold rounded-xl px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="">{isEn ? '-- No save performed --' : '-- نجاتی انجام نداد --'}</option>
                {livingPlayers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.id === doctor.id ? (isEn ? '(Self-heal)' : '(خوددرمانی)') : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 3. Detective / Researcher */}
          {detective && (!isIntroNight || firstNightAwake.includes('DETECTIVE')) && (
            <div className={`p-4 rounded-2xl border transition-all ${
              completedSteps['DETECTIVE'] ? 'bg-sky-950/20 border-sky-500/40' : 'bg-black/40 border-zinc-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs sm:text-sm text-sky-400 flex items-center gap-1.5">
                  <Search className="w-4 h-4" />
                  <span>{isEn ? `Detective / Researcher Inquiry (${detective.name}):` : `استعلام کارآگاه / محقق (${detective.name}):`}</span>
                </span>
                <button 
                  onClick={() => toggleStepDone('DETECTIVE')}
                  className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white cursor-pointer"
                >
                  {completedSteps['DETECTIVE'] ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-zinc-500" />}
                  <span className={completedSteps['DETECTIVE'] ? 'text-emerald-400 font-bold' : ''}>
                    {completedSteps['DETECTIVE'] ? (isEn ? 'Completed' : 'انجام شد') : (isEn ? 'Mark Done' : 'انجام شد')}
                  </span>
                </button>
              </div>
              {detectiveResult && (
                <div className={`mb-2 text-xs font-bold px-3 py-1.5 rounded-xl border ${
                  detectiveResult.isPositive
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {detectiveResult.message}
                </div>
              )}
              <select
                value={detectiveCheckTarget}
                onChange={(e) => setDetectiveCheckTarget(e.target.value)}
                className="w-full text-xs font-bold rounded-xl px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-sky-500"
              >
                <option value="">{isEn ? '-- No inquiry taken --' : '-- استعلامی نگرفت --'}</option>
                {livingPlayers.filter(p => p.id !== detective.id).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 4. Bartender / Saghi */}
          {bartender && (
            <div className={`p-4 rounded-2xl border transition-all ${
              completedSteps['BARTENDER'] ? 'bg-amber-950/20 border-amber-500/40' : 'bg-black/40 border-zinc-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs sm:text-sm text-amber-400 flex items-center gap-1.5">
                  <Wine className="w-4 h-4" />
                  <span>{isEn ? `Bartender Choice (${bartender.name}):` : `انتخاب ساقی / بارتندر (${bartender.name}):`}</span>
                </span>
                <button 
                  onClick={() => toggleStepDone('BARTENDER')}
                  className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white cursor-pointer"
                >
                  {completedSteps['BARTENDER'] ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-zinc-500" />}
                  <span className={completedSteps['BARTENDER'] ? 'text-emerald-400 font-bold' : ''}>
                    {completedSteps['BARTENDER'] ? (isEn ? 'Completed' : 'انجام شد') : (isEn ? 'Mark Done' : 'انجام شد')}
                  </span>
                </button>
              </div>
              <select
                value={bartenderTarget}
                onChange={(e) => setBartenderTarget(e.target.value)}
                className="w-full text-xs font-bold rounded-xl px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="">{isEn ? '-- No target chosen --' : '-- کسی را انتخاب نکرد --'}</option>
                {livingPlayers.filter(p => p.id !== bartender.id).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 5. Gunner / تفنگدار */}
          {gunner && (
            <div className={`p-4 rounded-2xl border transition-all ${
              completedSteps['GUNNER'] ? 'bg-orange-950/20 border-orange-500/40' : 'bg-black/40 border-zinc-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs sm:text-sm text-orange-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>{isEn ? `Gunner Weapon Delivery (${gunner.name}):` : `تحویل اسلحه توسط تفنگدار (${gunner.name}):`}</span>
                </span>
                <button 
                  onClick={() => toggleStepDone('GUNNER')}
                  className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white cursor-pointer"
                >
                  {completedSteps['GUNNER'] ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-zinc-500" />}
                  <span className={completedSteps['GUNNER'] ? 'text-emerald-400 font-bold' : ''}>
                    {completedSteps['GUNNER'] ? (isEn ? 'Completed' : 'انجام شد') : (isEn ? 'Mark Done' : 'انجام شد')}
                  </span>
                </button>
              </div>
              <select
                value={gunnerTarget}
                onChange={(e) => setGunnerTarget(e.target.value)}
                className="w-full text-xs font-bold rounded-xl px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-orange-500"
              >
                <option value="">{isEn ? '-- No gun given --' : '-- اسلحه‌ای تحویل نداد --'}</option>
                {livingPlayers.filter(p => p.id !== gunner.id).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 6. Sniper */}
          {sniper && !isIntroNight && (
            <div className={`p-4 rounded-2xl border transition-all ${
              completedSteps['SNIPER'] ? 'bg-amber-950/20 border-amber-500/40' : 'bg-black/40 border-zinc-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs sm:text-sm text-amber-400 flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4" />
                  <span>{isEn ? `Sniper Shot (${sniper.name}):` : `شلیک تک‌تیرانداز (${sniper.name}):`}</span>
                </span>
                <button 
                  onClick={() => toggleStepDone('SNIPER')}
                  className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white cursor-pointer"
                >
                  {completedSteps['SNIPER'] ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-zinc-500" />}
                  <span className={completedSteps['SNIPER'] ? 'text-emerald-400 font-bold' : ''}>
                    {completedSteps['SNIPER'] ? (isEn ? 'Completed' : 'انجام شد') : (isEn ? 'Mark Done' : 'انجام شد')}
                  </span>
                </button>
              </div>
              <select
                value={sniperShotTarget}
                onChange={(e) => setSniperShotTarget(e.target.value)}
                className="w-full text-xs font-bold rounded-xl px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="">{isEn ? '-- No shot fired --' : '-- شلیکی نکرد --'}</option>
                {livingPlayers.filter(p => p.id !== sniper.id).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 7. Doctor Lecter */}
          {doctorLecter && !isIntroNight && (
            <div className={`p-4 rounded-2xl border transition-all ${
              completedSteps['LECTER'] ? 'bg-pink-950/20 border-pink-500/40' : 'bg-black/40 border-zinc-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs sm:text-sm text-pink-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>{isEn ? `Doctor Lecter Save (${doctorLecter.name}):` : `نجات دکتر لکتر مافیا (${doctorLecter.name}):`}</span>
                </span>
                <button 
                  onClick={() => toggleStepDone('LECTER')}
                  className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white cursor-pointer"
                >
                  {completedSteps['LECTER'] ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-zinc-500" />}
                  <span className={completedSteps['LECTER'] ? 'text-emerald-400 font-bold' : ''}>
                    {completedSteps['LECTER'] ? (isEn ? 'Completed' : 'انجام شد') : (isEn ? 'Mark Done' : 'انجام شد')}
                  </span>
                </button>
              </div>
              <select
                value={doctorLecterSaveTarget}
                onChange={(e) => setDoctorLecterSaveTarget(e.target.value)}
                className="w-full text-xs font-bold rounded-xl px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none"
              >
                <option value="">{isEn ? '-- No save performed --' : '-- نجات نداد --'}</option>
                {mafiaPlayers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 8. Natasha */}
          {natasha && !isIntroNight && (
            <div className={`p-4 rounded-2xl border transition-all ${
              completedSteps['NATASHA'] ? 'bg-purple-950/20 border-purple-500/40' : 'bg-black/40 border-zinc-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs sm:text-sm text-purple-400 flex items-center gap-1.5">
                  <VolumeX className="w-4 h-4" />
                  <span>{isEn ? `Natasha Silence (${natasha.name}):` : `سکوت‌دهی ناتاشا (${natasha.name}):`}</span>
                </span>
                <button 
                  onClick={() => toggleStepDone('NATASHA')}
                  className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white cursor-pointer"
                >
                  {completedSteps['NATASHA'] ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-zinc-500" />}
                  <span className={completedSteps['NATASHA'] ? 'text-emerald-400 font-bold' : ''}>
                    {completedSteps['NATASHA'] ? (isEn ? 'Completed' : 'انجام شد') : (isEn ? 'Mark Done' : 'انجام شد')}
                  </span>
                </button>
              </div>
              <select
                value={natashaMuteTarget}
                onChange={(e) => setNatashaMuteTarget(e.target.value)}
                className="w-full text-xs font-bold rounded-xl px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none"
              >
                <option value="">{isEn ? '-- No player silenced --' : '-- کسی را ساکت نکرد --'}</option>
                {livingPlayers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 9. Claims Register (ثبت ادعای وسط بازی) */}
          <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800 space-y-2">
            <span className="font-bold text-xs text-zinc-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>{isEn ? 'Record Player In-Game Claim (Host Secret Note):' : 'ثبت ادعای بازیکنان در بازی (یادداشت مخفی خدا):'}</span>
            </span>
            <input
              type="text"
              value={claimsNote}
              onChange={(e) => setClaimsNote(e.target.value)}
              placeholder={isEn ? 'e.g. Player 3 claimed to hold the gun...' : 'مثال: بازیکن ۳ ادعا کرد تفنگ دست اوست...'}
              className="w-full text-xs rounded-xl px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Conflict Resolution Result Box */}
          <div className="p-4 bg-indigo-950/40 rounded-2xl border border-indigo-500/40 space-y-2">
            <h4 className="font-bold text-xs text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{isEn ? 'Auto Conflict Resolution (Morning Preview):' : 'نتیجه محاسبه خودکار تعارضات شب (پیش‌نمایش وقایع صبح):'}</span>
            </h4>
            <div className="text-xs text-zinc-200 space-y-1">
              {predictedLogs.length > 0 ? (
                predictedLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="text-indigo-400">•</span>
                    <span>{log}</span>
                  </div>
                ))
              ) : (
                <span className="text-zinc-500">{isEn ? 'No elimination action registered (Quiet night).' : 'اکشنی برای خروج ثبت نشده است (شب آرام).'}</span>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-[#14141c] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs cursor-pointer"
          >
            {isEn ? 'Cancel' : 'انصراف'}
          </button>

          <button
            onClick={handleApplyResolution}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-950 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isEn ? 'Apply Results & Sunrise ☀️' : 'اعمال نتایج و طلوع آفتاب ☀️'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
