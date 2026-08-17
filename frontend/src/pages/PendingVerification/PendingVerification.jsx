import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuClock3, LuHouse } from "react-icons/lu";
import { api } from "../../services/api";

function PendingVerification() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(api.getCurrentUser());
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }

    const checkStatus = async () => {
      try {
        const currentProfile = await api.refreshCurrentUser();
        setProfile(currentProfile);
        if (currentProfile.status === "ACTIVE") {

          const dashboardPaths = {
            BUYER: "/buyer/dashboard",
            AGENT: "/agent/dashboard",
            LEGAL_REVIEWER: "/legal/dashboard",
            BANK: "/bank/dashboard",
          };
          navigate(dashboardPaths[currentProfile.role] || "/dashboard", { replace: true });
        }
      } catch (err) {
        // Ignore errors during polling
      }
    };

    // Run check immediately
    checkStatus();

    // Poll every 3 seconds
    window.checkApprovalStatus = checkStatus;
    return () => { delete window.checkApprovalStatus; };
  }, [navigate]);

  return (
    <main className="pending-page">
      <section className="pending-card">
        <span className="pending-icon">
          <LuClock3 size={30} />
        </span>
        <span className="pending-eyebrow">Verification status</span>
        <h1>{profile?.status === "REJECTED" ? "Application Rejected" : "Account Pending Verification"}</h1>
        <p>
          {profile?.status === "REJECTED" ? "Your registration was not approved. Please contact support for more information." : "Your registration is currently being reviewed by the DueDiligence administration team."}
        </p>
        <p><strong>Role:</strong> {(profile?.role || "").replaceAll("_", " ")}</p>
        <p><strong>Status:</strong> {profile?.status || "PENDING"}</p>
        <button type="button" disabled={checking} onClick={async () => { setChecking(true); try { await window.checkApprovalStatus?.(); } finally { setChecking(false); } }}>
          <LuHouse size={18} /> {checking ? "Checking…" : "Refresh Status"}
        </button>
        <button type="button" onClick={() => { api.logout(); navigate("/login", { replace: true }); }}>Logout</button>
      </section>
    </main>
  );
}

export default PendingVerification;
