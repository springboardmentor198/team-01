import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
} from "react-icons/fi";
import "./ResetPassword.css";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const getStrength = (password) => {
    if (!password) {
        return {
            text: "",
            color: "#e5e7eb",
            level: 0,
        };
    }
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1)
      return { text: "Weak", color: "#ef4444", level: 1 };

    if (score === 2)
      return { text: "Fair", color: "#f59e0b", level: 2 };

    if (score === 3)
      return { text: "Good", color: "#3b82f6", level: 3 };

    return {
      text: "Strong",
      color: "#22c55e",
      level: 4,
    };
  };

  const strength = getStrength(password);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Backend API here

    navigate("/login");
  };

  return (
    <div className="reset-container">
      <div className="reset-card">

        <div className="reset-logo">
          <FiLock />
        </div>

        <h2>Reset Password</h2>

        <p className="subtitle">
          Create a strong password to secure your account.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label>New Password</label>

            <div className="password-input">

              <FiLock className="icon" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? (
                  <FiEyeOff />
                ) : (
                  <FiEye />
                )}
              </button>
            </div>

            {password.trim() && (
  <div className="strength-wrapper">

    <div className="strength-bars">

      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="strength-segment"
          style={{
            background:
              item <= strength.level
                ? strength.color
                : "#e5e7eb",
          }}
        />
      ))}

    </div>

    <span
      className="strength-text"
      style={{
        color: strength.color,
      }}
    >
      {strength.text}
    </span>

  </div>
)}

          </div>

          <div className="input-group">
            <label>Confirm Password</label>

            <div className="password-input">

              <FiLock className="icon" />

              <input
                type={
                  showConfirm
                    ? "text"
                    : "password"
                }
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                required
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() =>
                  setShowConfirm(!showConfirm)
                }
              >
                {showConfirm ? (
                  <FiEyeOff />
                ) : (
                  <FiEye />
                )}
              </button>

            </div>
          </div>

          <button
            type="submit"
            className="reset-btn"
          >
            Reset Password
          </button>

        </form>

        <Link
          to="/login"
          className="back-link"
        >
          <FiArrowLeft />
          Back to Login
        </Link>

      </div>
    </div>
  );
};

export default ResetPassword;