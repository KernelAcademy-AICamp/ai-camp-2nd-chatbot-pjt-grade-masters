from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# SQLite 데이터베이스 URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./data/database.db"

# SQLite 엔진 생성 (check_same_thread=False는 SQLite에서 여러 스레드 사용을 허용)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# 세션 로컬 클래스 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base 클래스 생성
Base = declarative_base()

def get_db():
    """데이터베이스 세션 생성 및 반환"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """데이터베이스 초기화 및 테이블 생성"""
    from app.models import models

    # data 디렉토리가 없으면 생성
    os.makedirs("data", exist_ok=True)

    # 모든 테이블 생성
    Base.metadata.create_all(bind=engine)
