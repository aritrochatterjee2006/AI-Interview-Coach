import { useState } from "react";
import {
  Eye,
  EyeOff,
  BrainCircuit,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/register",
        {
          name,
          email,
          password,
        }
      );

      console.log(
        "Registration successful:",
        response.data
      );

      alert(
        "Account created successfully! Please sign in."
      );

      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);

      if (error.response) {
        alert(
          error.response.data.detail ||
            "Registration failed."
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
        {/* LEFT SIDE */}
        <div className="login-brand">
          <div className="brand-icon">
            <BrainCircuit size={34} />
          </div>

          <h1>
            AI Interview
            <span>Coach</span>
          </h1>

          <p className="brand-description">
            Build confidence, practice smarter, and prepare
            for your next interview with AI.
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
                  Get AI-powered feedback on your answers.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-number">03</div>

              <div>
                <h3>Track Your Progress</h3>
                <p>
                  Monitor your performance over time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* REGISTER CARD */}
        <div className="login-card">
          <div className="login-header">
            <div className="mobile-brand-icon">
              <BrainCircuit size={28} />
            </div>

            <h2>Create your account</h2>

            <p>
              Start preparing for your next interview today.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* NAME */}
            <div className="form-group">
              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="password-input">
                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
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

            {/* CONFIRM PASSWORD */}
            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="password-input">
                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="register-section">
            <p>
              Already have an account?
              <Link
                to="/"
                className="register-button"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="security-note">
            <span className="security-dot"></span>
            Your account information is securely stored.
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

export default Register;