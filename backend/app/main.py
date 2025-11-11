from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.core.database import init_db
from app.core.config import settings
from app.api.v1 import pdf, summary, quiz, qa, analytics
import asyncio
import time

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 시작 및 종료 시 실행될 작업"""
    # 시작 시: 데이터베이스 초기화
    init_db()
    print("✅ 데이터베이스 초기화 완료")
    yield
    # 종료 시: 필요한 정리 작업 (현재는 없음)
    print("🔚 애플리케이션 종료")

# FastAPI 앱 생성
app = FastAPI(
    title="학점마스터 API (실습용)",
    description="PDF 분석 및 퀴즈 생성을 위한 FastAPI 백엔드",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# 타임아웃 미들웨어 설정
@app.middleware("http")
async def timeout_middleware(request: Request, call_next):
    """모든 요청에 대해 타임아웃 적용"""
    try:
        return await asyncio.wait_for(call_next(request), timeout=settings.request_timeout)
    except asyncio.TimeoutError:
        return JSONResponse(
            status_code=504,
            content={
                "detail": f"요청 처리 시간이 초과되었습니다 ({settings.request_timeout/60}분)",
                "error": "Request timeout"
            }
        )

# API 라우터 등록
app.include_router(pdf.router, prefix=settings.api_prefix + "/pdf", tags=["PDF"])
app.include_router(summary.router, prefix=settings.api_prefix + "/summary", tags=["Summary"])
app.include_router(quiz.router, prefix=settings.api_prefix + "/quiz", tags=["Quiz"])
app.include_router(qa.router, prefix=settings.api_prefix + "/qa", tags=["Q&A"])
app.include_router(analytics.router, prefix=settings.api_prefix + "/analytics", tags=["Analytics"])

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "학점마스터 API (실습용)",
        "version": "1.0.0",
        "docs": "http://localhost:9090/docs",
        "openapi": "http://localhost:9090/openapi.json"
    }

@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {
        "status": "healthy",
        "database": "connected",
        "cache": "active"
    }
