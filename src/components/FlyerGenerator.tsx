import React, { useState } from 'react';
import { 
  ImageIcon, 
  Loader2, 
  Download, 
  Sparkles,
  Share2
} from 'lucide-react';
import { generateFlyer } from '../services/geminiService';

export function FlyerGenerator() {
  const [style, setStyle] = useState('modern');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFlyer, setGeneratedFlyer] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const flyer = await generateFlyer(style);
      if (flyer) {
        setGeneratedFlyer(flyer);
      }
    } catch (error) {
      console.error("Error generating flyer:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFlyer = () => {
    if (!generatedFlyer) return;
    const link = document.createElement('a');
    link.href = generatedFlyer;
    link.download = `bible-quiz-flyer-${style}.png`;
    link.click();
  };

  return (
    <div className="space-y-4 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-2">
        <ImageIcon className="w-5 h-5 text-indigo-600" />
        <h3 className="font-bold text-slate-900 dark:text-white">AI Flyer Generator</h3>
      </div>
      <p className="text-sm text-slate-500">Create beautiful promotional materials for the app.</p>
      
      <div className="flex flex-wrap gap-2">
        {['modern', 'social', 'elegant'].map((s) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              style === s 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <button 
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
      >
        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {isGenerating ? 'Designing Flyer...' : 'Generate Flyer'}
      </button>

      {generatedFlyer && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative aspect-[9/16] w-full max-w-[250px] mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-700">
            <img src={generatedFlyer} alt="Generated Flyer" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={downloadFlyer}
              className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" /> Download
            </button>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'CaciousBibleQuiz Flyer',
                    text: 'Check out this awesome Bible Quiz app!',
                    url: window.location.origin
                  });
                }
              }}
              className="p-3 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl hover:bg-slate-200 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
