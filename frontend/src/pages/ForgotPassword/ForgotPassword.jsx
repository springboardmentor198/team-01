import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/Authlayout/AuthLayout";
import { api } from "../../services/api";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const requestToken = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await api.forgotPassword(email);
      setMessage(
        response.message ||
          "If an account exists, an OTP has been sent to your email.",
      );
    } catch (requestError) {
      setError(requestError.message || "Unable to request a password reset.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(token, newPassword);
      setMessage(
        "Password reset successfully. You can now sign in with your new password.",
      );
      setNewPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setError(requestError.message || "Unable to reset the password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="reset-card">
        <h1>Reset your password</h1>
        <p className="reset-intro">
          Enter your registered email to receive a password reset token.
        </p>

        {error && <div className="reset-message error">{error}</div>}
        {message && <div className="reset-message success">{message}</div>}

        <form onSubmit={requestToken} className="reset-form">
          <label htmlFor="reset-email">Email address</label>
          <input
            id="reset-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <div className="reset-divider">
          <span>Enter the OTP and reset password</span>
        </div>

        <form onSubmit={resetPassword} className="reset-form">
          <label htmlFor="reset-token">Email OTP</label>
          <input
            id="reset-token"
            type="text"
            placeholder="Enter the 6-digit OTP"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            required
          />
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            minLength="8"
            required
          />
          <label htmlFor="confirm-password">Confirm new password</label>
          <input
            id="confirm-password"
            type="password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength="8"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <p className="reset-login-link">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
