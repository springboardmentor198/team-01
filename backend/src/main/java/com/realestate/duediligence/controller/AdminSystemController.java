package com.realestate.duediligence.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.service.AdminSystemService;

@RestController
@RequestMapping("/api/admin/system")
public class AdminSystemController {

    private final AdminSystemService adminSystemService;

    public AdminSystemController(AdminSystemService adminSystemService) {
        this.adminSystemService = adminSystemService;
    }

    @GetMapping("/health")
    public Map<String, Object> getHealth() {
        return adminSystemService.getHealth();
    }

    @GetMapping("/metrics")
    public Map<String, Object> getMetrics() {
        return adminSystemService.getMetrics();
    }
@GetMapping("/api-performance")
public Map<String, Object> getApiPerformance() {
    return adminSystemService.getApiPerformance();

}
@GetMapping("/logs")
public List<String> getLogs() {
    return adminSystemService.getLogs();
}
@GetMapping("/cache")
public Map<String, Object> getCacheMetrics() {
    return adminSystemService.getCacheMetrics();
}
}