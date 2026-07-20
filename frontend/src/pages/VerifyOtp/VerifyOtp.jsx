import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import "./VerifyOtp.css";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h2>Verify OTP</h2>

        <p className="subtitle">
          Enter the 6-digit OTP sent to your registered email.
        </p>

        <div className="otp-boxes">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </div>

        <button className="verify-btn">
          Verify OTP
        </button>

        <p className="resend">
          Didn't receive the OTP?{" "}
          <span>Resend OTP</span>
        </p>

        <Link to="/forgot-password" className="back-link">
          <FiArrowLeft />
          Back
        </Link>
      </div>
    </div>
  );
};

export default VerifyOtp;