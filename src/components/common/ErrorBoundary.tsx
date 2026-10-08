import React from 'react';
import { AlertTriangle, RefreshCw, Bug, Wrench, RotateCcw } from 'lucide-react';
import { bugTracker } from '../../utils/bugTracker';
import { BugReportModal } from './BugReportModal';
import { Language } from '../../types/mafia';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  language?: Language;
  onRecover?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  isBugModalOpen: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isBugModalOpen: false
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // Auto-dispatch crash report to server
    bugTracker.captureAutoReport({
      type: 'CRASH',
      title: `خطای رندر رابط کاربری: ${error.message}`,
      errorMessage: error.message,
      errorStack: `${error.stack}\n\nComponent Stack:\n${errorInfo.componentStack}`
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRecover) {
      this.props.onRecover();
    }
  };

  public render() {
    if (this.state.hasError) {
      const isFa = this.props.language !== 'en';

      return (
        <div className="min-h-screen bg-[#070a0f] text-slate-100 flex items-center justify-center p-4" dir={isFa ? 'rtl' : 'ltr'}>
          <div className="max-w-xl w-full bg-[#0e111a] border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in fade-in">
            
            <div className="w-16 h-16 rounded-3xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-lg shadow-rose-500/10">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {isFa ? 'سامانه تشخیص خطای بازی مافیا' : 'Game Exception Detected'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                {isFa 
                  ? 'یک خطای غیرمنتظره در رندر متوقف‌کننده شناسایی شد. جزئیات به صورت خودکار ثبت و برای تیم توسعه ارسال شد تا در آپدیت بعدی اصلاح شود.' 
                  : 'An unexpected runtime error occurred. Diagnostics were auto-captured and dispatched to developers.'}
              </p>
            </div>

            {/* Error Message Box */}
            {this.state.error && (
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-right font-mono text-xs text-rose-300 overflow-x-auto max-h-36">
                <div className="font-bold text-rose-400 mb-1">{this.state.error.name}:</div>
                <div>{this.state.error.message}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                <span>{isFa ? 'بازیابی وضعیت و ادامه بازی' : 'Recover & Resume'}</span>
              </button>

              <button
                onClick={() => this.setState({ isBugModalOpen: true })}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Bug className="w-4 h-4 text-rose-400" />
                <span>{isFa ? 'گزارش باگ و مشاهده لاگ' : 'Bug Report / Logs'}</span>
              </button>

              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isFa ? 'تازه‌سازی صفحه' : 'Reload'}</span>
              </button>
            </div>

          </div>

          {this.state.isBugModalOpen && (
            <BugReportModal
              isOpen={this.state.isBugModalOpen}
              onClose={() => this.setState({ isBugModalOpen: false })}
              language={this.props.language || 'fa'}
              initialError={this.state.error ? { message: this.state.error.message, stack: this.state.error.stack } : null}
              onEmergencyUnstick={this.handleReset}
            />
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
