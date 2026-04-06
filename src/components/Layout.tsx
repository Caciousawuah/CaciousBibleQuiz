import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Settings as SettingsIcon, 
  Trophy, 
  Play, 
  Moon, 
  Sun, 
  UserCircle,
  LogOut,
  MessageCircle,
  Sparkles,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { auth, db } from '../firebase';
import { signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { FirebaseUser } from '../types';
import { Logo } from './Logo';

export function Navbar({ user, darkMode, setDarkMode }: { user: FirebaseUser | null, darkMode: boolean, setDarkMode: (v: boolean) => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [userCount, setUserCount] = React.useState<number | null>(null);
  const isAdmin = user?.email === 'caciousawuah678@gmail.com';

  React.useEffect(() => {
    if (isAdmin) {
      const fetchCount = async () => {
        try {
          const snapshot = await getDocs(collection(db, 'users'));
          setUserCount(snapshot.size);
        } catch (err) {
          console.error(err);
        }
      };
      fetchCount();
    }
  }, [isAdmin]);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Add custom parameters to help with mobile webviews
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Error signing in:", error);
      let msg = "Failed to sign in. Please try again.";
      
      if (error.code === 'auth/popup-blocked') {
        msg = "The sign-in popup was blocked by your browser. Please enable popups or try opening the app in a new tab.";
      } else if (error.code === 'auth/unauthorized-domain') {
        msg = "This domain is not authorized for sign-in. Please contact the developer to add this URL to the Firebase Console.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        msg = "Sign-in was cancelled. Please try again.";
      } else if (error.code === 'auth/network-request-failed') {
        msg = "Network error. Please check your internet connection and try again.";
      }
      
      alert(msg);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <Logo className="w-10 h-10" />
          <div className="hidden sm:block">
            <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">CACIOUS</span>
            <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">Bible Quiz</span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <Link to="/" className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${location.pathname === '/' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Home</Link>
            <Link to="/leaderboard" className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${location.pathname === '/leaderboard' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Leaderboard</Link>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link 
                to="/admin/notifications"
                className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-200 transition-all"
                title="Admin Panel"
              >
                <Users className="w-4 h-4 sm:w-5 h-5" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Users</span>
                  <span className="text-xs font-black">{userCount ?? '...'}</span>
                </div>
              </Link>
            )}

            <button 
              onClick={() => {
                const newVal = !darkMode;
                setDarkMode(newVal);
                localStorage.setItem('darkMode', String(newVal));
              }}
              className="p-3 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5 sm:w-5 h-5" /> : <Moon className="w-5 h-5 sm:w-5 h-5" />}
            </button>
            
            <Link 
              to="/settings"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800"
            >
              <SettingsIcon className="w-5 h-5" />
            </Link>

            <a 
              href="https://wa.me/233554898881" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800 transition-all border border-green-200 dark:border-green-800 flex items-center gap-2"
              title="Support"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="hidden lg:block text-xs font-bold uppercase tracking-widest">Support</span>
            </a>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[100px]">{user.displayName}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Scholar</p>
                </div>
                <div className="relative group">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-10 h-10 rounded-xl border-2 border-white dark:border-slate-800 shadow-sm cursor-pointer" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white cursor-pointer shadow-lg shadow-blue-500/20">
                      <UserCircle className="w-6 h-6" />
                    </div>
                  )}
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <button onClick={handleSignOut} className="w-full px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleGoogleSignIn}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
              >
                <Play className="w-4 h-4" /> Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12 px-4 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Logo className="w-12 h-12" />
            <div>
              <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">CACIOUS</span>
              <span className="block text-xs font-bold text-blue-600 uppercase tracking-widest leading-none">Bible Quiz</span>
            </div>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
            An AI-powered Bible study platform designed to help believers grow in their knowledge of the Word through interactive quizzes and real-time challenges.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
              <li><Link to="/select-book" className="hover:text-blue-600 transition-colors">Start Quiz</Link></li>
              <li><Link to="/leaderboard" className="hover:text-blue-600 transition-colors">Leaderboard</Link></li>
              <li><Link to="/multiplayer" className="hover:text-blue-600 transition-colors">Multiplayer</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs">Community</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="https://wa.me/233554898881" className="hover:text-blue-600 transition-colors">Support</a></li>
              <li><Link to="/settings" className="hover:text-blue-600 transition-colors">Settings</Link></li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" /> CaciousBibleQuiz
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              The ultimate AI-powered Bible study platform for scholars and believers worldwide.
            </p>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center md:text-left">
            © {new Date().getFullYear()} Cacious Dev. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
