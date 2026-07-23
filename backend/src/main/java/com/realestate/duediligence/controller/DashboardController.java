package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.*;
import com.realestate.duediligence.entity.Property;
import java.util.List;
import com.realestate.duediligence.service.DashboardStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardStatsService dashboardStatsService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(dashboardStatsService.getDashboardStats());
    }
    @GetMapping("/recent-properties") public ResponseEntity<List<Property>> recentProperties(){ return ResponseEntity.ok(dashboardStatsService.getRecentProperties()); }
    @GetMapping("/risk-distribution") public ResponseEntity<RiskDistributionResponse> riskDistribution(){ return ResponseEntity.ok(dashboardStatsService.getRiskDistribution()); }
    @GetMapping("/notifications") public ResponseEntity<List<NotificationResponse>> notifications(){ return ResponseEntity.ok(dashboardStatsService.getNotifications()); }
}
