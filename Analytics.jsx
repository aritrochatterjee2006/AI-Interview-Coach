import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  LayoutDashboard,
  Video,
  BarChart3,
  History,
  Settings,
  LogOut,
  User,
  TrendingUp,
  Target,
  Award,
  Activity,
  RefreshCw,
  ArrowLeft,
  Brain,
  Trophy,
  Sparkles,
  CalendarDays,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function Analytics() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD ANALYTICS
  // =====================================================

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      setError("");

      if (analytics) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // -------------------------------------------------
      // Get logged-in user
      // -------------------------------------------------

      const userResponse = await axios.get(
        `${API_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const currentUser = userResponse.data;

      setUser(currentUser);

      // -------------------------------------------------
      // Get analytics for current user
      // -------------------------------------------------

      const analyticsResponse = await axios.get(
        `${API_URL}/api/interview/analytics`,
        {
          params: {
            user_id: currentUser.id,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnalytics(analyticsResponse.data);
    } catch (err) {
      console.error(
        "Failed to load analytics:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to load analytics. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  // =====================================================
  // PERFORMANCE MESSAGE
  // =====================================================

  const getPerformanceMessage = () => {
    if (!analytics) {
      return "Complete an interview to start building your performance analytics.";
    }

    if (analytics.total_interviews === 0) {
      return "Complete your first interview to start building your performance analytics.";
    }

    if (analytics.average_score >= 85) {
      return "Your recent interview scores show strong performance. Continue practicing to maintain consistency.";
    }

    if (analytics.average_score >= 70) {
      return "Your performance is developing well. Regular practice can help you improve consistency and accuracy.";
    }

    if (analytics.average_score >= 50) {
      return "You are building your interview skills. Focus on the feedback from each session and keep practicing.";
    }

    return "Keep practicing and use the feedback from each interview to identify areas that need more attention.";
  };

  // =====================================================
  // SCORE LABEL
  // =====================================================

  const getScoreLabel = (score) => {
    if (score >= 85) {
      return "Excellent";
    }

    if (score >= 70) {
      return "Good";
    }

    if (score >= 50) {
      return "Average";
    }

    return "Needs Practice";
  };

  // =====================================================
  // SCORE CLASS
  // =====================================================

  const getScoreClass = (score) => {
    if (score >= 85) {
      return "excellent";
    }

    if (score >= 70) {
      return "good";
    }

    if (score >= 50) {
      return "average";
    }

    return "needs-practice";
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (dateString) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="analytics-loading-page">
        <RefreshCw
          size={34}
          className="analytics-loading-icon"
        />

        <h2>Loading Analytics</h2>

        <p>
          Preparing your interview performance data...
        </p>
      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="dashboard-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="dashboard-sidebar">

        {/* LOGO */}

        <div className="dashboard-logo">
          <div className="dashboard-logo-icon">
            AI
          </div>

          <div>
            <h2>Interview</h2>
            <span>Coach</span>
          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="dashboard-nav">

          <button
            className="dashboard-nav-item"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          <button
            className="dashboard-nav-item"
            onClick={() =>
              navigate("/interview")
            }
          >
            <Video size={20} />
            <span>Interview</span>
          </button>

          <button
            className="dashboard-nav-item active"
            onClick={() =>
              navigate("/analytics")
            }
          >
            <BarChart3 size={20} />
            <span>Analytics</span>
          </button>

          <button
            className="dashboard-nav-item"
            onClick={() =>
              navigate("/history")
            }
          >
            <History size={20} />
            <span>History</span>
          </button>

          <button
            className="dashboard-nav-item"
            onClick={() =>
              navigate("/settings")
            }
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>

        </nav>

        {/* LOGOUT */}

        <button
          className="dashboard-logout"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>

      </aside>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="dashboard-main">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <header className="dashboard-topbar">

          <div>
            <p className="dashboard-small-title">
              AI INTERVIEW COACH
            </p>

            <h1>
              Analytics
            </h1>
          </div>

          <div className="dashboard-top-actions">

            <div className="dashboard-profile">

              <div className="profile-avatar">
                <User size={20} />
              </div>

              <div>
                <strong>
                  {user?.name || "User"}
                </strong>

                <span>
                  {user?.email || "Candidate"}
                </span>
              </div>

            </div>

          </div>

        </header>

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className="analytics-page-header">

          <div>

            <button
              className="analytics-back-button"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              <ArrowLeft size={17} />
              Dashboard
            </button>

            <p className="card-label">
              PERFORMANCE INSIGHTS
            </p>

            <h2>
              Track Your Progress
            </h2>

            <p>
              Understand your interview performance,
              track your scores, and identify areas
              for improvement.
            </p>

          </div>

          <button
            className="analytics-refresh-button"
            onClick={loadAnalytics}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "analytics-refresh-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="analytics-error">
            <strong>
              Analytics Error
            </strong>

            <span>
              {error}
            </span>

            <button
              onClick={loadAnalytics}
            >
              Try Again
            </button>
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="analytics-stats-grid">

          {/* TOTAL INTERVIEWS */}

          <div className="analytics-stat-card">

            <div className="analytics-stat-icon">
              <Video size={22} />
            </div>

            <div>
              <span>
                Total Interviews
              </span>

              <strong>
                {analytics?.total_interviews || 0}
              </strong>

              <small>
                Completed sessions
              </small>
            </div>

          </div>

          {/* AVERAGE SCORE */}

          <div className="analytics-stat-card">

            <div className="analytics-stat-icon">
              <Target size={22} />
            </div>

            <div>
              <span>
                Average Score
              </span>

              <strong>
                {analytics?.average_score || 0}%
              </strong>

              <small>
                Across all interviews
              </small>
            </div>

          </div>

          {/* BEST SCORE */}

          <div className="analytics-stat-card">

            <div className="analytics-stat-icon">
              <Trophy size={22} />
            </div>

            <div>
              <span>
                Best Score
              </span>

              <strong>
                {analytics?.best_score || 0}%
              </strong>

              <small>
                Personal best
              </small>
            </div>

          </div>

          {/* IMPROVEMENT */}

          <div className="analytics-stat-card">

            <div className="analytics-stat-icon">
              <TrendingUp size={22} />
            </div>

            <div>
              <span>
                Improvement
              </span>

              <strong>
                {analytics?.improvement > 0
                  ? "+"
                  : ""}
                {analytics?.improvement || 0}%
              </strong>

              <small>
                Since first interview
              </small>
            </div>

          </div>

        </section>

        {/* =================================================
            AI INSIGHT
        ================================================= */}

        <section className="analytics-insight-card">

          <div className="analytics-insight-icon">
            <Brain size={25} />
          </div>

          <div className="analytics-insight-content">

            <div className="analytics-insight-title">

              <p className="card-label">
                AI PERFORMANCE INSIGHT
              </p>

              <Sparkles size={18} />

            </div>

            <h2>
              Your Interview Progress
            </h2>

            <p>
              {getPerformanceMessage()}
            </p>

          </div>

        </section>

        {/* =================================================
            SCORE PROGRESSION
        ================================================= */}

        <section className="analytics-card">

          <div className="analytics-card-header">

            <div>
              <p className="card-label">
                SCORE TREND
              </p>

              <h2>
                Score Progression
              </h2>

              <p className="analytics-card-description">
                Your performance across completed interviews.
              </p>
            </div>

            <Activity size={22} />

          </div>

          {analytics?.score_history?.length > 0 ? (

            <div className="analytics-chart">

              {analytics.score_history.map(
                (item, index) => {

                  const score =
                    Number(item.score) || 0;

                  const safeScore = Math.min(
                    Math.max(score, 0),
                    100
                  );

                  return (
                    <div
                      className="analytics-chart-item"
                      key={`${item.interview_number}-${index}`}
                    >

                      <div className="analytics-bar-wrapper">

                        <div
                          className={`analytics-bar ${getScoreClass(
                            safeScore
                          )}`}
                          style={{
                            height: `${Math.max(
                              safeScore,
                              5
                            )}%`,
                          }}
                        >

                          <span>
                            {safeScore}%
                          </span>

                        </div>

                      </div>

                      <strong>
                        #{item.interview_number}
                      </strong>

                      <small>
                        {formatDate(item.date)}
                      </small>

                    </div>
                  );
                }
              )}

            </div>

          ) : (

            <div className="analytics-empty-chart">

              <Activity size={34} />

              <h3>
                No Score Data Yet
              </h3>

              <p>
                Complete an interview to see
                your score progression here.
              </p>

              <button
                onClick={() =>
                  navigate("/interview")
                }
              >
                Start Interview
              </button>

            </div>

          )}

        </section>

        {/* =================================================
            TWO COLUMN ANALYTICS
        ================================================= */}

        <section className="analytics-two-column">

          {/* =================================================
              INTERVIEW TYPE PERFORMANCE
          ================================================= */}

          <div className="analytics-card">

            <div className="analytics-card-header">

              <div>
                <p className="card-label">
                  INTERVIEW TYPES
                </p>

                <h2>
                  Type Performance
                </h2>
              </div>

              <Target size={22} />

            </div>

            {analytics?.type_performance?.length > 0 ? (

              <div className="analytics-performance-list">

                {analytics.type_performance.map(
                  (item) => {

                    const score = Math.min(
                      Math.max(
                        Number(
                          item.average_score
                        ) || 0,
                        0
                      ),
                      100
                    );

                    return (
                      <div
                        className="analytics-performance-item"
                        key={item.type}
                      >

                        <div className="analytics-performance-top">

                          <span>
                            {item.type}
                          </span>

                          <strong>
                            {score}%
                          </strong>

                        </div>

                        <div className="analytics-progress">

                          <div
                            className="analytics-progress-fill"
                            style={{
                              width: `${score}%`,
                            }}
                          />

                        </div>

                        <div className="analytics-performance-bottom">

                          <small>
                            {item.interviews} interview
                            {item.interviews !== 1
                              ? "s"
                              : ""}
                          </small>

                          <small>
                            {getScoreLabel(score)}
                          </small>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            ) : (

              <div className="analytics-empty">

                <Target size={30} />

                <p>
                  No interview type data yet.
                </p>

              </div>

            )}

          </div>

          {/* =================================================
              ROLE PERFORMANCE
          ================================================= */}

          <div className="analytics-card">

            <div className="analytics-card-header">

              <div>
                <p className="card-label">
                  TARGET ROLES
                </p>

                <h2>
                  Role Performance
                </h2>
              </div>

              <Award size={22} />

            </div>

            {analytics?.role_performance?.length > 0 ? (

              <div className="analytics-performance-list">

                {analytics.role_performance.map(
                  (item) => {

                    const score = Math.min(
                      Math.max(
                        Number(
                          item.average_score
                        ) || 0,
                        0
                      ),
                      100
                    );

                    return (
                      <div
                        className="analytics-performance-item"
                        key={item.role}
                      >

                        <div className="analytics-performance-top">

                          <span>
                            {item.role}
                          </span>

                          <strong>
                            {score}%
                          </strong>

                        </div>

                        <div className="analytics-progress">

                          <div
                            className="analytics-progress-fill"
                            style={{
                              width: `${score}%`,
                            }}
                          />

                        </div>

                        <div className="analytics-performance-bottom">

                          <small>
                            {item.interviews} interview
                            {item.interviews !== 1
                              ? "s"
                              : ""}
                          </small>

                          <small>
                            {getScoreLabel(score)}
                          </small>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            ) : (

              <div className="analytics-empty">

                <Award size={30} />

                <p>
                  No role data yet.
                </p>

              </div>

            )}

          </div>

        </section>

        {/* =================================================
            RECENT ACTIVITY
        ================================================= */}

        <section className="analytics-card analytics-summary-card">

          <div className="analytics-card-header">

            <div>
              <p className="card-label">
                PERFORMANCE SUMMARY
              </p>

              <h2>
                Your Current Performance
              </h2>
            </div>

            <CalendarDays size={22} />

          </div>

          <div className="analytics-summary-grid">

            <div className="analytics-summary-item">

              <span>
                Average Performance
              </span>

              <strong>
                {analytics?.average_score || 0}%
              </strong>

              <small
                className={getScoreClass(
                  analytics?.average_score || 0
                )}
              >
                {getScoreLabel(
                  analytics?.average_score || 0
                )}
              </small>

            </div>

            <div className="analytics-summary-item">

              <span>
                Highest Score
              </span>

              <strong>
                {analytics?.best_score || 0}%
              </strong>

              <small>
                Personal best
              </small>

            </div>

            <div className="analytics-summary-item">

              <span>
                Score Change
              </span>

              <strong>
                {analytics?.improvement > 0
                  ? "+"
                  : ""}
                {analytics?.improvement || 0}%
              </strong>

              <small>
                First vs latest interview
              </small>

            </div>

          </div>

        </section>

        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <section className="analytics-actions">

          <button
            className="secondary-interview-button"
            onClick={() =>
              navigate("/history")
            }
          >
            <History size={18} />
            View Interview History
          </button>

          <button
            className="start-interview-button"
            onClick={() =>
              navigate("/interview")
            }
          >
            <Video size={18} />
            Practice Again
          </button>

        </section>

      </main>

    </div>
  );
}

export default Analytics;