import react, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiLock } from "react-icons/fi";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  const handleSendOtp = (e) => {
    e.preventDefault();

    // Backend API call will be added later
    navigate("/verify-otp");
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">

        {/* Lock Icon */}
        <div className="forgot-logo">
          <FiLock />
        </div>

        {/* Heading */}
        <div className="forgot-header">
            <h2>Forgot Password?</h2>
            <div className="title-line"></div>

            <p>
                Enter your registered email address and we'll send you a
                One-Time Password (OTP) to reset your password.
            </p>
        </div>

        <form onSubmit={handleSendOtp}>

          <div className="input-group">

            <label>Email Address</label>

            <div className="input-box">


              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

            </div>

          </div>

          <button
            type="submit"
            className="send-btn"
          >
            Send OTP
          </button>

        </form>

        <Link
          to="/login"
          className="back-login"
        >
          <FiArrowLeft />
          Back to Login
        </Link>

      </div>
    </div>
  );
};

export default ForgotPassword;