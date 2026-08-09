import { useCallback, useEffect, useState } from "react";
import { LuFileText, LuRefreshCw, LuLoader } from "react-icons/lu";
import { api } from "../../services/api";
import ExecutiveSummary from "./components/ExecutiveSummary";
import ReportDetails from "./components/ReportDetails";
import RecommendationPanel from "./components/RecommendationPanel";
import ReportActions from "./components/ReportActions";

function Skeleton() {
  return (
    <div className="report-skeleton">
      <div />
      <div />
      <div />
    </div>
  );
}

function EmptyState({ onGenerate, generating }) {
  return (
    <div className="report-empty">
      <LuFileText />
      <h2>No Due Diligence Report Available</h2>
      <p>
        A due diligence report has not been generated for this property yet.
        Click below to generate one.
      </p>
      <button onClick={onGenerate} disabled={generating}>
        {generating ? (
          <>
            <LuLoader className="report-btn-spinner" />
            Generating report…
          </>
        ) : (
          "Generate Report"
        )}
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="report-empty">
      <LuRefreshCw />
      <h2>Unable to load report.</h2>
      <p>{message || "Something went wrong while loading the report."}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  );
}

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


export default function ReportPage({ propertyId }) {
  const [data, setData] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [downloadError, setDownloadError] = useState("");

  const load = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(false);
    setErrorMessage("");
    setReport(null);

    try {
      const [property, risk, documents, permits, existingReport] =
        await Promise.all([
          api.getPropertyById(propertyId),
          api.getRiskSummary(propertyId).catch((err) => {
            console.warn("Risk summary not found", err);
            return null;
          }),
          api.getDocuments(propertyId).catch(() => []),
          api.getPermits(propertyId).catch(() => []),
          // Load any previously generated report in the same round trip so
          // returning to this page doesn't force a fresh "Generate" click
          // (which would otherwise create a duplicate report row every time).
          api.getReportByProperty(propertyId).catch((err) => {
            console.warn("Existing report lookup failed", err);
            return null;
          }),
        ]);

      if (!property) {
        setError(true);
        setErrorMessage("The requested property could not be found.");
        return;
      }

      setData({
        property,
        risk,
        documents: documents || [],
        permits: permits || [],
      });
      if (existingReport) setReport(existingReport);
    } catch (err) {
      console.error("Load Error:", err);
      setError(true);
      setErrorMessage(
        err?.response?.status === 404
          ? "The requested property could not be found."
          : err?.message || "Failed to load report data.",
      );
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const generateReport = useCallback(async () => {
    if (!propertyId) return;
    setGenerating(true);
    try {
      const generated = await api.generateReport(Number(propertyId));
      setReport(generated);
      setError(false);
      setErrorMessage("");
    } catch (err) {
      console.error("Generate Error:", err);
      setError(true);
      setErrorMessage(
        err?.message || "Failed to generate the due diligence report.",
      );
    } finally {
      setGenerating(false);
    }
  }, [propertyId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDownload = useCallback(
    async (kind) => {
      if (downloading) return;
      const id = report?.id;
      if (!id) {
        setDownloadError("Please generate the report before downloading.");
        return;
      }
      setDownloading(kind);
      setDownloadError("");
      try {
        const blob =
          kind === "excel"
            ? await api.downloadReportExcel(id)
            : await api.downloadReportPdf(id);
        const ext = kind === "excel" ? "xlsx" : "pdf";
        triggerDownload(blob, `report-${id}.${ext}`);
      } catch (err) {
        console.error(`Download ${kind} Error:`, err);
        setDownloadError(
          `Failed to download the ${kind.toUpperCase()} report. Please try again.`,
        );
      } finally {
        setDownloading(null);
      }
    },
    [downloading, report],
  );

  const handleDownloadPdf = useCallback(
    () => handleDownload("pdf"),
    [handleDownload],
  );
  const handleDownloadExcel = useCallback(
    () => handleDownload("excel"),
    [handleDownload],
  );

  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={errorMessage} onRetry={load} />;

  const { property, risk, documents, permits } = data || {};

  return (
    <div className="report-page">
      <header className="report-header">
        <div>
          <p className="report-eyebrow">Due Diligence Report</p>
          <h1>{property?.propertyCode || "Property Report"}</h1>
          <p>
            {report?.status || "Prepared"} · Generated{" "}
            {report?.createdAt
              ? new Date(report.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "on demand"}
          </p>
        </div>
        <div className="report-header-actions">
          {report && (
            <button
              type="button"
              className="report-btn report-btn-regenerate"
              onClick={generateReport}
              disabled={generating}
              title="Re-run the due diligence analysis and refresh this report"
            >
              {generating ? (
                <LuLoader className="report-btn-spinner" />
              ) : (
                <LuRefreshCw />
              )}
              {generating ? "Regenerating…" : "Regenerate"}
            </button>
          )}
          <ReportActions
            reportId={report?.id}
            downloading={downloading}
            error={downloadError}
            onDownloadPdf={handleDownloadPdf}
            onDownloadExcel={handleDownloadExcel}
          />
        </div>
      </header>

      {!report ? (
        <EmptyState onGenerate={generateReport} generating={generating} />
      ) : (
        <>
          <ExecutiveSummary report={report} property={property} risk={risk} />
          <ReportDetails
            property={property}
            risk={risk}
            documents={documents}
            permits={permits}
          />
          <RecommendationPanel risk={risk} report={report} />
        </>
      )}
    </div>
  );
}
