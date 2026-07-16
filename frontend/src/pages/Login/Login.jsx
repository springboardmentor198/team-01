import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { api } from "../../services/api";
import "./Login.css";

import logo from "../../assets/images/logo.png";

import {
  FiMail,
  FiLock,
  FiUser,
} from "react-icons/fi";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="login-logo">
          <img src={logo} alt="Logo" />
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">
          Sign in to continue to the Property Due Diligence System
        </p>

        {error && <div className="auth-error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* ================= EMAIL ================= */}
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <div className="input-group">
              <FiMail className="input-icon" />
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
              <FiLock className="input-icon" />
              <input
                id="password"
                type="password"
                className="auth-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* ================= ROLE ================= */}
          <div className="auth-field">
            <label htmlFor="role">Role</label>
            <div className="input-group">
              <FiUser className="input-icon" />
              <select
                id="role"
                className="auth-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select Role
                </option>
                <option value="ADMIN">Admin</option>
                <option value="BUYER">Buyer</option>
                <option value="AGENT">Agent</option>
                <option value="LEGAL_REVIEWER">Legal Reviewer</option>
                <option value="BANK">Financial Institution (Bank)</option>
              </select>
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

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link-bold">
            Create Account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;