import { LuFileDown, LuLoader, LuFileSpreadsheet } from "react-icons/lu";

/**
 * ReportActions — Download PDF and Download Excel buttons that call the
 * respective backend APIs, automatically download the files, show loading
 * indicators while downloading, disable buttons during the download process,
 * and display user-friendly error messages if the download fails.
 */
export default function ReportActions({
  reportId,
  downloading,
  error,
  onDownloadPdf,
  onDownloadExcel,
}) {
  const pdfLoading = downloading === "pdf";
  const excelLoading = downloading === "excel";
  const anyLoading = !!downloading;

  return (
    <div className="report-actions">
      <button
        type="button"
        className="report-btn report-btn-pdf"
        onClick={onDownloadPdf}
        disabled={anyLoading || !reportId}
      >
        {pdfLoading ? (
          <LuLoader className="report-btn-spinner" />
        ) : (
          <LuFileDown />
        )}
        {pdfLoading ? "Preparing PDF…" : "Download PDF"}
      </button>
      <button
        type="button"
        className="report-btn report-btn-excel"
        onClick={onDownloadExcel}
        disabled={anyLoading || !reportId}
      >
        {excelLoading ? (
          <LuLoader className="report-btn-spinner" />
        ) : (
          <LuFileSpreadsheet />
        )}
        {excelLoading ? "Preparing Excel…" : "Download Excel"}
      </button>
      {error && (
        <span className="report-actions-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
