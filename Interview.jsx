import { useState } from "react";
import {
  ArrowLeft,
  BrainCircuit,
  Play,
  Send,
  Loader2,
  CheckCircle2,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Interview() {
  const navigate = useNavigate();

  // =========================================================
  // INTERVIEW SETUP
  // =========================================================

  const [role, setRole] = useState("Software Developer");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [type, setType] = useState("Mixed");

  // =========================================================
  // INTERVIEW STATE
  // =========================================================

  const [started, setStarted] = useState(false);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 5;

  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [evaluation, setEvaluation] = useState(null);

  const [results, setResults] = useState([]);

  const [showFinalResult, setShowFinalResult] = useState(false);

  // Prevent saving the same interview more than once
  const [interviewSaved, setInterviewSaved] = useState(false);

  // =========================================================
  // GENERATE QUESTION
  // =========================================================

  const generateQuestion = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/interview/start",
        {
          role,
          difficulty,
          interview_type: type,
        }
      );

      setQuestion(response.data.question);
      setAnswer("");
      setEvaluation(null);
    } catch (error) {
      console.error(
        "Question generation error:",
        error
      );

      if (error.response) {
        alert(
          error.response.data.detail ||
            "Failed to generate interview question."
        );
      } else {
        alert(
          "Cannot connect to the backend. Make sure FastAPI and Ollama are running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // START INTERVIEW
  // =========================================================

  const startInterview = async () => {
    setStarted(true);
    setShowFinalResult(false);
    setInterviewSaved(false);

    setCurrentQuestion(1);
    setResults([]);

    await generateQuestion();
  };

  // =========================================================
  // SUBMIT ANSWER
  // =========================================================

  const submitAnswer = async () => {
    if (!answer.trim()) {
      return;
    }

    try {
      setEvaluating(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/interview/evaluate",
        {
          role,
          difficulty,
          interview_type: type,
          question,
          answer,
        }
      );

      setEvaluation(response.data);

      setResults((previousResults) => [
        ...previousResults,
        {
          questionNumber: currentQuestion,
          question,
          answer,
          score: response.data.score,
          feedback: response.data.feedback,
          strengths: response.data.strengths,
          improvements:
            response.data.improvements,
        },
      ]);
    } catch (error) {
      console.error(
        "Answer evaluation error:",
        error
      );

      if (error.response) {
        alert(
          error.response.data.detail ||
            "Failed to evaluate answer."
        );
      } else {
        alert(
          "Cannot connect to the backend. Make sure FastAPI and Ollama are running."
        );
      }
    } finally {
      setEvaluating(false);
    }
  };

  // =========================================================
  // NEXT QUESTION
  // =========================================================

  const nextQuestion = async () => {
    if (currentQuestion >= totalQuestions) {
      return;
    }

    setCurrentQuestion(
      (previous) => previous + 1
    );

    setEvaluation(null);
    setAnswer("");

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/interview/start",
        {
          role,
          difficulty,
          interview_type: type,
        }
      );

      setQuestion(response.data.question);
    } catch (error) {
      console.error(
        "Next question error:",
        error
      );

      if (error.response) {
        alert(
          error.response.data.detail ||
            "Failed to generate next question."
        );
      } else {
        alert(
          "Cannot connect to the backend. Make sure FastAPI and Ollama are running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CALCULATE FINAL SCORE
  // =========================================================

  const calculateFinalScore = () => {
    if (results.length === 0) {
      return 0;
    }

    const totalScore = results.reduce(
      (sum, result) =>
        sum + Number(result.score || 0),
      0
    );

    return Math.round(
      totalScore / results.length
    );
  };

  // =========================================================
  // SAVE INTERVIEW
  // =========================================================

  const saveInterview = async () => {
    if (interviewSaved) {
      return true;
    }

    if (results.length !== totalQuestions) {
      alert(
        "Please complete all 5 questions before viewing the final result."
      );

      return false;
    }

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      alert(
        "Your session has expired. Please sign in again."
      );

      navigate("/");
      return false;
    }

    try {
      setSaving(true);

      // Get logged-in user
      const userResponse =
        await axios.get(
          "http://127.0.0.1:8000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const userId = userResponse.data.id;

      const finalScore =
        calculateFinalScore();

      const bestScore = Math.max(
        ...results.map(
          (result) =>
            Number(result.score || 0)
        )
      );

      // Save interview
      const saveResponse =
        await axios.post(
          "http://127.0.0.1:8000/api/interview/save",
          {
            user_id: userId,
            role,
            difficulty,
            interview_type: type,
            total_questions:
              totalQuestions,
            overall_score: finalScore,
            best_score: bestScore,
            results,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      console.log(
        "Interview saved:",
        saveResponse.data
      );

      setInterviewSaved(true);

      return true;
    } catch (error) {
      console.error(
        "Save interview error:",
        error
      );

      if (error.response) {
        alert(
          error.response.data.detail ||
            "Failed to save interview."
        );
      } else {
        alert(
          "Cannot connect to the backend."
        );
      }

      return false;
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // SHOW FINAL RESULT
  // =========================================================

  const handleFinalResult = async () => {
    const saved = await saveInterview();

    if (saved) {
      setShowFinalResult(true);
    }
  };

  // =========================================================
  // RESTART INTERVIEW
  // =========================================================

  const restartInterview = () => {
    setStarted(false);
    setShowFinalResult(false);
    setInterviewSaved(false);

    setQuestion("");
    setAnswer("");
    setEvaluation(null);

    setCurrentQuestion(1);
    setResults([]);
  };

  // =========================================================
  // FINAL RESULT SCREEN
  // =========================================================

  if (showFinalResult) {
    const finalScore =
      calculateFinalScore();

    const bestScore =
      results.length > 0
        ? Math.max(
            ...results.map(
              (result) =>
                Number(result.score || 0)
            )
          )
        : 0;

    return (
      <div className="interview-page">

        <div className="interview-background-glow"></div>

        {/* HEADER */}

        <header className="interview-header">

          <button
            className="back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <ArrowLeft size={20} />
            Dashboard
          </button>

          <div className="interview-brand">

            <div className="interview-brand-icon">
              <BrainCircuit size={24} />
            </div>

            <span>
              AI Interview Coach
            </span>

          </div>

        </header>

        {/* MAIN */}

        <main className="interview-content">

          <div className="final-result-screen">

            {/* HEADER */}

            <div className="final-result-header">

              <p className="setup-label">
                INTERVIEW COMPLETED
              </p>

              <h1>
                Great job! 🎉
              </h1>

              <p>
                Here's your performance
                summary.
              </p>

            </div>

            {/* OVERALL SCORE */}

            <div className="final-score-card">

              <div className="final-score-circle">

                <strong>
                  {finalScore}%
                </strong>

                <span>
                  Overall Score
                </span>

              </div>

            </div>

            {/* STATS */}

            <div className="final-stats-grid">

              <div className="final-stat-card">

                <strong>
                  {results.length}
                </strong>

                <span>
                  Questions
                </span>

              </div>

              <div className="final-stat-card">

                <strong>
                  {bestScore}%
                </strong>

                <span>
                  Best Score
                </span>

              </div>

              <div className="final-stat-card">

                <strong>
                  {finalScore}%
                </strong>

                <span>
                  Average Score
                </span>

              </div>

            </div>

            {/* PERFORMANCE */}

            <div className="final-result-card">

              <h2>
                Question Performance
              </h2>

              <div className="result-question-list">

                {results.map(
                  (result) => (
                    <div
                      className="result-question-item"
                      key={
                        result.questionNumber
                      }
                    >

                      <div>

                        <span>
                          Question{" "}
                          {
                            result.questionNumber
                          }
                        </span>

                        <p>
                          {result.question}
                        </p>

                      </div>

                      <strong>
                        {result.score}%
                      </strong>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* ACTIONS */}

            <div className="final-result-actions">

              <button
                className="secondary-interview-button"
                onClick={() =>
                  navigate("/dashboard")
                }
              >

                <ArrowLeft size={18} />

                Back to Dashboard

              </button>

              <button
                className="begin-interview-button"
                onClick={restartInterview}
              >

                <Play size={18} />

                Practice Again

              </button>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // SETUP SCREEN
  // =========================================================

  if (!started) {
    return (
      <div className="interview-page">

        <div className="interview-background-glow"></div>

        <header className="interview-header">

          <button
            className="back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <ArrowLeft size={20} />
            Dashboard
          </button>

          <div className="interview-brand">

            <div className="interview-brand-icon">
              <BrainCircuit size={24} />
            </div>

            <span>
              AI Interview Coach
            </span>

          </div>

        </header>

        <main className="interview-content">

          <div className="interview-intro">

            <p>
              AI-POWERED PRACTICE
            </p>

            <h1>
              Prepare for your
              <span>
                {" "}
                next interview.
              </span>
            </h1>

            <p className="intro-description">
              Customize your interview session
              and practice with AI-generated
              questions tailored to your target
              role.
            </p>

          </div>

          <div className="interview-setup-card">

            <div className="setup-header">

              <div>

                <p className="setup-label">
                  INTERVIEW SETUP
                </p>

                <h2>
                  Configure your session
                </h2>

              </div>

              <div className="setup-icon">
                <BrainCircuit size={26} />
              </div>

            </div>

            <div className="setup-form">

              <div className="setup-field">

                <label>
                  Target Role
                </label>

                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                >
                  <option>
                    Software Developer
                  </option>

                  <option>
                    Frontend Developer
                  </option>

                  <option>
                    Backend Developer
                  </option>

                  <option>
                    Full Stack Developer
                  </option>

                  <option>
                    Data Analyst
                  </option>

                  <option>
                    AI/ML Engineer
                  </option>
                </select>

              </div>

              <div className="setup-field">

                <label>
                  Difficulty
                </label>

                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(
                      e.target.value
                    )
                  }
                >
                  <option>
                    Beginner
                  </option>

                  <option>
                    Intermediate
                  </option>

                  <option>
                    Advanced
                  </option>
                </select>

              </div>

              <div className="setup-field">

                <label>
                  Interview Type
                </label>

                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value)
                  }
                >
                  <option>
                    Mixed
                  </option>

                  <option>
                    Technical
                  </option>

                  <option>
                    HR
                  </option>

                  <option>
                    Behavioral
                  </option>
                </select>

              </div>

              <button
                className="begin-interview-button"
                onClick={startInterview}
                disabled={loading}
              >

                {loading ? (
                  <>
                    <Loader2
                      size={20}
                      className="spin"
                    />

                    Generating Question...
                  </>
                ) : (
                  <>
                    <Play size={20} />

                    Begin 5-Question Interview
                  </>
                )}

              </button>

            </div>

          </div>

          <div className="interview-info-grid">

            <div className="interview-info-card">

              <strong>
                5 AI Questions
              </strong>

              <span>
                Practice with multiple
                role-specific questions.
              </span>

            </div>

            <div className="interview-info-card">

              <strong>
                Real-time Feedback
              </strong>

              <span>
                Receive AI feedback after
                every answer.
              </span>

            </div>

            <div className="interview-info-card">

              <strong>
                Performance Tracking
              </strong>

              <span>
                Track your performance
                across the interview.
              </span>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // ACTIVE INTERVIEW SCREEN
  // =========================================================

  return (
    <div className="interview-page">

      <div className="interview-background-glow"></div>

      <header className="interview-header">

        <button
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <ArrowLeft size={20} />
          Dashboard
        </button>

        <div className="interview-brand">

          <div className="interview-brand-icon">
            <BrainCircuit size={24} />
          </div>

          <span>
            AI Interview Coach
          </span>

        </div>

      </header>

      <main className="interview-content">

        <div className="question-screen">

          {/* PROGRESS */}

          <div className="interview-progress-container">

            <div className="interview-progress-top">

              <span>
                Question{" "}
                {currentQuestion} of{" "}
                {totalQuestions}
              </span>

              <span>
                {Math.round(
                  (currentQuestion /
                    totalQuestions) *
                    100
                )}
                %
              </span>

            </div>

            <div className="interview-progress-bar">

              <div
                className="interview-progress-fill"
                style={{
                  width: `${
                    (currentQuestion /
                      totalQuestions) *
                    100
                  }%`,
                }}
              ></div>

            </div>

          </div>

          {/* QUESTION HEADER */}

          <div className="question-header">

            <div>

              <p className="setup-label">
                LIVE AI INTERVIEW
              </p>

              <h1>
                Question{" "}
                {currentQuestion}
              </h1>

            </div>

            <div className="question-badge">
              {difficulty}
            </div>

          </div>

          {/* QUESTION */}

          {loading ? (

            <div className="question-card question-loading">

              <Loader2
                size={36}
                className="spin"
              />

              <p>
                AI is preparing your next
                question...
              </p>

            </div>

          ) : (

            <div className="question-card">

              <div className="question-icon">
                <BrainCircuit size={32} />
              </div>

              <p className="question-label">
                AI INTERVIEWER
              </p>

              <h2>
                {question}
              </h2>

            </div>

          )}

          {/* ANSWER */}

          {!evaluation && !loading && (

            <div className="answer-card">

              <label htmlFor="answer">
                Your Answer
              </label>

              <textarea
                id="answer"
                value={answer}
                onChange={(e) =>
                  setAnswer(e.target.value)
                }
                placeholder="Type your answer here..."
                rows={8}
              />

              <button
                className="submit-answer-button"
                onClick={submitAnswer}
                disabled={
                  !answer.trim() ||
                  evaluating
                }
              >

                {evaluating ? (
                  <>
                    <Loader2
                      size={19}
                      className="spin"
                    />

                    AI is evaluating...
                  </>
                ) : (
                  <>
                    <Send size={19} />

                    Submit Answer
                  </>
                )}

              </button>

            </div>

          )}

          {/* EVALUATION */}

          {evaluation && (

            <div className="evaluation-section">

              <div className="evaluation-score-card">

                <p className="setup-label">
                  QUESTION SCORE
                </p>

                <div className="evaluation-score">

                  <strong>
                    {evaluation.score}%
                  </strong>

                  <span>
                    Performance
                  </span>

                </div>

              </div>

              <div className="evaluation-card">

                <div className="evaluation-card-title">

                  <BrainCircuit size={21} />

                  <h3>
                    Overall Feedback
                  </h3>

                </div>

                <p>
                  {evaluation.feedback}
                </p>

              </div>

              <div className="evaluation-card">

                <div className="evaluation-card-title">

                  <CheckCircle2 size={21} />

                  <h3>
                    Your Strengths
                  </h3>

                </div>

                <ul className="evaluation-list">

                  {evaluation.strengths?.map(
                    (strength, index) => (
                      <li key={index}>
                        {strength}
                      </li>
                    )
                  )}

                </ul>

              </div>

              <div className="evaluation-card">

                <div className="evaluation-card-title">

                  <Lightbulb size={21} />

                  <h3>
                    Areas to Improve
                  </h3>

                </div>

                <ul className="evaluation-list">

                  {evaluation.improvements?.map(
                    (
                      improvement,
                      index
                    ) => (
                      <li key={index}>
                        {improvement}
                      </li>
                    )
                  )}

                </ul>

              </div>

              {/* ACTION */}

              <div className="evaluation-actions">

                {currentQuestion <
                totalQuestions ? (

                  <button
                    className="begin-interview-button"
                    onClick={nextQuestion}
                    disabled={loading}
                  >

                    {loading ? (
                      <>
                        <Loader2
                          size={19}
                          className="spin"
                        />

                        Preparing...
                      </>
                    ) : (
                      <>
                        Next Question

                        <ChevronRight
                          size={19}
                        />
                      </>
                    )}

                  </button>

                ) : (

                  <button
                    className="begin-interview-button"
                    onClick={handleFinalResult}
                    disabled={saving}
                  >

                    {saving ? (
                      <>
                        <Loader2
                          size={19}
                          className="spin"
                        />

                        Saving Results...
                      </>
                    ) : (
                      <>
                        View Final Result

                        <ChevronRight
                          size={19}
                        />
                      </>
                    )}

                  </button>

                )}

              </div>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default Interview;

