import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from '../utils/constants';
import type {
  ApiResponse,
  PDFUploadResponse,
  SummaryRequest,
  Summary,
  QuestionGenerationRequest,
  QuestionSet,
  SubmissionRequest,
  ExamResult,
} from '@/types';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if needed in the future
    // const token = storage.get('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ========================================
// PDF Upload API
// ========================================

export const uploadPDF = async (
  file: File,
  useOcr = false,
  analyzeImages = false
): Promise<PDFUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(
    `/api/v1/pdf/upload?use_ocr=${useOcr}&analyze_images=${analyzeImages}`,
    formData
  );

  return response.data;
};

export const getDocument = async (documentId: string): Promise<any> => {
  const response = await apiClient.get(`/api/v1/pdf/${documentId}`);
  return response.data;
};

// ========================================
// Summary API
// ========================================

export const generateSummary = async (documentId: string): Promise<any> => {
  const response = await apiClient.post('/api/v1/summary/generate', {
    document_id: documentId,
  });
  return response.data;
};

export const getSummary = async (summaryId: string): Promise<any> => {
  const response = await apiClient.get(`/api/v1/summary/${summaryId}`);
  return response.data;
};

export const getSummaryByDocument = async (documentId: string): Promise<any> => {
  const response = await apiClient.get(`/api/v1/summary/document/${documentId}`);
  return response.data;
};

// ========================================
// Quiz Generation API
// ========================================

export const generateQuiz = async (documentId: string, numItems: number = 4): Promise<any> => {
  console.log(`[API] Generating quiz with ${numItems} items for document ${documentId}`);
  const response = await apiClient.post('/api/v1/quiz/generate', {
    document_id: documentId,
    num_items: numItems,
  });
  console.log(`[API] Quiz generated successfully:`, response.data);
  return response.data;
};

export const getQuiz = async (quizId: string): Promise<any> => {
  const response = await apiClient.get(`/api/v1/quiz/${quizId}`);
  return response.data;
};

export const submitQuiz = async (quizId: string, userAnswers: any[]): Promise<any> => {
  console.log('[API] Submitting quiz:', quizId, 'with', userAnswers.length, 'answers');
  const response = await apiClient.post('/api/v1/quiz/grade', {
    quiz_id: quizId,
    user_answers: userAnswers,
  });
  console.log('[API] Quiz graded successfully:', response.data);
  return response.data;
};

export const getQuizResult = async (resultId: string): Promise<any> => {
  const response = await apiClient.get(`/api/v1/quiz/result/${resultId}`);
  return response.data;
};

export const getWrongAnswers = async (resultId: string): Promise<any> => {
  const response = await apiClient.get(`/api/v1/quiz/wrong-answers/${resultId}`);
  return response.data;
};

// ========================================
// Q&A API
// ========================================

export const askQuestion = async (documentId: string, question: string): Promise<any> => {
  const response = await apiClient.post('/api/v1/qa/ask', {
    document_id: documentId,
    question: question,
  });
  return response.data;
};

// ========================================
// Analytics API
// ========================================

export const getAnalyticsOverview = async (days = 30): Promise<any> => {
  const response = await apiClient.get(`/api/v1/analytics/overview?days=${days}`);
  return response.data;
};

export const getLearningProgress = async (limit = 10): Promise<any> => {
  const response = await apiClient.get(`/api/v1/analytics/progress?limit=${limit}`);
  return response.data;
};

export const getWeakTopics = async (minAttempts = 2): Promise<any> => {
  const response = await apiClient.get(`/api/v1/analytics/weak-topics?min_attempts=${minAttempts}`);
  return response.data;
};

export const getWrongAnswerAnalysis = async (limit = 20): Promise<any> => {
  const response = await apiClient.get(`/api/v1/analytics/wrong-answer-analysis?limit=${limit}`);
  return response.data;
};

export const getStudyTimeAnalysis = async (days = 7): Promise<any> => {
  const response = await apiClient.get(`/api/v1/analytics/study-time?days=${days}`);
  return response.data;
};

// ========================================
// Export
// ========================================

export default apiClient;
