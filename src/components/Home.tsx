import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Clock, 
  Timer, 
  Trophy, 
  Users, 
  Mail, 
  Phone, 
  MessageCircle,
  Facebook,
  Sparkles, 
  Loader2 
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { generateQuestions, askBibleQuestion } from '../services/geminiService';
import { BIBLE_BOOKS } from '../constants';
import { Logo } from './Logo';

export function Home() {
  const [dailyVerse, setDailyVerse] = useState<{ text: string, reference: string } | null>(null);
  const [loadingVerse, setLoadingVerse] = useState(true);
  const [reflection, setReflection] = useState<string | null>(null);
  const [loadingReflection, setLoadingReflection] = useState(false);

  const [userCount, setUserCount] = useState<number | null>(null);
  const isAdmin = auth.currentUser?.email === 'caciousawuah678@gmail.com';

  useEffect(() => {
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

  const generateReflection = async () => {
    if (!dailyVerse || loadingReflection) return;
    setLoadingReflection(true);
    try {
      const response = await askBibleQuestion(`Provide a short, encouraging 2-sentence devotional reflection on this verse: ${dailyVerse.text} (${dailyVerse.reference})`);
      setReflection(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReflection(false);
    }
  };

  useEffect(() => {
    async function fetchDailyVerse() {
      try {
        const randomBook = BIBLE_BOOKS[Math.floor(Math.random() * BIBLE_BOOKS.length)];
        const randomChapter = Math.floor(Math.random() * randomBook.chapters) + 1;
        const response = await generateQuestions(randomBook.name, randomChapter, 'Easy', 1);
        if (response && response.length > 0) {
          setDailyVerse({ text: response[0].text, reference: response[0].verse });
        }
      } catch (error) {
        console.error("Failed to fetch daily verse:", error);
      } finally {
        setLoadingVerse(false);
      }
    }
    fetchDailyVerse();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full inline-block mb-4">
          <Logo className="w-32 h-32" />
        </div>
        <div className="relative w-full max-w-lg mx-auto aspect-video rounded-3xl overflow-hidden shadow-2xl mb-8 group">
          <img 
            src="https://picsum.photos/seed/bible-quiz-hero/800/450" 
            alt="Bible Quiz Hero" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent"></div>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-none uppercase">
          CACIOUS <span className="text-blue-600">BIBLE QUIZ</span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-md mx-auto font-medium">
          Test your knowledge of the Word and grow in your faith.
        </p>
      </motion.div>

      {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-200 dark:border-blue-800 flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Admin Dashboard</h3>
              <p className="text-sm text-slate-500 font-medium">Quick overview of your scholars</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400 leading-none">{userCount ?? '...'}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Scholars</div>
          </div>
          <Link to="/admin/notifications" className="absolute inset-0 rounded-3xl" title="Go to Notification Center" />
        </motion.div>
      )}

      {dailyVerse && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Logo className="w-32 h-32" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-blue-100 text-xs font-bold uppercase tracking-widest">
              <Clock className="w-4 h-4" /> Verse of the Day
            </div>
            <p className="text-xl font-serif italic leading-relaxed">
              "{dailyVerse.text}"
            </p>
            <p className="text-right font-bold text-blue-100">— {dailyVerse.reference}</p>

            <div className="pt-4 border-t border-white/20">
              {reflection ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  <p className="text-sm font-bold text-blue-100 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> AI Reflection
                  </p>
                  <p className="text-sm leading-relaxed text-white/90">{reflection}</p>
                </motion.div>
              ) : (
                <button 
                  onClick={generateReflection}
                  disabled={loadingReflection}
                  className="text-xs font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-all flex items-center gap-2"
                >
                  {loadingReflection ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Get AI Reflection
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
        <Link to="/select-book" className="group relative overflow-hidden rounded-2xl bg-blue-600 p-8 text-white transition-all hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Start Quiz</h2>
              <p className="text-blue-100">Test your knowledge</p>
            </div>
            <Play className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        <Link to="/quiz/Daily?difficulty=Hard&daily=true" className="group relative overflow-hidden rounded-2xl bg-amber-600 p-8 text-white transition-all hover:bg-amber-700 shadow-lg shadow-amber-200 dark:shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Daily Challenge</h2>
              <p className="text-amber-100">Same quiz for everyone</p>
            </div>
            <Timer className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        <Link to="/leaderboard" className="group relative overflow-hidden rounded-2xl bg-indigo-600 p-8 text-white transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Leaderboard</h2>
              <p className="text-indigo-100">View top scholars</p>
            </div>
            <Trophy className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        <Link to="/multiplayer" className="group relative overflow-hidden rounded-2xl bg-emerald-600 p-8 text-white transition-all hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Multiplayer</h2>
              <p className="text-emerald-100">Challenge friends</p>
            </div>
            <Users className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Link Up with the Developer</h2>
          <p className="text-slate-500">Have feedback or want to connect? Reach out!</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="mailto:caciousawuah678@gmail.com" className="flex flex-col items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group">
            <Mail className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white truncate w-full text-center">caciousawuah678@gmail.com</span>
          </a>
          
          <a href="tel:0554898881" className="flex flex-col items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group">
            <Phone className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contact</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">0554898881</span>
          </a>

          <a href="https://wa.me/233554898881" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group">
            <MessageCircle className="w-6 h-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">WhatsApp</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">Chat Now</span>
          </a>

          <a href="https://facebook.com/cacious.awuah" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group">
            <Facebook className="w-6 h-6 text-blue-800 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Facebook</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">Follow</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
