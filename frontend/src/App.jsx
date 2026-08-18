import { Routes, Route, Navigate } from "react-router-dom";
import AuthorizationGate from "./components/Auth/AuthorizationGate";

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
import AdminSupportTickets from "./pages/AdminSupportTickets/AdminSupportTickets";
import AdminRoleRequests from "./pages/AdminRoleRequests/AdminRoleRequests";
import AdminSystemMonitoring from "./pages/AdminSystemMonitoring/AdminSystemMonitoring";
import AdminWorkspace from "./pages/AdminWorkspace/AdminWorkspace";
import AdminSettings from "./pages/AdminWorkspace/AdminSettings";

import Notifications from "./pages/Notifications/Notifications";
import AuditLogs from "./pages/AuditLogs/AuditLogs";
import Profile from "./pages/Profile/Profile";
import PropertyResults from "./pages/PropertyResults/PropertyResults";
import Report from "./pages/Report/Report";
import CompareProperties from "./pages/CompareProperties/CompareProperties";
import RiskDashboard from "./pages/RiskDashboard/RiskDashboard";
import UploadDocuments from "./pages/UploadDocuments/UploadDocuments";
import Admin from "./pages/Admin/Admin";
import VerifyOtp from "./pages/VerifyOtp/VerifyOtp";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import AgentWorkspace from "./pages/AgentWorkspace/AgentWorkspace";

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

      <Route element={<AuthorizationGate />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/buyer/dashboard" element={<Dashboard />} />
      <Route path="/agent/dashboard" element={<RoleDashboard role="AGENT" />} />
      <Route path="/agent/properties" element={<AgentWorkspace page="properties" />} />
      <Route path="/agent/documents" element={<AgentWorkspace page="documents" />} />
      <Route path="/agent/due-diligence" element={<AgentWorkspace page="due-diligence" />} />
      <Route path="/agent/buyer-requests" element={<AgentWorkspace page="buyer-requests" />} />
      <Route path="/agent/transactions" element={<AgentWorkspace page="transactions" />} />
      <Route path="/agent/tasks" element={<AgentWorkspace page="tasks" />} />
      <Route path="/legal/dashboard" element={<RoleDashboard role="LEGAL_REVIEWER" />} />
      <Route path="/bank/dashboard" element={<RoleDashboard role="BANK" />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/support-tickets" element={<AdminSupportTickets />} />
      <Route path="/admin/role-requests" element={<AdminRoleRequests />} />
      <Route path="/admin/system-monitoring" element={<AdminSystemMonitoring />} />
      <Route path="/admin/property-approvals" element={<AdminWorkspace pageKey="property-approvals" />} />
      <Route path="/admin/advisor-verifications" element={<AdminWorkspace pageKey="advisor-verifications" />} />
      <Route path="/admin/users" element={<AdminWorkspace pageKey="users" />} />
      <Route path="/admin/agents" element={<AdminWorkspace pageKey="agents" />} />
      <Route path="/admin/legal-advisors" element={<AdminWorkspace pageKey="legal-advisors" />} />
      <Route path="/admin/financial-institutions" element={<AdminWorkspace pageKey="financial-institutions" />} />
      <Route path="/admin/properties" element={<AdminWorkspace pageKey="properties" />} />
      <Route path="/admin/transactions" element={<AdminWorkspace pageKey="transactions" />} />
      <Route path="/admin/enquiries" element={<AdminWorkspace pageKey="enquiries" />} />
      <Route path="/admin/bookings" element={<AdminWorkspace pageKey="bookings" />} />
      <Route path="/admin/security-center" element={<AdminWorkspace pageKey="security-center" />} />
      <Route path="/admin/reports" element={<AdminWorkspace pageKey="reports" />} />
      <Route path="/admin/activity-analytics" element={<AdminWorkspace pageKey="activity-analytics" />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
      <Route path="/property-search" element={<PropertySearch />} />
      <Route path="/property-results" element={<PropertyResults />} />
      <Route path="/property-details/:id" element={<PropertyDetails />} />
      <Route path="/properties" element={<PropertyResults />} />
      <Route path="/property/:id" element={<PropertyDetails />} />
      <Route path="/report/:propertyId" element={<Report />} />
      <Route path="/reports" element={<Report />} />
      <Route path="/compare-properties" element={<CompareProperties />} />

      <Route path="/risk-dashboard" element={<RiskDashboard />} />
      <Route path="/agent/risk-summary" element={<RiskDashboard />} />
      <Route path="/legal/risk-assessments" element={<RiskDashboard />} />
      <Route path="/bank/risk-analysis" element={<RiskDashboard />} />

      <Route path="/upload-documents" element={<UploadDocuments />} />

      <Route path="/notifications" element={<Notifications />} />
      <Route path="/audit-logs" element={<AuditLogs />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}

export default App;
