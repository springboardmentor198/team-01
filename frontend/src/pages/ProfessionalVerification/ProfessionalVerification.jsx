import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LuFileUp, LuShieldCheck } from "react-icons/lu";
import { api } from "../../services/api";

const professionalRoles = [
  { value: "AGENT", label: "Property Agent" },
  { value: "LEGAL_REVIEWER", label: "Legal Professional" },
  { value: "BANK", label: "Financial Institution" },
];

function ProfessionalVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const requestedRole = professionalRoles.some(
    (role) => role.value === location.state?.requestedRole
  )
    ? location.state.requestedRole
    : "AGENT";

  const [formData, setFormData] = useState({
    requestedRole,
    companyName: "",
    companyEmail: "",
    licenseNumber: "",
    yearsOfExperience: "",
  });
  const [document, setDocument] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!document) {
      setError("Please select a verification document");
      return;
    }

    setLoading(true);
    try {
      await api.createRoleRequest({
        ...formData,
        yearsOfExperience: Number(formData.yearsOfExperience),
        documentName: document.name,
        documentPath: document.name,
        documentMimeType: document.type || "application/octet-stream",
        documentSize: document.size,
      });

      navigate("/pending", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to submit verification request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="verification-page">
      <section className="verification-card">
        <div className="verification-header">
          <span className="verification-icon"><LuShieldCheck size={25} /></span>
          <div>
            <span className="verification-eyebrow">Professional verification</span>
            <h1>Verify your professional account</h1>
            <p>
              Submit your details for administrator review. Your role will change
              only after approval.
            </p>
          </div>
        </div>

        {error && <div className="verification-error" role="alert">{error}</div>}

        <form className="verification-form" onSubmit={handleSubmit}>
          <label>
            Professional role
            <select
              name="requestedRole"
              value={formData.requestedRole}
              onChange={updateField}
            >
              {professionalRoles.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </label>

          <label>
            Company name
            <input
              name="companyName"
              value={formData.companyName}
              onChange={updateField}
              placeholder="Enter company or firm name"
              required
            />
          </label>

          <label>
            Company email
            <input
              name="companyEmail"
              type="email"
              value={formData.companyEmail}
              onChange={updateField}
              placeholder="name@company.com"
              required
            />
          </label>

          <label>
            License number
            <input
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={updateField}
              placeholder="Enter licence or registration number"
              required
            />
          </label>

          <label>
            Years of experience
            <input
              name="yearsOfExperience"
              type="number"
              min="0"
              value={formData.yearsOfExperience}
              onChange={updateField}
              placeholder="0"
              required
            />
          </label>

          <label className="verification-upload">
            Verification document
            <span className="verification-upload-control">
              <LuFileUp size={20} />
              <span>{document ? document.name : "Choose a document"}</span>
            </span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(event) => setDocument(event.target.files?.[0] || null)}
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit for verification"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default ProfessionalVerification;
