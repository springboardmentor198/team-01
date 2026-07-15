package com.realestate.property_search_api.service;

import com.realestate.property_search_api.dto.DashboardSummaryResponse;
import com.realestate.property_search_api.entity.Notification;
import com.realestate.property_search_api.entity.Property;
import com.realestate.property_search_api.entity.RiskAssessment;
import com.realestate.property_search_api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private RiskAssessmentRepository riskAssessmentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public DashboardSummaryResponse getDashboardSummary() {
        // 1. Compute stats
        long totalProperties = propertyRepository.count();
        long totalReports = reportRepository.count();
        long highRiskCount = riskAssessmentRepository.countByRiskLevelIn(List.of("HIGH", "CRITICAL"));
        long pendingReviews = propertyRepository.countByStatus("UNDER_REVIEW");

        // 2. Fetch recent properties for "Recent Searches" section
        List<Property> recentProperties = propertyRepository.findFirst3ByOrderByCreatedAtDesc();
        List<DashboardSummaryResponse.RecentSearchDTO> recentSearchDTOs = recentProperties.stream().map(property -> {
            // Find risk level for the property
            List<RiskAssessment> assessments = riskAssessmentRepository.findByPropertyId(property.getPropertyId());
            String risk = "Low";
            if (!assessments.isEmpty()) {
                String dbRisk = assessments.get(0).getRiskLevel();
                if ("MEDIUM".equalsIgnoreCase(dbRisk)) risk = "Medium";
                else if ("HIGH".equalsIgnoreCase(dbRisk)) risk = "High";
                else if ("CRITICAL".equalsIgnoreCase(dbRisk)) risk = "Critical";
            }

            // Map status
            String uiStatus = "Pending";
            if ("AVAILABLE".equalsIgnoreCase(property.getStatus())) {
                uiStatus = "Completed";
            } else if ("UNDER_REVIEW".equalsIgnoreCase(property.getStatus())) {
                uiStatus = "Reviewing";
            } else if ("SOLD".equalsIgnoreCase(property.getStatus())) {
                uiStatus = "Completed";
            }

            return new DashboardSummaryResponse.RecentSearchDTO(
                    property.getPropertyTitle(),
                    property.getPropertyType(),
                    risk,
                    uiStatus
            );
        }).collect(Collectors.toList());

        // 3. Compute risk breakdown counts
        long lowCount = riskAssessmentRepository.countByRiskLevel("LOW");
        long mediumCount = riskAssessmentRepository.countByRiskLevel("MEDIUM");
        long highCount = riskAssessmentRepository.countByRiskLevel("HIGH");
        long criticalCount = riskAssessmentRepository.countByRiskLevel("CRITICAL");

        List<DashboardSummaryResponse.RiskBreakdownDTO> riskBreakdown = List.of(
                new DashboardSummaryResponse.RiskBreakdownDTO("Low Risk", lowCount, "#22C55E"),
                new DashboardSummaryResponse.RiskBreakdownDTO("Medium Risk", mediumCount, "#F59E0B"),
                new DashboardSummaryResponse.RiskBreakdownDTO("High Risk", highCount, "#EF4444"),
                new DashboardSummaryResponse.RiskBreakdownDTO("Critical", criticalCount, "#991B1B")
        );

        // 4. Fetch notifications
        List<Notification> recentNotifications = notificationRepository.findFirst5ByOrderByCreatedAtDesc();
        List<DashboardSummaryResponse.NotificationDTO> notificationDTOs = recentNotifications.stream().map(notification -> {
            // If the notification has simple text, split or use it
            String message = notification.getMessage();
            String title = "Notification Alert";
            String subtitle = message;

            if (message.contains(":")) {
                String[] parts = message.split(":", 2);
                title = parts[0].trim();
                subtitle = parts[1].trim();
            } else if (message.contains(" - ")) {
                String[] parts = message.split(" - ", 2);
                title = parts[0].trim();
                subtitle = parts[1].trim();
            }
            
            return new DashboardSummaryResponse.NotificationDTO(title, subtitle);
        }).collect(Collectors.toList());

        return new DashboardSummaryResponse(
                totalProperties,
                totalReports,
                highRiskCount,
                pendingReviews,
                recentSearchDTOs,
                riskBreakdown,
                notificationDTOs
        );
    }
}
