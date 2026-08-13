package com.realestate.duediligence.dto;

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
public class RiskAssessmentResponse {

    private Integer propertyId;

    private Integer riskScore;

    private String overallRisk;

    private String ownershipRisk;

    private String financialRisk;

    private String legalRisk;

    private String permitRisk;

    private String zoningRisk;

    private String floodRisk;

    private String documentRisk;

    private String environmentalRisk;

    private String complianceStatus;

    private String recommendation;

    private String criticalIssues;

    private String riskTrend;
}
