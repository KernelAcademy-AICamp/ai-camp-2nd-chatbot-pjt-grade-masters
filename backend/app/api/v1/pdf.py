from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.models import Document
from app.services.pdf_service import PDFService
import os
import uuid

router = APIRouter()

@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    use_ocr: bool = False,
    analyze_images: bool = False,
    db: Session = Depends(get_db)
):
    """
    PDF 파일 업로드 및 처리

    Args:
        file: 업로드할 PDF 파일
        use_ocr: OCR 사용 여부 (스캔본/이미지 PDF인 경우)
        analyze_images: 이미지/그래프 분석 여부
        db: 데이터베이스 세션

    Returns:
        document_id: 생성된 문서 ID
        filename: 파일명
        content: 추출된 텍스트
        ocr_used: OCR 사용 여부
        image_analysis: 이미지 분석 결과
    """
    # 파일 확장자 검증
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="PDF 파일만 업로드 가능합니다.")

    # 파일 크기 검증
    file_content = await file.read()
    if len(file_content) > settings.max_upload_size:
        raise HTTPException(status_code=400, detail="파일 크기가 너무 큽니다. (최대 50MB)")

    # 파일 저장
    file_id = str(uuid.uuid4())
    file_path = os.path.join(settings.upload_dir, f"{file_id}.pdf")

    os.makedirs(settings.upload_dir, exist_ok=True)

    with open(file_path, "wb") as f:
        f.write(file_content)

    # PDF 처리 서비스
    pdf_service = PDFService()

    try:
        # 텍스트 추출
        if use_ocr:
            content = await pdf_service.extract_text_with_ocr(file_path)
            ocr_used = True
        else:
            content = await pdf_service.extract_text(file_path)
            ocr_used = False

        # 이미지/그래프 분석
        image_analysis = None
        if analyze_images:
            image_analysis = await pdf_service.analyze_images(file_path)

        # 데이터베이스에 저장
        document = Document(
            id=file_id,
            filename=file.filename,
            content=content,
            ocr_used=ocr_used,
            image_analysis=image_analysis,
            file_path=file_path
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        return {
            "document_id": document.id,
            "filename": document.filename,
            "content": document.content,
            "ocr_used": document.ocr_used,
            "image_analysis": document.image_analysis,
            "message": "PDF 업로드 및 처리 완료"
        }

    except Exception as e:
        # 오류 발생 시 파일 삭제
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"PDF 처리 중 오류 발생: {str(e)}")

@router.get("/{document_id}")
async def get_document(document_id: str, db: Session = Depends(get_db)):
    """
    문서 정보 조회

    Args:
        document_id: 문서 ID
        db: 데이터베이스 세션

    Returns:
        문서 정보
    """
    document = db.query(Document).filter(Document.id == document_id).first()

    if not document:
        raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다.")

    return {
        "document_id": document.id,
        "filename": document.filename,
        "content": document.content,
        "ocr_used": document.ocr_used,
        "image_analysis": document.image_analysis,
        "created_at": document.created_at
    }
