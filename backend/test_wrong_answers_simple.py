"""
오답노트 API 테스트 (간단 버전 - requests 불필요)
"""
import json

def print_section(title):
    """섹션 구분선 출력"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70 + "\n")

def print_api_info():
    """오답노트 API 정보 출력"""
    print_section("오답 노트 API 정보")

    api_info = {
        "엔드포인트": "GET /api/v1/quiz/wrong-answers/{result_id}",
        "URL": "http://localhost:9090/api/v1/quiz/wrong-answers/{result_id}",
        "설명": "퀴즈 결과 ID를 기반으로 오답 목록 조회",
        "파라미터": {
            "result_id": "퀴즈 결과 ID (quiz submit 응답에서 받은 ID)"
        },
        "응답 형식": {
            "result_id": "결과 ID",
            "wrong_answers": [
                {
                    "id": "오답 노트 ID",
                    "question": "문제 내용",
                    "user_answer": "사용자 답안",
                    "correct_answer": "정답",
                    "explanation": "해설",
                    "created_at": "생성 시간"
                }
            ]
        }
    }

    print(json.dumps(api_info, indent=2, ensure_ascii=False))

def print_test_flow():
    """테스트 플로우 출력"""
    print_section("전체 테스트 플로우")

    print("""
📝 퀴즈 및 오답노트 전체 플로우:

1️⃣ PDF 업로드
   POST /api/v1/pdf/upload
   → document_id 획득

2️⃣ 퀴즈 생성
   POST /api/v1/quiz/generate
   {
     "document_id": "<document_id>",
     "num_items": 4
   }
   → quiz_id, items 획득

3️⃣ 퀴즈 제출
   POST /api/v1/quiz/submit
   {
     "quiz_id": "<quiz_id>",
     "answers": [
       {"index": 0, "answer": 1},      // MCQ: 선택지 인덱스 (0-3)
       {"index": 1, "answer": "답변"}   // Short: 텍스트 답변
     ]
   }
   → result_id, results, accuracy 획득

4️⃣ 오답 노트 조회
   GET /api/v1/quiz/wrong-answers/{result_id}
   → wrong_answers 목록 획득
    """)

def print_curl_examples():
    """curl 명령어 예시 출력"""
    print_section("curl 명령어 예시")

    print("""
# 1. 퀴즈 생성 (document_id 필요)
curl -X POST "http://localhost:9090/api/v1/quiz/generate" \\
  -H "Content-Type: application/json" \\
  -d '{
    "document_id": "your-document-id",
    "num_items": 4
  }'

# 2. 퀴즈 제출
curl -X POST "http://localhost:9090/api/v1/quiz/submit" \\
  -H "Content-Type: application/json" \\
  -d '{
    "quiz_id": "your-quiz-id",
    "answers": [
      {"index": 0, "answer": 1},
      {"index": 1, "answer": "튜링 테스트는 기계의 지능을 측정합니다"},
      {"index": 2, "answer": 0},
      {"index": 3, "answer": "CNN을 사용한 AlexNet"}
    ]
  }'

# 3. 오답 노트 조회
curl -X GET "http://localhost:9090/api/v1/quiz/wrong-answers/your-result-id"

# 4. 퀴즈 결과 조회 (전체 정보)
curl -X GET "http://localhost:9090/api/v1/quiz/result/your-result-id"
    """)

def print_sample_data():
    """샘플 데이터 출력"""
    print_section("샘플 응답 데이터")

    sample_response = {
        "result_id": "abc123-def456-ghi789",
        "wrong_answers": [
            {
                "id": "wrong-001",
                "question": "인공지능(AI)의 정의로 가장 적절한 것은?",
                "user_answer": "인간의 신체 능력을 모방한 로봇",
                "correct_answer": "인간의 학습능력, 추론능력, 지각능력을 인공적으로 구현한 시스템",
                "explanation": "AI는 인간의 지적 능력을 컴퓨터로 구현한 것입니다.",
                "created_at": "2025-11-10T17:30:00"
            },
            {
                "id": "wrong-002",
                "question": "튜링 테스트의 목적을 설명하시오.",
                "user_answer": "기계가 생각하는지 테스트",
                "correct_answer": "기계가 인간과 구별할 수 없을 정도로 대화할 수 있는지 측정하여 기계의 지능을 판단하는 테스트",
                "explanation": "아쉽습니다. 주요 키워드 2/5개만 포함. 다음 키워드를 포함해야 합니다: 기계, 지능, 측정, 대화, 구별",
                "created_at": "2025-11-10T17:30:00"
            }
        ]
    }

    print(json.dumps(sample_response, indent=2, ensure_ascii=False))

def print_implementation_check():
    """구현 확인 체크리스트"""
    print_section("오답 노트 API 구현 체크")

    print("""
✅ 구현 완료 항목:

1. API 엔드포인트:
   - GET /api/v1/quiz/wrong-answers/{result_id}
   - 위치: app/api/v1/quiz.py (208-220번째 줄)

2. 데이터베이스 모델:
   - WrongAnswer 모델 정의
   - 위치: app/models/models.py (47-58번째 줄)
   - 필드: id, quiz_result_id, question_id, question,
          user_answer, correct_answer, explanation, created_at

3. 퀴즈 제출 시 오답 노트 자동 생성:
   - 위치: app/api/v1/quiz.py (115-143번째 줄)
   - 오답만 필터링하여 WrongAnswer 테이블에 저장
   - MCQ와 Short 답변 타입 모두 처리

4. 오답 노트 조회:
   - result_id로 해당 결과의 오답만 조회
   - 문제, 사용자 답안, 정답, 해설 포함

🔧 수정된 버그:
   - MCQ 정답을 options[answer_index]로 정확히 추출
   - 사용자 답안 인덱스 불일치 문제 해결
   - 정답 필드 타입별로 올바르게 처리
    """)

def print_frontend_integration():
    """프론트엔드 연동 가이드"""
    print_section("프론트엔드 연동 가이드")

    print("""
🎨 프론트엔드에서 오답 노트 표시 방법:

1. 퀴즈 제출 후 result_id 저장:
   const submitQuiz = async (quizId, answers) => {
     const response = await fetch('/api/v1/quiz/submit', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ quiz_id: quizId, answers })
     });
     const data = await response.json();
     return data.result_id;  // 이 ID를 저장
   };

2. 오답 노트 조회:
   const getWrongAnswers = async (resultId) => {
     const response = await fetch(`/api/v1/quiz/wrong-answers/${resultId}`);
     const data = await response.json();
     return data.wrong_answers;
   };

3. UI 표시 예시:
   wrongAnswers.forEach((wa, index) => {
     console.log(`❌ 오답 ${index + 1}`);
     console.log(`문제: ${wa.question}`);
     console.log(`내 답: ${wa.user_answer}`);
     console.log(`정답: ${wa.correct_answer}`);
     console.log(`해설: ${wa.explanation}`);
   });

4. 오답 노트 페이지 구성:
   - 오답 개수 표시
   - 각 오답별 카드 형태로 표시
   - 문제 / 내 답변 / 정답 / 해설 구분
   - 복습하기 버튼 (해당 문제로 이동)
    """)

def main():
    """메인 함수"""
    print("""
╔════════════════════════════════════════════════════════════════════╗
║           퀴즈 오답 노트 API 정보 및 테스트 가이드                  ║
╚════════════════════════════════════════════════════════════════════╝
    """)

    print_api_info()
    print_test_flow()
    print_implementation_check()
    print_curl_examples()
    print_sample_data()
    print_frontend_integration()

    print_section("실제 테스트 방법")
    print("""
🚀 서버 실행:
   cd chatbot-backend
   python3 run.py

📚 Swagger UI에서 테스트:
   http://localhost:9090/docs

   순서:
   1. POST /api/v1/pdf/upload - PDF 업로드
   2. POST /api/v1/quiz/generate - 퀴즈 생성
   3. POST /api/v1/quiz/submit - 답안 제출
   4. GET /api/v1/quiz/wrong-answers/{result_id} - 오답 조회

💡 빠른 테스트:
   - Swagger UI의 "Try it out" 버튼 사용
   - 각 단계의 응답에서 ID 복사하여 다음 단계에 사용
   - 퀴즈 제출 시 일부러 틀린 답을 넣어 오답 노트 생성 확인
    """)

    print("\n" + "=" * 70)
    print("  테스트 정보 출력 완료")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    main()
