import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Play, 
  Loader2, 
  AlertCircle, 
  User,
  BarChart3
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { FirebaseUser } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const leaderboardQuery = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(50));
        const unsubscribe = onSnapshot(leaderboardQuery, (snapshot) => {
          setLeaderboard(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
          setError(null);
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, 'scores');
        });
        return () => unsubscribe();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Global Leaderboard</h2>
        <p className="text-slate-500">The top Bible scholars in the world</p>
      </div>

      {!user && !loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center space-y-6 shadow-xl">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in to see the Leaderboard</h3>
            <p className="text-slate-500">Join the community to track your progress and compete with others!</p>
          </div>
          <button 
            onClick={handleGoogleSignIn}
            className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 mx-auto"
          >
            <Play className="w-5 h-5" /> Sign in with Google
          </button>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-red-100 dark:border-red-900/30 p-12 text-center space-y-4 shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-700">
            {leaderboard.map((entry, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={entry.id} 
                className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                    i === 0 ? 'bg-yellow-400 text-white' : 
                    i === 1 ? 'bg-slate-300 text-slate-700' :
                    i === 2 ? 'bg-amber-600 text-white' :
                    'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex items-center gap-3">
                    {entry.photoURL ? (
                      <img src={entry.photoURL} alt="" className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{entry.displayName}</h4>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">{entry.category}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-600">{entry.score} pts</div>
                  <div className="text-xs text-slate-400">{entry.timestamp?.toDate() ? new Date(entry.timestamp.toDate()).toLocaleDateString() : 'Recent'}</div>
                </div>
              </motion.div>
            ))}
            {leaderboard.length === 0 && (
              <div className="p-20 text-center text-slate-500">No scores yet. Be the first!</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProgressDashboard({ scores }: { scores: any[] }) {
  if (scores.length === 0) return null;

  const data = scores.slice().reverse().map(s => ({
    date: s.timestamp?.toDate() ? new Date(s.timestamp.toDate()).toLocaleDateString() : 'Recent',
    score: (s.score / s.totalQuestions) * 100,
    raw: s.score
  }));

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" /> Performance Trends
        </h3>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last {scores.length} Quizzes</span>
      </div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              hide 
            />
            <YAxis 
              domain={[0, 100]} 
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: 'none', 
                borderRadius: '12px',
                color: '#f8fafc'
              }}
              itemStyle={{ color: '#60a5fa' }}
            />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#2563eb" 
              fillOpacity={1} 
              fill="url(#colorScore)" 
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
