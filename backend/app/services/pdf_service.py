from app.services.openai_service import OpenAIService
from langchain_community.document_loaders import PyPDFLoader
import fitz
from PIL import Image
import io
import base64
import os

class PDFService:
    """PDF 처리 서비스 (Streamlit 앱 로직 이식)"""

    def __init__(self):
        self.openai_service = OpenAIService()

    async def extract_text(self, pdf_path: str) -> str:
        """
        PDF에서 텍스트 추출 (PyPDFLoader 사용)

        Args:
            pdf_path: PDF 파일 경로

        Returns:
            추출된 텍스트
        """
        try:
            loader = PyPDFLoader(pdf_path)
            pages = loader.load()

            if not pages:
                return ""

            text_parts = []
            for page in pages:
                content = (page.page_content or "").strip()
                text_parts.append(content)

            result = "\n\n".join(text_parts).strip()
            return result

        except Exception as e:
            raise Exception(f"텍스트 추출 중 오류 발생: {str(e)}")

    async def extract_text_with_ocr(self, pdf_path: str) -> str:
        """
        PyMuPDF로 PDF→이미지 렌더링 후 GPT-4o Vision OCR 수행
        (Streamlit extract_text_with_ocr_pymupdf 함수 이식)

        Args:
            pdf_path: PDF 파일 경로

        Returns:
            OCR로 추출된 텍스트
        """
        try:
            doc = fitz.open(pdf_path)
            all_texts = []

            for i, page in enumerate(doc, 1):
                # 페이지를 이미지로 렌더링 (200 DPI)
                pix = page.get_pixmap(dpi=200)
                img = Image.open(io.BytesIO(pix.tobytes("png")))

                # Base64 인코딩
                buf = io.BytesIO()
                img.save(buf, format="PNG")
                img_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

                # GPT-4o Vision으로 OCR
                text = await self.openai_service.vision_completion(
                    text="아래 이미지에서 보이는 텍스트를 가능한 한 정확히 추출해줘.",
                    image_base64=img_b64
                )

                all_texts.append(text.strip())

            return "\n\n".join(all_texts)

        except Exception as e:
            raise Exception(f"OCR 처리 중 오류 발생: {str(e)}")

    async def analyze_images(self, pdf_path: str) -> list:
        """
        PDF 내 이미지/그래프/도식 분석
        (Streamlit detect_figure_heavy_pages, describe_page_with_gpt4o_image 함수 이식)

        Args:
            pdf_path: PDF 파일 경로

        Returns:
            이미지 분석 결과 목록
        """
        try:
            doc = fitz.open(pdf_path)
            analysis_results = []

            for page_num, page in enumerate(doc):
                # 텍스트가 적거나 이미지가 있는 페이지를 찾음
                text_length = len(page.get_text().strip())
                images = page.get_images(full=True)

                if text_length < 200 or len(images) >= 1:
                    # 페이지를 이미지로 렌더링
                    pix = page.get_pixmap(dpi=200)
                    img = Image.open(io.BytesIO(pix.tobytes("png")))

                    # Base64 인코딩
                    buf = io.BytesIO()
                    img.save(buf, format="PNG")
                    img_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

                    # GPT-4o Vision으로 이미지 분석
                    prompt = (
                        "이미지의 그래프/도식/표를 한국어로 요약해줘. 핵심 포인트 3~5개 불릿:\n"
                        "- 그래프: 축 의미/추세/최대·최소/비교\n"
                        "- 도식: 노드/관계/절차\n"
                        "- 표: 핵심 행·열과 결론"
                    )

                    description = await self.openai_service.vision_completion(
                        text=prompt,
                        image_base64=img_b64
                    )

                    analysis_results.append({
                        "page": page_num + 1,
                        "description": description.strip()
                    })

            return analysis_results

        except Exception as e:
            raise Exception(f"이미지 분석 중 오류 발생: {str(e)}")
