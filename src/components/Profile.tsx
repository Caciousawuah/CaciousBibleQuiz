import React, { useState, useEffect } from 'react';
import { 
  User, 
  Trophy, 
  Target, 
  Zap, 
  Award, 
  Calendar,
  Settings as SettingsIcon,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ProgressDashboard } from './Leaderboard';

export function Profile() {
  const [stats, setStats] = useState<any>(null);
  const [recentScores, setRecentScores] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const u = auth.currentUser;

    // Fetch stats
    const unsubscribeStats = onSnapshot(collection(db, 'users', u.uid, 'stats'), (snapshot) => {
      if (!snapshot.empty) {
        setStats(snapshot.docs[0].data());
      }
    });

    // Fetch recent scores
    const scoresQuery = query(
      collection(db, 'scores'), 
      where('userId', '==', u.uid),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const unsubscribeScores = onSnapshot(scoresQuery, (snapshot) => {
      setRecentScores(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Fetch achievements
    const unsubscribeAchievements = onSnapshot(collection(db, 'users', u.uid, 'achievements'), (snapshot) => {
      setAchievements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeStats();
      unsubscribeScores();
      unsubscribeAchievements();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  const user = auth.currentUser;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-32 h-32 rounded-3xl border-4 border-white dark:border-slate-700 shadow-2xl" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-32 h-32 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl">
                <User className="w-16 h-16" />
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg">
              <Zap className="w-5 h-5 fill-current" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{user?.displayName}</h2>
            <p className="text-slate-500 font-medium">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest">Master Scholar</span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Joined {new Date(user?.metadata.creationTime || '').toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <Link to="/settings" className="p-4 bg-slate-100 dark:bg-slate-700 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors">
              <SettingsIcon className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats Column */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center space-y-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 mx-auto">
                <Trophy className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalScore || 0}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Points</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center space-y-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 mx-auto">
                <Target className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.quizzesCompleted || 0}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Quizzes</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Recent Achievements
            </h3>
            <div className="space-y-3">
              {achievements.length > 0 ? achievements.map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{a.title}</p>
                    <p className="text-[10px] text-slate-500">{new Date(a.unlockedAt?.toDate()).toLocaleDateString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500 text-center py-4">No achievements yet. Keep playing!</p>
              )}
            </div>
          </div>
        </div>

        {/* History Column */}
        <div className="lg:col-span-2 space-y-6">
          <ProgressDashboard scores={recentScores} />

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Recent Quiz History</h3>
              <Link to="/select-book" className="text-xs font-bold text-blue-600 hover:underline">New Quiz</Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentScores.length > 0 ? recentScores.map(score => (
                <div key={score.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-500">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{score.book} - {score.category}</p>
                      <p className="text-xs text-slate-500">{new Date(score.timestamp?.toDate()).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-blue-600">{score.score}/{score.totalQuestions}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Score</p>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-slate-500">No quiz history yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
