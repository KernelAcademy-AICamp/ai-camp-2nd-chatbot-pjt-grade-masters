import uvicorn
import os
from app.core.config import settings

if __name__ == "__main__":
    # 필요한 디렉토리 생성
    os.makedirs("data/uploads", exist_ok=True)

    print("=" * 50)
    print("🚀 학점마스터 API 서버 시작")
    print("=" * 50)
    print("📍 API 서버: http://localhost:9090")
    print("📚 API 문서: http://localhost:9090/docs")
    print("🔍 OpenAPI 스키마: http://localhost:9090/openapi.json")
    print(f"⏱️  요청 타임아웃: {settings.request_timeout/60}분")
    print("=" * 50)
    print()

    # FastAPI 앱 실행
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=9090,
        reload=True,
        log_level="info",
        timeout_keep_alive=int(settings.request_timeout),  # keep-alive 타임아웃
        timeout_graceful_shutdown=int(settings.request_timeout)  # graceful shutdown 타임아웃
    )
