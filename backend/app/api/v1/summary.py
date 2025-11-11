from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Document, Summary
from app.services.summary_service import SummaryService
from pydantic import BaseModel

router = APIRouter()

class SummaryRequest(BaseModel):
    """요약 생성 요청 모델"""
    document_id: str

@router.post("/generate")
async def generate_summary(
    request: SummaryRequest,
    db: Session = Depends(get_db)
):
    """
    문서 요약 생성

    Args:
        request: 요약 생성 요청 (document_id)
        db: 데이터베이스 세션

    Returns:
        summary_id: 생성된 요약 ID
        content: 요약 내용
    """
    # 문서 조회
    document = db.query(Document).filter(Document.id == request.document_id).first()

    if not document:
        raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다.")

    if not document.content:
        raise HTTPException(status_code=400, detail="문서에 텍스트 내용이 없습니다.")

    # 요약 생성 서비스
    summary_service = SummaryService()

    try:
        # 요약 생성
        summary_content = await summary_service.generate_summary(document.content)

        # 데이터베이스에 저장
        summary = Summary(
            document_id=document.id,
            content=summary_content
        )

        db.add(summary)
        db.commit()
        db.refresh(summary)

        return {
            "summary_id": summary.id,
            "document_id": document.id,
            "content": summary.content,
            "message": "요약 생성 완료"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"요약 생성 중 오류 발생: {str(e)}")

@router.get("/{summary_id}")
async def get_summary(summary_id: str, db: Session = Depends(get_db)):
    """
    요약 정보 조회

    Args:
        summary_id: 요약 ID
        db: 데이터베이스 세션

    Returns:
        요약 정보
    """
    summary = db.query(Summary).filter(Summary.id == summary_id).first()

    if not summary:
        raise HTTPException(status_code=404, detail="요약을 찾을 수 없습니다.")

    return {
        "summary_id": summary.id,
        "document_id": summary.document_id,
        "content": summary.content,
        "created_at": summary.created_at
    }

@router.get("/document/{document_id}")
async def get_summary_by_document(document_id: str, db: Session = Depends(get_db)):
    """
    문서의 요약 조회

    Args:
        document_id: 문서 ID
        db: 데이터베이스 세션

    Returns:
        요약 정보
    """
    summary = db.query(Summary).filter(Summary.document_id == document_id).first()

    if not summary:
        raise HTTPException(status_code=404, detail="해당 문서의 요약을 찾을 수 없습니다.")

    return {
        "summary_id": summary.id,
        "document_id": summary.document_id,
        "content": summary.content,
        "created_at": summary.created_at
    }
