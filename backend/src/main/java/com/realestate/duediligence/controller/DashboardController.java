package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.*;
import com.realestate.duediligence.entity.Property;
import java.util.List;
import com.realestate.duediligence.service.DashboardStatsService;
import com.realestate.duediligence.service.SearchHistoryService;
import com.realestate.duediligence.util.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardStatsService dashboardStatsService;
    private final SearchHistoryService searchHistoryService;
    private final JwtService jwtService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(dashboardStatsService.getDashboardStats());
    }

    @GetMapping("/recent-searches")
    public ResponseEntity<List<RecentSearchResponse>> recentSearches(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.ok(List.of());
        }

        try {
            String email = jwtService.extractUsername(authHeader.substring(7));
            return ResponseEntity.ok(searchHistoryService.getRecentSearches(email, 10));
        } catch (Exception exception) {
            return ResponseEntity.ok(List.of());
        }
    }
    @GetMapping("/recent-properties") public ResponseEntity<List<Property>> recentProperties(){ return ResponseEntity.ok(dashboardStatsService.getRecentProperties()); }
    @GetMapping("/risk-distribution") public ResponseEntity<RiskDistributionResponse> riskDistribution(){ return ResponseEntity.ok(dashboardStatsService.getRiskDistribution()); }
    @GetMapping("/notifications") public ResponseEntity<List<NotificationResponse>> notifications(){ return ResponseEntity.ok(dashboardStatsService.getNotifications()); }
}
