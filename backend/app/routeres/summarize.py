# PDF file upload and summarize the content

from fastapi import APIRouter, UploadFile, File
import tempfile
from app.services.pdf_service import extract_text_from_pdf
from app.services.llm_service import summarize_text

router = APIRouter()

@router.post("/summarize")
async def summarize_pdf(file: UploadFile = File(...)):
    # 임시 파일 저장
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    
    # PDF -> 텍스트
    text = extract_text_from_pdf(tmp_path)

    # 요약 생성
    summary = summarize_text(text)

    return {"summary": summary}
