import React, { useState } from 'react';
import { 
  Video, Mic, MicOff, Copy, ExternalLink, Check, 
  Sparkles, Radio, Shield, Globe, Share2, AlertCircle, X
} from 'lucide-react';
import { Language, RoomState } from '../../types/mafia';
import { soundEngine } from '../../utils/audioSynth';

interface OnlineMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: RoomState | null;
  isHost?: boolean;
  language: Language;
  onUpdateMeetingLink?: (url: string, platform: 'google_meet' | 'discord' | 'jitsi' | 'telegram' | 'custom') => void;
}

export const OnlineMeetingModal: React.FC<OnlineMeetingModalProps> = ({
  isOpen,
  onClose,
  room,
  isHost = false,
  language,
  onUpdateMeetingLink
}) => {
  const currentMeetingUrl = room?.meetingUrl || (room ? `https://meet.jit.si/MafiaGod_${room.roomId}` : '');
  const currentPlatform = room?.meetingPlatform || 'jitsi';

  const [inputUrl, setInputUrl] = useState(room?.meetingUrl || '');
  const [selectedPlatform, setSelectedPlatform] = useState<'google_meet' | 'discord' | 'jitsi' | 'telegram' | 'custom'>(currentPlatform);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const isRtl = language !== 'en';

  const handleCopy = () => {
    if (currentMeetingUrl) {
      navigator.clipboard.writeText(currentMeetingUrl);
      setCopied(true);
      soundEngine.playTick();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoin = () => {
    soundEngine.playGong();
    if (currentMeetingUrl) {
      window.open(currentMeetingUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSaveMeeting = () => {
    if (onUpdateMeetingLink) {
      soundEngine.playTick();
      onUpdateMeetingLink(inputUrl.trim(), selectedPlatform);
      setIsEditing(false);
    }
  };

  const handleGenerateInstantJitsi = () => {
    if (room) {
      const jitsiUrl = `https://meet.jit.si/MafiaGod_${room.roomId}`;
      setInputUrl(jitsiUrl);
      setSelectedPlatform('jitsi');
      if (onUpdateMeetingLink) {
        onUpdateMeetingLink(jitsiUrl, 'jitsi');
      }
      soundEngine.playTick();
      setIsEditing(false);
    }
  };

  const handleOpenNewGoogleMeet = () => {
    window.open('https://meet.google.com/new', '_blank', 'noopener,noreferrer');
  };

  // Translations
  const t = {
    fa: {
      title: 'اتاق صوتی و تصویری آنلاین بازی',
      subtitle: 'اتصال بازیکنان از طریق گوگل میت، دیسکورد یا جیتسی',
      activeCall: 'اتاق گفتگوی زنده فعال است',
      noCall: 'هنوز لینکی ثبت نشده است',
      joinCall: 'ورود به تماس صوتی / ویدیویی',
      copyLink: 'کپی لینک تماس',
      copied: 'کپی شد!',
      editLink: 'تغییر لینک تماس',
      saveLink: 'ذخیره و همگام‌سازی با همه بازیکنان',
      cancel: 'انصراف',
      instantJitsi: 'ساخت فوری اتاق جیتسی (رایگان و بدون فیلتر/لاگین)',
      openGoogleMeet: 'ساخت گوگل میت جدید در تب دیگر',
      enterDiscord: 'وارد کردن لینک سرور دیسکورد',
      platform: 'پلتفرم انتخابی:',
      meetingUrlLabel: 'آدرس لینک جلسه (URL):',
      rulesTitle: 'قوانین مکالمه صوتی در بازی:',
      ruleNight: '🌙 در فاز شب همه بازیکنان باید میکروفون خود را قطع (Mute) کنند.',
      ruleDay: '☀️ در فاز روز فقط بازیکنی که نوبت صحبت یا چالش دارد صحبت می‌کند.',
      ruleSpeaker: '⏱️ تایمر صحبت بالای صفحه به صورت هماهنگ برای همه فعال است.',
      close: 'بستن'
    },
    en: {
      title: 'Online Voice & Video Room',
      subtitle: 'Connect with players via Google Meet, Discord, or Jitsi',
      activeCall: 'Live Meeting Room is Active',
      noCall: 'No meeting link set yet',
      joinCall: 'Join Voice / Video Call',
      copyLink: 'Copy Meeting Link',
      copied: 'Copied!',
      editLink: 'Change Meeting Link',
      saveLink: 'Save & Broadcast to All Players',
      cancel: 'Cancel',
      instantJitsi: 'Generate Instant Jitsi Room (Free, No Login)',
      openGoogleMeet: 'Create New Google Meet in new tab',
      enterDiscord: 'Enter Discord Channel Invite',
      platform: 'Platform:',
      meetingUrlLabel: 'Meeting Link (URL):',
      rulesTitle: 'Online Voice Etiquette:',
      ruleNight: '🌙 During Night Phase, everyone must stay muted.',
      ruleDay: '☀️ During Day Phase, only the designated speaker may unmute.',
      ruleSpeaker: '⏱️ The synchronized turn timer is tracked on screen.',
      close: 'Close'
    },
    ar: {
      title: 'غرفة المحادثة الصوتية والمرئية أونلاين',
      subtitle: 'تواصل مع اللاعبين عبر غوغل ميت، ديسكورد أو جيتسي',
      activeCall: 'الغرفة الصوتية المباشرة نشطة',
      noCall: 'لم يتم تعيين رابط بعد',
      joinCall: 'الانضمام للمحادثة الصوتية / الفيديو',
      copyLink: 'نسخ رابط الغرفة',
      copied: 'تم النسخ!',
      editLink: 'تعديل الرابط',
      saveLink: 'حفظ وتحديث لجميع اللاعبين',
      cancel: 'إلغاء',
      instantJitsi: 'إنشاء غرفة جيتسي فورية مجانية (بدون تسجيل)',
      openGoogleMeet: 'إنشاء اجتماع غوغل ميت في نافذة جديدة',
      enterDiscord: 'إدخال رابط ديسكورد',
      platform: 'المنصة:',
      meetingUrlLabel: 'رابط الاجتماع:',
      rulesTitle: 'قواعد التحدث الصوتي:',
      ruleNight: '🌙 في الليل، يجب على الجميع كتم الصوت تماماً.',
      ruleDay: '☀️ في النهار، يتحدث فقط من جاء دوره أو يمتلك التحدي.',
      ruleSpeaker: '⏱️ مؤقت الحديث يظهر متزامناً للجميع على الشاشة.',
      close: 'إغلاق'
    },
    tr: {
      title: 'Çevrimiçi Ses ve Video Odası',
      subtitle: 'Google Meet, Discord veya Jitsi ile oyuncularla sesli oynayın',
      activeCall: 'Canlı Görüşme Odası Aktif',
      noCall: 'Henüz görüşme linki ayarlanmadı',
      joinCall: 'Sesli / Görüntülü Aramaya Katıl',
      copyLink: 'Görüşme Linkini Kopyala',
      copied: 'Kopyalandı!',
      editLink: 'Görüşme Linkini Değiştir',
      saveLink: 'Kaydet ve Herkese Duyur',
      cancel: 'İptal',
      instantJitsi: 'Anında Jitsi Odası Oluştur (Ücretsiz, Girişsiz)',
      openGoogleMeet: 'Yeni sekmede Google Meet başlat',
      enterDiscord: 'Discord Davet Linki Gir',
      platform: 'Platform:',
      meetingUrlLabel: 'Toplantı Linki (URL):',
      rulesTitle: 'Sesli Oyun Kuralları:',
      ruleNight: '🌙 Gece fazında tüm oyuncular mikrofonlarını kapatmalıdır.',
      ruleDay: '☀️ Gündüz sadece söz sırası olan veya meydan okuyan konuşur.',
      ruleSpeaker: '⏱️ Senkronize konuşma süresi ekranda akar.',
      close: 'Kapat'
    }
  }[language] || {
    title: 'اتاق صوتی و تصویری آنلاین بازی',
    subtitle: 'اتصال بازیکنان از طریق گوگل میت، دیسکورد یا جیتسی',
    activeCall: 'اتاق گفتگوی زنده فعال است',
    noCall: 'هنوز لینکی ثبت نشده است',
    joinCall: 'ورود به تماس صوتی / ویدیویی',
    copyLink: 'کپی لینک تماس',
    copied: 'کپی شد!',
    editLink: 'تغییر لینک تماس',
    saveLink: 'ذخیره و همگام‌سازی با همه بازیکنان',
    cancel: 'انصراف',
    instantJitsi: 'ساخت فوری اتاق جیتسی (رایگان و بدون فیلتر/لاگین)',
    openGoogleMeet: 'ساخت گوگل میت جدید در تب دیگر',
    enterDiscord: 'وارد کردن لینک سرور دیسکورد',
    platform: 'پلتفرم انتخابی:',
    meetingUrlLabel: 'آدرس لینک جلسه (URL):',
    rulesTitle: 'قوانین مکالمه صوتی در بازی:',
    ruleNight: '🌙 در فاز شب همه بازیکنان باید میکروفون خود را قطع (Mute) کنند.',
    ruleDay: '☀️ در فاز روز فقط بازیکنی که نوبت صحبت یا چالش دارد صحبت می‌کند.',
    ruleSpeaker: '⏱️ تایمر صحبت بالای صفحه به صورت هماهنگ برای همه فعال است.',
    close: 'بستن'
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'google_meet':
        return '📹';
      case 'discord':
        return '🎮';
      case 'telegram':
        return '✈️';
      case 'jitsi':
      default:
        return '🌐';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#0f1015] border border-white/20 rounded-3xl w-full max-w-lg p-5 sm:p-7 shadow-2xl space-y-6 text-white relative overflow-hidden"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-amber-500 to-indigo-500" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/10">
              🎙️
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>{t.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  LIVE CALL
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{t.subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Call Status Card */}
        <div className="p-4 rounded-2xl bg-[#14151f] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-xs font-black text-emerald-400">{t.activeCall}</span>
            </div>
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <span>{getPlatformIcon(currentPlatform)}</span>
              <span className="capitalize">{currentPlatform.replace('_', ' ')}</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2 overflow-hidden">
            <div className="text-xs font-mono text-cyan-300 truncate select-all">
              {currentMeetingUrl || 'https://meet.jit.si/MafiaGod_...'}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title={t.copyLink}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.copied : t.copyLink}</span>
              </button>
            </div>
          </div>

          {/* Primary Action Button: Join Live Call */}
          <button
            onClick={handleJoin}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Video className="w-4 h-4 text-black" />
            <span>{t.joinCall}</span>
            <ExternalLink className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Host Controls: Change / Configure Link */}
        {isHost && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <Radio className="w-4 h-4" />
                <span>تنظیمات تماس گرداننده</span>
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                >
                  {t.editLink}
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-400 hover:text-slate-300 cursor-pointer"
                >
                  {t.cancel}
                </button>
              )}
            </div>

            {/* Quick 1-Click Meeting Generators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleGenerateInstantJitsi}
                className="p-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-200 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>اتاق رایگان Jitsi (بدون فیلتر)</span>
              </button>

              <button
                onClick={handleOpenNewGoogleMeet}
                className="p-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-200 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.openGoogleMeet}</span>
              </button>
            </div>

            {/* Editing Form */}
            {isEditing && (
              <div className="space-y-3 pt-2 border-t border-white/10 animate-in fade-in">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">{t.platform}</label>
                  <div className="grid grid-cols-4 gap-1 text-xs">
                    {(['google_meet', 'discord', 'jitsi', 'telegram'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSelectedPlatform(p)}
                        className={`py-1.5 px-2 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                          selectedPlatform === p 
                            ? 'bg-amber-500 text-black border-amber-500' 
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {p === 'google_meet' ? 'Meet' : p === 'discord' ? 'Discord' : p === 'jitsi' ? 'Jitsi' : 'Telegram'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">{t.meetingUrlLabel}</label>
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://meet.google.com/xyz-abcd-efg or https://discord.gg/..."
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    dir="ltr"
                  />
                </div>

                <button
                  onClick={handleSaveMeeting}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>{t.saveLink}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Voice Rules & Etiquette Checklist */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs text-slate-300">
          <div className="font-bold text-amber-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>{t.rulesTitle}</span>
          </div>
          <ul className="space-y-1.5 text-[11px] leading-relaxed text-slate-300">
            <li>{t.ruleNight}</li>
            <li>{t.ruleDay}</li>
            <li>{t.ruleSpeaker}</li>
          </ul>
        </div>

      </div>
    </div>
  );
};
