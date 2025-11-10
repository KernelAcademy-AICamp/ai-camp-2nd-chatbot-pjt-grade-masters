// ========================================
// API Response Types
// ========================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ========================================
// PDF Related Types
// ========================================

export interface PDFFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  pageCount?: number;
  url?: string;
}

export interface PDFUploadResponse {
  document_id: string;
  file_name?: string;
  file_size?: number;
  page_count?: number;
  uploaded_at?: string;
}

// ========================================
// Summary Related Types
// ========================================

export interface Summary {
  id: string;
  fileId: string;
  content: string;
  keywords: string[];
  sections: SummarySection[];
  createdAt: Date;
  type: 'simple' | 'detailed';
}

export interface SummarySection {
  id: string;
  title: string;
  content: string;
  pageRange?: {
    start: number;
    end: number;
  };
}

export interface SummaryRequest {
  fileId: string;
  type: 'simple' | 'detailed';
  options?: {
    includeSections?: boolean;
    includeKeywords?: boolean;
  };
}

// ========================================
// Question Related Types
// ========================================

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'essay' | 'short_answer';

export interface Question {
  id: string;
  content: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  points: number;
  topic?: string;
  relatedSection?: string;
}

export interface QuestionSet {
  id: string;
  name: string;
  fileId: string;
  questions: Question[];
  createdAt: Date;
  totalPoints: number;
}

export interface QuestionGenerationRequest {
  fileId: string;
  count: number;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  topics?: string[];
}

// ========================================
// Answer & Grading Types
// ========================================

export interface Answer {
  questionId: string;
  content: string;
  submittedAt?: Date;
  isFlagged?: boolean;
}

export interface SubmissionRequest {
  questionSetId: string;
  answers: Answer[];
  timeSpent?: number; // in seconds
}

export interface GradingResult {
  questionId: string;
  score: number;
  maxScore: number;
  feedback: string;
  modelAnswer?: string;
  isCorrect?: boolean;
}

export interface ExamResult {
  id: string;
  questionSetId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade?: string;
  results: GradingResult[];
  submittedAt: Date;
  timeSpent?: number;
}

// ========================================
// Wrong Answer (오답노트) Types
// ========================================

export interface WrongAnswer {
  id: string;
  questionId: string;
  question: Question;
  userAnswer: string;
  correctAnswer: string;
  feedback: string;
  retryCount: number;
  lastRetryAt?: Date;
  isResolved: boolean;
}

export interface WrongAnswerStats {
  totalWrong: number;
  byDifficulty: Record<QuestionDifficulty, number>;
  byTopic: Record<string, number>;
  weakAreas: string[];
}

// ========================================
// Chat & Message Types
// ========================================

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: {
    fileId?: string;
    summaryId?: string;
    questionSetId?: string;
  };
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
}

// ========================================
// Learning Analytics Types
// ========================================

export interface LearningStats {
  totalStudyTime: number; // in minutes
  totalPDFsProcessed: number;
  totalQuestionsSolved: number;
  averageScore: number;
  improvementRate: number; // percentage
  weakAreas: {
    topic: string;
    accuracy: number;
  }[];
  strongAreas: {
    topic: string;
    accuracy: number;
  }[];
}

export interface StudySession {
  id: string;
  fileId: string;
  fileName: string;
  startedAt: Date;
  endedAt?: Date;
  duration?: number; // in minutes
  questionsAttempted: number;
  score?: number;
}

// Backend API Response Types for Analytics
export interface AnalyticsOverview {
  period_days: number;
  total_documents: number;
  total_quizzes: number;
  total_quiz_attempts: number;
  average_accuracy: number;
  total_wrong_answers: number;
  recent_documents: number;
  recent_quiz_attempts: number;
}

export interface RecentResult {
  result_id: string;
  quiz_id: string;
  document_name: string;
  accuracy: number;
  created_at: string;
}

export interface LearningProgress {
  recent_results: RecentResult[];
  average_accuracy: number;
  trend: 'improving' | 'stable' | 'no_data';
  total_count: number;
}

export interface WeakTopic {
  document_id: string;
  document_name: string;
  attempt_count: number;
  average_accuracy: number;
  recommendation: string;
}

export interface WeakTopicsResponse {
  weak_topics: WeakTopic[];
  total_count: number;
}

export interface WrongAnswerItem {
  wrong_answer_id: string;
  document_name: string;
  question: string;
  user_answer: string;
  correct_answer: string;
  explanation: string;
  created_at: string;
}

export interface WrongAnswerAnalysis {
  wrong_answers: WrongAnswerItem[];
  pattern_analysis: {
    total_wrong_answers: number;
    recent_mistakes: WrongAnswerItem[];
    recommendation: string;
  };
  total_count: number;
}

export interface DailyStat {
  date: string;
  quiz_attempts: number;
  average_accuracy: number;
}

export interface StudyTimeAnalysis {
  period_days: number;
  daily_stats: DailyStat[];
  total_quiz_attempts: number;
  active_days: number;
  average_daily_attempts: number;
}

// ========================================
// UI Component Props Types
// ========================================

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// ========================================
// Theme Types
// ========================================

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}
