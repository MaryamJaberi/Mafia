import React, { useState } from 'react';
import { 
  Sparkles, X, Send, Newspaper, Edit3, 
  Flame, RefreshCw, Check, BookOpen, Volume2 
} from 'lucide-react';
import { RoomState, Language } from '../../types/mafia';
import { translations } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';

interface DailyChronicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomState;
  onPublishChronicle: (text: string) => void;
  language: Language;
}

export const DailyChronicleModal: React.FC<DailyChronicleModalProps> = ({
  isOpen,
  onClose,
  room,
  onPublishChronicle,
  language
}) => {
  const t = translations[language];

  const [chronicleText, setChronicleText] = useState(room.morningChronicle || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setChronicleText(room.morningChronicle || '');
    }
  }, [isOpen, room.morningChronicle]);

  const generateWithAI = async () => {
    setIsLoading(true);
    soundEngine.playTick();

    try {
      const res = await fetch(`/api/rooms/${room.roomId}/chronicle`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ language })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.chronicle || data.story) {
          setChronicleText(data.chronicle || data.story);
          return;
        }
      }
      throw new Error('Invalid response from chronicle generator');
    } catch (err) {
      console.warn('Failed to generate chronicle from server, using local fallback:', err);
      // Fallback offline narrative
      const deadToday = room.players.filter(p => !p.isAlive).map(p => p.name).join('، ');
      setChronicleText(
        `📰 وقایع‌نامه صبحگاه روز ${room.dayNumber}\n\nشهر در مه غلیظی از خواب بیدار شد. ناقوس کلیسای شهر به صدا درآمد. ${
          deadToday ? `پیکر بی‌جان ${deadToday} در سکوت سهمگین کوچه پیدا شد.` : 'خوشبختانه شب با درایت نگهبانان بدون تلفات سپری شد.'
        }\n\nسایه‌های تاریک مافیا همچنان در کمین‌اند. چشمان خود را باز نگه دارید و به هیچ نجواگری اعتماد نکنید!`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = () => {
    if (!chronicleText.trim()) return;
    soundEngine.playGong();
    onPublishChronicle(chronicleText.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                <span>{t.dailyChronicle}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  نسخه روز {room.dayNumber}
                </span>
              </h3>
              <p className="text-xs text-neutral-400">داستان‌سرایی و روایت سینمایی صبح با هوش مصنوعی</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Newspaper Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          
          <div className="flex items-center justify-between">
            <button
              onClick={generateWithAI}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isLoading ? 'در حال نگارش وقایع‌نامه...' : t.generateAIStory}</span>
            </button>

            <span className="text-xs text-neutral-400">می‌توانید متن را پیش از ارسال ویرایش کنید.</span>
          </div>

          {/* Vintage Newspaper Card Style */}
          <div className="relative rounded-2xl bg-neutral-950 border border-amber-500/30 p-5 shadow-inner">
            <div className="text-center pb-3 border-b border-amber-500/20 mb-4">
              <div className="text-[10px] uppercase font-mono tracking-widest text-amber-400/80">THE MAFIA CHRONICLES • MORNING EDITION</div>
              <h2 className="text-lg font-black text-amber-200 mt-1">روزنامه صبحگاهی شهر سیاه</h2>
              <div className="text-[11px] text-neutral-400 mt-0.5">تاریخ انتشار: روز {room.dayNumber} • تیراژ ویژه گرداننده</div>
            </div>

            <textarea
              value={chronicleText}
              onChange={(e) => setChronicleText(e.target.value)}
              placeholder="روی دکمه تولید با هوش مصنوعی کلیک کنید یا داستان صبحگاه را اینجا تایپ کنید..."
              className="w-full h-52 bg-transparent text-neutral-200 text-xs sm:text-sm font-serif leading-relaxed resize-none focus:outline-none placeholder-neutral-600"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs"
          >
            بستن
          </button>

          <button
            onClick={handlePublish}
            disabled={!chronicleText.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-950 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>انتشار در گوشی تمام بازیکنان</span>
          </button>
        </div>

      </div>
    </div>
  );
};
