'use client';

import { useState } from 'react';
import Container from '../components/ui/Container';
import PDFUploader from '../components/chat/PDFUploader';

export default function ChatPage() {
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);

  const handleUploadComplete = (fileId: string) => {
    setUploadedFileId(fileId);
    console.log('File uploaded:', fileId);
  };

  return (
    <Container className="py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">학습 챗봇</h1>
          <p className="text-muted-foreground">
            PDF 파일을 업로드하고 AI와 대화를 시작하세요.
          </p>
        </div>

        {/* PDF Uploader */}
        <div className="mb-8">
          <PDFUploader onUploadComplete={handleUploadComplete} />
        </div>

        {/* Placeholder for Chat Interface (Sprint 2) */}
        {uploadedFileId && (
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground text-center">
              챗봇 인터페이스는 Sprint 2에서 구현됩니다.
              <br />
              업로드된 파일 ID: {uploadedFileId}
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}
