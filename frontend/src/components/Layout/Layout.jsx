import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

function Layout({ title, showSearch = false, children }) {
  return (
    <div className="page-container">

      <Sidebar />

      <main className="main-content">

        <Navbar title={title} showSearch={showSearch} />

        <div className="page-wrapper">

          {children}

        </div>

      </main>

    </div>
  );
}

export default Layout;