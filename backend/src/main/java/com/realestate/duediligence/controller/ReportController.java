package com.realestate.duediligence.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.PropertyReportResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.event.NotificationEvents;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.DocumentService;
import com.realestate.duediligence.service.PermitService;
import com.realestate.duediligence.service.PropertyService;
import com.realestate.duediligence.service.RiskSummaryService;
import com.realestate.duediligence.util.JwtService;

import org.springframework.context.ApplicationEventPublisher;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final PropertyService propertyService;
    private final RiskSummaryService riskSummaryService;
    private final DocumentService documentService;
    private final PermitService permitService;
    private final ApplicationEventPublisher eventPublisher;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public ReportController(
            PropertyService propertyService,
            RiskSummaryService riskSummaryService,
            DocumentService documentService,
            PermitService permitService,
            ApplicationEventPublisher eventPublisher,
            UserRepository userRepository,
            JwtService jwtService) {
        this.propertyService = propertyService;
        this.riskSummaryService = riskSummaryService;
        this.documentService = documentService;
        this.permitService = permitService;
        this.eventPublisher = eventPublisher;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<PropertyReportResponse> getReport(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Integer propertyId) {

        Property property = propertyService.getById(propertyId);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String email = jwtService.extractUsername(authHeader.substring(7));
                User requester = userRepository.findByEmail(email).orElse(null);
                if (requester != null) {
                    eventPublisher.publishEvent(
                            new NotificationEvents.ReportGeneratedEvent(requester, property));
                }
            } catch (Exception ignored) {
                // Report generation should not fail if notification event fails.
            }
        }

        return ResponseEntity.ok(PropertyReportResponse.builder()
                .property(property)
                .riskSummary(riskSummaryService.getRiskSummary(propertyId))
                .documents(documentService.getDocuments(propertyId))
                .permits(permitService.getPermits(propertyId))
                .build());
    }
}
