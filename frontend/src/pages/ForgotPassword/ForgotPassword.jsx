import { useState, useRef } from "react";
import { Link } from "react-router-dom";

import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiCheckCircle,
} from "react-icons/fi";

import AuthLayout from "../../components/Authlayout/AuthLayout";
import { api } from "../../services/api";

import logo from "../../assets/images/logo.png";

import "./ForgotPassword.css";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const otpRefs = useRef([]);

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  const [showPassword,
    setShowPassword] =
    useState(false);

  const [showConfirmPassword,
    setShowConfirmPassword] =
    useState(false);

  const [loading,
    setLoading] =
    useState(false);

  const [sendingOtp,
    setSendingOtp] =
    useState(false);

  const [verifyingOtp,
    setVerifyingOtp] =
    useState(false);

  const [otpSent,
    setOtpSent] =
    useState(false);

  const [otpVerified,
    setOtpVerified] =
    useState(false);

  const [message,
    setMessage] =
    useState("");

  const [error,
    setError] =
    useState("");



  /* ===========================
      PASSWORD STRENGTH
  =========================== */

  const getStrength = (password) => {

    if (!password) {

      return {
        text: "",
        color: "#E5E7EB",
        level: 0,
      };

    }

    let score = 0;

    if (password.length >= 8) score++;

    if (/[A-Z]/.test(password)) score++;

    if (/[0-9]/.test(password)) score++;

    if (/[^A-Za-z0-9]/.test(password))
      score++;

    if (score <= 1)
      return {
        text: "Weak",
        color: "#EF4444",
        level: 1,
      };

    if (score === 2)
      return {
        text: "Fair",
        color: "#F59E0B",
        level: 2,
      };

    if (score === 3)
      return {
        text: "Good",
        color: "#3B82F6",
        level: 3,
      };

    return {
      text: "Strong",
      color: "#22C55E",
      level: 4,
    };

  };

  const strength =
    getStrength(newPassword);

  const passwordsMatch =
    confirmPassword &&
    newPassword === confirmPassword;



  /* ===========================
      OTP INPUT
  =========================== */

  const handleOtpChange = (
    value,
    index
  ) => {

    if (!/^\d*$/.test(value))
      return;

    const updatedOtp = [...otp];

    updatedOtp[index] =
      value.slice(-1);

    setOtp(updatedOtp);

    if (
      value &&
      index < 5
    ) {

      otpRefs.current[
        index + 1
      ]?.focus();

    }

  };



  const handleOtpKeyDown = (
    event,
    index
  ) => {

    if (
      event.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {

      otpRefs.current[
        index - 1
      ]?.focus();

    }

  };



  const handleOtpPaste = (
    event
  ) => {

    event.preventDefault();

    const pasted =
      event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);

    const updatedOtp = [
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    pasted
      .split("")
      .forEach((digit, index) => {

        updatedOtp[index] = digit;

      });

    setOtp(updatedOtp);

    otpRefs.current[
      Math.min(
        pasted.length,
        5
      )
    ]?.focus();

  };

    /* ===========================
      SEND OTP
  =========================== */

  const requestOtp = async (event) => {

    event.preventDefault();

    setError("");
    setMessage("");

    setSendingOtp(true);

    try {

      const response =
        await api.forgotPassword(email);

      setMessage(
        response.message ||
        "OTP sent successfully."
      );

      setOtpSent(true);

      setOtpVerified(false);

      setOtp([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

    } catch (requestError) {

      setError(
        requestError.message ||
        "Unable to send OTP."
      );

      setOtpSent(false);

    } finally {

      setSendingOtp(false);

    }

  };



  /* ===========================
      VERIFY OTP
  =========================== */

  const verifyOtp = async () => {

    const enteredOtp =
      otp.join("");

    if (enteredOtp.length !== 6) {

      setError(
        "Please enter the 6-digit OTP."
      );

      return;

    }

    setError("");
    setMessage("");

    setVerifyingOtp(true);

    try {

      /*
        Replace this API with your backend endpoint.

        Example:

        await api.verifyOtp(
            email,
            enteredOtp
        );
      */

      

        await api.verifyOtp(
          email,
          enteredOtp
        );

      

      setOtpVerified(true);

      setMessage(
        "OTP verified successfully."
      );

    } catch (requestError) {

      setOtpVerified(false);

      setError(
        requestError.message ||
        "Invalid OTP."
      );

    } finally {

      setVerifyingOtp(false);

    }

  };



  /* ===========================
      RESET PASSWORD
  =========================== */

  const resetPassword =
    async (event) => {

      event.preventDefault();

      setError("");
      setMessage("");

      if (
        newPassword !==
        confirmPassword
      ) {

        setError(
          "Passwords do not match."
        );

        return;

      }

      setLoading(true);

      try {

        await api.resetPassword(
          otp.join(""),
          newPassword
        );

        setMessage(
          "Password reset successfully. You can now login."
        );

        setNewPassword("");

        setConfirmPassword("");

        setOtpVerified(false);

        setOtpSent(false);

        setOtp([
          "",
          "",
          "",
          "",
          "",
          "",
        ]);

      } catch (requestError) {

        setError(
          requestError.message ||
          "Unable to reset password."
        );

      } finally {

        setLoading(false);

      }

    };

      return (

    <AuthLayout>

      <div className="forgot-card">

        <div className="forgot-logo">

          <img
            src={logo}
            alt="Due Diligence"
          />

        </div>

        <div className="forgot-header">

          <h2>Reset your password</h2>

          <p>
            Enter your registered email, verify the OTP and
            create a new password.
          </p>

        </div>

        {error && (

          <div className="auth-error-msg">
            {error}
          </div>

        )}

        {message && (

          <div className="auth-success-msg">
            {message}
          </div>

        )}

        {/* ================= EMAIL ================= */}

        <form
          onSubmit={requestOtp}
          className="forgot-form"
        >

          <div className="auth-field">

            <label>Email Address</label>

            <div className="input-group">

              <span className="input-icon">
                <FiMail />
              </span>

              <input
                type="email"
                className="auth-input"
                placeholder="Enter your registered email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                disabled={otpSent}
                required
              />

            </div>

          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={sendingOtp || otpSent}
          >

            {
              sendingOtp
                ? "Sending OTP..."
                : otpSent
                ? "OTP Sent"
                : "Send OTP"
            }

          </button>

        </form>

        <div className="forgot-divider">

          <span>

            Verify OTP

          </span>

        </div>

        {/* ================= OTP ================= */}

        <div className="auth-field">

          <label>Email OTP</label>

          <div
            className="otp-container"
            onPaste={handleOtpPaste}
          >

            {otp.map((digit, index) => (

              <input
                key={index}
                ref={(element) =>
                  otpRefs.current[index] = element
                }
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                disabled={!otpSent || otpVerified}
                className="otp-input"
                onChange={(event) =>
                  handleOtpChange(
                    event.target.value,
                    index
                  )
                }
                onKeyDown={(event) =>
                  handleOtpKeyDown(
                    event,
                    index
                  )
                }
              />

            ))}

          </div>

        </div>

        <button
          type="button"
          className="auth-submit-btn"
          onClick={verifyOtp}
          disabled={
            !otpSent ||
            otpVerified ||
            verifyingOtp
          }
        >

          {
            verifyingOtp
              ? "Verifying..."
              : otpVerified
              ? "OTP Verified"
              : "Verify OTP"
          }

        </button>

        <div className="forgot-divider">

          <span>

            Reset Password

          </span>

        </div>

        {/* ================= RESET PASSWORD ================= */}

        <form
          onSubmit={resetPassword}
          className="forgot-form"
        >

                  <div className="auth-field">

            <label>New Password</label>

            <div className="input-group">

              <span className="input-icon">
                <FiLock />
              </span>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                className="auth-input has-trailing-icon"
                placeholder="Enter new password"
                value={newPassword}
                disabled={!otpVerified}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                minLength={8}
                required
              />

              <button
                type="button"
                className="input-trailing-icon"
                disabled={!otpVerified}
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                {showPassword
                  ? <FiEyeOff />
                  : <FiEye />}
              </button>

            </div>

            {otpVerified &&
              newPassword && (

              <div
                className="password-strength"
              >

                <div
                  className="strength-bar"
                >

                  <div
                    className="strength-fill"
                    style={{
                      width: `${
                        strength.level * 25
                      }%`,
                      background:
                        strength.color,
                    }}
                  />

                </div>

                <span
                  style={{
                    color:
                      strength.color,
                  }}
                >
                  {strength.text}
                </span>

              </div>

            )}

          </div>

          <div className="auth-field">

            <label>
              Confirm Password
            </label>

            <div className="input-group">

              <span className="input-icon">
                <FiLock />
              </span>

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                className="auth-input has-trailing-icon"
                placeholder="Confirm password"
                value={
                  confirmPassword
                }
                disabled={!otpVerified}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                minLength={8}
                required
              />

              <button
                type="button"
                className="input-trailing-icon"
                disabled={!otpVerified}
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                {showConfirmPassword
                  ? <FiEyeOff />
                  : <FiEye />}
              </button>

            </div>

            {otpVerified &&
              confirmPassword && (

              passwordsMatch ? (

                <div
                  className="password-match success"
                >

                  <FiCheckCircle />

                  Passwords match

                </div>

              ) : (

                <div
                  className="password-match error"
                >

                  Passwords do not match

                </div>

              )

            )}

          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={
              loading ||
              !otpVerified
            }
          >

            {loading
              ? "Resetting..."
              : "Reset Password"}

          </button>

        </form>

        <div className="forgot-footer">

          <Link
            to="/login"
            className="auth-link-bold"
          >

            <FiArrowLeft
              size={16}
            />

            Back to Login

          </Link>

        </div>

      </div>

    </AuthLayout>

  );

}