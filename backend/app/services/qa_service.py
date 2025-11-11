from app.services.openai_service import OpenAIService
from typing import Tuple

class QAService:
    """문서 기반 Q&A 서비스 (Streamlit 로직 이식)"""

    def __init__(self):
        self.openai_service = OpenAIService()

    def _build_qa_context(
        self,
        full_text: str,
        question: str,
        max_ctx_chars: int = 16000
    ) -> str:
        """
        임베딩 없이 동작하는 미니 RAG
        (Streamlit build_qa_context 함수 이식)

        Args:
            full_text: 전체 문서 텍스트
            question: 질문
            max_ctx_chars: 최대 컨텍스트 문자 수

        Returns:
            관련 컨텍스트
        """
        # 문서를 작은 청크로 분할
        chunks = self.openai_service.chunk_text(full_text, max_chars=3000)

        if not chunks:
            return ""

        # 아주 단순한 키워드 기반 스코어
        q_tokens = set(question.lower().split())
        scored = []

        for chunk in chunks:
            c_tokens = set(chunk.lower().split())
            overlap = len(q_tokens & c_tokens)
            # 너무 긴 청크는 약간 패널티
            score = overlap - 0.00001 * len(chunk)
            scored.append((score, chunk))

        # 상위 3~4개 컨텍스트로 묶기
        top_chunks = sorted(scored, key=lambda x: x[0], reverse=True)[:4]
        top_ctx = "\n\n---\n\n".join([chunk for _, chunk in top_chunks])

        return top_ctx[:max_ctx_chars]

    async def answer_question(
        self,
        full_text: str,
        question: str
    ) -> Tuple[str, str]:
        """
        문서 근거 기반으로만 답변
        (Streamlit answer_from_doc 함수 이식)

        Args:
            full_text: 전체 문서 텍스트
            question: 질문

        Returns:
            (답변, 사용된 컨텍스트)
        """
        # 관련 컨텍스트 추출
        context = self._build_qa_context(full_text, question)

        # 시스템 프롬프트
        system = (
            "너는 문서 기반 Q&A 조교다. 반드시 제공된 문서 컨텍스트 안에서만 답하라. "
            "문서에 근거가 없으면 '문서 근거로는 알 수 없습니다.'라고 답한다. "
            "허구 생성 금지, 간결하고 구체적으로 답하라."
        )

        user = f"[컨텍스트]\n{context}\n\n[질문]\n{question}"

        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ]

        answer = await self.openai_service.chat_completion(
            messages=messages,
            temperature=0.1
        )

        return answer, context
