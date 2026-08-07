package com.realestate.duediligence.dto;

import com.realestate.duediligence.entity.Property;
import lombok.Data;

import java.util.List;

@Data
public class PropertyProfileResponse {

    private Property property;

    private List<OwnershipResponse> ownership;

    private List<DocumentResponse> documents;

    private List<PermitResponse> permits;

    private RiskSummaryResponse riskSummary;

    private PropertyTaxSummaryResponse propertyTaxSummary;

    private List<PropertyTaxHistoryResponse> propertyTaxHistory;

    private FloodZoneResponse floodZone;

    private ZoningResponse zoning;
}
