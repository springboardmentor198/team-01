package com.realestate.duediligence.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.RiskSummaryRequest;
import com.realestate.duediligence.dto.RiskSummaryResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.RiskSummary;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.RiskSummaryRepository;

@Service
public class RiskSummaryServiceImpl implements RiskSummaryService {

    private final RiskSummaryRepository repository;
    private final PropertyRepository propertyRepository;

    public RiskSummaryServiceImpl(RiskSummaryRepository repository,
                                  PropertyRepository propertyRepository) {
        this.repository = repository;
        this.propertyRepository = propertyRepository;
    }

    @Override
public RiskSummaryResponse createRiskSummary(RiskSummaryRequest request) {

    System.out.println("Received Property ID = " + request.getPropertyId());

    System.out.println("All properties in database:");
    propertyRepository.findAll().forEach(System.out::println);

    Property property = propertyRepository.findById(request.getPropertyId())
            .orElseThrow(() -> new RuntimeException("Property not found"));

    RiskSummary risk = RiskSummary.builder()
            .property(property)
            .riskScore(request.getRiskScore())
            .overallRisk(request.getOverallRisk())
            .floodRisk(request.getFloodRisk())
            .legalRisk(request.getLegalRisk())
            .environmentalRisk(request.getEnvironmentalRisk())
            .remarks(request.getRemarks())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

    repository.save(risk);

    return mapToResponse(risk);
}

    @Override
    public RiskSummaryResponse getRiskSummary(Integer propertyId) {

        RiskSummary risk = repository.findByProperty_PropertyId(propertyId)
                .orElseThrow(() -> new RuntimeException("Risk Summary not found"));

        return mapToResponse(risk);
    }

    @Override
    public RiskSummaryResponse updateRiskSummary(Integer id, RiskSummaryRequest request) {

        RiskSummary risk = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk Summary not found"));

        risk.setRiskScore(request.getRiskScore());
        risk.setOverallRisk(request.getOverallRisk());
        risk.setFloodRisk(request.getFloodRisk());
        risk.setLegalRisk(request.getLegalRisk());
        risk.setEnvironmentalRisk(request.getEnvironmentalRisk());
        risk.setRemarks(request.getRemarks());
        risk.setUpdatedAt(LocalDateTime.now());

        repository.save(risk);

        return mapToResponse(risk);
    }

    @Override
    public void deleteRiskSummary(Integer id) {

        repository.deleteById(id);

    }

    private RiskSummaryResponse mapToResponse(RiskSummary risk) {

        return RiskSummaryResponse.builder()
                .id(risk.getId())
                .propertyId(risk.getProperty().getPropertyId())
                .riskScore(risk.getRiskScore())
                .overallRisk(risk.getOverallRisk())
                .floodRisk(risk.getFloodRisk())
                .legalRisk(risk.getLegalRisk())
                .environmentalRisk(risk.getEnvironmentalRisk())
                .remarks(risk.getRemarks())
                .build();

    }
}