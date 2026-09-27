import json
import os
import requests

from typing import List

from fastapi import (
    APIRouter,
    HTTPException,
    Depends
)

from fastapi.security import OAuth2PasswordBearer

from pydantic import BaseModel

from sqlalchemy.orm import Session

from jose import JWTError, jwt

from ..database import get_db
from ..models import Interview, InterviewResult


router = APIRouter(
    prefix="/api/interview",
    tags=["Interview"]
)


# =========================================================
# AUTHENTICATION
# =========================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)


def get_current_user_id(
    token: str = Depends(oauth2_scheme)
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials"
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        return int(user_id)

    except (
        JWTError,
        ValueError,
        TypeError
    ):
        raise credentials_exception


# =========================================================
# START INTERVIEW
# =========================================================

class InterviewStartRequest(BaseModel):
    role: str
    difficulty: str
    interview_type: str


@router.post("/start")
def start_interview(
    data: InterviewStartRequest
):

    prompt = f"""
You are an expert AI interview coach.

Generate exactly ONE interview question for the candidate.

Candidate target role: {data.role}
Difficulty level: {data.difficulty}
Interview type: {data.interview_type}

Rules:
- Ask only one question.
- Make it realistic for an actual job interview.
- Match the selected role.
- Match the selected difficulty.
- If the interview type is Technical, ask a technical question.
- If the interview type is HR, ask an HR question.
- If the interview type is Behavioral, ask a behavioral question.
- If the interview type is Mixed, choose an appropriate interview question.
- Do not provide the answer.
- Do not provide explanations.
- Do not use numbering.
- Return only the interview question.
"""

    try:

        response = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={
                "model": "llama3.2:latest",
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        response.raise_for_status()

        result = response.json()

        question = result.get(
            "response",
            ""
        ).strip()

        if not question:
            raise HTTPException(
                status_code=500,
                detail="AI did not generate a question."
            )

        return {
            "role": data.role,
            "difficulty": data.difficulty,
            "interview_type": data.interview_type,
            "question": question
        }

    except requests.exceptions.ConnectionError:

        raise HTTPException(
            status_code=503,
            detail="Could not connect to Ollama. Make sure Ollama is running."
        )

    except requests.exceptions.Timeout:

        raise HTTPException(
            status_code=504,
            detail="Ollama took too long to generate a question."
        )

    except requests.exceptions.RequestException as error:

        raise HTTPException(
            status_code=500,
            detail=f"Ollama request failed: {error}"
        )


# =========================================================
# EVALUATE ANSWER
# =========================================================

class InterviewEvaluateRequest(BaseModel):
    role: str
    difficulty: str
    interview_type: str
    question: str
    answer: str


@router.post("/evaluate")
def evaluate_answer(
    data: InterviewEvaluateRequest
):

    if not data.answer.strip():

        raise HTTPException(
            status_code=400,
            detail="Answer cannot be empty."
        )

    prompt = f"""
You are an expert AI interview evaluator.

Evaluate the candidate's answer to the interview question.

Target role: {data.role}
Difficulty: {data.difficulty}
Interview type: {data.interview_type}

Interview question:
{data.question}

Candidate answer:
{data.answer}

Evaluate the answer based on:
1. Correctness
2. Relevance
3. Technical knowledge
4. Clarity
5. Completeness

Return ONLY valid JSON.

Use exactly this structure:

{{
  "score": 85,
  "feedback": "Brief overall feedback about the answer.",
  "strengths": [
    "First strength",
    "Second strength"
  ],
  "improvements": [
    "First improvement",
    "Second improvement"
  ]
}}

Rules:
- score must be an integer from 0 to 100.
- Give realistic scoring.
- Keep feedback concise and useful.
- Provide 2 to 4 strengths.
- Provide 2 to 4 improvements.
- Do not include markdown.
- Do not include ```json.
- Return only the JSON object.
"""

    try:

        response = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={
                "model": "llama3.2:latest",
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        response.raise_for_status()

        result = response.json()

        ai_response = result.get(
            "response",
            ""
        ).strip()

        if not ai_response:

            raise HTTPException(
                status_code=500,
                detail="AI did not return an evaluation."
            )

        ai_response = ai_response.replace(
            "```json",
            ""
        ).replace(
            "```",
            ""
        ).strip()

        try:

            evaluation = json.loads(
                ai_response
            )

        except json.JSONDecodeError:

            raise HTTPException(
                status_code=500,
                detail="AI returned an invalid evaluation format."
            )

        return {
            "score": evaluation.get(
                "score",
                0
            ),
            "feedback": evaluation.get(
                "feedback",
                "No feedback available."
            ),
            "strengths": evaluation.get(
                "strengths",
                []
            ),
            "improvements": evaluation.get(
                "improvements",
                []
            )
        }

    except requests.exceptions.ConnectionError:

        raise HTTPException(
            status_code=503,
            detail="Could not connect to Ollama. Make sure Ollama is running."
        )

    except requests.exceptions.Timeout:

        raise HTTPException(
            status_code=504,
            detail="Ollama took too long to evaluate the answer."
        )

    except requests.exceptions.RequestException as error:

        raise HTTPException(
            status_code=500,
            detail=f"Ollama request failed: {error}"
        )


# =========================================================
# SAVE COMPLETED INTERVIEW
# =========================================================

class InterviewQuestionResult(BaseModel):

    questionNumber: int
    question: str
    answer: str
    score: int
    feedback: str = ""
    strengths: List[str] = []
    improvements: List[str] = []


class SaveInterviewRequest(BaseModel):

    user_id: int
    role: str
    difficulty: str
    interview_type: str
    total_questions: int
    overall_score: int
    best_score: int
    results: List[InterviewQuestionResult]


@router.post("/save")
def save_interview(
    data: SaveInterviewRequest,
    db: Session = Depends(get_db)
):

    interview = Interview(

        user_id=data.user_id,

        role=data.role,

        difficulty=data.difficulty,

        interview_type=data.interview_type,

        total_questions=data.total_questions,

        overall_score=data.overall_score,

        best_score=data.best_score
    )

    db.add(interview)

    db.commit()

    db.refresh(interview)

    for result in data.results:

        interview_result = InterviewResult(

            interview_id=interview.id,

            question_number=result.questionNumber,

            question=result.question,

            answer=result.answer,

            score=result.score,

            feedback=result.feedback,

            strengths=", ".join(
                result.strengths
            ),

            improvements=", ".join(
                result.improvements
            )
        )

        db.add(interview_result)

    db.commit()

    return {

        "message":
            "Interview saved successfully.",

        "interview_id":
            interview.id
    }


# =========================================================
# INTERVIEW HISTORY
# =========================================================

@router.get("/history")
def get_interview_history(

    user_id: int = Depends(
        get_current_user_id
    ),

    db: Session = Depends(get_db)

):

    interviews = (

        db.query(Interview)

        .filter(
            Interview.user_id == user_id
        )

        .order_by(
            Interview.created_at.desc()
        )

        .all()
    )

    history = []

    for interview in interviews:

        history.append({

            "id": interview.id,

            "role": interview.role,

            "difficulty":
                interview.difficulty,

            "interview_type":
                interview.interview_type,

            "total_questions":
                interview.total_questions,

            "overall_score":
                interview.overall_score,

            "best_score":
                interview.best_score,

            "created_at":
                interview.created_at.isoformat()
                if interview.created_at
                else None
        })

    return {

        "total": len(history),

        "interviews": history
    }


# =========================================================
# INTERVIEW DETAILS
# =========================================================

@router.get("/history/{interview_id}")
def get_interview_details(

    interview_id: int,

    user_id: int = Depends(
        get_current_user_id
    ),

    db: Session = Depends(get_db)

):

    interview = (

        db.query(Interview)

        .filter(

            Interview.id == interview_id,

            Interview.user_id == user_id

        )

        .first()
    )

    if not interview:

        raise HTTPException(

            status_code=404,

            detail="Interview not found."
        )

    results = (

        db.query(InterviewResult)

        .filter(
            InterviewResult.interview_id
            == interview.id
        )

        .order_by(
            InterviewResult.question_number
        )

        .all()
    )

    question_results = []

    for result in results:

        question_results.append({

            "id": result.id,

            "question_number":
                result.question_number,

            "question":
                result.question,

            "answer":
                result.answer,

            "score":
                result.score,

            "feedback":
                result.feedback or "",

            "strengths":
                result.strengths.split(", ")
                if result.strengths
                else [],

            "improvements":
                result.improvements.split(", ")
                if result.improvements
                else []
        })

    return {

        "id":
            interview.id,

        "role":
            interview.role,

        "difficulty":
            interview.difficulty,

        "interview_type":
            interview.interview_type,

        "total_questions":
            interview.total_questions,

        "overall_score":
            interview.overall_score,

        "best_score":
            interview.best_score,

        "created_at":
            interview.created_at.isoformat()
            if interview.created_at
            else None,

        "results":
            question_results
    }


# =========================================================
# ANALYTICS
# =========================================================

@router.get("/analytics")
def get_interview_analytics(

    user_id: int = Depends(
        get_current_user_id
    ),

    db: Session = Depends(get_db)

):

    interviews = (

        db.query(Interview)

        .filter(
            Interview.user_id == user_id
        )

        .order_by(
            Interview.created_at.asc()
        )

        .all()
    )

    if not interviews:

        return {

            "total_interviews": 0,

            "average_score": 0,

            "best_score": 0,

            "first_score": 0,

            "improvement": 0,

            "score_history": [],

            "type_performance": [],

            "role_performance": []
        }

    scores = [

        interview.overall_score

        for interview in interviews
    ]

    total_interviews = len(
        interviews
    )

    average_score = round(
        sum(scores) / total_interviews
    )

    best_score = max(scores)

    first_score = scores[0]

    improvement = (
        scores[-1] - first_score
    )

    # -----------------------------------------------------
    # SCORE HISTORY
    # -----------------------------------------------------

    score_history = []

    for index, interview in enumerate(
        interviews,
        start=1
    ):

        score_history.append({

            "interview_number":
                index,

            "score":
                interview.overall_score,

            "role":
                interview.role,

            "date":
                interview.created_at.isoformat()
                if interview.created_at
                else None
        })

    # -----------------------------------------------------
    # PERFORMANCE BY INTERVIEW TYPE
    # -----------------------------------------------------

    type_data = {}

    for interview in interviews:

        interview_type = (
            interview.interview_type
        )

        if interview_type not in type_data:

            type_data[interview_type] = []

        type_data[
            interview_type
        ].append(
            interview.overall_score
        )

    type_performance = []

    for interview_type, values in (
        type_data.items()
    ):

        type_performance.append({

            "type":
                interview_type,

            "average_score":
                round(
                    sum(values) / len(values)
                ),

            "interviews":
                len(values)
        })

    # -----------------------------------------------------
    # PERFORMANCE BY ROLE
    # -----------------------------------------------------

    role_data = {}

    for interview in interviews:

        role = interview.role

        if role not in role_data:

            role_data[role] = []

        role_data[role].append(
            interview.overall_score
        )

    role_performance = []

    for role, values in (
        role_data.items()
    ):

        role_performance.append({

            "role":
                role,

            "average_score":
                round(
                    sum(values) / len(values)
                ),

            "interviews":
                len(values)
        })

    return {

        "total_interviews":
            total_interviews,

        "average_score":
            average_score,

        "best_score":
            best_score,

        "first_score":
            first_score,

        "improvement":
            improvement,

        "score_history":
            score_history,

        "type_performance":
            type_performance,

        "role_performance":
            role_performance
    }


# =========================================================
# AI COACH INSIGHTS
# =========================================================

@router.get("/coach-insights")
def get_coach_insights(
    user_id: int = Depends(
        get_current_user_id
    ),
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # GET USER'S INTERVIEWS
    # -----------------------------------------------------

    interviews = (
        db.query(Interview)
        .filter(
            Interview.user_id == user_id
        )
        .order_by(
            Interview.created_at.asc()
        )
        .all()
    )

    # -----------------------------------------------------
    # NO INTERVIEW HISTORY
    # -----------------------------------------------------

    if not interviews:

        return {
            "has_data": False,
            "overall_performance": 0,
            "strongest_area": "Not enough data",
            "focus_area": "Complete an interview",
            "trend": "No data",
            "recommendations": [
                "Complete your first interview",
                "Practice answering questions clearly",
                "Try both Technical and HR interviews"
            ],
            "coach_message":
                "Complete your first interview and I will analyze your performance."
        }

    # -----------------------------------------------------
    # BASIC PERFORMANCE
    # -----------------------------------------------------

    scores = [
        interview.overall_score
        for interview in interviews
    ]

    average_score = round(
        sum(scores) / len(scores)
    )

    # -----------------------------------------------------
    # TREND
    # -----------------------------------------------------

    if len(scores) == 1:

        trend = "Starting"

    else:

        recent_scores = scores[-3:]

        if len(recent_scores) >= 2:

            difference = (
                recent_scores[-1]
                - recent_scores[0]
            )

            if difference >= 5:
                trend = "Improving"

            elif difference <= -5:
                trend = "Needs Attention"

            else:
                trend = "Stable"

        else:

            trend = "Stable"

    # -----------------------------------------------------
    # PERFORMANCE BY INTERVIEW TYPE
    # -----------------------------------------------------

    type_data = {}

    for interview in interviews:

        interview_type = (
            interview.interview_type
        )

        if interview_type not in type_data:

            type_data[interview_type] = []

        type_data[
            interview_type
        ].append(
            interview.overall_score
        )

    type_averages = {}

    for interview_type, values in (
        type_data.items()
    ):

        type_averages[interview_type] = round(
            sum(values) / len(values)
        )

    # -----------------------------------------------------
    # STRONGEST TYPE
    # -----------------------------------------------------

    strongest_area = "General Interview Skills"

    if type_averages:

        strongest_area = max(
            type_averages,
            key=type_averages.get
        )

    # -----------------------------------------------------
    # WEAKEST TYPE
    # -----------------------------------------------------

    weakest_type = None

    if len(type_averages) >= 2:

        weakest_type = min(
            type_averages,
            key=type_averages.get
        )

    # -----------------------------------------------------
    # ANALYZE IMPROVEMENT AREAS
    # -----------------------------------------------------

    improvement_counts = {}

    strengths_counts = {}

    for interview in interviews:

        results = (
            db.query(InterviewResult)
            .filter(
                InterviewResult.interview_id
                == interview.id
            )
            .all()
        )

        for result in results:

            # -----------------------------
            # IMPROVEMENTS
            # -----------------------------

            if result.improvements:

                improvements = [
                    item.strip()
                    for item in
                    result.improvements.split(",")
                    if item.strip()
                ]

                for improvement in improvements:

                    key = improvement.lower()

                    improvement_counts[key] = (
                        improvement_counts.get(
                            key,
                            0
                        ) + 1
                    )

            # -----------------------------
            # STRENGTHS
            # -----------------------------

            if result.strengths:

                strengths = [
                    item.strip()
                    for item in
                    result.strengths.split(",")
                    if item.strip()
                ]

                for strength in strengths:

                    key = strength.lower()

                    strengths_counts[key] = (
                        strengths_counts.get(
                            key,
                            0
                        ) + 1
                    )

    # -----------------------------------------------------
    # MOST COMMON IMPROVEMENTS
    # -----------------------------------------------------

    common_improvements = sorted(
        improvement_counts.items(),
        key=lambda item: item[1],
        reverse=True
    )

    common_strengths = sorted(
        strengths_counts.items(),
        key=lambda item: item[1],
        reverse=True
    )

    # -----------------------------------------------------
    # FOCUS AREA
    # -----------------------------------------------------

    if common_improvements:

        focus_area = (
            common_improvements[0][0]
            .capitalize()
        )

    elif weakest_type:

        focus_area = (
            f"{weakest_type} interview performance"
        )

    else:

        focus_area = "Answer clarity and completeness"

    # -----------------------------------------------------
    # RECOMMENDATIONS
    # -----------------------------------------------------

    recommendations = []

    if weakest_type:

        recommendations.append(
            f"Practice more {weakest_type} interviews"
        )

    if common_improvements:

        for improvement, _ in common_improvements[:2]:

            recommendations.append(
                f"Improve {improvement}"
            )

    if average_score < 60:

        recommendations.append(
            "Focus on fundamentals and practice regularly"
        )

    elif average_score < 80:

        recommendations.append(
            "Practice explaining your answers with clearer examples"
        )

    else:

        recommendations.append(
            "Continue practicing advanced interview questions"
        )

    # Remove duplicate recommendations

    recommendations = list(
        dict.fromkeys(
            recommendations
        )
    )[:4]

    # -----------------------------------------------------
    # BUILD AI COACH PROMPT
    # -----------------------------------------------------

    recent_scores = scores[-5:]

    prompt = f"""
You are an AI interview coach.

Analyze the candidate's interview performance.

Overall average score:
{average_score}

Recent scores:
{recent_scores}

Strongest interview type:
{strongest_area}

Weakest interview type:
{weakest_type or "Not enough data"}

Common improvement areas:
{[item[0] for item in common_improvements[:5]]}

Common strengths:
{[item[0] for item in common_strengths[:5]]}

Return ONLY valid JSON using exactly this format:

{{
    "summary": "Short performance summary.",
    "coach_message": "Personalized advice for the candidate."
}}

Rules:
- Keep both responses concise.
- Be encouraging but realistic.
- Do not mention that you are an AI.
- Do not use markdown.
- Return only JSON.
"""

    # -----------------------------------------------------
    # CALL OLLAMA
    # -----------------------------------------------------

    summary = (
        f"Your current average interview score is "
        f"{average_score}%."
    )

    coach_message = (
        "Keep practicing regularly and focus on "
        f"{focus_area.lower()}."
    )

    try:

        response = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={
                "model": "llama3.2:latest",
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        response.raise_for_status()

        result = response.json()

        ai_response = result.get(
            "response",
            ""
        ).strip()

        ai_response = (
            ai_response
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        if ai_response:

            try:

                ai_data = json.loads(
                    ai_response
                )

                summary = ai_data.get(
                    "summary",
                    summary
                )

                coach_message = ai_data.get(
                    "coach_message",
                    coach_message
                )

            except json.JSONDecodeError:

                pass

    except (
        requests.exceptions.ConnectionError,
        requests.exceptions.Timeout,
        requests.exceptions.RequestException
    ):

        # Keep the endpoint working even if
        # Ollama is temporarily unavailable.

        pass

    # -----------------------------------------------------
    # FINAL RESPONSE
    # -----------------------------------------------------

    return {

        "has_data": True,

        "overall_performance":
            average_score,

        "strongest_area":
            strongest_area,

        "focus_area":
            focus_area,

        "trend":
            trend,

        "recommendations":
            recommendations,

        "summary":
            summary,

        "coach_message":
            coach_message
    }


