import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LuClock3, LuHouse } from "react-icons/lu";
import { api } from "../../services/api";

function PendingVerification() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <main className="pending-page">
      <section className="pending-card">
        <span className="pending-icon">
          <LuClock3 size={30} />
        </span>
        <span className="pending-eyebrow">Verification status</span>
        <h1>Verification Submitted</h1>
        <p>
          Your request has been sent to the administrator. Please wait until
          your account is verified.
        </p>
        <button type="button" onClick={() => navigate("/dashboard")}>
          <LuHouse size={18} />
          Back to Home
        </button>
      </section>
    </main>
  );
}

export default PendingVerification;
