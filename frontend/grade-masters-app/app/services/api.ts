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
  headers: {
    'Content-Type': 'application/json',
  },
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

export const uploadPDF = async (file: File): Promise<ApiResponse<PDFUploadResponse>> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<PDFUploadResponse>>(
    '/api/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

// ========================================
// Summary API
// ========================================

export const getSummary = async (request: SummaryRequest): Promise<ApiResponse<Summary>> => {
  const response = await apiClient.post<ApiResponse<Summary>>('/api/summary', request);
  return response.data;
};

export const saveSummary = async (summary: Summary): Promise<ApiResponse<{ id: string }>> => {
  const response = await apiClient.post<ApiResponse<{ id: string }>>('/api/summary/save', summary);
  return response.data;
};

// ========================================
// Question Generation API
// ========================================

export const generateQuestions = async (
  request: QuestionGenerationRequest
): Promise<ApiResponse<QuestionSet>> => {
  const response = await apiClient.post<ApiResponse<QuestionSet>>('/api/questions/generate', request);
  return response.data;
};

export const saveQuestionSet = async (questionSet: QuestionSet): Promise<ApiResponse<{ id: string }>> => {
  const response = await apiClient.post<ApiResponse<{ id: string }>>('/api/questions/save', questionSet);
  return response.data;
};

// ========================================
// Exam & Grading API
// ========================================

export const submitExam = async (
  submission: SubmissionRequest
): Promise<ApiResponse<ExamResult>> => {
  const response = await apiClient.post<ApiResponse<ExamResult>>('/api/exam/submit', submission);
  return response.data;
};

export const getExamResult = async (resultId: string): Promise<ApiResponse<ExamResult>> => {
  const response = await apiClient.get<ApiResponse<ExamResult>>(`/api/exam/result/${resultId}`);
  return response.data;
};

// ========================================
// Export
// ========================================

export default apiClient;
