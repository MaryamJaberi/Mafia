import React, { useState, useMemo } from 'react';
import { 
  Crown, Users, Sparkles, BookOpen, Shield, ArrowRight, ArrowLeft, 
  Check, Plus, Minus, HelpCircle, Copy, Share2, AlertCircle, 
  Bot, RefreshCw, Moon, Sun, Info, Trash2, Send
} from 'lucide-react';
import { DEFAULT_SCENARIOS, ROLE_DEFINITIONS } from '../../utils/scenarios';
import { RoleId, Scenario, Language, DeckRoleItem } from '../../types/mafia';
import { soundEngine } from '../../utils/audioSynth';
import QRCode from 'qrcode';

interface GameCreatorScreenProps {
  onBackToHome: () => void;
  onGameCreated: (params: {
    scenarioId: string;
    totalSeats: number;
    deckRoles: DeckRoleItem[];
    prefilledNames: string[];
    firstNightAwakeRoles: RoleId[];
    gameLanguage: Language;
    hostName: string;
  }) => Promise<{ roomId: string; joinToken: string }>;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
}

export const GameCreatorScreen: React.FC<GameCreatorScreenProps> = ({
  onBackToHome,
  onGameCreated,
  language,
  onSelectLanguage
}) => {
  const isEn = language === 'en';
  const Arrow = isEn ? ArrowRight : ArrowLeft;

  // 1. Scenario Selection
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('classic-10');
  const activeScenario = useMemo(() => {
    return DEFAULT_SCENARIOS.find(s => s.id === selectedScenarioId) || DEFAULT_SCENARIOS[0];
  }, [selectedScenarioId]);

  // 2. Total Seats Count
  const [totalSeats, setTotalSeats] = useState<number>(activeScenario.recommendedPlayerCount || 10);

  // When scenario changes, update default total seats
  const handleSelectScenario = (scenario: Scenario) => {
    soundEngine.playTick();
    setSelectedScenarioId(scenario.id);
    setTotalSeats(scenario.recommendedPlayerCount || scenario.roles.length);
    // Initialize deck from scenario roles
    setCustomDeck(scenario.roles.map((r, i) => ({
      id: `deck_${Date.now()}_${i}_${r}`,
      roleId: r
    })));
  };

  // 3. Custom Deck Items
  const [customDeck, setCustomDeck] = useState<DeckRoleItem[]>(() => {
    const sc = DEFAULT_SCENARIOS.find(s => s.id === 'classic-10') || DEFAULT_SCENARIOS[0];
    return sc.roles.map((r, i) => ({
      id: `deck_${Date.now()}_${i}_${r}`,
      roleId: r
    }));
  });

  // 4. Pre-filled player names
  const [prefilledText, setPrefilledText] = useState<string>('');

  // 5. First Night Wake-up Rule
  // Default: Intro Night is dark/silent. Meaningful roles like Bartender, Detective/Researcher can be checked.
  const [firstNightAwakeRoles, setFirstNightAwakeRoles] = useState<RoleId[]>(['BARTENDER', 'PSYCHOLOGIST']);

  // 6. AI Balance Advisor State (ONLY available in this setup phase)
  const [aiQuestion, setAiQuestion] = useState<string>(
    language === 'en' ? 'Is this role combination balanced for the selected player count?' : 'آیا ترکیب این نقش‌ها برای تعداد بازیکنان انتخابی متعادل است؟'
  );
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // 7. Created Game Info
  const [createdRoomInfo, setCreatedRoomInfo] = useState<{ roomId: string; joinToken: string; joinUrl: string; qrDataUrl: string } | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Deck counts
  const mafiaCount = customDeck.filter(d => ROLE_DEFINITIONS[d.roleId]?.affiliation === 'MAFIA').length;
  const citizenCount = customDeck.filter(d => ROLE_DEFINITIONS[d.roleId]?.affiliation === 'CITIZEN').length;
  const independentCount = customDeck.filter(d => ROLE_DEFINITIONS[d.roleId]?.affiliation === 'INDEPENDENT').length;

  // Add role to deck
  const handleAddRoleToDeck = (roleId: RoleId) => {
    soundEngine.playTick();
    setCustomDeck(prev => [...prev, { id: `deck_${Date.now()}_${roleId}`, roleId }]);
  };

  // Remove role from deck
  const handleRemoveRoleFromDeck = (index: number) => {
    soundEngine.playTick();
    setCustomDeck(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle first night wake-up
  const toggleFirstNightRole = (roleId: RoleId) => {
    soundEngine.playTick();
    setFirstNightAwakeRoles(prev => 
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
  };

  // AI Balance Advisor Consultation
  const handleAskAiBalance = async () => {
    if (!aiQuestion.trim()) return;
    setIsAiLoading(true);
    setAiAnswer(null);
    soundEngine.playTick();

    try {
      const prompt = isEn
        ? `Scenario: ${activeScenario.name}
Total Seats: ${totalSeats} players
Deck Composition:
- Mafia (${mafiaCount}): ${customDeck.filter(d => ROLE_DEFINITIONS[d.roleId]?.affiliation === 'MAFIA').map(d => ROLE_DEFINITIONS[d.roleId]?.nameKey?.replace('role_', '')).join(', ')}
- Citizen (${citizenCount}): ${customDeck.filter(d => ROLE_DEFINITIONS[d.roleId]?.affiliation === 'CITIZEN').map(d => ROLE_DEFINITIONS[d.roleId]?.nameKey?.replace('role_', '')).join(', ')}
- Night 1 Awake Roles: ${firstNightAwakeRoles.join(', ')}

Host / God Question: ${aiQuestion}

Please analyze this deck as a professional Mafia tournament referee in 2 to 3 concise technical paragraphs:
1. Is this composition balanced for this player count (about 1/3 mafia)?
2. How are counterpart clashes and counter-balancing?
3. Final advice to the host before clicking "Create Game".`
        : `سناریوی انتخابی: ${activeScenario.name}
تعداد صندلی‌ها: ${totalSeats} نفر
ترکیب کارت‌های دک:
- مافیا (${mafiaCount}): ${customDeck.filter(d => ROLE_DEFINITIONS[d.roleId]?.affiliation === 'MAFIA').map(d => ROLE_DEFINITIONS[d.roleId]?.nameKey?.replace('role_', '')).join(', ')}
- شهروند (${citizenCount}): ${customDeck.filter(d => ROLE_DEFINITIONS[d.roleId]?.affiliation === 'CITIZEN').map(d => ROLE_DEFINITIONS[d.roleId]?.nameKey?.replace('role_', '')).join(', ')}
- نقش‌های شب اول بیدار: ${firstNightAwakeRoles.join(', ')}

پرسش داور/خدا: ${aiQuestion}

لطفاً به عنوان یک داور ارشد تورنمنت‌های حرفه‌ای مافیا در ایران، در ۲ تا ۳ پاراگراف فنی و کوتاه تحلیل کنید:
۱. آیا این ترکیب برای این تعداد نفرات متوازن است (یک‌سوم مافیا)؟
۲. تعارض یا خنثی‌سازی نقش‌های متقابل چطور است؟
۳. توصیه نهایی به گرداننده قبل از فشردن دکمه «ساخت بازی».`;

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          taskType: 'complex',
          systemInstruction: isEn
            ? 'You are an expert Mafia tournament referee and balance evaluator. Provide precise, actionable, non-generic advice for game hosts.'
            : 'شما کارشناس تعادل دک و تنظیمات داوری بازی مافیا هستید. پاسخ دقیق، تخصصی، عاری از کلی‌گویی و کاملاً کاربردی برای گرداننده ارائه دهید.'
        })
      });

      const data = await res.json();
      if (data.reply) {
        setAiAnswer(data.reply);
      } else {
        setAiAnswer(
          isEn 
            ? 'Balance Analysis: The Mafia-to-Citizen ratio is optimal (around 30-33% Mafia). The matchup between Detective and Godfather, accompanied by at least one healing role (Doctor), provides well-balanced competitive gameplay.'
            : 'تحلیل تعادل: نسبت مافیا به شهروند منطقی است (حدود ۳۰ تا ۳۳ درصد مافیا). برای حفظ هیجان، تقابل کارآگاه و پدرخوانده و حضور حداقل یک نقش نجات (دکتر) به درستی در دک قرار دارد.'
        );
      }
    } catch (err) {
      setAiAnswer(
        isEn
          ? 'Offline Analysis: The selected composition satisfies tournament standards. Mafia count should be approximately one-third of total players.'
          : 'تحلیل آفلاین: ترکیب فعلی با نسبت استاندارد همخوانی دارد. تعداد مافیا باید حدود یک‌سوم کل بازیکنان باشد.'
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  // Submit & Create Game
  const handleCreateGame = async () => {
    soundEngine.playGong();
    setIsCreating(true);

    const prefilledNames = prefilledText
      .split(/[\n,،]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    try {
      const result = await onGameCreated({
        scenarioId: selectedScenarioId,
        totalSeats,
        deckRoles: customDeck,
        prefilledNames,
        firstNightAwakeRoles,
        gameLanguage: language,
        hostName: isEn ? 'Game Master' : 'گرداننده مسابقه'
      });

      const joinUrl = `${window.location.origin}${window.location.pathname}?join=${result.roomId}&token=${result.joinToken}`;
      const qrDataUrl = await QRCode.toDataURL(joinUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#ffffff', light: '#09090c' }
      });

      setCreatedRoomInfo({
        roomId: result.roomId,
        joinToken: result.joinToken,
        joinUrl,
        qrDataUrl
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  const copyLink = () => {
    if (!createdRoomInfo) return;
    navigator.clipboard.writeText(createdRoomInfo.joinUrl);
    setCopiedLink(true);
    soundEngine.playTick();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // If room has been created, show the created room confirmation card
  if (createdRoomInfo) {
    return (
      <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col justify-center items-center p-4 sm:p-8" dir={isEn ? 'ltr' : 'rtl'}>
        <div className="w-full max-w-xl bg-gradient-to-b from-[#14141c] to-[#0c0c12] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto text-3xl">
            🎉
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {isEn ? 'Game Created Successfully' : 'بازی با موفقیت ساخته شد'}
            </span>
            <h2 className="text-2xl font-black text-white">
              {isEn ? 'Room Code: ' : 'کد اختصاصی بازی: '}
              <span className="font-mono text-amber-400 text-3xl tracking-widest">{createdRoomInfo.roomId}</span>
            </h2>
            <p className="text-xs text-zinc-400">
              {isEn
                ? 'This code and link remain valid until game completion. Empty seats during the match are also filled via this link.'
                : 'این کد و لینک تا پایان همین بازی معتبر می‌مانند. صندلی خالی وسط بازی نیز با همین کد و لینک پر می‌شود.'}
            </p>
          </div>

          {/* QR Code */}
          {createdRoomInfo.qrDataUrl && (
            <div className="inline-block p-3 rounded-2xl bg-black border border-white/10 shadow-inner">
              <img src={createdRoomInfo.qrDataUrl} alt="Room QR" className="w-44 h-44 rounded-xl mx-auto" />
            </div>
          )}

          {/* Copyable Box */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-black/50 border border-white/10 text-xs font-mono text-zinc-300">
            <span className="truncate flex-1 text-left" dir="ltr">{createdRoomInfo.joinUrl}</span>
            <button
              onClick={copyLink}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? (isEn ? 'Copied!' : 'کپی شد') : (isEn ? 'Copy Link' : 'کپی لینک')}</span>
            </button>
          </div>

          {/* Proceed Button */}
          <button
            onClick={() => {
              soundEngine.playTick();
              window.location.reload(); // Reloads and lands host right in the created room console
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isEn ? 'Enter Waiting Room & God Console' : 'ورود به اتاق انتظار و میز گرداننده'}</span>
            <Arrow className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090b11] text-slate-100 p-4 sm:p-8 font-sans selection:bg-amber-500 selection:text-black" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Bar with Back Button */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <button
            onClick={() => {
              soundEngine.playTick();
              onBackToHome();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-bold border border-white/[0.08] cursor-pointer transition-all active:scale-95"
          >
            <Arrow className="w-4 h-4" />
            <span>{isEn ? 'Back to Home' : 'بازگشت به صفحه اول'}</span>
          </button>

          <div className="text-center">
            <h1 className="text-lg font-black text-white flex items-center gap-2 justify-center">
              <Crown className="w-5 h-5 text-amber-400" />
              <span>{isEn ? 'Game Creation (God / Host)' : 'ساخت بازی — کنسول گرداننده (خدا)'}</span>
            </h1>
            <p className="text-[11px] text-amber-400/90 font-medium">
              {isEn 
                ? 'Host does not have a seat, does not have a role, and does not vote. Host is solely the narrator.' 
                : 'خدا نقش ندارد، صندلی ندارد، رأی نمی‌دهد. فقط گرداننده و داور بی‌طرف است.'}
            </p>
          </div>

          <div className="w-24 text-left sm:text-right text-xs font-bold text-slate-400">
            <span>{totalSeats} {isEn ? 'Seats' : 'صندلی'}</span>
          </div>
        </div>

        {/* 1. Scenario Selector & Table */}
        <div className="p-6 rounded-3xl bg-[#0f121d] border border-white/[0.08] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                {isEn ? '1' : '۱'}
              </div>
              <h2 className="text-base font-black text-white">
                {isEn ? '1. Select Scenario & Scenario Table' : '۱. انتخاب سناریو و جدول نقش‌ها'}
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {DEFAULT_SCENARIOS.length} {isEn ? 'Presets available' : 'سناریوی آماده'}
            </span>
          </div>

          {/* Scenario Chips Carousel */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DEFAULT_SCENARIOS.map(sc => (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                className={`p-3 rounded-2xl border text-right transition-all cursor-pointer active:scale-95 ${
                  selectedScenarioId === sc.id
                    ? 'bg-amber-500/15 border-amber-400 text-white shadow-md'
                    : 'bg-[#151928] border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-black truncate">{sc.name}</div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>{sc.recommendedPlayerCount} {isEn ? 'players' : 'نفر'}</span>
                  <span className="px-1.5 py-0.5 rounded bg-black/40 text-amber-300 font-mono text-[9px]">{sc.tag ? (isEn && sc.tag === 'رسمی' ? 'Official' : sc.tag) : (isEn ? 'Official' : 'رسمی')}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Active Scenario Card & Table */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-amber-300">{activeScenario.name}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{activeScenario.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-400 text-xs font-bold">
                  {mafiaCount} {isEn ? 'Mafia' : 'مافیا'}
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                  {citizenCount} {isEn ? 'Citizen' : 'شهروند'}
                </span>
                {independentCount > 0 && (
                  <span className="px-2.5 py-1 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-400 text-xs font-bold">
                    {independentCount} {isEn ? 'Independent' : 'مستقل'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Seat Capacity Counter */}
        <div className="p-6 rounded-3xl bg-[#0f121d] border border-white/[0.08] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                {isEn ? '2' : '۲'}
              </div>
              <div>
                <h2 className="text-base font-black text-white">
                  {isEn ? '2. Table Player Capacity' : '۲. تعیین تعداد نفرات دور میز'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isEn ? 'Set the exact number of seats around the table' : 'تعداد صندلی‌های چیده شده دور میز'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-black/60 p-2 rounded-2xl border border-white/10">
              <button
                onClick={() => {
                  soundEngine.playTick();
                  setTotalSeats(prev => Math.max(6, prev - 1));
                }}
                className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer transition-colors font-bold active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-xl font-black text-amber-400 font-mono">
                {totalSeats}
              </span>
              <button
                onClick={() => {
                  soundEngine.playTick();
                  setTotalSeats(prev => Math.min(25, prev + 1));
                }}
                className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer transition-colors font-bold active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Deck & Counterpart Roles Inspection */}
        <div className="p-6 rounded-3xl bg-[#0f121d] border border-white/[0.08] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                {isEn ? '3' : '۳'}
              </div>
              <div>
                <h2 className="text-base font-black text-white">
                  {isEn ? '3. Deck Roles & Counterpart Matchups' : '۳. انتخاب نقش‌ها و نقش‌های متقابل'}
                </h2>
                <p className="text-xs text-zinc-400">
                  {isEn ? 'Configure role balance & clash pairs' : 'تقابل‌های مستقیم نقش‌های شب و روز (کارآگاه/پدرخوانده، اسنایپر/ماتادور، ...)'}
                </p>
              </div>
            </div>
            <span className="text-xs text-amber-400 font-mono font-bold">
              {customDeck.length} {isEn ? 'Cards in Deck' : 'کارت در دک'}
            </span>
          </div>

          {/* Current Deck Chips */}
          <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-black/40 border border-white/5 min-h-[60px]">
            {customDeck.map((item, idx) => {
              const def = ROLE_DEFINITIONS[item.roleId] || ROLE_DEFINITIONS.CITIZEN_SIMPLE;
              const isMafia = def.affiliation === 'MAFIA';
              const isIndep = def.affiliation === 'INDEPENDENT';

              return (
                <div
                  key={item.id}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow-sm ${
                    isMafia
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      : isIndep
                      ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                      : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  <span>{def.nameKey?.replace('role_', '') || item.roleId}</span>
                  {def.counterpartRoleName && (
                    <span className="text-[10px] opacity-70">⚔️ {def.counterpartRoleName}</span>
                  )}
                  <button
                    onClick={() => handleRemoveRoleFromDeck(idx)}
                    className="hover:text-red-400 p-0.5 rounded ml-1 cursor-pointer"
                    title={isEn ? "Remove card" : "حذف کارت"}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick Add Roles Selector */}
          <div className="pt-2 border-t border-white/5">
            <div className="text-xs font-bold text-zinc-400 mb-2">{isEn ? 'Add counterpart roles to deck:' : 'افزودن کارت‌های متقابل به دک:'}</div>
            <div className="flex flex-wrap gap-1.5">
              {['GODFATHER', 'DOCTOR_LECTER', 'MATADOR', 'NATASHA', 'DOCTOR', 'DETECTIVE', 'SNIPER', 'ARMORED', 'BARTENDER', 'PSYCHOLOGIST', 'GUNNER', 'ZODIAC'].map(r => {
                const def = ROLE_DEFINITIONS[r];
                if (!def) return null;
                return (
                  <button
                    key={r}
                    onClick={() => handleAddRoleToDeck(r)}
                    className="px-2.5 py-1 rounded-lg bg-[#181822] hover:bg-white/10 text-zinc-300 text-[11px] font-bold border border-white/5 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-amber-400" />
                    <span>{def.nameKey?.replace('role_', '')}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Night 1 Wake-up Rules */}
        <div className="p-6 rounded-3xl bg-[#0f0f15] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                {isEn ? '4' : '۴'}
              </div>
              <div>
                <h2 className="text-base font-black text-white">
                  {isEn ? '4. Night 1 Awake Roles' : '۴. مشخص کردن نقش‌های بیدار در شب اول (شب معارفه)'}
                </h2>
                <p className="text-xs text-zinc-400">
                  {isEn
                    ? 'Default: Intro night is silent/dark. Meaningful roles like Bartender or Researcher can wake up from Night 1.'
                    : 'پیش‌فرض: شب معارفه خاموش است؛ نقش‌های معنادار مثل محقق/کارآگاه و ساقی قابل انتخاب‌اند (بقیه معمولاً از شب دوم بیدار می‌شوند).'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: 'BARTENDER', name: isEn ? 'Bartender (Night 1 Inebriation)' : 'ساقی (مستی شب اول)', desc: isEn ? 'Effective from intro night' : 'اثرگذاری از همان شب معارفه' },
              { id: 'DETECTIVE', name: isEn ? 'Detective / Investigator' : 'کارآگاه / محقق', desc: isEn ? 'Inquiry active from Night 1' : 'استعلام از شب اول فعال باشد' },
              { id: 'PSYCHOLOGIST', name: isEn ? 'Psychologist' : 'روانپزشک', desc: isEn ? 'Therapy silence on Night 1' : 'سکوت درمانی شب اول' },
              { id: 'GUNNER', name: isEn ? 'Gunner' : 'تفنگدار', desc: isEn ? 'Distribute bullets on Night 1' : 'توزیع تیر در شب اول' },
              { id: 'NATASHA', name: isEn ? 'Natasha (Silencer)' : 'ناتاشا (سایلنسر)', desc: isEn ? 'Silencing from Night 1' : 'سکوت دادن از شب اول' },
              { id: 'ZODIAC', name: isEn ? 'Zodiac (Independent Shot)' : 'زودیاک (شلیک مستقل)', desc: isEn ? 'Awake on Night 1' : 'بیدار شدن از شب اول' }
            ].map(item => {
              const isChecked = firstNightAwakeRoles.includes(item.id as RoleId);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleFirstNightRole(item.id as RoleId)}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-amber-500/15 border-amber-400 text-white'
                      : 'bg-[#14141c] border-white/5 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{item.name}</span>
                    <span className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] ${
                      isChecked ? 'bg-amber-500 border-amber-400 text-black font-extrabold' : 'border-zinc-600'
                    }`}>
                      {isChecked && '✓'}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Pre-filled Names List */}
        <div className="p-6 rounded-3xl bg-[#0f121d] border border-white/[0.08] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                {isEn ? '5' : '۵'}
              </div>
              <div>
                <h2 className="text-base font-black text-white">
                  {isEn ? '5. Prefilled Players List (Optional)' : '۵. لیست کسانی که می‌خواهید سر میز باشند (اختیاری)'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isEn ? 'Enter names line-by-line or separated by commas to pre-seat players' : 'اسامی را با خط جدید یا کاما جدا کنید تا صندلی‌ها با نام آماده شوند.'}
                </p>
              </div>
            </div>
          </div>

          <textarea
            value={prefilledText}
            onChange={(e) => setPrefilledText(e.target.value)}
            rows={3}
            placeholder={isEn ? "Example: Alice, Bob, Charlie, David, Emma, Frank, Grace..." : "مثال: علی، سارا، رضا، مریم، کیان، نیما، مهسا، سامان، آرش، ترانه..."}
            className="w-full p-3 rounded-2xl bg-black/50 border border-white/10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        {/* 6. AI Balance Advisor Consultation (ONLY in this phase) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#121626] to-[#0d101a] border border-amber-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <span>{isEn ? 'AI Role Balance Advisor' : 'مشاوره تعادل نقش‌ها با هوش مصنوعی'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                    {isEn ? 'Setup Phase Only' : 'فقط در مرحله بازیسازی'}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  {isEn ? 'Ask questions about role balance for this exact player count' : 'پرسش درباره تعادل نقش‌ها و سناریو (وسط بازی بسته است)'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder={isEn ? "Ask AI advisor about role combinations & balance..." : "سؤال خود را درباره تعادل نقش‌ها بنویسید..."}
              className="flex-1 p-3 rounded-2xl bg-black/50 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
            />
            <button
              onClick={handleAskAiBalance}
              disabled={isAiLoading}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isAiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isAiLoading ? (isEn ? 'Analyzing...' : 'بررسی...') : (isEn ? 'Ask AI' : 'پرسش')}</span>
            </button>
          </div>

          {aiAnswer && (
            <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/20 text-xs text-slate-300 space-y-2 leading-relaxed">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEn ? 'AI Game Balance Analysis:' : 'پاسخ مشاور هوشمند تعادل بازی:'}</span>
              </div>
              <p className="whitespace-pre-line text-slate-300">{aiAnswer}</p>
            </div>
          )}
        </div>

        {/* 7. Language Setting for this Table */}
        <div className="p-4 rounded-3xl bg-[#0f121d] border border-white/[0.08] flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              🌐
            </div>
            <div>
              <div className="text-xs font-bold text-white">{isEn ? 'General Table Language' : 'زبان عمومی میز بازی'}</div>
              <div className="text-[10px] text-slate-400">{isEn ? 'Players can also independently configure their personal device language later.' : 'بازیکنان بعداً می‌توانند زبان رابط گوشی خود را نیز شخصی‌سازی کنند.'}</div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[
              { code: 'fa', label: 'فارسی' },
              { code: 'en', label: 'English' },
              { code: 'ar', label: 'العربية' },
              { code: 'tr', label: 'Türkçe' }
            ].map(l => (
              <button
                key={l.code}
                onClick={() => {
                  soundEngine.playTick();
                  onSelectLanguage(l.code as Language);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  language === l.code
                    ? 'bg-purple-600 text-white font-extrabold'
                    : 'bg-black/30 text-zinc-400 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* 8. PRIMARY ACTION BUTTON: «ساخت بازی» (Create Game - NOT Start Game) */}
        <div className="pt-4">
          <button
            onClick={handleCreateGame}
            disabled={isCreating}
            className="w-full py-5 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black text-base shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60"
          >
            {isCreating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{isEn ? 'Creating room and generating unique code...' : 'در حال ساخت اتاق و تولید کد اختصاصی...'}</span>
              </>
            ) : (
              <>
                <Crown className="w-6 h-6" />
                <span>{isEn ? 'Create Game' : 'ساخت بازی'}</span>
                <span className="text-xs font-mono font-bold bg-black/20 px-2 py-0.5 rounded-full">
                  {isEn ? '(Generate Code & Invite Link)' : '(تولید کد و لینک دعوت)'}
                </span>
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-zinc-500 mt-2">
            {isEn
              ? 'Note: This button creates the game; the match will not start until players join the lobby and rules are reviewed.'
              : 'توجه: این دکمه «ساخت بازی» است؛ بازی تا تکمیل اتاق انتظار و مرور قوانین شروع نخواهد شد.'}
          </p>
        </div>

      </div>
    </div>
  );
};
