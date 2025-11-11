# Backend PRD (Product Requirements Document) - 학점마스터 API Server

## 1. 제품 개요

### 제품명
학점마스터 Backend API Server

### 제품 설명
PDF 학습 자료를 처리하여 요약, 문제 생성, 채점 및 학습 분석 기능을 제공하는 FastAPI 기반 백엔드 서비스

### 기술 스택
- **Framework**: FastAPI (Python)
- **Server Port**: localhost:9090
- **Frontend Integration**: localhost:8080 (Next.js)
- **AI Models**: OpenAI GPT-4o, Anthropic Claude 3
- **PDF Processing**: OCR 지원, 이미지/그래프 분석

## 2. 시스템 아키텍처

### 2.1 API 서버 구성
```
FastAPI Server (localhost:9090)
├── PDF Processing Module
│   ├── Text Extraction
│   ├── OCR Engine
│   └── Image/Graph Analysis
├── AI Integration Module
│   ├── LLM Service (GPT-4o/Claude)
│   └── Prompt Management
├── Question Generation Module
├── Grading Module
└── Analytics Module
```

### 2.2 데이터 플로우
1. Frontend (8080) → API Server (9090)
2. PDF Upload → Processing → AI Analysis
3. Content Generation → Response to Frontend
4. User Interaction Data → Analytics Storage

## 3. API 엔드포인트 명세

### 3.1 PDF 처리 API

#### POST /api/v1/pdf/upload
**설명**: PDF 파일 업로드 및 처리
```json
{
  "request": {
    "file": "multipart/form-data",
    "options": {
      "use_ocr": boolean,        // OCR 사용 여부 (스캔본/이미지 PDF)
      "analyze_images": boolean,  // 그림/그래프 분석 여부
      "extract_tables": boolean,  // 표 데이터 추출 여부
      "language": "ko"           // 문서 언어
    }
  },
  "response": {
    "document_id": "string",
    "status": "processing|completed|failed",
    "metadata": {
      "page_count": number,
      "has_images": boolean,
      "has_tables": boolean,
      "processing_time": number
    }
  }
}
```

#### GET /api/v1/pdf/status/{document_id}
**설명**: PDF 처리 상태 조회
```json
{
  "response": {
    "document_id": "string",
    "status": "processing|completed|failed",
    "progress": number,        // 0-100
    "estimated_time": number   // seconds
  }
}
```

### 3.2 요약 API

#### POST /api/v1/summary/generate
**설명**: 문서 요약 생성
```json
{
  "request": {
    "document_id": "string",
    "summary_type": "brief|detailed|chapter|topic",
    "options": {
      "include_keywords": boolean,
      "include_images": boolean,    // 이미지/그래프 설명 포함
      "max_length": number,
      "language": "ko"
    }
  },
  "response": {
    "summary_id": "string",
    "content": {
      "text": "string",
      "keywords": ["string"],
      "chapters": [{
        "title": "string",
        "summary": "string",
        "key_points": ["string"]
      }],
      "images": [{
        "description": "string",
        "relevance": "string",
        "page": number
      }]
    }
  }
}
```

#### GET /api/v1/summary/{summary_id}
**설명**: 저장된 요약 조회

### 3.3 문제 생성 API

#### POST /api/v1/questions/generate
**설명**: 예상 문제 생성
```json
{
  "request": {
    "document_id": "string",
    "summary_id": "string",
    "question_config": {
      "count": number,           // 문제 개수
      "difficulty": "easy|medium|hard|mixed",
      "types": ["short_answer", "essay", "calculation"],
      "focus_areas": ["string"], // 특정 주제/챕터
      "include_image_based": boolean  // 이미지 기반 문제 포함
    }
  },
  "response": {
    "question_set_id": "string",
    "questions": [{
      "question_id": "string",
      "type": "string",
      "difficulty": "string",
      "content": "string",
      "points": number,
      "expected_answer": "string",
      "grading_criteria": ["string"],
      "related_images": ["string"]  // 관련 이미지/그래프 ID
    }],
    "total_points": number
  }
}
```

#### GET /api/v1/questions/bank
**설명**: 생성된 문제 은행 조회
```json
{
  "request": {
    "filters": {
      "document_id": "string",
      "difficulty": "string",
      "type": "string",
      "date_from": "datetime",
      "date_to": "datetime"
    },
    "pagination": {
      "page": number,
      "size": number
    }
  }
}
```

### 3.4 시험 및 채점 API

#### POST /api/v1/exam/create
**설명**: 시험 세션 생성
```json
{
  "request": {
    "question_set_id": "string",
    "time_limit": number,        // minutes
    "student_id": "string"
  },
  "response": {
    "exam_id": "string",
    "start_time": "datetime",
    "end_time": "datetime"
  }
}
```

#### POST /api/v1/exam/submit
**설명**: 답안 제출 및 채점
```json
{
  "request": {
    "exam_id": "string",
    "answers": [{
      "question_id": "string",
      "answer": "string",
      "time_spent": number      // seconds
    }]
  },
  "response": {
    "result_id": "string",
    "total_score": number,
    "max_score": number,
    "percentage": number,
    "graded_answers": [{
      "question_id": "string",
      "score": number,
      "max_score": number,
      "feedback": "string",
      "correct_answer": "string",
      "key_points_missed": ["string"]
    }]
  }
}
```

### 3.5 오답노트 API

#### GET /api/v1/wrong-answers
**설명**: 오답 목록 조회 (Frontend: /wrong-answers 페이지용)
```json
{
  "request": {
    "student_id": "string",
    "filters": {
      "document_id": "string",
      "date_from": "datetime",
      "date_to": "datetime",
      "difficulty": "string"
    }
  },
  "response": {
    "wrong_answers": [{
      "question_id": "string",
      "question_content": "string",
      "student_answer": "string",
      "correct_answer": "string",
      "explanation": "string",
      "related_concepts": ["string"],
      "review_materials": [{
        "type": "text|image|link",
        "content": "string"
      }],
      "attempted_count": number,
      "last_attempted": "datetime"
    }],
    "weakness_analysis": {
      "weak_topics": [{
        "topic": "string",
        "error_rate": number,
        "suggested_focus": "string"
      }]
    }
  }
}
```

#### POST /api/v1/wrong-answers/review
**설명**: 오답 복습 완료 기록
```json
{
  "request": {
    "question_id": "string",
    "student_id": "string",
    "review_status": "understood|needs_more_practice",
    "notes": "string"
  }
}
```

### 3.6 학습 분석 API

#### GET /api/v1/analytics
**설명**: 학습 분석 데이터 조회 (Frontend: /analytics 페이지용)
```json
{
  "response": {
    "student_id": "string",
    "overall_stats": {
      "total_documents": number,
      "total_questions_attempted": number,
      "average_score": number,
      "study_time": number,      // minutes
      "improvement_rate": number  // percentage
    },
    "performance_trend": [{
      "date": "date",
      "score": number,
      "questions_attempted": number
    }],
    "subject_performance": [{
      "subject": "string",
      "document_count": number,
      "average_score": number,
      "weak_areas": ["string"],
      "strong_areas": ["string"]
    }],
    "learning_patterns": {
      "best_time_of_day": "string",
      "average_session_length": number,
      "preferred_question_types": ["string"],
      "consistency_score": number
    },
    "recommendations": [{
      "type": "focus_area|study_method|timing",
      "message": "string",
      "priority": "high|medium|low"
    }]
  }
}
```

#### POST /api/v1/analytics/session
**설명**: 학습 세션 기록
```json
{
  "request": {
    "student_id": "string",
    "session_type": "study|practice|exam",
    "duration": number,
    "activities": [{
      "type": "pdf_read|question_practice|review",
      "document_id": "string",
      "time_spent": number
    }]
  }
}
```

## 4. 핵심 기능 상세

### 4.1 PDF 처리 엔진

#### OCR 기능
- **목적**: 스캔된 PDF나 이미지 기반 PDF의 텍스트 추출
- **기술**: Tesseract OCR, Google Vision API, or AWS Textract
- **처리 플로우**:
  1. PDF 페이지별 이미지 변환
  2. OCR 엔진으로 텍스트 추출
  3. 텍스트 정확도 검증
  4. 후처리 (오타 수정, 포맷팅)

#### 이미지/그래프 분석
- **목적**: 도표, 그래프, 다이어그램의 의미 분석
- **기술**: Computer Vision API + GPT-4 Vision
- **처리 플로우**:
  1. 이미지 영역 감지 및 추출
  2. 이미지 타입 분류 (그래프, 도표, 다이어그램)
  3. Vision AI로 내용 분석
  4. 텍스트 설명 생성

### 4.2 AI 통합 모듈

#### LLM 서비스 관리
- **다중 모델 지원**: GPT-4o, Claude 3 병렬 사용
- **프롬프트 최적화**: 각 작업별 최적화된 프롬프트 템플릿
- **응답 캐싱**: 동일 요청에 대한 캐시 처리
- **에러 핸들링**: Rate limiting, timeout 처리

#### 프롬프트 템플릿
```python
SUMMARY_PROMPT = """
문서 내용: {document_content}
이미지 설명: {image_descriptions}

위 내용을 바탕으로 다음 요구사항에 맞게 요약해주세요:
1. 핵심 개념 추출
2. 중요도 순서로 정리
3. 이미지/그래프가 설명하는 핵심 내용 포함
4. 시험에 나올 가능성이 높은 부분 강조
"""

QUESTION_GENERATION_PROMPT = """
요약 내용: {summary}
난이도: {difficulty}
문제 유형: {question_type}

위 내용을 바탕으로 {count}개의 문제를 생성하세요.
각 문제는 다음을 포함해야 합니다:
1. 명확한 질문
2. 예상 답안
3. 채점 기준
4. 배점
"""
```

### 4.3 데이터 모델

#### Document Schema
```python
class Document(BaseModel):
    id: str
    user_id: str
    filename: str
    upload_date: datetime
    page_count: int
    content: str
    images: List[Image]
    tables: List[Table]
    metadata: Dict
    processing_status: str
    ocr_used: bool
```

#### Question Schema
```python
class Question(BaseModel):
    id: str
    document_id: str
    type: str
    difficulty: str
    content: str
    expected_answer: str
    grading_criteria: List[str]
    points: int
    related_images: List[str]
    created_date: datetime
```

#### Analytics Schema
```python
class UserAnalytics(BaseModel):
    user_id: str
    total_study_time: int
    documents_processed: int
    questions_attempted: int
    average_score: float
    weak_topics: List[Topic]
    performance_trend: List[PerformancePoint]
    last_updated: datetime
```

## 5. 기술 요구사항

### 5.1 백엔드 스택
- **Framework**: FastAPI 0.100+
- **Python**: 3.11+
- **Database**: PostgreSQL (주 데이터베이스)
- **Cache**: Redis (세션 및 캐시)
- **Queue**: Celery + RabbitMQ (비동기 작업)

### 5.2 AI/ML 라이브러리
- **LLM Integration**:
  - OpenAI Python SDK
  - Anthropic Python SDK
- **PDF Processing**:
  - PyPDF2 / pdfplumber
  - Tesseract (OCR)
  - pdf2image
- **Image Analysis**:
  - Pillow
  - OpenCV
  - matplotlib (그래프 분석용)

### 5.3 보안 요구사항
- **인증**: JWT 토큰 기반 인증
- **API Rate Limiting**: 사용자별 요청 제한
- **파일 검증**: 업로드 파일 크기 및 형식 검증
- **데이터 암호화**: 민감 데이터 암호화 저장

## 6. 성능 요구사항

### 응답 시간 목표
- PDF 업로드 (< 50MB): < 5초
- OCR 처리 (10페이지): < 30초
- 요약 생성: < 10초
- 문제 생성 (10문제): < 15초
- 채점: < 5초

### 확장성
- 동시 사용자: 100명
- 일일 처리 문서: 1,000개
- 평균 응답 시간: < 2초

## 7. API 에러 처리

### 에러 코드 체계
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {},
    "timestamp": "ISO 8601"
  }
}
```

### 주요 에러 코드
- `PDF_PROCESSING_ERROR`: PDF 처리 실패
- `OCR_FAILED`: OCR 처리 실패
- `AI_SERVICE_ERROR`: AI 서비스 오류
- `RATE_LIMIT_EXCEEDED`: 요청 제한 초과
- `INVALID_FILE_FORMAT`: 잘못된 파일 형식

## 8. 개발 로드맵

### Phase 1 (MVP) - 2주
- FastAPI 프로젝트 설정
- PDF 업로드 및 기본 텍스트 추출
- 기본 요약 API
- 간단한 문제 생성 (GPT-4o 통합)

### Phase 2 - 2주
- OCR 기능 구현
- 이미지/그래프 분석 통합
- 채점 시스템 구현
- 오답노트 기능

### Phase 3 - 2주
- 학습 분석 시스템
- 성능 최적화
- 캐싱 시스템 구현
- 보안 강화

### Phase 4 - 2주
- 테스트 및 디버깅
- 문서화
- 배포 준비
- 모니터링 시스템 구축

## 9. 모니터링 및 로깅

### 모니터링 지표
- API 응답 시간
- 에러율
- PDF 처리 성공률
- AI 서비스 가용성
- 시스템 리소스 사용률

### 로깅 전략
- 모든 API 요청/응답 로깅
- 에러 상세 로깅
- PDF 처리 단계별 로깅
- AI 서비스 호출 로깅

## 10. 테스트 전략

### 단위 테스트
- 각 API 엔드포인트 테스트
- PDF 처리 모듈 테스트
- AI 통합 모듈 테스트

### 통합 테스트
- End-to-end 시나리오 테스트
- 부하 테스트
- 보안 테스트

### 테스트 데이터
- 다양한 형식의 PDF 샘플
- OCR 테스트용 스캔 문서
- 이미지/그래프 포함 문서

## 11. 문서화

### API 문서
- OpenAPI (Swagger) 스펙
- 인터랙티브 API 문서
- 사용 예제 코드

### 개발 문서
- 설치 및 설정 가이드
- 아키텍처 문서
- 트러블슈팅 가이드

## 12. 배포 전략

### 개발 환경
- Local development: localhost:9090
- Docker 컨테이너화

### 스테이징 환경
- 클라우드 서비스 (AWS/GCP)
- CI/CD 파이프라인

### 프로덕션 환경
- 로드 밸런싱
- Auto-scaling
- 백업 및 복구 전략

## 13. 예상 리스크 및 대응 방안

### 기술적 리스크
| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| OCR 정확도 문제 | 높음 | 다중 OCR 엔진 사용, 후처리 강화 |
| AI 서비스 비용 | 중간 | 캐싱 전략, 요청 최적화 |
| 대용량 PDF 처리 | 높음 | 청크 단위 처리, 비동기 처리 |
| AI 응답 지연 | 중간 | 타임아웃 설정, 폴백 전략 |

### 보안 리스크
| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| 민감 정보 노출 | 높음 | 데이터 암호화, 접근 제어 |
| DDoS 공격 | 중간 | Rate limiting, WAF |
| 파일 업로드 취약점 | 높음 | 파일 검증, 샌드박스 처리 |

## 14. 성공 지표

### 기술적 성공 지표
- API 가용성: 99.9% 이상
- 평균 응답 시간: 2초 이내
- PDF 처리 성공률: 95% 이상
- OCR 정확도: 90% 이상

### 비즈니스 성공 지표
- 일일 활성 사용자: 100명 이상
- 평균 문서 처리량: 10개/사용자
- 문제 생성 만족도: 4.0/5.0 이상
- 채점 정확도: 85% 이상

## 15. 부록

### A. API 응답 예제
[상세 응답 예제는 각 엔드포인트 섹션 참조]

### B. 데이터베이스 스키마
[별도 문서로 관리]

### C. 외부 서비스 의존성
- OpenAI API
- Anthropic Claude API
- 클라우드 스토리지 (S3/GCS)
- OCR 서비스 (선택적)

### D. 용어 정의
- **Document**: 업로드된 PDF 파일의 처리된 형태
- **Question Set**: 생성된 문제 모음
- **Exam Session**: 시험 응시 세션
- **Analytics**: 학습 분석 데이터

---

**문서 버전**: 1.0.0
**작성일**: 2024-11-10
**작성자**: 학점마스터 백엔드 팀
**다음 검토일**: 2024-11-17