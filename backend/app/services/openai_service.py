from openai import OpenAI, AuthenticationError, APIError, RateLimitError
from app.core.config import settings
from app.core.cache import cache
import hashlib
import json

class OpenAIService:
    """OpenAI API 서비스"""

    def __init__(self):
        if not settings.openai_api_key or settings.openai_api_key == "":
            raise ValueError("OPENAI_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.")

        self.client = OpenAI(
            api_key=settings.openai_api_key,
            timeout=settings.openai_timeout
        )
        self.model = settings.gpt_model
        self.vision_model = settings.gpt_vision_model

    def _generate_cache_key(self, prefix: str, content: str) -> str:
        """캐시 키 생성"""
        content_hash = hashlib.md5(content.encode()).hexdigest()
        return f"{prefix}:{content_hash}"

    async def chat_completion(
        self,
        messages: list,
        model: str = None,
        temperature: float = 0.7,
        use_cache: bool = True
    ) -> str:
        """
        채팅 완성 API 호출

        Args:
            messages: 메시지 목록
            model: 사용할 모델 (기본값: gpt-4o)
            temperature: 온도 (0.0 ~ 2.0)
            use_cache: 캐시 사용 여부

        Returns:
            응답 텍스트
        """
        if model is None:
            model = self.model

        # 캐시 확인
        if use_cache:
            cache_key = self._generate_cache_key("chat", json.dumps(messages))
            cached_response = cache.get(cache_key)
            if cached_response:
                return cached_response

        # API 호출
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature
            )

            result = response.choices[0].message.content

            # 캐시 저장
            if use_cache:
                cache.set(cache_key, result, expire=settings.cache_expire_seconds)

            return result

        except AuthenticationError as e:
            raise ValueError(f"OpenAI API 인증 실패: API 키가 유효하지 않습니다. .env 파일의 OPENAI_API_KEY를 확인하세요.")
        except RateLimitError as e:
            raise ValueError(f"OpenAI API 사용량 한도 초과: 잠시 후 다시 시도하세요.")
        except APIError as e:
            raise ValueError(f"OpenAI API 오류: {str(e)}")

    async def vision_completion(
        self,
        text: str,
        image_base64: str,
        use_cache: bool = True
    ) -> str:
        """
        비전 완성 API 호출 (이미지 분석)

        Args:
            text: 프롬프트 텍스트
            image_base64: Base64 인코딩된 이미지
            use_cache: 캐시 사용 여부

        Returns:
            응답 텍스트
        """
        # 캐시 확인
        if use_cache:
            cache_key = self._generate_cache_key("vision", text + image_base64[:100])
            cached_response = cache.get(cache_key)
            if cached_response:
                return cached_response

        # API 호출
        response = self.client.chat.completions.create(
            model=self.vision_model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": text},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ]
        )

        result = response.choices[0].message.content

        # 캐시 저장
        if use_cache:
            cache.set(cache_key, result, expire=settings.cache_expire_seconds)

        return result

    def chunk_text(self, text: str, max_chars: int = None) -> list:
        """
        텍스트를 청크로 분할

        Args:
            text: 분할할 텍스트
            max_chars: 최대 문자 수 (기본값: settings.chunk_size)

        Returns:
            청크 목록
        """
        if max_chars is None:
            max_chars = settings.chunk_size

        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        chunks = []
        current_chunk = ""

        for paragraph in paragraphs:
            if len(current_chunk) + len(paragraph) + 2 <= max_chars:
                current_chunk = f"{current_chunk}\n\n{paragraph}" if current_chunk else paragraph
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = paragraph

        if current_chunk:
            chunks.append(current_chunk)

        return chunks
