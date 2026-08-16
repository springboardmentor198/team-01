package com.realestate.duediligence.service.admin;

import java.util.List;

import com.realestate.duediligence.dto.admin.AdminDashboardOverviewResponse;
import com.realestate.duediligence.dto.admin.PlatformActivityResponse;
import com.realestate.duediligence.dto.admin.PropertyStatusResponse;
import com.realestate.duediligence.dto.admin.UserDistributionResponse;

public interface AdminDashboardService {
    AdminDashboardOverviewResponse getOverview(String adminEmail);
    List<PlatformActivityResponse> getActivity(String adminEmail, String period, String metric);
    UserDistributionResponse getUserDistribution(String adminEmail);
    PropertyStatusResponse getPropertyStatus(String adminEmail);
    List<com.realestate.duediligence.dto.ActivityLogResponse> getRecentActivity(String adminEmail);
}
