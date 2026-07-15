import "./AuthLayout.css";

function AuthLayout({ children }) {
  return (
    <div className="auth-page">

      <div className="auth-left">

        <div className="auth-logo">
          <span className="auth-logo-icon" />
          <h2>DueDiligence</h2>
        </div>

        <h1 className="auth-heading">
          Real Estate Due Diligence Platform
        </h1>

        <p className="auth-description">
          Analyze properties, assess risks, compare market data, and
          generate due diligence reports in one platform.
        </p>

        <div className="auth-features">
          <span className="auth-feature">Property Search &amp; Review</span>
          <span className="auth-feature">Risk Assessment</span>
          <span className="auth-feature">Report Generation</span>
        </div>

      </div>

      <div className="auth-right">
        {children}
      </div>

    </div>
  );
}

export default AuthLayout;
