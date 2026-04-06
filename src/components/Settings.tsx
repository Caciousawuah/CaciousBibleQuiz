import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Volume2, 
  VolumeX,
  User,
  Phone,
  Bell,
  MessageCircle,
  Mail,
  ExternalLink,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { LogoGenerator } from './Logo';
import { FlyerGenerator } from './FlyerGenerator';

export function Settings() {
  const [difficulty, setDifficulty] = useState(() => localStorage.getItem('quiz_difficulty') || 'Medium');
  const [quizMode, setQuizMode] = useState(() => localStorage.getItem('quiz_mode') || 'Random');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [muted, setMuted] = useState(() => localStorage.getItem('quiz_muted') === 'true');
  const [phone, setPhone] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneStatus, setPhoneStatus] = useState<string | null>(null);

  React.useEffect(() => {
    async function fetchPhone() {
      if (!auth.currentUser) return;
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setPhone(userDoc.data().phone || '');
      }
    }
    fetchPhone();
  }, []);

  const savePhone = async () => {
    if (!auth.currentUser) return;
    setSavingPhone(true);
    setPhoneStatus(null);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        phone: phone
      });
      setPhoneStatus('Saved successfully!');
      setTimeout(() => setPhoneStatus(null), 3000);
    } catch (error) {
      console.error("Error saving phone:", error);
      setPhoneStatus('Failed to save.');
    } finally {
      setSavingPhone(false);
    }
  };

  const updateDifficulty = (val: string) => {
    setDifficulty(val);
    localStorage.setItem('quiz_difficulty', val);
  };

  const updateQuizMode = (val: string) => {
    setQuizMode(val);
    localStorage.setItem('quiz_mode', val);
  };

  const toggleDarkMode = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    localStorage.setItem('darkMode', String(newVal));
    window.location.reload();
  };

  const toggleMute = () => {
    const newVal = !muted;
    setMuted(newVal);
    localStorage.setItem('quiz_muted', String(newVal));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h2>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Sound Effects</h3>
            <p className="text-sm text-slate-500">Enable or disable quiz sounds</p>
          </div>
          <button 
            onClick={toggleMute}
            className={`p-2 rounded-xl transition-colors ${muted ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
          >
            {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>

        <div className="p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Dark Mode</h3>
            <p className="text-sm text-slate-500">Toggle dark theme</p>
          </div>
          <button 
            onClick={toggleDarkMode}
            className={`w-12 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-blue-600' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${darkMode ? 'right-1' : 'left-1'}`} />
          </button>
        </div>

        <div className="p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Default Difficulty</h3>
            <p className="text-sm text-slate-500">Choose your challenge level</p>
          </div>
          <select 
            value={difficulty}
            onChange={(e) => updateDifficulty(e.target.value)}
            className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-sm font-medium outline-none"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Quiz Mode</h3>
            <p className="text-sm text-slate-500">Select how questions are picked</p>
          </div>
          <select 
            value={quizMode}
            onChange={(e) => updateQuizMode(e.target.value)}
            className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-sm font-medium outline-none"
          >
            <option value="Random">Random</option>
            <option value="By Book">By Book</option>
            <option value="By Chapter">By Chapter</option>
          </select>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Phone Number</h3>
              <p className="text-sm text-slate-500">For WhatsApp & SMS notifications</p>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+233..."
                className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-sm font-medium outline-none w-40"
              />
              <button 
                onClick={savePhone}
                disabled={savingPhone}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {savingPhone ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {phoneStatus && (
            <p className={`text-[10px] font-bold uppercase tracking-widest ${phoneStatus.includes('Failed') ? 'text-red-500' : 'text-emerald-500'}`}>
              {phoneStatus}
            </p>
          )}
        </div>

        {auth.currentUser?.email === 'caciousawuah678@gmail.com' && (
          <div className="p-6 bg-blue-50 dark:bg-blue-900/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-blue-900 dark:text-blue-100">Notification Center</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">Broadcast messages to scholars</p>
              </div>
              <Link 
                to="/admin/notifications"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Bell className="w-4 h-4" /> Open Tool
              </Link>
            </div>
          </div>
        )}

        {auth.currentUser?.email === 'caciousawuah678@gmail.com' && (
          <div className="space-y-6">
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              <LogoGenerator />
              <FlyerGenerator />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Support & Feedback</h3>
          <p className="text-slate-500 font-medium">Need help or have a suggestion? We're here for you.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a 
            href="https://wa.me/233554898881" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-900/30 hover:scale-[1.02] transition-all group"
          >
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/20">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">WhatsApp Support</p>
              <p className="text-xs text-slate-500">Chat with the developer</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-300 ml-auto group-hover:text-green-600" />
          </a>

          <a 
            href="mailto:caciousawuah678@gmail.com"
            className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 hover:scale-[1.02] transition-all group"
          >
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Email Support</p>
              <p className="text-xs text-slate-500">Send us your feedback</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-300 ml-auto group-hover:text-blue-600" />
          </a>
        </div>
      </div>

      <Link to="/" className="block text-center text-blue-600 font-bold hover:underline">
        Back to Home
      </Link>
    </div>
  );
}
