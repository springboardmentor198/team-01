package com.realestate.property_search_api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {

    private long totalProperties;
    private long reportsGenerated;
    private long highRiskProperties;
    private long pendingReviews;
    private List<RecentSearchDTO> recentSearches;
    private List<RiskBreakdownDTO> riskBreakdown;
    private List<NotificationDTO> notifications;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentSearchDTO {
        private String property;
        private String type;
        private String risk;
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiskBreakdownDTO {
        private String label;
        private long count;
        private String color;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationDTO {
        private String title;
        private String subtitle;
    }
}
