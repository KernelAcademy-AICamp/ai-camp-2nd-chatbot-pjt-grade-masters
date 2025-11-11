# 학점마스터 Backend API 개발 실행 계획 (로컬 실습용)

## 📋 프로젝트 정보
- **프로젝트명**: 학점마스터 Backend API Server (실습용)
- **목표**: Streamlit 프로토타입을 FastAPI로 마이그레이션 (로컬 환경)
- **기술 스택**: FastAPI, Python 3.11+, SQLite, OpenAI GPT-4o
- **개발 기간**: 4주 (실습 중심)
- **서버 포트**: localhost:9090
- **프론트엔드 연동**: localhost:8080
- **실행 환경**: 로컬 개발 환경 (Docker 없음)

---

## 🏠 로컬 환경 특징

### 단순화된 구조
- **데이터베이스**: SQLite (파일 기반, 설치 불필요)
- **캐싱**: 메모리 캐싱 (Redis 없음)
- **파일 저장**: 로컬 디렉토리
- **비동기 처리**: FastAPI 내장 백그라운드 태스크 (Celery 없음)
- **배포**: 개발 서버만 사용 (uvicorn)

### 장점
- 별도 서비스 설치 불필요
- 즉시 실행 가능
- 디버깅 용이
- 학습 목적에 적합

---

## 🎯 Phase 1: 빠른 시작 및 핵심 서비스 구현 (Week 1)

### 📌 Day 1-2: 프로젝트 초기 설정

#### 1.1 개발 환경 설정 ✅ 체크리스트

```bash
# 프로젝트 구조 (단순화)
chatbot-backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── pdf.py
│   │       ├── summary.py
│   │       └── quiz.py
│   ├── core/
│   │   ├── config.py
│   │   └── database.py
│   ├── models/
│   │   └── models.py
│   ├── services/
│   │   ├── pdf_service.py
│   │   ├── summary_service.py
│   │   ├── quiz_service.py
│   │   └── openai_service.py
│   └── main.py
├── data/
│   ├── uploads/      # PDF 업로드 폴더
│   └── database.db   # SQLite DB 파일
├── .env
├── requirements.txt
└── run.py           # 실행 스크립트
```

**requirements.txt (최소 의존성):**
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
openai==1.3.5
langchain-community==0.0.10
pypdf==3.17.0
PyMuPDF==1.23.8
pillow==10.1.0
python-dotenv==1.0.0
sqlalchemy==2.0.23
pydantic==2.5.0
pydantic-settings==2.1.0
```

**빠른 시작 명령어:**
```bash
# 1. 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. 패키지 설치
pip install -r requirements.txt

# 3. 환경 변수 설정
echo "OPENAI_API_KEY=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" > .env

# 4. 서버 실행
python run.py
```

**run.py (간단한 실행 스크립트):**
```python
import uvicorn
import os

if __name__ == "__main__":
    # 데이터 폴더 생성
    os.makedirs("data/uploads", exist_ok=True)

    # 서버 실행
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=9090,
        reload=True
    )
```

#### 1.2 SQLite 데이터베이스 설정 ✅ 체크리스트

**database.py (SQLite 설정):**
```python
# app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite 데이터베이스 URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./data/database.db"

# 엔진 생성
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite 전용 설정
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 테이블 자동 생성
def init_db():
    from app.models import models  # 모델 import
    Base.metadata.create_all(bind=engine)
```

**models.py (간단한 모델):**
```python
# app/models/models.py
from sqlalchemy import Column, String, Text, Boolean, DateTime, JSON, Float
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    content = Column(Text)  # 추출된 텍스트
    ocr_used = Column(Boolean, default=False)
    image_analysis = Column(JSON)  # 이미지 분석 결과
    file_path = Column(String)  # 로컬 파일 경로
    created_at = Column(DateTime, server_default=func.now())

class Summary(Base):
    __tablename__ = "summaries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, nullable=False)
    content = Column(Text)  # 요약 내용
    created_at = Column(DateTime, server_default=func.now())

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, nullable=False)
    items = Column(JSON)  # 문제 JSON
    created_at = Column(DateTime, server_default=func.now())

class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    quiz_id = Column(String, nullable=False)
    answers = Column(JSON)
    results = Column(JSON)
    accuracy = Column(Float)
    created_at = Column(DateTime, server_default=func.now())
```

**작업 항목:**
- [ ] 프로젝트 폴더 생성
- [ ] 가상환경 설정
- [ ] 패키지 설치
- [ ] .env 파일 생성 (OPENAI_API_KEY)
- [ ] SQLite 데이터베이스 초기화
- [ ] 기본 모델 생성

### 📌 Day 3-5: 핵심 서비스 구현

#### 2.1 FastAPI 앱 설정 ✅ 체크리스트

**main.py (심플한 설정):**
```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.database import init_db
from app.api.v1 import pdf, summary, quiz

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 시작 시 DB 초기화
    init_db()
    yield
    # 종료 시 정리 작업

app = FastAPI(
    title="학점마스터 API (실습용)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 설정 (프론트엔드 연동)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(pdf.router, prefix="/api/v1/pdf", tags=["PDF"])
app.include_router(summary.router, prefix="/api/v1/summary", tags=["Summary"])
app.include_router(quiz.router, prefix="/api/v1/quiz", tags=["Quiz"])

@app.get("/")
async def root():
    return {"message": "학점마스터 API (실습용)", "docs": "http://localhost:9090/docs"}
```

#### 2.2 메모리 캐싱 구현 ✅ 체크리스트

**simple_cache.py (Redis 대체):**
```python
# app/core/cache.py
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import json

class SimpleCache:
    """간단한 메모리 기반 캐시 (Redis 대체)"""

    def __init__(self):
        self.cache: Dict[str, Dict[str, Any]] = {}

    def set(self, key: str, value: Any, expire: int = 3600):
        """캐시 저장 (expire: 초 단위)"""
        self.cache[key] = {
            "value": value,
            "expire_at": datetime.now() + timedelta(seconds=expire)
        }

    def get(self, key: str) -> Optional[Any]:
        """캐시 조회"""
        if key in self.cache:
            item = self.cache[key]
            if datetime.now() < item["expire_at"]:
                return item["value"]
            else:
                del self.cache[key]  # 만료된 캐시 삭제
        return None

    def delete(self, key: str):
        """캐시 삭제"""
        if key in self.cache:
            del self.cache[key]

    def clear(self):
        """전체 캐시 삭제"""
        self.cache.clear()

# 싱글톤 인스턴스
cache = SimpleCache()
```

---

## 🎯 Phase 2: Streamlit 로직 마이그레이션 (Week 2)

### 📌 Day 6-8: PDF 처리 서비스

#### 3.1 PDF 업로드 및 처리 ✅ 체크리스트

**pdf.py (API 엔드포인트):**
```python
# app/api/v1/pdf.py
from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.pdf_service import PDFService
from app.models.models import Document
import shutil
import os

router = APIRouter()
pdf_service = PDFService()

@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    use_ocr: bool = Form(False),
    analyze_images: bool = Form(False),
    db: Session = Depends(get_db)
):
    """PDF 업로드 및 텍스트 추출"""

    # 1. 파일 저장
    file_path = f"data/uploads/{file.filename}"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # 2. 텍스트 추출
    content = await pdf_service.extract_text_from_pdf(file_path, use_ocr)

    # 3. 이미지 분석 (선택)
    image_analysis = None
    if analyze_images:
        image_analysis = await pdf_service.analyze_images(file_path)

    # 4. DB 저장
    doc = Document(
        filename=file.filename,
        content=content,
        ocr_used=use_ocr,
        image_analysis=image_analysis,
        file_path=file_path
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return {
        "document_id": doc.id,
        "filename": doc.filename,
        "text_length": len(content),
        "ocr_used": use_ocr,
        "message": "PDF 처리 완료"
    }

@router.get("/{document_id}")
async def get_document(document_id: str, db: Session = Depends(get_db)):
    """문서 조회"""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다")

    return {
        "document_id": doc.id,
        "filename": doc.filename,
        "content": doc.content[:1000],  # 처음 1000자만
        "content_length": len(doc.content),
        "created_at": doc.created_at
    }
```

#### 3.2 OpenAI 서비스 ✅ 체크리스트

**openai_service.py:**
```python
# app/services/openai_service.py
from openai import OpenAI
from app.core.config import settings
from app.core.cache import cache
import hashlib
import json

class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4o"

    async def completion(self, messages, temperature=0.2, max_tokens=2048, use_cache=True):
        """GPT-4o 호출 (캐싱 포함)"""

        # 캐시 키 생성
        cache_key = None
        if use_cache:
            content = json.dumps(messages, sort_keys=True)
            cache_key = f"openai:{hashlib.md5(content.encode()).hexdigest()}"

            # 캐시 확인
            cached = cache.get(cache_key)
            if cached:
                return cached

        # API 호출
        response = self.client.chat.completions.create(
            model=self.model,
            temperature=temperature,
            messages=messages,
            max_tokens=max_tokens
        )

        # 캐시 저장
        if use_cache and cache_key:
            cache.set(cache_key, response, expire=3600)  # 1시간 캐싱

        return response

# 싱글톤 인스턴스
openai_service = OpenAIService()
```

### 📌 Day 9-10: 요약 서비스

#### 4.1 요약 API 구현 ✅ 체크리스트

**summary.py (API):**
```python
# app/api/v1/summary.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.summary_service import SummaryService
from app.models.models import Document, Summary
from pydantic import BaseModel

router = APIRouter()
summary_service = SummaryService()

class SummaryRequest(BaseModel):
    document_id: str

@router.post("/generate")
async def generate_summary(
    request: SummaryRequest,
    db: Session = Depends(get_db)
):
    """문서 요약 생성"""

    # 문서 조회
    doc = db.query(Document).filter(Document.id == request.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다")

    # 캐시 확인
    existing_summary = db.query(Summary).filter(
        Summary.document_id == request.document_id
    ).first()

    if existing_summary:
        return {
            "summary_id": existing_summary.id,
            "content": existing_summary.content,
            "cached": True
        }

    # 요약 생성
    summary_content = await summary_service.summarize_long_text(doc.content)

    # DB 저장
    summary = Summary(
        document_id=request.document_id,
        content=summary_content
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)

    return {
        "summary_id": summary.id,
        "content": summary_content,
        "cached": False
    }
```

---

## 🎯 Phase 3: 문제 생성 및 채점 (Week 3)

### 📌 Day 11-13: 문제 생성

#### 5.1 Quiz API ✅ 체크리스트

**quiz.py (API):**
```python
# app/api/v1/quiz.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.quiz_service import QuizService
from app.models.models import Document, Quiz, QuizResult
from pydantic import BaseModel
from typing import Dict

router = APIRouter()
quiz_service = QuizService()

class QuizGenerateRequest(BaseModel):
    document_id: str
    num_items: int = 4

class QuizGradeRequest(BaseModel):
    quiz_id: str
    answers: Dict[int, any]  # {0: 선택지_인덱스, 1: "주관식 답변", ...}

@router.post("/generate")
async def generate_quiz(
    request: QuizGenerateRequest,
    db: Session = Depends(get_db)
):
    """문제 생성"""

    # 문서 조회
    doc = db.query(Document).filter(Document.id == request.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다")

    # 문제 생성
    quiz_data = await quiz_service.generate_quiz_from_doc(
        doc.content,
        request.num_items
    )

    # DB 저장
    quiz = Quiz(
        document_id=request.document_id,
        items=quiz_data
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    return {
        "quiz_id": quiz.id,
        "items": quiz_data["items"],
        "total_questions": len(quiz_data["items"])
    }

@router.post("/grade")
async def grade_quiz(
    request: QuizGradeRequest,
    db: Session = Depends(get_db)
):
    """채점 및 피드백"""

    # 퀴즈 조회
    quiz = db.query(Quiz).filter(Quiz.id == request.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="퀴즈를 찾을 수 없습니다")

    # 채점
    grading_result = quiz_service.grade_quiz(quiz.items, dict(request.answers))

    # 오답 피드백 생성
    feedbacks = {}
    for result in grading_result["results"]:
        if not result["is_correct"]:
            idx = result["index"]
            item = quiz.items["items"][idx]
            user_answer = request.answers.get(idx, "")

            feedback = await quiz_service.generate_feedback_for_wrong_answer(
                item, str(user_answer)
            )
            feedbacks[idx] = feedback

    # 결과 저장
    quiz_result = QuizResult(
        quiz_id=request.quiz_id,
        answers=dict(request.answers),
        results=grading_result,
        accuracy=grading_result["accuracy"]
    )
    db.add(quiz_result)
    db.commit()
    db.refresh(quiz_result)

    return {
        "result_id": quiz_result.id,
        "results": grading_result,
        "feedbacks": feedbacks
    }

@router.get("/{quiz_id}")
async def get_quiz(quiz_id: str, db: Session = Depends(get_db)):
    """퀴즈 조회 (문제만, 정답 제외)"""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="퀴즈를 찾을 수 없습니다")

    # 정답 정보 제거
    items_without_answers = []
    for item in quiz.items["items"]:
        clean_item = {
            "type": item["type"],
            "question": item["question"]
        }
        if item["type"] == "mcq":
            clean_item["options"] = item["options"]

        items_without_answers.append(clean_item)

    return {
        "quiz_id": quiz.id,
        "items": items_without_answers
    }
```

---

## 🎯 Phase 4: 테스트 및 완성 (Week 4)

### 📌 Day 14-15: 통합 테스트

#### 6.1 테스트 스크립트 ✅ 체크리스트

**test_api.py (간단한 테스트):**
```python
# tests/test_api.py
import httpx
import asyncio

async def test_workflow():
    """전체 워크플로우 테스트"""

    async with httpx.AsyncClient() as client:
        base_url = "http://localhost:9090/api/v1"

        # 1. PDF 업로드
        print("1. PDF 업로드...")
        with open("sample.pdf", "rb") as f:
            response = await client.post(
                f"{base_url}/pdf/upload",
                files={"file": f},
                data={"use_ocr": False, "analyze_images": False}
            )
        document_id = response.json()["document_id"]
        print(f"   문서 ID: {document_id}")

        # 2. 요약 생성
        print("2. 요약 생성...")
        response = await client.post(
            f"{base_url}/summary/generate",
            json={"document_id": document_id}
        )
        summary = response.json()["content"]
        print(f"   요약: {summary[:100]}...")

        # 3. 문제 생성
        print("3. 문제 생성...")
        response = await client.post(
            f"{base_url}/quiz/generate",
            json={"document_id": document_id, "num_items": 3}
        )
        quiz_id = response.json()["quiz_id"]
        print(f"   퀴즈 ID: {quiz_id}")

        # 4. 문제 풀이 및 채점
        print("4. 채점...")
        response = await client.post(
            f"{base_url}/quiz/grade",
            json={
                "quiz_id": quiz_id,
                "answers": {0: 1, 1: "샘플 답변", 2: 0}
            }
        )
        accuracy = response.json()["results"]["accuracy"]
        print(f"   정답률: {accuracy * 100:.1f}%")

if __name__ == "__main__":
    asyncio.run(test_workflow())
```

### 📌 Day 16-20: 문서화 및 최적화

#### 7.1 API 문서 ✅ 체크리스트

FastAPI 자동 문서:
- Swagger UI: http://localhost:9090/docs
- ReDoc: http://localhost:9090/redoc

#### 7.2 README.md 작성 ✅ 체크리스트

```markdown
# 학점마스터 Backend API (실습용)

## 빠른 시작

### 1. 설치
```bash
git clone [repository]
cd chatbot-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. 환경 설정
```bash
echo "OPENAI_API_KEY=your_key_here" > .env
```

### 3. 실행
```bash
python run.py
```

### 4. API 테스트
- API 문서: http://localhost:9090/docs
- 테스트: `python tests/test_api.py`

## 주요 기능
- PDF 업로드 및 텍스트 추출 (OCR 지원)
- 문서 요약 (5줄)
- 문제 생성 (3-5문항)
- 자동 채점 및 피드백

## 기술 스택
- FastAPI
- SQLite
- OpenAI GPT-4o
- PyMuPDF
```

---

## 🚀 실행 방법 (요약)

```bash
# 1. 프로젝트 클론 및 이동
git clone [repository]
cd chatbot-backend

# 2. 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. 패키지 설치
pip install -r requirements.txt

# 4. OpenAI API 키 설정
echo "OPENAI_API_KEY=sk-..." > .env

# 5. 서버 실행
python run.py

# 6. 브라우저에서 확인
# API 문서: http://localhost:9090/docs
# 프론트엔드 연동: http://localhost:8080
```

---

## 📊 로컬 환경 장점

### 개발 편의성
- **즉시 시작**: 복잡한 설정 없음
- **디버깅 용이**: 모든 로그 로컬에서 확인
- **빠른 수정**: 코드 수정 즉시 반영 (--reload)

### 학습 목적
- **단순한 구조**: 핵심 로직에 집중
- **쉬운 이해**: 복잡한 인프라 없음
- **빠른 피드백**: 즉시 결과 확인

### 비용 절감
- **무료 실행**: 클라우드 비용 없음
- **API 비용만**: OpenAI API 비용만 발생

---

## 🎯 체크리스트 (전체)

### Week 1: 기본 구현
- [ ] 프로젝트 설정
- [ ] SQLite 데이터베이스
- [ ] FastAPI 기본 구조
- [ ] 메모리 캐싱

### Week 2: Streamlit 마이그레이션
- [ ] PDF 처리 서비스
- [ ] OpenAI 통합
- [ ] 요약 서비스

### Week 3: 문제 생성
- [ ] 문제 생성 API
- [ ] 채점 시스템
- [ ] 오답 피드백

### Week 4: 완성
- [ ] 통합 테스트
- [ ] API 문서
- [ ] 최적화
- [ ] README 작성

---

## 🚨 주의사항

### OpenAI API 비용
- GPT-4o는 비용이 높음
- 캐싱을 적극 활용
- 개발 시 작은 문서로 테스트

### 로컬 저장소
- `data/uploads/` 폴더 권한 확인
- 디스크 공간 확인
- 주기적 정리 필요

### 성능 한계
- 동시 사용자 제한적
- 대용량 PDF 처리 시간
- 메모리 사용량 모니터링

---

**문서 버전**: 3.0.0
**작성일**: 2024-11-10
**마지막 업데이트**: 2024-11-10
**변경 사항**: 로컬 실습 환경 최적화, SQLite 사용, 단순화된 구조