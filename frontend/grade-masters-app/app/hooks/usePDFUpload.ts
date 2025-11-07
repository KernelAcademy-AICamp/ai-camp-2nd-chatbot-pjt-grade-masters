'use client';

import { useState, useCallback } from 'react';
import { uploadPDF } from '../services/api';
import { validateFileType, validateFileSize } from '../utils/helpers';
import { FILE_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import type { PDFFile } from '@/types';

interface UploadError {
  message: string;
  type: 'validation' | 'network' | 'server';
}

interface UseFileUploadReturn {
  files: PDFFile[];
  isUploading: boolean;
  error: UploadError | null;
  uploadFile: (file: File) => Promise<void>;
  removeFile: (id: string) => void;
  clearError: () => void;
}

export function usePDFUpload(): UseFileUploadReturn {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<UploadError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    clearError();

    // Validate file type
    if (!validateFileType(file, FILE_CONFIG.allowedTypes)) {
      setError({
        message: ERROR_MESSAGES.fileUpload.invalidType,
        type: 'validation',
      });
      return;
    }

    // Validate file size
    if (!validateFileSize(file, FILE_CONFIG.maxSize)) {
      setError({
        message: ERROR_MESSAGES.fileUpload.tooLarge,
        type: 'validation',
      });
      return;
    }

    // Create temporary file object
    const tempFile: PDFFile = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      status: 'uploading',
    };

    setFiles(prev => [...prev, tempFile]);
    setIsUploading(true);

    try {
      // Upload to server
      const response = await uploadPDF(file);

      if (response.success && response.data) {
        // Update file with server response
        setFiles(prev =>
          prev.map(f =>
            f.id === tempFile.id
              ? {
                  ...f,
                  id: response.data.fileId,
                  status: 'completed' as const,
                  pageCount: response.data.pageCount,
                }
              : f
          )
        );

        // Optional: Show success message
        console.log(SUCCESS_MESSAGES.fileUpload);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);

      // Update file status to failed
      setFiles(prev =>
        prev.map(f =>
          f.id === tempFile.id
            ? { ...f, status: 'failed' as const }
            : f
        )
      );

      setError({
        message: ERROR_MESSAGES.fileUpload.uploadFailed,
        type: 'server',
      });
    } finally {
      setIsUploading(false);
    }
  }, [clearError]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  return {
    files,
    isUploading,
    error,
    uploadFile,
    removeFile,
    clearError,
  };
}
