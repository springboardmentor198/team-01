package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.DashboardStatsResponse;
import com.realestate.duediligence.dto.NotificationResponse;
import com.realestate.duediligence.dto.RecentSearchResponse;
import com.realestate.duediligence.dto.RiskDistributionResponse;
import com.realestate.duediligence.entity.Property;

import java.util.List;

public interface DashboardStatsService {

    DashboardStatsResponse getDashboardStats(
            String buyerEmail
    );

    List<Property> getRecentProperties(String buyerEmail);

    RiskDistributionResponse getRiskDistribution(String buyerEmail);

    List<NotificationResponse> getNotifications();

    List<RecentSearchResponse> getRecentSearches();
}
