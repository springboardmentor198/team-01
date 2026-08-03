package com.realestate.duediligence.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskSummaryRequest {

    private Integer propertyId;

    // Overall Assessment
    private Integer riskScore;
    private String overallRisk;

    // Risk Breakdown
    private String floodRisk;
    private String legalRisk;
    private String environmentalRisk;
    private String financialRisk;
    private String marketRisk;
    private String ownershipRisk;

    // Review Information
    private String reviewedBy;
    private LocalDateTime reviewedAt;

    // Compliance
    private String complianceStatus;

    // Details
    private String criticalIssues;
    private String recommendation;
    private String missingDocuments;
    private String riskTrend;
    private String remarks;
}