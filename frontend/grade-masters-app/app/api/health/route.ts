import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:9090';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
    });

    const data = await response.json();

    return NextResponse.json({
      backend: {
        status: response.ok ? 'healthy' : 'unhealthy',
        url: BACKEND_URL,
        data,
        statusCode: response.status,
      },
      frontend: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
    }, { status: response.ok ? 200 : 503 });
  } catch (error) {
    return NextResponse.json({
      backend: {
        status: 'unreachable',
        url: BACKEND_URL,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      frontend: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
    }, { status: 503 });
  }
}
