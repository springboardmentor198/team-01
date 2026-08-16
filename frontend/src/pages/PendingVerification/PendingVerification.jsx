import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LuClock3, LuHouse } from "react-icons/lu";
import { api } from "../../services/api";

function PendingVerification() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }

    const checkStatus = async () => {
      try {
        const profile = await api.getUserProfile();
        if (profile.status === "ACTIVE") {
          localStorage.setItem("status", profile.status);
          localStorage.setItem("role", profile.role);
          localStorage.setItem("profileCompleted", String(profile.profileCompleted));

          const dashboardPaths = {
            BUYER: "/buyer/dashboard",
            AGENT: "/agent/dashboard",
            LEGAL_REVIEWER: "/legal/dashboard",
            BANK: "/bank/dashboard",
          };
          navigate(dashboardPaths[profile.role] || "/dashboard", { replace: true });
        }
      } catch (err) {
        // Ignore errors during polling
      }
    };

    // Run check immediately
    checkStatus();

    // Poll every 3 seconds
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
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
