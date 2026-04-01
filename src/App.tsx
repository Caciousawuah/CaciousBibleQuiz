import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  BookOpen, 
  Settings as SettingsIcon, 
  Trophy, 
  Play, 
  Moon, 
  Sun, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home as HomeIcon,
  Search,
  Loader2,
  Book as BookIcon,
  Clock,
  Timer,
  AlertCircle,
  Users,
  Copy,
  User,
  ArrowRight,
  Mail,
  Phone,
  Facebook,
  MessageCircle,
  X,
  UserCircle,
  BarChart3,
  History,
  Volume2,
  VolumeX,
  Info,
  Download,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import QRCode from 'qrcode';
import { generateQuestions, Question, generateLogo, generateSpeech, generateFlyer } from './services/geminiService';
import { Howl } from 'howler';
import { auth, db } from './firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  setDoc, 
  doc, 
  serverTimestamp,
  getDoc,
  getDocs,
  where,
  increment,
  updateDoc
} from 'firebase/firestore';

const socket: Socket = io();

const SOUNDS = {
  correct: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'], volume: 0.5 }),
  incorrect: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2959/2959-preview.mp3'], volume: 0.5 }),
  click: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'], volume: 0.5 })
};

function playSound(key: keyof typeof SOUNDS) {
  const isMuted = localStorage.getItem('quiz_muted') === 'true';
  if (isMuted) return;
  SOUNDS[key].play();
}

function Logo({ className = "w-16 h-16", src }: { className?: string, src?: string }) {
  const [logoSrc, setLogoSrc] = useState(src || localStorage.getItem('app_logo') || "https://picsum.photos/seed/bible-quiz-logo/400/400");

  useEffect(() => {
    if (src) setLogoSrc(src);
  }, [src]);

  return (
    <div className={`${className} bg-blue-600 rounded-full flex items-center justify-center text-white overflow-hidden shadow-lg border-2 border-white dark:border-slate-700`}>
      <img 
        src={logoSrc} 
        alt="CaciousBibleQuiz Logo" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

function LogoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    const logo = await generateLogo(prompt);
    if (logo) {
      setGeneratedLogo(logo);
      localStorage.setItem('app_logo', logo);
      window.location.reload(); // Refresh to apply logo everywhere
    }
    setIsGenerating(false);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Play className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-slate-900 dark:text-white">Logo Generator</h3>
      </div>
      <p className="text-sm text-slate-500">Describe the logo you want for your app. We'll use AI to create it!</p>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A golden cross with a blue bible"
          className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
        </button>
      </div>
      {generatedLogo && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-xs font-bold text-emerald-600">New logo generated and applied!</p>
          <img src={generatedLogo} alt="Generated Logo" className="w-24 h-24 rounded-2xl shadow-lg border-2 border-white dark:border-slate-700" />
        </div>
      )}
    </div>
  );
}

function FlyerGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [flyer, setFlyer] = useState<string | null>(null);
  const [style, setStyle] = useState('modern');

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateFlyer(style);
      if (result) {
        // Generate QR code for the app URL
        const appUrl = window.location.origin;
        const qrCodeDataUrl = await QRCode.toDataURL(appUrl, {
          margin: 1,
          width: 200,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });

        // Merge QR code onto the flyer using canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const flyerImg = new Image();
        const qrImg = new Image();

        flyerImg.crossOrigin = "anonymous";
        qrImg.crossOrigin = "anonymous";

        await new Promise((resolve, reject) => {
          flyerImg.onload = resolve;
          flyerImg.onerror = reject;
          flyerImg.src = result;
        });

        await new Promise((resolve, reject) => {
          qrImg.onload = resolve;
          qrImg.onerror = reject;
          qrImg.src = qrCodeDataUrl;
        });

        canvas.width = flyerImg.width;
        canvas.height = flyerImg.height;

        if (ctx) {
          // Draw flyer
          ctx.drawImage(flyerImg, 0, 0);

          // Draw QR code container (white rounded box)
          const qrSize = canvas.width * 0.2; // 20% of width
          const padding = 10;
          const x = canvas.width - qrSize - 40;
          const y = canvas.height - qrSize - 40;

          ctx.fillStyle = 'white';
          const r = 20;
          const w = qrSize + padding * 2;
          const h = qrSize + padding * 2;
          const rx = x - padding;
          const ry = y - padding;
          
          ctx.beginPath();
          ctx.moveTo(rx + r, ry);
          ctx.lineTo(rx + w - r, ry);
          ctx.quadraticCurveTo(rx + w, ry, rx + w, ry + r);
          ctx.lineTo(rx + w, ry + h - r);
          ctx.quadraticCurveTo(rx + w, ry + h, rx + w - r, ry + h);
          ctx.lineTo(rx + r, ry + h);
          ctx.quadraticCurveTo(rx, ry + h, rx, ry + h - r);
          ctx.lineTo(rx, ry + r);
          ctx.quadraticCurveTo(rx, ry, rx + r, ry);
          ctx.closePath();
          ctx.fill();

          // Draw QR code
          ctx.drawImage(qrImg, x, y, qrSize, qrSize);

          // Add "Scan to Play" text
          ctx.fillStyle = 'black';
          ctx.font = `bold ${qrSize * 0.15}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('SCAN TO PLAY', x + qrSize / 2, y + qrSize + padding + 15);

          setFlyer(canvas.toDataURL('image/png'));
        }
      }
    } catch (error) {
      console.error("Error generating flyer with QR:", error);
    }
    setIsGenerating(false);
  };

  const downloadFlyer = () => {
    if (!flyer) return;
    const link = document.createElement('a');
    link.href = flyer;
    link.download = `CaciousBibleQuiz_Flyer_${style}.png`;
    link.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold text-slate-900 dark:text-white text-lg">Launch Kit: Flyer Generator</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {['modern', 'social', 'elegant'].map((s) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-2 ${
              style === s 
                ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                : 'bg-slate-100 dark:bg-slate-700 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <button 
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating your flyer...
          </>
        ) : (
          <>
            <ImageIcon className="w-5 h-5" />
            Generate Launch Flyer
          </>
        )}
      </button>

      {flyer && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 space-y-4"
        >
          <div className="relative group rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-700">
            <img src={flyer} alt="Generated Flyer" className="w-full h-auto" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={downloadFlyer}
                className="p-4 bg-white text-blue-600 rounded-full shadow-xl hover:scale-110 transition-transform"
              >
                <Download className="w-8 h-8" />
              </button>
            </div>
          </div>
          <button 
            onClick={downloadFlyer}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Flyer
          </button>
        </motion.div>
      )}
    </div>
  );
}

// --- Firestore Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const BIBLE_BOOKS = [
  // Old Testament
  { name: 'Genesis', category: 'Pentateuch' },
  { name: 'Exodus', category: 'Pentateuch' },
  { name: 'Leviticus', category: 'Pentateuch' },
  { name: 'Numbers', category: 'Pentateuch' },
  { name: 'Deuteronomy', category: 'Pentateuch' },
  { name: 'Joshua', category: 'History' },
  { name: 'Judges', category: 'History' },
  { name: 'Ruth', category: 'History' },
  { name: '1 Samuel', category: 'History' },
  { name: '2 Samuel', category: 'History' },
  { name: '1 Kings', category: 'History' },
  { name: '2 Kings', category: 'History' },
  { name: '1 Chronicles', category: 'History' },
  { name: '2 Chronicles', category: 'History' },
  { name: 'Ezra', category: 'History' },
  { name: 'Nehemiah', category: 'History' },
  { name: 'Esther', category: 'History' },
  { name: 'Job', category: 'Poetry' },
  { name: 'Psalms', category: 'Poetry' },
  { name: 'Proverbs', category: 'Poetry' },
  { name: 'Ecclesiastes', category: 'Poetry' },
  { name: 'Song of Solomon', category: 'Poetry' },
  { name: 'Isaiah', category: 'Major Prophets' },
  { name: 'Jeremiah', category: 'Major Prophets' },
  { name: 'Lamentations', category: 'Major Prophets' },
  { name: 'Ezekiel', category: 'Major Prophets' },
  { name: 'Daniel', category: 'Major Prophets' },
  { name: 'Hosea', category: 'Minor Prophets' },
  { name: 'Joel', category: 'Minor Prophets' },
  { name: 'Amos', category: 'Minor Prophets' },
  { name: 'Obadiah', category: 'Minor Prophets' },
  { name: 'Jonah', category: 'Minor Prophets' },
  { name: 'Micah', category: 'Minor Prophets' },
  { name: 'Nahum', category: 'Minor Prophets' },
  { name: 'Habakkuk', category: 'Minor Prophets' },
  { name: 'Zephaniah', category: 'Minor Prophets' },
  { name: 'Haggai', category: 'Minor Prophets' },
  { name: 'Zechariah', category: 'Minor Prophets' },
  { name: 'Malachi', category: 'Minor Prophets' },
  // New Testament
  { name: 'Matthew', category: 'Gospels' },
  { name: 'Mark', category: 'Gospels' },
  { name: 'Luke', category: 'Gospels' },
  { name: 'John', category: 'Gospels' },
  { name: 'Acts', category: 'History' },
  { name: 'Romans', category: 'Epistles' },
  { name: '1 Corinthians', category: 'Epistles' },
  { name: '2 Corinthians', category: 'Epistles' },
  { name: 'Galatians', category: 'Epistles' },
  { name: 'Ephesians', category: 'Epistles' },
  { name: 'Philippians', category: 'Epistles' },
  { name: 'Colossians', category: 'Epistles' },
  { name: '1 Thessalonians', category: 'Epistles' },
  { name: '2 Thessalonians', category: 'Epistles' },
  { name: '1 Timothy', category: 'Epistles' },
  { name: '2 Timothy', category: 'Epistles' },
  { name: 'Titus', category: 'Epistles' },
  { name: 'Philemon', category: 'Epistles' },
  { name: 'Hebrews', category: 'Epistles' },
  { name: 'James', category: 'Epistles' },
  { name: '1 Peter', category: 'Epistles' },
  { name: '2 Peter', category: 'Epistles' },
  { name: '1 John', category: 'Epistles' },
  { name: '2 John', category: 'Epistles' },
  { name: '3 John', category: 'Epistles' },
  { name: 'Jude', category: 'Epistles' },
  { name: 'Revelation', category: 'Prophecy' },
];

function Home() {
  const [dailyVerse, setDailyVerse] = useState<{ text: string, reference: string } | null>(null);
  const [loadingVerse, setLoadingVerse] = useState(true);

  useEffect(() => {
    async function fetchDailyVerse() {
      try {
        const response = await generateQuestions('Genesis', 1, 'Easy', 1);
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
          <Logo className="w-24 h-24" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          CaciousBibleQuiz
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Master the Word of God through interactive and customizable quizzes.
        </p>
      </motion.div>

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
            <span className="text-sm font-medium text-slate-900 dark:text-white">+233554898881</span>
          </a>

          <a href="https://facebook.com/search/top/?q=Awuah%20Cacious" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group">
            <Facebook className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Facebook</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">Awuah Cacious</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}

function MultiplayerLobby() {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState<any>(null);
  const [joined, setJoined] = useState(false);
  const [selectedBook, setSelectedBook] = useState('Genesis');
  const [difficulty, setDifficulty] = useState('Medium');
  const [isStarting, setIsStarting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('room_update', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    socket.on('game_started', ({ questions }) => {
      navigate(`/quiz/multiplayer?room=${roomId}`, { state: { questions } });
    });

    return () => {
      socket.off('room_update');
      socket.off('game_started');
    };
  }, [roomId, navigate]);

  const joinRoom = () => {
    if (roomId && username) {
      socket.emit('join_room', { roomId, username });
      setJoined(true);
    }
  };

  const setReady = () => {
    socket.emit('player_ready', { roomId });
  };

  const startGame = async () => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      const questions = await generateQuestions(selectedBook, 1, difficulty, 5);
      socket.emit('start_game', { roomId, questions });
    } catch (error) {
      console.error("Failed to start game:", error);
    } finally {
      setIsStarting(false);
    }
  };

  const isHost = room?.players[0]?.id === socket.id;

  if (!joined) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Users className="w-12 h-12 text-blue-600 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Multiplayer Lobby</h2>
          <p className="text-slate-500">Join a room to play with friends</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Username</label>
            <input 
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Room ID</label>
            <input 
              type="text"
              placeholder="Enter room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={joinRoom}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
          >
            Join Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Room: {roomId}</h2>
          <p className="text-slate-500">Waiting for players...</p>
        </div>
        <button 
          onClick={() => navigator.clipboard.writeText(roomId)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <Copy className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {room?.players.map((player: any) => (
          <div key={player.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{player.username}</span>
            </div>
            {player.ready ? (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">READY</span>
            ) : (
              <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-bold">WAITING</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button 
          onClick={setReady}
          className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
          I'm Ready
        </button>
        {isHost && room?.players.every((p: any) => p.ready) && room?.players.length >= 2 && (
          <button 
            onClick={startGame}
            disabled={isStarting}
            className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Play className="w-5 h-5" /> Start Game</>}
          </button>
        )}
      </div>

      {isHost && (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-blue-600" /> Game Settings
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Book</label>
              <select 
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              >
                {BIBLE_BOOKS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Difficulty</label>
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookSelection() {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState(() => localStorage.getItem('quiz_difficulty') || 'Medium');
  const navigate = useNavigate();

  const filteredBooks = BIBLE_BOOKS.filter(book => 
    book.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Choose a Book</h2>
          <p className="text-slate-500">Select which part of the Bible to quiz on</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
          
          <select 
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredBooks.map((book) => (
          <button
            key={book.name}
            onClick={() => navigate(`/quiz/${book.name}?difficulty=${difficulty}`)}
            className="group p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-left transition-all hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-none"
          >
            <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-xl inline-block mb-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
              <BookIcon className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white truncate">{book.name}</h3>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{book.category}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Quiz() {
  const { bookName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const difficulty = searchParams.get('difficulty') || 'Medium';
  const roomId = searchParams.get('room');
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const proceedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuizScoreRef = useRef<number>(0);

  const [isReading, setIsReading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleListen = async (text: string) => {
    if (isReading) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsReading(false);
      return;
    }

    setIsReading(true);
    try {
      const audioUrl = await generateSpeech(text);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => setIsReading(false);
        audio.play();
      } else {
        setIsReading(false);
        alert("Sorry, we couldn't generate the audio right now.");
      }
    } catch (err) {
      console.error("Error playing audio:", err);
      setIsReading(false);
    }
  };

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    
    const decodedBookName = bookName ? decodeURIComponent(bookName) : 'Genesis';
    const isDaily = searchParams.get('daily') === 'true';
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = isDaily ? `quiz-daily-${today}` : `quiz-${decodedBookName}-${difficulty}`;
    
    // Try to load from cache first for instant access
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestions(parsed);
          setLoading(false);
          return;
        }
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }

    try {
      let seed: number | undefined = undefined;
      if (isDaily) {
        seed = parseInt(today.replace(/-/g, ''));
      }
      
      // Passing 0 for chapter to trigger random chapter selection in the service
      const generated = await generateQuestions(decodedBookName, 0, difficulty, 5, seed);
      
      if (generated && generated.length > 0) {
        setQuestions(generated);
        // Cache the results for next time
        localStorage.setItem(cacheKey, JSON.stringify(generated));
      } else {
        setError("We're having trouble reaching the AI. Please try again or choose a different book.");
      }
    } catch (err) {
      console.error("Error in loadQuestions:", err);
      setError("An unexpected error occurred. Please check your internet and try again.");
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
  }, [bookName, difficulty, roomId]);

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
      // In multiplayer, the server handles progression
      if (currentQuestionIndex < questions.length - 1) {
        socket.emit('next_question', { roomId });
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        socket.emit('next_question', { roomId }); // This will trigger 'finished' status
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
            // 1. Save score
            await addDoc(collection(db, 'scores'), {
              uid: auth.currentUser.uid,
              displayName: auth.currentUser.displayName || 'Anonymous',
              photoURL: auth.currentUser.photoURL,
              score: finalScore,
              totalQuestions: questions.length,
              category: bookName || 'All',
              timestamp: serverTimestamp()
            });

            // 2. Update Stats
            const statsRef = doc(db, 'stats', auth.currentUser.uid);
            const statsSnap = await getDoc(statsRef);
            
            // 3. Check Achievements
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

              // Check Streak Achievement
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

            // Perfect Score
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
            
            // Book Master (Perfect score in a specific book)
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
            
            // First Quiz
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
      <div className="text-center py-20 px-6 space-y-6 max-w-md mx-auto">
        <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Oops!</h2>
          <p className="text-slate-600 dark:text-slate-400">
            {error || "We couldn't load the questions for you right now."}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => loadQuestions()} 
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" /> Try Again
          </button>
          <Link 
            to="/select-book" 
            className="w-full py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
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
                className="p-3 bg-[#1DA1F2] text-white rounded-full hover:opacity-90 transition-opacity shadow-lg"
                title="Share on Twitter"
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
              <p className="text-slate-500">Difficulty: {difficulty}</p>
            </>
          )}
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              if (roomId) {
                navigate('/multiplayer');
              } else {
                setCurrentQuestionIndex(0);
                setScore(0);
                currentQuizScoreRef.current = 0;
                setShowResult(false);
                setSelectedAnswer(null);
                setIsCorrect(null);
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            {roomId ? <Users className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />} {roomId ? 'New Lobby' : 'Try Again'}
          </button>
          
          {!roomId && (
            <button 
              onClick={async () => {
                const shareData = {
                  title: 'CaciousBibleQuiz Result',
                  text: `I scored ${score}/${questions.length} on the ${bookName} Bible quiz! Can you beat me?`,
                  url: window.location.origin
                };
                try {
                  if (navigator.share) {
                    await navigator.share(shareData);
                  } else {
                    await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                    alert('Result copied to clipboard!');
                  }
                } catch (err) {
                  console.error('Error sharing:', err);
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              <Copy className="w-5 h-5" /> Share
            </button>
          )}

          <Link to="/" className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
            <HomeIcon className="w-5 h-5" /> Home
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      {roomId && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {players.map(p => (
            <div key={p.id} className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{p.username}</span>
              <span className="text-xs font-bold text-blue-600">{p.score}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center gap-1 text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full text-sm">
            <Trophy className="w-4 h-4" /> {score}
          </div>
        </div>
        
        <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-slate-600 dark:text-slate-400'}`}>
          <Timer className="w-5 h-5" />
          {timeLeft}s
        </div>
      </div>

      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-500" 
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
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

function Settings() {
  const [difficulty, setDifficulty] = useState(() => localStorage.getItem('quiz_difficulty') || 'Medium');
  const [quizMode, setQuizMode] = useState(() => localStorage.getItem('quiz_mode') || 'Random');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

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
    window.location.reload(); // Simple way to apply global dark mode change
  };

  const [muted, setMuted] = useState(() => localStorage.getItem('quiz_muted') === 'true');

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

        {auth.currentUser?.email === 'caciousawuah678@gmail.com' && (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            <LogoGenerator />
            <FlyerGenerator />
          </div>
        )}
      </div>

      <Link to="/" className="block text-center text-blue-600 font-bold hover:underline">
        Back to Home
      </Link>
    </div>
  );
}

function Leaderboard() {
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
          console.error("Leaderboard error:", err);
          setError("Failed to load leaderboard. Please try again later.");
          setLoading(false);
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

function Profile() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const qScores = query(collection(db, 'scores'), where('uid', '==', u.uid), orderBy('timestamp', 'desc'), limit(20));
        const unsubscribeScores = onSnapshot(qScores, (snapshot) => {
          setScores(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
          console.error("Scores error:", error);
          // Handled by achievements loading or other
        });

        const unsubscribeStats = onSnapshot(doc(db, 'stats', u.uid), (doc) => {
          if (doc.exists()) setStats(doc.data());
        }, (error) => {
          console.error("Stats error:", error);
        });

        const qAchievements = query(collection(db, 'achievements'), where('uid', '==', u.uid), orderBy('timestamp', 'desc'));
        const unsubscribeAchievements = onSnapshot(qAchievements, (snapshot) => {
          setAchievements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        }, (error) => {
          console.error("Achievements error:", error);
          setLoading(false);
        });

        return () => {
          unsubscribeScores();
          unsubscribeStats();
          unsubscribeAchievements();
        };
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-6">
        <div className="bg-blue-100 dark:bg-blue-900/30 p-8 rounded-full inline-block">
          <UserCircle className="w-20 h-20 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Your Profile</h2>
        <p className="text-slate-500">Sign in to track your progress and compete on the leaderboard!</p>
        <button 
          onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
        >
          <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    );
  }

  const totalQuizzes = stats?.totalQuizzes || scores.length;
  const avgScore = totalQuizzes > 0 ? ((stats?.totalScore || scores.reduce((acc, s) => acc + s.score, 0)) / totalQuizzes).toFixed(1) : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;
  const streak = stats?.streak || 0;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col md:flex-row items-center gap-8">
        <img src={user.photoURL || ''} alt="" className="w-32 h-32 rounded-full border-4 border-blue-100 dark:border-blue-900/30" referrerPolicy="no-referrer" />
        <div className="text-center md:text-left space-y-2 flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">{user.displayName}</h2>
            {streak > 0 && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-bold self-center md:self-auto">
                🔥 {streak} Day Streak
              </div>
            )}
          </div>
          <p className="text-slate-500">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Quizzes</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalQuizzes}</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl">
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Avg Score</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{avgScore}</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl">
              <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Best</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{bestScore}</div>
            </div>
          </div>
        </div>
        <button 
          onClick={() => signOut(auth)}
          className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 transition-all"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" /> Recent Activity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scores.map((s, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={s.id} 
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{s.category}</h4>
                  <p className="text-xs text-slate-500">{s.timestamp?.toDate() ? new Date(s.timestamp.toDate()).toLocaleString() : 'Recent'}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-600">{s.score}/{s.totalQuestions}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score</div>
                </div>
              </motion.div>
            ))}
            {scores.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                No quiz history yet. Start your first quiz!
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" /> Achievements
          </h3>
          <div className="space-y-4">
            {achievements.map((a, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                key={a.id}
                className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  {a.icon === 'Trophy' && <Trophy className="w-6 h-6 text-amber-600" />}
                  {a.icon === 'Play' && <Play className="w-6 h-6 text-blue-600" />}
                  {a.icon === 'Timer' && <Timer className="w-6 h-6 text-indigo-600" />}
                  {a.icon === 'BookOpen' && <BookOpen className="w-6 h-6 text-emerald-600" />}
                  {!['Trophy', 'Play', 'Timer', 'BookOpen'].includes(a.icon) && <Trophy className="w-6 h-6 text-amber-600" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{a.title}</h4>
                  <p className="text-xs text-slate-500">{a.description}</p>
                </div>
              </motion.div>
            ))}
            {achievements.length === 0 && (
              <div className="py-12 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                No achievements yet. Keep playing!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <Logo className="w-8 h-8" />
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              CaciousBibleQuiz
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/leaderboard" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Leaderboard
            </Link>
            <Link to="/multiplayer" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2">
              <Users className="w-4 h-4" /> Multiplayer
            </Link>
            <Link to="/settings" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" /> Settings
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/profile" className="flex items-center gap-2 p-1 pr-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
                <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-white dark:border-slate-700" referrerPolicy="no-referrer" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 hidden sm:inline">{user.displayName?.split(' ')[0]}</span>
              </Link>
            ) : (
              <button 
                onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// --- Error Boundary ---
class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if ((this.state as any).hasError) {
      let errorMessage = "Something went wrong.";
      if ((this.state as any).error && (this.state as any).error.message) {
        try {
          const parsed = JSON.parse((this.state as any).error.message);
          if (parsed.error) errorMessage = `Firestore Error: ${parsed.error}`;
        } catch (e) {
          errorMessage = (this.state as any).error.message;
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

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthReady(true);
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
    return () => unsubscribe();
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300 flex flex-col">
        <Router>
          <Navbar />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/select-book" element={<BookSelection />} />
              <Route path="/multiplayer" element={<MultiplayerLobby />} />
              <Route path="/quiz/:bookName" element={<Quiz />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>

          <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-4 bg-slate-50 dark:bg-slate-900/50">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
              <div className="flex items-center gap-2 font-bold text-blue-600">
                <Logo className="w-8 h-8" />
                <span>CaciousBibleQuiz</span>
              </div>
              <div className="flex items-center gap-6">
                <a href="mailto:caciousawuah678@gmail.com" className="hover:text-blue-600 transition-colors">caciousawuah678@gmail.com</a>
                <a href="https://wa.me/233554898881" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
                <span>0554898881</span>
                <span className="font-medium">© 2026 Awuah Cacious</span>
              </div>
            </div>
          </footer>

          {/* Global Floating WhatsApp Button */}
          <motion.a
            href="https://wa.me/233554898881"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center group"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-bold whitespace-nowrap">
              Chat on WhatsApp
            </span>
          </motion.a>
        </Router>
      </div>
    </div>
  );
}
