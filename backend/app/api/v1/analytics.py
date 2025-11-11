from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.core.database import get_db
from app.models.models import Document, Quiz, QuizResult, WrongAnswer
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter()

@router.get("/overview")
async def get_analytics_overview(
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """
    학습 분석 개요

    Args:
        days: 조회 기간 (일)
        db: 데이터베이스 세션

    Returns:
        총 문서 수, 퀴즈 수, 평균 정확도, 총 오답 수 등
    """
    # 기간 계산
    start_date = datetime.now() - timedelta(days=days)

    # 총 문서 수
    total_documents = db.query(func.count(Document.id)).scalar()

    # 총 퀴즈 수
    total_quizzes = db.query(func.count(Quiz.id)).scalar()

    # 총 퀴즈 결과 수
    total_results = db.query(func.count(QuizResult.id)).scalar()

    # 평균 정확도
    avg_accuracy = db.query(func.avg(QuizResult.accuracy)).scalar() or 0.0

    # 총 오답 수
    total_wrong_answers = db.query(func.count(WrongAnswer.id)).scalar()

    # 최근 활동
    recent_documents = db.query(func.count(Document.id)).filter(
        Document.created_at >= start_date
    ).scalar()

    recent_quizzes = db.query(func.count(QuizResult.id)).filter(
        QuizResult.created_at >= start_date
    ).scalar()

    return {
        "period_days": days,
        "total_documents": total_documents,
        "total_quizzes": total_quizzes,
        "total_quiz_attempts": total_results,
        "average_accuracy": round(avg_accuracy * 100, 1) if avg_accuracy else 0.0,
        "total_wrong_answers": total_wrong_answers,
        "recent_documents": recent_documents,
        "recent_quiz_attempts": recent_quizzes,
        "message": "학습 분석 개요 조회 완료"
    }

@router.get("/progress")
async def get_learning_progress(
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    학습 진행 상황

    Args:
        limit: 조회할 최근 결과 수
        db: 데이터베이스 세션

    Returns:
        최근 퀴즈 결과 및 정확도 추이
    """
    # 최근 퀴즈 결과
    recent_results = db.query(QuizResult).order_by(
        desc(QuizResult.created_at)
    ).limit(limit).all()

    results_data = []
    for result in recent_results:
        quiz = db.query(Quiz).filter(Quiz.id == result.quiz_id).first()
        document = None
        if quiz:
            document = db.query(Document).filter(
                Document.id == quiz.document_id
            ).first()

        results_data.append({
            "result_id": result.id,
            "quiz_id": result.quiz_id,
            "document_name": document.filename if document else "Unknown",
            "accuracy": round(result.accuracy * 100, 1),
            "created_at": result.created_at.isoformat() if result.created_at else None
        })

    # 정확도 추이 계산
    if results_data:
        accuracies = [r["accuracy"] for r in results_data]
        avg_accuracy = sum(accuracies) / len(accuracies)
        trend = "improving" if len(accuracies) > 1 and accuracies[0] > accuracies[-1] else "stable"
    else:
        avg_accuracy = 0.0
        trend = "no_data"

    return {
        "recent_results": results_data,
        "average_accuracy": round(avg_accuracy, 1),
        "trend": trend,
        "total_count": len(results_data),
        "message": "학습 진행 상황 조회 완료"
    }

@router.get("/weak-topics")
async def get_weak_topics(
    min_attempts: int = Query(default=2, ge=1),
    db: Session = Depends(get_db)
):
    """
    취약 주제 분석

    Args:
        min_attempts: 최소 시도 횟수
        db: 데이터베이스 세션

    Returns:
        정확도가 낮은 문서/주제 목록
    """
    # 문서별 평균 정확도 계산
    results = db.query(
        Quiz.document_id,
        func.count(QuizResult.id).label('attempt_count'),
        func.avg(QuizResult.accuracy).label('avg_accuracy')
    ).join(
        QuizResult, Quiz.id == QuizResult.quiz_id
    ).group_by(
        Quiz.document_id
    ).having(
        func.count(QuizResult.id) >= min_attempts
    ).order_by(
        func.avg(QuizResult.accuracy).asc()
    ).limit(10).all()

    weak_topics = []
    for document_id, attempt_count, avg_accuracy in results:
        document = db.query(Document).filter(Document.id == document_id).first()

        if document:
            weak_topics.append({
                "document_id": document_id,
                "document_name": document.filename,
                "attempt_count": attempt_count,
                "average_accuracy": round((avg_accuracy or 0.0) * 100, 1),
                "recommendation": "추가 학습 권장" if (avg_accuracy or 0) < 0.7 else "복습 권장"
            })

    return {
        "weak_topics": weak_topics,
        "total_count": len(weak_topics),
        "message": "취약 주제 분석 완료"
    }

@router.get("/wrong-answer-analysis")
async def analyze_wrong_answers(
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    오답 분석

    Args:
        limit: 조회할 오답 수
        db: 데이터베이스 세션

    Returns:
        최근 오답 목록 및 패턴 분석
    """
    # 최근 오답 목록
    wrong_answers = db.query(WrongAnswer).order_by(
        desc(WrongAnswer.created_at)
    ).limit(limit).all()

    wrong_answer_data = []
    for wa in wrong_answers:
        quiz_result = db.query(QuizResult).filter(
            QuizResult.id == wa.quiz_result_id
        ).first()

        quiz = None
        document = None
        if quiz_result:
            quiz = db.query(Quiz).filter(Quiz.id == quiz_result.quiz_id).first()
            if quiz:
                document = db.query(Document).filter(
                    Document.id == quiz.document_id
                ).first()

        wrong_answer_data.append({
            "wrong_answer_id": wa.id,
            "document_name": document.filename if document else "Unknown",
            "question": wa.question,
            "user_answer": wa.user_answer,
            "correct_answer": wa.correct_answer,
            "explanation": wa.explanation,
            "created_at": wa.created_at.isoformat() if wa.created_at else None
        })

    # 오답 패턴 분석
    total_wrong = len(wrong_answer_data)
    pattern_analysis = {
        "total_wrong_answers": total_wrong,
        "recent_mistakes": wrong_answer_data[:5] if wrong_answer_data else [],
        "recommendation": "오답 노트를 복습하여 취약점을 보완하세요." if total_wrong > 0 else "잘하고 있습니다!"
    }

    return {
        "wrong_answers": wrong_answer_data,
        "pattern_analysis": pattern_analysis,
        "total_count": total_wrong,
        "message": "오답 분석 완료"
    }

@router.get("/study-time")
async def get_study_time_analysis(
    days: int = Query(default=7, ge=1, le=30),
    db: Session = Depends(get_db)
):
    """
    학습 시간 분석

    Args:
        days: 조회 기간 (일)
        db: 데이터베이스 세션

    Returns:
        일별 학습 활동 통계
    """
    start_date = datetime.now() - timedelta(days=days)

    # 일별 퀴즈 시도 횟수
    daily_stats = db.query(
        func.date(QuizResult.created_at).label('date'),
        func.count(QuizResult.id).label('quiz_count'),
        func.avg(QuizResult.accuracy).label('avg_accuracy')
    ).filter(
        QuizResult.created_at >= start_date
    ).group_by(
        func.date(QuizResult.created_at)
    ).order_by(
        func.date(QuizResult.created_at).desc()
    ).all()

    daily_data = []
    for date, quiz_count, avg_accuracy in daily_stats:
        daily_data.append({
            "date": str(date),
            "quiz_attempts": quiz_count,
            "average_accuracy": round((avg_accuracy or 0.0) * 100, 1)
        })

    total_attempts = sum(d["quiz_attempts"] for d in daily_data)
    active_days = len(daily_data)

    return {
        "period_days": days,
        "daily_stats": daily_data,
        "total_quiz_attempts": total_attempts,
        "active_days": active_days,
        "average_daily_attempts": round(total_attempts / days, 1) if days > 0 else 0,
        "message": "학습 시간 분석 완료"
    }
