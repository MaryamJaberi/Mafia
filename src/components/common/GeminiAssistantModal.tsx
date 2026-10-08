import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, Zap, Brain, MessageSquare, 
  Search, MapPin, ExternalLink, Compass, Loader2, RefreshCw, X 
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  sources?: { title: string; uri: string }[];
  places?: { title: string; uri: string }[];
}

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
  language = 'fa'
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'search' | 'maps'>('chat');
  const [modelTier, setModelTier] = useState<'fast' | 'general' | 'complex'>('general');
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      role: 'model',
      content: 'درود! من هوش مصنوعی مشاور و داور ارشد مافیا با مدل‌های Gemini هستم. می‌توانید سوالات قوانین، روانشناسی و تحلیل سناریو را از من بپرسید، یا از زبانه جستجوی زنده و مکان‌یاب کافه‌ها و تورنمنت‌ها استفاده کنید.',
      timestamp: Date.now()
    }
  ]);

  // Search grounding specific state
  const [searchHistory, setSearchHistory] = useState<{ query: string; answer: string; sources: any[] }[]>([]);
  
  // Maps grounding specific state
  const [mapsResults, setMapsResults] = useState<{ query: string; answer: string; places: any[] }[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendChatMessage = async () => {
    if (!inputQuery.trim() || loading) return;

    const userText = inputQuery.trim();
    setInputQuery('');

    const newMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMsg]);
    setLoading(true);

    try {
      // Build conversation payload for multi-turn chat
      const chatHistory = [...messages, newMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          taskType: modelTier,
          systemInstruction: 'شما دستیار ارشد داوری، سناریونویسی و روانشناسی بازی مافیا هستید. پاسخ‌های دقیق، مؤدبانه و کاربردی به زبان فارسی ارائه دهید.'
        })
      });

      const data = await res.json();
      const reply = data.reply || data.fallback || 'پاسخی دریافت نشد.';

      setMessages(prev => [
        ...prev,
        {
          id: `m_${Date.now()}`,
          role: 'model',
          content: reply,
          timestamp: Date.now()
        }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'model',
          content: 'متأسفانه در برقراری ارتباط با مدل هوش مصنوعی خطایی رخ داد. لطفاً دوباره تلاش فرمایید.',
          timestamp: Date.now()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSearchGrounding = async () => {
    if (!inputQuery.trim() || loading) return;
    const query = inputQuery.trim();
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();

      setSearchHistory(prev => [
        {
          query,
          answer: data.answer || 'اطلاعاتی یافت نشد.',
          sources: data.sources || []
        },
        ...prev
      ]);
    } catch (err) {
      console.error('Search grounding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunMapsGrounding = async () => {
    if (!inputQuery.trim() && !mapsResults.length && loading) return;
    const query = inputQuery.trim() || 'کافه بازی و باشگاه مافیا نزدیک';
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();

      setMapsResults(prev => [
        {
          query,
          answer: data.answer || 'مکان‌های پیشنهادی در نقشه گوگل ثبت شد.',
          places: data.places || []
        },
        ...prev
      ]);
    } catch (err) {
      console.error('Maps grounding error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#0b0f19] border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col h-[85vh] text-slate-100 overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#070a11]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white">دستیار هوشمند Gemini مافیا</h3>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                  gemini-3.5-flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400">گفتگوی چندمرحله‌ای، داده‌های زنده Google Search و مکان‌یاب Google Maps</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-between px-5 py-2 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'chat'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>چت‌بات داوری</span>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'search'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>جستجوی زنده (Search Grounding)</span>
            </button>

            <button
              onClick={() => setActiveTab('maps')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'maps'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>مکان‌های بازی (Maps Grounding)</span>
            </button>
          </div>

          {/* Chat Model Speed/Reasoning Selector */}
          {activeTab === 'chat' && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] bg-black/40 p-1 rounded-lg border border-white/5">
              <span className="text-slate-400 px-1">مدل:</span>
              <button
                onClick={() => setModelTier('fast')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  modelTier === 'fast' ? 'bg-cyan-500/30 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
                title="gemini-3.1-flash-lite (سریع و بهینه)"
              >
                سریع (Lite)
              </button>
              <button
                onClick={() => setModelTier('general')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  modelTier === 'general' ? 'bg-amber-500/30 text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
                title="gemini-3.5-flash (استاندارد هوشمند)"
              >
                پیش‌فرض (Flash)
              </button>
            </div>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {/* 1. MULTI-TURN CHAT INTERFACE */}
          {activeTab === 'chat' && (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold">
                      شما
                    </div>
                  )}
                  <div 
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-100 rounded-tr-none'
                        : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span className="block mt-1.5 text-[10px] text-slate-500 font-mono text-left">
                      {new Date(msg.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>هوش مصنوعی در حال تحلیل و تولید پاسخ است...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* 2. GOOGLE SEARCH GROUNDING */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-blue-300 mb-1">
                  <Search className="w-4 h-4" />
                  <span>جستجوی زنده وب با گوگل (Search Grounding)</span>
                </div>
                از مدل <strong>gemini-3.5-flash</strong> به همراه ابزار زنده Google Search برای یافتن آخرین قوانین فدراسیونی، تاریخچه سناریوها و اخبار مسابقات مافیا استفاده کنید.
              </div>

              {searchHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  عبارتی مانند <span className="text-amber-400 font-bold">«قوانین استعلام کارآگاه در تورنمنت مافیا»</span> یا <span className="text-amber-400 font-bold">«تفاوت سناریو زودیاک و بازپرس»</span> را جستجو کنید.
                </div>
              ) : (
                searchHistory.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="font-bold text-amber-300 text-sm flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-amber-400" />
                      <span>{item.query}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{item.answer}</p>
                    
                    {item.sources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-white/10">
                        <span className="text-[11px] font-bold text-slate-400 block mb-1.5">منابع مستند گوگل:</span>
                        <div className="flex flex-wrap gap-2">
                          {item.sources.map((s, sIdx) => (
                            <a
                              key={sIdx}
                              href={s.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 text-[11px] transition-colors"
                            >
                              <span>{s.title || 'منبع وب'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 3. GOOGLE MAPS GROUNDING */}
          {activeTab === 'maps' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-emerald-300 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>مکان‌یاب باشگاه‌ها و کافه‌های مافیا (Maps Grounding)</span>
                </div>
                استفاده از <strong>gemini-3.5-flash</strong> به همراه ابزار گوگل مپ برای کشف کافه‌های بردگیم، ایونت‌های حضوری و لوکیشن‌های بازی به همراه لینک رسمی Google Maps.
              </div>

              {mapsResults.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  عبارتی مانند <span className="text-emerald-400 font-bold">«کافه بازی و باشگاه مافیا در نزدیکی»</span> را وارد کنید یا دکمه جستجو را بزنید.
                </div>
              ) : (
                mapsResults.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                      <Compass className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{item.query}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{item.answer}</p>
                    
                    {item.places.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-white/10">
                        <span className="text-[11px] font-bold text-slate-400 block mb-1.5">موقعیت‌ها و لینک‌های نقشه گوگل:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.places.map((place, pIdx) => (
                            <a
                              key={pIdx}
                              href={place.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs transition-colors"
                            >
                              <span className="truncate">{place.title || 'مشاهده در گوگل مپ'}</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0 mr-1" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-white/10 bg-[#070a11]">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (activeTab === 'chat') handleSendChatMessage();
              else if (activeTab === 'search') handleRunSearchGrounding();
              else handleRunMapsGrounding();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                activeTab === 'chat'
                  ? 'سوال داوری، استراتژی یا تحلیل سناریو را بنویسید...'
                  : activeTab === 'search'
                  ? 'موضوع جستجوی زنده قوانین و اخبار مافیا...'
                  : 'نام شهر یا منطقه جهت یافتن کافه‌های مافیا...'
              }
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 shadow-md shadow-amber-500/20 shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : activeTab === 'chat' ? (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>ارسال</span>
                </>
              ) : activeTab === 'search' ? (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>جستجو</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>مکان‌یابی</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
