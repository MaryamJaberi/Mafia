import React, { useState } from 'react';
import { 
  BookOpen, X, Search, Shield, Skull, Crown, HeartPulse, 
  Target, VolumeX, Bomb, Landmark, Sparkles, Flame, Smile, 
  HelpCircle, ChevronLeft, ArrowRightLeft, AlertTriangle, CheckCircle2 
} from 'lucide-react';
import { Language, RoleAffiliation, RoleId } from '../../types/mafia';
import { ROLE_DEFINITIONS } from '../../utils/scenarios';
import { translations } from '../../utils/translations';
import { getCompleteRoleInfo } from '../../utils/rolesDatabase';

interface RoleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  initialRoleId?: RoleId;
  onAddRoleToDeck?: (roleId: RoleId) => void;
  onOpenMatrixForRole?: (roleId: RoleId) => void;
}

export const RoleGuideModal: React.FC<RoleGuideModalProps> = ({
  isOpen,
  onClose,
  language,
  initialRoleId,
  onAddRoleToDeck,
  onOpenMatrixForRole
}) => {
  const t = translations[language] || translations.fa;
  const isEn = language === 'en';
  const isRtl = language !== 'en';

  const [selectedRoleId, setSelectedRoleId] = useState<RoleId>(initialRoleId || 'GODFATHER');
  const [searchQuery, setSearchQuery] = useState('');
  const [affiliationFilter, setAffiliationFilter] = useState<'ALL' | RoleAffiliation>('ALL');
  const [addedToast, setAddedToast] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && initialRoleId) {
      setSelectedRoleId(initialRoleId);
    }
  }, [isOpen, initialRoleId]);

  const allRoles = Object.values(ROLE_DEFINITIONS);

  const filteredRoles = allRoles.filter(role => {
    const roleInfo = getCompleteRoleInfo(role.id, language);
    const name = roleInfo.localizedName;
    const desc = roleInfo.localizedDescription;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || name.toLowerCase().includes(q) || desc.toLowerCase().includes(q) || role.id.toLowerCase().includes(q);
    const matchesAffiliation = affiliationFilter === 'ALL' || role.affiliation === affiliationFilter;
    return matchesSearch && matchesAffiliation;
  });

  const selectedRole = ROLE_DEFINITIONS[selectedRoleId] || ROLE_DEFINITIONS.GODFATHER;
  const detailedRole = getCompleteRoleInfo(selectedRole.id, language);

  if (!isOpen) return null;

  const handleAddCurrentRoleToDeck = () => {
    if (onAddRoleToDeck) {
      onAddRoleToDeck(selectedRole.id);
      setAddedToast(isEn ? `Added "${detailedRole.localizedName}" to current deck.` : `نقش «${detailedRole.localizedName}» به دک بازی اضافه شد.`);
      setTimeout(() => setAddedToast(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-[#0f0f12] border border-white/10 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#e2e2e7] text-base sm:text-lg">
                {isEn ? 'Comprehensive Role Encyclopedia & Rulings' : 'دانشنامه و راهنمای جامع نقش‌ها'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEn ? 'Official referee rulings, day and night acts, exceptions, and matchups' : 'تمام اکت‌ها، استثناهای داوری، تقابل‌های دوطرفه و ترتیب بیداری شبانه'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Sidebar list + Detail view */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Column: Search & Role List */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-l border-white/10 p-4 bg-[#0a0a0c]/60 flex flex-col gap-3 overflow-hidden">
            
            {/* Search Box */}
            <div className="relative">
              <Search className={`w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} pointer-events-none`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? 'Search role or abilities...' : 'جستجوی نقش یا توانایی...'}
                className={`w-full bg-white/5 border border-white/10 rounded-xl ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500`}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center p-1 bg-white/5 rounded-xl text-[11px] font-bold">
              <button
                onClick={() => setAffiliationFilter('ALL')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  affiliationFilter === 'ALL' ? 'bg-amber-500 text-black font-extrabold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isEn ? `All (${allRoles.length})` : `همه (${allRoles.length})`}
              </button>
              <button
                onClick={() => setAffiliationFilter('MAFIA')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  affiliationFilter === 'MAFIA' ? 'bg-rose-500 text-white font-extrabold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isEn ? 'Mafia' : 'مافیا'}
              </button>
              <button
                onClick={() => setAffiliationFilter('CITIZEN')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  affiliationFilter === 'CITIZEN' ? 'bg-emerald-500 text-white font-extrabold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isEn ? 'Citizen' : 'شهروند'}
              </button>
            </div>

            {/* Role List */}
            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {filteredRoles.map(role => {
                const isSelected = selectedRoleId === role.id;
                const roleInfo = getCompleteRoleInfo(role.id, language);

                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`w-full p-2.5 rounded-xl text-start transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold shadow-sm'
                        : 'bg-white/5 border-transparent text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        role.affiliation === 'MAFIA' ? 'bg-rose-400' : role.affiliation === 'CITIZEN' ? 'bg-emerald-400' : 'bg-purple-400'
                      }`} />
                      <span className="text-xs font-semibold">{roleInfo.localizedName}</span>
                    </div>

                    <span className="text-[10px] text-slate-500">
                      {role.nightPriority > 0 ? (isEn ? `Night #${role.nightPriority}` : `نوبت شب ${role.nightPriority}`) : (isEn ? 'Daytime' : 'روزانه')}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Right Column: Full Role Encyclopedia Details */}
          <div className="md:col-span-8 p-6 overflow-y-auto max-h-[75vh] space-y-6">
            
            {/* Top Role Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#0a0a0c] border border-white/10">
              <div className="flex items-center gap-3.5">
                <div className={`p-3 rounded-2xl border text-xl ${selectedRole.teamColor}`}>
                  {selectedRole.affiliation === 'MAFIA' ? <Skull className="w-6 h-6" /> : 
                   selectedRole.affiliation === 'CITIZEN' ? <Shield className="w-6 h-6" /> : <Smile className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-white">{detailedRole.localizedName}</h2>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                      selectedRole.affiliation === 'MAFIA' ? 'bg-rose-950/60 border-rose-500/40 text-rose-300' :
                      selectedRole.affiliation === 'CITIZEN' ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' :
                      'bg-purple-950/60 border-purple-500/40 text-purple-300'
                    }`}>
                      {detailedRole.localizedAffiliation}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 mt-0.5 block">
                    {selectedRole.nightPriority > 0 
                      ? (isEn ? `Night Wakeup Order: Priority ${selectedRole.nightPriority}` : `ترتیب بیدارباش در فاز شب: اولویت ${selectedRole.nightPriority}`) 
                      : (isEn ? 'No independent night wakeup action' : 'فاقد بیدارباش شبانه مستقل')}
                  </span>
                </div>
              </div>

              {/* Action Buttons for Current Role */}
              <div className="flex items-center gap-2 flex-wrap">
                {onAddRoleToDeck && (
                  <button
                    onClick={handleAddCurrentRoleToDeck}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <span>{isEn ? '➕ Add to Deck' : '➕ افزودن به دک بازی'}</span>
                  </button>
                )}

                {onOpenMatrixForRole && (
                  <button
                    onClick={() => onOpenMatrixForRole(selectedRole.id)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isEn ? 'Matrix Matchup' : 'تقابل در ماتریس'}</span>
                  </button>
                )}
              </div>

              {detailedRole.counterpartRoleName ? (
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-start w-full">
                  <span className="text-[10px] text-slate-500 block">
                    {isEn ? 'Counterpart Role / Scenario Pair:' : 'نقش متقابل / جفت سناریویی:'}
                  </span>
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                    <ArrowRightLeft className="w-3 h-3" />
                    {detailedRole.counterpartRoleName}
                  </span>
                </div>
              ) : ['GODFATHER', 'DETECTIVE', 'DOCTOR'].includes(selectedRole.id) ? (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-start w-full">
                  <span className="text-[10px] text-amber-400/80 block">
                    {isEn ? 'Scenario Status:' : 'وضعیت در سناریوها:'}
                  </span>
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1 mt-0.5">
                    {isEn ? '⭐ Essential core role across all standard scenarios' : '⭐ پای ثابت و رکن اصلی تمامی سناریوها'}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Notification Toast */}
            {addedToast && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{addedToast}</span>
              </div>
            )}

            {/* Role Summary */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-200 leading-relaxed">
              <strong className="text-amber-400 block mb-1">
                {isEn ? 'Core Duty & Objective:' : 'خلاصه وظیفه و هدف:'}
              </strong>
              {detailedRole.localizedDescription}
            </div>

            {/* Acts */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{isEn ? 'Operational Acts & Abilities' : 'اکت‌ها و توانایی‌های عملیاتی'}</span>
              </h4>

              <div className="grid grid-cols-1 gap-2.5">
                {detailedRole.localizedActs && detailedRole.localizedActs.length > 0 ? (
                  detailedRole.localizedActs.map((act, index) => (
                    <div key={index} className="p-4 rounded-xl bg-[#0a0a0c] border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-100 flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${act.phase === 'NIGHT' ? 'bg-indigo-400' : 'bg-amber-400'}`} />
                          {act.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400">
                          {isEn 
                            ? `Phase: ${act.phase === 'NIGHT' ? 'Night' : act.phase === 'DAY' ? 'Day' : 'Passive'}` 
                            : `فاز: ${act.phase === 'NIGHT' ? 'شب' : act.phase === 'DAY' ? 'روز' : 'پسیو / همیشگی'}`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1">{act.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-[#0a0a0c] rounded-xl border border-white/5 text-xs text-slate-500">
                    {isEn 
                      ? 'This role has no special nocturnal actions; its influence relies entirely on daylight debate and voting.' 
                      : 'این نقش عمل شبانه خاصی ندارد و تمام اکت‌های آن در گفتمان و اتهام‌زنی روز است.'}
                  </div>
                )}
              </div>
            </div>

            {/* Exceptions & Rules */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>{isEn ? 'Referee Exceptions & Ruling Guidelines' : 'استثناها، تبصره‌ها و خطاهای رایج'}</span>
              </h4>

              <div className="space-y-2">
                {detailedRole.localizedExceptions && detailedRole.localizedExceptions.length > 0 ? (
                  detailedRole.localizedExceptions.map((exc, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#14100c] border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{exc}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-[#0a0a0c] rounded-xl border border-white/5 text-xs text-slate-500">
                    {isEn ? 'No exceptional referee rulings registered for this role.' : 'استثنای خاصی برای این نقش ثبت نشده است.'}
                  </div>
                )}
              </div>
            </div>

            {/* Role Matchups & Interactions */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                <span>{isEn ? 'Direct Matchups & Interactions' : 'تقابل مستقیم با نقش‌های دیگر'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedRole.matchups && selectedRole.matchups.length > 0 ? (
                  selectedRole.matchups.map((m, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#0a0a0c] border border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          {isEn ? `vs. ${m.targetRoleName}` : `در برابر ${m.targetRoleName}:`}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          m.interactionType === 'POSITIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                          m.interactionType === 'NEGATIVE' ? 'bg-rose-500/20 text-rose-400' :
                          m.interactionType === 'LETHAL' ? 'bg-red-500/30 text-red-300' : 'bg-white/5 text-slate-400'
                        }`}>
                          {m.interactionType === 'POSITIVE' ? (isEn ? 'Advantage' : 'مزیت') :
                           m.interactionType === 'NEGATIVE' ? (isEn ? 'Hazard' : 'خطر') :
                           m.interactionType === 'LETHAL' ? (isEn ? 'Lethal' : 'مرگبار') : (isEn ? 'Neutral' : 'خنثی')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{m.effect}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-3 bg-[#0a0a0c] rounded-xl border border-white/5 text-xs text-slate-500">
                    {isEn ? 'General match rules apply without exceptional 1v1 triggers.' : 'تقابل مستقیمی برای این نقش تعریف نشده است.'}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
