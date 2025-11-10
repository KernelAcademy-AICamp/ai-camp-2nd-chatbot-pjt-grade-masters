'use client';

import { useState } from 'react';
import Container from '../components/ui/Container';
import PDFUploader from '../components/chat/PDFUploader';
import ChatInterface from '../components/chat/ChatInterface';
import SummaryOptions from '../components/chat/SummaryOptions';
import SummaryDisplay from '../components/chat/SummaryDisplay';
import { useSummary } from '../hooks/useSummary';

export default function ChatPage() {
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'summary'>('summary');
  const { summary, isGenerating, generateSummary, clearSummary } = useSummary();

  const handleUploadComplete = (fileId: string) => {
    setUploadedFileId(fileId);
    clearSummary();
    console.log('File uploaded:', fileId);
  };

  const handleGenerateSummary = (type: 'simple' | 'detailed') => {
    if (uploadedFileId) {
      generateSummary(uploadedFileId, type);
    }
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
                  <p className="text-sm font-medium">PDF 업로드 완료</p>
                  <p className="text-xs text-muted-foreground">
                    파일 ID: {uploadedFileId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setUploadedFileId(null);
                  clearSummary();
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                다른 파일 업로드
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
            ) : (
              <ChatInterface fileId={uploadedFileId} />
            )}
          </div>
        )}
      </div>
    </Container>
  );
}
