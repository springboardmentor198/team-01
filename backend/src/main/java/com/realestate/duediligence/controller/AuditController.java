package com.realestate.duediligence.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.ActivityLogResponse;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.ActivityLogService;
import com.realestate.duediligence.util.JwtService;

import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuditController {

    private final ActivityLogService activityLogService;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<List<ActivityLogResponse>> getAuditLogs(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        User user = requireUser(authHeader);
        if (user.getRole() != com.realestate.duediligence.enums.Role.ADMIN) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Access denied: only administrators can access system audit logs");
        }
        return ResponseEntity.ok(activityLogService.getAllActivityLogs());
    }

    private User requireUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Missing or invalid Authorization header");
        }

        try {
            String email = jwtService.extractUsername(authHeader.substring(7));
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                            HttpStatus.UNAUTHORIZED,
                            "User not found"));
        } catch (Exception exception) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Token verification failed");
        }
    }
}
