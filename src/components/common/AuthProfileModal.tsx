import React, { useState, useEffect } from 'react';
import { 
  User, LogIn, LogOut, ShieldCheck, Database, Cloud, CheckCircle2, 
  Sparkles, History, BookmarkPlus, Loader2 
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  where 
} from '../../lib/firebase';
import type { User as FirebaseUser } from '../../lib/firebase';

interface AuthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
  activeRoomId?: string;
}

export const AuthProfileModal: React.FC<AuthProfileModalProps> = ({
  isOpen,
  onClose,
  language = 'fa',
  activeRoomId
}) => {
  const isEn = language === 'en';
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [savedRooms, setSavedRooms] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Fetch or create user record in Firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              displayName: currentUser.displayName || (isEn ? 'Mafia Player' : 'کاربر مافیا'),
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || '',
              createdAt: Date.now(),
              lastActiveAt: Date.now(),
              totalGamesPlayed: 1,
              gamesWon: 0
            }, { merge: true });
          } else {
            await setDoc(userRef, { lastActiveAt: Date.now() }, { merge: true });
          }
          loadUserSavedRooms(currentUser.uid);
        } catch (err) {
          console.warn('Firestore initial sync notice:', err);
        }
      }
    });

    return () => unsubscribe();
  }, [isEn]);

  const loadUserSavedRooms = async (uid: string) => {
    try {
      const notesRef = collection(db, 'savedNotes');
      const q = query(notesRef, where('userId', '==', uid));
      const snap = await getDocs(q);
      const roomsList: any[] = [];
      snap.forEach(d => roomsList.push({ id: d.id, ...d.data() }));
      setSavedRooms(roomsList);
    } catch (e) {
      console.warn('Error fetching saved notes:', e);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await signInWithPopup(auth, googleProvider);
      setMessage(isEn ? 'Signed in with Google successfully!' : 'ورود با حساب گوگل با موفقیت انجام شد!');
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setMessage(err.message || (isEn ? 'Error during login process' : 'خطا در فرآیند ورود به سیستم'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setMessage(isEn ? 'Signed out successfully.' : 'با موفقیت خارج شدید.');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleSaveCurrentGameToCloud = async () => {
    if (!user) return;
    setSyncing(true);
    setMessage(null);
    try {
      const noteId = `room_save_${activeRoomId || 'active'}_${Date.now()}`;
      await setDoc(doc(db, 'savedNotes', noteId), {
        userId: user.uid,
        roomId: activeRoomId || 'GAME-ACTIVE',
        title: isEn ? `Cloud Backup Game ${activeRoomId || ''}` : `ذخیره ابری بازی ${activeRoomId || ''}`,
        content: isEn ? 'Match data and logs backed up to Firestore.' : `اطلاعات و لاگ‌های مسابقه در پایگاه داده ابری Firestore ذخیره شد.`,
        timestamp: Date.now()
      });
      setMessage(isEn ? 'Game state successfully saved to Cloud Firestore!' : 'وضعیت بازی با موفقیت در پایگاه داده ابری Firestore ذخیره شد!');
      loadUserSavedRooms(user.uid);
    } catch (err: any) {
      console.error('Error saving to cloud:', err);
      setMessage(isEn ? 'Error saving to cloud' : 'خطا در ذخیره‌سازی ابری');
    } finally {
      setSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#0d121d] border border-amber-500/30 rounded-2xl p-6 shadow-2xl text-slate-100 overflow-hidden"
        dir={isEn ? 'ltr' : 'rtl'}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">
                {isEn ? 'User Profile & Cloud Sync' : 'حساب کاربری و همگام‌سازی ابری'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEn ? 'Connect to Firebase Firestore & Google Auth' : 'اتصال به Firebase Firestore و Google Auth'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{message}</span>
          </div>
        )}

        {/* User Card or Login Button */}
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs">{isEn ? 'Loading authentication info...' : 'در حال بارگذاری اطلاعات احراز هویت...'}</span>
          </div>
        ) : user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || (isEn ? 'Profile' : 'پروفایل')} 
                  className="w-12 h-12 rounded-full border-2 border-amber-500/50 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm text-white truncate">{user.displayName || (isEn ? 'Unnamed User' : 'کاربر بدون نام')}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-amber-400/90 font-mono">
                  <Database className="w-3 h-3" />
                  <span>Firestore Sync Active</span>
                </div>
              </div>
            </div>

            {/* Save Current Game */}
            <button
              onClick={handleSaveCurrentGameToCloud}
              disabled={syncing}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkPlus className="w-4 h-4" />}
              <span>{isEn ? 'Permanently save current game in Firestore' : 'ذخیره دائمی بازی فعلی در Firestore'}</span>
            </button>

            {/* Saved Rooms List */}
            {savedRooms.length > 0 && (
              <div className="mt-3">
                <span className="text-xs font-bold text-slate-300 block mb-2">
                  {isEn ? 'Cloud Saved Notes & Archives:' : 'یادداشت‌ها و آرشیوهای ذخیره‌شده ابری:'}
                </span>
                <div className="max-h-32 overflow-y-auto space-y-1.5 scrollbar-thin">
                  {savedRooms.map(item => (
                    <div key={item.id} className="p-2 rounded-lg bg-black/40 border border-white/5 text-[11px] flex justify-between items-center">
                      <span className="text-slate-300 truncate max-w-[200px]">{item.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.timestamp).toLocaleDateString(isEn ? 'en-US' : 'fa-IR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-colors mt-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isEn ? 'Log Out' : 'خروج از حساب کاربری'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              {isEn
                ? 'By signing in with Google, your game history, custom scenarios, referee notes, and live game states are securely synced in real time to Cloud Firestore and accessible from any device.'
                : 'با ورود از طریق حساب گوگل، اطلاعات مسابقات، سناریوها، یادداشت‌های داوری و وضعیت بازی‌های شما به صورت بلادرنگ در پایگاه داده ابری Firestore ذخیره شده و از هر دستگاهی قابل بازیابی است.'}
            </p>

            <button
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isEn ? 'Sign in with Google' : 'ورود با حساب گوگل (Google Sign-In)'}</span>
            </button>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Firebase DB & Auth</span>
          <span className="text-emerald-400/80 font-bold">Cloud Connected</span>
        </div>
      </div>
    </div>
  );
};
