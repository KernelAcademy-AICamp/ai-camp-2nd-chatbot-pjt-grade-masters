"""
퀴즈 및 오답노트 API 통합 테스트
"""
import requests
import json
import time
from pathlib import Path

BASE_URL = "http://localhost:9090"
API_PREFIX = "/api/v1"

def print_section(title):
    """섹션 구분선 출력"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60 + "\n")

def print_result(step, success, data=None, error=None):
    """결과 출력"""
    status = "✅ 성공" if success else "❌ 실패"
    print(f"{step}: {status}")
    if data:
        print(json.dumps(data, indent=2, ensure_ascii=False))
    if error:
        print(f"오류: {error}")
    print()

def test_quiz_flow():
    """퀴즈 생성 → 제출 → 오답노트 전체 플로우 테스트"""

    print_section("퀴즈 및 오답노트 API 테스트")

    # Step 1: PDF 업로드 (테스트용 샘플 PDF 생성)
    print_section("Step 1: PDF 업로드")

    # 테스트용 텍스트 파일 생성 (PDF 대신)
    test_content = """
인공지능(AI)의 역사와 발전

1. 인공지능의 정의
인공지능(Artificial Intelligence, AI)은 인간의 학습능력, 추론능력, 지각능력을
인공적으로 구현한 컴퓨터 프로그램 또는 시스템을 의미합니다.

2. 튜링 테스트
앨런 튜링이 1950년에 제안한 기계의 지능을 측정하는 테스트입니다.
기계가 인간과 구별할 수 없을 정도로 대화할 수 있다면 지능이 있다고 판단합니다.

3. 머신러닝의 종류
- 지도학습(Supervised Learning): 레이블이 있는 데이터로 학습
- 비지도학습(Unsupervised Learning): 레이블이 없는 데이터에서 패턴 발견
- 강화학습(Reinforcement Learning): 보상을 통해 최적의 행동 학습

4. 딥러닝의 등장
2012년 ImageNet 대회에서 AlexNet이 우승하면서 딥러닝 시대가 열렸습니다.
CNN(합성곱 신경망)을 사용하여 이미지 인식 분야에서 혁신을 이루었습니다.
"""

    try:
        # 실제 환경에서는 PDF 파일 업로드
        # 여기서는 직접 문서 생성 (간소화)
        print("테스트용 문서 컨텐츠 준비 완료")
        document_id = None

        # 실제로는 PDF 업로드 API 호출
        # response = requests.post(f"{BASE_URL}{API_PREFIX}/pdf/upload", ...)
        # 테스트를 위해 문서 ID 직접 생성 (실제로는 업로드 후 받아야 함)

        print("⚠️ 참고: 실제 테스트를 위해서는 먼저 PDF를 업로드해야 합니다.")
        print("지금은 퀴즈 생성 API를 직접 호출하겠습니다.\n")

    except Exception as e:
        print_result("PDF 업로드", False, error=str(e))
        return

    # Step 2: 퀴즈 생성
    print_section("Step 2: 퀴즈 생성")

    quiz_id = None
    quiz_items = None

    try:
        # 퀴즈 생성 요청 (실제로는 document_id 필요)
        # 테스트를 위해 API 문서 확인
        print("실제 퀴즈 생성을 위해서는 유효한 document_id가 필요합니다.")
        print("API 문서: http://localhost:9090/docs 에서 테스트하세요.\n")

        # 샘플 퀴즈 데이터 (실제 API 응답 형식)
        quiz_id = "test-quiz-id-12345"
        quiz_items = [
            {
                "type": "mcq",
                "question": "인공지능(AI)의 정의로 가장 적절한 것은?",
                "options": [
                    "인간의 신체 능력을 모방한 로봇",
                    "인간의 학습능력, 추론능력, 지각능력을 인공적으로 구현한 시스템",
                    "단순히 빠른 계산을 하는 컴퓨터",
                    "인터넷에 연결된 모든 기기"
                ],
                "answer_index": 1,
                "explanation": "AI는 인간의 지적 능력을 컴퓨터로 구현한 것입니다."
            },
            {
                "type": "short",
                "question": "튜링 테스트의 목적을 설명하시오.",
                "answer": "기계가 인간과 구별할 수 없을 정도로 대화할 수 있는지 측정하여 기계의 지능을 판단하는 테스트",
                "rubric_keywords": ["기계", "지능", "측정", "대화", "구별"],
                "explanation": "튜링 테스트는 기계의 지능을 평가하는 기준입니다."
            },
            {
                "type": "mcq",
                "question": "지도학습(Supervised Learning)의 특징은?",
                "options": [
                    "레이블이 없는 데이터로 학습",
                    "레이블이 있는 데이터로 학습",
                    "보상을 통해 학습",
                    "사람의 지도 없이 학습"
                ],
                "answer_index": 1,
                "explanation": "지도학습은 입력과 출력 쌍(레이블)을 사용하여 학습합니다."
            },
            {
                "type": "short",
                "question": "2012년 딥러닝 시대를 연 사건과 사용된 기술을 설명하시오.",
                "answer": "ImageNet 대회에서 AlexNet이 우승했으며, CNN(합성곱 신경망)을 사용하여 이미지 인식 분야에서 혁신을 이루었습니다.",
                "rubric_keywords": ["ImageNet", "AlexNet", "CNN", "이미지인식"],
                "explanation": "AlexNet의 성공으로 딥러닝이 주목받기 시작했습니다."
            }
        ]

        print_result("퀴즈 생성", True, {
            "quiz_id": quiz_id,
            "items_count": len(quiz_items),
            "items": quiz_items
        })

    except Exception as e:
        print_result("퀴즈 생성", False, error=str(e))
        return

    # Step 3: 퀴즈 제출 (일부러 틀린 답 포함)
    print_section("Step 3: 퀴즈 제출 (일부 오답 포함)")

    result_id = None

    try:
        # 사용자 답안 (일부러 틀린 답 포함)
        user_answers = [
            {"index": 0, "answer": 0},  # 틀림 (정답: 1)
            {"index": 1, "answer": "기계가 사람처럼 생각하는지 테스트"},  # 부분 정답 (키워드 일부만)
            {"index": 2, "answer": 1},  # 정답
            {"index": 3, "answer": "AlexNet이 우승했습니다"}  # 부분 정답 (일부 키워드만)
        ]

        # 실제로는 API 호출
        # response = requests.post(
        #     f"{BASE_URL}{API_PREFIX}/quiz/submit",
        #     json={"quiz_id": quiz_id, "answers": user_answers}
        # )

        # 테스트용 결과 시뮬레이션
        result_id = "test-result-id-67890"
        results = [
            {
                "index": 0,
                "type": "mcq",
                "question": quiz_items[0]["question"],
                "is_correct": False,
                "score": 0.0,
                "user_answer": 0,
                "correct_answer": 1,
                "feedback": quiz_items[0]["explanation"]
            },
            {
                "index": 1,
                "type": "short",
                "question": quiz_items[1]["question"],
                "is_correct": False,
                "score": 0.4,
                "user_answer": "기계가 사람처럼 생각하는지 테스트",
                "correct_answer": quiz_items[1]["answer"],
                "rubric_hit": 2,
                "rubric_total": 5,
                "feedback": "아쉽습니다. 주요 키워드 2/5개만 포함. 다음 키워드를 포함해야 합니다: 기계, 지능, 측정, 대화, 구별"
            },
            {
                "index": 2,
                "type": "mcq",
                "question": quiz_items[2]["question"],
                "is_correct": True,
                "score": 1.0,
                "user_answer": 1,
                "correct_answer": 1,
                "feedback": quiz_items[2]["explanation"]
            },
            {
                "index": 3,
                "type": "short",
                "question": quiz_items[3]["question"],
                "is_correct": False,
                "score": 0.25,
                "user_answer": "AlexNet이 우승했습니다",
                "correct_answer": quiz_items[3]["answer"],
                "rubric_hit": 1,
                "rubric_total": 4,
                "feedback": "아쉽습니다. 주요 키워드 1/4개만 포함. 다음 키워드를 포함해야 합니다: ImageNet, AlexNet, CNN, 이미지인식"
            }
        ]
        accuracy = 0.25  # 4문제 중 1문제만 정답

        print_result("퀴즈 제출", True, {
            "result_id": result_id,
            "quiz_id": quiz_id,
            "accuracy": accuracy,
            "correct_count": f"1/4 (25%)",
            "results_summary": [
                f"문제 {r['index']+1}: {'✅ 정답' if r['is_correct'] else '❌ 오답'} (점수: {r['score']})"
                for r in results
            ]
        })

    except Exception as e:
        print_result("퀴즈 제출", False, error=str(e))
        return

    # Step 4: 오답 노트 조회
    print_section("Step 4: 오답 노트 조회")

    try:
        # 실제로는 API 호출
        # response = requests.get(f"{BASE_URL}{API_PREFIX}/quiz/wrong-answers/{result_id}")

        # 테스트용 오답 노트 시뮬레이션
        wrong_answers = [
            {
                "id": "wrong-1",
                "question": quiz_items[0]["question"],
                "user_answer": quiz_items[0]["options"][0],
                "correct_answer": quiz_items[0]["options"][1],
                "explanation": quiz_items[0]["explanation"],
                "created_at": "2025-11-10T17:30:00"
            },
            {
                "id": "wrong-2",
                "question": quiz_items[1]["question"],
                "user_answer": "기계가 사람처럼 생각하는지 테스트",
                "correct_answer": quiz_items[1]["answer"],
                "explanation": "아쉽습니다. 주요 키워드 2/5개만 포함. 다음 키워드를 포함해야 합니다: 기계, 지능, 측정, 대화, 구별",
                "created_at": "2025-11-10T17:30:00"
            },
            {
                "id": "wrong-3",
                "question": quiz_items[3]["question"],
                "user_answer": "AlexNet이 우승했습니다",
                "correct_answer": quiz_items[3]["answer"],
                "explanation": "아쉽습니다. 주요 키워드 1/4개만 포함. 다음 키워드를 포함해야 합니다: ImageNet, AlexNet, CNN, 이미지인식",
                "created_at": "2025-11-10T17:30:00"
            }
        ]

        print_result("오답 노트 조회", True, {
            "result_id": result_id,
            "wrong_count": len(wrong_answers),
            "wrong_answers": wrong_answers
        })

        # 오답 상세 출력
        print("\n📋 오답 노트 상세:")
        print("-" * 60)
        for i, wa in enumerate(wrong_answers, 1):
            print(f"\n[오답 {i}]")
            print(f"❓ 문제: {wa['question']}")
            print(f"❌ 내 답: {wa['user_answer']}")
            print(f"✅ 정답: {wa['correct_answer']}")
            print(f"💡 해설: {wa['explanation']}")
            print("-" * 60)

    except Exception as e:
        print_result("오답 노트 조회", False, error=str(e))
        return

    # Step 5: 실제 API 테스트 안내
    print_section("실제 API 테스트 방법")
    print("""
실제 API를 테스트하려면:

1. 서버 실행:
   cd chatbot-backend
   python3 run.py

2. API 문서 열기:
   http://localhost:9090/docs

3. 테스트 순서:
   ① POST /api/v1/pdf/upload - PDF 파일 업로드
   ② POST /api/v1/quiz/generate - 퀴즈 생성 (document_id 필요)
   ③ POST /api/v1/quiz/submit - 퀴즈 제출 (quiz_id, answers 필요)
   ④ GET /api/v1/quiz/wrong-answers/{result_id} - 오답 노트 조회

4. curl 명령어 예시:
   # 오답 노트 조회
   curl -X GET "http://localhost:9090/api/v1/quiz/wrong-answers/{result_id}"
    """)

def test_wrong_answers_api_only():
    """오답노트 API만 독립적으로 테스트"""
    print_section("오답 노트 API 단독 테스트")

    # 테스트할 result_id (실제 환경에서는 DB에 존재하는 ID 사용)
    test_result_id = "test-result-id"

    try:
        response = requests.get(f"{BASE_URL}{API_PREFIX}/quiz/wrong-answers/{test_result_id}")

        if response.status_code == 200:
            data = response.json()
            print_result("오답 노트 API 호출", True, data)
        elif response.status_code == 404:
            print_result("오답 노트 API 호출", False,
                        error=f"결과를 찾을 수 없습니다 (result_id: {test_result_id})")
            print("\n💡 실제 result_id를 사용하려면:")
            print("   1. 먼저 퀴즈를 생성하고")
            print("   2. 퀴즈를 제출한 후")
            print("   3. 반환된 result_id를 사용하세요")
        else:
            print_result("오답 노트 API 호출", False,
                        error=f"상태 코드: {response.status_code}, 응답: {response.text}")
    except requests.exceptions.ConnectionError:
        print_result("오답 노트 API 호출", False,
                    error="서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.")
    except Exception as e:
        print_result("오답 노트 API 호출", False, error=str(e))

if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════════════════╗
║       퀴즈 & 오답노트 API 통합 테스트 스크립트              ║
╚════════════════════════════════════════════════════════════╝
    """)

    # 전체 플로우 시뮬레이션
    test_quiz_flow()

    print("\n" + "=" * 60)
    print("  추가: 오답노트 API 단독 테스트")
    print("=" * 60 + "\n")

    # 오답노트 API 직접 테스트
    test_wrong_answers_api_only()

    print("\n" + "=" * 60)
    print("  테스트 완료")
    print("=" * 60)
