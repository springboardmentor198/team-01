import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to backend login API
    navigate("/dashboard");
  };

  return (
    <AuthLayout>
      <div className="auth-card">

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">
          Sign in to continue to the due diligence platform
        </p>

        <form onSubmit={handleSubmit}>

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="auth-input"
              placeholder="Enter Your Email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="auth-input"
              placeholder="Enter Password"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="role">Role</label>
            <select id="role" className="auth-input" defaultValue="">
              <option value="" disabled>Select Role</option>
              <option value="analyst">Analyst</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="auth-forgot-row">
            <Link to="/forgot-password" className="auth-link">
              Forget Password?
            </Link>
          </div>

          <button type="submit" className="auth-submit-btn">
            Login
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link-bold">
            Register
          </Link>
        </p>

      </div>
    </AuthLayout>
  );
}

export default Login;
