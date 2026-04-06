import React, { useState, useEffect } from 'react';
import { BookOpen, Loader2, Sparkles } from 'lucide-react';
import { generateLogo } from '../services/geminiService';

export function Logo({ className = "w-16 h-16", src }: { className?: string, src?: string }) {
  const [logoSrc, setLogoSrc] = useState(src || localStorage.getItem('app_logo') || undefined);

  useEffect(() => {
    if (src) setLogoSrc(src);
  }, [src]);

  return (
    <div className={`${className} bg-blue-600 rounded-full flex items-center justify-center text-white overflow-hidden shadow-lg border-2 border-white dark:border-slate-700`}>
      {logoSrc ? (
        <img 
          src={logoSrc} 
          alt="App Logo" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <BookOpen className="w-1/2 h-1/2" />
      )}
    </div>
  );
}

export function LogoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const logo = await generateLogo(prompt);
      if (logo) {
        setGeneratedLogo(logo);
        localStorage.setItem('app_logo', logo);
      }
    } catch (error) {
      console.error("Error generating logo:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-slate-900 dark:text-white">AI Logo Generator</h3>
      </div>
      <p className="text-sm text-slate-500">Describe the logo you want for your app.</p>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A golden cross with a blue book..."
          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
        </button>
      </div>
      {generatedLogo && (
        <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <Logo src={generatedLogo} className="w-16 h-16" />
          <div>
            <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Logo Updated!</p>
            <p className="text-xs text-blue-700 dark:text-blue-300">Refresh the page to see it everywhere.</p>
          </div>
        </div>
      )}
    </div>
  );
}
