import "./AuthLayout.css";
import logo from "../../assets/images/logo.png";

import {
    FiSearch,
    FiShield,
    FiFileText
} from "react-icons/fi";

const features = [
    {
        icon: <FiSearch />,
        title: "Search",
        description: "Verify"
    },
    {
        icon: <FiShield />,
        title: "Risk",
        description: "Legal"
    },
    {
        icon: <FiFileText />,
        title: "Reports",
        description: "Generate"
    }
];

const AuthLayout = ({ children }) => {
    return (
        <div className="auth-page">

            <div className="auth-left">

                {/* Brand */}

                <div className="brand">

                    <div className="brand-logo-wrapper">
                        <img
                            src={logo}
                            alt="Due Diligence"
                            className="brand-logo"
                        />
                    </div>

                    <div className="brand-text">
                        <h2>DueDiligence</h2>
                        <p>Property Verification System</p>
                    </div>

                </div>

                {/* Hero */}

                <div className="hero-content">

                    <h1>
                        Real Estate
                        <br />
                        Due Diligence
                    </h1>

                    <p>
                        Verify ownership records, analyze legal risks and
                        generate comprehensive property verification reports
                        from one secure platform.
                    </p>

                </div>

                {/* Features */}

                <div className="feature-list">

                    {features.map((feature, index) => (

                        <div
                            className="feature-item"
                            key={index}
                        >

                            <div className="feature-icon">
                                {feature.icon}
                            </div>

                            <h4>{feature.title}</h4>

                            <span>{feature.description}</span>

                        </div>

                    ))}

                </div>

                {/* Trust Badge */}

                <div className="trusted-badge">
                    <span className="trust-check">✓</span>
                    Trusted by Property Analysts & Legal Teams
                </div>

            </div>

            <div className="auth-right">
                {children}
            </div>

        </div>
    );
};

export default AuthLayout;