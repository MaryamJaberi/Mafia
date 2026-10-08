import React, { useState, useEffect } from 'react';
import { 
  X, Layers, Users, Sparkles, Check, Edit3, Trash2, Plus, 
  Search, Shield, Crown, HelpCircle, ArrowRight, Download, Upload,
  Star, Flame, BookOpen, AlertCircle
} from 'lucide-react';
import { Scenario, RoleId, DeckRoleItem, RoomState, Language } from '../../types/mafia';
import { 
  DEFAULT_SCENARIOS, 
  ROLE_DEFINITIONS, 
  loadCustomScenarios, 
  saveCustomScenario, 
  deleteCustomScenario,
  getAllScenarios 
} from '../../utils/scenarios';
import { soundEngine } from '../../utils/audioSynth';
import { localizeScenario, getLocalizedRoleName, getLocalizedDifficulty } from '../../utils/scenarioLocalization';
import { translations, isRtlLanguage } from '../../utils/translations';

interface PresetScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
  currentScenarioId?: string;
  onSelectScenario: (scenario: Scenario) => void;
  onOpenDeckEditorWithScenario: (scenario: Scenario) => void;
}

export const PresetScenariosModal: React.FC<PresetScenariosModalProps> = ({
  isOpen,
  onClose,
  language = 'fa',
  currentScenarioId,
  onSelectScenario,
  onOpenDeckEditorWithScenario
}) => {
  const activeLang: Language = (language as Language) || 'fa';
  const isRtl = isRtlLanguage(activeLang);
  const [activeTab, setActiveTab] = useState<'ALL' | 'DEFAULT' | 'CUSTOM'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>([]);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');

  const t = translations[activeLang] || translations['fa'];

  useEffect(() => {
    if (isOpen) {
      setCustomScenarios(loadCustomScenarios());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rawScenarios = [...customScenarios, ...DEFAULT_SCENARIOS];
  const allScenarios = rawScenarios.map(sc => localizeScenario(sc, activeLang));

  const filteredScenarios = allScenarios.filter(sc => {
    if (activeTab === 'DEFAULT' && sc.isCustom) return false;
    if (activeTab === 'CUSTOM' && !sc.isCustom) return false;
    if (filterDifficulty !== 'ALL' && sc.difficulty !== filterDifficulty) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = sc.name.toLowerCase().includes(q);
      const matchDesc = sc.description.toLowerCase().includes(q);
      const matchTag = sc.tag?.toLowerCase().includes(q);
      const matchRoles = sc.roles.some(r => {
        const localizedRName = getLocalizedRoleName(r, activeLang);
        return localizedRName.toLowerCase().includes(q) || r.toLowerCase().includes(q);
      });
      return matchName || matchDesc || matchTag || matchRoles;
    }
    return true;
  });

  const handleDeleteCustom = (e: React.MouseEvent, scenarioId: string) => {
    e.stopPropagation();
    const confirmMsg = language === 'en' ? 'Are you sure you want to delete this custom scenario?' :
                       language === 'ar' ? 'هل أنت متأكد من حذف هذا السيناريو المخصص؟' :
                       language === 'tr' ? 'Bu özel senaryoyu silmek istediğinizden emin misiniz?' :
                       'آیا از حذف این سناریوی سفارشی اطمینان دارید؟';
    if (window.confirm(confirmMsg)) {
      const updated = deleteCustomScenario(scenarioId);
      setCustomScenarios(updated);
      soundEngine.playTick();
    }
  };

  // Helper to compute team breakdown of scenario
  const getTeamBreakdown = (roles: RoleId[]) => {
    let mafia = 0;
    let citizen = 0;
    let independent = 0;
    roles.forEach(r => {
      const def = ROLE_DEFINITIONS[r];
      if (def?.affiliation === 'MAFIA') mafia++;
      else if (def?.affiliation === 'INDEPENDENT') independent++;
      else citizen++;
    });
    return { mafia, citizen, independent };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#0f0f14] border border-white/15 rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[96vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        
        {/* Header */}
        <div className="p-2.5 sm:p-4 bg-[#161622] border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-black text-white flex items-center gap-1.5 truncate">
                <span>
                  {language === 'en' ? 'Preset Scenarios Library' :
                   language === 'ar' ? 'مكتبة السيناريوهات' :
                   language === 'tr' ? 'Hazır Senaryolar' :
                   'بانک سناریوهای آماده'}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  {allScenarios.length}
                </span>
              </h2>
              <p className="hidden sm:block text-xs text-slate-400 mt-0.5">
                {language === 'en' ? 'Quickly select balanced setups, customize cards, or craft your own presets' :
                 language === 'ar' ? 'اختر سيناريوهات متوازنة، عدل الأدوار، أو أنشئ تشكيلات مخصصة' :
                 language === 'tr' ? 'Dengeli senaryoları seçin, rolleri özelleştirin veya kendi senaryonuzu oluşturun' :
                 'مشاهده تعداد نفرات پیشنهادی، انتخاب فوری سناریو، کم و زیاد کردن نقش‌ها و ذخیره سناریوی جدید'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Open empty / custom editor
                onOpenDeckEditorWithScenario({
                  id: `custom_${Date.now()}`,
                  name: language === 'en' ? 'Custom Scenario Setup' :
                        language === 'ar' ? 'سيناريو مخصص جديد' :
                        language === 'tr' ? 'Yeni Özel Senaryo' :
                        'سناریوی جدید شخصی',
                  description: language === 'en' ? 'Custom role deck curated by the God' :
                               language === 'ar' ? 'توزيع مخصص من اختيار المشرف' :
                               language === 'tr' ? 'Moderatör tarafından özel rol dağılımı' :
                               'طراحی ترکیب نقش‌ها به انتخاب گرداننده',
                  recommendedPlayerCount: 10,
                  roles: ['GODFATHER', 'DOCTOR', 'DETECTIVE', 'SNIPER', 'CITIZEN_SIMPLE'],
                  isCustom: true
                });
                onClose();
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-lg sm:rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[11px] sm:text-xs font-black transition-all shadow-md shadow-amber-500/20 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {language === 'en' ? 'New Preset' :
                 language === 'ar' ? 'إنشاء سيناريو' :
                 language === 'tr' ? 'Yeni Senaryo' :
                 'سناریوی جدید'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-2 sm:p-3 bg-[#12121a] border-b border-white/5 flex flex-wrap items-center justify-between gap-2">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-black/40 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-2 sm:px-3 py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ALL' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'en' ? `All (${allScenarios.length})` :
               language === 'ar' ? `الكل (${allScenarios.length})` :
               language === 'tr' ? `Tümü (${allScenarios.length})` :
               `همه (${allScenarios.length})`}
            </button>
            <button
              onClick={() => setActiveTab('DEFAULT')}
              className={`px-2 sm:px-3 py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'DEFAULT' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'en' ? `Official (${DEFAULT_SCENARIOS.length})` :
               language === 'ar' ? `الرسمية (${DEFAULT_SCENARIOS.length})` :
               language === 'tr' ? `Resmi (${DEFAULT_SCENARIOS.length})` :
               `رسمی (${DEFAULT_SCENARIOS.length})`}
            </button>
            <button
              onClick={() => setActiveTab('CUSTOM')}
              className={`px-2 sm:px-3 py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'CUSTOM' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'en' ? `Saved (${customScenarios.length})` :
               language === 'ar' ? `المحفوظة (${customScenarios.length})` :
               language === 'tr' ? `Kayıtlı (${customScenarios.length})` :
               `ذخیره‌شده (${customScenarios.length})`}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[160px] max-w-sm">
            <Search className={`w-3.5 h-3.5 absolute top-2 text-slate-400 ${isRtl ? 'right-2.5' : 'left-2.5'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'en' ? 'Search preset or role...' :
                language === 'ar' ? 'بحث عن سيناريو أو دور...' :
                language === 'tr' ? 'Senaryo veya rol ara...' :
                'جستجوی سناریو یا نقش...'
              }
              className={`w-full py-1.5 rounded-lg sm:rounded-xl bg-black/50 border border-white/15 text-white text-[11px] sm:text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 ${
                isRtl ? 'pr-8 pl-2.5' : 'pl-8 pr-2.5'
              }`}
            />
          </div>
        </div>

        {/* Scenarios Grid */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-5 space-y-3">
          {filteredScenarios.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">
                {language === 'en' ? 'No scenarios found' :
                 language === 'ar' ? 'لم يتم العثور على سيناريوهات' :
                 language === 'tr' ? 'Hiçbir senaryo bulunamadı' :
                 'هیچ سناریویی یافت نشد'}
              </h4>
              <p className="text-xs text-slate-500">
                {language === 'en' ? 'Try searching for something else or craft a custom preset.' :
                 language === 'ar' ? 'جرب البحث عن عبارة أخرى أو أنشئ سيناريو مخصصاً جديداً.' :
                 language === 'tr' ? 'Farklı bir arama yapmayı veya yeni bir senaryo oluşturmayı deneyin.' :
                 'می‌توانید با جستجوی عبارت دیگر یا ساخت سناریوی جدید شروع کنید.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredScenarios.map((sc) => {
                const isSelected = currentScenarioId === sc.id;
                const { mafia, citizen, independent } = getTeamBreakdown(sc.roles);

                return (
                  <div
                    key={sc.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative group ${
                      isSelected
                        ? 'bg-[#181a28] border-amber-500 shadow-xl shadow-amber-500/10'
                        : 'bg-[#13131c] border-white/10 hover:border-white/20 hover:bg-[#161622]'
                    }`}
                  >
                    
                    {/* Top Row: Title & Recommended Player Count Badge */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-sm sm:text-base text-white">
                              {sc.name}
                            </h3>
                            {sc.isCustom && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 font-black">
                                {language === 'en' ? 'Custom' : language === 'ar' ? 'مخصص' : language === 'tr' ? 'Özel' : 'شخصی'}
                              </span>
                            )}
                            {sc.tag && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                                {sc.tag}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Prominent Recommended Player Count */}
                        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-inner">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-black">
                            {sc.recommendedPlayerCount || sc.roles.length} {
                              language === 'en' ? 'Players' :
                              language === 'ar' ? 'لاعباً' :
                              language === 'tr' ? 'Oyuncu' :
                              'نفر پیشنهادی'
                            }
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed line-clamp-2">
                        {sc.description}
                      </p>
                    </div>

                    {/* Team Breakdown & Role Tags */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2 text-slate-400">
                          <span className="text-rose-400 font-bold">
                            🔴 {mafia} {language === 'en' ? 'Mafia' : language === 'ar' ? 'مافيا' : language === 'tr' ? 'Mafya' : 'مافیا'}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">
                            🟢 {citizen} {language === 'en' ? 'Citizen' : language === 'ar' ? 'مواطن' : language === 'tr' ? 'Köylü' : 'شهروند'}
                          </span>
                          {independent > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400 font-bold">
                                🟡 {independent} {language === 'en' ? 'Indep.' : language === 'ar' ? 'مستقل' : language === 'tr' ? 'Bağımsız' : 'مستقل'}
                              </span>
                            </>
                          )}
                        </div>
                        <span className="text-slate-500 text-[10px]">
                          {language === 'en' ? `Deck Size: ${sc.roles.length}` :
                           language === 'ar' ? `عدد البطاقات: ${sc.roles.length}` :
                           language === 'tr' ? `Deste: ${sc.roles.length}` :
                           `تعداد کارت‌ها: ${sc.roles.length}`}
                        </span>
                      </div>

                      {/* Mini Role Badges Preview */}
                      <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
                        {sc.roles.slice(0, 8).map((roleId, idx) => {
                          const def = ROLE_DEFINITIONS[roleId];
                          const color = def?.affiliation === 'MAFIA' 
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' 
                            : def?.affiliation === 'INDEPENDENT'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
                          return (
                            <span 
                              key={`${roleId}_${idx}`} 
                              className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium ${color}`}
                            >
                              {getLocalizedRoleName(roleId, activeLang)}
                            </span>
                          );
                        })}
                        {sc.roles.length > 8 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-white/5 text-slate-400 border border-white/10">
                            +{sc.roles.length - 8} {language === 'en' ? 'more' : language === 'ar' ? 'أخرى' : language === 'tr' ? 'diğer' : 'کارت دیگر'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        {/* Edit & Customize Roles Button */}
                        <button
                          onClick={() => {
                            soundEngine.playTick();
                            onOpenDeckEditorWithScenario(sc);
                            onClose();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer"
                          title={
                            language === 'en' ? 'Customize and edit deck roles' :
                            language === 'ar' ? 'تعديل وتخصيص أدوار المجموعة' :
                            language === 'tr' ? 'Deste rollerini düzenle ve özelleştir' :
                            'کم و زیاد کردن نقش‌ها و ویرایش سناریو'
                          }
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            {language === 'en' ? 'Edit & Customize Deck' :
                             language === 'ar' ? 'تعديل وتخصيص الأدوار' :
                             language === 'tr' ? 'Rolleri Düzenle & Özelleştir' :
                             'ویرایش و کم/زیاد کردن نقش'}
                          </span>
                        </button>

                        {sc.isCustom && (
                          <button
                            onClick={(e) => handleDeleteCustom(e, sc.id)}
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 text-xs transition-all cursor-pointer"
                            title={
                              language === 'en' ? 'Delete custom preset' :
                              language === 'ar' ? 'حذف السيناريو المخصص' :
                              language === 'tr' ? 'Özel senaryoyu sil' :
                              'حذف سناریوی شخصی'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Select & Apply Button */}
                      <button
                        onClick={() => {
                          soundEngine.playGong();
                          onSelectScenario(sc);
                          onClose();
                        }}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                            : 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/30'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>
                              {language === 'en' ? 'Active Preset' :
                               language === 'ar' ? 'السيناريو النشط' :
                               language === 'tr' ? 'Aktif Senaryo' :
                               'سناریوی فعال میز'}
                            </span>
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>
                              {language === 'en' ? 'Select & Apply' :
                               language === 'ar' ? 'اختيار وتطبيق' :
                               language === 'tr' ? 'Seç ve Uygula' :
                               'انتخاب و اعمال'}
                            </span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 sm:p-3 bg-[#14141c] border-t border-white/10 flex items-center justify-between gap-2 text-xs text-slate-400">
          <span className="hidden sm:inline text-[11px] truncate">
            {language === 'en' ? 'Click "Edit & Customize Deck" on any preset to tailor card counts and special powers.' :
             language === 'ar' ? 'انقر على "تعديل وتخصيص الأدوار" في أي سيناريو لتعديل عدد البطاقات والقدرات.' :
             language === 'tr' ? 'Kart sayılarını ve özel yetenekleri ayarlamak için "Rolleri Düzenle" butonuna tıklayın.' :
             'برای ویرایش هر سناریو و کم و زیاد کردن کارت‌ها روی دکمه «ویرایش و کم/زیاد کردن نقش» کلیک کنید.'}
          </span>
          <span className="sm:hidden text-[10px] text-slate-500">
            {allScenarios.length} {
              language === 'en' ? 'Presets' :
              language === 'ar' ? 'سيناريو' :
              language === 'tr' ? 'Senaryo' :
              'سناریو آماده'
            }
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
          >
            {language === 'en' ? 'Close' : language === 'ar' ? 'إغلاق' : language === 'tr' ? 'Kapat' : 'بستن'}
          </button>
        </div>

      </div>
    </div>
  );
};
