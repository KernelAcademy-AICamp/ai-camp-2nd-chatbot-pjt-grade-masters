from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Document
from app.services.qa_service import QAService
from pydantic import BaseModel

router = APIRouter()

class QARequest(BaseModel):
    """Q&A 요청 모델"""
    document_id: str
    question: str

@router.post("/ask")
async def ask_question(
    request: QARequest,
    db: Session = Depends(get_db)
):
    """
    문서 기반 질문 응답

    Args:
        request: Q&A 요청 (document_id, question)
        db: 데이터베이스 세션

    Returns:
        question: 질문
        answer: 답변
        context: 사용된 컨텍스트
    """
    # 문서 조회
    document = db.query(Document).filter(Document.id == request.document_id).first()

    if not document:
        raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다.")

    if not document.content:
        raise HTTPException(status_code=400, detail="문서에 텍스트 내용이 없습니다.")

    # Q&A 서비스
    qa_service = QAService()

    try:
        # 답변 생성
        answer, context = await qa_service.answer_question(
            full_text=document.content,
            question=request.question
        )

        return {
            "document_id": document.id,
            "question": request.question,
            "answer": answer,
            "context_used": context[:500] + "..." if len(context) > 500 else context,
            "message": "답변 생성 완료"
        }

    except ValueError as e:
        # OpenAI API 관련 에러 (인증, 사용량 제한 등)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # 기타 예상치 못한 에러
        raise HTTPException(status_code=500, detail=f"답변 생성 중 오류 발생: {str(e)}")
