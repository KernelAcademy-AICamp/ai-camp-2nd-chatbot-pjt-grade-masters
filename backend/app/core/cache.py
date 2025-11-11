from typing import Dict, Any, Optional
from datetime import datetime, timedelta

class SimpleCache:
    """간단한 메모리 기반 캐시 (Redis 대체)"""

    def __init__(self):
        self.cache: Dict[str, Dict[str, Any]] = {}

    def set(self, key: str, value: Any, expire: int = 3600):
        """
        캐시에 값 저장

        Args:
            key: 캐시 키
            value: 저장할 값
            expire: 만료 시간 (초)
        """
        self.cache[key] = {
            "value": value,
            "expire_at": datetime.now() + timedelta(seconds=expire)
        }

    def get(self, key: str) -> Optional[Any]:
        """
        캐시에서 값 조회

        Args:
            key: 캐시 키

        Returns:
            캐시된 값 또는 None
        """
        if key in self.cache:
            item = self.cache[key]
            if datetime.now() < item["expire_at"]:
                return item["value"]
            else:
                # 만료된 항목 삭제
                del self.cache[key]
        return None

    def delete(self, key: str):
        """
        캐시에서 값 삭제

        Args:
            key: 캐시 키
        """
        if key in self.cache:
            del self.cache[key]

    def clear(self):
        """모든 캐시 삭제"""
        self.cache.clear()

    def exists(self, key: str) -> bool:
        """
        캐시 키 존재 여부 확인

        Args:
            key: 캐시 키

        Returns:
            존재 여부
        """
        return self.get(key) is not None

# 전역 캐시 인스턴스
cache = SimpleCache()
