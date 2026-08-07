package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.PropertyProfileResponse;
import org.springframework.stereotype.Service;

@Service
public class PropertyProfileServiceImpl implements PropertyProfileService {

    private final PropertyService propertyService;
    private final OwnershipService ownershipService;
    private final PropertyTaxService propertyTaxService;
    private final ZoningService zoningService;
    private final FloodZoneService floodZoneService;
    private final DocumentService documentService;
    private final PermitService permitService;
    private final RiskSummaryService riskSummaryService;

    public PropertyProfileServiceImpl(
            PropertyService propertyService,
            OwnershipService ownershipService,
            PropertyTaxService propertyTaxService,
            ZoningService zoningService,
            FloodZoneService floodZoneService,
            DocumentService documentService,
            PermitService permitService,
            RiskSummaryService riskSummaryService) {

        this.propertyService = propertyService;
        this.ownershipService = ownershipService;
        this.propertyTaxService = propertyTaxService;
        this.zoningService = zoningService;
        this.floodZoneService = floodZoneService;
        this.documentService = documentService;
        this.permitService = permitService;
        this.riskSummaryService = riskSummaryService;
    }

        @Override
        public PropertyProfileResponse getPropertyProfile(Integer propertyId) {

            PropertyProfileResponse response = new PropertyProfileResponse();

            // Property Information
            response.setProperty(propertyService.getById(propertyId));

            // Owner Details
            response.setOwnership(
                    ownershipService.getOwnershipByPropertyId(propertyId));

            // Property Tax
            response.setPropertyTaxSummary(
                    propertyTaxService.getTaxSummaryByPropertyId(propertyId));

            response.setPropertyTaxHistory(
                    propertyTaxService.getTaxHistoryByPropertyId(propertyId));

            // Zoning Information
            response.setZoning(
                    zoningService.getZoning(propertyId));

            // Flood Zone
            response.setFloodZone(
                    floodZoneService.getFloodZone(propertyId));

            // Documents
            response.setDocuments(
                    documentService.getDocuments(propertyId));

            // Permits
            response.setPermits(
                    permitService.getPermits(propertyId));

            // Risk Summary
            response.setRiskSummary(
                    riskSummaryService.getRiskSummary(propertyId));

            return response;
        }

            }
        