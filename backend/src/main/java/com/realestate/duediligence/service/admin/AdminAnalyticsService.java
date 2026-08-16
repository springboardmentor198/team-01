package com.realestate.duediligence.service.admin;

import java.util.List;

import com.realestate.duediligence.dto.admin.PlatformActivityResponse;

public interface AdminAnalyticsService {
    List<PlatformActivityResponse> getUserGrowth(String adminEmail, String period);
    List<PlatformActivityResponse> getPropertyGrowth(String adminEmail, String period);
    List<PlatformActivityResponse> getTransactions(String adminEmail, String period);
    List<PlatformActivityResponse> getPropertyViews(String adminEmail, String period);
    List<PlatformActivityResponse> getDownloads(String adminEmail, String period);
    List<PlatformActivityResponse> getActiveUsers(String adminEmail, String period);
}
