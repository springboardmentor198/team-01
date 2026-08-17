import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { api } from "../../services/api";
import logo from "../../assets/images/logo.png";
import "./Register.css";

function getPasswordStrength(pwd) {
  if (!pwd) return 0;

  let score = 0;

  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  return score;
}

const STRENGTH_LABELS = [
  "Very Weak",
  "Weak",
  "Fair",
  "Good",
  "Strong",
];

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("BUYER");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const passwordsDifferent =
    confirmPassword.length > 0 && password !== confirmPassword;


  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.register(fullName, email, password, phoneNumber, role);
      setSuccess("Account created. Please sign in to view its verification status.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <AuthLayout>
      <div className="auth-card auth-card-wide">

        <div className="auth-header">

          <div className="auth-header-top">

            <div className="logo-circle">
              <img src={logo} alt="Logo" />
            </div>

          </div>

          <h1 className="auth-title">
            Create Account
          </h1>

          <p className="auth-subtitle">
            Register to access the Real Estate Due Diligence platform
          </p>

        </div>

        {error && <div className="auth-error-msg">{error}</div>}
        {success && <div className="auth-success-msg">{success}</div>}

        <form onSubmit={handleSubmit}>

          <div className="auth-grid">

            <div className="auth-field">
              <label htmlFor="fullName">Full Name</label>

              <input
                id="fullName"
                type="text"
                className="auth-input"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email Address</label>

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

            <div className="auth-field">
              <label htmlFor="phone">Phone Number</label>

              <input
                id="phone"
                type="tel"
                className="auth-input"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="role">How do you want to use DueDiligence?</label>
              <select id="role" className="auth-input" value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="BUYER">Buyer</option>
                <option value="AGENT">Real Estate Agent</option>
                <option value="LEGAL_REVIEWER">Legal Advisor</option>
                <option value="BANK">Financial Institution</option>
              </select>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>

              <div className="input-group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input has-trailing-icon"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="input-trailing-icon"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
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

              {password && (
                <div className="password-strength">
                  <div className="password-strength-bars">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`strength-bar${
                          i < passwordStrength
                            ? ` strength-${passwordStrength}`
                            : ""
                        }`}
                      />
                    ))}
                  </div>

                  <span
                    className={`password-strength-label strength-text-${passwordStrength}`}
                  >
                    {STRENGTH_LABELS[passwordStrength]}
                  </span>
                </div>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="input-group">
                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  className="auth-input has-trailing-icon"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="input-trailing-icon"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
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

              {passwordsMatch && (
                <div className="password-match success">
                  ✓ Passwords match
                </div>
              )}

              {passwordsDifferent && (
                <div className="password-match error">
                  ✕ Passwords do not match
                </div>
              )}
            </div>

          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={
              loading ||
              (confirmPassword.length > 0 && !passwordsMatch)
            }
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link
            to="/login"
            className="auth-link-bold"
          >
            Sign In
          </Link>
        </p>

      </div>
    </AuthLayout>
  );
}

export default Register;
