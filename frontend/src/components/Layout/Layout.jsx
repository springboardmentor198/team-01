import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

function Layout({ title, children }) {
  return (
    <div className="page-container">

      <Sidebar />

      <main className="main-content">

        <Navbar title={title} />

        <div className="page-wrapper">

          {children}

        </div>

      </main>

    </div>
  );
}

export default Layout;