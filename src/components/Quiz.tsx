import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Info, 
  ArrowRight, 
  RotateCcw, 
  Trophy, 
  MessageCircle, 
  Facebook, 
  X, 
  Loader2,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  generateQuestions, 
  generateSpeech, 
  Question 
} from '../services/geminiService';
import { auth, db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp, 
  doc, 
  getDoc, 
  updateDoc, 
  increment, 
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { socket } from '../services/socket';
import { playSound } from '../utils/sounds';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';

export function Quiz() {
  const { bookName, roomId } = useParams();
  const [searchParams] = useSearchParams();
  const difficulty = searchParams.get('difficulty') || 'Medium';
  const chapter = parseInt(searchParams.get('chapter') || '0');
  const mode = searchParams.get('mode') || 'Quick';
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isReading, setIsReading] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const proceedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuizScoreRef = useRef(0);

  const handleListen = async (text: string) => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    setIsReading(true);
    try {
      const audioUrl = await generateSpeech(text);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsReading(false);
        audio.play();
      } else {
        // Fallback to browser TTS if AI fails
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsReading(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error("Error playing audio:", err);
      setIsReading(false);
    }
  };

  const loadQuestions = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    const decodedBookName = bookName ? decodeURIComponent(bookName) : 'Genesis';
    const isDaily = searchParams.get('daily') === 'true';
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = isDaily ? `quiz-daily-${today}` : `quiz-${decodedBookName}-${chapter}-${difficulty}`;
    
    if (forceRefresh) {
      localStorage.removeItem(cacheKey);
    }

    // Add a safety timeout for mobile/iframe environments
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('TIMEOUT')), 30000)
    );

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached && !forceRefresh) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const firstVerse = parsed[0].verse.toLowerCase();
            const bookLower = decodedBookName.toLowerCase();
            const bookWords = bookLower.split(' ');
            const matchesBook = decodedBookName === 'Daily' || bookWords.some(word => word.length > 2 && firstVerse.includes(word));

            if (matchesBook) {
              setQuestions(parsed);
              setLoading(false);
              return;
            } else {
              localStorage.removeItem(cacheKey);
            }
          }
        } catch (e) {
          localStorage.removeItem(cacheKey);
        }
      }

      let seed: number | undefined = undefined;
      if (isDaily) {
        seed = parseInt(today.replace(/-/g, ''));
      }
      
      const count = mode === 'Full' ? 30 : 5;
      
      // Race the generation against the timeout
      const generated = await Promise.race([
        generateQuestions(decodedBookName, chapter, difficulty, count, seed),
        timeoutPromise
      ]) as Question[];
      
      if (generated && generated.length > 0) {
        setQuestions(generated);
        const isFallback = generated[0].verse.toLowerCase().indexOf(decodedBookName.toLowerCase()) === -1 && decodedBookName !== 'Daily';
        if (!isFallback) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(generated));
          } catch (e) {
            console.warn("localStorage failed:", e);
          }
        }
      } else {
        setError("We're having trouble reaching the AI. Please try again or choose a different book.");
      }
    } catch (err) {
      console.error("Error in loadQuestions:", err);
      if (err instanceof Error && err.message === 'TIMEOUT') {
        setError("The connection is taking too long. This often happens on mobile browsers or in restricted environments.");
      } else {
        setError("An unexpected error occurred. Please check your internet and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      socket.on('room_update', (updatedRoom) => {
        setPlayers(updatedRoom.players);
        setCurrentQuestionIndex(updatedRoom.currentQuestionIndex);
        if (updatedRoom.status === 'finished') {
          setShowResult(true);
        }
      });

      socket.on('game_started', ({ questions }) => {
        setQuestions(questions);
        setLoading(false);
      });

      return () => {
        socket.off('room_update');
        socket.off('game_started');
      };
    } else {
      loadQuestions();
    }
  }, [bookName, difficulty, chapter, mode, roomId]);

  useEffect(() => {
    if (!loading && !showResult && !selectedAnswer) {
      setTimeLeft(30);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAnswer('TIME_UP');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestionIndex, loading, showResult, selectedAnswer]);

  const handleNext = async () => {
    if (proceedTimeoutRef.current) {
      clearTimeout(proceedTimeoutRef.current);
      proceedTimeoutRef.current = null;
    }

    if (roomId) {
      if (currentQuestionIndex < questions.length - 1) {
        socket.emit('next_question', { roomId });
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        socket.emit('next_question', { roomId });
      }
    } else {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
        const finalScore = currentQuizScoreRef.current;
        
        if (auth.currentUser) {
          try {
            await addDoc(collection(db, 'scores'), {
              uid: auth.currentUser.uid,
              displayName: auth.currentUser.displayName || 'Anonymous',
              photoURL: auth.currentUser.photoURL,
              score: finalScore,
              totalQuestions: questions.length,
              category: bookName || 'All',
              timestamp: serverTimestamp()
            });

            const statsRef = doc(db, 'stats', auth.currentUser.uid);
            const statsSnap = await getDoc(statsRef);
            const achievementsRef = collection(db, 'achievements');

            if (statsSnap.exists()) {
              const stats = statsSnap.data();
              const lastDate = stats.lastQuizDate?.toDate();
              const now = new Date();
              let newStreak = stats.streak || 0;
              
              if (lastDate) {
                const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                  newStreak += 1;
                } else if (diffDays > 1) {
                  newStreak = 1;
                }
              } else {
                newStreak = 1;
              }

              await updateDoc(statsRef, {
                streak: newStreak,
                lastQuizDate: serverTimestamp(),
                totalQuizzes: increment(1),
                totalScore: increment(finalScore)
              });

              if (newStreak >= 7) {
                const qStreak = query(achievementsRef, where('uid', '==', auth.currentUser.uid), where('type', '==', 'STREAK_7'));
                const snapStreak = await getDocs(qStreak);
                if (snapStreak.empty) {
                  await addDoc(achievementsRef, {
                    uid: auth.currentUser.uid,
                    type: 'STREAK_7',
                    title: 'Week of Faith',
                    description: 'Maintained a 7-day quiz streak!',
                    icon: 'Timer',
                    timestamp: serverTimestamp()
                  });
                }
              }
            } else {
              await setDoc(statsRef, {
                uid: auth.currentUser.uid,
                streak: 1,
                lastQuizDate: serverTimestamp(),
                totalQuizzes: 1,
                totalScore: finalScore
              });
            }

            if (finalScore === questions.length) {
              const q = query(achievementsRef, where('uid', '==', auth.currentUser.uid), where('type', '==', 'PERFECT_SCORE'));
              const snap = await getDocs(q);
              if (snap.empty) {
                await addDoc(achievementsRef, {
                  uid: auth.currentUser.uid,
                  type: 'PERFECT_SCORE',
                  title: 'Perfect Scholar',
                  description: `Got all ${questions.length} questions right in ${bookName}!`,
                  icon: 'Trophy',
                  timestamp: serverTimestamp()
                });
              }
            }
            
            if (finalScore === questions.length && bookName) {
              const bookMasterType = `BOOK_MASTER_${bookName.toUpperCase().replace(/\s+/g, '_')}`;
              const qBook = query(achievementsRef, where('uid', '==', auth.currentUser.uid), where('type', '==', bookMasterType));
              const snapBook = await getDocs(qBook);
              if (snapBook.empty) {
                await addDoc(achievementsRef, {
                  uid: auth.currentUser.uid,
                  type: bookMasterType,
                  title: `${bookName} Master`,
                  description: `Mastered the book of ${bookName} with a perfect score!`,
                  icon: 'BookOpen',
                  timestamp: serverTimestamp()
                });
              }
            }
            
            const qFirst = query(achievementsRef, where('uid', '==', auth.currentUser.uid), where('type', '==', 'FIRST_QUIZ'));
            const snapFirst = await getDocs(qFirst);
            if (snapFirst.empty) {
              await addDoc(achievementsRef, {
                uid: auth.currentUser.uid,
                type: 'FIRST_QUIZ',
                title: 'First Steps',
                description: 'Completed your very first Bible quiz!',
                icon: 'Play',
                timestamp: serverTimestamp()
              });
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, 'scores');
          }
        }
      }
    }
  };

  const handleAnswer = (option: string) => {
    if (selectedAnswer) return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    setSelectedAnswer(option);
    const correct = option === questions[currentQuestionIndex].answer;
    setIsCorrect(correct);
    
    if (correct) {
      playSound('correct');
      setScore(prev => prev + 1);
      currentQuizScoreRef.current = score + 1;
    } else {
      playSound('incorrect');
      currentQuizScoreRef.current = score;
    }
    
    if (roomId) {
      socket.emit('submit_answer', { roomId, isCorrect: correct });
    }

    proceedTimeoutRef.current = setTimeout(() => {
      handleNext();
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">
          Generating {difficulty} questions for {bookName}...
        </p>
      </div>
    );
  }

  if (questions.length === 0 || error) {
    return (
      <div className="text-center py-20 px-6 space-y-8 max-w-lg mx-auto">
        <div className="bg-red-100 dark:bg-red-900/30 p-8 rounded-full w-24 h-24 flex items-center justify-center mx-auto border-4 border-white dark:border-slate-800 shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">AI Connection Issue</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {error || "We're having trouble reaching the AI to generate these specific questions. This can happen during high traffic or for very specific chapters."}
          </p>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Tip: Try a more common book like Genesis or Matthew if the issue persists.</p>
          </div>
          
          {window.self !== window.top && (
            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-800/50 text-center">
              <p className="text-base text-amber-800 dark:text-amber-400 font-bold mb-3">
                Mobile Browser Issue Detected
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-500 mb-4">
                Your phone's browser is blocking the AI from generating questions inside this frame.
              </p>
              <button 
                onClick={() => window.open(window.location.href, '_blank')}
                className="w-full py-3 px-6 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-lg shadow-amber-200 dark:shadow-none transition-all transform active:scale-95"
              >
                🚀 Open in New Tab to Fix
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => loadQuestions(true)} 
            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/25"
          >
            <RotateCcw className="w-5 h-5" /> Try Again
          </button>
          <Link 
            to="/select-book" 
            className="flex-1 py-4 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
          >
            Choose Another Book
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (showResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-6"
      >
        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-8 rounded-full">
          <Trophy className="w-20 h-20 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Quiz Completed!</h2>
          
          {!roomId && (
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <button 
                onClick={() => {
                  const text = `I scored ${score}/${questions.length} on the ${bookName} Bible quiz! Can you beat me? ${window.location.origin}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="p-3 bg-[#25D366] text-white rounded-full hover:opacity-90 transition-opacity shadow-lg"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
              <button 
                onClick={() => {
                  const url = window.location.origin;
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                }}
                className="p-3 bg-[#1877F2] text-white rounded-full hover:opacity-90 transition-opacity shadow-lg"
                title="Share on Facebook"
              >
                <Facebook className="w-6 h-6" />
              </button>
              <button 
                onClick={() => {
                  const text = `I scored ${score}/${questions.length} on the ${bookName} Bible quiz! Can you beat me?`;
                  const url = window.location.origin;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                }}
                className="p-3 bg-black text-white rounded-full hover:opacity-90 transition-opacity shadow-lg"
                title="Share on X"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          )}

          {roomId ? (
            <div className="space-y-4 w-full max-w-md mx-auto mt-6">
              <h3 className="font-bold text-slate-500 uppercase tracking-widest text-sm text-left">Final Standings</h3>
              {players.sort((a, b) => b.score - a.score).map((p, i) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-400 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {i + 1}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{p.username}</span>
                  </div>
                  <span className="font-bold text-blue-600">{p.score} pts</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className="text-2xl text-slate-600 dark:text-slate-400">
                You scored <span className="font-bold text-blue-600">{score}</span> out of {questions.length}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" /> Try Again
                </button>
                <Link 
                  to="/select-book"
                  className="px-8 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                >
                  New Quiz
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 font-bold">
            {currentQuestionIndex + 1}/{questions.length}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">{bookName}</h4>
            <p className="text-xs text-slate-500 uppercase tracking-widest">{difficulty} Mode</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score</p>
            <p className="text-xl font-bold text-blue-600">{score}</p>
          </div>
          <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold ${timeLeft < 10 ? 'border-red-500 text-red-500 animate-pulse' : 'border-blue-100 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
            {timeLeft}
          </div>
        </div>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          className="bg-blue-600 h-full"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
            {selectedAnswer === 'TIME_UP' && (
              <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center z-10">
                <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5" /> Time's Up!
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-4">
              <div className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-bold">
                {currentQuestion.verse}
              </div>
              <button 
                onClick={() => handleListen(currentQuestion.text)}
                className={`p-2 rounded-full transition-all ${isReading ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                title={isReading ? "Stop Listening" : "Listen to Verse"}
              >
                {isReading ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-lg italic text-slate-600 dark:text-slate-400 mb-6">
              "{currentQuestion.text}"
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={!!selectedAnswer}
                className={`
                  flex items-center justify-between p-5 rounded-xl border-2 text-left transition-all
                  ${!selectedAnswer 
                    ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700' 
                    : option === currentQuestion.answer 
                      ? 'border-green-500 bg-green-500 text-white'
                      : selectedAnswer === option
                        ? 'border-red-500 bg-red-500 text-white'
                        : 'border-slate-100 dark:border-slate-800 opacity-50'
                  }
                `}
              >
                <span className="font-semibold">{option}</span>
                {selectedAnswer && option === currentQuestion.answer && <CheckCircle2 className="w-6 h-6" />}
                {selectedAnswer === option && option !== currentQuestion.answer && <XCircle className="w-6 h-6" />}
              </button>
            ))}
          </div>

          {selectedAnswer && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {selectedAnswer !== currentQuestion.answer && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">
                    The correct answer is: <span className="font-bold">{currentQuestion.answer}</span>
                  </p>
                </div>
              )}
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-800 dark:text-blue-400">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <p className="text-xs font-bold uppercase tracking-wider">Explanation</p>
                </div>
                <p className="text-sm leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            </motion.div>
          )}

          {selectedAnswer && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleNext}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
