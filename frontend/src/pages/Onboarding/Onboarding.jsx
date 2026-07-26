import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuArrowRight,
  LuBuilding2,
  LuHouse,
  LuLandmark,
  LuScale,
} from "react-icons/lu";
import { api } from "../../services/api";

const accountOptions = [
  {
    role: "BUYER",
    title: "Buyer",
    description: "Search, assess, and save properties with due diligence insights.",
    icon: LuHouse,
  },
  {
    role: "AGENT",
    title: "Property Agent",
    description: "Submit your professional credentials to manage property workflows.",
    icon: LuBuilding2,
  },
  {
    role: "LEGAL_REVIEWER",
    title: "Legal Professional",
    description: "Verify your legal credentials before reviewing property documents.",
    icon: LuScale,
  },
  {
    role: "BANK",
    title: "Financial Institution",
    description: "Verify your institution before accessing financial review workflows.",
    icon: LuLandmark,
  },
];

function Onboarding() {
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const selectAccountType = async (accountType) => {
    setError("");
    setLoadingRole(accountType);

    try {
      const response = await api.completeProfile(accountType);

      if (accountType === "BUYER") {
        localStorage.setItem("profileCompleted", "true");
        if (response.role) localStorage.setItem("role", response.role);
        navigate("/dashboard", { replace: true });
        return;
      }

      navigate("/verification", {
        replace: true,
        state: { requestedRole: accountType },
      });
    } catch (requestError) {
      setError(requestError.message || "Unable to complete onboarding");
    } finally {
      setLoadingRole("");
    }
  };

  return (
    <main className="onboarding-page">
      <section className="onboarding-card">
        <span className="onboarding-eyebrow">DueDiligence</span>
        <h1>Welcome to DueDiligence</h1>
        <p className="onboarding-subtitle">
          How would you like to use DueDiligence?
        </p>

        {error && <div className="onboarding-error" role="alert">{error}</div>}

        <div className="onboarding-options">
          {accountOptions.map((option) => {
            const Icon = option.icon;
            const isLoading = loadingRole === option.role;

            return (
              <button
                key={option.role}
                className="onboarding-option"
                disabled={Boolean(loadingRole)}
                onClick={() => selectAccountType(option.role)}
              >
                <span className="onboarding-option-icon">
                  <Icon size={24} />
                </span>
                <span className="onboarding-option-content">
                  <strong>{option.title}</strong>
                  <span>{option.description}</span>
                </span>
                <span className="onboarding-option-action">
                  {isLoading ? "Please wait..." : <LuArrowRight size={20} />}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default Onboarding;
