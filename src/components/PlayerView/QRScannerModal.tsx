import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, X, ArrowLeft, User, 
  Sparkles, CheckCircle2, Shield, AlertCircle, Camera, Keyboard,
  FlipHorizontal, RefreshCw, Clipboard
} from 'lucide-react';
import { Language } from '../../types/mafia';
import { translations, isRtlLanguage } from '../../utils/translations';
import { soundEngine } from '../../utils/audioSynth';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (roomId: string, playerName: string, avatar: string, token?: string) => void;
  language: Language;
  initialRoomId?: string;
  initialToken?: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onJoinRoom,
  language,
  initialRoomId = '',
  initialToken = ''
}) => {
  const t = translations[language] || translations.fa;
  const isRtl = isRtlLanguage(language);
  const isEn = language === 'en';

  const [activeTab, setActiveTab] = useState<'CAMERA' | 'MANUAL'>(initialRoomId ? 'MANUAL' : 'CAMERA');
  const [roomCode, setRoomCode] = useState(initialRoomId);
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🕵️');
  const [errorMsg, setErrorMsg] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialRoomId) {
        setRoomCode(initialRoomId);
        setActiveTab('MANUAL');
      }
      setErrorMsg('');
      setCameraError(null);
    } else {
      stopCamera();
    }
  }, [isOpen, initialRoomId]);

  // Manage Camera Life Cycle
  useEffect(() => {
    if (isOpen && activeTab === 'CAMERA') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(isEn ? 'Camera API is not supported in this browser environment.' : 'دسترسی به دوربین در این مرورگر پشتیبانی نمی‌شود.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError(isEn ? 'Camera permission was denied or camera is unavailable. Please enter code manually.' : 'دسترسی به دوربین داده نشد یا دستگاه دوربین ندارد. لطفاً کد اتاق را به صورت دستی وارد کنید.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const extractRoomAndToken = (rawText: string) => {
    let clean = rawText.trim();
    let detectedRoom = '';
    let detectedToken = initialToken;

    if (clean.includes('join=') || clean.includes('room=')) {
      try {
        const url = new URL(clean.startsWith('http') ? clean : `https://dummy.com/${clean}`);
        detectedRoom = url.searchParams.get('join') || url.searchParams.get('room') || '';
        detectedToken = url.searchParams.get('token') || initialToken;
      } catch {
        // Fallback regex
        const match = clean.match(/[?&](?:join|room)=([A-Z0-9_-]+)/i);
        if (match) detectedRoom = match[1];
      }
    } else {
      detectedRoom = clean.toUpperCase().slice(0, 12);
    }

    if (detectedRoom) {
      setRoomCode(detectedRoom);
      setActiveTab('MANUAL');
      soundEngine.playGong();
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        extractRoomAndToken(text);
      }
    } catch {
      setErrorMsg(isEn ? 'Could not read clipboard. Please paste code manually.' : 'امکان خواندن حافظه موقت وجود نداشت. لطفاً کد را دستی وارد کنید.');
    }
  };

  if (!isOpen) return null;

  const avatars = ['🕵️', '🎩', '🔫', '💉', '🛡️', '⚖️', '🎭', '🕶️', '👑', '🐺', '🍸', '🔍'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setErrorMsg(isEn ? 'Please enter room code.' : 'لطفاً کد اتاق را وارد کنید.');
      return;
    }
    if (!playerName.trim()) {
      setErrorMsg(isEn ? 'Please enter your nickname.' : 'لطفاً نام مستعار خود را وارد کنید.');
      return;
    }

    soundEngine.playTick();
    onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim(), selectedAvatar, initialToken);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-150">
      <div className={`bg-[#0f121d] border border-white/[0.08] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0a0d16]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">{t.joinRoom || (isEn ? 'Join Room' : 'ورود به اتاق')}</h3>
              <p className="text-xs text-slate-400">{isEn ? 'Connect to Narrator’s Live Mafia Game' : 'ورود به لابی آنلاین گرداننده بازی'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer active:scale-95">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Camera vs Manual */}
        <div className="grid grid-cols-2 p-1.5 bg-[#07090f] border-b border-white/[0.06] gap-1.5">
          <button
            type="button"
            onClick={() => {
              soundEngine.playTick();
              setActiveTab('CAMERA');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
              activeTab === 'CAMERA'
                ? 'bg-amber-500 text-black font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{isEn ? 'Camera QR Scanner' : 'اسکن با دوربین'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playTick();
              setActiveTab('MANUAL');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
              activeTab === 'MANUAL'
                ? 'bg-amber-500 text-black font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>{isEn ? 'Manual Code Entry' : 'ورود دستی کد'}</span>
          </button>
        </div>

        {/* Tab 1: Live Camera Scanner */}
        {activeTab === 'CAMERA' && (
          <div className="p-6 space-y-4">
            <div className="relative w-full aspect-square max-w-[280px] mx-auto bg-black rounded-3xl overflow-hidden border-2 border-dashed border-amber-500/40 flex items-center justify-center shadow-xl">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />

              {/* Viewfinder overlay */}
              <div className="absolute inset-6 border-2 border-amber-400 rounded-2xl pointer-events-none">
                <div className="w-full h-0.5 bg-amber-400 shadow-[0_0_12px_#f59e0b] animate-bounce mt-14" />
              </div>

              {!isCameraActive && (
                <div className="absolute inset-0 bg-neutral-950/90 flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <Camera className="w-8 h-8 text-neutral-500" />
                  <p className="text-xs text-neutral-400">
                    {cameraError || (isEn ? 'Looking for QR code...' : 'دوربین در حال آماده‌سازی است...')}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Clipboard className="w-4 h-4 text-amber-400" />
                <span>{isEn ? 'Paste QR / Join Link from Clipboard' : 'خواندن لینک اتاق از کلیپ‌بورد 📋'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('MANUAL')}
                className="w-full py-2 text-neutral-400 hover:text-neutral-200 text-xs font-bold text-center cursor-pointer"
              >
                {isEn ? 'Switch to manual code entry' : 'یا کد ۶ رقمی را دستی وارد کنید →'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Manual Code Entry */}
        {activeTab === 'MANUAL' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {errorMsg && (
              <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Room Code */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">{t.roomCode || (isEn ? 'Room Code' : 'کد اتاق')}:</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  setErrorMsg('');
                }}
                placeholder="مثال: MAFIA-4X8"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono font-black text-amber-400 uppercase tracking-widest placeholder-slate-600 focus:outline-none focus:border-amber-400"
                maxLength={12}
                autoFocus
              />
            </div>

            {/* Player Name */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">{t.playerName || (isEn ? 'Your Nickname' : 'نام مستعار شما')}:</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  setErrorMsg('');
                }}
                placeholder={isEn ? 'Enter your name or alias' : 'نام یا لقب شما در بازی'}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                maxLength={20}
              />
            </div>

            {/* Avatar Picker */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">{t.chooseAvatar || (isEn ? 'Choose Avatar' : 'انتخاب آواتار')}:</label>
              <div className="grid grid-cols-6 gap-2">
                {avatars.map(av => (
                  <button
                    type="button"
                    key={av}
                    onClick={() => setSelectedAvatar(av)}
                    className={`text-2xl p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                      selectedAvatar === av
                        ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-black/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>{isEn ? 'Connect to Game Lobby' : 'اتصال به لابی بازی'}</span>
                <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

