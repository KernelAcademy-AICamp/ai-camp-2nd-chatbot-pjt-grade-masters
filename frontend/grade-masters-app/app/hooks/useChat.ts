'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { askQuestion } from '../services/api';
import { storage } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';
import type { ChatMessage, ChatSession } from '@/types';

interface UseChatReturn {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  sessionId: string;
}

export function useChat(fileId?: string): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    if (fileId) {
      const savedSession = storage.get<ChatSession>(`${STORAGE_KEYS.chatHistory}-${fileId}`);
      if (savedSession?.messages) {
        setMessages(savedSession.messages);
      } else {
        // Initialize with welcome message
        const welcomeMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'PDF 파일이 업로드되었습니다. 궁금한 내용을 물어보세요!',
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [fileId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (fileId && messages.length > 0) {
      const session: ChatSession = {
        id: sessionId,
        messages,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      storage.set(`${STORAGE_KEYS.chatHistory}-${fileId}`, session);
    }
  }, [messages, fileId, sessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !fileId) return;

      // Add user message
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      try {
        // Call actual API
        const response = await askQuestion(fileId, content);

        if (response && response.answer) {
          const aiMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: response.answer,
            timestamp: new Date(),
            metadata: {
              fileId,
            },
          };

          setMessages((prev) => [...prev, aiMessage]);
        } else {
          throw new Error('Failed to get response');
        }
      } catch (error) {
        console.error('Failed to send message:', error);

        // Add error message
        const errorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'system',
          content: '메시지 전송에 실패했습니다. 다시 시도해주세요.',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    [fileId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    if (fileId) {
      storage.remove(`${STORAGE_KEYS.chatHistory}-${fileId}`);
    }
  }, [fileId]);

  return {
    messages,
    isTyping,
    sendMessage,
    clearMessages,
    sessionId,
  };
}
