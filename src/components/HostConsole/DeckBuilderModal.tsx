import React, { useState, useMemo } from 'react';
import { 
  Plus, Minus, X, Search, Sparkles, Shield, Skull, Crown, Users, Check, AlertCircle, 
  HelpCircle, Shuffle, ChevronRight, Layers, ArrowRight, HeartPulse, Target,
  VolumeX, Bomb, Landmark, Smile, Flame, Save, Bookmark, Edit3, CheckCircle2,
  Filter, Award, Stethoscope, Briefcase, Eye, Terminal, Zap, Wine, Moon, Activity
} from 'lucide-react';
import { RoleId, RoleAffiliation, DeckRoleItem, Scenario, Language } from '../../types/mafia';
import { translations, isRtlLanguage } from '../../utils/translations';
import { 
  ROLE_DEFINITIONS, 
  ROLE_SEARCH_ALIASES, 
  ROLE_BUNDLES, 
  saveCustomScenario,
  validateScenario,
  MULTI_INSTANCE_ROLE_IDS,
  balanceScenarioRoles
} from '../../utils/scenarios';
import { soundEngine } from '../../utils/audioSynth';

interface DeckBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDeck: (deck: DeckRoleItem[], scenarioName?: string) => void;
  initialDeck?: DeckRoleItem[];
  initialScenarioName?: string;
  language?: Language;
}

// Initial Default Deck: 1 Godfather, 1 Simple Mafia, 1 Doctor, 1 Detective, 2 Simple Citizens
const DEFAULT_STARTING_DECK: DeckRoleItem[] = [
  { id: 'def_1', roleId: 'GODFATHER' },
  { id: 'def_2', roleId: 'MAFIA_SIMPLE' },
  { id: 'def_3', roleId: 'DOCTOR' },
  { id: 'def_4', roleId: 'DETECTIVE' },
  { id: 'def_5', roleId: 'CITIZEN_SIMPLE' },
  { id: 'def_6', roleId: 'CITIZEN_SIMPLE' }
];

export const DeckBuilderModal: React.FC<DeckBuilderModalProps> = ({
  isOpen,
  onClose,
  onConfirmDeck,
  initialDeck,
  initialScenarioName,
  language = 'fa'
}) => {
  const activeLang = language || 'fa';
  const isEn = activeLang === 'en';
  const t = translations[activeLang] || translations.fa;
  const isRtl = isRtlLanguage(activeLang);
  const [deck, setDeck] = useState<DeckRoleItem[]>(() => {
    if (initialDeck && initialDeck.length > 0) return initialDeck;
    return DEFAULT_STARTING_DECK;
  });

  const [scenarioTitle, setScenarioTitle] = useState(initialScenarioName || (activeLang === 'fa' ? 'سناریوی شخصی' : 'Custom Scenario'));
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilterAffiliation, setRoleFilterAffiliation] = useState<'ALL' | 'CITIZEN' | 'MAFIA' | 'INDEPENDENT'>('ALL');
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [customRoleAffiliation, setCustomRoleAffiliation] = useState<RoleAffiliation>('CITIZEN');

  // Save Scenario Dialog State
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveScenarioName, setSaveScenarioName] = useState(initialScenarioName || (activeLang === 'fa' ? 'سناریوی جدید' : 'New Scenario'));
  const [saveScenarioDesc, setSaveScenarioDesc] = useState('');
  const [savePlayerCount, setSavePlayerCount] = useState<number>(deck.length);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Sync initial deck when modal is opened
  React.useEffect(() => {
    if (isOpen) {
      if (initialDeck && initialDeck.length > 0) {
        setDeck(initialDeck);
      }
      if (initialScenarioName) {
        setScenarioTitle(initialScenarioName);
      }
    }
  }, [isOpen, initialDeck, initialScenarioName]);

  // Counts Calculation
  const totalCount = deck.length;
  let mafiaCount = 0;
  let citizenCount = 0;
  let independentCount = 0;

  deck.forEach(item => {
    if (item.customAffiliation) {
      if (item.customAffiliation === 'MAFIA') mafiaCount++;
      else if (item.customAffiliation === 'CITIZEN') citizenCount++;
      else independentCount++;
    } else {
      const def = ROLE_DEFINITIONS[item.roleId];
      if (def?.affiliation === 'MAFIA') mafiaCount++;
      else if (def?.affiliation === 'INDEPENDENT') independentCount++;
      else citizenCount++;
    }
  });

  // Recommended Mafia Count: Math.floor(totalCount / 3)
  const recommendedMafia = Math.max(1, Math.floor(totalCount / 3));

  // Role Aggregation for Grouped View
  const groupedRoles = useMemo(() => {
    const map = new Map<string, { roleId: RoleId; customName?: string; customAffiliation?: RoleAffiliation; count: number; items: DeckRoleItem[] }>();
    deck.forEach(item => {
      const key = item.customName ? `custom_${item.customName}_${item.customAffiliation}` : item.roleId;
      if (!map.has(key)) {
        map.set(key, {
          roleId: item.roleId,
          customName: item.customName,
          customAffiliation: item.customAffiliation,
          count: 0,
          items: []
        });
      }
      const entry = map.get(key)!;
      entry.count += 1;
      entry.items.push(item);
    });
    return Array.from(map.values());
  }, [deck]);

  // Real-time Scenario Validation Engine
  const validation = useMemo(() => validateScenario(deck), [deck]);

  // One-click Auto-Fix & Balance: Resolves duplicates and balances mafia/citizen counts
  const handleAutoFixAndBalance = () => {
    soundEngine.playGong();
    const seenUnique = new Set<string>();
    const cleaned: DeckRoleItem[] = deck.map(item => {
      const isUnique = !MULTI_INSTANCE_ROLE_IDS.has(item.roleId);
      const identityKey = item.customName ? `CUSTOM:${item.customName}` : item.roleId;
      if (isUnique) {
        if (seenUnique.has(identityKey)) {
          const def = ROLE_DEFINITIONS[item.roleId];
          const aff = item.customAffiliation || def?.affiliation || 'CITIZEN';
          return {
            id: `card_fixed_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            roleId: (aff === 'MAFIA' ? 'MAFIA_SIMPLE' : 'CITIZEN_SIMPLE') as RoleId
          };
        }
        seenUnique.add(identityKey);
      }
      return item;
    });

    const targetCount = Math.max(6, cleaned.length);
    const balancedRoleIds = balanceScenarioRoles(cleaned.map(c => c.roleId), targetCount);
    const finalDeck: DeckRoleItem[] = balancedRoleIds.map((rId, idx) => ({
      id: `card_auto_${idx}_${Date.now()}`,
      roleId: rId
    }));
    setDeck(finalDeck);
  };

  // Remove one instance of role
  const handleDecrementRole = (groupKey: string) => {
    soundEngine.playTick();
    const itemIndex = deck.findIndex(item => {
      const key = item.customName ? `custom_${item.customName}_${item.customAffiliation}` : item.roleId;
      return key === groupKey;
    });
    if (itemIndex >= 0) {
      setDeck(prev => {
        const copy = [...prev];
        copy.splice(itemIndex, 1);
        return copy;
      });
    }
  };

  // Remove ALL instances of a role card with 'X'
  const handleRemoveAllInstances = (groupKey: string) => {
    soundEngine.playTick();
    setDeck(prev => prev.filter(item => {
      const key = item.customName ? `custom_${item.customName}_${item.customAffiliation}` : item.roleId;
      return key !== groupKey;
    }));
  };

  // Add standard role
  const handleAddRole = (roleId: RoleId) => {
    soundEngine.playTick();
    const newCard: DeckRoleItem = {
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      roleId
    };
    setDeck(prev => [...prev, newCard]);
  };

  // Add custom named role
  const handleAddCustomNamedRole = (name: string, affiliation: RoleAffiliation = 'CITIZEN') => {
    soundEngine.playTick();
    const newCard: DeckRoleItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      roleId: 'CUSTOM',
      customName: name.trim(),
      customAffiliation: affiliation
    };
    setDeck(prev => [...prev, newCard]);
    setSearchQuery('');
  };

  // Smart Search Matching using aliases & definitions
  const allAvailableRoleIds = Object.keys(ROLE_DEFINITIONS) as RoleId[];

  const filteredRoles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allAvailableRoleIds.filter(roleId => {
      const def = ROLE_DEFINITIONS[roleId];
      if (!def) return false;

      // Filter by affiliation if selected
      if (roleFilterAffiliation !== 'ALL' && def.affiliation !== roleFilterAffiliation) {
        return false;
      }

      if (!q) return true;

      // Match Role ID
      if (roleId.toLowerCase().includes(q)) return true;

      // Match Persian Name
      if (def.nameKey.toLowerCase().includes(q)) return true;

      // Match Description
      if (def.descriptionKey.toLowerCase().includes(q)) return true;

      // Match Search Aliases dictionary (e.g. "دن", "اسنایپر", "لئون", "ماتادور", "ساول", etc.)
      const aliases = ROLE_SEARCH_ALIASES[roleId] || [];
      if (aliases.some(alias => alias.toLowerCase().includes(q) || q.includes(alias.toLowerCase()))) {
        return true;
      }

      return false;
    });
  }, [searchQuery, roleFilterAffiliation, allAvailableRoleIds]);

  const isExactMatch = useMemo(() => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return filteredRoles.some(r => {
      const def = ROLE_DEFINITIONS[r];
      const aliases = ROLE_SEARCH_ALIASES[r] || [];
      return def?.nameKey.toLowerCase().includes(q) || aliases.some(a => a.toLowerCase() === q);
    });
  }, [searchQuery, filteredRoles]);

  const getRoleDisplayName = (card: { roleId: RoleId; customName?: string }) => {
    if (card.customName) return card.customName;
    const def = ROLE_DEFINITIONS[card.roleId];
    if (!def) return card.roleId;
    // Map Persian display names
    const names: Record<string, string> = {
      GODFATHER: 'پدرخوانده (دن / دن کورلئونه)',
      MAFIA_SIMPLE: 'مافیای ساده',
      DOCTOR_LECTER: 'دکتر لکتر',
      NATASHA: 'ناتاشا (سایلنسر)',
      TERRORIST: 'تروریست (انتحاری)',
      MATADOR: 'ماتادور (بلاکر شب)',
      SAUL_GOODMAN: 'ساول گودمن (خریدار و وکیل)',
      SHAH_KOSH: 'شاه‌کش (اسسین)',
      SWEETHEART: 'معشوقه (لیدی مافیا)',
      NEGOTIATOR: 'مذاکره‌کننده',
      NATO: 'ناتو (حدس نقش)',
      HOSTAGE_TAKER: 'گروگان‌گیر',
      POISONER: 'سم‌ساز',
      HACKER: 'هکر مافیا',
      CHURCHILL: 'چرچیل',
      DEXTER: 'دکستر (بلاکر)',
      LOBBYIST: 'لابی‌من',
      SPY: 'جاسوس مافیا',
      STRONG_MAN: 'مرد قوی مافیا',
      MAFIA_GANGSTER: 'گنگستر مافیا',
      CITIZEN_SIMPLE: 'شهروند ساده (رعیتی)',
      DOCTOR: 'دکتر شهر (پزشک)',
      DOCTOR_WATSON: 'دکتر واتسون',
      DETECTIVE: 'کارآگاه شهر',
      SNIPER: 'تک‌تیرانداز (اسنایپر / لئون)',
      ARMORED: 'شهروند زره‌پوش (رویین‌تن)',
      MAYOR: 'شهردار',
      PSYCHOLOGIST: 'روانشناس (روانپزشک)',
      DIE_HARD: 'جان‌سخت',
      GUNNER: 'تفنگدار',
      RANGER: 'تکاور (رنجر)',
      INQUISITOR: 'بازپرس شهر',
      CONSTANTINE: 'کنستانتین (احیاگر)',
      PRIEST: 'کشیش',
      JUDGE: 'قاضی',
      SACRIFICE: 'فدایی',
      CITIZEN_KANE: 'همشهری کین',
      GUARD: 'نگهبان / محافظ',
      JOURNALIST: 'خبرنگار',
      GUNSMITH: 'گان‌اسمیت (اسلحه‌ساز)',
      SCIENTIST: 'دانشمند',
      GRAVEDIGGER: 'گورکن',
      BRIDESMAID: 'ساقدوش',
      KNIGHT: 'شوالیه',
      HERO: 'قهرمان',
      COWBOY: 'کابوی',
      FREEMASON: 'فراماسون',
      BARTENDER: 'ساقی (ساغی)',
      THIEF: 'دست‌کج (دزد)',
      HUNTER: 'شکارچی',
      JOKER: 'جوکر (مستقل)',
      NOSTRADAMUS: 'نوستراداموس (پیشگو / مستقل)',
      ZODIAC: 'زودیاک (قاتل زنجیره‌ای / مستقل)',
      WEREWOLF: 'گرگینه (مستقل)',
      JACK_SPARROW: 'جک اسپارو (مستقل)',
      DENTIST: 'دنتیست (مستقل)',
      CUSTOM: 'نقش سفارشی'
    };
    return names[card.roleId] || def.nameKey || card.roleId;
  };

  const getRoleIcon = (roleId: RoleId) => {
    switch (roleId) {
      case 'GODFATHER': return '👑';
      case 'MAFIA_SIMPLE': return '💀';
      case 'DOCTOR_LECTER': return '💉';
      case 'MATADOR': return '🛡️';
      case 'SAUL_GOODMAN': return '💼';
      case 'NATASHA': return '🤐';
      case 'TERRORIST': return '💣';
      case 'SHAH_KOSH': return '🎯';
      case 'NEGOTIATOR': return '🤝';
      case 'NATO': return '🎯';
      case 'HOSTAGE_TAKER': return '🔒';
      case 'POISONER': return '🧪';
      case 'HACKER': return '💻';
      case 'SPY': return '👁️';
      case 'CITIZEN_SIMPLE': return '👤';
      case 'DOCTOR': return '🩺';
      case 'DOCTOR_WATSON': return '🩺';
      case 'DETECTIVE': return '🔍';
      case 'SNIPER': return '🎯';
      case 'ARMORED': return '🛡️';
      case 'MAYOR': return '🏛️';
      case 'PSYCHOLOGIST': return '🧠';
      case 'DIE_HARD': return '⚡';
      case 'GUNNER': return '🔫';
      case 'RANGER': return '🎖️';
      case 'INQUISITOR': return '⚖️';
      case 'CONSTANTINE': return '✨';
      case 'PRIEST': return '📖';
      case 'JUDGE': return '⚖️';
      case 'SACRIFICE': return '🤝';
      case 'CITIZEN_KANE': return '📰';
      case 'GUARD': return '🛡️';
      case 'JOURNALIST': return '📝';
      case 'GUNSMITH': return '🔧';
      case 'SCIENTIST': return '🔬';
      case 'GRAVEDIGGER': return '⚰️';
      case 'BARTENDER': return '🍷';
      case 'THIEF': return '✂️';
      case 'HUNTER': return '🏹';
      case 'JOKER': return '🃏';
      case 'NOSTRADAMUS': return '🔮';
      case 'ZODIAC': return '☠️';
      case 'WEREWOLF': return '🐺';
      case 'DENTIST': return '🦷';
      default: return '🎭';
    }
  };

  // Handle Save Scenario to localStorage
  const handleSaveScenarioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveScenarioName.trim()) return;

    if (!validation.isValid) {
      soundEngine.playGunshot();
      alert(activeLang === 'fa' ? `امکان ذخیره سناریو به دلیل وجود خطای اعتبارسنجی وجود ندارد:\n${validation.errors.join('\n')}` : `Cannot save scenario due to validation errors:\n${validation.errors.join('\n')}`);
      return;
    }

    const roleIds: RoleId[] = deck.map(d => d.roleId);
    const newScenario: Scenario = {
      id: `custom_${Date.now()}`,
      name: saveScenarioName.trim(),
      description: saveScenarioDesc.trim() || (activeLang === 'fa' ? `${deck.length} بازیکن شامل ${mafiaCount} مافیا و ${citizenCount} شهروند` : `${deck.length} players (${mafiaCount} mafia, ${citizenCount} citizen)`),
      recommendedPlayerCount: savePlayerCount || deck.length,
      roles: roleIds,
      isCustom: true,
      tag: activeLang === 'fa' ? 'سفارشی' : 'Custom',
      difficulty: activeLang === 'fa' ? 'متوسط' : 'Medium'
    };

    saveCustomScenario(newScenario);
    soundEngine.playGong();
    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
      setIsSaveDialogOpen(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`bg-[#0e0e13] border border-white/20 rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[96vh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden ${isRtl ? 'text-right' : 'text-left'}`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        
        {/* Header */}
        <div className="p-2.5 sm:p-4 bg-[#161622] border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-black text-white flex items-center gap-1.5 truncate">
                <span>{t.deckEditorTitle || "چینش کارت‌های سناریو"}</span>
                <span className="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  {t.scenarioCardsCount ? t.scenarioCardsCount.replace("{count}", String(totalCount)) : `${totalCount} Cards`}
                </span>
              </h2>
              <p className="hidden sm:block text-xs text-slate-400 mt-0.5">
                {t.deckBuilderSubheader || "کم و زیاد کردن نقش‌ها، تنظیم تعادل و ذخیره به عنوان سناریوی جدید"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Save as New Scenario Button */}
            <button
              onClick={() => {
                setSaveScenarioName(scenarioTitle || 'سناریوی جدید');
                setSavePlayerCount(deck.length);
                setIsSaveDialogOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-lg sm:rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 text-[11px] sm:text-xs font-black transition-all cursor-pointer shadow-sm"
              title={t.saveScenarioTooltip || (isEn ? "Save Scenario" : "ذخیره سناریو")}
            >
              <Save className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden sm:inline">{t.saveScenario || (isEn ? "Save Scenario" : "ذخیره سناریو")}</span>
              <span className="sm:hidden">{t.save || (isEn ? "Save" : "ذخیره")}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Live Balance Dashboard */}
        <div className="p-2 sm:p-3 bg-[#12121a] border-b border-white/10 grid grid-cols-4 gap-1.5 sm:gap-2.5">
          {/* Total Players */}
          <div className="p-1.5 sm:p-2.5 rounded-xl bg-black/40 border border-white/5 flex sm:flex-row flex-col items-center justify-center sm:justify-start gap-1 sm:gap-2.5 text-center sm:text-right">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-black text-xs shrink-0">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-[11px] text-slate-400 font-bold truncate">{t.totalPlayersShort || "کل نفرات"}</div>
              <div className="text-xs sm:text-sm font-black text-white">{totalCount}</div>
            </div>
          </div>

          {/* Mafia Count */}
          <div className={`p-1.5 sm:p-2.5 rounded-xl bg-black/40 border flex sm:flex-row flex-col items-center justify-center sm:justify-start gap-1 sm:gap-2.5 text-center sm:text-right ${
            mafiaCount === recommendedMafia ? 'border-rose-500/40' : 'border-rose-500/20'
          }`}>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center font-black text-xs shrink-0">
              <Skull className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-[11px] text-slate-400 font-bold truncate">{t.mafiaTeamShort || "مافیا"}</div>
              <div className="text-xs sm:text-sm font-black text-rose-400">{mafiaCount}</div>
            </div>
          </div>

          {/* Citizen Count */}
          <div className="p-1.5 sm:p-2.5 rounded-xl bg-black/40 border border-emerald-500/20 flex sm:flex-row flex-col items-center justify-center sm:justify-start gap-1 sm:gap-2.5 text-center sm:text-right">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-[11px] text-slate-400 font-bold truncate">{t.citizenTeamShort || "شهروند"}</div>
              <div className="text-xs sm:text-sm font-black text-emerald-400">{citizenCount}</div>
            </div>
          </div>

          {/* Independent Count */}
          <div className="p-1.5 sm:p-2.5 rounded-xl bg-black/40 border border-amber-500/20 flex sm:flex-row flex-col items-center justify-center sm:justify-start gap-1 sm:gap-2.5 text-center sm:text-right">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-xs shrink-0">
              <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-[11px] text-slate-400 font-bold truncate">{t.independentShort || "مستقل"}</div>
              <div className="text-xs sm:text-sm font-black text-amber-400">{independentCount}</div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-5 space-y-4">
          
          {/* Live Validation Alert / Auto-Balance Banner */}
          {!validation.isValid ? (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 shadow-lg space-y-2.5 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-rose-300 font-black text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>خطاهای ناسازگاری در چینش نقش‌ها ({validation.errors.length} خطا)</span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFixAndBalance}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>اصلاح خودکار ناسازگاری‌ها و تعادل</span>
                </button>
              </div>
              <ul className="text-xs text-rose-200/90 list-disc list-inside space-y-1">
                {validation.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          ) : validation.warnings.length > 0 ? (
            <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200/90">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-amber-300">نکات بهینه‌سازی سناریو:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/80">
                  {validation.warnings.map((warn, idx) => (
                    <li key={idx}>{warn}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold">تعادل سناریو تأیید شد: نسبت مافیا به شهروند استاندارد است و نقش تکراری نامعتبر وجود ندارد.</span>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-mono">100% Balanced</span>
            </div>
          )}

          {/* Deck Cards List with Increment / Decrement / Remove */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span>{t.cardsInDeck || "کارت‌های موجود در دسته سناریو"}</span>
                  <span className="text-xs text-slate-400">{t.roleTypesCount ? t.roleTypesCount.replace("{count}", String(groupedRoles.length)) : `(${groupedRoles.length} roles)`}</span>
                </h3>
              </div>

              {/* Add Role Button */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsAddRoleModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addNewCardToDeck || "افزودن کارت جدید به دسته"}</span>
              </button>
            </div>

            {deck.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-black/30 border border-dashed border-white/10 space-y-3">
                <Layers className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="text-sm font-bold text-slate-300">{t.emptyDeckTitle || "دسته کارت‌ها خالی است"}</div>
                <p className="text-xs text-slate-500">{t.emptyDeckDesc || "برای شروع چیدمان سناریو، روی دکمه افزودن کارت جدید کلیک کنید."}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupedRoles.map(group => {
                  const groupKey = group.customName ? `custom_${group.customName}_${group.customAffiliation}` : group.roleId;
                  const def = ROLE_DEFINITIONS[group.roleId];
                  const affiliation = group.customAffiliation || def?.affiliation || 'CITIZEN';

                  const badgeBorder = affiliation === 'MAFIA' 
                    ? 'border-rose-500/40 bg-rose-950/30' 
                    : affiliation === 'INDEPENDENT' 
                    ? 'border-amber-500/40 bg-amber-950/30' 
                    : 'border-emerald-500/40 bg-emerald-950/30';

                  const teamColorText = affiliation === 'MAFIA'
                    ? 'text-rose-400'
                    : affiliation === 'INDEPENDENT'
                    ? 'text-amber-400'
                    : 'text-emerald-400';

                  return (
                    <div
                      key={groupKey}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-md transition-all ${badgeBorder}`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-2xl p-1 rounded-xl bg-black/40 border border-white/5">
                          {getRoleIcon(group.roleId)}
                        </span>
                        <div className="truncate">
                          <div className="text-xs font-black text-white truncate">
                            {getRoleDisplayName({ roleId: group.roleId, customName: group.customName })}
                          </div>
                          <div className={`text-[10px] font-bold ${teamColorText}`}>
                            {affiliation === 'MAFIA' ? (t.mafiaTeamShort || 'تیم مافیا') : affiliation === 'INDEPENDENT' ? (t.independentShort || 'مستقل') : (t.citizenTeamShort || 'تیم شهروند')}
                          </div>
                        </div>
                      </div>

                      {/* Controls: [-] Count [+] [X] */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Decrement Button */}
                        <button
                          onClick={() => handleDecrementRole(groupKey)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                          title={t.decreaseOneCard || "-1"}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        {/* Quantity Badge */}
                        <span className="w-7 text-center text-xs font-black text-amber-300">
                          {group.count}
                        </span>

                        {/* Increment Button */}
                        <button
                          onClick={() => handleAddRole(group.roleId)}
                          className="w-7 h-7 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black flex items-center justify-center transition-all cursor-pointer font-bold"
                          title={t.increaseOneCard || "+1"}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        {/* Remove All Instances (X) */}
                        <button
                          onClick={() => handleRemoveAllInstances(groupKey)}
                          className="w-7 h-7 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white flex items-center justify-center transition-all cursor-pointer mr-1"
                          title={t.removeRoleFromDeck || "Remove"}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Predefined Counterpart Bundles */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t.roleBundlesTitle || "دسته‌های نقش‌های متقابل و دوئل‌های پیشنهادی"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {ROLE_BUNDLES.map(bundle => (
                <div 
                  key={bundle.id}
                  className="p-3.5 rounded-2xl bg-[#14141c] border border-white/10 space-y-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-200">{bundle.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                        {bundle.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug mt-1">{bundle.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {bundle.roles.map(r => (
                      <button
                        key={r}
                        onClick={() => handleAddRole(r)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-bold text-white transition-all cursor-pointer"
                      >
                        <span>{getRoleIcon(r)}</span>
                        <span className="truncate">{getRoleDisplayName({ roleId: r })}</span>
                        <Plus className="w-3 h-3 text-amber-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Confirmation */}
        <div className="p-2.5 sm:p-4 bg-[#15151c] border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] sm:text-xs text-slate-400">
            {t.totalPlayersShort || "مجموع"}: <strong className="text-white font-black">{totalCount}</strong> <span className="hidden sm:inline">({mafiaCount} {t.mafiaTeamShort || "مافیا"} • {citizenCount} {t.citizenTeamShort || "شهر"} • {independentCount} {t.independentShort || "مستقل"})</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
            >
              {t.cancelBtn || "Cancel"}
            </button>
            <button
              disabled={deck.length < 5 || !validation.isValid}
              onClick={() => {
                if (!validation.isValid) {
                  soundEngine.playGunshot();
                  return;
                }
                soundEngine.playGong();
                onConfirmDeck(deck, scenarioTitle);
                onClose();
              }}
              title={!validation.isValid ? (validation.errors[0] || 'خطای اعتبارسنجی در چینش سناریو') : ''}
              className="flex items-center gap-1.5 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-extrabold text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <span>{t.applyAndConfirmDeck || "تایید و اعمال"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Role Picker & Search Modal (Smart Search with 50+ Roles & Aliases) */}
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className={`bg-[#121218] border border-white/20 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? "rtl" : "ltr"}>
            
            {/* Modal Header & Search Bar */}
            <div className="p-5 bg-[#181822] border-b border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-400" />
                  <span>{t.fullRoleBankSearch || "بانک کامل نقش‌ها (جستجو و انتخاب)"}</span>
                </h3>
                <button 
                  onClick={() => setIsAddRoleModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t.searchRolePlaceholder || "جستجوی نام نقش..."}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              {/* Affiliation Filter Chips */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setRoleFilterAffiliation('ALL')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                    roleFilterAffiliation === 'ALL' ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  {t.allRolesFilter || "همه نقش‌ها"} ({allAvailableRoleIds.length})
                </button>
                <button
                  onClick={() => setRoleFilterAffiliation('CITIZEN')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                    roleFilterAffiliation === 'CITIZEN' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  {t.citizensFilter || "شهروندان"}
                </button>
                <button
                  onClick={() => setRoleFilterAffiliation('MAFIA')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                    roleFilterAffiliation === 'MAFIA' ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  {t.mafiaFilter || "تیم مافیا"}
                </button>
                <button
                  onClick={() => setRoleFilterAffiliation('INDEPENDENT')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                    roleFilterAffiliation === 'INDEPENDENT' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  {t.independentFilter || "مستقل"}
                </button>
              </div>
            </div>

            {/* List of Roles */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              
              {/* If search query has no match, suggest custom role creation */}
              {searchQuery.trim().length > 0 && !isExactMatch && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{t.addCustomRolePrompt ? t.addCustomRolePrompt.replace("{name}", searchQuery.trim()) : `Add role "${searchQuery.trim()}"?`}</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-400">{t.affiliationLabel || "ساید:"}</span>
                    <button
                      onClick={() => setCustomRoleAffiliation('CITIZEN')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                        customRoleAffiliation === 'CITIZEN' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-white/5 text-slate-400 border-white/10'
                      }`}
                    >
                      {t.citizensFilter || (isEn ? "Citizen" : "شهروند")}
                    </button>
                    <button
                      onClick={() => setCustomRoleAffiliation('MAFIA')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                        customRoleAffiliation === 'MAFIA' ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' : 'bg-white/5 text-slate-400 border-white/10'
                      }`}
                    >
                      {t.mafiaFilter || (isEn ? "Mafia" : "مافیا")}
                    </button>
                    <button
                      onClick={() => setCustomRoleAffiliation('INDEPENDENT')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                        customRoleAffiliation === 'INDEPENDENT' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-white/5 text-slate-400 border-white/10'
                      }`}
                    >
                      {t.independentFilter || (isEn ? "Independent" : "مستقل")}
                    </button>

                    <button
                      onClick={() => handleAddCustomNamedRole(searchQuery.trim(), customRoleAffiliation)}
                      className="mr-auto px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.addNewCardToDeck || "Add Card"} «{searchQuery.trim()}»</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Standard Roles List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredRoles.map(roleId => {
                  const def = ROLE_DEFINITIONS[roleId];
                  const countInDeck = deck.filter(c => c.roleId === roleId).length;
                  return (
                    <div 
                      key={roleId}
                      className="p-3 rounded-2xl bg-[#171720] border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-2xl">{getRoleIcon(roleId)}</span>
                        <div className="truncate">
                          <div className="text-xs font-black text-white truncate">{getRoleDisplayName({ roleId })}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">
                            {def?.affiliation === 'MAFIA' ? ('🔴 ' + (t.mafiaTeamShort || 'Mafia')) : def?.affiliation === 'INDEPENDENT' ? ('🟡 ' + (t.independentShort || 'Independent')) : ('🟢 ' + (t.citizenTeamShort || 'Citizen'))} • {def?.descriptionKey}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {countInDeck > 0 && (
                          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-white/10 text-amber-400 border border-amber-500/30">
                            {countInDeck} {t.cardsInDeck ? "" : "in deck"}
                          </span>
                        )}
                        <button
                          onClick={() => handleAddRole(roleId)}
                          className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black flex items-center justify-center transition-all shadow-sm cursor-pointer"
                          title={t.addNewCardToDeck || "Add Card"}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Bottom Modal Bar */}
            <div className="p-4 bg-[#181822] border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {t.totalPlayersShort || "Total"}: <strong className="text-white font-bold">{deck.length}</strong>
              </span>
              <button
                onClick={() => setIsAddRoleModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {t.close || (isEn ? "Close" : "بستن پنجره انتخاب")}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Save Scenario Dialog Modal */}
      {isSaveDialogOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#14141c] border border-white/20 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-right" dir={isRtl ? "rtl" : "ltr"}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Save className="w-5 h-5 text-amber-400" />
                <span>{t.saveScenarioTitle || (isEn ? "Save Scenario" : "ذخیره سناریو")}</span>
              </h3>
              <button 
                onClick={() => setIsSaveDialogOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{t.scenarioSavedSuccess || (isEn ? "Scenario saved successfully!" : "سناریو ذخیره شد!")}</span>
              </div>
            ) : (
              <form onSubmit={handleSaveScenarioSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">{t.scenarioNameLabel || (isEn ? "Scenario Name" : "نام سناریو")}</label>
                  <input
                    type="text"
                    value={saveScenarioName}
                    onChange={e => setSaveScenarioName(e.target.value)}
                    placeholder={activeLang === "fa" ? "مثلاً: سناریوی کافه شب، لیگ قهرمانان..." : "e.g. Cafe Night, Champions League..."}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">{t.scenarioPlayerCountLabel || (isEn ? "Recommended Player Count" : "تعداد نفرات پیشنهادی")}</label>
                  <input
                    type="number"
                    min={3}
                    max={30}
                    value={savePlayerCount}
                    onChange={e => setSavePlayerCount(parseInt(e.target.value) || deck.length)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">{t.scenarioDescLabel || (isEn ? "Scenario Description" : "توضیحات سناریو")}</label>
                  <textarea
                    rows={2}
                    value={saveScenarioDesc}
                    onChange={e => setSaveScenarioDesc(e.target.value)}
                    placeholder={activeLang === "fa" ? "ترکیب نقش‌های مافیا و شهروند یا قوانین خاص..." : "Role breakdown or special rules..."}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300">
                  {activeLang === "fa" ? `این سناریو شامل ${deck.length} کارت (${mafiaCount} مافیا، ${citizenCount} شهروند، ${independentCount} مستقل) است.` : `This scenario includes ${deck.length} cards (${mafiaCount} mafia, ${citizenCount} citizen, ${independentCount} independent).`}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSaveDialogOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    {t.cancel || (isEn ? "Cancel" : "انصراف")}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    {t.saveScenario || (isEn ? "Save Scenario" : "ذخیره دائمی سناریو")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
