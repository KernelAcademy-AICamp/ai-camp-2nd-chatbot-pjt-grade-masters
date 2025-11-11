# 학점마스터 API 문서

## 기본 정보

- **Base URL**: `http://localhost:9090`
- **API Prefix**: `/api/v1`
- **Content-Type**: `application/json`
- **CORS**: localhost:8080 허용

## 인증

현재 버전은 인증이 필요하지 않습니다 (로컬 개발 환경).

---

## 📄 PDF 관리 API

### 1. PDF 업로드

PDF 파일을 업로드하고 텍스트를 추출합니다.

**Endpoint**: `POST /api/v1/pdf/upload`

**Request**:
```http
POST /api/v1/pdf/upload
Content-Type: multipart/form-data

file: [PDF 파일]
```

**Response** (200 OK):
```json
{
  "document_id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "lecture_notes.pdf",
  "content_length": 15234,
  "page_count": 10,
  "message": "PDF 업로드 및 텍스트 추출 완료"
}
```

**Error Responses**:
- `400 Bad Request`: PDF 파일이 아니거나 텍스트 추출 실패
- `500 Internal Server Error`: 서버 오류

**예제 (JavaScript)**:
```javascript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch('http://localhost:9090/api/v1/pdf/upload', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log('Document ID:', data.document_id);
```

---

### 2. 문서 목록 조회

업로드된 모든 문서의 목록을 조회합니다.

**Endpoint**: `GET /api/v1/pdf/documents`

**Request**:
```http
GET /api/v1/pdf/documents
```

**Response** (200 OK):
```json
{
  "documents": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "filename": "lecture_notes.pdf",
      "content_length": 15234,
      "page_count": 10,
      "created_at": "2025-01-10T12:34:56.789Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "filename": "textbook.pdf",
      "content_length": 45678,
      "page_count": 25,
      "created_at": "2025-01-09T10:20:30.456Z"
    }
  ],
  "total": 2,
  "message": "문서 목록 조회 완료"
}
```

**예제 (JavaScript)**:
```javascript
const response = await fetch('http://localhost:9090/api/v1/pdf/documents');
const data = await response.json();

data.documents.forEach(doc => {
  console.log(`${doc.filename} (${doc.page_count} pages)`);
});
```

---

## 📝 요약 생성 API

### 3. 문서 요약 생성

업로드된 문서의 요약을 생성합니다 (3~10줄).

**Endpoint**: `POST /api/v1/summary/generate`

**Request**:
```http
POST /api/v1/summary/generate
Content-Type: application/json

{
  "document_id": "550e8400-e29b-41d4-a716-446655440000",
  "num_lines": 5
}
```

**Parameters**:
- `document_id` (string, required): 문서 ID
- `num_lines` (integer, optional): 요약 줄 수 (3~10, 기본값: 5)

**Response** (200 OK):
```json
{
  "summary_id": "770e8400-e29b-41d4-a716-446655440002",
  "document_id": "550e8400-e29b-41d4-a716-446655440000",
  "summary_text": "- Python은 간결하고 읽기 쉬운 프로그래밍 언어입니다.\n- 변수는 데이터를 저장하는 공간이며, 타입을 명시하지 않아도 됩니다.\n- 함수는 def 키워드로 정의하며, 코드 재사용을 가능하게 합니다.\n- 리스트, 튜플, 딕셔너리 등 다양한 자료구조를 제공합니다.\n- 들여쓰기로 코드 블록을 구분하는 것이 Python의 특징입니다.",
  "num_lines": 5,
  "message": "요약 생성 완료"
}
```

**Error Responses**:
- `404 Not Found`: 문서를 찾을 수 없음
- `400 Bad Request`: 문서에 텍스트 내용이 없음
- `500 Internal Server Error`: 요약 생성 중 오류

**예제 (JavaScript)**:
```javascript
const response = await fetch('http://localhost:9090/api/v1/summary/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    document_id: '550e8400-e29b-41d4-a716-446655440000',
    num_lines: 5
  })
});

const data = await response.json();
console.log('Summary:', data.summary_text);
```

---

## 🎯 퀴즈 API

### 4. 퀴즈 생성

문서 기반으로 퀴즈를 생성합니다 (객관식 + 주관식).

**Endpoint**: `POST /api/v1/quiz/generate`

**Request**:
```http
POST /api/v1/quiz/generate
Content-Type: application/json

{
  "document_id": "550e8400-e29b-41d4-a716-446655440000",
  "num_items": 4
}
```

**Parameters**:
- `document_id` (string, required): 문서 ID
- `num_items` (integer, optional): 문항 수 (3~5, 기본값: 4)

**Response** (200 OK):
```json
{
  "quiz_id": "880e8400-e29b-41d4-a716-446655440003",
  "document_id": "550e8400-e29b-41d4-a716-446655440000",
  "num_items": 4,
  "items": [
    {
      "type": "mcq",
      "question": "Python에서 변수를 선언할 때 반드시 타입을 명시해야 하는가?",
      "options": ["예, 반드시 명시해야 합니다", "아니오, 타입을 추론합니다", "경우에 따라 다릅니다", "타입이 없습니다"],
      "answer_index": 1,
      "explanation": "Python은 동적 타이핑 언어로, 변수 선언 시 타입을 명시하지 않아도 자동으로 타입을 추론합니다."
    },
    {
      "type": "short",
      "question": "Python에서 함수를 정의하는 키워드는 무엇인가요?",
      "answer": "def 키워드를 사용하여 함수를 정의합니다.",
      "rubric_keywords": ["def", "키워드", "함수"],
      "explanation": "Python에서는 def 키워드를 사용하여 함수를 정의하며, 함수명과 매개변수를 지정합니다."
    }
  ],
  "message": "퀴즈 생성 완료"
}
```

**문항 타입**:
- `mcq` (객관식): `options`, `answer_index` 포함
- `short` (주관식): `answer`, `rubric_keywords` 포함

**Error Responses**:
- `404 Not Found`: 문서를 찾을 수 없음
- `400 Bad Request`: 문서에 텍스트 내용이 없음
- `500 Internal Server Error`: 퀴즈 생성 중 오류

**예제 (JavaScript)**:
```javascript
const response = await fetch('http://localhost:9090/api/v1/quiz/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    document_id: '550e8400-e29b-41d4-a716-446655440000',
    num_items: 4
  })
});

const data = await response.json();
console.log('Quiz ID:', data.quiz_id);
console.log('Questions:', data.items);
```

---

### 5. 퀴즈 채점

사용자의 답안을 채점하고 피드백을 제공합니다.

**Endpoint**: `POST /api/v1/quiz/grade`

**Request**:
```http
POST /api/v1/quiz/grade
Content-Type: application/json

{
  "quiz_id": "880e8400-e29b-41d4-a716-446655440003",
  "user_answers": [
    {
      "index": 0,
      "answer": 1
    },
    {
      "index": 1,
      "answer": "def 키워드를 사용합니다"
    }
  ]
}
```

**Parameters**:
- `quiz_id` (string, required): 퀴즈 ID
- `user_answers` (array, required): 사용자 답안 목록
  - `index` (integer): 문항 번호 (0부터 시작)
  - `answer` (integer | string): 답안 (객관식: 인덱스, 주관식: 텍스트)

**Response** (200 OK):
```json
{
  "result_id": "990e8400-e29b-41d4-a716-446655440004",
  "quiz_id": "880e8400-e29b-41d4-a716-446655440003",
  "accuracy": 0.75,
  "results": [
    {
      "index": 0,
      "type": "mcq",
      "question": "Python에서 변수를 선언할 때 반드시 타입을 명시해야 하는가?",
      "user_answer": 1,
      "correct_answer": 1,
      "is_correct": true,
      "score": 1.0,
      "feedback": "Python은 동적 타이핑 언어로, 변수 선언 시 타입을 명시하지 않아도 자동으로 타입을 추론합니다."
    },
    {
      "index": 1,
      "type": "short",
      "question": "Python에서 함수를 정의하는 키워드는 무엇인가요?",
      "user_answer": "def 키워드를 사용합니다",
      "correct_answer": "def 키워드를 사용하여 함수를 정의합니다.",
      "is_correct": true,
      "score": 0.67,
      "rubric_hit": 2,
      "rubric_total": 3,
      "feedback": "부분 정답입니다. 주요 키워드 2/3개 포함. 누락된 키워드를 추가하세요."
    }
  ],
  "message": "채점 완료"
}
```

**채점 기준**:
- **객관식**: 정답 일치 여부 (1.0 또는 0.0)
- **주관식**: 키워드 매칭 비율 (0.0~1.0)
  - 키워드 50% 이상 포함 시 `is_correct: true`

**Error Responses**:
- `404 Not Found`: 퀴즈를 찾을 수 없음
- `500 Internal Server Error`: 채점 중 오류

**예제 (JavaScript)**:
```javascript
const response = await fetch('http://localhost:9090/api/v1/quiz/grade', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    quiz_id: '880e8400-e29b-41d4-a716-446655440003',
    user_answers: [
      { index: 0, answer: 1 },
      { index: 1, answer: 'def 키워드를 사용합니다' }
    ]
  })
});

const data = await response.json();
console.log('Accuracy:', (data.accuracy * 100).toFixed(1) + '%');
console.log('Results:', data.results);
```

---

### 6. 퀴즈 조회

특정 퀴즈의 정보를 조회합니다.

**Endpoint**: `GET /api/v1/quiz/{quiz_id}`

**Request**:
```http
GET /api/v1/quiz/880e8400-e29b-41d4-a716-446655440003
```

**Response** (200 OK):
```json
{
  "quiz_id": "880e8400-e29b-41d4-a716-446655440003",
  "document_id": "550e8400-e29b-41d4-a716-446655440000",
  "num_items": 4,
  "items": [ /* 문항 배열 */ ],
  "created_at": "2025-01-10T13:45:00.123Z",
  "message": "퀴즈 조회 완료"
}
```

**Error Responses**:
- `404 Not Found`: 퀴즈를 찾을 수 없음

---

### 7. 채점 결과 조회

특정 채점 결과의 상세 정보를 조회합니다.

**Endpoint**: `GET /api/v1/quiz/results/{result_id}`

**Request**:
```http
GET /api/v1/quiz/results/990e8400-e29b-41d4-a716-446655440004
```

**Response** (200 OK):
```json
{
  "result_id": "990e8400-e29b-41d4-a716-446655440004",
  "quiz_id": "880e8400-e29b-41d4-a716-446655440003",
  "accuracy": 0.75,
  "results": [ /* 채점 결과 배열 */ ],
  "created_at": "2025-01-10T14:00:00.456Z",
  "message": "채점 결과 조회 완료"
}
```

**Error Responses**:
- `404 Not Found`: 채점 결과를 찾을 수 없음

---

### 8. 문서별 퀴즈 목록

특정 문서에 대한 모든 퀴즈 목록을 조회합니다.

**Endpoint**: `GET /api/v1/quiz/document/{document_id}/quizzes`

**Request**:
```http
GET /api/v1/quiz/document/550e8400-e29b-41d4-a716-446655440000/quizzes
```

**Response** (200 OK):
```json
{
  "document_id": "550e8400-e29b-41d4-a716-446655440000",
  "quizzes": [
    {
      "quiz_id": "880e8400-e29b-41d4-a716-446655440003",
      "num_items": 4,
      "created_at": "2025-01-10T13:45:00.123Z"
    },
    {
      "quiz_id": "881e8400-e29b-41d4-a716-446655440005",
      "num_items": 3,
      "created_at": "2025-01-10T15:30:00.789Z"
    }
  ],
  "total": 2,
  "message": "문서별 퀴즈 목록 조회 완료"
}
```

**Error Responses**:
- `404 Not Found`: 문서를 찾을 수 없음

---

## 💬 문서 Q&A API

### 9. 질문하기

업로드된 문서에 대해 질문하고 답변을 받습니다.

**Endpoint**: `POST /api/v1/qa/ask`

**Request**:
```http
POST /api/v1/qa/ask
Content-Type: application/json

{
  "document_id": "550e8400-e29b-41d4-a716-446655440000",
  "question": "Python에서 변수란 무엇인가요?"
}
```

**Parameters**:
- `document_id` (string, required): 문서 ID
- `question` (string, required): 질문

**Response** (200 OK):
```json
{
  "document_id": "550e8400-e29b-41d4-a716-446655440000",
  "question": "Python에서 변수란 무엇인가요?",
  "answer": "변수는 값을 저장하는 공간입니다. Python에서는 변수를 선언할 때 타입을 명시하지 않아도 되며, 동적으로 타입이 결정됩니다. 예를 들어 x = 10과 같이 값을 할당하면 변수 x가 생성됩니다.",
  "context_used": "# Python 기초\n\n## 변수\n변수는 값을 저장하는 공간입니다...",
  "message": "답변 생성 완료"
}
```

**특징**:
- **Mini-RAG**: 키워드 기반 청크 검색으로 관련 컨텍스트 추출
- **문서 근거 기반**: 문서에 근거가 없으면 "문서 근거로는 알 수 없습니다" 응답
- **컨텍스트 반환**: 답변에 사용된 문서 부분 반환 (최대 500자)

**Error Responses**:
- `404 Not Found`: 문서를 찾을 수 없음
- `400 Bad Request`: 문서에 텍스트 내용이 없음
- `500 Internal Server Error`: 답변 생성 중 오류

**예제 (JavaScript)**:
```javascript
const response = await fetch('http://localhost:9090/api/v1/qa/ask', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    document_id: '550e8400-e29b-41d4-a716-446655440000',
    question: 'Python에서 변수란 무엇인가요?'
  })
});

const data = await response.json();
console.log('Answer:', data.answer);
console.log('Context:', data.context_used);
```

---

## 📊 학습 분석 API

### 10. 학습 개요

전체 학습 통계를 조회합니다.

**Endpoint**: `GET /api/v1/analytics/overview`

**Request**:
```http
GET /api/v1/analytics/overview?days=30
```

**Query Parameters**:
- `days` (integer, optional): 조회 기간 (일), 1~365 (기본값: 30)

**Response** (200 OK):
```json
{
  "period_days": 30,
  "total_documents": 15,
  "total_quizzes": 45,
  "total_quiz_attempts": 120,
  "average_accuracy": 78.5,
  "total_wrong_answers": 87,
  "recent_documents": 5,
  "recent_quiz_attempts": 30,
  "message": "학습 분석 개요 조회 완료"
}
```

**필드 설명**:
- `period_days`: 조회한 기간 (일)
- `total_documents`: 총 업로드 문서 수
- `total_quizzes`: 총 생성된 퀴즈 수
- `total_quiz_attempts`: 총 퀴즈 시도 횟수
- `average_accuracy`: 평균 정확도 (%)
- `total_wrong_answers`: 총 오답 수
- `recent_documents`: 최근 기간 내 업로드 문서 수
- `recent_quiz_attempts`: 최근 기간 내 퀴즈 시도 횟수

**예제 (JavaScript)**:
```javascript
const response = await fetch('http://localhost:9090/api/v1/analytics/overview?days=7');
const data = await response.json();

console.log(`평균 정확도: ${data.average_accuracy}%`);
console.log(`최근 7일간 퀴즈 시도: ${data.recent_quiz_attempts}회`);
```

---

### 11. 학습 진행 상황

최근 퀴즈 결과 및 정확도 추이를 조회합니다.

**Endpoint**: `GET /api/v1/analytics/progress`

**Request**:
```http
GET /api/v1/analytics/progress?limit=10
```

**Query Parameters**:
- `limit` (integer, optional): 조회할 최근 결과 수, 1~100 (기본값: 10)

**Response** (200 OK):
```json
{
  "recent_results": [
    {
      "result_id": "990e8400-e29b-41d4-a716-446655440004",
      "quiz_id": "880e8400-e29b-41d4-a716-446655440003",
      "document_name": "lecture_notes.pdf",
      "accuracy": 85.0,
      "created_at": "2025-01-10T14:00:00.456Z"
    },
    {
      "result_id": "991e8400-e29b-41d4-a716-446655440006",
      "quiz_id": "881e8400-e29b-41d4-a716-446655440005",
      "document_name": "textbook.pdf",
      "accuracy": 72.5,
      "created_at": "2025-01-09T16:30:00.789Z"
    }
  ],
  "average_accuracy": 78.8,
  "trend": "improving",
  "total_count": 2,
  "message": "학습 진행 상황 조회 완료"
}
```

**필드 설명**:
- `recent_results`: 최근 퀴즈 결과 목록 (최신순)
- `average_accuracy`: 조회된 결과의 평균 정확도 (%)
- `trend`: 추이 ("improving", "stable", "no_data")
- `total_count`: 조회된 결과 수

**예제 (JavaScript)**:
```javascript
const response = await fetch('http://localhost:9090/api/v1/analytics/progress?limit=5');
const data = await response.json();

console.log(`평균 정확도: ${data.average_accuracy}%`);
console.log(`추이: ${data.trend}`);
data.recent_results.forEach(result => {
  console.log(`${result.document_name}: ${result.accuracy}%`);
});
```

---

### 12. 취약 주제 분석

정확도가 낮은 문서/주제를 식별합니다.

**Endpoint**: `GET /api/v1/analytics/weak-topics`

**Request**:
```http
GET /api/v1/analytics/weak-topics?min_attempts=2
```

**Query Parameters**:
- `min_attempts` (integer, optional): 최소 시도 횟수 (기본값: 2)

**Response** (200 OK):
```json
{
  "weak_topics": [
    {
      "document_id": "550e8400-e29b-41d4-a716-446655440000",
      "document_name": "advanced_algorithms.pdf",
      "attempt_count": 5,
      "average_accuracy": 55.0,
      "recommendation": "추가 학습 권장"
    },
    {
      "document_id": "551e8400-e29b-41d4-a716-446655440001",
      "document_name": "data_structures.pdf",
      "attempt_count": 3,
      "average_accuracy": 68.0,
      "recommendation": "복습 권장"
    }
  ],
  "total_count": 2,
  "message": "취약 주제 분석 완료"
}
```

**추천 기준**:
- 평균 정확도 < 70%: "추가 학습 권장"
- 평균 정확도 >= 70%: "복습 권장"

**예제 (JavaScript)**:
```javascript
const response = await fetch('http://localhost:9090/api/v1/analytics/weak-topics');
const data = await response.json();

data.weak_topics.forEach(topic => {
  console.log(`${topic.document_name}: ${topic.average_accuracy}% (${topic.recommendation})`);
});
```

---

### 13. 오답 분석

최근 오답 목록 및 패턴을 분석합니다.

**Endpoint**: `GET /api/v1/analytics/wrong-answer-analysis`

**Request**:
```http
GET /api/v1/analytics/wrong-answer-analysis?limit=20
```

**Query Parameters**:
- `limit` (integer, optional): 조회할 오답 수, 1~100 (기본값: 20)

**Response** (200 OK):
```json
{
  "wrong_answers": [
    {
      "wrong_answer_id": "aa0e8400-e29b-41d4-a716-446655440007",
      "document_name": "lecture_notes.pdf",
      "question": "Python에서 변수를 선언할 때 반드시 타입을 명시해야 하는가?",
      "user_answer": "예, 반드시 명시해야 합니다",
      "correct_answer": "아니오, 타입을 추론합니다",
      "explanation": "Python은 동적 타이핑 언어로...",
      "created_at": "2025-01-10T14:00:00.456Z"
    }
  ],
  "pattern_analysis": {
    "total_wrong_answers": 1,
    "recent_mistakes": [ /* 최근 5개 오답 */ ],
    "recommendation": "오답 노트를 복습하여 취약점을 보완하세요."
  },
  "total_count": 1,
  "message": "오답 분석 완료"
}
```

**예제 (JavaScript)**:
```javascript
const response = await fetch('http://localhost:9090/api/v1/analytics/wrong-answer-analysis?limit=10');
const data = await response.json();

console.log('총 오답 수:', data.pattern_analysis.total_wrong_answers);
data.wrong_answers.forEach(wa => {
  console.log(`문제: ${wa.question}`);
  console.log(`내 답: ${wa.user_answer}`);
  console.log(`정답: ${wa.correct_answer}`);
});
```

---

### 14. 학습 시간 분석

일별 학습 활동 통계를 조회합니다.

**Endpoint**: `GET /api/v1/analytics/study-time`

**Request**:
```http
GET /api/v1/analytics/study-time?days=7
```

**Query Parameters**:
- `days` (integer, optional): 조회 기간 (일), 1~30 (기본값: 7)

**Response** (200 OK):
```json
{
  "period_days": 7,
  "daily_stats": [
    {
      "date": "2025-01-10",
      "quiz_attempts": 5,
      "average_accuracy": 82.0
    },
    {
      "date": "2025-01-09",
      "quiz_attempts": 3,
      "average_accuracy": 75.0
    },
    {
      "date": "2025-01-08",
      "quiz_attempts": 2,
      "average_accuracy": 70.0
    }
  ],
  "total_quiz_attempts": 10,
  "active_days": 3,
  "average_daily_attempts": 1.4,
  "message": "학습 시간 분석 완료"
}
```

**필드 설명**:
- `daily_stats`: 일별 통계 (최신순)
- `total_quiz_attempts`: 기간 내 총 퀴즈 시도 횟수
- `active_days`: 활동한 일수
- `average_daily_attempts`: 일평균 퀴즈 시도 횟수

**예제 (JavaScript)**:
```javascript
const response = await fetch('http://localhost:9090/api/v1/analytics/study-time?days=14');
const data = await response.json();

console.log(`활동 일수: ${data.active_days}/${data.period_days}일`);
console.log(`일평균 퀴즈: ${data.average_daily_attempts.toFixed(1)}회`);

data.daily_stats.forEach(stat => {
  console.log(`${stat.date}: ${stat.quiz_attempts}회 (${stat.average_accuracy}%)`);
});
```

---

## 🏥 헬스체크 API

### 15. 루트 엔드포인트

API 기본 정보를 반환합니다.

**Endpoint**: `GET /`

**Request**:
```http
GET http://localhost:9090/
```

**Response** (200 OK):
```json
{
  "message": "학점마스터 API (실습용)",
  "version": "1.0.0",
  "docs": "http://localhost:9090/docs",
  "openapi": "http://localhost:9090/openapi.json"
}
```

---

### 16. 헬스체크

서버 상태를 확인합니다.

**Endpoint**: `GET /health`

**Request**:
```http
GET http://localhost:9090/health
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "database": "connected",
  "cache": "active"
}
```

---

## 📚 Swagger UI

자동 생성된 API 문서를 브라우저에서 확인하고 테스트할 수 있습니다.

**URL**: http://localhost:9090/docs

**OpenAPI JSON**: http://localhost:9090/openapi.json

---

## 🔧 공통 에러 응답

모든 API는 다음과 같은 형식의 에러 응답을 반환합니다:

```json
{
  "detail": "에러 메시지"
}
```

**HTTP 상태 코드**:
- `400 Bad Request`: 잘못된 요청 (파라미터 오류, 파일 형식 오류 등)
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 내부 오류

---

## 💡 사용 예제

### Vue.js 통합 예제

```javascript
// API 베이스 클래스
class ChatbotAPI {
  constructor(baseURL = 'http://localhost:9090') {
    this.baseURL = baseURL;
  }

  // PDF 업로드
  async uploadPDF(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/api/v1/pdf/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    return await response.json();
  }

  // 요약 생성
  async generateSummary(documentId, numLines = 5) {
    const response = await fetch(`${this.baseURL}/api/v1/summary/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: documentId, num_lines: numLines })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Summary generation failed');
    }

    return await response.json();
  }

  // 퀴즈 생성
  async generateQuiz(documentId, numItems = 4) {
    const response = await fetch(`${this.baseURL}/api/v1/quiz/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: documentId, num_items: numItems })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Quiz generation failed');
    }

    return await response.json();
  }

  // 퀴즈 채점
  async gradeQuiz(quizId, userAnswers) {
    const response = await fetch(`${this.baseURL}/api/v1/quiz/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quiz_id: quizId, user_answers: userAnswers })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Grading failed');
    }

    return await response.json();
  }

  // Q&A
  async askQuestion(documentId, question) {
    const response = await fetch(`${this.baseURL}/api/v1/qa/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: documentId, question })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Q&A failed');
    }

    return await response.json();
  }

  // 학습 분석 개요
  async getAnalyticsOverview(days = 30) {
    const response = await fetch(`${this.baseURL}/api/v1/analytics/overview?days=${days}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Analytics failed');
    }

    return await response.json();
  }

  // 문서 목록
  async getDocuments() {
    const response = await fetch(`${this.baseURL}/api/v1/pdf/documents`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch documents');
    }

    return await response.json();
  }
}

// 사용 예
const api = new ChatbotAPI();

// PDF 업로드
const result = await api.uploadPDF(pdfFile);
console.log('Document ID:', result.document_id);

// 요약 생성
const summary = await api.generateSummary(result.document_id, 5);
console.log('Summary:', summary.summary_text);

// 퀴즈 생성
const quiz = await api.generateQuiz(result.document_id, 4);
console.log('Quiz:', quiz.items);

// 채점
const grading = await api.gradeQuiz(quiz.quiz_id, [
  { index: 0, answer: 1 },
  { index: 1, answer: 'def 키워드' }
]);
console.log('Accuracy:', grading.accuracy);

// Q&A
const qa = await api.askQuestion(result.document_id, 'Python이란?');
console.log('Answer:', qa.answer);

// 학습 분석
const analytics = await api.getAnalyticsOverview(7);
console.log('Average Accuracy:', analytics.average_accuracy);
```

---

## 🔐 보안 고려사항

현재 버전은 **로컬 개발 환경**을 위한 것으로, 다음 보안 기능이 없습니다:

- ❌ 인증/인가
- ❌ 요청 제한 (Rate Limiting)
- ❌ API 키 검증
- ❌ HTTPS

**프로덕션 배포 시 반드시 추가해야 할 사항**:
- JWT 기반 인증
- API 키 또는 OAuth2
- Rate Limiting (예: 1분당 60회)
- HTTPS 적용
- CORS 정책 강화

---

## 📞 문의 및 지원

**API 문서 버전**: 1.0.0
**최종 업데이트**: 2025-01-10
**API 상태**: http://localhost:9090/health
