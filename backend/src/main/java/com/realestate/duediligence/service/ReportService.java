package com.realestate.duediligence.service;

import com.realestate.duediligence.entity.Report;

public interface ReportService {

    /**
     * Builds a full Due Diligence Report for the given property, generates an
     * executive summary, persists it, and logs a GENERATED entry in report_history.
     */
    Report generateReport(Integer propertyId, String requestedBy);

    /**
     * Fetches a previously generated report by its id. Throws if not found.
     */
    Report getReportById(Long reportId);
}
