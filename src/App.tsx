import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Loader2, AlertCircle, RotateCcw, ExternalLink } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { FirebaseUser } from './types';

// Components
import { Navbar, Footer } from './components/Layout';
import { Home } from './components/Home';
import { BookSelection, ChapterSelection } from './components/QuizSelection';
import { Quiz } from './components/Quiz';
import { Leaderboard } from './components/Leaderboard';
import { Profile } from './components/Profile';
import { Settings } from './components/Settings';
import { MultiplayerLobby } from './components/Multiplayer';
import { AIAssistant } from './components/AIAssistant';
import { AdminNotifications } from './components/AdminNotifications';

// --- Error Boundary ---
class ErrorBoundary extends React.Component<any, any> {
  state: { hasError: boolean, error: any };

  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    if (hasError) {
      let errorMessage = "Something went wrong.";
      if (error && error.message) {
        try {
          const parsed = JSON.parse(error.message);
          if (parsed.error) errorMessage = `Firestore Error: ${parsed.error}`;
        } catch (e) {
          errorMessage = error.message;
        }
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-900">Oops! An error occurred</h2>
            <p className="text-slate-600">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

function AppContent() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authTimeout, setAuthTimeout] = useState(false);
  const isIframe = window.self !== window.top;

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Set a timeout to show a retry button if auth takes too long
    // If in an iframe, show it sooner as it's a common source of issues
    const timer = setTimeout(() => {
      if (!authReady) setAuthTimeout(true);
    }, isIframe ? 4000 : 8000);

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthReady(true);
      clearTimeout(timer);
      if (u) {
        // Sync user profile to Firestore
        try {
          await setDoc(doc(db, 'users', u.uid), {
            uid: u.uid,
            displayName: u.displayName,
            photoURL: u.photoURL,
            email: u.email,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (error) {
          console.error("Error syncing user profile:", error);
        }
      }
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [authReady]);

  if (!authReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center space-y-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
          </div>
        </div>
        
        <div className="space-y-2 max-w-xs">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Connecting to Bible Quiz...</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {authTimeout 
              ? "This is taking longer than usual. Please check your connection or try opening in a new tab." 
              : "Preparing your study session..."}
          </p>
        </div>

        {authTimeout && (
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> Retry Connection
            </button>
            <a 
              href={window.location.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-5 h-5" /> Open in New Tab
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300 flex flex-col">
      <Router>
          <Navbar user={user} darkMode={darkMode} setDarkMode={setDarkMode} />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/select-book" element={<BookSelection />} />
              <Route path="/select-chapter/:bookName" element={<ChapterSelection />} />
              <Route path="/multiplayer" element={<MultiplayerLobby />} />
              <Route path="/quiz/:bookName" element={<Quiz />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              {/* Redirect old quiz path to root */}
              <Route path="/quiz-app" element={<Home />} />
            </Routes>
          </main>

          <Footer />
          <AIAssistant />
        </Router>
      </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
