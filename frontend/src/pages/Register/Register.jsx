import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { api } from "../../services/api";
import logo from "../../assets/images/logo.png";
import "./Register.css";
import Select from "react-select";

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
const roleOptions = [
  { value: "ADMIN", label: "Admin" },
  { value: "BUYER", label: "Buyer" },
  { value: "AGENT", label: "Agent" },
  { value: "LEGAL_REVIEWER", label: "Legal Reviewer" },
  { value: "BANK", label: "Financial Institution (Bank)" },
];

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

    if (!role) {
      setError("Please select a role");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.register(
        fullName,
        email,
        password,
        role,
        phoneNumber
      );

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

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
              <label>Role</label>

              <Select
                className="react-select-container"
                classNamePrefix="react-select"
                options={roleOptions}
                placeholder="Select Role"
                value={roleOptions.find((option) => option.value === role) || null}
                onChange={(selectedOption) =>
                  setRole(selectedOption ? selectedOption.value : "")
                }
                isSearchable={false}
                isClearable
                menuPlacement="auto"
                menuPosition="fixed"
              />
            </div>

                        <div className="auth-field">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                className="auth-input"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

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

              <input
                id="confirmPassword"
                type="password"
                className="auth-input"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

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