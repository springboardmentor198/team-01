import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard/Dashboard";
import PropertySearch from "./pages/PropertySearch/PropertySearch";
import PropertyDetails from "./pages/PropertyDetails/PropertyDetails";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import Onboarding from "./pages/Onboarding/Onboarding";
import ProfessionalVerification from "./pages/ProfessionalVerification/ProfessionalVerification";
import PendingVerification from "./pages/PendingVerification/PendingVerification";
import RoleDashboard from "./pages/RoleDashboard/RoleDashboard";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";

import Notifications from "./pages/Notifications/Notifications";
import AuditLogs from "./pages/AuditLogs/AuditLogs";
import Profile from "./pages/Profile/Profile";
import PropertyResults from "./pages/PropertyResults/PropertyResults";
import Report from "./pages/Report/Report";
import CompareProperties from "./pages/CompareProperties/CompareProperties";
import UploadDocuments from "./pages/UploadDocuments/UploadDocuments";
import Admin from "./pages/Admin/Admin";
import VerifyOtp from "./pages/VerifyOtp/VerifyOtp";
import ResetPassword from "./pages/ResetPassword/ResetPassword";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/verification" element={<ProfessionalVerification />} />
      <Route path="/pending" element={<PendingVerification />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/buyer/dashboard" element={<Dashboard />} />
      <Route path="/agent/dashboard" element={<RoleDashboard role="AGENT" />} />
      <Route path="/legal/dashboard" element={<RoleDashboard role="LEGAL_REVIEWER" />} />
      <Route path="/bank/dashboard" element={<RoleDashboard role="BANK" />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/property-search" element={<PropertySearch />} />
      <Route path="/property-results" element={<PropertyResults />} />
      <Route path="/property-details/:id" element={<PropertyDetails />} />
      <Route path="/properties" element={<PropertyResults />} />
      <Route path="/property/:id" element={<PropertyDetails />} />
      <Route path="/report/:propertyId" element={<Report />} />
      <Route path="/reports" element={<Report />} />
      <Route path="/compare-properties" element={<CompareProperties />} />
      <Route path="/upload-documents" element={<UploadDocuments />} />

      <Route path="/notifications" element={<Notifications />} />
      <Route path="/audit-logs" element={<AuditLogs />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;
