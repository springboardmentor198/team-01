package com.realestate.duediligence.service.impl;

import com.realestate.duediligence.dto.DashboardStatsResponse;
import com.realestate.duediligence.dto.NotificationResponse;
import com.realestate.duediligence.dto.RecentSearchResponse;
import com.realestate.duediligence.dto.RiskDistributionResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.repository.ActivityLogRepository;
import com.realestate.duediligence.repository.DocumentRepository;
import com.realestate.duediligence.repository.PermitRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.RiskSummaryRepository;
import com.realestate.duediligence.repository.ReportRepository;
import com.realestate.duediligence.service.DashboardStatsService;
import com.realestate.duediligence.service.SearchHistoryService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardStatsServiceImpl
        implements DashboardStatsService {

    private final PropertyRepository propertyRepository;

    private final RiskSummaryRepository riskRepository;

    private final PermitRepository permitRepository;

    private final DocumentRepository documentRepository;

    private final ActivityLogRepository activityLogRepository;

    private final ReportRepository reportRepository;

    private final SearchHistoryService searchHistoryService;


    // =========================================================
    // DASHBOARD STATS
    // =========================================================

    @Override
    public DashboardStatsResponse getDashboardStats(
            String buyerEmail
    ) {

        /*
         * Count only UNIQUE properties viewed by this buyer.
         *
         * Example:
         *
         * Buyer views property 3
         * Buyer views property 3 again
         * Buyer views property 8
         *
         * Result = 2 viewed properties
         */

        List<Property> viewedProperties = getViewedProperties(buyerEmail);

        long reportsGenerated = reportRepository
                .countDistinctPropertiesByCreatedBy(buyerEmail);

        long highRiskProperties = viewedProperties.stream()
                .filter(property -> riskRepository
                        .findByProperty_PropertyId(property.getPropertyId())
                        .map(risk -> isHighRisk(risk.getOverallRisk()))
                        .orElse(false))
                .count();

        long pendingReviews = viewedProperties.stream()
                .filter(property -> "PENDING".equalsIgnoreCase(property.getStatus()))
                .count();


        return DashboardStatsResponse.builder()
                .viewedProperties(viewedProperties.size())
                .reportsGenerated(reportsGenerated)
                .highRiskProperties(highRiskProperties)
                .pendingReviews(pendingReviews)
                .build();
    }


    // =========================================================
    // RECENT SEARCHES
    // =========================================================

    @Override
    public List<RecentSearchResponse> getRecentSearches() {

        return searchHistoryService
                .getRecentSearches(10);
    }


    // =========================================================
    // RECENT PROPERTIES
    // =========================================================

    @Override
    public List<Property> getRecentProperties(String buyerEmail) {
        return getViewedProperties(buyerEmail).stream()
                .sorted(Comparator.comparing(
                        Property::getLastUpdated,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .limit(5)
                .toList();
    }


    // =========================================================
    // RISK DISTRIBUTION
    // =========================================================

    @Override
    public RiskDistributionResponse getRiskDistribution(String buyerEmail) {
        long low = 0;
        long medium = 0;
        long high = 0;
        long critical = 0;

        for (Property property : getViewedProperties(buyerEmail)) {
            String overallRisk = riskRepository
                    .findByProperty_PropertyId(property.getPropertyId())
                    .map(risk -> risk.getOverallRisk())
                    .orElse(null);

            if ("LOW".equalsIgnoreCase(overallRisk)) low++;
            else if ("MEDIUM".equalsIgnoreCase(overallRisk)) medium++;
            else if ("HIGH".equalsIgnoreCase(overallRisk)) high++;
            else if ("CRITICAL".equalsIgnoreCase(overallRisk)) critical++;
        }


        return RiskDistributionResponse.builder()
                .low(low)
                .medium(medium)
                .high(high)
                .critical(critical)
                .build();
    }

    private List<Property> getViewedProperties(String buyerEmail) {
        return activityLogRepository
                .findDistinctPropertiesByPerformedByAndActivityType(
                        buyerEmail,
                        "PROPERTY_VIEW"
                );
    }

    private boolean isHighRisk(String overallRisk) {
        return "HIGH".equalsIgnoreCase(overallRisk)
                || "CRITICAL".equalsIgnoreCase(overallRisk);
    }


    // =========================================================
    // NOTIFICATIONS
    // =========================================================

    @Override
    public List<NotificationResponse> getNotifications() {

        List<NotificationResponse> result =
                new ArrayList<>();


        LocalDate today = LocalDate.now();


        // -----------------------------------------------------
        // PERMIT EXPIRING
        // -----------------------------------------------------

        permitRepository
                .findByExpiryDateBetweenOrderByExpiryDateAsc(
                        today,
                        today.plusDays(30)
                )
                .forEach(p -> {

                    result.add(
                            NotificationResponse.builder()
                                    .type("PERMIT_EXPIRING")
                                    .title("Permit expiring soon")
                                    .message(
                                            p.getPermitType()
                                                    + " for "
                                                    + p.getProperty()
                                                    .getPropertyCode()
                                                    + " expires on "
                                                    + p.getExpiryDate()
                                    )
                                    .createdAt(
                                            p.getCreatedAt()
                                    )
                                    .build()
                    );

                });


        // -----------------------------------------------------
        // HIGH RISK
        // -----------------------------------------------------

        riskRepository
                .findAllByOrderByUpdatedAtDesc(
                        PageRequest.of(0, 10)
                )
                .stream()
                .filter(r ->
                        "HIGH".equalsIgnoreCase(
                                r.getOverallRisk()
                        )
                        ||
                        "CRITICAL".equalsIgnoreCase(
                                r.getOverallRisk()
                        )
                )
                .forEach(r -> {

                    result.add(
                            NotificationResponse.builder()
                                    .type("HIGH_RISK")
                                    .title(
                                            "High-risk property identified"
                                    )
                                    .message(
                                            r.getProperty()
                                                    .getPropertyCode()
                                                    + " is assessed as "
                                                    + r.getOverallRisk()
                                    )
                                    .createdAt(
                                            r.getUpdatedAt()
                                    )
                                    .build()
                    );

                });


        // -----------------------------------------------------
        // DOCUMENT UPLOADED
        // -----------------------------------------------------

        documentRepository
                .findAllByOrderByUploadedAtDesc(
                        PageRequest.of(0, 5)
                )
                .forEach(d -> {

                    result.add(
                            NotificationResponse.builder()
                                    .type("DOCUMENT_UPLOADED")
                                    .title("Document uploaded")
                                    .message(
                                            d.getDocumentName()
                                                    + " was added to "
                                                    + d.getProperty()
                                                    .getPropertyCode()
                                    )
                                    .createdAt(
                                            d.getUploadedAt()
                                    )
                                    .build()
                    );

                });


        // -----------------------------------------------------
        // SORT NOTIFICATIONS
        // -----------------------------------------------------

        result.sort(
                Comparator.comparing(
                        NotificationResponse::getCreatedAt,
                        Comparator.nullsLast(
                                Comparator.reverseOrder()
                        )
                )
        );


        return result
                .stream()
                .limit(10)
                .toList();
    }
}
