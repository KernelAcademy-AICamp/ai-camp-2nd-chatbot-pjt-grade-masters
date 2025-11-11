from app.services.openai_service import OpenAIService

class SummaryService:
    """문서 요약 서비스 (Streamlit 앱 로직 이식)"""

    def __init__(self):
        self.openai_service = OpenAIService()

    async def _gpt_summarize_k5(self, text: str) -> str:
        """
        5줄 이내 요약 생성
        (Streamlit gpt_summarize_k5 함수 이식)

        Args:
            text: 요약할 텍스트

        Returns:
            5줄 요약
        """
        prompt = (
            "다음 학습 자료를 한국어로 **5줄 이내**로 핵심만 요약해줘.\n"
            "불필요한 예시는 빼고, 핵심 개념/정의/식 위주로 정리해줘.\n\n"
            f"[본문]\n{text}"
        )

        messages = [{"role": "user", "content": prompt}]

        result = await self.openai_service.chat_completion(
            messages=messages,
            temperature=0.2
        )

        return result

    async def generate_summary(self, text: str) -> str:
        """
        문서 전체 요약 생성
        (Streamlit summarize_long_text 함수 이식)

        Args:
            text: 요약할 전체 텍스트

        Returns:
            최종 요약
        """
        # 텍스트를 청크로 분할
        chunks = self.openai_service.chunk_text(text)

        if not chunks:
            return "요약할 텍스트가 없습니다."

        # 청크가 1개면 바로 요약
        if len(chunks) == 1:
            return await self._gpt_summarize_k5(chunks[0])

        # 각 청크별 부분 요약 생성
        part_summaries = []
        for chunk in chunks:
            summary = await self._gpt_summarize_k5(chunk)
            part_summaries.append(summary)

        # 부분 요약들을 통합
        joined = "\n\n".join(part_summaries)

        final_prompt = (
            "아래 부분 요약들을 **통합**해서 한국어로 **정확히 5줄 이내**로 핵심만 압축해줘.\n"
            "중복 제거, 용어 통일, 수식/정의/핵심 논점만 남겨.\n\n"
            f"[부분 요약]\n{joined}"
        )

        messages = [{"role": "user", "content": final_prompt}]

        final_summary = await self.openai_service.chat_completion(
            messages=messages,
            temperature=0.2
        )

        return final_summary
