import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard/Dashboard";
import PropertySearch from "./pages/PropertySearch/PropertySearch";
import PropertyDetails from "./pages/PropertyDetails/PropertyDetails";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";

import Notifications from "./pages/Notifications/Notifications";
import AuditLogs from "./pages/AuditLogs/AuditLogs";
import Profile from "./pages/Profile/Profile";
import PropertyResults from "./pages/PropertyResults/PropertyResults";

import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp/VerifyOtp";
import ResetPassword from "./pages/ResetPassword/ResetPassword";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/property-search" element={<PropertySearch />} />

      <Route path="/property-details/:id" element={<PropertyDetails />} />

      <Route path="/notifications" element={<Notifications />} />

      <Route path="/audit-logs" element={<AuditLogs />} />

      <Route path="/profile" element={<Profile />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/property-results" element={<PropertyResults />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/verify-otp" element={<VerifyOtp />} />

      <Route path="/reset-password" element={<ResetPassword />} />

    </Routes>
  );
}

export default App;
