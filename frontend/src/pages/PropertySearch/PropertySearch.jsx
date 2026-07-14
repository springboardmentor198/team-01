import Layout from "../../components/Layout/Layout";
import "./PropertySearch.css";

import {
  FiSearch,
  FiMapPin,
  FiHome,
  FiClock,
} from "react-icons/fi";

import {
  IoFilterOutline,
  IoLocationOutline,
} from "react-icons/io5";

import { MdOutlineApartment } from "react-icons/md";

function PropertySearch() {

  const recentSearches = [
    {
      address: "24 Lakeview Street, Delhi",
      type: "Residential",
      risk: "Low",
    },
    {
      address: "Palm Residency, Noida",
      type: "Commercial",
      risk: "Medium",
    },
    {
      address: "Green Avenue, Gurugram",
      type: "Residential",
      risk: "High",
    },
  ];

  const quickLocations = [
    "Delhi NCR",
    "Noida",
    "Gurugram",
    "Mumbai",
  ];

  return (
    <Layout title="Property Search">

      <div className="property-search">

        {/* ================= HERO ================= */}

        <section className="hero-card card">

          <div className="hero-icon">

            <FiSearch />

          </div>

          <h1>
            Find Properties with Confidence
          </h1>

          <p>
            Search properties by address or use
            advanced filters for detailed due
            diligence.
          </p>

        </section>

        {/* ================= SEARCH ================= */}

        <section className="search-card card">

          <div className="card-heading">

            <FiMapPin />

            <h2>Search by Address</h2>

          </div>

          <div className="search-bar">

            <input
              type="text"
              defaultValue="24 Lakeview Street, Delhi"
            />

            <button>

              <FiSearch />

              Search

            </button>

          </div>

          {/* Quick Search */}

          <div className="quick-search">

            <span>Quick Search:</span>

            {quickLocations.map((city) => (

              <button
                key={city}
                className="chip"
              >
                <IoLocationOutline />

                {city}

              </button>

            ))}

          </div>

        </section>

                {/* ================= OR ================= */}

        <div className="or-divider">
          <span>OR</span>
        </div>

        {/* ================= ADVANCED FILTER ================= */}

        <section className="advanced-section">

          <button className="advanced-btn">

            <IoFilterOutline />

            Advanced Filters

          </button>

        </section>

        {/* ================= QUICK ACTIONS ================= */}

        <section className="quick-card card">

          <div className="card-heading">

            <MdOutlineApartment />

            <h2>Quick Actions</h2>

          </div>

          <div className="quick-grid">

            <div className="filter-box">

              <label>Property Type</label>

              <select>

                <option>Residential</option>

                <option>Commercial</option>

                <option>Industrial</option>

                <option>Agricultural</option>

              </select>

            </div>

            <div className="filter-box">

              <label>City</label>

              <select>

                <option>Delhi</option>

                <option>Noida</option>

                <option>Gurugram</option>

                <option>Mumbai</option>

              </select>

            </div>

            <div className="filter-box">

              <label>Risk Level</label>

              <select>

                <option>Low</option>

                <option>Medium</option>

                <option>High</option>

              </select>

            </div>

            <div className="filter-box">

              <label>Status</label>

              <select>

                <option>Verified</option>

                <option>Pending</option>

                <option>Under Review</option>

              </select>

            </div>

          </div>

        </section>

        {/* ================= RECENT SEARCHES ================= */}

        <section className="recent-card card">

          <div className="card-heading">

            <FiClock />

            <h2>Recent Searches</h2>

          </div>

          <table className="recent-table">

            <thead>

              <tr>

                <th>Property</th>

                <th>Type</th>

                <th>Risk</th>

              </tr>

            </thead>

            <tbody>

              {recentSearches.map((item, index) => (

                <tr key={index}>

                  <td>{item.address}</td>

                  <td>{item.type}</td>

                  <td>

                    <span
                      className={`risk ${item.risk.toLowerCase()}`}
                    >
                      {item.risk}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </section>

                {/* ================= SAVED FILTERS ================= */}

        <section className="saved-card card">

          <div className="card-heading">

            <FiHome />

            <h2>Saved Filters</h2>

          </div>

          <div className="saved-grid">

            <div className="saved-item">
              <h4>Residential • Delhi</h4>
              <p>Last used 2 hours ago</p>
            </div>

            <div className="saved-item">
              <h4>Commercial • Noida</h4>
              <p>Last used Yesterday</p>
            </div>

            <div className="saved-item">
              <h4>High Risk Properties</h4>
              <p>Last used 3 days ago</p>
            </div>

          </div>

        </section>

      </div>

    </Layout>
  );
}

export default PropertySearch;