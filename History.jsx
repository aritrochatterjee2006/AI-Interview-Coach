import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import {
  LayoutDashboard,
  BrainCircuit,
  BarChart3,
  History as HistoryIcon,
  Settings,
  LogOut,
  Plus,
  ArrowLeft,
  ArrowUpRight,
  Clock3,
  Trophy,
  Target,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Award,
  TrendingUp,
  Zap,
} from "lucide-react";

function History() {
  const navigate = useNavigate();
  const { interviewId } = useParams();

  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] =
    useState(false);
  const [error, setError] = useState("");

  /*
   * =====================================================
   * LOAD HISTORY LIST
   * =====================================================
   */

  useEffect(() => {
    if (!interviewId) {
      loadHistory();
    }
  }, [interviewId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("access_token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(
        "http://127.0.0.1:8000/api/interview/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "History API:",
        response.data
      );

      if (Array.isArray(response.data?.interviews)) {
  setInterviews(response.data.interviews);
} else {
  setInterviews([]);
}
    } catch (err) {
      console.error(
        "History error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load interview history."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * =====================================================
   * LOAD SINGLE INTERVIEW DETAILS
   * =====================================================
   */

  useEffect(() => {
    if (interviewId) {
      loadInterviewDetails(interviewId);
    }
  }, [interviewId]);

  const loadInterviewDetails = async (id) => {
    try {
      setDetailLoading(true);
      setError("");
      setSelectedInterview(null);

      const token =
        localStorage.getItem("access_token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(
        `http://127.0.0.1:8000/api/interview/history/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Interview Details:",
        response.data
      );

      setSelectedInterview(response.data);
    } catch (err) {
      console.error(
        "Interview detail error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load interview details."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  /*
   * =====================================================
   * LOGOUT
   * =====================================================
   */

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  /*
   * =====================================================
   * NAVIGATION
   * =====================================================
   */

  const openInterview = (id) => {
    navigate(`/history/${id}`);
  };

  const backToHistory = () => {
    navigate("/history");
  };

  /*
   * =====================================================
   * HELPERS
   * =====================================================
   */

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const getScoreClass = (score) => {
    const value = Number(score || 0);

    if (value >= 85) {
      return "excellent";
    }

    if (value >= 70) {
      return "good";
    }

    if (value >= 50) {
      return "average";
    }

    return "low";
  };

  const getScoreLabel = (score) => {
    const value = Number(score || 0);

    if (value >= 85) {
      return "Excellent";
    }

    if (value >= 70) {
      return "Good";
    }

    if (value >= 50) {
      return "Needs Improvement";
    }

    return "Keep Practicing";
  };

  const calculateAverage = (results) => {
    if (
      !results ||
      results.length === 0
    ) {
      return 0;
    }

    const total = results.reduce(
      (sum, result) =>
        sum + Number(result.score || 0),
      0
    );

    return Math.round(
      total / results.length
    );
  };

  /*
   * =====================================================
   * SUMMARY VALUES
   * =====================================================
   */

  const averageScore =
    interviews.length > 0
      ? Math.round(
          interviews.reduce(
            (sum, interview) =>
              sum +
              Number(
                interview.overall_score || 0
              ),
            0
          ) / interviews.length
        )
      : 0;

  const bestScore =
    interviews.length > 0
      ? Math.max(
          ...interviews.map((interview) =>
            Number(
              interview.overall_score || 0
            )
          )
        )
      : 0;

  const totalQuestions =
    interviews.reduce(
      (sum, interview) =>
        sum +
        Number(
          interview.total_questions || 0
        ),
      0
    );

  /*
   * =====================================================
   * LOADING SCREEN
   * =====================================================
   */

  if (
    !interviewId &&
    loading
  ) {
    return (
      <div className="history-loading">
        <div className="history-loader"></div>

        <p>
          Loading your interview history...
        </p>
      </div>
    );
  }

  if (
    interviewId &&
    detailLoading
  ) {
    return (
      <div className="history-loading">
        <div className="history-loader"></div>

        <p>
          Loading interview results...
        </p>
      </div>
    );
  }

  /*
   * =====================================================
   * MAIN LAYOUT
   * =====================================================
   */

  return (
    <div className="premium-history">

      {/* BACKGROUND EFFECTS */}

      <div className="history-orb history-orb-one"></div>

      <div className="history-orb history-orb-two"></div>

      {/* =================================================
          SIDEBAR
          ================================================= */}

      <aside className="premium-sidebar">

        <div className="brand-area">

          <div className="brand-logo">
            <BrainCircuit size={23} />
          </div>

          <div>
            <h2>InterviewAI</h2>

            <span>
              AI INTERVIEW COACH
            </span>
          </div>

        </div>

        <div className="nav-label">
          WORKSPACE
        </div>

        <nav className="premium-nav">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <LayoutDashboard size={18} />

            <span>
              Dashboard
            </span>
          </button>

          <button
            onClick={() =>
              navigate("/interview")
            }
          >
            <BrainCircuit size={18} />

            <span>
              Interview
            </span>
          </button>

          <button
            onClick={() =>
              navigate("/analytics")
            }
          >
            <BarChart3 size={18} />

            <span>
              Analytics
            </span>
          </button>

          <button className="nav-active">
            <HistoryIcon size={18} />

            <span>
              History
            </span>

            <ArrowUpRight size={14} />
          </button>

          <button
            onClick={() =>
              navigate("/settings")
            }
          >
            <Settings size={18} />

            <span>
              Settings
            </span>
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="ai-status">

            <div className="status-dot"></div>

            <div>
              <strong>
                AI Engine Online
              </strong>

              <span>
                Ready for your next session
              </span>
            </div>

          </div>

          <button
            className="premium-logout"
            onClick={handleLogout}
          >
            <LogOut size={17} />

            Sign Out
          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN
          ================================================= */}

      <main className="premium-history-main">

        {/* =================================================
            DETAIL VIEW
            ================================================= */}

        {interviewId && (
          <>
            <button
              className="history-back-button"
              onClick={backToHistory}
            >
              <ArrowLeft size={17} />

              Back to History
            </button>

            {error && (
              <div className="premium-history-error">
                {error}
              </div>
            )}

            {selectedInterview && (
              <InterviewDetails
                interview={selectedInterview}
                formatDate={formatDate}
                formatTime={formatTime}
                getScoreClass={getScoreClass}
                getScoreLabel={getScoreLabel}
                calculateAverage={
                  calculateAverage
                }
                navigate={navigate}
              />
            )}
          </>
        )}

        {/* =================================================
            HISTORY LIST
            ================================================= */}

        {!interviewId && (
          <>

            {/* HEADER */}

            <header className="premium-history-header">

              <div>

                <div className="history-title-tag">
                  <Sparkles size={14} />

                  PERFORMANCE CENTER
                </div>

                <h1>
                  Interview{" "}
                  <span>History</span>
                </h1>

                <p>
                  Review your previous AI
                  interviews, track your scores,
                  and monitor your preparation
                  journey.
                </p>

              </div>

              <button
                className="premium-new-interview"
                onClick={() =>
                  navigate("/interview")
                }
              >
                <Plus size={18} />

                New Interview
              </button>

            </header>

            {/* ERROR */}

            {error && (
              <div className="premium-history-error">
                {error}
              </div>
            )}

            {/* STATS */}

            <section className="history-stats">

              <div className="history-stat-card">

                <div className="stat-icon purple">
                  <HistoryIcon size={20} />
                </div>

                <div>

                  <span>
                    Total Interviews
                  </span>

                  <strong>
                    {interviews.length}
                  </strong>

                  <small>
                    Completed sessions
                  </small>

                </div>

              </div>

              <div className="history-stat-card">

                <div className="stat-icon cyan">
                  <Target size={20} />
                </div>

                <div>

                  <span>
                    Average Score
                  </span>

                  <strong>
                    {averageScore}%
                  </strong>

                  <small>
                    Across all sessions
                  </small>

                </div>

              </div>

              <div className="history-stat-card">

                <div className="stat-icon gold">
                  <Trophy size={20} />
                </div>

                <div>

                  <span>
                    Best Score
                  </span>

                  <strong>
                    {bestScore}%
                  </strong>

                  <small>
                    Personal record
                  </small>

                </div>

              </div>

              <div className="history-stat-card">

                <div className="stat-icon blue">
                  <Clock3 size={20} />
                </div>

                <div>

                  <span>
                    Questions Practiced
                  </span>

                  <strong>
                    {totalQuestions}
                  </strong>

                  <small>
                    Total questions answered
                  </small>

                </div>

              </div>

            </section>

            {/* EMPTY STATE */}

            {!error &&
              interviews.length === 0 && (
                <div className="premium-empty-history">

                  <div className="empty-history-icon">
                    <BrainCircuit size={35} />
                  </div>

                  <h2>
                    Your interview journey
                    starts here
                  </h2>

                  <p>
                    Complete your first
                    AI-powered interview and
                    your performance data will
                    appear in this space.
                  </p>

                  <button
                    onClick={() =>
                      navigate("/interview")
                    }
                  >
                    <Sparkles size={17} />

                    Start Your First Interview
                  </button>

                </div>
              )}

            {/* LIST */}

            {interviews.length > 0 && (
              <section className="history-section">

                <div className="history-section-header">

                  <div>

                    <h2>
                      Recent Interviews
                    </h2>

                    <p>
                      Your latest interview
                      sessions
                    </p>

                  </div>

                  <div className="session-count">
                    {interviews.length}{" "}
                    {interviews.length === 1
                      ? "session"
                      : "sessions"}
                  </div>

                </div>

                <div className="premium-history-list">

                  {interviews.map(
                    (interview, index) => {

                      const score =
                        Number(
                          interview.overall_score ||
                            0
                        );

                      return (
                        <div
                          className="premium-history-card"
                          key={interview.id}
                        >

                          <div className="history-number">
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                          </div>

                          <div className="history-interview-icon">
                            <BrainCircuit
                              size={22}
                            />
                          </div>

                          <div className="history-interview-info">

                            <h3>
                              {interview.role ||
                                "General Interview"}
                            </h3>

                            <div className="history-meta">

                              <span className="history-type">
                                {interview.interview_type ||
                                  "General"}
                              </span>

                              <span className="history-dot">
                                •
                              </span>

                              <span>
                                {interview.difficulty ||
                                  "Medium"}
                              </span>

                              <span className="history-dot">
                                •
                              </span>

                              <span>
                                {interview.total_questions ||
                                  0}{" "}
                                questions
                              </span>

                            </div>

                            <div className="history-date">

                              <Clock3 size={13} />

                              {formatDate(
                                interview.created_at
                              )}

                              <span>
                                •
                              </span>

                              {formatTime(
                                interview.created_at
                              )}

                            </div>

                          </div>

                          <div className="history-score-box">

                            <div
                              className={`score-circle ${getScoreClass(
                                score
                              )}`}
                            >

                              <strong>
                                {score}
                              </strong>

                              <span>
                                %
                              </span>

                            </div>

                            <small>
                              Overall Score
                            </small>

                          </div>

                          <button
                            className="premium-view-result"
                            onClick={() =>
                              openInterview(
                                interview.id
                              )
                            }
                          >
                            <span>
                              View Result
                            </span>

                            <ChevronRight
                              size={17}
                            />
                          </button>

                        </div>
                      );
                    }
                  )}

                </div>

              </section>
            )}

          </>
        )}

      </main>

    </div>
  );
}


/*
 * =======================================================
 * INTERVIEW DETAILS COMPONENT
 * =======================================================
 */

function InterviewDetails({
  interview,
  formatDate,
  formatTime,
  getScoreClass,
  getScoreLabel,
  calculateAverage,
  navigate,
}) {
  const results =
    Array.isArray(interview.results)
      ? interview.results
      : [];

  const overallScore = Number(
    interview.overall_score ||
      calculateAverage(results) ||
      0
  );

  const bestQuestionScore =
    results.length > 0
      ? Math.max(
          ...results.map((item) =>
            Number(item.score || 0)
          )
        )
      : 0;

  const averageQuestionScore =
    calculateAverage(results);

  const strongAnswers = results.filter(
    (item) =>
      Number(item.score || 0) >= 80
  ).length;

  return (
    <div className="interview-detail-page">

      {/* =================================================
          DETAIL HEADER
          ================================================= */}

      <header className="result-header">

        <div>

          <div className="history-title-tag">
            <Sparkles size={14} />

            INTERVIEW PERFORMANCE REPORT
          </div>

          <h1>
            {interview.role ||
              "Interview"}{" "}
            <span>Results</span>
          </h1>

          <p>
            Detailed AI analysis of your
            interview performance.
          </p>

        </div>

        <button
          className="premium-new-interview"
          onClick={() =>
            navigate("/interview")
          }
        >
          <Plus size={18} />

          New Interview
        </button>

      </header>

      {/* =================================================
          INTERVIEW META
          ================================================= */}

      <div className="result-meta-bar">

        <div className="result-meta-item">

          <BrainCircuit size={17} />

          <div>
            <span>Role</span>

            <strong>
              {interview.role ||
                "General"}
            </strong>
          </div>

        </div>

        <div className="result-meta-item">

          <Target size={17} />

          <div>
            <span>Type</span>

            <strong>
              {interview.interview_type ||
                "General"}
            </strong>
          </div>

        </div>

        <div className="result-meta-item">

          <Zap size={17} />

          <div>
            <span>Difficulty</span>

            <strong>
              {interview.difficulty ||
                "Medium"}
            </strong>
          </div>

        </div>

        <div className="result-meta-item">

          <Clock3 size={17} />

          <div>
            <span>Date</span>

            <strong>
              {formatDate(
                interview.created_at
              )}
            </strong>
          </div>

        </div>

      </div>

      {/* =================================================
          SCORE HERO
          ================================================= */}

      <section className="result-score-hero">

        <div className="result-score-left">

          <div
            className={`large-score-circle ${getScoreClass(
              overallScore
            )}`}
          >
            <strong>
              {overallScore}
            </strong>

            <span>
              / 100
            </span>
          </div>

          <div>

            <div className="result-score-label">
              OVERALL PERFORMANCE
            </div>

            <h2>
              {getScoreLabel(
                overallScore
              )}
            </h2>

            <p>
              Based on your answers across{" "}
              {results.length ||
                interview.total_questions ||
                0}{" "}
              interview questions.
            </p>

          </div>

        </div>

        <div className="result-score-stats">

          <div>
            <span>
              Best Answer
            </span>

            <strong>
              {bestQuestionScore}%
            </strong>
          </div>

          <div>
            <span>
              Avg. Question
            </span>

            <strong>
              {averageQuestionScore}%
            </strong>
          </div>

          <div>
            <span>
              Strong Answers
            </span>

            <strong>
              {strongAnswers}
            </strong>
          </div>

        </div>

      </section>

      {/* =================================================
          PERFORMANCE SUMMARY
          ================================================= */}

      <section className="result-summary-grid">

        <div className="result-summary-card">

          <div className="result-summary-icon purple">
            <Trophy size={20} />
          </div>

          <div>

            <span>
              Performance
            </span>

            <strong>
              {getScoreLabel(
                overallScore
              )}
            </strong>

            <p>
              Overall interview result
            </p>

          </div>

        </div>

        <div className="result-summary-card">

          <div className="result-summary-icon cyan">
            <CheckCircle2 size={20} />
          </div>

          <div>

            <span>
              Questions Completed
            </span>

            <strong>
              {results.length}
            </strong>

            <p>
              Fully evaluated responses
            </p>

          </div>

        </div>

        <div className="result-summary-card">

          <div className="result-summary-icon blue">
            <TrendingUp size={20} />
          </div>

          <div>

            <span>
              Best Question
            </span>

            <strong>
              {bestQuestionScore}%
            </strong>

            <p>
              Highest individual score
            </p>

          </div>

        </div>

      </section>

      {/* =================================================
          QUESTION ANALYSIS
          ================================================= */}

      <section className="question-analysis-section">

        <div className="question-analysis-header">

          <div>

            <div className="history-title-tag">
              <BarChart3 size={14} />

              AI QUESTION ANALYSIS
            </div>

            <h2>
              Question-by-Question Review
            </h2>

            <p>
              Explore the AI feedback for
              every answer you submitted.
            </p>

          </div>

          <div className="question-count-badge">
            {results.length} QUESTIONS
          </div>

        </div>

        <div className="question-result-list">

          {results.length === 0 && (
            <div className="no-results-card">
              <AlertTriangle
                size={24}
              />

              <p>
                No detailed question results
                are available for this interview.
              </p>
            </div>
          )}

          {results.map(
            (result, index) => {

              const score = Number(
                result.score || 0
              );

              const strengths =
                Array.isArray(
                  result.strengths
                )
                  ? result.strengths
                  : [];

              const improvements =
                Array.isArray(
                  result.improvements
                )
                  ? result.improvements
                  : [];

              return (
                <div
                  className="question-result-card"
                  key={
                    result.id ||
                    index
                  }
                >

                  {/* QUESTION TOP */}

                  <div className="question-result-top">

                    <div className="question-number-badge">
                      Q
                      {String(
                        result.question_number ||
                          index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="question-text">
                      <span>
                        INTERVIEW QUESTION
                      </span>

                      <h3>
                        {result.question ||
                          "Question unavailable"}
                      </h3>
                    </div>

                    <div
                      className={`question-score ${getScoreClass(
                        score
                      )}`}
                    >
                      <strong>
                        {score}
                      </strong>

                      <span>
                        /100
                      </span>
                    </div>

                  </div>

                  {/* ANSWER */}

                  <div className="answer-section">

                    <div className="answer-section-title">

                      <MessageSquare
                        size={16}
                      />

                      Your Answer

                    </div>

                    <div className="answer-box">

                      {result.answer ||
                        "No answer recorded."}

                    </div>

                  </div>

                  {/* AI FEEDBACK */}

                  <div className="feedback-section">

                    <div className="feedback-section-title">

                      <Sparkles
                        size={16}
                      />

                      AI Feedback

                    </div>

                    <div className="feedback-box">

                      {result.feedback ||
                        "No AI feedback available."}

                    </div>

                  </div>

                  {/* STRENGTHS + IMPROVEMENTS */}

                  <div className="feedback-columns">

                    <div className="strengths-box">

                      <div className="feedback-column-title">

                        <CheckCircle2
                          size={16}
                        />

                        Strengths

                      </div>

                      {strengths.length >
                      0 ? (
                        <ul>
                          {strengths.map(
                            (
                              strength,
                              strengthIndex
                            ) => (
                              <li
                                key={
                                  strengthIndex
                                }
                              >
                                <span>
                                  ✓
                                </span>

                                {strength}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p>
                          No specific
                          strengths recorded.
                        </p>
                      )}

                    </div>

                    <div className="improvements-box">

                      <div className="feedback-column-title">

                        <TrendingUp
                          size={16}
                        />

                        Improvements

                      </div>

                      {improvements.length >
                      0 ? (
                        <ul>
                          {improvements.map(
                            (
                              improvement,
                              improvementIndex
                            ) => (
                              <li
                                key={
                                  improvementIndex
                                }
                              >
                                <span>
                                  →
                                </span>

                                {improvement}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p>
                          No specific
                          improvements recorded.
                        </p>
                      )}

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </div>

      </section>

      {/* =================================================
          BOTTOM ACTION
          ================================================= */}

      <div className="result-bottom-actions">

        <button
          className="result-secondary-button"
          onClick={() =>
            navigate("/history")
          }
        >
          <ArrowLeft size={17} />

          Back to History
        </button>

        <button
          className="result-primary-button"
          onClick={() =>
            navigate("/interview")
          }
        >
          <BrainCircuit size={17} />

          Practice Again
        </button>

      </div>

    </div>
  );
}

export default History;

