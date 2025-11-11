from app.services.openai_service import OpenAIService
import json
import re
from typing import List, Dict, Any, Tuple

class QuizService:
    """퀴즈 생성 및 채점 서비스 (Streamlit 앱 로직 이식)"""

    def __init__(self):
        self.openai_service = OpenAIService()

    def _extract_json_block(self, text: str) -> str:
        """
        모델이 JSON 외 텍스트를 섞어줄 때 { ... } 블록만 안전 추출
        (Streamlit _extract_json_block 함수 이식)
        """
        m = re.search(r"\{.*\}", text, flags=re.S)
        if not m:
            raise ValueError("모델 응답에서 JSON 블록을 찾지 못했습니다.")
        return m.group(0)

    async def _extract_keypoints_for_quiz(self, full_text: str) -> str:
        """
        긴 문서에서 문제거리가 될 핵심 포인트를 먼저 뽑아냄
        (Streamlit extract_keypoints_for_quiz 함수 이식)

        Args:
            full_text: 전체 문서 텍스트

        Returns:
            핵심 키포인트 (15~25개)
        """
        chunks = self.openai_service.chunk_text(full_text, max_chars=4000)

        if not chunks:
            return ""

        # 각 청크에서 키포인트 추출
        bullets = []
        for chunk in chunks:
            prompt = (
                "너는 대학 교재로부터 문제거리가 될 '핵심 키포인트'를 뽑는 조교다.\n"
                "아래 본문에서 정의/핵심 개념/중요 규칙/예외/용어를 한국어 불릿 5~8개로만 정리해라.\n\n"
                f"[본문]\n{chunk}"
            )

            messages = [{"role": "user", "content": prompt}]

            result = await self.openai_service.chat_completion(
                messages=messages,
                temperature=0.2
            )

            bullets.append(result)

        # 부분 키포인트 통합
        merged = "\n\n".join(bullets)

        reducer = (
            "아래 부분 키포인트 목록을 중복 제거하고, 용어를 통일해 한국어로 15~25개 핵심 키포인트만 남겨라.\n"
            "불필요한 예시는 제외하고 '정의/원리/규칙/구조/절차' 중심으로 재정리하라.\n\n"
            f"[부분 키포인트]\n{merged}"
        )

        messages = [{"role": "user", "content": reducer}]

        final_keypoints = await self.openai_service.chat_completion(
            messages=messages,
            temperature=0.2
        )

        return final_keypoints

    async def generate_quiz(self, full_text: str, num_items: int = 4) -> List[Dict[str, Any]]:
        """
        문서 기반 퀴즈 생성 (객관식/주관식)
        (Streamlit generate_quiz_from_doc 함수 이식)

        Args:
            full_text: 전체 문서 텍스트
            num_items: 생성할 문항 수 (3~5)

        Returns:
            퀴즈 문항 목록
        """
        num_items = max(3, min(5, int(num_items)))

        # 핵심 키포인트 추출
        keypoints = await self._extract_keypoints_for_quiz(full_text)

        # 퀴즈 생성 프롬프트
        prompt = f"""
너는 대학 교재 기반 퀴즈를 만드는 조교다.
[키포인트]를 반드시 근거로 하여 객관식/주관식 합쳐 총 {num_items}문항을 생성하라.
조건:
- 객관식(MCQ): 보기 4개, 오직 하나의 정답. 정답 인덱스(answer_index, 0~3) 포함.
- 주관식(short): 기준 정답(answer) 문장과 채점 키워드(rubric_keywords, 3~6개) 포함.
- 각 문항에는 간단한 한국어 해설(explanation)을 포함.
- JSON만 출력. 여분 텍스트 금지.

출력 스키마(JSON) 예:
{{
  "items": [
    {{
      "type": "mcq",
      "question": "문제문장",
      "options": ["보기1","보기2","보기3","보기4"],
      "answer_index": 1,
      "explanation": "왜 정답인지 한두 문장"
    }},
    {{
      "type": "short",
      "question": "서술형 문제문장",
      "answer": "기준 정답(문장)",
      "rubric_keywords": ["키워드1","키워드2","키워드3"],
      "explanation": "채점 기준에 대한 간단 설명"
    }}
  ]
}}

[키포인트]
{keypoints}
"""

        messages = [{"role": "user", "content": prompt}]

        result = await self.openai_service.chat_completion(
            messages=messages,
            temperature=0.2,
            use_cache=False  # 퀴즈는 매번 다르게 생성
        )

        # JSON 파싱
        data = json.loads(self._extract_json_block(result))

        # 정합성 체크
        if not isinstance(data, dict) or "items" not in data:
            raise ValueError("퀴즈 JSON 형식이 올바르지 않습니다.")

        fixed = []
        for item in data["items"][:num_items]:
            if item.get("type") == "mcq":
                if "options" in item and isinstance(item["options"], list) and len(item["options"]) == 4 and "answer_index" in item:
                    fixed.append(item)
            elif item.get("type") == "short":
                if "answer" in item and "rubric_keywords" in item:
                    fixed.append(item)

        return fixed

    async def grade_quiz(
        self,
        quiz_items: List[Dict[str, Any]],
        user_answers: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], float]:
        """
        퀴즈 채점
        (Streamlit grade_quiz 함수 이식)

        Args:
            quiz_items: 퀴즈 문항 목록
            user_answers: 사용자 답안 목록

        Returns:
            (채점 결과 목록, 정확도)
        """
        results = []
        correct_count = 0

        # user_answers를 인덱스별로 매핑
        answer_map = {}
        for ans in user_answers:
            idx = ans.get("index")
            if idx is not None:
                answer_map[idx] = ans.get("answer")

        for idx, item in enumerate(quiz_items):
            user_answer = answer_map.get(idx)
            result = {
                "index": idx,
                "type": item["type"],
                "question": item.get("question", ""),
                "is_correct": False,
                "score": 0.0
            }

            if item["type"] == "mcq":
                # 객관식 채점
                gt = int(item["answer_index"])
                result["user_answer"] = user_answer if isinstance(user_answer, int) else None
                result["correct_answer"] = gt

                if result["user_answer"] is not None and result["user_answer"] == gt:
                    result["is_correct"] = True
                    result["score"] = 1.0

                result["feedback"] = item.get("explanation", "")

            elif item["type"] == "short":
                # 주관식 채점 (키워드 기반)
                gt = item.get("answer", "")
                rubric = [k.lower() for k in item.get("rubric_keywords", [])]
                user_text = (user_answer or "").strip().lower() if isinstance(user_answer, str) else ""

                hit = sum(1 for k in rubric if k in user_text)
                ratio = hit / max(1, len(rubric))

                result["user_answer"] = user_answer or ""
                result["correct_answer"] = gt
                result["rubric_hit"] = hit
                result["rubric_total"] = len(rubric)
                result["score"] = round(ratio, 2)

                # 키워드 절반 이상 포함 시 정답 처리
                result["is_correct"] = ratio >= 0.5

                # 피드백 생성
                if ratio >= 0.8:
                    result["feedback"] = f"잘했습니다! 주요 키워드 {hit}/{len(rubric)}개 포함. " + item.get("explanation", "")
                elif ratio >= 0.5:
                    result["feedback"] = f"부분 정답입니다. 주요 키워드 {hit}/{len(rubric)}개 포함. 누락된 키워드를 추가하세요."
                else:
                    result["feedback"] = f"아쉽습니다. 주요 키워드 {hit}/{len(rubric)}개만 포함. 다음 키워드를 포함해야 합니다: {', '.join(item.get('rubric_keywords', []))}"

            if result["is_correct"]:
                correct_count += 1

            results.append(result)

        accuracy = correct_count / max(1, len(results)) if results else 0.0

        return results, accuracy

    async def generate_feedback_for_wrong_answer(
        self,
        item: Dict[str, Any],
        user_answer: Any
    ) -> str:
        """
        오답/부분정답에 대해 GPT가 친절한 피드백을 생성
        (Streamlit llm_feedback_for_wrong_answer 함수 이식)

        Args:
            item: 문제 정보
            user_answer: 사용자 답안

        Returns:
            피드백 텍스트
        """
        question = item.get("question", "")

        if item["type"] == "mcq":
            options = ", ".join(item.get("options", []))
            gt_idx = int(item.get("answer_index", 0))
            gt_text = item.get("options", [""])[gt_idx] if item.get("options") else ""
            explanation = item.get("explanation", "")
            user = f"(선택지 인덱스: {user_answer})"

            prompt = f"""
[문제]
{question}
[보기]
{options}

[당신의 답]
{user}

[정답]
{gt_idx}번: {gt_text}

[공식 해설]
{explanation}

요구사항:
- 왜 틀렸는지 핵심 근거 1~2개
- 정답이 맞는 이유 1~2개
- 다음 공부 포인트 2~3개 (불릿)
- 한국어 5줄 이내
"""
        else:  # short answer
            gt = item.get("answer", "")
            rubric = ", ".join(item.get("rubric_keywords", []))
            explanation = item.get("explanation", "")
            user = user_answer or ""

            prompt = f"""
[서술형 문제]
{question}

[당신의 답]
{user}

[기준 정답]
{gt}

[채점 루브릭 키워드]
{rubric}

[공식 해설]
{explanation}

요구사항:
- 당신 답의 문제점 1~2개
- 기준 정답과의 차이점
- 채점 키워드 중 누락된 것
- 다음 학습 포인트 2~3개
- 한국어 5줄 이내
"""

        messages = [{"role": "user", "content": prompt}]

        feedback = await self.openai_service.chat_completion(
            messages=messages,
            temperature=0.3,
            use_cache=False
        )

        return feedback
