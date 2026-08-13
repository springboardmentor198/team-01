import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useState } from "react";
import SupportDrawer from "../SupportDrawer/SupportDrawer";
import AdminSidebar from "../AdminSidebar/AdminSidebar";
import { api } from "../../services/api";

function Layout({ title, showSearch = false, variant, children }) {
  const [isSupportDrawerOpen, setIsSupportDrawerOpen] = useState(false);
  const isAdmin = variant === "admin" || api.getCurrentUser()?.role === "ADMIN";

  return (
    <div className={`page-container${isAdmin ? " admin-page-container" : ""}`}>

      {isAdmin ? <AdminSidebar /> : <Sidebar onContactSupport={() => setIsSupportDrawerOpen(true)} />}

      <main className="main-content">

        <Navbar title={title} showSearch={showSearch} />

        <div className="page-wrapper">

          {children}

        </div>

      </main>

      {!isAdmin && <SupportDrawer
        isOpen={isSupportDrawerOpen}
        onClose={() => setIsSupportDrawerOpen(false)}
      />}

    </div>
  );
}

export default Layout;
