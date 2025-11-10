'use client';

import { useState, useEffect } from 'react';
import Container from '../components/ui/Container';
import PDFUploader from '../components/chat/PDFUploader';
import ChatInterface from '../components/chat/ChatInterface';
import SummaryOptions from '../components/chat/SummaryOptions';
import SummaryDisplay from '../components/chat/SummaryDisplay';
import { useSummary } from '../hooks/useSummary';
import { useQuestions } from '../hooks/useQuestions';
import { useExam } from '../hooks/useExam';
import { useWrongAnswers } from '../hooks/useWrongAnswers';
import { storage } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';
import QuestionOptions from '../components/exam/QuestionOptions';
import ExamMode from '../components/exam/ExamMode';
import ResultDashboard from '../components/exam/ResultDashboard';

interface UploadedFileSession {
  fileId: string;
  fileName?: string;
  uploadedAt: string;
}

export default function ChatPage() {
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'summary' | 'exam'>('summary');
  const [isExamMode, setIsExamMode] = useState(false);
  const [processedResultId, setProcessedResultId] = useState<string | null>(null);

  const { summary, isGenerating, generateSummary, clearSummary } = useSummary();
  const {
    questionSet,
    isGenerating: isGeneratingQuestions,
    generateQuestionSet,
    clearQuestionSet
  } = useQuestions();
  const {
    result: examResult,
    isGrading,
    submitAnswers,
    clearResult
  } = useExam();
  const { addWrongAnswers } = useWrongAnswers();

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = storage.get<UploadedFileSession>(STORAGE_KEYS.uploadedFiles);
    if (savedSession?.fileId) {
      setUploadedFileId(savedSession.fileId);
      setFileName(savedSession.fileName || null);
      console.log('Session restored:', savedSession.fileId);
    }
  }, []);

  // Save session to localStorage whenever uploadedFileId changes
  useEffect(() => {
    if (uploadedFileId) {
      const session: UploadedFileSession = {
        fileId: uploadedFileId,
        fileName: fileName || undefined,
        uploadedAt: new Date().toISOString(),
      };
      storage.set(STORAGE_KEYS.uploadedFiles, session);
    } else {
      storage.remove(STORAGE_KEYS.uploadedFiles);
    }
  }, [uploadedFileId, fileName]);

  const handleUploadComplete = (fileId: string, name?: string) => {
    setUploadedFileId(fileId);
    setFileName(name || null);
    clearSummary();
    clearQuestionSet();
    clearResult();
    setIsExamMode(false);
    setProcessedResultId(null);
    console.log('File uploaded:', fileId);
  };

  const handleGenerateSummary = (type: 'simple' | 'detailed') => {
    if (uploadedFileId) {
      generateSummary(uploadedFileId, type);
    }
  };

  const handleGenerateQuestions = (options: {
    difficulty: any;
    type: any;
    count: number;
    topics?: string[];
  }) => {
    if (uploadedFileId) {
      generateQuestionSet(uploadedFileId, options);
    }
  };

  const handleStartExam = () => {
    setIsExamMode(true);
  };

  const handleExitExam = () => {
    setIsExamMode(false);
  };

  const handleSubmitExam = async (answers: any[], timeSpent: number) => {
    if (questionSet) {
      await submitAnswers(questionSet.id, answers, timeSpent);
      setIsExamMode(false);
    }
  };

  // Add wrong answers when exam result is available (only once per result)
  useEffect(() => {
    if (examResult && questionSet && examResult.id !== processedResultId) {
      console.log('Adding wrong answers to notebook for result:', examResult.id);
      addWrongAnswers(examResult, questionSet.questions);
      setProcessedResultId(examResult.id);
    }
  }, [examResult, questionSet, addWrongAnswers, processedResultId]);

  const handleRetryExam = () => {
    clearResult();
    setIsExamMode(true);
  };

  const handleNewExam = () => {
    clearQuestionSet();
    clearResult();
    setIsExamMode(false);
    setProcessedResultId(null);
  };

  return (
    <Container className="py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">학습 챗봇</h1>
          <p className="text-muted-foreground">
            PDF 파일을 업로드하고 요약을 생성하거나 AI와 대화를 시작하세요.
          </p>
        </div>

        {/* PDF Uploader */}
        {!uploadedFileId && (
          <div className="mb-8">
            <PDFUploader onUploadComplete={handleUploadComplete} />
          </div>
        )}

        {/* Main Content */}
        {uploadedFileId && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {fileName || 'PDF 업로드 완료'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    파일 ID: {uploadedFileId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setUploadedFileId(null);
                  setFileName(null);
                  clearSummary();
                  storage.remove(STORAGE_KEYS.uploadedFiles);
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                다시 시작
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'summary'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                요약
              </button>
              <button
                onClick={() => setActiveTab('exam')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'exam'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                문제풀이
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'chat'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                채팅
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'summary' ? (
              <div className="space-y-6">
                {!summary ? (
                  <SummaryOptions
                    onGenerate={handleGenerateSummary}
                    isGenerating={isGenerating}
                  />
                ) : (
                  <>
                    <SummaryDisplay summary={summary} />
                    <button
                      onClick={clearSummary}
                      className="w-full py-2 px-4 rounded-lg border hover:bg-muted transition-colors text-sm"
                    >
                      새로운 요약 생성
                    </button>
                  </>
                )}
              </div>
            ) : activeTab === 'exam' ? (
              <div className="space-y-6">
                {isExamMode && questionSet ? (
                  <div className="fixed inset-0 z-50 bg-background">
                    <ExamMode
                      questions={questionSet.questions}
                      onSubmit={handleSubmitExam}
                      onExit={handleExitExam}
                    />
                  </div>
                ) : examResult ? (
                  <ResultDashboard
                    result={examResult}
                    questions={questionSet?.questions || []}
                    onRetry={handleRetryExam}
                    onClose={handleNewExam}
                  />
                ) : questionSet ? (
                  <div className="space-y-6">
                    <div className="rounded-lg border bg-card p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6 text-green-600"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1">문제 생성 완료</h3>
                          <p className="text-sm text-muted-foreground">
                            총 <span className="font-semibold text-foreground">{questionSet.questions.length}개</span>의 문제가 생성되었습니다.
                            (배점: {questionSet.totalPoints}점)
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleStartExam}
                          className="flex-1 py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                        >
                          시험 시작하기
                        </button>
                        <button
                          onClick={handleNewExam}
                          className="px-4 py-2 rounded-lg border hover:bg-muted transition-colors text-sm"
                        >
                          새 문제 생성
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <QuestionOptions
                    onGenerate={handleGenerateQuestions}
                    isGenerating={isGeneratingQuestions}
                  />
                )}
              </div>
            ) : (
              <ChatInterface fileId={uploadedFileId} />
            )}
          </div>
        )}
      </div>
    </Container>
  );
}
