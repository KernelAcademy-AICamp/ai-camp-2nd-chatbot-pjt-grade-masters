from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Document, Quiz, QuizResult, WrongAnswer
from app.services.quiz_service import QuizService
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter()

class QuizGenerateRequest(BaseModel):
    """퀴즈 생성 요청 모델"""
    document_id: str
    num_items: int = 10

class QuizSubmitRequest(BaseModel):
    """퀴즈 제출 요청 모델"""
    quiz_id: str
    answers: List[Dict[str, Any]]

@router.post("/generate")
async def generate_quiz(
    request: QuizGenerateRequest,
    db: Session = Depends(get_db)
):
    """
    문서 기반 퀴즈 생성

    Args:
        request: 퀴즈 생성 요청 (document_id, num_items)
        db: 데이터베이스 세션

    Returns:
        quiz_id: 생성된 퀴즈 ID
        items: 퀴즈 문항 목록
    """
    # 문서 조회
    document = db.query(Document).filter(Document.id == request.document_id).first()

    if not document:
        raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다.")

    if not document.content:
        raise HTTPException(status_code=400, detail="문서에 텍스트 내용이 없습니다.")

    # 퀴즈 생성 서비스
    quiz_service = QuizService()

    try:
        # 퀴즈 생성
        quiz_items = await quiz_service.generate_quiz(document.content, request.num_items)

        # 데이터베이스에 저장
        quiz = Quiz(
            document_id=document.id,
            items=quiz_items
        )

        db.add(quiz)
        db.commit()
        db.refresh(quiz)

        return {
            "quiz_id": quiz.id,
            "document_id": document.id,
            "items": quiz.items,
            "message": "퀴즈 생성 완료"
        }

    except ValueError as e:
        # OpenAI API 관련 에러 (인증, 사용량 제한 등)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # 기타 예상치 못한 에러
        raise HTTPException(status_code=500, detail=f"퀴즈 생성 중 오류 발생: {str(e)}")

@router.post("/submit")
async def submit_quiz(
    request: QuizSubmitRequest,
    db: Session = Depends(get_db)
):
    """
    퀴즈 제출 및 채점

    Args:
        request: 퀴즈 제출 요청 (quiz_id, answers)
        db: 데이터베이스 세션

    Returns:
        result_id: 결과 ID
        results: 채점 결과
        accuracy: 정확도
    """
    # 퀴즈 조회
    quiz = db.query(Quiz).filter(Quiz.id == request.quiz_id).first()

    if not quiz:
        raise HTTPException(status_code=404, detail="퀴즈를 찾을 수 없습니다.")

    # 퀴즈 채점 서비스
    quiz_service = QuizService()

    try:
        # 채점
        results, accuracy = await quiz_service.grade_quiz(quiz.items, request.answers)

        # 결과 저장
        quiz_result = QuizResult(
            quiz_id=quiz.id,
            answers=request.answers,
            results=results,
            accuracy=accuracy
        )

        db.add(quiz_result)
        db.commit()
        db.refresh(quiz_result)

        # 오답 노트 생성
        for result in results:
            if not result["is_correct"]:
                idx = result["index"]
                quiz_item = quiz.items[idx]

                # 정답 추출 (MCQ vs short)
                if quiz_item["type"] == "mcq":
                    correct_answer = quiz_item["options"][quiz_item["answer_index"]]
                else:  # short
                    correct_answer = quiz_item.get("answer", "")

                # 사용자 답안 추출
                user_answer_text = str(result.get("user_answer", ""))
                if quiz_item["type"] == "mcq" and isinstance(result.get("user_answer"), int):
                    # MCQ의 경우 선택지 텍스트로 변환
                    ans_idx = result.get("user_answer")
                    if ans_idx is not None and 0 <= ans_idx < len(quiz_item["options"]):
                        user_answer_text = quiz_item["options"][ans_idx]

                wrong_answer = WrongAnswer(
                    quiz_result_id=quiz_result.id,
                    question_id=str(idx),
                    question=quiz_item["question"],
                    user_answer=user_answer_text,
                    correct_answer=correct_answer,
                    explanation=result.get("feedback", "")
                )
                db.add(wrong_answer)

        db.commit()

        return {
            "result_id": quiz_result.id,
            "quiz_id": quiz.id,
            "results": results,
            "accuracy": accuracy,
            "message": "채점 완료"
        }

    except ValueError as e:
        # OpenAI API 관련 에러
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # 기타 예상치 못한 에러
        raise HTTPException(status_code=500, detail=f"채점 중 오류 발생: {str(e)}")

@router.get("/{quiz_id}")
async def get_quiz(quiz_id: str, db: Session = Depends(get_db)):
    """
    퀴즈 정보 조회

    Args:
        quiz_id: 퀴즈 ID
        db: 데이터베이스 세션

    Returns:
        퀴즈 정보
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()

    if not quiz:
        raise HTTPException(status_code=404, detail="퀴즈를 찾을 수 없습니다.")

    return {
        "quiz_id": quiz.id,
        "document_id": quiz.document_id,
        "items": quiz.items,
        "created_at": quiz.created_at
    }

@router.get("/result/{result_id}")
async def get_quiz_result(result_id: str, db: Session = Depends(get_db)):
    """
    퀴즈 결과 조회

    Args:
        result_id: 결과 ID
        db: 데이터베이스 세션

    Returns:
        결과 정보
    """
    result = db.query(QuizResult).filter(QuizResult.id == result_id).first()

    if not result:
        raise HTTPException(status_code=404, detail="결과를 찾을 수 없습니다.")

    return {
        "result_id": result.id,
        "quiz_id": result.quiz_id,
        "answers": result.answers,
        "results": result.results,
        "accuracy": result.accuracy,
        "created_at": result.created_at
    }

@router.get("/wrong-answers/{result_id}")
async def get_wrong_answers(result_id: str, db: Session = Depends(get_db)):
    """
    오답 노트 조회

    Args:
        result_id: 결과 ID
        db: 데이터베이스 세션

    Returns:
        오답 목록
    """
    wrong_answers = db.query(WrongAnswer).filter(
        WrongAnswer.quiz_result_id == result_id
    ).all()

    return {
        "result_id": result_id,
        "wrong_answers": [
            {
                "id": wa.id,
                "question": wa.question,
                "user_answer": wa.user_answer,
                "correct_answer": wa.correct_answer,
                "explanation": wa.explanation,
                "created_at": wa.created_at
            }
            for wa in wrong_answers
        ]
    }
