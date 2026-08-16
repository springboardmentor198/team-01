package com.realestate.duediligence.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.DashboardStatsResponse;
import com.realestate.duediligence.dto.NotificationResponse;
import com.realestate.duediligence.dto.RecentSearchResponse;
import com.realestate.duediligence.dto.RiskDistributionResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.service.DashboardStatsService;
import com.realestate.duediligence.service.SearchHistoryService;
import com.realestate.duediligence.util.JwtService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardStatsService dashboardStatsService;

    private final SearchHistoryService searchHistoryService;

    private final JwtService jwtService;


    // =========================================================
    // DASHBOARD STATS
    // =========================================================

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(
            @RequestHeader(
                    value = "Authorization",
                    required = false
            ) String authHeader
    ) {

        if (
                authHeader == null ||
                !authHeader.startsWith("Bearer ")
        ) {
            return ResponseEntity.status(401).build();
        }


        try {

            String email =
                    jwtService.extractUsername(
                            authHeader.substring(7)
                    );


            return ResponseEntity.ok(
                    dashboardStatsService
                            .getDashboardStats(email)
            );

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(401)
                    .build();
        }
    }


    // =========================================================
    // RECENT SEARCHES
    // =========================================================

    @GetMapping("/recent-searches")
    public ResponseEntity<List<RecentSearchResponse>> recentSearches(
            @RequestHeader(
                    value = "Authorization",
                    required = false
            ) String authHeader
    ) {

        if (
                authHeader == null ||
                !authHeader.startsWith("Bearer ")
        ) {
            return ResponseEntity.ok(
                    List.of()
            );
        }


        try {

            String email =
                    jwtService.extractUsername(
                            authHeader.substring(7)
                    );


            return ResponseEntity.ok(
                    searchHistoryService
                            .getRecentSearches(
                                    email,
                                    10
                            )
            );

        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseEntity.ok(
                    List.of()
            );
        }
    }


    // =========================================================
    // RECENT PROPERTIES
    // =========================================================

    @GetMapping("/recent-properties")
    public ResponseEntity<List<Property>> recentProperties(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String email = getAuthenticatedEmail(authHeader);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(dashboardStatsService.getRecentProperties(email));
    }


    // =========================================================
    // RISK DISTRIBUTION
    // =========================================================

    @GetMapping("/risk-distribution")
    public ResponseEntity<RiskDistributionResponse>
    riskDistribution(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String email = getAuthenticatedEmail(authHeader);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(dashboardStatsService.getRiskDistribution(email));
    }


    // =========================================================
    // NOTIFICATIONS
    // =========================================================

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationResponse>>
    notifications() {

        return ResponseEntity.ok(
                dashboardStatsService
                        .getNotifications()
        );
    }

    private String getAuthenticatedEmail(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        try {
            return jwtService.extractUsername(authHeader.substring(7));
        } catch (Exception exception) {
            return null;
        }
    }
}
