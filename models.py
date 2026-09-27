from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String, Text

from .database import Base


# =========================================================
# USER MODEL
# =========================================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    hashed_password = Column(
        String(255),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )


# =========================================================
# INTERVIEW MODEL
# =========================================================

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    role = Column(
        String(100),
        nullable=False
    )

    difficulty = Column(
        String(50),
        nullable=False
    )

    interview_type = Column(
        String(50),
        nullable=False
    )

    total_questions = Column(
        Integer,
        nullable=False,
        default=5
    )

    overall_score = Column(
        Integer,
        nullable=False,
        default=0
    )

    best_score = Column(
        Integer,
        nullable=False,
        default=0
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )


# =========================================================
# INTERVIEW QUESTION RESULT MODEL
# =========================================================

class InterviewResult(Base):
    __tablename__ = "interview_results"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    interview_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    question_number = Column(
        Integer,
        nullable=False
    )

    question = Column(
        Text,
        nullable=False
    )

    answer = Column(
        Text,
        nullable=False
    )

    score = Column(
        Integer,
        nullable=False,
        default=0
    )

    feedback = Column(
        Text,
        nullable=True
    )

    strengths = Column(
        Text,
        nullable=True
    )

    improvements = Column(
        Text,
        nullable=True
    )

