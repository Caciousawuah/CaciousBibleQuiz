import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  MessageSquareText, 
  X, 
  Send, 
  Loader2, 
  Sparkles,
  Home as HomeIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { askBibleQuestion } from '../services/geminiService';

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await askBibleQuestion(userMsg);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const goHome = () => {
    setIsOpen(false);
    navigate('/');
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40 group"
      >
        <Bot className="w-7 h-7 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-bounce">
          AI
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[90vw] max-w-[400px] h-[70vh] max-h-[600px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col z-50 overflow-hidden"
          >
            <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">Bible Assistant</h3>
                  <p className="text-[10px] text-blue-100 uppercase tracking-widest font-bold">Powered by AI</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={goHome}
                  title="Go Home"
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all flex items-center gap-2 border border-white/10"
                >
                  <HomeIcon className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  title="Close Assistant"
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
              {messages.length === 0 && (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto text-blue-600">
                    <MessageSquareText className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-slate-900 dark:text-white">How can I help you study?</p>
                    <p className="text-sm text-slate-500">Ask about verses, theology, or Bible history.</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Who was David?', 'Explain Grace', 'Genesis Summary'].map(q => (
                      <button 
                        key={q}
                        onClick={() => setInput(q)}
                        className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-full hover:border-blue-500 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-slate-500">AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a Bible question..."
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
