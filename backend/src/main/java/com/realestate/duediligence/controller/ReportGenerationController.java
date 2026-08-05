package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.ReportGenerateRequest;
import com.realestate.duediligence.dto.ReportGenerateResponse;
import com.realestate.duediligence.entity.Report;
import com.realestate.duediligence.entity.ReportHistory;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.ReportHistoryRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.ExcelExportService;
import com.realestate.duediligence.service.PdfExportService;
import com.realestate.duediligence.service.ReportService;
import com.realestate.duediligence.util.JwtService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Handles report generation, PDF export, and Excel export as required by the
 * Due Diligence Report Engine spec:
 *   POST /api/report/generate
 *   GET  /api/report/pdf/{id}
 *   GET  /api/report/excel/{id}
 *
 * Kept separate from the existing ReportController (/api/reports/{propertyId})
 * to avoid touching that working endpoint.
 */
@RestController
@RequestMapping("/api/report")
@CrossOrigin(origins = "*")
public class ReportGenerationController {

    private final ReportService reportService;
    private final PdfExportService pdfExportService;
    private final ExcelExportService excelExportService;
    private final ReportHistoryRepository reportHistoryRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public ReportGenerationController(
            ReportService reportService,
            PdfExportService pdfExportService,
            ExcelExportService excelExportService,
            ReportHistoryRepository reportHistoryRepository,
            UserRepository userRepository,
            JwtService jwtService) {
        this.reportService = reportService;
        this.pdfExportService = pdfExportService;
        this.excelExportService = excelExportService;
        this.reportHistoryRepository = reportHistoryRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/generate")
    public ResponseEntity<ReportGenerateResponse> generate(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody ReportGenerateRequest request) {

        String requestedBy = resolveUserEmail(authHeader);

        Report report = reportService.generateReport(request.getPropertyId(), requestedBy);

        ReportGenerateResponse response = new ReportGenerateResponse(
                report.getId(),
                report.getPropertyId(),
                report.getExecutiveSummary(),
                report.getStatus(),
                report.getCreatedAt());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/pdf/{id}")
    public ResponseEntity<byte[]> exportPdf(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {

        Report report = reportService.getReportById(id);
        byte[] pdfBytes = pdfExportService.generatePdf(report);

        logHistory(report, ReportHistory.Action.PDF_EXPORTED, resolveUserEmail(authHeader));

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"report-" + id + ".pdf\"")
                .body(pdfBytes);
    }

    @GetMapping("/excel/{id}")
    public ResponseEntity<byte[]> exportExcel(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {

        Report report = reportService.getReportById(id);
        byte[] excelBytes = excelExportService.generateExcel(report);

        logHistory(report, ReportHistory.Action.EXCEL_EXPORTED, resolveUserEmail(authHeader));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"report-" + id + ".xlsx\"")
                .body(excelBytes);
    }

    private void logHistory(Report report, ReportHistory.Action action, String performedBy) {
        try {
            reportHistoryRepository.save(new ReportHistory(report, action, performedBy));
        } catch (Exception ignored) {
            // Exporting should not fail just because history logging failed.
        }
    }

    private String resolveUserEmail(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String email = jwtService.extractUsername(authHeader.substring(7));
                User user = userRepository.findByEmail(email).orElse(null);
                return user != null ? user.getEmail() : null;
            } catch (Exception ignored) {
                // Falls through to null below.
            }
        }
        return null;
    }
}
