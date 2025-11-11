#!/usr/bin/env python3
"""API 테스트 스크립트"""

import requests
import json
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# 한글 폰트 설정 (macOS 기본 폰트 사용)
try:
    # macOS 시스템 폰트 경로
    font_paths = [
        "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
        "/System/Library/Fonts/AppleSDGothicNeo.ttc",
        "/Library/Fonts/Arial Unicode.ttf"
    ]

    font_registered = False
    for font_path in font_paths:
        if os.path.exists(font_path):
            try:
                pdfmetrics.registerFont(TTFont('Korean', font_path))
                font_registered = True
                print(f"✅ 한글 폰트 등록 완료: {font_path}")
                break
            except Exception as e:
                print(f"❌ 폰트 등록 실패 ({font_path}): {e}")
                continue

    if not font_registered:
        print("⚠️  한글 폰트를 찾을 수 없습니다. 영어로 테스트합니다.")
        use_korean = False
    else:
        use_korean = True
except Exception as e:
    print(f"⚠️  폰트 설정 오류: {e}")
    use_korean = False

def create_test_pdf(filename="/tmp/test_python.pdf"):
    """테스트용 PDF 파일 생성"""
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter

    if use_korean:
        # 한글 콘텐츠
        c.setFont("Korean", 16)
        c.drawString(100, height - 100, "파이썬 프로그래밍 기초")

        c.setFont("Korean", 12)
        y = height - 150

        lines = [
            "",
            "1. 변수와 데이터 타입",
            "파이썬에서 변수는 값을 저장하는 공간입니다.",
            "주요 데이터 타입:",
            "  - 정수형 (int): 1, 2, 3",
            "  - 실수형 (float): 3.14, 2.5",
            "  - 문자열 (str): 'Hello', 'World'",
            "  - 불린 (bool): True, False",
            "",
            "2. 제어문",
            "조건문과 반복문을 사용하여 프로그램 흐름을 제어합니다.",
            "if, elif, else로 조건 분기",
            "for, while로 반복 처리",
            "",
            "3. 함수",
            "함수는 def 키워드로 정의합니다.",
            "재사용 가능한 코드 블록을 만들 수 있습니다.",
            "",
            "4. 리스트와 딕셔너리",
            "리스트: [1, 2, 3, 4, 5]",
            "딕셔너리: {'name': 'John', 'age': 30}",
        ]
    else:
        # 영어 콘텐츠
        c.setFont("Helvetica-Bold", 16)
        c.drawString(100, height - 100, "Python Programming Basics")

        c.setFont("Helvetica", 12)
        y = height - 150

        lines = [
            "",
            "1. Variables and Data Types",
            "Variables store values in Python.",
            "Main data types:",
            "  - Integer (int): 1, 2, 3",
            "  - Float (float): 3.14, 2.5",
            "  - String (str): 'Hello', 'World'",
            "  - Boolean (bool): True, False",
            "",
            "2. Control Flow",
            "Control program flow with conditions and loops.",
            "if, elif, else for branching",
            "for, while for iteration",
            "",
            "3. Functions",
            "Functions are defined with the def keyword.",
            "Create reusable code blocks.",
            "",
            "4. Lists and Dictionaries",
            "List: [1, 2, 3, 4, 5]",
            "Dictionary: {'name': 'John', 'age': 30}",
        ]

    for line in lines:
        c.drawString(120, y, line)
        y -= 20

    c.save()
    print(f"✅ PDF 파일 생성 완료: {filename}")
    return filename

def test_pdf_upload(pdf_path, use_ocr=False, analyze_images=False):
    """PDF 업로드 테스트"""
    print(f"\n📤 PDF 업로드 테스트 (OCR: {use_ocr}, 이미지 분석: {analyze_images})")

    url = "http://localhost:9090/api/v1/pdf/upload"

    with open(pdf_path, 'rb') as f:
        files = {'file': (os.path.basename(pdf_path), f, 'application/pdf')}
        params = {
            'use_ocr': use_ocr,
            'analyze_images': analyze_images
        }

        response = requests.post(url, files=files, params=params)

    if response.status_code == 200:
        data = response.json()
        print(f"✅ 업로드 성공!")
        print(f"   Document ID: {data['document_id']}")
        print(f"   Filename: {data['filename']}")
        print(f"   OCR Used: {data['ocr_used']}")
        print(f"   Content Length: {len(data.get('content', ''))} 문자")
        if data.get('content'):
            print(f"   Content Preview: {data['content'][:200]}...")
        return data['document_id']
    else:
        print(f"❌ 업로드 실패: {response.status_code}")
        print(f"   Error: {response.text}")
        return None

def test_summary_generate(document_id):
    """요약 생성 테스트"""
    print(f"\n📝 요약 생성 테스트 (Document ID: {document_id})")

    url = "http://localhost:9090/api/v1/summary/generate"
    payload = {"document_id": document_id}

    response = requests.post(url, json=payload)

    if response.status_code == 200:
        data = response.json()
        print(f"✅ 요약 생성 성공!")
        print(f"   Summary ID: {data['summary_id']}")
        print(f"   Content:\n{data['content']}")
        return data['summary_id']
    else:
        print(f"❌ 요약 생성 실패: {response.status_code}")
        print(f"   Error: {response.text}")
        return None

def test_quiz_generate(document_id, num_items=4):
    """퀴즈 생성 테스트"""
    print(f"\n🎯 퀴즈 생성 테스트 (Document ID: {document_id}, 문항 수: {num_items})")

    url = "http://localhost:9090/api/v1/quiz/generate"
    payload = {
        "document_id": document_id,
        "num_items": num_items
    }

    response = requests.post(url, json=payload)

    if response.status_code == 200:
        data = response.json()
        print(f"✅ 퀴즈 생성 성공!")
        print(f"   Quiz ID: {data['quiz_id']}")
        print(f"   문항 수: {len(data['items'])}")

        for i, item in enumerate(data['items'], 1):
            print(f"\n   문항 {i} ({item['type']}):")
            print(f"   Q: {item['question']}")
            if item['type'] == 'mcq':
                for j, option in enumerate(item['options']):
                    marker = "✓" if j == item['answer_index'] else " "
                    print(f"      [{marker}] {j}. {option}")
            else:
                print(f"   A: {item['answer']}")
                print(f"   Keywords: {', '.join(item['rubric_keywords'])}")

        return data['quiz_id'], data['items']
    else:
        print(f"❌ 퀴즈 생성 실패: {response.status_code}")
        print(f"   Error: {response.text}")
        return None, None

def test_quiz_submit(quiz_id, quiz_items):
    """퀴즈 제출 및 채점 테스트"""
    print(f"\n📊 퀴즈 제출 및 채점 테스트 (Quiz ID: {quiz_id})")

    # 테스트 답안 생성 (일부러 틀린 답도 포함)
    answers = []
    for i, item in enumerate(quiz_items):
        if item['type'] == 'mcq':
            # 객관식: 정답 또는 오답 랜덤
            if i % 2 == 0:
                answer = item['answer_index']  # 정답
            else:
                answer = (item['answer_index'] + 1) % 4  # 오답
            answers.append({"index": i, "answer": answer})
        else:
            # 주관식: 키워드 일부만 포함
            keywords = item['rubric_keywords'][:2]
            answer = " ".join(keywords)
            answers.append({"index": i, "answer": answer})

    url = "http://localhost:9090/api/v1/quiz/submit"
    payload = {
        "quiz_id": quiz_id,
        "answers": answers
    }

    response = requests.post(url, json=payload)

    if response.status_code == 200:
        data = response.json()
        print(f"✅ 채점 완료!")
        print(f"   Result ID: {data['result_id']}")
        print(f"   정확도: {data['accuracy'] * 100:.1f}%")

        for result in data['results']:
            status = "✅ 정답" if result['is_correct'] else "❌ 오답"
            print(f"\n   문항 {result['index'] + 1}: {status} (점수: {result['score']})")
            print(f"   피드백: {result['feedback']}")

        return data['result_id']
    else:
        print(f"❌ 채점 실패: {response.status_code}")
        print(f"   Error: {response.text}")
        return None

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 학점마스터 API 종합 테스트")
    print("=" * 60)

    # 1. PDF 파일 생성
    pdf_path = create_test_pdf()

    # 2. PDF 업로드
    document_id = test_pdf_upload(pdf_path, use_ocr=False, analyze_images=False)

    if document_id:
        # 3. 요약 생성
        summary_id = test_summary_generate(document_id)

        # 4. 퀴즈 생성
        quiz_id, quiz_items = test_quiz_generate(document_id, num_items=3)

        if quiz_id and quiz_items:
            # 5. 퀴즈 제출 및 채점
            result_id = test_quiz_submit(quiz_id, quiz_items)

    print("\n" + "=" * 60)
    print("✅ 테스트 완료!")
    print("=" * 60)
