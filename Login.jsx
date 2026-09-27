import { useState } from "react";
import { Eye, EyeOff, BrainCircuit, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/login",
        {
          email,
          password,
        }
      );

      console.log("Login successful:", response.data);

      localStorage.setItem(
        "access_token",
        response.data.access_token
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        alert(
          error.response.data.detail ||
            "Invalid email or password."
        );
      } else {
        alert(
          "Cannot connect to the backend. Make sure FastAPI is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      <div className="login-container">
        {/* Left Section */}
        <div className="login-brand">
          <div className="brand-icon">
            <BrainCircuit size={34} />
          </div>

          <h1>
            AI Interview
            <span>Coach</span>
          </h1>

          <p className="brand-description">
            Practice smarter. Build confidence. Ace your next
            interview with your personal AI interview coach.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-number">01</div>

              <div>
                <h3>AI Mock Interviews</h3>
                <p>
                  Practice realistic interview questions.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-number">02</div>

              <div>
                <h3>Instant Feedback</h3>
                <p>
                  Get detailed AI-powered evaluation.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-number">03</div>

              <div>
                <h3>Track Progress</h3>
                <p>
                  Monitor your interview performance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <div className="login-header">
            <div className="mobile-brand-icon">
              <BrainCircuit size={28} />
            </div>

            <h2>Welcome back</h2>

            <p>
              Sign in to continue your interview preparation.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="password-label">
                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    alert("Password reset coming soon.")
                  }
                >
                  Forgot password?
                </button>
              </div>

              <div className="password-input">
                <input
                  id="password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          {/* Register */}
          <div className="register-section">
            <p>
              Don't have an account?
              <Link
                to="/register"
                className="register-button"
              >
                Create account
              </Link>
            </p>
          </div>

          <div className="security-note">
            <span className="security-dot"></span>
            Your data is protected and securely stored.
          </div>
        </div>
      </div>

      <div className="login-footer">
        <p>
          © 2026 AI Interview Coach. Built for smarter
          interview preparation.
        </p>
      </div>
    </div>
  );
}

export default Login;

