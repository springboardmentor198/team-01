package com.realestate.duediligence.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.RiskAssessmentResponse;
import com.realestate.duediligence.entity.FloodZoneRecord;
import com.realestate.duediligence.entity.OwnershipRecord;
import com.realestate.duediligence.entity.PermitRecord;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.PropertyTaxHistory;
import com.realestate.duediligence.entity.ZoningRecord;
import com.realestate.duediligence.exception.ResourceNotFoundException;
import com.realestate.duediligence.repository.DocumentRepository;
import com.realestate.duediligence.repository.FloodZoneRepository;
import com.realestate.duediligence.repository.OwnershipRecordRepository;
import com.realestate.duediligence.repository.PermitRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.PropertyTaxRepository;
import com.realestate.duediligence.repository.ZoningRepository;

@Service
public class RiskAssessmentServiceImpl implements RiskAssessmentService {

    private final PropertyRepository propertyRepository;
    private final PropertyTaxRepository propertyTaxRepository;
    private final ZoningRepository zoningRepository;
    private final FloodZoneRepository floodZoneRepository;
    private final PermitRepository permitRepository;
    private final DocumentRepository documentRepository;
    private final OwnershipRecordRepository ownershipRecordRepository;

    public RiskAssessmentServiceImpl(
            PropertyRepository propertyRepository,
            PropertyTaxRepository propertyTaxRepository,
            ZoningRepository zoningRepository,
            FloodZoneRepository floodZoneRepository,
            PermitRepository permitRepository,
            DocumentRepository documentRepository,
            OwnershipRecordRepository ownershipRecordRepository) {

        this.propertyRepository = propertyRepository;
        this.propertyTaxRepository = propertyTaxRepository;
        this.zoningRepository = zoningRepository;
        this.floodZoneRepository = floodZoneRepository;
        this.permitRepository = permitRepository;
        this.documentRepository = documentRepository;
        this.ownershipRecordRepository = ownershipRecordRepository;
    }

    @Override
    public RiskAssessmentResponse calculateRisk(Integer propertyId) {

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Property not found"));

        // =========================================================
        // 1. OWNERSHIP RISK
        // =========================================================

        List<OwnershipRecord> ownershipRecords =
                ownershipRecordRepository.findByPropertyPropertyId(propertyId);

        String ownershipRisk;

        if (ownershipRecords.isEmpty()) {
            ownershipRisk = "HIGH";
        } else {
            boolean allVerified = ownershipRecords.stream()
                    .allMatch(record ->
                            Boolean.TRUE.equals(record.getVerified()));

            ownershipRisk = allVerified ? "LOW" : "HIGH";
        }

        // =========================================================
        // 2. FINANCIAL / TAX RISK
        // =========================================================

        List<PropertyTaxHistory> taxRecords =
                propertyTaxRepository
                        .findByProperty_PropertyIdOrderByTaxYearDesc(propertyId);

        String financialRisk;

        if (taxRecords.isEmpty()) {

            financialRisk = "MEDIUM";

        } else {

            boolean hasUnpaid =
                    taxRecords.stream().anyMatch(record -> {

                        String status = record.getPaymentStatus();

                        return status != null &&
                                (status.equalsIgnoreCase("UNPAID")
                                || status.equalsIgnoreCase("OVERDUE")
                                || status.equalsIgnoreCase("PENDING"));
                    });

            financialRisk = hasUnpaid ? "HIGH" : "LOW";
        }

        // =========================================================
        // 3. ZONING RISK
        // =========================================================

        ZoningRecord zoning =
                zoningRepository.findByProperty_PropertyId(propertyId)
                        .orElse(null);

        String zoningRisk;
        String legalRisk = "LOW";

        if (zoning == null) {

            zoningRisk = "HIGH";
            legalRisk = "HIGH";

        } else {

            zoningRisk = normalizeRisk(zoning.getZoningRisk());

            if (zoning.getComplianceStatus() != null &&
                    !zoning.getComplianceStatus()
                            .equalsIgnoreCase("COMPLIANT")) {

                legalRisk = "HIGH";
            }

            if (zoning.getRestrictions() != null &&
                    !zoning.getRestrictions().isBlank()) {

                if ("LOW".equals(zoningRisk)) {
                    legalRisk = "MEDIUM";
                }
            }
        }

        // =========================================================
        // 4. FLOOD RISK
        // =========================================================

        FloodZoneRecord flood =
                floodZoneRepository.findByProperty_PropertyId(propertyId)
                        .orElse(null);

        String floodRisk;

        if (flood == null) {

            floodRisk = "MEDIUM";

        } else {

            floodRisk = normalizeRisk(flood.getRiskLevel());

            if (Boolean.TRUE.equals(flood.getInsuranceRequired())
                    && "LOW".equals(floodRisk)) {

                floodRisk = "MEDIUM";
            }
        }

        // =========================================================
        // 5. PERMIT RISK
        // =========================================================

        List<PermitRecord> permits =
                permitRepository.findByProperty_PropertyId(propertyId);

        String permitRisk;

        if (permits.isEmpty()) {

            permitRisk = "MEDIUM";

        } else {

            boolean hasBadPermit = permits.stream().anyMatch(permit -> {

                String status = permit.getStatus();

                boolean badStatus =
                        status != null &&
                        (status.equalsIgnoreCase("REJECTED")
                        || status.equalsIgnoreCase("EXPIRED")
                        || status.equalsIgnoreCase("PENDING"));

                boolean expired =
                        permit.getExpiryDate() != null &&
                        permit.getExpiryDate().isBefore(LocalDate.now());

                return badStatus || expired;
            });

            permitRisk = hasBadPermit ? "HIGH" : "LOW";
        }

        // =========================================================
        // 6. DOCUMENT RISK
        // =========================================================

        int documentCount =
                documentRepository.findByProperty_PropertyId(propertyId)
                        .size();

        String documentRisk;

        if (documentCount == 0) {
            documentRisk = "HIGH";
        } else if (documentCount < 3) {
            documentRisk = "MEDIUM";
        } else {
            documentRisk = "LOW";
        }

        // =========================================================
        // 7. ENVIRONMENTAL RISK
        // =========================================================

        /*
         * There is currently no dedicated EnvironmentalRecord
         * entity/repository in the existing backend.
         *
         * Therefore we do not invent environmental data.
         */
        String environmentalRisk = "NOT_AVAILABLE";

        // =========================================================
        // 8. WEIGHTED SCORE
        // =========================================================

        int score = calculateScore(
                ownershipRisk,
                financialRisk,
                legalRisk,
                permitRisk,
                zoningRisk,
                floodRisk,
                documentRisk);

        String overallRisk = getOverallRisk(score);

        // =========================================================
        // 9. COMPLIANCE
        // =========================================================

        String complianceStatus;

        if ("HIGH".equals(overallRisk)) {
            complianceStatus = "NON_COMPLIANT";
        } else if ("MEDIUM".equals(overallRisk)) {
            complianceStatus = "REVIEW_REQUIRED";
        } else {
            complianceStatus = "COMPLIANT";
        }

        // =========================================================
        // 10. RECOMMENDATION
        // =========================================================

        String recommendation;

        if ("HIGH".equals(overallRisk)) {

            recommendation =
                    "Detailed due diligence and risk mitigation are required before proceeding.";

        } else if ("MEDIUM".equals(overallRisk)) {

            recommendation =
                    "Additional verification is recommended before proceeding.";

        } else {

            recommendation =
                    "Property can proceed for further due diligence.";
        }

        // =========================================================
        // 11. CRITICAL ISSUES
        // =========================================================

        String criticalIssues = buildCriticalIssues(
                ownershipRisk,
                financialRisk,
                legalRisk,
                permitRisk,
                zoningRisk,
                floodRisk,
                documentRisk);

        return RiskAssessmentResponse.builder()
                .propertyId(property.getPropertyId())
                .riskScore(score)
                .overallRisk(overallRisk)
                .ownershipRisk(ownershipRisk)
                .financialRisk(financialRisk)
                .legalRisk(legalRisk)
                .permitRisk(permitRisk)
                .zoningRisk(zoningRisk)
                .floodRisk(floodRisk)
                .documentRisk(documentRisk)
                .environmentalRisk(environmentalRisk)
                .complianceStatus(complianceStatus)
                .recommendation(recommendation)
                .criticalIssues(criticalIssues)
                .riskTrend("STABLE")
                .build();
    }

    private int calculateScore(
            String ownership,
            String financial,
            String legal,
            String permit,
            String zoning,
            String flood,
            String documents) {

        int score = 0;

        score += riskPoints(ownership, 20);
        score += riskPoints(financial, 20);
        score += riskPoints(legal, 15);
        score += riskPoints(permit, 15);
        score += riskPoints(zoning, 10);
        score += riskPoints(flood, 10);
        score += riskPoints(documents, 10);

        return Math.min(score, 100);
    }

    private int riskPoints(String risk, int weight) {

        if (risk == null) {
            return weight / 2;
        }

        switch (risk.toUpperCase()) {

            case "HIGH":
                return weight;

            case "MEDIUM":
                return weight / 2;

            case "LOW":
                return 0;

            default:
                return weight / 2;
        }
    }

    private String getOverallRisk(int score) {

        if (score <= 30) {
            return "LOW";
        }

        if (score <= 60) {
            return "MEDIUM";
        }

        return "HIGH";
    }

    private String normalizeRisk(String value) {

        if (value == null || value.isBlank()) {
            return "MEDIUM";
        }

        String normalized = value.trim().toUpperCase();

        if (normalized.contains("HIGH")) {
            return "HIGH";
        }

        if (normalized.contains("MEDIUM")
                || normalized.contains("MODERATE")) {
            return "MEDIUM";
        }

        if (normalized.contains("LOW")) {
            return "LOW";
        }

        return "MEDIUM";
    }

    private String buildCriticalIssues(
            String ownership,
            String financial,
            String legal,
            String permit,
            String zoning,
            String flood,
            String documents) {

        StringBuilder issues = new StringBuilder();

        addIssue(issues, "Ownership verification issue", ownership);
        addIssue(issues, "Tax/financial issue", financial);
        addIssue(issues, "Legal issue", legal);
        addIssue(issues, "Permit issue", permit);
        addIssue(issues, "Zoning issue", zoning);
        addIssue(issues, "Flood risk issue", flood);
        addIssue(issues, "Missing/insufficient documents", documents);

        if (issues.length() == 0) {
            return "No critical issues identified";
        }

        return issues.toString();
    }

    private void addIssue(
            StringBuilder issues,
            String message,
            String risk) {

        if ("HIGH".equalsIgnoreCase(risk)) {

            if (issues.length() > 0) {
                issues.append("; ");
            }

            issues.append(message);
        }
    }
}
