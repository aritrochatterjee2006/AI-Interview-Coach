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
  Bell,
  User,
  Play,
  TrendingUp,
  Target,
  Award,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [interviews, setInterviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    const loadDashboard = async () => {
      const token =
        localStorage.getItem("access_token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // -----------------------------------------------------
        // GET CURRENT USER
        // -----------------------------------------------------

        const userResponse = await axios.get(
          `${API_URL}/api/auth/me`,
          {
            headers,
          }
        );

        const currentUser = userResponse.data;

        setUser(currentUser);

        // -----------------------------------------------------
        // GET ANALYTICS
        // -----------------------------------------------------

        const analyticsResponse =
          await axios.get(
            `${API_URL}/api/interview/analytics`,
            {
              headers,
              params: {
                user_id: currentUser.id,
              },
            }
          );

        setAnalytics(
          analyticsResponse.data
        );

        // -----------------------------------------------------
        // GET INTERVIEW HISTORY
        // -----------------------------------------------------

        const historyResponse =
          await axios.get(
            `${API_URL}/api/interview/history`,
            {
              headers,
            }
          );

        const history =
          Array.isArray(
            historyResponse.data?.interviews
          )
            ? historyResponse.data.interviews
            : [];

        setInterviews(history);
      } catch (err) {
        console.error(
          "Dashboard loading error:",
          err
        );

        if (
          err.response?.status === 401
        ) {
          localStorage.removeItem(
            "access_token"
          );

          navigate("/");
          return;
        }

        setError(
          err.response?.data?.detail ||
            "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "access_token"
    );

    navigate("/");
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const interviewDate =
      new Date(date);

    if (Number.isNaN(interviewDate.getTime())) {
      return "—";
    }

    return interviewDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  // =========================================================
  // READINESS CALCULATION
  // =========================================================

  const calculateReadiness = () => {
    if (!analytics) {
      return 0;
    }

    const average = Number(
      analytics.average_score || 0
    );

    const total = Number(
      analytics.total_interviews || 0
    );

    /*
     * Readiness combines:
     * - Average interview score
     * - Number of completed interviews
     *
     * Maximum readiness = 100
     */

    const experienceBonus = Math.min(
      total * 2,
      10
    );

    return Math.min(
      Math.round(
        average + experienceBonus
      ),
      100
    );
  };

  const readiness =
    calculateReadiness();

  // =========================================================
  // READINESS MESSAGE
  // =========================================================

  const getReadinessMessage = () => {
    if (readiness >= 85) {
      return "You're showing strong interview readiness.";
    }

    if (readiness >= 70) {
      return "You're making solid progress. Keep practicing.";
    }

    if (readiness >= 50) {
      return "You're building a good foundation. More practice will help.";
    }

    return "Complete more interviews to build your confidence.";
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#05030d",
          color: "#a78bfa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div className="dashboard-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="dashboard-sidebar">

        <div className="dashboard-logo">

          <div className="dashboard-logo-icon">
            AI
          </div>

          <div>
            <h2>Interview</h2>
            <span>Coach</span>
          </div>

        </div>

        <nav className="dashboard-nav">

          <button
            className="dashboard-nav-item active"
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
            className="dashboard-nav-item"
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

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="dashboard-main">

        {/* TOP BAR */}

        <header className="dashboard-topbar">

          <div>

            <p className="dashboard-small-title">
              AI INTERVIEW COACH
            </p>

            <h1>Dashboard</h1>

          </div>

          <div className="dashboard-top-actions">

            <button className="dashboard-icon-button">
              <Bell size={20} />

              <span className="notification-dot"></span>
            </button>

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

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 18px",
              borderRadius: "12px",
              background:
                "rgba(239, 68, 68, 0.12)",
              border:
                "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
            }}
          >
            {error}
          </div>
        )}

        {/* =====================================================
            WELCOME
        ===================================================== */}

        <section className="dashboard-welcome">

          <div>

            <p className="dashboard-welcome-label">
              WELCOME BACK 👋
            </p>

            <h2>
              Ready to ace your next interview?
            </h2>

            <p>
              Practice with AI-powered mock
              interviews and improve your
              confidence.
            </p>

          </div>

          <div className="welcome-decoration">

            <div className="welcome-circle circle-one"></div>
            <div className="welcome-circle circle-two"></div>
            <div className="welcome-circle circle-three"></div>

          </div>

        </section>

        {/* =====================================================
            DYNAMIC STATS
        ===================================================== */}

        <section className="dashboard-stats">

          {/* TOTAL INTERVIEWS */}

          <div className="stat-card">

            <div className="stat-icon">
              <Video size={22} />
            </div>

            <div>

              <p>Total Interviews</p>

              <h3>
                {analytics?.total_interviews || 0}
              </h3>

              <span>
                Completed sessions
              </span>

            </div>

          </div>

          {/* AVERAGE SCORE */}

          <div className="stat-card">

            <div className="stat-icon">
              <Target size={22} />
            </div>

            <div>

              <p>Average Score</p>

              <h3>
                {Math.round(
                  Number(
                    analytics?.average_score || 0
                  )
                )}
                %
              </h3>

              <span>
                Across all interviews
              </span>

            </div>

          </div>

          {/* IMPROVEMENT */}

          <div className="stat-card">

            <div className="stat-icon">
              <TrendingUp size={22} />
            </div>

            <div>

              <p>Improvement</p>

              <h3>
                {Math.round(
                  Number(
                    analytics?.improvement || 0
                  )
                )}
                %
              </h3>

              <span>
                Since first interview
              </span>

            </div>

          </div>

          {/* BEST SCORE */}

          <div className="stat-card">

            <div className="stat-icon">
              <Award size={22} />
            </div>

            <div>

              <p>Best Score</p>

              <h3>
                {Math.round(
                  Number(
                    analytics?.best_score || 0
                  )
                )}
                %
              </h3>

              <span>
                Personal best
              </span>

            </div>

          </div>

        </section>

        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <section className="dashboard-grid">

          {/* START INTERVIEW */}

          <div className="dashboard-card interview-card">

            <div className="card-heading">

              <div>

                <p className="card-label">
                  PRACTICE SESSION
                </p>

                <h2>
                  Start Mock Interview
                </h2>

                <p>
                  Choose your target role and
                  difficulty level.
                </p>

              </div>

              <div className="card-heading-icon">
                <Video size={24} />
              </div>

            </div>

            <div className="interview-form">

              <div className="select-group">

                <label>
                  Target Role
                </label>

                <select defaultValue="Software Developer">

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

              <div className="select-group">

                <label>
                  Difficulty
                </label>

                <select defaultValue="Intermediate">

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

              <button
                className="start-interview-button"
                onClick={() =>
                  navigate("/interview")
                }
              >
                <Play size={18} />

                Start Mock Interview
              </button>

            </div>

          </div>

          {/* =================================================
              READINESS
          ================================================= */}

          <div className="dashboard-card readiness-card">

            <div className="card-heading">

              <div>

                <p className="card-label">
                  YOUR PROGRESS
                </p>

                <h2>
                  Interview Readiness
                </h2>

              </div>

            </div>

            <div className="readiness-content">

              <div
                className="progress-circle"
                style={{
                  background: `conic-gradient(
                    #8b5cf6 ${readiness * 3.6}deg,
                    rgba(255,255,255,0.08) ${readiness * 3.6}deg
                  )`,
                }}
              >

                <div className="progress-inner">

                  <strong>
                    {readiness}%
                  </strong>

                  <span>
                    Ready
                  </span>

                </div>

              </div>

              <div className="readiness-info">

                <p>
                  {getReadinessMessage()}
                </p>

                <span>
                  Based on your interview
                  performance and practice
                  experience.
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            RECENT INTERVIEWS
        ===================================================== */}

        <section className="dashboard-card recent-card">

          <div className="recent-header">

            <div>

              <p className="card-label">
                ACTIVITY
              </p>

              <h2>
                Recent Interviews
              </h2>

            </div>

            <button
              className="view-all-button"
              onClick={() =>
                navigate("/history")
              }
            >
              View All
            </button>

          </div>

          <div className="interview-table">

            <div className="table-row table-header">

              <span>Role</span>
              <span>Type</span>
              <span>Score</span>
              <span>Date</span>
              <span>Status</span>

            </div>

            {/* =================================================
                REAL INTERVIEW DATA
            ================================================= */}

            {interviews.length === 0 ? (

              <div
                className="table-row"
                style={{
                  justifyContent: "center",
                  opacity: 0.7,
                }}
              >
                <span>
                  No interviews completed yet.
                </span>
              </div>

            ) : (

              interviews
                .slice(0, 3)
                .map((interview) => (

                  <div
                    className="table-row"
                    key={interview.id}
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      navigate(
                        `/history/${interview.id}`
                      )
                    }
                  >

                    <span className="role-name">
                      {interview.role ||
                        "General Interview"}
                    </span>

                    <span>
                      {interview.interview_type ||
                        "General"}
                    </span>

                    <span className="score">
                      {Math.round(
                        Number(
                          interview.overall_score ||
                            0
                        )
                      )}
                      %
                    </span>

                    <span>
                      {formatDate(
                        interview.created_at
                      )}
                    </span>

                    <span className="status completed">
                      Completed
                    </span>

                  </div>

                ))

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;

