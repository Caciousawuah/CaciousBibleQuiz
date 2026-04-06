import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ChevronRight, 
  Book as BookIcon, 
  ArrowRight,
  Play,
  BookOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import { BIBLE_BOOKS } from '../constants';

export function BookSelection() {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const navigate = useNavigate();

  const filteredBooks = BIBLE_BOOKS.filter(book => 
    book.name.toLowerCase().includes(search.toLowerCase()) ||
    book.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = Array.from(new Set(BIBLE_BOOKS.map(b => b.category)));

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Select a Book</h1>
        <p className="text-slate-500">Choose which part of the Bible you want to study today.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search books or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <select 
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <div className="space-y-8">
        {categories.map(category => {
          const categoryBooks = filteredBooks.filter(b => b.category === category);
          if (categoryBooks.length === 0) return null;

          return (
            <div key={category} className="space-y-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryBooks.map(book => (
                  <motion.button
                    key={book.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/select-chapter/${book.name}?difficulty=${difficulty}`)}
                    className="flex items-center justify-between p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:border-blue-500 dark:hover:border-blue-500 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <BookIcon className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-slate-900 dark:text-white">{book.name}</h3>
                        <p className="text-xs text-slate-500">{book.chapters} Chapters</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </motion.button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChapterSelection() {
  const { bookName } = useParams();
  const [searchParams] = useSearchParams();
  const difficulty = searchParams.get('difficulty') || 'Medium';
  const navigate = useNavigate();

  const book = BIBLE_BOOKS.find(b => b.name === bookName);
  if (!book) return <div>Book not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowRight className="w-6 h-6 rotate-180" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{book.name}</h1>
          <p className="text-slate-500">Select a chapter or start a quick quiz</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white space-y-4 shadow-xl">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Play className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Quick Quiz</h2>
          <p className="text-blue-100">5 random questions from anywhere in {book.name}.</p>
          <button 
            onClick={() => navigate(`/quiz/${book.name}?difficulty=${difficulty}&chapter=0`)}
            className="w-full py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-colors"
          >
            Start Quick Quiz
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Full Study</h2>
          <p className="text-slate-500">3 questions per verse for a specific chapter. Deep dive into the Word.</p>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Select a chapter below</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Chapters</h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map(chapter => (
            <motion.button
              key={chapter}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(`/quiz/${book.name}?difficulty=${difficulty}&chapter=${chapter}&mode=study`)}
              className="aspect-square flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
            >
              {chapter}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useParams, useSearchParams } from 'react-router-dom';
