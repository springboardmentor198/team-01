package com.realestate.duediligence.controller.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.service.admin.AdminDashboardService;
import com.realestate.duediligence.util.JwtService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;
    private final JwtService jwtService;

    public AdminDashboardController(AdminDashboardService adminDashboardService, JwtService jwtService) {
        this.adminDashboardService = adminDashboardService;
        this.jwtService = jwtService;
    }

    @GetMapping("/dashboard/overview")
    public ResponseEntity<?> getOverview(@RequestHeader("Authorization") String authHeader) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminDashboardService.getOverview(email));
    }

    @GetMapping("/dashboard/activity")
    public ResponseEntity<?> getActivity(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "30D") String period,
            @RequestParam String metric) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminDashboardService.getActivity(email, period, metric));
    }

    @GetMapping("/dashboard/user-distribution")
    public ResponseEntity<?> getUserDistribution(@RequestHeader("Authorization") String authHeader) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminDashboardService.getUserDistribution(email));
    }

    @GetMapping("/dashboard/property-status")
    public ResponseEntity<?> getPropertyStatus(@RequestHeader("Authorization") String authHeader) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminDashboardService.getPropertyStatus(email));
    }

    @GetMapping("/activity/recent")
    public ResponseEntity<?> getRecentActivity(@RequestHeader("Authorization") String authHeader) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminDashboardService.getRecentActivity(email));
    }
}
