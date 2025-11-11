from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

# .env 파일 로드 (기존 환경 변수 덮어쓰기)
load_dotenv(override=True)

class Settings(BaseSettings):
    """애플리케이션 설정"""

    # OpenAI API Key
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")

    # 데이터베이스 설정
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./data/database.db")

    # 파일 업로드 설정
    upload_dir: str = os.getenv("UPLOAD_DIR", "./data/uploads")
    max_upload_size: int = 50 * 1024 * 1024  # 50MB

    # API 설정
    api_version: str = "v1"
    api_prefix: str = "/api/v1"

    # CORS 설정
    cors_origins: list = ["http://localhost:8080", "http://localhost:3000"]

    # OpenAI 모델 설정
    gpt_model: str = "gpt-4o"
    gpt_vision_model: str = "gpt-4o"

    # 텍스트 청킹 설정
    chunk_size: int = 6000

    # 캐시 설정
    cache_expire_seconds: int = 3600

    # 타임아웃 설정 (초 단위)
    openai_timeout: float = 1800.0  # 30분 - OpenAI API 타임아웃
    request_timeout: float = 1800.0  # 30분 - 전체 요청 타임아웃

    class Config:
        env_file = ".env"
        case_sensitive = False

# 설정 인스턴스 생성
settings = Settings()
