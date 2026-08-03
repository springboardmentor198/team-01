package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.*;
import com.realestate.duediligence.entity.Property;
import java.util.List;

public interface DashboardStatsService {

    DashboardStatsResponse getDashboardStats();
    List<Property> getRecentProperties();
    RiskDistributionResponse getRiskDistribution();
    List<NotificationResponse> getNotifications();
    List<RecentSearchResponse> getRecentSearches();
}
