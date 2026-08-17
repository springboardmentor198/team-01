package com.realestate.duediligence.controller.admin;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.realestate.duediligence.entity.Report;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.repository.ReportHistoryRepository;
import com.realestate.duediligence.repository.ReportRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.util.JwtService;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(origins = "*")
public class AdminReportController {
    private final ReportRepository reportRepository;
    private final ReportHistoryRepository reportHistoryRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AdminReportController(ReportRepository reportRepository, ReportHistoryRepository reportHistoryRepository,
            UserRepository userRepository, JwtService jwtService) {
        this.reportRepository = reportRepository;
        this.reportHistoryRepository = reportHistoryRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<Page<Map<String, Object>>> getReports(@RequestHeader("Authorization") String authHeader,
            Pageable pageable) {
        requireAdmin(authHeader);
        return ResponseEntity.ok(reportRepository.findAll(pageable).map(this::toResponse));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Long>> getSummary(@RequestHeader("Authorization") String authHeader) {
        requireAdmin(authHeader);
        long pdfDownloads = reportHistoryRepository.countByAction("PDF_EXPORTED");
        long excelDownloads = reportHistoryRepository.countByAction("EXCEL_EXPORTED");
        return ResponseEntity.ok(Map.of(
                "totalReports", reportRepository.count(),
                "totalDownloads", pdfDownloads + excelDownloads,
                "pdfDownloads", pdfDownloads,
                "excelDownloads", excelDownloads));
    }

    private Map<String, Object> toResponse(Report report) {
        return Map.of(
                "reportId", report.getId(),
                "propertyId", report.getPropertyId(),
                "status", report.getStatus(),
                "createdBy", report.getCreatedBy() == null ? "" : report.getCreatedBy(),
                "createdAt", report.getCreatedAt());
    }

    private void requireAdmin(String authHeader) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Administrator access is required"));
        if (user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Administrator access is required");
        }
    }
}
