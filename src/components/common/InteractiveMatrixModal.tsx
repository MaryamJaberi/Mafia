import React, { useState, useMemo } from 'react';
import { 
  X, Search, Sparkles, BookOpen, Layers, Shield, HelpCircle, 
  CheckCircle2, Info, ChevronRight, Award, Flame, Zap, ArrowUpRight
} from 'lucide-react';
import { 
  MATRIX_SCENARIOS, GENERAL_ROLES, LAST_MOVE_CARDS, GENERAL_RULES, 
  OTHER_SCENARIOS, MatrixScenario, GeneralRole, OtherScenario,
  buildSearchIndex, pair, SearchIndexItem, getAllMatrixScenarios,
  deleteCustomMatrixScenario
} from '../../data/matrixData';
import { 
  getLocalizedMatrixScenarios, getLocalizedCellDetail,
  getLocalizedGeneralRoles, getLocalizedLastMoveCards,
  getLocalizedGeneralRules, getLocalizedOtherScenarios
} from '../../utils/matrixLocalization';
import { Language } from '../../types/mafia';
import { soundEngine } from '../../utils/audioSynth';

interface InteractiveMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  initialScenarioId?: string;
  onApplyScenario?: (scenarioId: string) => void;
  onOpenDeckEditorWithScenario?: (scenario: any) => void;
  onAddRoleToDeck?: (roleNameOrId: string) => void;
  onOpenRoleGuide?: (roleId?: string) => void;
}

export const InteractiveMatrixModal: React.FC<InteractiveMatrixModalProps> = ({
  isOpen,
  onClose,
  language,
  initialScenarioId,
  onApplyScenario,
  onOpenDeckEditorWithScenario,
  onAddRoleToDeck,
  onOpenRoleGuide
}) => {
  const [currentTab, setCurrentTab] = useState<string>(initialScenarioId || 'classic');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pickerRoleA, setPickerRoleA] = useState('');
  const [pickerRoleB, setPickerRoleB] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  
  // Selected Detail Modal state
  const [activeDetail, setActiveDetail] = useState<{
    scenarioName: string;
    roleA: string;
    roleB?: string | null;
    isDiag: boolean;
    text: string;
    badgeType: 'SELF' | 'RULE' | 'NONE';
  } | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const allScenarios = useMemo(() => getLocalizedMatrixScenarios(language), [language, refreshKey]);
  const currentScenario = allScenarios.find(s => s.id === currentTab) || allScenarios[0];
  const generalRoles = useMemo(() => getLocalizedGeneralRoles(language), [language]);
  const lastMoveCards = useMemo(() => getLocalizedLastMoveCards(language), [language]);
  const generalRules = useMemo(() => getLocalizedGeneralRules(language), [language]);
  const otherScenarios = useMemo(() => getLocalizedOtherScenarios(language), [language]);

  const searchIndex = useMemo(() => buildSearchIndex(), [refreshKey]);

  // Filtered search results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return searchIndex.filter(item => {
      const hay = `${item.roleA} ${item.roleB || ''} ${item.text}`.toLowerCase();
      return hay.includes(q);
    }).slice(0, 35);
  }, [searchQuery, searchIndex]);

  if (!isOpen) return null;

  const handleCellClick = (scenario: MatrixScenario, roleAId: string, roleBId: string) => {
    soundEngine.playTick();
    const ra = scenario.roles.find(r => r.id === roleAId);
    const rb = scenario.roles.find(r => r.id === roleBId);
    const key = pair(roleAId, roleBId);
    const text = scenario.cellMap?.[key] || '';
    const isDiag = roleAId === roleBId;
    const hasText = Boolean(text && text.trim());
    const localizedDetailText = getLocalizedCellDetail(scenario, roleAId, roleBId, text, language);

    setActiveDetail({
      scenarioName: scenario.name,
      roleA: ra?.n || roleAId,
      roleB: isDiag ? null : rb?.n || roleBId,
      isDiag,
      text: localizedDetailText,
      badgeType: isDiag ? 'SELF' : hasText ? 'RULE' : 'NONE'
    });
  };

  const handleGeneralRoleClick = (role: GeneralRole) => {
    soundEngine.playTick();
    const generalHeader = language === 'en' ? 'General & Universal Roles' : language === 'ar' ? 'الأدوار العامة' : language === 'tr' ? 'Genel Rol Rehberi' : 'نقش‌های عمومی و فرا-سناریویی';
    const noteLabel = language === 'en' ? 'Tactical Interaction:' : language === 'ar' ? 'ملاحظات التفاعل:' : language === 'tr' ? 'Taktiksel Etkileşim:' : 'نکتهٔ تلاقی و تعامل:';
    setActiveDetail({
      scenarioName: generalHeader,
      roleA: role.n,
      roleB: null,
      isDiag: true,
      text: `${role.d}\n\n**${noteLabel}**\n${role.ex}`,
      badgeType: 'SELF'
    });
  };

  const handleOtherScenarioClick = (scen: OtherScenario) => {
    soundEngine.playTick();
    const otherHeader = language === 'en' ? 'Other Werewolf / Mafia Scenarios' : language === 'ar' ? 'سيناريوهات أخرى' : language === 'tr' ? 'Diğer Senaryolar' : 'سایر سناریوهای مرجع گرگینه';
    const noteLabel = language === 'en' ? 'Technical Note:' : language === 'ar' ? 'ملاحظات تقنية:' : language === 'tr' ? 'Teknik Not:' : 'یادداشت فنی:';
    setActiveDetail({
      scenarioName: otherHeader,
      roleA: scen.n,
      roleB: null,
      isDiag: true,
      text: `${scen.d}${scen.ex ? `\n\n**${noteLabel}**\n${scen.ex}` : ''}`,
      badgeType: 'RULE'
    });
  };

  const handleSelectSearchResult = (item: SearchIndexItem) => {
    soundEngine.playTick();
    setSearchQuery('');
    setIsSearchOpen(false);

    if (item.genRef) {
      setCurrentTab('general');
      handleGeneralRoleClick(item.genRef);
    } else if (item.otherRef) {
      setCurrentTab('other');
      handleOtherScenarioClick(item.otherRef);
    } else {
      setCurrentTab(item.scenario);
      const scen = MATRIX_SCENARIOS.find(s => s.id === item.scenario);
      if (scen && item.a && item.b) {
        handleCellClick(scen, item.a, item.b);
      }
    }
  };

  // Helper to format bold text and paragraphs
  const formatDetailContent = (content: string) => {
    return content.split('\n\n').map((paragraph, pIdx) => {
      const lines = paragraph.split('\n');
      return (
        <p key={pIdx} className="mb-3.5 leading-relaxed text-slate-200 text-sm">
          {lines.map((line, lIdx) => {
            // parse **bold**
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
              <React.Fragment key={lIdx}>
                {parts.map((part, i) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <strong key={i} className="text-amber-400 font-bold">
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  return part;
                })}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            );
          })}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-6xl h-[96vh] sm:h-[92vh] max-h-[920px] bg-[#0c0c14] border border-amber-500/30 rounded-2xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex-shrink-0 p-2.5 sm:p-4 border-b border-white/10 bg-[#12121d] flex flex-col gap-2 sm:gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-base font-black text-amber-400 tracking-wide flex items-center gap-1.5 truncate">
                  <span>جدول تعاملی نقش‌های مافیا</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shrink-0">
                    ۱۷ سناریو
                  </span>
                </h2>
                <p className="hidden sm:block text-xs text-slate-400">
                  میز خدا — مرجع کامل تلاقی نقش‌ها، اولویت‌ها و استعلام‌های رسمی
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playTick();
                onClose();
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Search Box with Realtime Dropdown */}
          <div className="relative w-full">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="جستجوی سریع: اسم نقش، فایربک، حس ششم، سیو..."
                className="w-full bg-[#181828] border border-amber-500/20 focus:border-amber-500 rounded-full py-1.5 sm:py-2.5 pr-9 sm:pr-11 pl-8 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all shadow-inner"
              />
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {isSearchOpen && searchQuery.trim() && (
              <div className="absolute top-full right-0 left-0 mt-2 max-h-80 overflow-y-auto bg-[#141422] border border-amber-500/40 rounded-2xl shadow-2xl z-50 divide-y divide-white/5">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    موردی برای «{searchQuery}» یافت نشد. کلمه دیگری را امتحان کنید.
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-2 text-[11px] font-bold text-amber-400/80 bg-[#18182c]">
                      {searchResults.length} نتیجه یافت شد
                    </div>
                    {searchResults.map((m, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSearchResult(m)}
                        className="p-3 hover:bg-white/5 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-1">
                          <span>{m.scenarioName}</span>
                          <span className="text-slate-400 text-[11px] font-medium group-hover:text-amber-300 flex items-center gap-1">
                            مشاهده <ArrowUpRight className="w-3 h-3" />
                          </span>
                        </div>
                        <div className="text-sm font-black text-slate-200 mb-1">
                          {m.roleB ? `${m.roleA} × ${m.roleB}` : m.roleA}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {allScenarios.map((scen) => {
              const isCustom = !MATRIX_SCENARIOS.some(s => s.id === scen.id);
              return (
                <button
                  key={scen.id}
                  onClick={() => {
                    soundEngine.playTick();
                    setCurrentTab(scen.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentTab === scen.id
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/20 font-black'
                      : 'bg-[#181828] text-slate-400 hover:text-slate-200 hover:bg-[#202035] border border-white/5'
                  }`}
                >
                  {isCustom && <Sparkles className="w-3 h-3 text-amber-300" />}
                  <span>{scen.name}</span>
                  {isCustom && (
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`آیا سناریوی اختصاصی «${scen.name}» حذف شود؟`)) {
                          deleteCustomMatrixScenario(scen.id);
                          setRefreshKey(k => k + 1);
                          setCurrentTab('classic');
                        }
                      }}
                      className="ml-1 text-[10px] hover:text-rose-400 px-1 py-0.5 rounded bg-black/40"
                      title="حذف سناریو اختصاصی"
                    >
                      ×
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => {
                soundEngine.playTick();
                setCurrentTab('general');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                currentTab === 'general'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/20 font-black'
                  : 'bg-[#181828] text-slate-400 hover:text-slate-200 hover:bg-[#202035] border border-white/5'
              }`}
            >
              نقش‌های عمومی
            </button>

            <button
              onClick={() => {
                soundEngine.playTick();
                setCurrentTab('cards');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                currentTab === 'cards'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/20 font-black'
                  : 'bg-[#181828] text-slate-400 hover:text-slate-200 hover:bg-[#202035] border border-white/5'
              }`}
            >
              کارت‌های حرکت آخر
            </button>

            <button
              onClick={() => {
                soundEngine.playTick();
                setCurrentTab('rules');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                currentTab === 'rules'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/20 font-black'
                  : 'bg-[#181828] text-slate-400 hover:text-slate-200 hover:bg-[#202035] border border-white/5'
              }`}
            >
              قوانین عمومی میز
            </button>

            <button
              onClick={() => {
                soundEngine.playTick();
                setCurrentTab('other');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                currentTab === 'other'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/20 font-black'
                  : 'bg-[#181828] text-slate-400 hover:text-slate-200 hover:bg-[#202035] border border-white/5'
              }`}
            >
              سایر سناریوهای گرگینه
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-5 space-y-3 sm:space-y-4">
          
          {/* MATRIX SCENARIO VIEW */}
          {currentScenario && (
            <div className="space-y-2.5 sm:space-y-3">
              
              {/* Scenario Meta Card */}
              <div className="bg-[#12121e] border border-amber-500/20 rounded-xl p-2.5 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-amber-400">{currentScenario.name}</h3>
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-amber-500/10 text-amber-300 rounded-full border border-amber-500/20 font-bold">
                      ظرفیت: {currentScenario.players}
                    </span>
                  </div>

                  {/* Direct Action Buttons for Scenario */}
                  <div className="flex items-center gap-2 flex-wrap mr-auto">
                    {onApplyScenario && (
                      <button
                        onClick={() => {
                          soundEngine.playGong();
                          onApplyScenario(currentScenario.id);
                          setActionFeedback(`سناریوی «${currentScenario.name}» بر روی بازی اعمال شد.`);
                          setTimeout(() => setActionFeedback(null), 2500);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-md shadow-amber-500/25 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>انتخاب و اعمال این سناریو بر بازی</span>
                      </button>
                    )}

                    {onOpenDeckEditorWithScenario && (
                      <button
                        onClick={() => {
                          soundEngine.playTick();
                          onOpenDeckEditorWithScenario(currentScenario);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>ویرایش در دک‌ساز</span>
                      </button>
                    )}
                  </div>
                </div>

                {actionFeedback && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{actionFeedback}</span>
                  </div>
                )}
                
                {currentScenario.warn && (
                  <div className="mt-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] sm:text-xs leading-relaxed">
                    ⚠️ {currentScenario.warn}
                  </div>
                )}

                {currentScenario.notes && (
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {currentScenario.notes}
                  </p>
                )}
              </div>

              {/* Quick Role Picker & Stepper */}
              <div className="bg-[#141424] border border-amber-500/20 rounded-xl p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <Search className="w-3 h-3 text-amber-400" />
                    جستجوی سریع تلاقی:
                  </span>
                  <select
                    value={pickerRoleA}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPickerRoleA(val);
                      if (val) {
                        handleCellClick(currentScenario, val, pickerRoleB || val);
                      }
                    }}
                    className="bg-[#1b1b2d] border border-amber-500/30 text-slate-100 text-xs rounded-lg px-2.5 py-1 outline-none focus:border-amber-400 transition-colors"
                  >
                    <option value="">نقش اول...</option>
                    {currentScenario.roles.map(r => (
                      <option key={r.id} value={r.id}>{r.n}</option>
                    ))}
                  </select>
                  <span className="text-slate-500 text-xs font-black">×</span>
                  <select
                    value={pickerRoleB}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPickerRoleB(val);
                      if (pickerRoleA && val) {
                        handleCellClick(currentScenario, pickerRoleA, val);
                      }
                    }}
                    className="bg-[#1b1b2d] border border-amber-500/30 text-slate-100 text-xs rounded-lg px-2.5 py-1 outline-none focus:border-amber-400 transition-colors"
                  >
                    <option value="">نقش دوم (یا خالی)...</option>
                    {currentScenario.roles.map(r => (
                      <option key={r.id} value={r.id}>{r.n}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 mr-auto">
                  <button
                    onClick={() => {
                      const scenIdx = allScenarios.findIndex(s => s.id === currentScenario.id);
                      if (scenIdx > 0) {
                        soundEngine.playTick();
                        setCurrentTab(allScenarios[scenIdx - 1].id);
                        setPickerRoleA('');
                        setPickerRoleB('');
                      }
                    }}
                    disabled={allScenarios.findIndex(s => s.id === currentScenario.id) <= 0}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold transition-all"
                  >
                    ‹ سناریوی قبلی
                  </button>
                  <button
                    onClick={() => {
                      const scenIdx = allScenarios.findIndex(s => s.id === currentScenario.id);
                      if (scenIdx >= 0 && scenIdx < allScenarios.length - 1) {
                        soundEngine.playTick();
                        setCurrentTab(allScenarios[scenIdx + 1].id);
                        setPickerRoleA('');
                        setPickerRoleB('');
                      }
                    }}
                    disabled={allScenarios.findIndex(s => s.id === currentScenario.id) >= allScenarios.length - 1}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold transition-all"
                  >
                    سناریوی بعدی ›
                  </button>
                </div>
              </div>

              {/* Matrix Legend */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] text-slate-400 px-1">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(201,168,76,0.8)]" />
                  توضیح نقش
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  تلاقی خاص
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  بی‌اثر
                </span>
                <span className="text-amber-400/80 mr-auto text-[10px] hidden xs:inline">
                  💡 کلیک روی هر خانه برای مشاهده متن قانون
                </span>
              </div>

              {/* The Matrix Table */}
              <div className="border border-white/10 rounded-xl overflow-x-auto bg-[#10101a] shadow-inner max-h-[58vh] sm:max-h-[62vh]">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="sticky top-0 right-0 z-30 bg-[#161626] border-b border-l border-white/10 p-2 sm:p-3 min-w-[75px] sm:min-w-[100px] text-amber-400 font-bold text-[11px] sm:text-xs">
                        نقش‌ها
                      </th>
                      {currentScenario.roles.map((r) => (
                        <th
                          key={r.id}
                          className="sticky top-0 z-20 bg-[#161626] border-b border-l border-white/10 p-1.5 sm:p-2.5 text-center font-bold text-amber-300 min-w-[70px] sm:min-w-[90px] max-w-[110px] text-[10px] sm:text-xs"
                        >
                          {r.n}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentScenario.roles.map((rowRole) => (
                      <tr key={rowRole.id} className="hover:bg-white/[0.02]">
                        <th className="sticky right-0 z-10 bg-[#161626] border-b border-l border-white/10 p-1.5 sm:p-2.5 text-right font-bold text-amber-300 whitespace-nowrap text-[11px] sm:text-xs">
                          {rowRole.n}
                        </th>
                        {currentScenario.roles.map((colRole) => {
                          const key = pair(rowRole.id, colRole.id);
                          const text = currentScenario.cellMap?.[key];
                          const isDiag = rowRole.id === colRole.id;
                          const hasText = Boolean(text && text.trim());

                          return (
                            <td
                              key={colRole.id}
                              onClick={() => handleCellClick(currentScenario, rowRole.id, colRole.id)}
                              className={`border-b border-l border-white/10 p-2 sm:p-3 text-center cursor-pointer transition-all ${
                                isDiag
                                  ? 'bg-amber-500/10 hover:bg-amber-500/20'
                                  : hasText
                                  ? 'hover:bg-amber-500/15'
                                  : 'hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center justify-center">
                                {isDiag ? (
                                  <span className="w-3 h-3 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-pulse" />
                                ) : hasText ? (
                                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(201,168,76,0.8)]" />
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 opacity-50" />
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GENERAL ROLES VIEW */}
          {currentTab === 'general' && (
            <div className="space-y-4">
              <div className="bg-[#12121e] border border-amber-500/20 rounded-2xl p-4 sm:p-5">
                <h3 className="text-base font-black text-amber-400 mb-1">نقش‌های عمومی / فرا-سناریویی</h3>
                <p className="text-xs text-slate-300">
                  این نقش‌ها در دک‌های مختلف به صلاحدید گرداننده قابل اضافه کردن هستند. روی هر کارت کلیک کنید تا جزئیات را بخوانید.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generalRoles.map((role, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleGeneralRoleClick(role)}
                    className="p-4 rounded-2xl bg-[#12121e] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-black text-amber-400 group-hover:text-amber-300">
                        {role.n}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1c1c2e] text-slate-400 border border-white/5">
                        {role.team}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {role.d.split('\n\n')[0]}
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-white/5 text-[11px] text-amber-400/80 flex items-center justify-between">
                      <span>مشاهده متن کامل و تلاقی</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LAST MOVE CARDS VIEW */}
          {currentTab === 'cards' && (
            <div className="space-y-4">
              <div className="bg-[#12121e] border border-amber-500/20 rounded-2xl p-4 sm:p-5">
                <h3 className="text-base font-black text-amber-400 mb-1">کارت‌های حرکت آخر</h3>
                <p className="text-xs text-slate-300">
                  مخصوص بازیکنی که با <strong>رأی روز</strong> از بازی خارج می‌شود (نه کشته شب). قرعه‌کشی تصادفی و اجرای اکت اجباری است.
                </p>
              </div>

              <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#10101a]">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#161626] border-b border-white/10 text-amber-400 text-right">
                      <th className="p-3 font-bold">نام کارت</th>
                      <th className="p-3 font-bold">خانواده / سناریو</th>
                      <th className="p-3 font-bold">عملکرد و اثر در بازی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {lastMoveCards.map((card, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="p-3.5 font-bold text-amber-300 whitespace-nowrap">
                          {card.n}
                        </td>
                        <td className="p-3.5 text-amber-400/90 whitespace-nowrap">
                          {card.fam}
                        </td>
                        <td className="p-3.5 text-slate-300 leading-relaxed">
                          {card.d}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GENERAL RULES VIEW */}
          {currentTab === 'rules' && (
            <div className="space-y-5">
              {generalRules.map((section, idx) => (
                <div key={idx} className="bg-[#12121e] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
                  <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>{section.h}</span>
                  </h3>
                  
                  {section.p && (
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                      {section.p}
                    </p>
                  )}

                  {section.items && (
                    <ul className="space-y-2 text-xs text-slate-300">
                      {section.items.map((item, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* OTHER GORGINE SCENARIOS VIEW */}
          {currentTab === 'other' && (
            <div className="space-y-4">
              <div className="bg-[#12121e] border border-amber-500/20 rounded-2xl p-4 sm:p-5">
                <h3 className="text-base font-black text-amber-400 mb-1">سایر سناریوهای مرجع گرگینه</h3>
                <p className="text-xs text-slate-300">
                  گرگینه (gorgine.com) سناریوهای تخصصی دیگری نیز دارد که خلاصه قوانین و ساختار آنها در ادامه گردآوری شده است.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherScenarios.map((scen, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleOtherScenarioClick(scen)}
                    className="p-4 rounded-2xl bg-[#12121e] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-black text-amber-400 group-hover:text-amber-300">
                        {scen.n}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1c1c2e] text-slate-400 border border-white/5">
                        {scen.players}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {scen.d}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Detail Popup Overlay */}
        {activeDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg bg-[#141424] border border-amber-500/40 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
              
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4 mb-4">
                <div>
                  <div className="text-[11px] font-bold text-amber-400/80 mb-1">
                    {activeDetail.scenarioName}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-black text-sm">
                      {activeDetail.roleA}
                    </span>
                    {activeDetail.roleB && (
                      <>
                        <span className="text-slate-500 text-xs font-bold">×</span>
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-black text-sm">
                          {activeDetail.roleB}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playTick();
                    setActiveDetail(null);
                  }}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Badge */}
              <div className="mb-3">
                {activeDetail.badgeType === 'SELF' && (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    توضیح نقش
                  </span>
                )}
                {activeDetail.badgeType === 'RULE' && (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    قانون تلاقی خاص
                  </span>
                )}
                {activeDetail.badgeType === 'NONE' && (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-700/40 text-slate-400 font-bold">
                    تعامل خاصی ندارند
                  </span>
                )}
              </div>

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto pr-1">
                {formatDetailContent(activeDetail.text)}
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {onAddRoleToDeck && activeDetail.roleA && (
                    <button
                      onClick={() => {
                        soundEngine.playTick();
                        onAddRoleToDeck(activeDetail.roleA);
                        setActionFeedback(`نقش «${activeDetail.roleA}» به دک اضافه شد.`);
                        setTimeout(() => setActionFeedback(null), 2500);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>➕ افزودن «{activeDetail.roleA}» به دک بازی</span>
                    </button>
                  )}
                  {onAddRoleToDeck && activeDetail.roleB && (
                    <button
                      onClick={() => {
                        soundEngine.playTick();
                        onAddRoleToDeck(activeDetail.roleB!);
                        setActionFeedback(`نقش «${activeDetail.roleB}» به دک اضافه شد.`);
                        setTimeout(() => setActionFeedback(null), 2500);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>➕ افزودن «{activeDetail.roleB}»</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    soundEngine.playTick();
                    setActiveDetail(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-colors cursor-pointer mr-auto"
                >
                  بستن
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex-shrink-0 px-3 sm:px-5 py-2 sm:py-2.5 border-t border-white/10 bg-[#12121d] flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
          <span className="truncate max-w-[200px] sm:max-w-none">
            برای بازی‌های واقعی — قوانین بحث‌برانگیز را قبل از شروع هماهنگ کنید.
          </span>
          <button
            onClick={() => {
              soundEngine.playTick();
              onClose();
            }}
            className="px-3.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 font-bold cursor-pointer transition-colors text-xs"
          >
            بستن
          </button>
        </div>

      </div>

    </div>
  );
};
