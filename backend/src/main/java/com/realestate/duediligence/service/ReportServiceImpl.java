package com.realestate.duediligence.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.realestate.duediligence.dto.PropertyReportResponse;
import com.realestate.duediligence.dto.RiskSummaryResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.Report;
import com.realestate.duediligence.entity.ReportHistory;
import com.realestate.duediligence.repository.ReportHistoryRepository;
import com.realestate.duediligence.repository.ReportRepository;



@Service
public class ReportServiceImpl implements ReportService {

    private final PropertyService propertyService;
    private final RiskSummaryService riskSummaryService;
    private final DocumentService documentService;
    private final PermitService permitService;
    private final ReportRepository reportRepository;
    private final ReportHistoryRepository reportHistoryRepository;
    // private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
private final ObjectMapper objectMapper;
    public ReportServiceImpl(
        PropertyService propertyService,
        RiskSummaryService riskSummaryService,
        DocumentService documentService,
        PermitService permitService,
        ReportRepository reportRepository,
        ReportHistoryRepository reportHistoryRepository,
        ObjectMapper objectMapper) {

    this.propertyService = propertyService;
    this.riskSummaryService = riskSummaryService;
    this.documentService = documentService;
    this.permitService = permitService;
    this.reportRepository = reportRepository;
    this.reportHistoryRepository = reportHistoryRepository;
    this.objectMapper = objectMapper;
}

    @Override
    @Transactional
    public Report generateReport(Integer propertyId, String requestedBy) {
        Property property = propertyService.getById(propertyId);

        // Reuses the same aggregation the existing GET /api/reports/{propertyId}
        // endpoint already does.
        PropertyReportResponse aggregated = PropertyReportResponse.builder()
                .property(property)
                .riskSummary(riskSummaryService.getRiskSummary(propertyId))
                .documents(documentService.getDocuments(propertyId))
                .permits(permitService.getPermits(propertyId))
                .build();

        String executiveSummary = buildExecutiveSummary(aggregated);
        String reportDataJson = toJson(aggregated);

        Report report = new Report();
        report.setPropertyId(propertyId);
        report.setExecutiveSummary(executiveSummary);
        report.setReportData(reportDataJson);
        report.setStatus("GENERATED");
        report.setCreatedBy(requestedBy);

        Report saved = reportRepository.save(report);

        reportHistoryRepository.save(
                new ReportHistory(saved, ReportHistory.Action.GENERATED, requestedBy));

        return saved;
    }

    @Override
    public Report getReportById(Long reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found: " + reportId));
    }

    @Override
    public Report getLatestReportByProperty(Integer propertyId) {
        return reportRepository.findByPropertyIdOrderByCreatedAtDesc(propertyId)
                .stream()
                .findFirst()
                .orElse(null);
    }

    /**
     * Builds a short executive summary from the aggregated risk data.
     * Field names confirmed against the real RiskSummary entity.
     */
    private String buildExecutiveSummary(PropertyReportResponse aggregated) {
        StringBuilder sb = new StringBuilder();
        RiskSummaryResponse risk = aggregated.getRiskSummary();

        if (risk != null) {
            if (risk.getOverallRisk() != null || risk.getRiskScore() != null) {
                sb.append("Overall Risk: ")
                        .append(risk.getOverallRisk() != null ? risk.getOverallRisk() : "N/A")
                        .append(risk.getRiskScore() != null ? " (Score: " + risk.getRiskScore() + ")" : "")
                        .append("\n\n");
            }

            if (risk.getComplianceStatus() != null) {
                sb.append("Compliance Status: ").append(risk.getComplianceStatus()).append("\n\n");
            }

            if (risk.getRecommendation() != null) {
                sb.append("Recommendation: ").append(risk.getRecommendation()).append("\n\n");
            }

            if (risk.getCriticalIssues() != null) {
                sb.append("Critical Issues: ").append(risk.getCriticalIssues()).append("\n\n");
            }

            if (risk.getMissingDocuments() != null) {
                sb.append("Missing Documents: ").append(risk.getMissingDocuments()).append("\n\n");
            }

            if (risk.getRemarks() != null) {
                sb.append("Remarks: ").append(risk.getRemarks()).append("\n\n");
            }

            // Individual risk category breakdown, only included when populated
            StringBuilder categories = new StringBuilder();
            appendIfPresent(categories, "Flood Risk", risk.getFloodRisk());
            appendIfPresent(categories, "Legal Risk", risk.getLegalRisk());
            appendIfPresent(categories, "Environmental Risk", risk.getEnvironmentalRisk());
            appendIfPresent(categories, "Financial Risk", risk.getFinancialRisk());
            appendIfPresent(categories, "Market Risk", risk.getMarketRisk());
            appendIfPresent(categories, "Ownership Risk", risk.getOwnershipRisk());
            if (categories.length() > 0) {
                sb.append("Risk Breakdown:\n").append(categories).append("\n");
            }
        }

        if (sb.length() == 0) {
            sb.append("No risk summary data available for this property.");
        }

        return sb.toString().trim();
    }

    private void appendIfPresent(StringBuilder sb, String label, String value) {
        if (value != null && !value.isBlank()) {
            sb.append("  - ").append(label).append(": ").append(value).append("\n");
        }
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize report data", e);
        }
    }
}
