package com.realestate.duediligence.controller;

import com.realestate.duediligence.exception.ResourceNotFoundException;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.UserProfileRequest;
import com.realestate.duediligence.dto.UserProfileResponse;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.repository.ActivityLogRepository;
import com.realestate.duediligence.repository.PropertyFollowRepository;
import com.realestate.duediligence.repository.ReportRepository;
import com.realestate.duediligence.enums.FollowReason;
import com.realestate.duediligence.util.JwtService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    private final JwtService jwtService;
    private final ActivityLogRepository activityLogRepository;
    private final PropertyFollowRepository propertyFollowRepository;
    private final ReportRepository reportRepository;

    public UserController(UserRepository userRepository, JwtService jwtService,
            ActivityLogRepository activityLogRepository, PropertyFollowRepository propertyFollowRepository,
            ReportRepository reportRepository) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.activityLogRepository = activityLogRepository;
        this.propertyFollowRepository = propertyFollowRepository;
        this.reportRepository = reportRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }

        try {
            String token = authHeader.substring(7);
            String email = jwtService.extractUsername(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

            return ResponseEntity.ok(toProfileResponse(user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token verification failed: " + e.getMessage());
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody UserProfileRequest request) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }

        try {
            String token = authHeader.substring(7);
            String email = jwtService.extractUsername(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

            if (request.getName() != null) {
                user.setName(request.getName());
            }
            if (request.getPhoneNumber() != null) {
                user.setPhoneNumber(request.getPhoneNumber());
            }
            if (request.getBio() != null) {
                user.setBio(request.getBio());
            }
            if (request.getAvatarUrl() != null) {
                user.setAvatarUrl(request.getAvatarUrl());
            }
            if (request.getLocation() != null) {
                user.setLocation(request.getLocation());
            }
            user.setUpdatedAt(LocalDateTime.now());

            User updatedUser = userRepository.save(user);

            return ResponseEntity.ok(toProfileResponse(updatedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Update profile failed: " + e.getMessage());
        }
    }

    @GetMapping("/profile/dashboard")
    public ResponseEntity<?> getProfileDashboard(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            String email = jwtService.extractUsername(authHeader.substring(7));
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
            long savedProperties = propertyFollowRepository.findByUser_UserId(user.getUserId()).stream()
                    .filter(follow -> follow.getFollowReason() == FollowReason.SAVED).count();
            int completedFields = 0;
            if (hasText(user.getName())) completedFields++;
            if (hasText(user.getEmail())) completedFields++;
            if (hasText(user.getPhoneNumber())) completedFields++;
            if (hasText(user.getBio())) completedFields++;
            if (hasText(user.getLocation())) completedFields++;
            if (hasText(user.getAvatarUrl())) completedFields++;
            int completionPercentage = (int) Math.round((completedFields * 100.0) / 6);
            return ResponseEntity.ok(java.util.Map.of(
                    "completionPercentage", completionPercentage,
                    "viewedProperties", activityLogRepository.countDistinctViewedProperties(email, "PROPERTY_VIEW"),
                    "savedProperties", savedProperties,
                    "reportsGenerated", reportRepository.countDistinctPropertiesByCreatedBy(email),
                    "documentsUploaded", activityLogRepository.countByPerformedByAndActivityType(email, "DOCUMENT_UPLOADED"),
                    "activity", activityLogRepository.findByPerformedByOrderByCreatedAtDesc(email).stream().limit(50)
                            .map(this::toActivityResponse).toList()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unable to load profile dashboard: " + e.getMessage());
        }
    }

    private boolean hasText(String value) { return value != null && !value.trim().isEmpty(); }

    private com.realestate.duediligence.dto.ActivityLogResponse toActivityResponse(com.realestate.duediligence.entity.ActivityLog log) {
        return com.realestate.duediligence.dto.ActivityLogResponse.builder()
                .id(log.getActivityId()).activityType(log.getActivityType()).description(log.getDescription())
                .performedBy(log.getPerformedBy()).createdAt(log.getCreatedAt())
                .propertyId(log.getProperty() != null ? log.getProperty().getPropertyId() : null)
                .propertyCode(log.getProperty() != null ? log.getProperty().getPropertyCode() : null).build();
    }

    private UserProfileResponse toProfileResponse(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setUserId(user.getUserId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setBio(user.getBio());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setRole(user.getRole());
        response.setStatus(user.getStatus());
        response.setProfileCompleted(user.getProfileCompleted());
        response.setLocation(user.getLocation());
        response.setJoinDate(user.getCreatedAt());
        return response;
    }
}
