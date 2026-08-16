package com.realestate.duediligence.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.AdminDashboardService;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {
    private final AdminDashboardService adminDashboardService;
    private final UserRepository userRepository;

    public AdminDashboardController(AdminDashboardService adminDashboardService, UserRepository userRepository) {
        this.adminDashboardService = adminDashboardService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public Map<String, Object> getDashboard(Authentication authentication) {
        if (authentication == null || userRepository.findByEmail(authentication.getName())
                .map(user -> user.getRole() == Role.ADMIN).orElse(false) == false) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access is required");
        }
        return adminDashboardService.getDashboard();
    }

    @GetMapping("/workspace/{pageKey}")
    public Map<String, Object> getWorkspace(Authentication authentication, @PathVariable String pageKey) {
        requireAdmin(authentication);
        return adminDashboardService.getWorkspace(pageKey);
    }

    private void requireAdmin(Authentication authentication) {
        if (authentication == null || userRepository.findByEmail(authentication.getName())
                .map(user -> user.getRole() == Role.ADMIN).orElse(false) == false) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access is required");
        }
    }
}
