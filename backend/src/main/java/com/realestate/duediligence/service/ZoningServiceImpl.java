package com.realestate.duediligence.service;

import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.realestate.duediligence.dto.ZoningRequest;
import com.realestate.duediligence.dto.ZoningResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.RiskSummary;
import com.realestate.duediligence.entity.ZoningRecord;
import com.realestate.duediligence.exception.ConflictException;
import com.realestate.duediligence.exception.ResourceNotFoundException;
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
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        repository.findByProperty_PropertyId(request.getPropertyId()).ifPresent(z -> {
            throw new ConflictException("Zoning record already exists for this property");
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
        calculateComplianceAndRisk(zoning, property, null);

        repository.save(zoning);
        return mapToResponse(zoning);
    }

    @Override
    public ZoningResponse getZoning(Integer propertyId) {
        ZoningRecord zoning = repository.findByProperty_PropertyId(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Zoning record not found"));
        return mapToResponse(zoning);
    }

    @Override
    public ZoningResponse updateZoning(Integer id, ZoningRequest request) {
        ZoningRecord zoning = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zoning record not found"));

        // Capture the risk contribution of the PREVIOUS zoning state before overwriting it,
        // so we can back it out of the RiskSummary instead of only ever adding on top.
        String previousRisk = zoning.getZoningRisk();

        zoning.setZoneType(request.getZoneType());
        zoning.setLandUse(request.getLandUse());
        zoning.setFar(request.getFar());
        zoning.setBuildingHeight(request.getBuildingHeight());
        zoning.setRestrictions(request.getRestrictions());
        zoning.setUpdatedAt(LocalDateTime.now());

        // Recheck compliance and calculate zoning risk, adjusting for the prior contribution
        calculateComplianceAndRisk(zoning, zoning.getProperty(), previousRisk);

        repository.save(zoning);
        return mapToResponse(zoning);
    }

    @Override
    public void deleteZoning(Integer id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Zoning record not found");
        }
        repository.deleteById(id);
    }

    private void calculateComplianceAndRisk(ZoningRecord zoning, Property property, String previousRisk) {
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
            int currentScore = riskSummary.getRiskScore() != null ? riskSummary.getRiskScore() : 0;

            // Back out whatever this zoning record previously contributed, so repeated
            // updates don't keep stacking +20 on top of an already-applied adjustment.
            int previousAdjustment = "HIGH".equals(previousRisk) ? 20 : 0;
            int newAdjustment = risk.equals("HIGH") ? 20 : 0;
            int scoreAdjustment = newAdjustment - previousAdjustment;

            String remarks = riskSummary.getRemarks() != null ? riskSummary.getRemarks() : "";

            if (compliance.equals("NON_COMPLIANT")) {
                if (!remarks.contains("Zoning non-compliance warning")) {
                    remarks = "Zoning non-compliance warning: Property type conflicts with zone limitations. " + remarks;
                }
            } else {
                if (remarks.contains("Zoning non-compliance warning: Property type conflicts with zone limitations. ")) {
                    remarks = remarks.replace("Zoning non-compliance warning: Property type conflicts with zone limitations. ", "");
                }
            }

            int updatedScore = Math.max(0, Math.min(100, currentScore + scoreAdjustment));
            riskSummary.setRiskScore(updatedScore);

            if (updatedScore >= 70) {
                riskSummary.setOverallRisk("HIGH");
            } else if (updatedScore >= 35) {
                riskSummary.setOverallRisk("MEDIUM");
            } else {
                riskSummary.setOverallRisk("LOW");
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
