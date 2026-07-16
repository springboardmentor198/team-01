import "./AuthLayout.css";

import logo from "../../assets/images/logo.png";

import {
  FiSearch,
  FiShield,
  FiFileText,
  FiCheckCircle,
} from "react-icons/fi";

function AuthLayout({ children }) {
  return (
    <div className="auth-page">

      {/* ================= LEFT PANEL ================= */}

      <div className="auth-left">

        <div className="brand">

          <img
            src={logo}
            alt="Due Diligence"
            className="brand-logo"
          />

          <div>

            <h2>DueDiligence</h2>

            <p>Property Verification System</p>

          </div>

        </div>

        <div className="hero-content">

          <span className="hero-badge">

            Smart Property Analysis

          </span>

          <h1>

            Real Estate Due
            <br />
            Diligence Platform

          </h1>

          <p>

            Verify ownership records, assess legal risks,
            review property documents and generate
            professional due diligence reports from a
            single secure platform.

          </p>

        </div>

        <div className="feature-list">

          <div className="feature-card">

            <div className="feature-icon">

              <FiSearch />

            </div>

            <div>

              <h4>Property Search</h4>

              <span>Search & verify properties instantly</span>

            </div>

          </div>

          <div className="feature-card">

            <div className="feature-icon">

              <FiShield />

            </div>

            <div>

              <h4>Risk Assessment</h4>

              <span>Identify legal and financial risks</span>

            </div>

          </div>

          <div className="feature-card">

            <div className="feature-icon">

              <FiFileText />

            </div>

            <div>

              <h4>Generate Reports</h4>

              <span>Create professional due diligence reports</span>

            </div>

          </div>

        </div>

        <div className="bottom-info">

          <FiCheckCircle />

          Trusted by Property Analysts & Legal Teams

        </div>

      </div>

      {/* ================= RIGHT PANEL ================= */}

      <div className="auth-right">

        {children}

      </div>

    </div>
  );
}

export default AuthLayout;