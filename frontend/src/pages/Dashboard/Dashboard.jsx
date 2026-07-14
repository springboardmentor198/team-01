import Layout from "../../components/Layout/Layout";
import {
  LuSearch,
  LuBuilding2,
  LuFileText,
  LuTriangleAlert,
  LuClock,
  LuChartBar,
  LuUpload,
  LuChevronRight,
} from "react-icons/lu";

const stats = [
  { label: "Total Properties", value: 128, icon: LuBuilding2, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { label: "Reports Generated", value: 54, icon: LuFileText, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  { label: "High Risk", value: 12, icon: LuTriangleAlert, iconBg: "bg-red-100", iconColor: "text-red-600" },
  { label: "Pending Reviews", value: 8, icon: LuClock, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
];

const recentSearches = [
  { property: "24 Lakeview Street", type: "Residential", risk: "Medium", status: "Completed" },
  { property: "18 Green Avenue", type: "Commercial", risk: "Low", status: "Pending" },
  { property: "Palm Residency", type: "Residential", risk: "High", status: "Reviewing" },
  { property: "Skyline Towers", type: "Commercial", risk: "Low", status: "Completed" },
  { property: "Maple Heights", type: "Residential", risk: "Low", status: "In Progress" },
  { property: "Sunrise Villas", type: "Residential", risk: "Medium", status: "Pending" },
];

const riskBreakdown = [
  { label: "Low Risk", count: 68, color: "#22c55e" },
  { label: "Medium Risk", count: 32, color: "#f59e0b" },
  { label: "High Risk", count: 20, color: "#ef4444" },
  { label: "Critical", count: 8, color: "#991b1b" },
];

const notifications = [
  { title: "Report Ready", subtitle: "24 Lakeview Street" },
  { title: "Property Tax Update", subtitle: "Palm Residency" },
  { title: "Permit Expiry Alert", subtitle: "18 Green Avenue" },
];

const quickActions = [
  { label: "New Property Search", subtitle: "Search a new property", icon: LuSearch },
  { label: "Generate Report", subtitle: "Create due diligence report", icon: LuFileText },
  { label: "Compare Properties", subtitle: "Compare Multiple Properties", icon: LuChartBar },
  { label: "Upload Documents", subtitle: "Add documents", icon: LuUpload },
];

const riskBadgeClasses = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-600",
};

function RiskDonut({ data, total }) {
  const size = 168;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = data.reduce((acc, segment) => {
    const previous = acc[acc.length - 1];
    const cumulativeBefore = previous ? previous.cumulativeAfter : 0;
    const fraction = segment.count / total;
    const dash = fraction * circumference;
    acc.push({
      ...segment,
      dashArray: `${dash} ${circumference - dash}`,
      dashOffset: -cumulativeBefore * circumference,
      cumulativeAfter: cumulativeBefore + fraction,
    });
    return acc;
  }, []);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {segments.map((segment) => (
          <circle
            key={segment.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={segment.dashArray}
            strokeDashoffset={segment.dashOffset}
          />
        ))}
      </g>
      <text x="50%" y="47%" textAnchor="middle" className="fill-slate-900" style={{ fontSize: 28, fontWeight: 700 }}>
        {total}
      </text>
      <text x="50%" y="60%" textAnchor="middle" className="fill-slate-500" style={{ fontSize: 12 }}>
        Total
      </text>
    </svg>
  );
}

export default function Dashboard() {
  const totalProperties = riskBreakdown.reduce((sum, r) => sum + r.count, 0);

  return (
    <Layout title="Dashboard" showSearch>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
            <div key={label} className="flex items-center gap-4 rounded-xl border border-slate-400 bg-white p-5! shadow-md">
              <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconBg}`}>
                <Icon size={20} className={iconColor} />
              </span>
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-2xl font-semibold">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-400 bg-white p-6! shadow-md lg:col-span-2">
            <h2 className="mb-4 pl-1! text-base font-semibold">Recent Searches</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-100! border-b border-slate-300 text-slate-500">
                    <th className="px-4! py-3! font-medium">Property</th>
                    <th className="px-4! py-3! font-medium">Type</th>
                    <th className="px-4! py-3! font-medium">Risk</th>
                    <th className="px-4! py-3! font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSearches.map((row) => (
                    <tr key={row.property} className="bg-white! border-b border-slate-200 last:border-0">
                      <td className="px-4! py-4! font-medium">{row.property}</td>
                      <td className="px-4! py-4! text-slate-600">{row.type}</td>
                      <td className="px-4! py-4!">
                        <span className={`rounded-md px-2 py-1 text-xs font-medium ${riskBadgeClasses[row.risk]}`}>
                          {row.risk}
                        </span>
                      </td>
                      <td className="px-4! py-4! text-slate-600">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-400 bg-white p-6! shadow-md">
            <h2 className="mb-4 pl-1! text-base font-semibold">Risk Summary</h2>
            <div className="flex items-center gap-6">
              <RiskDonut data={riskBreakdown} total={totalProperties} />
              <ul className="space-y-2 text-sm">
                {riskBreakdown.map((r) => (
                  <li key={r.label} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="text-slate-600">
                      {r.label} ({r.count})
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <h3 className="mb-3 mt-6 text-sm font-semibold">Upcoming Notifications</h3>
            <ul className="space-y-3">
              {notifications.map((n) => (
                <li key={n.title} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-xs text-slate-500">{n.subtitle}</p>
                  </div>
                  <LuChevronRight size={16} className="text-slate-400" />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-slate-400 bg-white p-6! shadow-md">
          <h2 className="mb-4 pl-1! text-base font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map(({ label, subtitle, icon: Icon }) => (
              <button key={label} className="flex items-center gap-3 rounded-lg border border-slate-400 bg-slate-50 p-4 text-left hover:bg-slate-100">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-slate-500">{subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
