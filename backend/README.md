# 학점마스터 API 백엔드 (실습용)

FastAPI 기반 학습 지원 API 서버

## 주요 기능

- PDF 업로드 및 텍스트 추출
- OCR 지원 (스캔본/이미지 PDF)
- 이미지/그래프 분석
- 문서 요약 (5줄 요약)
- 퀴즈 생성 (객관식/주관식)
- 자동 채점 및 피드백
- 오답 노트

## 기술 스택

- **Framework**: FastAPI 0.104.1
- **AI**: OpenAI GPT-4o
- **Database**: SQLite
- **Cache**: 메모리 기반 캐싱
- **PDF**: PyPDFLoader, PyMuPDF
- **OCR**: GPT-4o Vision API

## 설치 및 실행

### 1. 가상환경 생성

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 2. 패키지 설치

```bash
pip install -r requirements.txt
```

### 3. 환경 변수 설정

`.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일에 OpenAI API Key 입력:

```
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=sqlite:///./data/database.db
UPLOAD_DIR=./data/uploads
```

### 4. 서버 실행

```bash
python run.py
```

서버가 실행되면:
- API 서버: http://localhost:9090
- API 문서: http://localhost:9090/docs
- OpenAPI 스키마: http://localhost:9090/openapi.json

## API 엔드포인트

### PDF 업로드

```http
POST /api/v1/pdf/upload
Content-Type: multipart/form-data

- file: PDF 파일
- use_ocr: OCR 사용 여부 (boolean)
- analyze_images: 이미지 분석 여부 (boolean)
```

### 문서 요약

```http
POST /api/v1/summary/generate
Content-Type: application/json

{
  "document_id": "문서 ID"
}
```

### 퀴즈 생성

```http
POST /api/v1/quiz/generate
Content-Type: application/json

{
  "document_id": "문서 ID",
  "num_items": 4
}
```

### 퀴즈 제출 및 채점

```http
POST /api/v1/quiz/submit
Content-Type: application/json

{
  "quiz_id": "퀴즈 ID",
  "answers": [
    {"index": 0, "answer": 1},
    {"index": 1, "answer": "주관식 답안"}
  ]
}
```

## 프로젝트 구조

```
chatbot-backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── pdf.py          # PDF 업로드 API
│   │       ├── summary.py      # 요약 API
│   │       └── quiz.py         # 퀴즈 API
│   ├── core/
│   │   ├── config.py           # 설정
│   │   ├── database.py         # 데이터베이스 설정
│   │   └── cache.py            # 메모리 캐시
│   ├── models/
│   │   └── models.py           # SQLAlchemy 모델
│   ├── services/
│   │   ├── openai_service.py   # OpenAI API 서비스
│   │   ├── pdf_service.py      # PDF 처리 서비스
│   │   ├── summary_service.py  # 요약 서비스
│   │   └── quiz_service.py     # 퀴즈 서비스
│   └── main.py                 # FastAPI 앱
├── data/
│   ├── uploads/                # 업로드된 파일
│   └── database.db             # SQLite 데이터베이스
├── .env                        # 환경 변수
├── requirements.txt            # 패키지 목록
└── run.py                      # 실행 스크립트
```

## 개발 참고사항

- Streamlit 앱의 로직을 FastAPI로 이식
- GPT-4o 모델 사용 (OpenAI)
- 6000자 청킹 전략
- 5줄 요약 알고리즘
- 키워드 기반 자동 채점

## 라이선스

MIT License
