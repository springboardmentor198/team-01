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
public class RiskSummaryResponse {

    private Integer id;

    private Integer propertyId;

    private Integer riskScore;

    private String overallRisk;

    private String floodRisk;

    private String legalRisk;

    private String environmentalRisk;

    private String remarks;

}