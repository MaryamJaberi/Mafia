import React, { useState, useEffect } from 'react';
import { 
  Download, Smartphone, Monitor, CheckCircle, X, 
  Share2, PlusSquare, Sparkles, WifiOff, ShieldCheck, ArrowRight
} from 'lucide-react';
import { Language } from '../../types/mafia';
import { translations, isRtlLanguage } from '../../utils/translations';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PwaInstallBannerProps {
  language: Language;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ language }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [installedSuccessfully, setInstalledSuccessfully] = useState(false);
  const [isIos, setIsIos] = useState(false);

  const t = translations[language] || translations.fa;
  const isRtl = isRtlLanguage(language);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const isAppStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsStandalone(isAppStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(iosDevice);

    // Listen for beforeinstallprompt event (Android / Chrome / Desktop)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setInstalledSuccessfully(true);
      setDeferredPrompt(null);
      setTimeout(() => setShowModal(false), 3000);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalledSuccessfully(true);
      }
      setDeferredPrompt(null);
    } else {
      // If no native prompt (e.g. iOS or already installed or browser limitation), show guidance modal
      setShowModal(true);
    }
  };

  // If already running inside installed standalone PWA, show a minimal badge or omit
  if (isStandalone) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold" dir={isRtl ? 'rtl' : 'ltr'}>
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>{t.pwaInstalled || 'اپلیکیشن نصب‌شده (PWA)'}</span>
      </div>
    );
  }

  return (
    <>
      {/* Top Header / Action Trigger Button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
        title={t.pwaDirectDesc || 'نصب اپلیکیشن روی گوشی یا کامپیوتر'}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <Download className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
        <span>{t.pwaInstallBadge || 'نصب نسخه موبایل / وب (PWA)'}</span>
      </button>

      {/* PWA Install & Testing Guidance Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-[#0f0f12] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#e2e2e7] text-base sm:text-lg">{t.pwaDirectInstall || 'نصب مستقیم برنامه (PWA)'}</h3>
                  <span className="text-xs text-slate-400">{t.pwaDirectDesc || 'اجرا تمام‌صفحه مانند اپ بومی، بدون نیاز به دانلود از استور'}</span>
                </div>
              </div>

              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Message if Installed */}
            {installedSuccessfully ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center space-y-2">
                <CheckCircle className="w-8 h-8 mx-auto text-emerald-400" />
                <h4 className="font-bold text-sm">{t.pwaAddedSuccess || 'برنامه با موفقیت به صفحه اصلی شما افزوده شد!'}</h4>
                <p className="text-xs text-slate-300">{t.pwaUseIconDesc || 'اکنون می‌توانید از آیکون «Mafia OS» در منوی برنامه‌ها استفاده کنید.'}</p>
              </div>
            ) : (
              <>
                {/* One-Click Native Prompt Button (If Browser Supports) */}
                {deferredPrompt ? (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
                    <Sparkles className="w-6 h-6 text-amber-400 mx-auto" />
                    <div>
                      <h4 className="font-bold text-sm text-[#e2e2e7]">{t.pwaBrowserSupported || 'مرورگر شما از نصب مستقیم پشتیبانی می‌کند!'}</h4>
                      <p className="text-xs text-slate-400 mt-1">{t.pwaBrowserDesc || 'با کلیک روی دکمه زیر، اپلیکیشن به عنوان برنامه مستقل روی دستگاه شما نصب می‌شود.'}</p>
                    </div>
                    <button
                      onClick={handleInstallClick}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-98"
                    >
                      <Download className="w-4 h-4" />
                      <span>{t.pwaOneClickBtn || 'نصب یک‌کلیکه اپلیکیشن'}</span>
                    </button>
                  </div>
                ) : null}

                {/* Instructions by Platform */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 block">{t.pwaManualGuide || 'راهنمای نصب دستی بر اساس دستگاه:'}</span>
                  
                  {/* iOS / iPhone / iPad Guide */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    isIos ? 'bg-indigo-500/10 border-indigo-500/40' : 'bg-[#0a0a0c] border-white/5'
                  }`}>
                    <div className="flex items-center gap-2 mb-2 font-bold text-xs text-indigo-300">
                      <Smartphone className="w-4 h-4" />
                      <span>{t.pwaIosTitle || 'آیفون و آیپد (iOS Safari):'}</span>
                      {isIos && <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-400">{t.pwaIosYourDevice || 'دستگاه شما'}</span>}
                    </div>
                    <ol className={`text-xs text-slate-300 space-y-1.5 ${isRtl ? 'pr-4' : 'pl-4'} list-decimal leading-relaxed`}>
                      <li>{t.pwaIosStep1 || 'در پایین مرورگر Safari دکمه Share را لمس کنید.'} <Share2 className="w-3.5 h-3.5 inline text-indigo-400 mx-1" /></li>
                      <li>{t.pwaIosStep2 || 'گزینه Add to Home Screen را انتخاب کنید.'} <PlusSquare className="w-3.5 h-3.5 inline text-indigo-400 mx-1" /></li>
                      <li>{t.pwaIosStep3 || 'در بالا روی Add ضربه بزنید.'}</li>
                    </ol>
                  </div>

                  {/* Android / Chrome Guide */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    !isIos ? 'bg-amber-500/10 border-amber-500/40' : 'bg-[#0a0a0c] border-white/5'
                  }`}>
                    <div className="flex items-center gap-2 mb-2 font-bold text-xs text-amber-300">
                      <Smartphone className="w-4 h-4" />
                      <span>{t.pwaAndroidTitle || 'اندروید و کروم (Android / Chrome):'}</span>
                      {!isIos && <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-400">{t.pwaAndroidYourDevice || 'دستگاه شما'}</span>}
                    </div>
                    <ol className={`text-xs text-slate-300 space-y-1.5 ${isRtl ? 'pr-4' : 'pl-4'} list-decimal leading-relaxed`}>
                      <li>{t.pwaAndroidStep1 || 'روی منوی سه‌نقطه (⋮) در بالای مرورگر کلیک کنید.'}</li>
                      <li>{t.pwaAndroidStep2 || 'گزینه Install app یا Add to Home screen را بزنید.'}</li>
                    </ol>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5 bg-[#0a0a0c] p-2.5 rounded-xl border border-white/5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{t.pwaBenefit1 || 'عملکرد سریع و تمام‌صفحه'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#0a0a0c] p-2.5 rounded-xl border border-white/5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{t.pwaBenefit2 || 'پشتیبانی آفلاین و ذخیره لوکال'}</span>
                  </div>
                </div>
              </>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              {t.pwaClose || 'بستن'}
            </button>

          </div>
        </div>
      )}
    </>
  );
};
