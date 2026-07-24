package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoningResponse {
    private Integer id;
    private Integer propertyId;
    private String zoneType;
    private String landUse;
    private String far;
    private String buildingHeight;
    private String restrictions;
    private String complianceStatus;
    private String zoningRisk;
}
