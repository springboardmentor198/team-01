package com.realestate.duediligence.service;

import java.time.LocalDateTime;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.RiskSummaryRequest;
import com.realestate.duediligence.dto.RiskSummaryResponse;
import com.realestate.duediligence.entity.ActivityLog;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.RiskSummary;
import com.realestate.duediligence.event.NotificationEvents;
import com.realestate.duediligence.exception.ResourceNotFoundException;
import com.realestate.duediligence.repository.ActivityLogRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.RiskSummaryRepository;

@Service
public class RiskSummaryServiceImpl implements RiskSummaryService {

    private final RiskSummaryRepository repository;
    private final PropertyRepository propertyRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ApplicationEventPublisher eventPublisher;

    public RiskSummaryServiceImpl(
            RiskSummaryRepository repository,
            PropertyRepository propertyRepository,
            ActivityLogRepository activityLogRepository,
            ApplicationEventPublisher eventPublisher) {

        this.repository = repository;
        this.propertyRepository = propertyRepository;
        this.activityLogRepository = activityLogRepository;
        this.eventPublisher = eventPublisher;
    }

    @Override
  
public RiskSummaryResponse createRiskSummary(RiskSummaryRequest request) {

    Property property = propertyRepository.findById(request.getPropertyId())
            .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

    RiskSummary risk = RiskSummary.builder()
            .property(property)

            // Overall Assessment
            .riskScore(request.getRiskScore())
            .overallRisk(request.getOverallRisk())

            // Risk Breakdown
            .floodRisk(request.getFloodRisk())
            .legalRisk(request.getLegalRisk())
            .environmentalRisk(request.getEnvironmentalRisk())
            .financialRisk(request.getFinancialRisk())
            .marketRisk(request.getMarketRisk())
            .ownershipRisk(request.getOwnershipRisk())

            // Review
            .reviewedBy(request.getReviewedBy())
            .reviewedAt(request.getReviewedAt())

            // Compliance
            .complianceStatus(request.getComplianceStatus())

            // Details
            .criticalIssues(request.getCriticalIssues())
            .recommendation(request.getRecommendation())
            .missingDocuments(request.getMissingDocuments())
            .riskTrend(request.getRiskTrend())
            .remarks(request.getRemarks())

            // Audit
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

    repository.save(risk);

    activityLogRepository.save(
            ActivityLog.builder()
                    .property(property)
                    .activityType("RISK_SUMMARY_CREATED")
                    .description("Risk assessment created.")
                    .performedBy(
                            request.getReviewedBy() != null
                                    ? request.getReviewedBy()
                                    : "System")
                    .createdAt(LocalDateTime.now())
                    .build());

    eventPublisher.publishEvent(
            new NotificationEvents.RiskSummaryUpdatedEvent(
                    property.getPropertyId(),
                    property.getPropertyCode(),
                    null,
                    risk.getOverallRisk(),
                    null));

    return mapToResponse(risk);
}
@Override
public RiskSummaryResponse getRiskSummary(Integer propertyId) {

    return repository.findByProperty_PropertyId(propertyId)
            .map(this::mapToResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Risk Summary not found"));
}
    @Override
public RiskSummaryResponse updateRiskSummary(Integer id, RiskSummaryRequest request) {

    RiskSummary risk = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Risk Summary not found"));

    String previousRisk = risk.getOverallRisk();

    // Overall
    risk.setRiskScore(request.getRiskScore());
    risk.setOverallRisk(request.getOverallRisk());

    // Risk Breakdown
    risk.setFloodRisk(request.getFloodRisk());
    risk.setLegalRisk(request.getLegalRisk());
    risk.setEnvironmentalRisk(request.getEnvironmentalRisk());
    risk.setFinancialRisk(request.getFinancialRisk());
    risk.setMarketRisk(request.getMarketRisk());
    risk.setOwnershipRisk(request.getOwnershipRisk());

    // Review
    risk.setReviewedBy(request.getReviewedBy());
    risk.setReviewedAt(request.getReviewedAt());

    // Compliance
    risk.setComplianceStatus(request.getComplianceStatus());

    // Details
    risk.setCriticalIssues(request.getCriticalIssues());
    risk.setRecommendation(request.getRecommendation());
    risk.setMissingDocuments(request.getMissingDocuments());
    risk.setRiskTrend(request.getRiskTrend());
    risk.setRemarks(request.getRemarks());

    // Audit
    risk.setUpdatedAt(LocalDateTime.now());

    repository.save(risk);

    activityLogRepository.save(
            ActivityLog.builder()
                    .property(risk.getProperty())
                    .activityType("RISK_SUMMARY_UPDATED")
                    .description("Risk assessment updated.")
                    .performedBy(
                            request.getReviewedBy() != null
                                    ? request.getReviewedBy()
                                    : "System")
                    .createdAt(LocalDateTime.now())
                    .build());

    eventPublisher.publishEvent(
            new NotificationEvents.RiskSummaryUpdatedEvent(
                    risk.getProperty().getPropertyId(),
                    risk.getProperty().getPropertyCode(),
                    previousRisk,
                    risk.getOverallRisk(),
                    null));

    return mapToResponse(risk);
}
    @Override
    public void deleteRiskSummary(Integer id) {

        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Risk Summary not found");
        }
        repository.deleteById(id);
    }

    private RiskSummaryResponse mapToResponse(RiskSummary risk) {

        return RiskSummaryResponse.builder()

                .id(risk.getId())
                .propertyId(risk.getProperty().getPropertyId())

                // Overall
                .riskScore(risk.getRiskScore())
                .overallRisk(risk.getOverallRisk())

                // Risk Breakdown
                .floodRisk(risk.getFloodRisk())
                .legalRisk(risk.getLegalRisk())
                .environmentalRisk(risk.getEnvironmentalRisk())
                .financialRisk(risk.getFinancialRisk())
                .marketRisk(risk.getMarketRisk())
                .ownershipRisk(risk.getOwnershipRisk())

                // Review
                .reviewedBy(risk.getReviewedBy())
                .reviewedAt(risk.getReviewedAt())

                // Compliance
                .complianceStatus(risk.getComplianceStatus())

                // Details
                .criticalIssues(risk.getCriticalIssues())
                .recommendation(risk.getRecommendation())
                .missingDocuments(risk.getMissingDocuments())
                .riskTrend(risk.getRiskTrend())
                .remarks(risk.getRemarks())

                // Audit
                .createdAt(risk.getCreatedAt())
                .updatedAt(risk.getUpdatedAt())

                .build();
    }
}
