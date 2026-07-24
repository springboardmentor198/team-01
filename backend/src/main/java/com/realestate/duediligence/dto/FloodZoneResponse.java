package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FloodZoneResponse {
    private Integer id;
    private Integer propertyId;
    private String zone;
    private String riskLevel;
    private String elevation;
    private String femaClassification;
    private Boolean insuranceRequired;
}
