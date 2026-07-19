import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import "./Login.css";

import logo from "../../assets/images/logo.png";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "BUYER", label: "Buyer" },
  { value: "AGENT", label: "Agent" },
  { value: "LEGAL_REVIEWER", label: "Legal Reviewer" },
  { value: "BANK", label: "Financial Institution (Bank)" },
];


function getPasswordStrength(pwd) {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score; // 0-4
}

const STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong"];

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ---- custom role dropdown state ----
  const [roleOpen, setRoleOpen] = useState(false);
  const roleRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (roleRef.current && !roleRef.current.contains(e.target)) {
        setRoleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedRoleLabel = ROLE_OPTIONS.find((r) => r.value === role)?.label;
  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("Please select a role");
      return;
    }

    setLoading(true);
    try {
      await api.login(email, password, role);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // ---- Google login handler ----
  // Requires: npm install @react-oauth/google, wrapping the app root in
  // <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">, and a
  // api.loginWithGoogle(credential, role) method that POSTs the credential
  // to your backend, which verifies it with Google and returns your app's
  // session token the same way api.login does. This button is currently a
  // styled placeholder until those pieces are wired up.
  const handleGoogleClick = async () => {
    setError("");
    if (!api.loginWithGoogle) {
      setError("Google sign-in isn't wired up yet — see comment in Login.jsx");
      return;
    }
    setGoogleLoading(true);
    try {
      // credential would come from the real Google button/callback
      await api.loginWithGoogle(role);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="page-wrap">
      {/* ================= SIDEBAR ================= */}
      <aside className="side-panel">
        <div className="side-brand">
          <div className="brand-icon">
            <img src={logo} alt="DueDiligence logo" />
          </div>
          <div className="brand-text">
            <div className="brand-name">DueDiligence</div>
            <div className="brand-sub">Property Verification System</div>
          </div>
        </div>

        <span className="side-badge">Smart Property Analysis</span>

        <h2 className="side-heading">
          Real Estate Due
          <br />
          Diligence Platform
        </h2>

        <p className="side-desc">
          Verify ownership records, assess legal risks, review property documents and generate
          professional due diligence reports from a single secure platform.
        </p>

        <div className="side-features">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </div>
            <div className="feature-text">
              <div className="feature-title">Property Search</div>
              <div className="feature-desc">Search &amp; verify properties instantly</div>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
              </svg>
            </div>
            <div className="feature-text">
              <div className="feature-title">Risk Assessment</div>
              <div className="feature-desc">Identify legal and financial risks</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= FORM SIDE ================= */}
      <div className="form-side">
        <div className="auth-card">
          <div className="login-logo">
            <div className="logo-circle">
              <img src={logo} alt="DueDiligence logo" />
            </div>
          </div>

          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue to the Property Due Diligence System</p>

          {error && <div className="auth-error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* ================= EMAIL ================= */}
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <div className="input-group">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

            {/* ================= PASSWORD ================= */}
            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="input-group">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
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
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password strength meter. More typical on Register/Reset
                  forms than Login — remove this block if Login.jsx is
                  purely for existing users signing in. */}
              {password && (
                <div className="password-strength">
                  <div className="password-strength-bars">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`strength-bar${i < passwordStrength ? ` strength-${passwordStrength}` : ""}`}
                      />
                    ))}
                  </div>
                  <span className={`password-strength-label strength-text-${passwordStrength}`}>
                    {STRENGTH_LABELS[passwordStrength]}
                  </span>
                </div>
              )}
            </div>

            {/* ================= ROLE (custom dropdown) ================= */}
            <div className="auth-field">
              <label htmlFor="roleTrigger">Role</label>
              <div className="input-group custom-select" ref={roleRef}>
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
                </svg>
                <button
                  type="button"
                  id="roleTrigger"
                  className={`custom-select-trigger${role ? " has-value" : ""}${roleOpen ? " open" : ""}`}
                  onClick={() => setRoleOpen((prev) => !prev)}
                  aria-haspopup="listbox"
                  aria-expanded={roleOpen}
                >
                  {selectedRoleLabel || "Select Role"}
                </button>
                <svg className="custom-select-chevron" width="14" height="9" viewBox="0 0 14 9" fill="none">
                  <path d="M1 1l6 6 6-6" stroke="currentColor" strokeWidth="1.8" />
                </svg>

                <ul className={`custom-select-options${roleOpen ? " open" : ""}`} role="listbox">
                  {ROLE_OPTIONS.map((opt) => (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={role === opt.value}
                      className={`custom-select-option${role === opt.value ? " selected" : ""}`}
                      onClick={() => {
                        setRole(opt.value);
                        setRoleOpen(false);
                      }}
                    >
                      {opt.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="auth-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="auth-link">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          {/* ================= GOOGLE LOGIN ================= */}
          <div className="google-login-wrapper">
            <button
              className="google-btn"
              type="button"
              onClick={handleGoogleClick}
              disabled={googleLoading}
            >
              <svg viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5 44.5 36.3 44.5 25c0-1.5-.2-2.9-.4-4.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 7 29.6 5 24 5c-7.6 0-14.1 4.3-17.4 10.6z" />
                <path fill="#4CAF50" d="M24 45.5c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 36.5 27 37.5 24 37.5c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.8 41.1 16.4 45.5 24 45.5z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.9 2.5-2.5 4.6-4.6 6l6.6 5.4C40.9 36.3 44.5 31.1 44.5 25c0-1.5-.2-2.9-.4-4.5z" />
              </svg>
              {googleLoading ? "Signing in..." : "Continue with Google"}
            </button>
          </div>

          <p className="auth-footer">
            Don't have an account?{" "}
            <Link to="/register" className="auth-link-bold">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
