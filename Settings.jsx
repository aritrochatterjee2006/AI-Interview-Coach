import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  LayoutDashboard,
  Video,
  BarChart3,
  History,
  Settings as SettingsIcon,
  LogOut,
  User,
  Mail,
  Lock,
  Shield,
  Bell,
  Palette,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Mic,
  Brain,
  CalendarDays,
  Trophy,
  Activity,
  KeyRound,
  ChevronRight,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function Settings() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [totalInterviews, setTotalInterviews] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [notifications, setNotifications] =
    useState(true);

  const [aiFeedback, setAiFeedback] =
    useState(true);

  const [voiceInterview, setVoiceInterview] =
    useState(true);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD ACCOUNT DATA
  // =====================================================

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      setError("");

      const userResponse = await axios.get(
        `${API_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const currentUser =
        userResponse.data;

      setUser(currentUser);
      setName(currentUser.name || "");
      setEmail(currentUser.email || "");

      try {
        const analyticsResponse =
          await axios.get(
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

        setTotalInterviews(
          analyticsResponse.data
            ?.total_interviews || 0
        );

        setBestScore(
          analyticsResponse.data
            ?.best_score || 0
        );

      } catch (analyticsError) {
        console.error(
          "Analytics loading error:",
          analyticsError
        );
      }

    } catch (err) {
      console.error(
        "Failed to load account:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem(
          "access_token"
        );

        navigate("/");
        return;
      }

      setError(
        "Unable to load your account information."
      );
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "access_token"
    );

    navigate("/");
  };

  // =====================================================
  // PROFILE
  // =====================================================

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!name.trim()) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    /*
     * The current backend does not yet contain
     * a profile-update endpoint.
     *
     * Therefore this updates the current UI state
     * without pretending that the database was changed.
     */

    try {
      setSavingProfile(true);

      setUser((previousUser) => ({
        ...previousUser,
        name: name.trim(),
      }));

      setMessage(
        "Profile information updated for this session."
      );

    } finally {
      setSavingProfile(false);
    }
  };

  // =====================================================
  // PASSWORD STRENGTH
  // =====================================================

  const getPasswordStrength = () => {
    if (!newPassword) {
      return {
        label: "Enter a password",
        percentage: 0,
        className: "empty",
      };
    }

    let score = 0;

    if (newPassword.length >= 8) {
      score++;
    }

    if (/[A-Z]/.test(newPassword)) {
      score++;
    }

    if (/[0-9]/.test(newPassword)) {
      score++;
    }

    if (/[^A-Za-z0-9]/.test(newPassword)) {
      score++;
    }

    if (score <= 1) {
      return {
        label: "Weak",
        percentage: 25,
        className: "weak",
      };
    }

    if (score === 2) {
      return {
        label: "Fair",
        percentage: 50,
        className: "fair",
      };
    }

    if (score === 3) {
      return {
        label: "Good",
        percentage: 75,
        className: "good",
      };
    }

    return {
      label: "Strong",
      percentage: 100,
      className: "strong",
    };
  };

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handleChangePassword = (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!currentPassword) {
      setError(
        "Please enter your current password."
      );
      return;
    }

    if (!newPassword) {
      setError(
        "Please enter a new password."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "New passwords do not match."
      );
      return;
    }

    /*
     * Password update endpoint is not currently
     * available in the backend.
     */

    setMessage(
      "Password validation completed. The secure backend password update will be connected next."
    );

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (!user) {
    return (
      <div className="settings-loading-page">

        <div className="settings-loading-orb">
          <SettingsIcon size={30} />
        </div>

        <h2>
          Loading Settings
        </h2>

        <p>
          Preparing your account control center...
        </p>

      </div>
    );
  }

  const passwordStrength =
    getPasswordStrength();

  return (
    <div className="dashboard-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="dashboard-sidebar">

        <div className="dashboard-logo">

          <div className="dashboard-logo-icon">
            AI
          </div>

          <div>
            <h2>
              Interview
            </h2>

            <span>
              Coach
            </span>
          </div>

        </div>

        <nav className="dashboard-nav">

          <button
            className="dashboard-nav-item"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <LayoutDashboard size={20} />
            <span>
              Dashboard
            </span>
          </button>

          <button
            className="dashboard-nav-item"
            onClick={() =>
              navigate("/interview")
            }
          >
            <Video size={20} />
            <span>
              Interview
            </span>
          </button>

          <button
            className="dashboard-nav-item"
            onClick={() =>
              navigate("/analytics")
            }
          >
            <BarChart3 size={20} />
            <span>
              Analytics
            </span>
          </button>

          <button
            className="dashboard-nav-item"
            onClick={() =>
              navigate("/history")
            }
          >
            <History size={20} />
            <span>
              History
            </span>
          </button>

          <button
            className="dashboard-nav-item active"
            onClick={() =>
              navigate("/settings")
            }
          >
            <SettingsIcon size={20} />
            <span>
              Settings
            </span>
          </button>

        </nav>

        <button
          className="dashboard-logout"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span>
            Logout
          </span>
        </button>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="dashboard-main settings-main">

        {/* TOP BAR */}

        <header className="dashboard-topbar">

          <div>

            <p className="dashboard-small-title">
              AI INTERVIEW COACH
            </p>

            <h1>
              Settings
            </h1>

          </div>

          <div className="dashboard-top-actions">

            <div className="dashboard-profile">

              <div className="profile-avatar">
                <User size={20} />
              </div>

              <div>

                <strong>
                  {user.name}
                </strong>

                <span>
                  {user.email}
                </span>

              </div>

            </div>

          </div>

        </header>

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="settings-intro">

          <div>

            <button
              className="settings-back-button"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              <ArrowLeft size={16} />
              Dashboard
            </button>

            <p className="card-label">
              CONTROL CENTER
            </p>

            <h2>
              Account & Preferences
            </h2>

            <p>
              Manage your profile, security and
              Interview Coach experience from one place.
            </p>

          </div>

          <div className="settings-intro-decoration">
            <Sparkles size={25} />
          </div>

        </section>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {message && (
          <div className="settings-message success">

            <CheckCircle2 size={18} />

            <span>
              {message}
            </span>

            <button
              onClick={() =>
                setMessage("")
              }
            >
              ×
            </button>

          </div>
        )}

        {error && (
          <div className="settings-message error">

            <AlertCircle size={18} />

            <span>
              {error}
            </span>

            <button
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>

          </div>
        )}

        {/* =================================================
            PROFILE HERO
        ================================================= */}

        <section className="settings-profile-hero">

          <div className="settings-profile-glow"></div>

          <div className="settings-profile-main">

            <div className="settings-avatar">

              <span>
                {user.name
                  ? user.name
                      .charAt(0)
                      .toUpperCase()
                  : "U"}
              </span>

              <div className="settings-avatar-status">
                <span></span>
              </div>

            </div>

            <div className="settings-profile-info">

              <p className="card-label">
                YOUR ACCOUNT
              </p>

              <h2>
                {user.name}
              </h2>

              <div className="settings-profile-email">
                <Mail size={14} />
                {user.email}
              </div>

              <div className="settings-active-badge">
                <span></span>
                Account Active
              </div>

            </div>

          </div>

          <div className="settings-profile-stats">

            <div className="settings-profile-stat">

              <Activity size={18} />

              <div>
                <strong>
                  {totalInterviews}
                </strong>

                <span>
                  Interviews
                </span>
              </div>

            </div>

            <div className="settings-profile-stat">

              <Trophy size={18} />

              <div>
                <strong>
                  {bestScore}%
                </strong>

                <span>
                  Best Score
                </span>
              </div>

            </div>

            <div className="settings-profile-stat">

              <Shield size={18} />

              <div>
                <strong>
                  Secure
                </strong>

                <span>
                  Account Status
                </span>
              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            PROFILE + SECURITY
        ================================================= */}

        <section className="settings-grid">

          {/* PROFILE */}

          <div className="settings-panel">

            <div className="settings-panel-header">

              <div className="settings-panel-icon purple">
                <User size={20} />
              </div>

              <div>

                <p className="card-label">
                  PROFILE
                </p>

                <h2>
                  Personal Information
                </h2>

              </div>

            </div>

            <form
              onSubmit={handleSaveProfile}
              className="settings-form"
            >

              <div className="settings-field">

                <label>
                  Full Name
                </label>

                <div className="settings-input">

                  <User size={17} />

                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    placeholder="Your full name"
                  />

                </div>

              </div>

              <div className="settings-field">

                <label>
                  Email Address
                </label>

                <div className="settings-input disabled">

                  <Mail size={17} />

                  <input
                    type="email"
                    value={email}
                    disabled
                  />

                  <span className="verified-tag">
                    Verified
                  </span>

                </div>

              </div>

              <div className="settings-info-box">

                <Shield size={16} />

                <span>
                  Your email is protected and used
                  for account authentication.
                </span>

              </div>

              <button
                type="submit"
                className="settings-primary-button"
                disabled={savingProfile}
              >

                <Save size={17} />

                {savingProfile
                  ? "Saving..."
                  : "Save Changes"}

              </button>

            </form>

          </div>

          {/* SECURITY */}

          <div className="settings-panel">

            <div className="settings-panel-header">

              <div className="settings-panel-icon cyan">
                <Shield size={20} />
              </div>

              <div>

                <p className="card-label">
                  SECURITY
                </p>

                <h2>
                  Password Protection
                </h2>

              </div>

            </div>

            <form
              onSubmit={handleChangePassword}
              className="settings-form"
            >

              <div className="settings-field">

                <label>
                  Current Password
                </label>

                <div className="settings-input">

                  <Lock size={17} />

                  <input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value
                      )
                    }
                    placeholder="Current password"
                  />

                  <button
                    type="button"
                    className="settings-eye"
                    onClick={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword
                      )
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>

              <div className="settings-field">

                <label>
                  New Password
                </label>

                <div className="settings-input">

                  <KeyRound size={17} />

                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    placeholder="New password"
                  />

                  <button
                    type="button"
                    className="settings-eye"
                    onClick={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>

              {/* PASSWORD STRENGTH */}

              <div className="password-strength">

                <div className="password-strength-top">

                  <span>
                    Password Strength
                  </span>

                  <strong
                    className={
                      passwordStrength.className
                    }
                  >
                    {passwordStrength.label}
                  </strong>

                </div>

                <div className="password-strength-bar">

                  <span
                    className={
                      passwordStrength.className
                    }
                    style={{
                      width: `${passwordStrength.percentage}%`,
                    }}
                  ></span>

                </div>

              </div>

              <div className="settings-field">

                <label>
                  Confirm New Password
                </label>

                <div className="settings-input">

                  <Lock size={17} />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Confirm new password"
                  />

                  <button
                    type="button"
                    className="settings-eye"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>

              <button
                type="submit"
                className="settings-security-button"
              >
                <Shield size={17} />
                Update Password
              </button>

            </form>

          </div>

        </section>

        {/* =================================================
            PREFERENCES
        ================================================= */}

        <section className="settings-panel settings-preferences-panel">

          <div className="settings-panel-header">

            <div className="settings-panel-icon purple">
              <Palette size={20} />
            </div>

            <div>

              <p className="card-label">
                PREFERENCES
              </p>

              <h2>
                Experience Settings
              </h2>

              <p className="settings-panel-description">
                Customize your Interview Coach experience.
              </p>

            </div>

          </div>

          <div className="settings-preferences">

            {/* APPEARANCE */}

            <div className="settings-preference">

              <div className="settings-preference-icon">
                <Palette size={19} />
              </div>

              <div className="settings-preference-content">

                <strong>
                  Appearance
                </strong>

                <span>
                  AI Interview Coach dark interface
                </span>

              </div>

              <div className="settings-mode-badge">
                <span className="mode-dot"></span>
                Dark Mode
              </div>

            </div>

            {/* NOTIFICATIONS */}

            <div className="settings-preference">

              <div className="settings-preference-icon">
                <Bell size={19} />
              </div>

              <div className="settings-preference-content">

                <strong>
                  Interview Notifications
                </strong>

                <span>
                  Receive reminders for interview practice
                </span>

              </div>

              <label className="settings-switch">

                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={() =>
                    setNotifications(
                      !notifications
                    )
                  }
                />

                <span></span>

              </label>

            </div>

            {/* AI FEEDBACK */}

            <div className="settings-preference">

              <div className="settings-preference-icon">
                <Brain size={19} />
              </div>

              <div className="settings-preference-content">

                <strong>
                  AI Feedback
                </strong>

                <span>
                  Show detailed AI feedback after interviews
                </span>

              </div>

              <label className="settings-switch">

                <input
                  type="checkbox"
                  checked={aiFeedback}
                  onChange={() =>
                    setAiFeedback(
                      !aiFeedback
                    )
                  }
                />

                <span></span>

              </label>

            </div>

            {/* VOICE */}

            <div className="settings-preference">

              <div className="settings-preference-icon">
                <Mic size={19} />
              </div>

              <div className="settings-preference-content">

                <strong>
                  Voice Interview
                </strong>

                <span>
                  Enable voice-based interview sessions
                </span>

              </div>

              <label className="settings-switch">

                <input
                  type="checkbox"
                  checked={voiceInterview}
                  onChange={() =>
                    setVoiceInterview(
                      !voiceInterview
                    )
                  }
                />

                <span></span>

              </label>

            </div>

          </div>

        </section>

        {/* =================================================
            ACCOUNT INFORMATION
        ================================================= */}

        <section className="settings-account-grid">

          <div className="settings-account-info">

            <div className="settings-account-icon">
              <CalendarDays size={20} />
            </div>

            <div>

              <p>
                ACCOUNT
              </p>

              <strong>
                Member Since
              </strong>

              <span>
                {user.created_at
                  ? new Date(
                      user.created_at
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )
                  : "Recently joined"}
              </span>

            </div>

          </div>

          <div className="settings-account-info">

            <div className="settings-account-icon cyan">
              <Activity size={20} />
            </div>

            <div>

              <p>
                ACTIVITY
              </p>

              <strong>
                Practice Sessions
              </strong>

              <span>
                {totalInterviews} completed interviews
              </span>

            </div>

          </div>

          <div className="settings-account-info">

            <div className="settings-account-icon green">
              <Trophy size={20} />
            </div>

            <div>

              <p>
                PERFORMANCE
              </p>

              <strong>
                Personal Best
              </strong>

              <span>
                {bestScore}% highest score
              </span>

            </div>

          </div>

        </section>

        {/* =================================================
            SECURITY STATUS
        ================================================= */}

        <section className="settings-security-status">

          <div className="settings-security-status-left">

            <div className="settings-security-shield">
              <Shield size={22} />
            </div>

            <div>

              <p className="card-label">
                SECURITY STATUS
              </p>

              <h3>
                Your account is protected
              </h3>

              <span>
                Authentication is enabled and
                your account is currently active.
              </span>

            </div>

          </div>

          <div className="settings-protected-badge">
            <CheckCircle2 size={15} />
            Protected
          </div>

        </section>

        {/* =================================================
            SIGN OUT
        ================================================= */}

        <section className="settings-danger-zone">

          <div>

            <p className="card-label">
              SESSION
            </p>

            <h3>
              Sign out of Interview Coach
            </h3>

            <p>
              You can sign back in anytime using
              your registered account.
            </p>

          </div>

          <button
            className="settings-signout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Sign Out
            <ChevronRight size={15} />
          </button>

        </section>

      </main>

    </div>
  );
}

export default Settings;