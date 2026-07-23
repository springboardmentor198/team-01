import { LuShieldCheck } from "react-icons/lu";

export default function RiskSummary({ riskLvl, riskDetails }) {
  return (
    <div className={`risk-card border-${riskDetails.class}`}>

      <div className="risk-left">

        <LuShieldCheck
          className={`risk-icon text-${riskDetails.class}`}
        />

        <div>
          <h3>Risk Summary</h3>
          <p>{riskDetails.summary}</p>
        </div>

      </div>

      <span className={`risk-level ${riskDetails.class}`}>
        {riskLvl} Risk
      </span>

    </div>
  );
}