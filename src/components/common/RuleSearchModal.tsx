import React, { useState, useMemo } from 'react';
import { 
  Search, X, HelpCircle, Shield, Sparkles, BookOpen, 
  ChevronDown, ChevronUp, Copy, Check, Filter, Swords, 
  AlertTriangle, Flame, Award
} from 'lucide-react';
import { MAFIA_FAQ_DATA, FaqItem } from '../../data/mafiaFaqData';
import { Language } from '../../types/mafia';

interface RuleSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
}

const CATEGORIES: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: 'ALL', label: 'همه سوالات', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { key: 'ROLES_MATCHUP', label: 'نقش‌ها و تقابل‌ها', icon: <Swords className="w-3.5 h-3.5" /> },
  { key: 'NIGHT_PHASE', label: 'شب و اولویت اکت‌ها', icon: <Shield className="w-3.5 h-3.5" /> },
  { key: 'VOTING_DEFENSE', label: 'رأی‌گیری و دفاعیه', icon: <Flame className="w-3.5 h-3.5" /> },
  { key: 'FOULS_RULES', label: 'خطاها و انضباطی', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  { key: 'WIN_CONDITIONS', label: 'شروط پیروزی', icon: <Award className="w-3.5 h-3.5" /> }
];

export const RuleSearchModal: React.FC<RuleSearchModalProps> = ({
  isOpen,
  onClose,
  language = 'fa'
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    'faq-gf-detective': true,
    'faq-sniper-gf': true
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Normalize Persian characters for smart matching
  const normalize = (text: string) => {
    return text
      .toLowerCase()
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/‌/g, '') // Remove half-spaces for fuzzy query
      .replace(/\s+/g, ' ')
      .trim();
  };

  const filteredQuestions = useMemo(() => {
    const normQuery = normalize(query);
    return MAFIA_FAQ_DATA.filter((item) => {
      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      // Query filter
      if (!normQuery) return true;

      const inQuestion = normalize(item.question).includes(normQuery);
      const inAnswer = normalize(item.answer).includes(normQuery);
      const inTags = item.tags.some(t => normalize(t).includes(normQuery));
      const inCategory = normalize(item.categoryLabel).includes(normQuery);

      return inQuestion || inAnswer || inTags || inCategory;
    });
  }, [query, selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyAnswer = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div 
        className="bg-[#121318] border border-amber-500/30 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with search bar */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-amber-950/40 via-[#121318] to-slate-900/50">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  مرکز جستجوی قوانین و سوالات مافیا
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    قوانین رسمی مسابقات
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  پاسخ فوری به قوانین نقش‌ها، اثرات متقابل، تیر اسنایپر، سکوت ناتاشا، اولویت شب و حدنصاب‌ها
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-amber-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="مثال: تیر اسنایپر به پدرخوانده، سکوت ناتاشا، استعلام جان‌سخت، وتوی شهردار..."
              className="w-full bg-[#181920] border border-amber-500/30 focus:border-amber-400 text-white placeholder-slate-500 rounded-2xl pr-12 pl-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
            {CATEGORIES.map(cat => {
              const count = cat.key === 'ALL' 
                ? MAFIA_FAQ_DATA.length 
                : MAFIA_FAQ_DATA.filter(f => f.category === cat.key).length;
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                      : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-black/30 text-black' : 'bg-white/10 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-slate-300 font-bold text-sm">هیچ قانونی مطابق با عبارت «{query}» یافت نشد.</p>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                می‌توانید کلمات کلیدی ساده‌تری مانند «اسنایپر»، «استعلام»، «زره»، «فول» یا «سکوت» را جستجو نمایید.
              </p>
              <button
                onClick={() => { setQuery(''); setSelectedCategory('ALL'); }}
                className="mt-2 text-xs text-amber-400 hover:underline"
              >
                مشاهده همه سوالات و قوانین
              </button>
            </div>
          ) : (
            filteredQuestions.map(item => {
              const isExpanded = !!expandedIds[item.id];
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isExpanded 
                      ? 'bg-[#181a24] border-amber-500/40 shadow-lg' 
                      : 'bg-[#14151e] border-white/5 hover:border-white/15'
                  }`}
                >
                  {/* Question Header */}
                  <div
                    onClick={() => toggleExpand(item.id)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold">
                        ؟
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-relaxed">
                          {item.question}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] text-amber-400/90 font-medium">
                            {item.categoryLabel}
                          </span>
                          {item.badgeText && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold">
                              {item.badgeText}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Answer Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-white/5 bg-black/20 space-y-3">
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                        {item.answer}
                      </p>

                      {/* Tags and Copy Action */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.tags.map(t => (
                            <span key={t} className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-md">
                              #{t}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyAnswer(item.id, `${item.question}\n${item.answer}`);
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-400 transition-colors p-1"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">کپی شد</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>کپی پاسخ</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0d0e12] flex items-center justify-between text-xs text-slate-400">
          <span>تعداد موارد نمایش‌داده‌شده: {filteredQuestions.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl transition-all"
          >
            بستن راهنما
          </button>
        </div>
      </div>
    </div>
  );
};
