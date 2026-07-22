package com.realestate.duediligence.controller;

import com.realestate.duediligence.entity.DashboardStats;
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
    public ResponseEntity<DashboardStats> getDashboardStats() {

        DashboardStats stats = dashboardStatsService.getDashboardStats();

        if (stats == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(stats);
    }
}