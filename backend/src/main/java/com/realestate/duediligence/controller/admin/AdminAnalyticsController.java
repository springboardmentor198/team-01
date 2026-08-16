package com.realestate.duediligence.controller.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.service.admin.AdminAnalyticsService;
import com.realestate.duediligence.util.JwtService;

@RestController
@RequestMapping("/api/admin/analytics")
@CrossOrigin(origins = "*")
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;
    private final JwtService jwtService;

    public AdminAnalyticsController(AdminAnalyticsService adminAnalyticsService, JwtService jwtService) {
        this.adminAnalyticsService = adminAnalyticsService;
        this.jwtService = jwtService;
    }

    @GetMapping("/user-growth")
    public ResponseEntity<?> getUserGrowth(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "30D") String period) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminAnalyticsService.getUserGrowth(email, period));
    }

    @GetMapping("/property-growth")
    public ResponseEntity<?> getPropertyGrowth(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "30D") String period) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminAnalyticsService.getPropertyGrowth(email, period));
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "30D") String period) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminAnalyticsService.getTransactions(email, period));
    }

    @GetMapping("/property-views")
    public ResponseEntity<?> getPropertyViews(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "30D") String period) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminAnalyticsService.getPropertyViews(email, period));
    }

    @GetMapping("/downloads")
    public ResponseEntity<?> getDownloads(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "30D") String period) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminAnalyticsService.getDownloads(email, period));
    }

    @GetMapping("/active-users")
    public ResponseEntity<?> getActiveUsers(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "30D") String period) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminAnalyticsService.getActiveUsers(email, period));
    }
}
