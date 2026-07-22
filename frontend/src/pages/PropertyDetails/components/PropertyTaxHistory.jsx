import { LuReceipt, LuBadgeCheck, LuClock3 } from "react-icons/lu";

export default function PropertyTaxHistory({ taxHistory = [] }) {
  return (
    <div className="details-card">
      <h3>Property Tax History</h3>

      {taxHistory.length === 0 ? (
        <p className="no-data">No tax records available.</p>
      ) : (
        <div className="tax-table-wrapper">
          <table className="tax-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>

            <tbody>
              {taxHistory.map((tax, index) => (
                <tr key={index}>
                  <td>{tax.year}</td>

                  <td>
                    <div className="table-cell">
                      <LuReceipt />
                      {tax.amount}
                    </div>
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        tax.status?.toLowerCase() === "paid"
                          ? "paid"
                          : "pending"
                      }`}
                    >
                      {tax.status?.toLowerCase() === "paid" ? (
                        <LuBadgeCheck />
                      ) : (
                        <LuClock3 />
                      )}
                      {tax.status}
                    </span>
                  </td>

                  <td>{tax.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}