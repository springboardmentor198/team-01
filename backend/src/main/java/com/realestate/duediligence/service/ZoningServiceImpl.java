package com.realestate.duediligence.service;

import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.realestate.duediligence.dto.ZoningRequest;
import com.realestate.duediligence.dto.ZoningResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.RiskSummary;
import com.realestate.duediligence.entity.ZoningRecord;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.RiskSummaryRepository;
import com.realestate.duediligence.repository.ZoningRepository;

@Service
public class ZoningServiceImpl implements ZoningService {

    private final ZoningRepository repository;
    private final PropertyRepository propertyRepository;
    private final RiskSummaryRepository riskSummaryRepository;

    public ZoningServiceImpl(ZoningRepository repository, 
                             PropertyRepository propertyRepository,
                             RiskSummaryRepository riskSummaryRepository) {
        this.repository = repository;
        this.propertyRepository = propertyRepository;
        this.riskSummaryRepository = riskSummaryRepository;
    }

    @Override
    public ZoningResponse createZoning(ZoningRequest request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Property not found"));

        repository.findByProperty_PropertyId(request.getPropertyId()).ifPresent(z -> {
            throw new RuntimeException("Zoning record already exists for this property");
        });

        ZoningRecord zoning = ZoningRecord.builder()
                .property(property)
                .zoneType(request.getZoneType())
                .landUse(request.getLandUse())
                .far(request.getFar())
                .buildingHeight(request.getBuildingHeight())
                .restrictions(request.getRestrictions())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Dynamically analyze compliance and calculate zoning risk
        calculateComplianceAndRisk(zoning, property);

        repository.save(zoning);
        return mapToResponse(zoning);
    }

    @Override
    public ZoningResponse getZoning(Integer propertyId) {
        ZoningRecord zoning = repository.findByProperty_PropertyId(propertyId)
                .orElseThrow(() -> new RuntimeException("Zoning record not found"));
        return mapToResponse(zoning);
    }

    @Override
    public ZoningResponse updateZoning(Integer id, ZoningRequest request) {
        ZoningRecord zoning = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Zoning record not found"));

        zoning.setZoneType(request.getZoneType());
        zoning.setLandUse(request.getLandUse());
        zoning.setFar(request.getFar());
        zoning.setBuildingHeight(request.getBuildingHeight());
        zoning.setRestrictions(request.getRestrictions());
        zoning.setUpdatedAt(LocalDateTime.now());

        // Recheck compliance and calculate zoning risk
        calculateComplianceAndRisk(zoning, zoning.getProperty());

        repository.save(zoning);
        return mapToResponse(zoning);
    }

    @Override
    public void deleteZoning(Integer id) {
        repository.deleteById(id);
    }

    private void calculateComplianceAndRisk(ZoningRecord zoning, Property property) {
        String zoneType = zoning.getZoneType() != null ? zoning.getZoneType() : "";
        String propType = property.getPropertyType() != null ? property.getPropertyType() : "";
        String restrictions = zoning.getRestrictions() != null ? zoning.getRestrictions() : "";

        String compliance = "COMPLIANT";
        String risk = "LOW";

        // 1. Check basic property type matching with zone type
        if (propType.equalsIgnoreCase("Commercial") && zoneType.toLowerCase().contains("residential")) {
            compliance = "NON_COMPLIANT";
            risk = "HIGH";
        } else if (propType.equalsIgnoreCase("Industrial") && (zoneType.toLowerCase().contains("residential") || zoneType.toLowerCase().contains("commercial"))) {
            compliance = "NON_COMPLIANT";
            risk = "HIGH";
        }

        // 2. Check restrictions
        if (restrictions.toLowerCase().contains("no commercial") && propType.equalsIgnoreCase("Commercial")) {
            compliance = "NON_COMPLIANT";
            risk = "HIGH";
        } else if (restrictions.toLowerCase().contains("no industrial") && propType.equalsIgnoreCase("Industrial")) {
            compliance = "NON_COMPLIANT";
            risk = "HIGH";
        }

        zoning.setComplianceStatus(compliance);
        zoning.setZoningRisk(risk);

        // 3. Update overall Property RiskSummary
        Optional<RiskSummary> riskOpt = riskSummaryRepository.findByProperty_PropertyId(property.getPropertyId());
        if (riskOpt.isPresent()) {
            RiskSummary riskSummary = riskOpt.get();
            int scoreAdjustment = risk.equals("HIGH") ? 20 : 0;
            String remarks = riskSummary.getRemarks() != null ? riskSummary.getRemarks() : "";

            if (compliance.equals("NON_COMPLIANT")) {
                if (!remarks.contains("Zoning non-compliance warning")) {
                    remarks = "Zoning non-compliance warning: Property type conflicts with zone limitations. " + remarks;
                }
                riskSummary.setRiskScore(Math.min(100, (riskSummary.getRiskScore() != null ? riskSummary.getRiskScore() : 0) + scoreAdjustment));
                if (riskSummary.getRiskScore() >= 70) {
                    riskSummary.setOverallRisk("HIGH");
                } else if (riskSummary.getRiskScore() >= 35) {
                    riskSummary.setOverallRisk("MEDIUM");
                }
            } else {
                if (remarks.contains("Zoning non-compliance warning: Property type conflicts with zone limitations. ")) {
                    remarks = remarks.replace("Zoning non-compliance warning: Property type conflicts with zone limitations. ", "");
                }
            }

            riskSummary.setRemarks(remarks);
            riskSummary.setUpdatedAt(LocalDateTime.now());
            riskSummaryRepository.save(riskSummary);
        }
    }

    private ZoningResponse mapToResponse(ZoningRecord zoning) {
        return ZoningResponse.builder()
                .id(zoning.getId())
                .propertyId(zoning.getProperty().getPropertyId())
                .zoneType(zoning.getZoneType())
                .landUse(zoning.getLandUse())
                .far(zoning.getFar())
                .buildingHeight(zoning.getBuildingHeight())
                .restrictions(zoning.getRestrictions())
                .complianceStatus(zoning.getComplianceStatus())
                .zoningRisk(zoning.getZoningRisk())
                .build();
    }
}
