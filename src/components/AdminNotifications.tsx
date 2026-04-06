import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Mail, 
  MessageCircle, 
  Phone, 
  Send, 
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Copy,
  ClipboardCheck,
  Sparkles,
  RefreshCcw
} from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { generateAdminMessage } from '../services/geminiService';

export function AdminNotifications() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const navigate = useNavigate();

  const templates = [
    { name: 'Welcome', prompt: 'A warm welcome message for new users joining CaciousBibleQuiz' },
    { name: 'Daily Reminder', prompt: 'A friendly reminder to take the daily Bible quiz challenge' },
    { name: 'New Feature', prompt: 'An announcement about the new real-time multiplayer mode' },
    { name: 'Encouragement', prompt: 'A motivational message with a Bible verse to encourage scholars' }
  ];

  useEffect(() => {
    // Security check: Only allow the developer
    if (auth.currentUser?.email !== 'caciousawuah678@gmail.com') {
      navigate('/');
      return;
    }

    async function fetchUsers() {
      try {
        const q = query(collection(db, 'users'), orderBy('displayName', 'asc'));
        const snapshot = await getDocs(q);
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [navigate]);

  const handleGenerate = async (prompt: string) => {
    setGenerating(true);
    try {
      const msg = await generateAdminMessage(prompt);
      setMessage(msg);
      setStatus({ type: 'success', msg: 'AI generated a new message for you!' });
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to generate message.' });
    } finally {
      setGenerating(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserSelection = (uid: string) => {
    setSelectedUsers(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const selectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSend = (channel: 'email' | 'whatsapp' | 'sms') => {
    if (!message) {
      setStatus({ type: 'error', msg: 'Please enter a message first.' });
      return;
    }

    const targets = users.filter(u => selectedUsers.includes(u.id));
    
    if (targets.length === 0) {
      setStatus({ type: 'error', msg: 'Please select at least one user.' });
      return;
    }

    setSending(true);
    
    try {
      targets.forEach(user => {
        let url = '';
        const encodedMsg = encodeURIComponent(message);

        if (channel === 'email' && user.email) {
          url = `mailto:${user.email}?subject=Bible Quiz Notification&body=${encodedMsg}`;
        } else if (channel === 'whatsapp' && user.phone) {
          // Format phone number (remove non-digits, ensure country code)
          const cleanPhone = user.phone.replace(/\D/g, '');
          url = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
        } else if (channel === 'sms' && user.phone) {
          url = `sms:${user.phone}?body=${encodedMsg}`;
        }

        if (url) {
          window.open(url, '_blank');
        }
      });

      setStatus({ type: 'success', msg: `Opened ${channel} links for ${targets.length} users.` });
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to open notification links.' });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/settings" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </Link>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Notification Center</h2>
            <p className="text-slate-500 font-medium">Broadcast messages to Bible Quiz scholars</p>
          </div>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-2xl border border-blue-200 dark:border-blue-800">
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <Users className="w-4 h-4" /> {users.length} Total Users
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Message Composer */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" /> Compose Message
              </h3>
              <button 
                onClick={() => copyToClipboard(message, 'msg')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-blue-600"
                title="Copy Message"
              >
                {copied === 'msg' ? <ClipboardCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-500" /> AI Quick Templates
              </p>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => handleGenerate(t.prompt)}
                    disabled={generating}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all border border-blue-100 dark:border-blue-800 flex items-center gap-1 disabled:opacity-50"
                  >
                    {generating ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your notification message here..."
              className="w-full h-48 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
            
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Send Via</p>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => handleSend('email')}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  <Mail className="w-4 h-4" /> Send Email
                </button>
                <button 
                  onClick={() => handleSend('whatsapp')}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-500/20"
                >
                  <MessageCircle className="w-4 h-4" /> Send WhatsApp
                </button>
                <button 
                  onClick={() => handleSend('sms')}
                  className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-slate-500/20"
                >
                  <Phone className="w-4 h-4" /> Send SMS
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bulk Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => {
                    const emails = users.filter(u => selectedUsers.includes(u.id)).map(u => u.email).filter(Boolean).join(', ');
                    copyToClipboard(emails, 'emails');
                  }}
                  className="py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                >
                  {copied === 'emails' ? <ClipboardCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copy Emails
                </button>
                <button 
                  onClick={() => {
                    const phones = users.filter(u => selectedUsers.includes(u.id)).map(u => u.phone).filter(Boolean).join(', ');
                    copyToClipboard(phones, 'phones');
                  }}
                  className="py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                >
                  {copied === 'phones' ? <ClipboardCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copy Phones
                </button>
              </div>
            </div>

            <AnimatePresence>
              {status && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
                >
                  {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <p className="text-sm font-medium">{status.msg}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* User Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="font-bold text-slate-900 dark:text-white">Select Recipients ({selectedUsers.length})</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={selectAll}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All Filtered'}
                  </button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
              {filteredUsers.length > 0 ? filteredUsers.map(user => (
                <div 
                  key={user.id} 
                  onClick={() => toggleUserSelection(user.id)}
                  className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedUsers.includes(user.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-10 h-10 rounded-xl" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400">
                          <Users className="w-5 h-5" />
                        </div>
                      )}
                      {selectedUsers.includes(user.id) && (
                        <div className="absolute -top-1 -right-1 bg-blue-600 text-white p-0.5 rounded-full shadow-lg">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{user.displayName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      {user.phone && (
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" /> {user.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.email && <Mail className="w-4 h-4 text-blue-400" />}
                    {user.phone && <MessageCircle className="w-4 h-4 text-emerald-400" />}
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-slate-500">No users found matching your search.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
