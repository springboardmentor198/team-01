import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { api } from "../../services/api";

import "./Login.css";
import logo from "../../assets/images/logo.png";


const getPostLoginPath = ({ profileCompleted, role }) => {
  if (role === "ADMIN") {
    return "/admin/dashboard";
  }

  if (profileCompleted === false) {
    return "/onboarding";
  }

  if (profileCompleted === true) {
    const dashboardPaths = {
      BUYER: "/buyer/dashboard",
      AGENT: "/agent/dashboard",
      LEGAL_REVIEWER: "/legal/dashboard",
      BANK: "/bank/dashboard",
    };

    return dashboardPaths[role] || "/dashboard";
  }

  return "/dashboard";
};

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    setLoading(true);

    try {
      const authentication = await api.login(email, password);

      navigate(getPostLoginPath(authentication), {
        replace: true,
      });
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",

    onSuccess: async (tokenResponse) => {
      setError("");
      setGoogleLoading(true);

      try {
        const authentication =
          await api.loginWithGoogle(tokenResponse);

        navigate(getPostLoginPath(authentication), {
          replace: true,
        });
      } catch (err) {
        setError(err.message || "Google sign-in failed");
      } finally {
        setGoogleLoading(false);
      }
    },

    onError: () => {
      setError("Google sign-in failed");
    },
  });

  return (
    <AuthLayout>

      <div className="auth-card">

        <div className="auth-header">

          <div className="auth-header-top">

            <div className="logo-circle">
              <img src={logo} alt="DueDiligence logo" />
            </div>

            <h1 className="auth-title">
              Welcome Back
            </h1>

          </div>

          <p className="auth-subtitle">
            Sign in to continue to the Property Due Diligence System
          </p>

        </div>

        {error && (
          <div className="auth-error-msg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
                  <div className="auth-field">
            <label htmlFor="email">Email</label>

            <div className="input-group">

              <svg
                className="input-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 6l-10 7L2 6" />
                <path d="M2 6h20v12H2z" />
              </svg>

              <input
                id="email"
                type="email"
                className="auth-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

            </div>
          </div>

          <div className="auth-field">

            <label htmlFor="password">
              Password
            </label>

            <div className="input-group">

              <svg
                className="input-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="11"
                  rx="2"
                />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="auth-input has-trailing-icon"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="input-trailing-icon"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line
                      x1="1"
                      y1="1"
                      x2="23"
                      y2="23"
                    />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                    />
                  </svg>
                )}
              </button>

            </div>

          </div>

          <div className="auth-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="auth-link"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="google-login-wrapper">

          <button
            className="google-btn"
            type="button"
            onClick={() => googleLogin()}
            disabled={googleLoading}
          >

            <svg viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5 44.5 36.3 44.5 25c0-1.5-.2-2.9-.4-4.5z"
              />

              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 7 29.6 5 24 5c-7.6 0-14.1 4.3-17.4 10.6z"
              />

              <path
                fill="#4CAF50"
                d="M24 45.5c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 36.5 27 37.5 24 37.5c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.8 41.1 16.4 45.5 24 45.5z"
              />

              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.9 2.5-2.5 4.6-4.6 6l6.6 5.4C40.9 36.3 44.5 31.1 44.5 25c0-1.5-.2-2.9-.4-4.5z"
              />
            </svg>

            {googleLoading
              ? "Signing in..."
              : "Continue with Google"}

          </button>

        </div>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="auth-link-bold"
          >
            Create Account
          </Link>
        </p>

      </div>

    </AuthLayout>
  );
}

export default Login;
 
