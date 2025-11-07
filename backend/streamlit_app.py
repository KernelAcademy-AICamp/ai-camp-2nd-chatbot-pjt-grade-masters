# 

import os
import io
import re
import tempfile
import base64
import streamlit as st
from dotenv import load_dotenv
from openai import OpenAI
from langchain_community.document_loaders import PyPDFLoader
import fitz
from PIL import Image
import json



# --- 환경 변수 ---
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    st.error("OPENAI_API_KEY가 없습니다. .env에 키를 넣어주세요.")
    st.stop()
client = OpenAI(api_key=OPENAI_API_KEY)

# --- OCR (gpt-4o 비전) ---
def extract_text_with_ocr_pymupdf(pdf_path: str):
    """PyMuPDF로 PDF→이미지 렌더링 후 GPT-4o Vision OCR 수행"""
    try:
        doc = fitz.open(pdf_path)
        all_texts = []
        for i, page in enumerate(doc, 1):
            pix = page.get_pixmap(dpi=200)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            img_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

            response = client.chat.completions.create(
                model="gpt-4o",
                temperature=0,
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "아래 이미지에서 보이는 텍스트를 가능한 한 정확히 추출해줘."},
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img_b64}"}}
                    ]
                }],
                max_tokens=2048
            )
            text = (response.choices[0].message.content or "").strip()
            all_texts.append(text)
            st.write(f"📄 페이지 {i}/{len(doc)} OCR 완료")
        return "\n\n".join(all_texts), None
    except Exception as e:
        return "", f"PyMuPDF OCR 에러: {str(e)}"

# --- PDF 텍스트 추출 ---
def extract_text_from_pdf(uploaded_file, use_ocr: bool = False) -> tuple[str, str | None]:
    tmp_path = None
    try:
        try:
            uploaded_file.seek(0)
        except Exception:
            pass

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(uploaded_file.read())
            tmp_path = tmp.name

        # 1) 텍스트 레이어 우선 시도
        try:
            loader = PyPDFLoader(tmp_path)
            pages = loader.load()
        except Exception as e:
            pages = []
            st.write(f"PyPDFLoader 에러: {e}")

        if not pages:
            if use_ocr:
                return extract_text_with_ocr_pymupdf(tmp_path)
            return "", "PDF에 페이지가 없습니다."

        text_parts = []
        for i, page in enumerate(pages):
            content = (page.page_content or "").strip()
            text_parts.append(content)
            st.write(f"페이지 {i+1} 텍스트 길이: {len(content)} 문자")

        result = ("\n\n".join(text_parts)).strip()

        # 2) 텍스트가 거의 없으면 OCR 폴백
        if (not result or len(result) < 50) and use_ocr:
            st.info("텍스트가 거의 없어 OCR을 시도합니다...")
            return extract_text_with_ocr_pymupdf(tmp_path)

        return result, None

    except Exception as e:
        if use_ocr and tmp_path:
            try:
                return extract_text_with_ocr_pymupdf(tmp_path)
            except Exception:
                pass
        return "", str(e)
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except Exception:
                pass

# --- 청킹/요약 ---
def chunk_text(text: str, max_chars: int = 6000) -> list[str]:
    if not text:
        return []
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks, buf = [], ""
    for p in paragraphs:
        if len(buf) + len(p) + 2 <= max_chars:
            buf = f"{buf}\n\n{p}" if buf else p
        else:
            chunks.append(buf)
            buf = p
    if buf:
        chunks.append(buf)
    safe_chunks = []
    for c in chunks:
        if len(c) <= max_chars:
            safe_chunks.append(c)
        else:
            for i in range(0, len(c), max_chars):
                safe_chunks.append(c[i : i + max_chars])
    return safe_chunks

# OpenAI SDK 호환 위해 원형 유지
def gpt_summarize_k5(text: str) -> str:
    prompt = (
        "다음 학습 자료를 한국어로 **5줄 이내**로 핵심만 요약해줘.\n"
        "불필요한 예시는 빼고, 핵심 개념/정의/식 위주로 정리해줘.\n\n"
        f"[본문]\n{text}"
    )
    res = client.chat.completions.create(
        model="gpt-4o",
        temperature=0.2,
        messages=[{"role": "user", "content": prompt}],
    )
    return (res.choices[0].message.content or "").strip()

def summarize_long_text(text: str) -> str:
    chunks = chunk_text(text)
    if not chunks:
        return "요약할 텍스트가 없습니다."
    if len(chunks) == 1:
        return gpt_summarize_k5(chunks[0])
    part_summaries = []
    for i, c in enumerate(chunks, 1):
        with st.spinner(f"청크 요약 중... ({i}/{len(chunks)})"):
            part_summaries.append(gpt_summarize_k5(c))
    joined = "\n\n".join(part_summaries)
    final_prompt = (
        "아래 부분 요약들을 **통합**해서 한국어로 **정확히 5줄 이내**로 핵심만 압축해줘.\n"
        "중복 제거, 용어 통일, 수식/정의/핵심 논점만 남겨.\n\n"
        f"[부분 요약]\n{joined}"
    )
    res = client.chat.completions.create(
        model="gpt-4o",
        temperature=0.2,
        messages=[{"role": "user", "content": final_prompt}],
    )
    return (res.choices[0].message.content or "").strip()


# image도 인식 가능하도록
def detect_figure_heavy_pages(doc):
    pages = []
    for i, page in enumerate(doc):
        # 텍스트가 매우 적거나 이미지 개수가 많은 페이지를 선별
        if len(page.get_text().strip()) < 200 or len(page.get_images(full=True)) >= 1:
            pages.append(i)
    return pages

def describe_page_with_gpt4o_image(pix_png_b64: str) -> str:
    res = client.chat.completions.create(
        model="gpt-4o",
        temperature=0.2,
        messages=[{
            "role":"user",
            "content":[
                {"type":"text","text":
                 "이미지의 그래프/도식/표를 한국어로 요약해줘. 핵심 포인트 3~5개 불릿:\n"
                 "- 그래프: 축 의미/추세/최대·최소/비교\n"
                 "- 도식: 노드/관계/절차\n"
                 "- 표: 핵심 행·열과 결론\n"},
                {"type":"image_url","image_url":{"url": f"data:image/png;base64,{pix_png_b64}"}}
            ]
        }]
    )
    return (res.choices[0].message.content or "").strip()


def build_qa_context(full_text: str, question: str, max_ctx_chars: int = 16000) -> str:
    """
    임베딩 없이 동작하는 미니 RAG:
    - 문서를 청킹 → 질문과 키워드 겹치는 정도로 스코어링 → 상위 청크만 모아 컨텍스트 생성
    """
    chunks = chunk_text(full_text, max_chars=3000)  # 청크 크기(문자 기준)
    if not chunks:
        return ""

    # 아주 단순한 키워드 기반 스코어
    q_tokens = set(question.lower().split())
    scored = []
    for c in chunks:
        c_tokens = set(c.lower().split())
        overlap = len(q_tokens & c_tokens)
        # 너무 긴 청크는 약간 패널티
        score = overlap - 0.00001 * len(c)
        scored.append((score, c))

    # 상위 3~4개 컨텍스트로 묶기
    top_ctx = "\n\n---\n\n".join(
        [c for _, c in sorted(scored, key=lambda x: x[0], reverse=True)[:4]]
    )
    return top_ctx[:max_ctx_chars]


def answer_from_doc(full_text: str, question: str) -> str:
    """
    문서 근거 기반으로만 답변. 근거 없으면 '문서 근거로는 알 수 없습니다.'로 응답.
    """
    context = build_qa_context(full_text, question)
    system = (
        "너는 문서 기반 Q&A 조교다. 반드시 제공된 문서 컨텍스트 안에서만 답하라. "
        "문서에 근거가 없으면 '문서 근거로는 알 수 없습니다.'라고 답한다. "
        "허구 생성 금지, 간결하고 구체적으로 답하라."
    )
    user = f"[컨텍스트]\n{context}\n\n[질문]\n{question}"
    res = client.chat.completions.create(
        model="gpt-4o",
        temperature=0.1,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )
    return (res.choices[0].message.content or "").strip()


def _extract_json_block(text: str) -> str:
    """모델이 JSON 외 텍스트를 섞어줄 때 { ... } 블록만 안전 추출"""
    m = re.search(r"\{.*\}", text, flags=re.S)
    if not m:
        raise ValueError("모델 응답에서 JSON 블록을 찾지 못했습니다.")
    return m.group(0)


def extract_keypoints_for_quiz(full_text: str) -> str:
    """
    긴 문서에서 문제거리가 될 핵심 포인트를 먼저 뽑아낸 뒤(청킹→부분요약→통합),
    이를 기반으로 문제를 생성합니다. (정확도 ↑)
    """
    chunks = chunk_text(full_text, max_chars=4000)
    if not chunks:
        return ""
    bullets = []
    for i, c in enumerate(chunks, start=1):
        with st.spinner(f"문서 키포인트 수집 중... ({i}/{len(chunks)})"):
            prompt = (
                "너는 대학 교재로부터 문제거리가 될 '핵심 키포인트'를 뽑는 조교다.\n"
                "아래 본문에서 정의/핵심 개념/중요 규칙/예외/용어를 한국어 불릿 5~8개로만 정리해라.\n\n"
                f"[본문]\n{c}"
            )
            r = client.chat.completions.create(
                model="gpt-4o",
                temperature=0.2,
                messages=[{"role": "user", "content": prompt}],
            )
            bullets.append((r.choices[0].message.content or "").strip())
    merged = "\n\n".join(bullets)

    reducer = (
        "아래 부분 키포인트 목록을 중복 제거하고, 용어를 통일해 한국어로 15~25개 핵심 키포인트만 남겨라.\n"
        "불필요한 예시는 제외하고 '정의/원리/규칙/구조/절차' 중심으로 재정리하라.\n\n"
        f"[부분 키포인트]\n{merged}"
    )
    r2 = client.chat.completions.create(
        model="gpt-4o",
        temperature=0.2,
        messages=[{"role": "user", "content": reducer}],
    )
    return (r2.choices[0].message.content or "").strip()


def generate_quiz_from_doc(full_text: str, num_items: int = 4) -> dict:
    """
    전체 문서를 기반으로 객관식/주관식 문제 총 3~5문항 생성.
    - keypoints를 먼저 만들고, 그걸 근거로 문제를 요구해 정확도 ↑
    - 출력은 엄격한 JSON 스키마로 강제
    """
    num_items = max(3, min(5, int(num_items)))
    keypoints = extract_keypoints_for_quiz(full_text)
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
    r = client.chat.completions.create(
        model="gpt-4o",
        temperature=0.2,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = (r.choices[0].message.content or "").strip()
    data = json.loads(_extract_json_block(raw))

    # 간단 정합성 체크 및 잘린 항목 방어
    if not isinstance(data, dict) or "items" not in data:
        raise ValueError("퀴즈 JSON 형식이 올바르지 않습니다.")
    fixed = []
    for it in data["items"][:num_items]:
        if it.get("type") == "mcq":
            if "options" in it and isinstance(it["options"], list) and len(it["options"]) == 4 and "answer_index" in it:
                fixed.append(it)
        elif it.get("type") == "short":
            if "answer" in it and "rubric_keywords" in it:
                fixed.append(it)
    return {"items": fixed}


def grade_quiz(quiz: dict, user_answers: dict) -> dict:
    """
    사용자의 답안을 채점하고 점수/오답목록을 반환.
    - MCQ: 정답 인덱스 일치 여부
    - Short: rubric_keywords 매칭 비율로 간단 채점(0~1)
    """
    results = []
    correct_count = 0

    for idx, item in enumerate(quiz.get("items", [])):
        u = user_answers.get(idx)
        r = {"index": idx, "type": item["type"], "is_correct": False, "score": 0.0}

        if item["type"] == "mcq":
            gt = int(item["answer_index"])
            r["user"] = u if isinstance(u, int) else None
            r["gt"] = gt
            if r["user"] is not None and r["user"] == gt:
                r["is_correct"] = True
                r["score"] = 1.0

        elif item["type"] == "short":
            gt = item.get("answer", "")
            rub = [k.lower() for k in item.get("rubric_keywords", [])]
            utext = (u or "").strip().lower()
            hit = sum(1 for k in rub if k in utext)
            ratio = hit / max(1, len(rub))
            r["user"] = u or ""
            r["gt"] = gt
            r["rubric_hit"] = hit
            r["rubric_total"] = len(rub)
            r["score"] = round(ratio, 2)
            # 기준: 키워드 절반 이상 포함 시 정답 처리(간단 기준)
            r["is_correct"] = ratio >= 0.5

        if r["is_correct"]:
            correct_count += 1
        results.append(r)

    return {
        "results": results,
        "total": len(quiz.get("items", [])),
        "correct": correct_count,
        "accuracy": (correct_count / max(1, len(results))) if results else 0.0,
    }


def llm_feedback_for_wrong_answer(item: dict, user_answer: str) -> str:
    """
    오답/부분정답에 대해 GPT가 친절한 피드백을 생성.
    - 근거: 문제문/정답/루브릭/해설
    - 출력: 왜 틀렸는지, 채점 기준과 비교, 보완 포인트 3~5줄
    """
    q = item.get("question", "")
    if item["type"] == "mcq":
        options = ", ".join(item.get("options", []))
        gt_idx = int(item.get("answer_index", 0))
        gt_text = item.get("options", [""])[gt_idx] if item.get("options") else ""
        exp = item.get("explanation", "")
        user = f"(선택지 인덱스: {user_answer})"
        prompt = f"""
[문제]
{q}
[보기]
{options}

[당신의 답]
{user}

[정답]
{gt_idx}번: {gt_text}

[공식 해설]
{exp}

요구사항:
- 왜 틀렸는지 핵심 근거 1~2개
- 정답이 맞는 이유 1~2개
- 다음 공부 포인트 2~3개 (불릿)
- 한국어 5줄 이내
"""
    else:
        gt = item.get("answer", "")
        rub = ", ".join(item.get("rubric_keywords", []))
        exp = item.get("explanation", "")
        user = user_answer or ""
        prompt = f"""
[서술형 문제]
{q}

[당신의 답]
{user}

[기준 정답]
{gt}

[채점 키워드]
{rub}

[공식 해설]
{exp}

요구사항:
- 채점 키워드 기준으로 무엇이 부족했는지
- 정답의 핵심 표현을 어떻게 포함해야 하는지
- 보완 포인트 2~3개 (불릿)
- 한국어 5줄 이내
"""

    res = client.chat.completions.create(
        model="gpt-4o",
        temperature=0.2,
        messages=[{"role": "user", "content": prompt}],
    )
    return (res.choices[0].message.content or "").strip()












# --- UI ---
st.set_page_config(page_title="학점 마스터 - PDF 요약", page_icon="🎓", layout="centered")
st.title("🎓 학점 마스터 — PDF 통합 요약(5줄)")
st.caption("여러 PDF 업로드 → 텍스트 추출(OCR 선택) → 통합 5줄 요약")

# 1) 옵션 먼저
use_ocr = st.checkbox("OCR 사용 (이미지/스캔본 PDF인 경우)", value=False)
use_figures = st.checkbox("그림/그래프 요약도 반영", value=False)


# 2) 다중 업로드
uploaded_files = st.file_uploader(
    "PDF 파일을 여러 개 업로드하세요",
    type=["pdf"],
    accept_multiple_files=True
)

# 3) 실행 버튼
go = st.button("통합 요약하기", type="primary", disabled=not uploaded_files)

if go:
    all_texts = []
    for file in uploaded_files:
        with st.spinner(f"{file.name} 처리 중..."):
            text, error = extract_text_from_pdf(file, use_ocr=use_ocr)
            if error:
                st.error(f"{file.name} 처리 중 에러: {error}")
            elif not text:
                st.warning(f"{file.name}: 텍스트를 추출하지 못했습니다.")
            else:
                all_texts.append(text)

    # 1) 여러 PDF 텍스트 합치기
    merged_text = "\n\n".join([t for t in all_texts if t])

    # 2) (옵션) 그림/그래프 요약 반영
    #    - use_figures 체크박스를 UI 상단에 추가해둔 상태여야 합니다.
    if merged_text and 'use_figures' in locals() and use_figures:
        try:
            # 여러 파일 중 첫 번째 PDF만 예시로 처리 (원하면 for 루프로 모두 처리 가능)
            first_file = uploaded_files[0]
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                first_file.seek(0)
                tmp.write(first_file.read())
                pdf_path = tmp.name

            doc = fitz.open(pdf_path)
            cand_pages = detect_figure_heavy_pages(doc)  # 텍스트 적거나 이미지 많은 페이지
            figure_bullets = []

            # 과금/속도 절약: 최대 5페이지까지만 분석
            for idx in cand_pages[:5]:
                page = doc.load_page(idx)
                pix = page.get_pixmap(dpi=200)

                buf = io.BytesIO()
                Image.open(io.BytesIO(pix.tobytes("png"))).save(buf, format="PNG")
                b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

                with st.spinner(f"그림/그래프 분석 중... (p.{idx+1})"):
                    desc = describe_page_with_gpt4o_image(b64)
                if desc:
                    figure_bullets.append(f"[p.{idx+1}] {desc}")

            if figure_bullets:
                merged_text += "\n\n[그림/그래프 요약]\n" + "\n".join(figure_bullets)
                st.info(f"그림 요약 {len(figure_bullets)}건을 컨텍스트에 추가했습니다.")
        except Exception as e:
            st.warning(f"그림 요약 처리 중 문제 발생: {e}")

    # 3) 최종 처리
    if not merged_text:
        st.error("모든 파일에서 텍스트를 추출하지 못했습니다.")
    else:
        st.session_state["doc_text"] = merged_text
        with st.spinner("전체 문서 통합 요약 중..."):
            summary = summarize_long_text(merged_text)
        st.subheader("✅ 통합 5줄 요약")
        st.write(summary)
        with st.expander("통합 원문(일부) 보기"):
            st.text(merged_text[:100000])


# st.markdown("---")
# st.subheader("💬 문서 기반 질문/답변 (Q&A)")

# question = st.text_input("문서에 대해 궁금한 점을 질문하세요")
# ask_btn = st.button("질문하기", disabled=not question)

# if ask_btn:
#     doc_text = st.session_state.get("doc_text")
#     if not doc_text:
#         st.warning("먼저 PDF를 업로드하고 통합 요약(텍스트 추출)을 완료해주세요.")
#     else:
#         with st.spinner("문서에서 답을 찾는 중..."):
#             answer = answer_from_doc(doc_text, question)
#         st.success("답변")
#         st.write(answer)

#         # (선택) 모델에 전달한 컨텍스트 일부 확인용
#         with st.expander("모델에 전달된 컨텍스트(일부) 보기"):
#             st.text(build_qa_context(doc_text, question)[:8000])


# st.markdown("---")
# st.subheader("📝 문서 기반 문제 생성 (객관식/주관식)")

# n_items = st.slider("문항 수", 3, 5, 4, 1)
# gen_btn = st.button("문제 생성하기", type="primary")

# if gen_btn:
#     doc_text = st.session_state.get("doc_text")
#     if not doc_text:
#         st.warning("먼저 PDF를 업로드하고 통합 요약(텍스트 추출)을 완료해주세요.")
#     else:
#         try:
#             with st.spinner("문서 전체를 분석하고 문제를 생성 중..."):
#                 quiz = generate_quiz_from_doc(doc_text, num_items=n_items)

#             st.success("문제 생성 완료")
#             for idx, item in enumerate(quiz["items"], start=1):
#                 st.markdown(f"**Q{idx}. {item['question']}**")
#                 if item["type"] == "mcq":
#                     st.write(f"- 보기: {', '.join(item['options'])}")
#                     st.write(f"- 정답 인덱스: {item['answer_index']}")
#                 else:
#                     st.write(f"- 기준정답: {item['answer']}")
#                     st.write(f"- 채점키워드: {', '.join(item['rubric_keywords'])}")
#                 st.caption(f"해설: {item.get('explanation','(없음)')}")

#             # JSON 다운로드
#             st.download_button(
#                 "퀴즈 JSON 다운로드",
#                 data=json.dumps(quiz, ensure_ascii=False, indent=2),
#                 file_name="quiz.json",
#                 mime="application/json",
#             )
#         except Exception as e:
#             st.error(f"문제 생성 중 오류: {e}")


#############


st.markdown("---")
st.subheader("📝 문서 기반 문제 생성 → 사용자 풀이 → 채점/피드백")

# 1) 문제 생성
colA, colB = st.columns([2,1])
with colA:
    n_items = st.slider("문항 수", 3, 5, 4, 1)
with colB:
    gen_btn = st.button("문제 생성하기", type="primary")

if gen_btn:
    doc_text = st.session_state.get("doc_text")
    if not doc_text:
        st.warning("먼저 PDF를 업로드하고 통합 요약(텍스트 추출)을 완료해주세요.")
    else:
        with st.spinner("문서 전체를 분석하고 문제를 생성 중..."):
            quiz = generate_quiz_from_doc(doc_text, num_items=n_items)
        # 정답은 세션에만 저장(화면에 노출 X)
        st.session_state["quiz"] = quiz
        st.session_state["graded"] = False
        st.session_state["user_answers"] = {}
        st.success("문제 생성 완료! 아래에서 풀이 후 채점 버튼을 눌러주세요.")

# 2) 사용자 풀이 폼
quiz = st.session_state.get("quiz")
if quiz and not st.session_state.get("graded"):
    st.markdown("#### ✍️ 지금부터 답을 입력하세요")
    ua = st.session_state.get("user_answers", {})

    for idx, item in enumerate(quiz["items"]):
        st.markdown(f"**Q{idx+1}. {item['question']}**")

        if item["type"] == "mcq":
            options = item.get("options", [])
            ua[idx] = st.radio(
                "선택지",
                options=[f"{i}. {opt}" for i, opt in enumerate(options)],
                index=ua.get(idx, None) if isinstance(ua.get(idx, None), int) else 0,
                key=f"mcq_{idx}",
            )
            # 라벨을 인덱스로 변환
            try:
                ua[idx] = int(ua[idx].split(".")[0])
            except Exception:
                ua[idx] = None

        else:  # short
            ua[idx] = st.text_area(
                "서술형 답변을 작성하세요",
                value=ua.get(idx, ""),
                key=f"short_{idx}",
                height=100,
            )
        st.markdown("---")

    st.session_state["user_answers"] = ua
    submit = st.button("채점하기", type="primary")
    if submit:
        with st.spinner("채점 중..."):
            report = grade_quiz(quiz, ua)
        st.session_state["report"] = report
        st.session_state["graded"] = True
        st.success(f"채점 완료! 정답 {report['correct']} / {report['total']} (정확도 {round(report['accuracy']*100,1)}%)")

# 3) 채점 결과 + 정답/해설 공개 + 오답 피드백
if quiz and st.session_state.get("graded"):
    report = st.session_state.get("report", {})
    ua = st.session_state.get("user_answers", {})

    st.markdown("#### 📊 채점 결과")
    st.write(f"정답 {report.get('correct',0)} / {report.get('total',0)}  "
             f"(정확도 {round(report.get('accuracy',0)*100,1)}%)")

    st.markdown("#### ✅ 정답/해설 및 피드백")
    for r in report.get("results", []):
        item = quiz["items"][r["index"]]
        st.markdown(f"**Q{r['index']+1}. {item['question']}**")

        if item["type"] == "mcq":
            st.write(f"- 당신의 답: {ua.get(r['index'])}")
            st.write(f"- 정답 인덱스: {item['answer_index']}")
            st.caption(f"해설: {item.get('explanation','(없음)')}")
            if not r["is_correct"]:
                fb = llm_feedback_for_wrong_answer(item, str(ua.get(r['index'])))
                with st.expander("AI 피드백 보기"):
                    st.write(fb)

        else:  # short
            st.write(f"- 당신의 답: {ua.get(r['index'], '')}")
            st.write(f"- 기준 정답: {item.get('answer','')}")
            st.write(f"- 채점키워드: {', '.join(item.get('rubric_keywords', []))}")
            st.caption(f"해설: {item.get('explanation','(없음)')}")
            st.write(f"- 키워드 매칭: {r.get('rubric_hit',0)} / {r.get('rubric_total',0)}")
            if not r["is_correct"]:
                fb = llm_feedback_for_wrong_answer(item, ua.get(r['index'], ''))
                with st.expander("AI 피드백 보기"):
                    st.write(fb)

    # (선택) 다시 풀기/새 문제 만들기
    st.markdown("---")
    col1, col2 = st.columns(2)
    if col1.button("다시 풀기"):
        st.session_state["graded"] = False
    if col2.button("새 문제 생성"):
        for k in ["quiz", "graded", "user_answers", "report"]:
            st.session_state.pop(k, None)
