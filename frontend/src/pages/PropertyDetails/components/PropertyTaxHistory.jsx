import {
  LuReceipt,
  LuShieldAlert,
  LuCoins,
  LuHourglass,
} from "react-icons/lu";

export default function PropertyTaxHistory({ taxSummary }) {
  const formatCurrency = (amount) => {
    if (amount == null) return "Not Available";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="details-card">
      <h3>Property Tax Summary</h3>

      <div className="details-list">
        <div className="detail-item">
          <LuReceipt />
          <div>
            <span>Tax Status</span>
            <strong>
              {taxSummary?.taxStatus 
                ? taxSummary.taxStatus.toUpperCase() 
                : "Not Available"}
            </strong>
          </div>
        </div>

        <div className="detail-item">
          <LuShieldAlert />
          <div>
            <span>Tax Risk</span>
            <strong>
              {taxSummary?.taxRisk 
                ? taxSummary.taxRisk.toUpperCase() 
                : "Not Available"}
            </strong>
          </div>
        </div>

        <div className="detail-item">
          <LuCoins />
          <div>
            <span>Total Paid Amount</span>
            <strong>
              {taxSummary?.totalPaidAmount != null
                ? formatCurrency(taxSummary.totalPaidAmount)
                : "Not Available"}
            </strong>
          </div>
        </div>

        <div className="detail-item">
          <LuHourglass />
          <div>
            <span>Total Unpaid Amount</span>
            <strong>
              {taxSummary?.totalUnpaidAmount != null
                ? formatCurrency(taxSummary.totalUnpaidAmount)
                : "Not Available"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}