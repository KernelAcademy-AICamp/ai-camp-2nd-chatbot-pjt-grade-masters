from sqlalchemy import Column, String, Text, Boolean, DateTime, JSON, Float
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class Document(Base):
    """PDF 문서 모델"""
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    content = Column(Text)  # 추출된 텍스트
    ocr_used = Column(Boolean, default=False)  # OCR 사용 여부
    image_analysis = Column(JSON)  # 이미지/그래프 분석 결과
    file_path = Column(String)  # 파일 저장 경로
    created_at = Column(DateTime, server_default=func.now())

class Summary(Base):
    """문서 요약 모델"""
    __tablename__ = "summaries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, nullable=False)
    content = Column(Text)  # 요약 내용
    created_at = Column(DateTime, server_default=func.now())

class Quiz(Base):
    """퀴즈 모델"""
    __tablename__ = "quizzes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, nullable=False)
    items = Column(JSON)  # 문제 목록 (객관식/주관식)
    created_at = Column(DateTime, server_default=func.now())

class QuizResult(Base):
    """퀴즈 결과 모델"""
    __tablename__ = "quiz_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    quiz_id = Column(String, nullable=False)
    answers = Column(JSON)  # 사용자 답안
    results = Column(JSON)  # 채점 결과 (각 문항별 정답/오답, 피드백)
    accuracy = Column(Float)  # 정확도 (0.0 ~ 1.0)
    created_at = Column(DateTime, server_default=func.now())

class WrongAnswer(Base):
    """오답 노트 모델"""
    __tablename__ = "wrong_answers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    quiz_result_id = Column(String, nullable=False)
    question_id = Column(String, nullable=False)  # 문제 ID
    question = Column(Text)  # 문제 내용
    user_answer = Column(Text)  # 사용자 답안
    correct_answer = Column(Text)  # 정답
    explanation = Column(Text)  # 해설
    created_at = Column(DateTime, server_default=func.now())
