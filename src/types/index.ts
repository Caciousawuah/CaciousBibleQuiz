import { User as FirebaseUser } from 'firebase/auth';
import { Question } from '../services/geminiService';

export type { FirebaseUser, Question };

export interface UserStats {
  uid: string;
  streak: number;
  lastQuizDate: any;
  totalQuizzes: number;
  totalScore: number;
  achievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: UserStats) => boolean;
}

export interface Score {
  id?: string;
  uid: string;
  displayName: string;
  photoURL?: string;
  score: number;
  totalQuestions: number;
  category: string;
  timestamp: any;
}
