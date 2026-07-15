import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to backend register API
    navigate("/login");
  };

  return (
    <AuthLayout>
      <div className="auth-card auth-card-wide">

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">
          Register to Access the real estate due diligence platform
        </p>

        <form onSubmit={handleSubmit}>

          <div className="auth-grid">

            <div className="auth-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                className="auth-input"
                placeholder="Enter Your FullName"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="auth-input"
                placeholder="Enter Your Email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                className="auth-input"
                placeholder="Enter Your phone Number"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="role">Role</label>
              <input
                id="role"
                type="text"
                className="auth-input"
                placeholder="Enter Your Role"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="auth-input"
                placeholder="Enter Your Password"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="auth-input"
                placeholder="Confirm Your Password"
                required
              />
            </div>

          </div>

          <button type="submit" className="auth-submit-btn">
            Create Account
          </button>

        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link-bold">
            Sign In
          </Link>
        </p>

      </div>
    </AuthLayout>
  );
}

export default Register;
