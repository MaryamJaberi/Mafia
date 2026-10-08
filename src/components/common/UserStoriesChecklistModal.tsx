import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, Square, Trash2, Edit3, Plus, Search, 
  RotateCcw, Download, Check, X, Filter, Layers, 
  Sparkles, Info, Volume2, Shield, Users, Crown, Vote, Globe
} from 'lucide-react';
import { UserStoryItem, DEFAULT_USER_STORIES } from '../../data/defaultUserStories';
import { soundEngine } from '../../utils/audioSynth';
import { Language } from '../../types/mafia';

interface UserStoriesChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const STORAGE_KEY = 'mafia_user_stories_checklist_v1';

export const UserStoriesChecklistModal: React.FC<UserStoriesChecklistModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  // Load saved stories from localStorage or default
  const [stories, setStories] = useState<UserStoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load user stories:', e);
    }
    return DEFAULT_USER_STORIES;
  });

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingStory, setEditingStory] = useState<UserStoryItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New story draft
  const [newDraft, setNewDraft] = useState<Partial<UserStoryItem>>({
    category: 'LOBBY_SYSTEM',
    title: '',
    actor: 'خدا (گرداننده)',
    asA: '',
    iWantTo: '',
    soThat: '',
    acceptanceCriteria: ['معیار اول'],
    rulesAndAccess: 'عمومی',
    infoArchitecture: 'صفحه اصلی > منو',
    soundEffect: 'صدای تیک',
    isCompleted: false,
    priority: 'HIGH'
  });

  // Filtering stories (unconditional hook)
  const filteredStories = useMemo(() => {
    return stories.filter(s => {
      if (filterCategory !== 'ALL' && s.category !== filterCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.title.toLowerCase().includes(q) ||
          s.asA.toLowerCase().includes(q) ||
          s.iWantTo.toLowerCase().includes(q) ||
          s.rulesAndAccess.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [stories, filterCategory, searchQuery]);

  // Save changes
  const saveStories = (updated: UserStoryItem[]) => {
    setStories(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save user stories:', e);
    }
  };

  // Toggle completion
  const handleToggleCompleted = (id: string) => {
    soundEngine.playTick();
    const updated = stories.map(s => 
      s.id === id ? { ...s, isCompleted: !s.isCompleted } : s
    );
    saveStories(updated);
  };

  // Delete story
  const handleDeleteStory = (id: string) => {
    soundEngine.playGong();
    if (window.confirm('آیا از حذف این داستان کاربری اطمینان دارید؟')) {
      const updated = stories.filter(s => s.id !== id);
      saveStories(updated);
      if (editingStory?.id === id) setEditingStory(null);
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (window.confirm('آیا مایل به بازگردانی داستان‌های کاربری به حالت اولیه هستید؟ تغییرات ذخیره‌شده بازنشانی خواهند شد.')) {
      soundEngine.playGong();
      saveStories(DEFAULT_USER_STORIES);
      setEditingStory(null);
      setIsAddingNew(false);
    }
  };

  // Save Edit
  const handleSaveEdit = () => {
    if (!editingStory) return;
    soundEngine.playTick();
    const updated = stories.map(s => s.id === editingStory.id ? editingStory : s);
    saveStories(updated);
    setEditingStory(null);
  };

  // Create new
  const handleCreateNew = () => {
    if (!newDraft.title?.trim()) {
      alert('لطفاً عنوان داستان کاربری را وارد کنید.');
      return;
    }
    soundEngine.playTick();
    const newId = `US-CUST-${Date.now().toString().slice(-4)}`;
    const fullStory: UserStoryItem = {
      id: newId,
      category: newDraft.category as any || 'LOBBY_SYSTEM',
      title: newDraft.title.trim(),
      actor: newDraft.actor || 'خدا (گرداننده)',
      asA: newDraft.asA || '',
      iWantTo: newDraft.iWantTo || '',
      soThat: newDraft.soThat || '',
      acceptanceCriteria: newDraft.acceptanceCriteria || [],
      rulesAndAccess: newDraft.rulesAndAccess || 'عمومی',
      infoArchitecture: newDraft.infoArchitecture || 'صفحه اصلی',
      soundEffect: newDraft.soundEffect || 'تیک صوتی',
      isCompleted: false,
      priority: (newDraft.priority as any) || 'HIGH'
    };
    saveStories([fullStory, ...stories]);
    setIsAddingNew(false);
    setNewDraft({
      category: 'LOBBY_SYSTEM',
      title: '',
      actor: 'خدا (گرداننده)',
      asA: '',
      iWantTo: '',
      soThat: '',
      acceptanceCriteria: ['معیار اول'],
      rulesAndAccess: 'عمومی',
      infoArchitecture: 'صفحه اصلی > منو',
      soundEffect: 'صدای تیک',
      isCompleted: false,
      priority: 'HIGH'
    });
  };

  // Export JSON / Markdown
  const handleExportMarkdown = () => {
    soundEngine.playTick();
    let md = `# داستان‌های کاربری و چک‌لیست اعتبارسنجی پلتفرم مافیا\n\n`;
    md += `تاریخ خروجی: ${new Date().toLocaleDateString('fa-IR')}\n`;
    md += `تعداد کل داستان‌ها: ${stories.length} | تکمیل‌شده: ${stories.filter(s => s.isCompleted).length}\n\n`;

    stories.forEach((s, idx) => {
      md += `### ${idx + 1}. [${s.isCompleted ? 'x' : ' '}] ${s.title} (${s.id})\n`;
      md += `- **دسته‌بندی:** ${s.category} | **اولویت:** ${s.priority} | **نقش:** ${s.actor}\n`;
      md += `- **داستان:** به‌عنوان **${s.asA}** می‌خواهم **${s.iWantTo}** تا اینکه **${s.soThat}**\n`;
      md += `- **قوانین و دسترسی‌ها:** ${s.rulesAndAccess}\n`;
      md += `- **معماری اطلاعات (مسیر صفحه):** ${s.infoArchitecture}\n`;
      md += `- **افکت صوتی:** ${s.soundEffect}\n`;
      md += `- **معیارهای پذیرش:**\n`;
      s.acceptanceCriteria.forEach(c => {
        md += `  - [${s.isCompleted ? 'x' : ' '}] ${c}\n`;
      });
      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mafia-user-stories-checklist-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const completedCount = stories.filter(s => s.isCompleted).length;
  const progressPercent = Math.round((completedCount / (stories.length || 1)) * 100);

  const isEn = language === 'en';

  const categories = [
    { id: 'ALL', label: isEn ? 'All Sections' : 'همه بخش‌ها', icon: Layers },
    { id: 'LOBBY_SYSTEM', label: isEn ? 'Lobby & System' : 'لابی و سیستم', icon: Crown },
    { id: 'HOST_TABLE', label: isEn ? 'Host Console' : 'میز گرداننده', icon: Users },
    { id: 'RULES_VOTING', label: isEn ? 'Voting & Defense' : 'رأی‌گیری و دفاعیه', icon: Vote },
    { id: 'PLAYER_EXPERIENCE', label: isEn ? 'Player Experience' : 'تجربه بازیکن', icon: Shield },
    { id: 'SCENARIO_ROLES', label: isEn ? 'Scenarios & Roles' : 'سناریوها و نقش‌ها', icon: Sparkles },
    { id: 'AUDIO_LOCALIZATION', label: isEn ? 'Audio & Languages' : 'صدا و زبان‌ها', icon: Globe }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="w-full max-w-5xl max-h-[92vh] bg-[#0c0d12] border border-white/10 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#12131a] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {isEn ? 'User Stories & Validation Checklist' : 'داستان‌های کاربری و چک‌لیست اعتبارسنجی'}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {isEn ? `${completedCount} of ${stories.length} completed (${progressPercent}%)` : `${completedCount} از ${stories.length} تیک خورده (${progressPercent}٪)`}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isEn ? 'View, edit, toggle, and add user stories, criteria, rules, info architecture, and sounds' : 'مشاهده، ویرایش، حذف، تیک زدن و اضافه کردن داستان‌های کاربری، قوانین، معماری اطلاعات و صدا'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleExportMarkdown}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title={isEn ? 'Export Markdown' : 'خروجی فایل Markdown'}
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">{isEn ? 'Export MD' : 'خروجی MD'}</span>
            </button>

            <button
              onClick={handleResetToDefault}
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-white/10 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title={isEn ? 'Reset to Default' : 'بازگردانی به پیش‌فرض'}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">{isEn ? 'Reset' : 'ریست'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Strip */}
        <div className="w-full bg-white/5 h-1.5">
          <div 
            className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Action Controls & Search */}
        <div className="p-3 sm:p-4 border-b border-white/5 bg-[#0e0f16] flex flex-wrap items-center justify-between gap-3">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isSelected = filterCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundEngine.playTick();
                    setFilterCategory(cat.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                      : 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search + Add New Story */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className={`w-3.5 h-3.5 text-slate-400 absolute ${isEn ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2`} />
              <input
                type="text"
                placeholder={isEn ? 'Search stories & criteria...' : 'جستجو در داستان‌ها و معیارها...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`w-full ${isEn ? 'pl-8 pr-3' : 'pr-8 pl-3'} py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50`}
              />
            </div>

            <button
              onClick={() => {
                soundEngine.playTick();
                setIsAddingNew(true);
                setEditingStory(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isEn ? 'Add Story' : 'افزودن داستان جدید'}</span>
            </button>
          </div>

        </div>

        {/* Main Content Area: Stories List + Edit/Create Panel */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">

          {/* Form: Add New User Story */}
          {isAddingNew && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#161b24] to-[#10131a] border-2 border-emerald-500/40 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">افزودن داستان کاربری جدید</h3>
                </div>
                <button 
                  onClick={() => setIsAddingNew(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">عنوان داستان</label>
                  <input
                    type="text"
                    value={newDraft.title}
                    onChange={e => setNewDraft({ ...newDraft, title: e.target.value })}
                    placeholder="مثال: قابلیت شلیک شب اسنایپر"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">دسته‌بندی</label>
                  <select
                    value={newDraft.category}
                    onChange={e => setNewDraft({ ...newDraft, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LOBBY_SYSTEM">لابی و سیستم</option>
                    <option value="HOST_TABLE">میز گرداننده</option>
                    <option value="RULES_VOTING">رأی‌گیری و قوانین</option>
                    <option value="PLAYER_EXPERIENCE">تجربه بازیکن</option>
                    <option value="SCENARIO_ROLES">سناریوها و نقش‌ها</option>
                    <option value="AUDIO_LOCALIZATION">صدا و زبان</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">کنش‌گر / نقش</label>
                  <input
                    type="text"
                    value={newDraft.actor}
                    onChange={e => setNewDraft({ ...newDraft, actor: e.target.value })}
                    placeholder="خدا / بازیکن / سیستم"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">به‌عنوان (As a)</label>
                  <input
                    type="text"
                    value={newDraft.asA}
                    onChange={e => setNewDraft({ ...newDraft, asA: e.target.value })}
                    placeholder="مثال: اسنایپر شهر"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">می‌خواهم (I want to)</label>
                  <input
                    type="text"
                    value={newDraft.iWantTo}
                    onChange={e => setNewDraft({ ...newDraft, iWantTo: e.target.value })}
                    placeholder="مثال: به یکی از مظنونین شلیک کنم"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">تا اینکه (So that)</label>
                  <input
                    type="text"
                    value={newDraft.soThat}
                    onChange={e => setNewDraft({ ...newDraft, soThat: e.target.value })}
                    placeholder="مثال: مافیا را حذف و شهر را نجات دهم"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">قوانین و سطح دسترسی</label>
                  <input
                    type="text"
                    value={newDraft.rulesAndAccess}
                    onChange={e => setNewDraft({ ...newDraft, rulesAndAccess: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">معماری اطلاعات و مسیر صفحه</label>
                  <input
                    type="text"
                    value={newDraft.infoArchitecture}
                    onChange={e => setNewDraft({ ...newDraft, infoArchitecture: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">افکت صوتی و بازخورد</label>
                  <input
                    type="text"
                    value={newDraft.soundEffect}
                    onChange={e => setNewDraft({ ...newDraft, soundEffect: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  onClick={handleCreateNew}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  ثبت و ذخیره داستان
                </button>
              </div>
            </div>
          )}

          {/* Form: Edit Existing Story */}
          {editingStory && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#211c14] to-[#16130d] border-2 border-amber-500/50 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">ویرایش داستان کاربری ({editingStory.id})</h3>
                </div>
                <button 
                  onClick={() => setEditingStory(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">عنوان داستان</label>
                  <input
                    type="text"
                    value={editingStory.title}
                    onChange={e => setEditingStory({ ...editingStory, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">کنش‌گر / نقش</label>
                  <input
                    type="text"
                    value={editingStory.actor}
                    onChange={e => setEditingStory({ ...editingStory, actor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">به‌عنوان (As a)</label>
                  <textarea
                    rows={2}
                    value={editingStory.asA}
                    onChange={e => setEditingStory({ ...editingStory, asA: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">می‌خواهم (I want to)</label>
                  <textarea
                    rows={2}
                    value={editingStory.iWantTo}
                    onChange={e => setEditingStory({ ...editingStory, iWantTo: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">تا اینکه (So that)</label>
                  <textarea
                    rows={2}
                    value={editingStory.soThat}
                    onChange={e => setEditingStory({ ...editingStory, soThat: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">قوانین و سطح دسترسی</label>
                  <input
                    type="text"
                    value={editingStory.rulesAndAccess}
                    onChange={e => setEditingStory({ ...editingStory, rulesAndAccess: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">معماری اطلاعات و مسیر صفحه</label>
                  <input
                    type="text"
                    value={editingStory.infoArchitecture}
                    onChange={e => setEditingStory({ ...editingStory, infoArchitecture: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">افکت صوتی و بازخورد</label>
                  <input
                    type="text"
                    value={editingStory.soundEffect}
                    onChange={e => setEditingStory({ ...editingStory, soundEffect: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingStory(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </div>
          )}

          {/* Stories List */}
          <div className="space-y-3">
            {filteredStories.map((story, index) => {
              return (
                <div
                  key={story.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    story.isCompleted
                      ? 'bg-[#101514] border-emerald-500/40 opacity-95'
                      : 'bg-[#111218] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* Checkbox + Title */}
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => handleToggleCompleted(story.id)}
                        className={`mt-0.5 p-1 rounded-lg border transition-all cursor-pointer ${
                          story.isCompleted
                            ? 'bg-emerald-500 text-black border-emerald-400'
                            : 'bg-white/5 text-slate-400 hover:text-white border-white/20'
                        }`}
                        title={story.isCompleted ? 'تیک خورده (تکمیل شده)' : 'کلیک کنید تا تیک بخورد'}
                      >
                        {story.isCompleted ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm sm:text-base font-black ${
                            story.isCompleted ? 'text-emerald-300 line-through' : 'text-white'
                          }`}>
                            {story.title}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                            {story.id}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                            {story.actor}
                          </span>
                          {story.priority === 'CRITICAL' && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                              حیاتی (Critical)
                            </span>
                          )}
                        </div>

                        {/* Story Body */}
                        <p className="text-xs text-slate-300 leading-relaxed font-serif pt-1">
                          {isEn ? (
                            <>
                              As a <strong className="text-amber-400">{story.asA}</strong>, I want to{' '}
                              <strong className="text-white">{story.iWantTo}</strong> so that{' '}
                              <strong className="text-slate-200">{story.soThat}</strong>
                            </>
                          ) : (
                            <>
                              به‌عنوان <strong className="text-amber-400">{story.asA}</strong>، می‌خواهم{' '}
                              <strong className="text-white">{story.iWantTo}</strong> تا اینکه{' '}
                              <strong className="text-slate-200">{story.soThat}</strong>
                            </>
                          )}
                        </p>

                        {/* Acceptance Criteria */}
                        <div className="pt-2">
                          <div className="text-[11px] font-bold text-slate-400 mb-1">
                            {isEn ? 'Acceptance Criteria:' : 'معیارهای پذیرش (Acceptance Criteria):'}
                          </div>
                          <ul className="space-y-1 pr-2">
                            {story.acceptanceCriteria.map((c, idx) => (
                              <li key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${story.isCompleted ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Metadata Strip: Rules, Info Architecture, Sound */}
                        <div className="pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                          <div className="bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5">
                            <span className="text-slate-400 font-bold block">{isEn ? 'Rules & Access:' : 'قوانین و دسترسی:'}</span>
                            <span className="text-slate-200">{story.rulesAndAccess}</span>
                          </div>
                          <div className="bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5">
                            <span className="text-slate-400 font-bold block">{isEn ? 'Info Architecture:' : 'معماری اطلاعات و مسیر:'}</span>
                            <span className="text-slate-200">{story.infoArchitecture}</span>
                          </div>
                          <div className="bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5">
                            <span className="text-slate-400 font-bold block">{isEn ? 'Sound & Feedback:' : 'افکت صوتی و بازخورد:'}</span>
                            <span className="text-amber-300">{story.soundEffect}</span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Action Buttons: Edit, Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          soundEngine.playTick();
                          setEditingStory(story);
                          setIsAddingNew(false);
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-white/10 transition-colors cursor-pointer"
                        title={isEn ? 'Edit Story' : 'ویرایش این داستان کاربری'}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteStory(story.id)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 transition-colors cursor-pointer"
                        title={isEn ? 'Delete Story' : 'حذف داستان کاربری'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}

            {filteredStories.length === 0 && (
              <div className="p-12 text-center text-slate-400 border border-white/5 rounded-2xl bg-white/5">
                {isEn 
                  ? 'No stories found matching your filter or search query.' 
                  : 'موردی یافت نشد. می‌توانید با دکمه بالا داستان کاربری جدید ایجاد کنید.'}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default UserStoriesChecklistModal;
