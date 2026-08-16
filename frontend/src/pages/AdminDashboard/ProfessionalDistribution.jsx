import { LuBriefcaseBusiness, LuLandmark, LuScale } from "react-icons/lu";

const presentation = { agents: { icon: LuBriefcaseBusiness, color: "#4F46E5" }, legal: { icon: LuScale, color: "#10B981" }, financial: { icon: LuLandmark, color: "#F97316" } };

function ProfessionalDistribution({ professionals = [] }) {
  const total = professionals.reduce((sum, item) => sum + Number(item.count || 0), 0);
  return <article className="admin-dashboard-card">
    <div className="admin-dashboard-card-header"><div><h2 className="admin-dashboard-card-title">Professional Distribution</h2><p className="admin-dashboard-card-subtitle">Verified professionals by role</p></div><span>{total.toLocaleString()} Total</span></div>
    {total === 0 ? <div className="admin-dashboard-empty">No verified professionals yet.</div> : <div className="admin-professional-list">{professionals.map((item) => { const style = presentation[item.id] || presentation.agents; const Icon = style.icon; const percentage = total ? (item.count / total) * 100 : 0; return <div className="admin-professional-row" key={item.id}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon size={16} color={style.color}/><span className="admin-professional-name">{item.label}</span></div><div className="admin-professional-progress"><div className="admin-professional-progress-bar" style={{ width: `${percentage}%`, background: style.color }}/></div><span className="admin-professional-count">{item.count}</span></div>; })}</div>}
  </article>;
}
export default ProfessionalDistribution;
