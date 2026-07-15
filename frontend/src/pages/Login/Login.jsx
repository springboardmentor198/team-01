import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import "./Login.css";

import logo from "../../assets/images/logo.png";

import {
  FiMail,
  FiLock,
  FiUser,
} from "react-icons/fi";

function Login() {

  const navigate = useNavigate();

  const handleSubmit = (e) => {

    e.preventDefault();

    // TODO: Backend Login API

    navigate("/dashboard");

  };

  return (

    <AuthLayout>

      <div className="auth-card">

        <div className="login-logo">

          <img
            src={logo}
            alt="Logo"
          />

        </div>

        <h1 className="auth-title">

          Welcome Back

        </h1>

        <p className="auth-subtitle">

          Sign in to continue to the Property Due Diligence System

        </p>

        <form onSubmit={handleSubmit}>

          {/* ================= EMAIL ================= */}

          <div className="auth-field">

            <label htmlFor="email">

              Email

            </label>

            <div className="input-group">

              <FiMail className="input-icon" />

              <input
                id="email"
                type="email"
                className="auth-input"
                placeholder="Enter your email"
                required
              />

            </div>

          </div>

          {/* ================= PASSWORD ================= */}

          <div className="auth-field">

            <label htmlFor="password">

              Password

            </label>

            <div className="input-group">

              <FiLock className="input-icon" />

              <input
                id="password"
                type="password"
                className="auth-input"
                placeholder="Enter your password"
                required
              />

            </div>

          </div>

          {/* ================= ROLE ================= */}

          <div className="auth-field">

            <label htmlFor="role">

              Role

            </label>

            <div className="input-group">

              <FiUser className="input-icon" />

              <select
                id="role"
                className="auth-input"
                defaultValue=""
              >

                <option
                  value=""
                  disabled
                >
                  Select Role
                </option>

                <option value="analyst">

                  Analyst

                </option>

                <option value="manager">

                  Manager

                </option>

                <option value="admin">

                  Admin

                </option>

              </select>

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
          >
            Login
          </button>

        </form>

        <div className="auth-divider">

          <span>OR</span>

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