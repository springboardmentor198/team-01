import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard/Dashboard";
import PropertySearch from "./pages/PropertySearch/PropertySearch";
import PropertyDetails from "./pages/PropertyDetails/PropertyDetails";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

import Notifications from "./pages/Notifications/Notifications";
import AuditLogs from "./pages/AuditLogs/AuditLogs";
import Profile from "./pages/Profile/Profile";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/property-search" element={<PropertySearch />} />

      <Route path="/property-details" element={<PropertyDetails />} />

      <Route path="/notifications" element={<Notifications />} />

      <Route path="/audit-logs" element={<AuditLogs />} />

      <Route path="/profile" element={<Profile />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

    </Routes>
  );
}

export default App;