'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface HealthStatus {
  backend: {
    status: 'healthy' | 'unhealthy' | 'unreachable';
    url: string;
    data?: {
      status: string;
      database: string;
      cache: string;
    };
    error?: string;
    statusCode?: number;
  };
  frontend: {
    status: 'healthy';
    timestamp: string;
  };
}

export default function HealthCheckPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth({
        backend: {
          status: 'unreachable',
          url: 'http://localhost:9090',
          error: 'Failed to connect',
        },
        frontend: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      checkHealth();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'unhealthy':
        return 'bg-yellow-500';
      case 'unreachable':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return '정상';
      case 'unhealthy':
        return '불안정';
      case 'unreachable':
        return '연결 불가';
      default:
        return '알 수 없음';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4 inline-block"
          >
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            시스템 상태 모니터링
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            프론트엔드와 백엔드 서버의 연결 상태를 확인합니다
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={checkHealth}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '확인 중...' : '지금 확인'}
              </button>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  자동 새로고침 (5초마다)
                </span>
              </label>
            </div>

            {lastChecked && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                마지막 확인: {lastChecked.toLocaleTimeString('ko-KR')}
              </div>
            )}
          </div>
        </div>

        {/* Status Cards */}
        {health && (
          <div className="space-y-6">
            {/* Frontend Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  프론트엔드 서버
                </h2>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(health.frontend.status)}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getStatusText(health.frontend.status)}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">URL:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    http://localhost:8080
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">타임스탬프:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {new Date(health.frontend.timestamp).toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Backend Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  백엔드 서버
                </h2>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(health.backend.status)}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getStatusText(health.backend.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">URL:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {health.backend.url}
                  </span>
                </div>

                {health.backend.statusCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">상태 코드:</span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {health.backend.statusCode}
                    </span>
                  </div>
                )}

                {health.backend.data && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">서버 상태:</span>
                      <span className="font-mono text-gray-900 dark:text-white">
                        {health.backend.data.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">데이터베이스:</span>
                      <span className="font-mono text-gray-900 dark:text-white">
                        {health.backend.data.database}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">캐시:</span>
                      <span className="font-mono text-gray-900 dark:text-white">
                        {health.backend.data.cache}
                      </span>
                    </div>
                  </>
                )}

                {health.backend.error && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      <span className="font-semibold">오류:</span> {health.backend.error}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* API Endpoints Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                API 엔드포인트
              </h2>
              <div className="space-y-3">
                {[
                  { name: 'PDF 업로드', path: '/api/v1/pdf/upload' },
                  { name: '문서 요약', path: '/api/v1/summary/generate' },
                  { name: '퀴즈 생성', path: '/api/v1/quiz/generate' },
                  { name: '퀴즈 제출', path: '/api/v1/quiz/submit' },
                  { name: 'Q&A', path: '/api/v1/qa/ask' },
                  { name: '학습 분석', path: '/api/v1/analytics/overview' },
                ].map((endpoint) => (
                  <div
                    key={endpoint.path}
                    className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {endpoint.name}
                    </span>
                    <code className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {endpoint.path}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!health && loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">상태 확인 중...</p>
          </div>
        )}
      </div>
    </div>
  );
}
