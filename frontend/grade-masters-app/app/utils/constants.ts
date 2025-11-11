// ========================================
// Application Constants
// ========================================

export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || '학점마스터',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  description: 'AI 기반 학습 보조 챗봇 서비스',
} as const;

// ========================================
// API Configuration
// ========================================

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  timeout: 1800000, // 30 minutes
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

// ========================================
// File Upload Configuration
// ========================================

export const FILE_CONFIG = {
  maxSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '52428800'), // 50MB
  allowedTypes: ['application/pdf'],
  allowedExtensions: ['.pdf'],
} as const;

// ========================================
// Question Configuration
// ========================================

export const QUESTION_CONFIG = {
  difficulties: ['easy', 'medium', 'hard'] as const,
  types: ['essay', 'short_answer'] as const,
  countOptions: [5, 10, 15, 20] as const,
  minCount: 5,
  maxCount: 20,
  defaultCount: 10,
  defaultDifficulty: 'medium' as const,
  defaultType: 'short_answer' as const,
} as const;

// ========================================
// UI Constants
// ========================================

export const UI_CONFIG = {
  toastDuration: 3000, // 3 seconds
  debounceDelay: 300, // 300ms
  autoSaveInterval: 30000, // 30 seconds
  maxChatHistory: 100,
} as const;

// ========================================
// Routes
// ========================================

export const ROUTES = {
  home: '/',
  chat: '/chat',
  history: '/history',
  about: '/about',
  exam: '/exam',
  wrongAnswers: '/wrong-answers',
  analytics: '/analytics',
  health: '/health',
} as const;

// ========================================
// Local Storage Keys
// ========================================

export const STORAGE_KEYS = {
  theme: 'gm-theme',
  chatHistory: 'gm-chat-history',
  userSession: 'gm-user-session',
  uploadedFiles: 'gm-uploaded-files',
  examDraft: 'gm-exam-draft',
  wrongAnswers: 'gm-wrong-answers',
  learningStats: 'gm-learning-stats',
} as const;

// ========================================
// Error Messages
// ========================================

export const ERROR_MESSAGES = {
  fileUpload: {
    tooLarge: '파일 크기가 너무 큽니다. 50MB 이하의 파일만 업로드 가능합니다.',
    invalidType: 'PDF 파일만 업로드 가능합니다.',
    uploadFailed: '파일 업로드에 실패했습니다. 다시 시도해주세요.',
  },
  api: {
    networkError: '네트워크 연결을 확인해주세요.',
    serverError: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    timeout: '요청 시간이 초과되었습니다.',
    unauthorized: '인증이 필요합니다.',
  },
  general: {
    unknown: '알 수 없는 오류가 발생했습니다.',
    required: '필수 항목입니다.',
  },
} as const;

// ========================================
// Success Messages
// ========================================

export const SUCCESS_MESSAGES = {
  fileUpload: 'PDF 파일이 성공적으로 업로드되었습니다.',
  summarySaved: '요약이 저장되었습니다.',
  questionGenerated: '문제가 성공적으로 생성되었습니다.',
  examSubmitted: '답안이 제출되었습니다.',
  gradingComplete: '채점이 완료되었습니다.',
} as const;
