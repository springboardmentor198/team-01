package com.realestate.duediligence.service;

import com.realestate.duediligence.entity.Report;

public interface ReportService {

    
    Report generateReport(Integer propertyId, String requestedBy);

    
    Report getReportById(Long reportId);

    Report getLatestReportByProperty(Integer propertyId);
}
