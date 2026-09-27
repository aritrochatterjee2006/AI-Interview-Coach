from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routes.auth import router as auth_router
from .routes.interview import router as interview_router

from . import models


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI Interview Coach API",
    description="Backend API for AI Interview Coach",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "AI Interview Coach API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


app.include_router(auth_router)
app.include_router(interview_router)