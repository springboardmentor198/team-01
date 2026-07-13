import "./Navbar.css";

import { FiBell } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { IoChevronBack } from "react-icons/io5";

import { useNavigate, useLocation } from "react-router-dom";

function Navbar({ title }) {

  const navigate = useNavigate();
  const location = useLocation();

  const showBackButton =
    location.pathname !== "/dashboard";

  return (

    <header className="navbar">

      <div className="navbar-left">

        {showBackButton && (

          <button
            className="back-btn"
            onClick={() => navigate(-1)}
          >

            <IoChevronBack />

          </button>

        )}

        <h1 className="page-title">
          {title}
        </h1>

      </div>

      <div className="navbar-right">

        <button
          className="nav-btn"
          onClick={() => navigate("/notifications")}
        >

          <FiBell />

          <span className="notification-badge"></span>

        </button>

        <button
          className="nav-btn"
          onClick={() => navigate("/profile")}
        >

          <CgProfile />

        </button>

      </div>

    </header>

  );
}

export default Navbar;