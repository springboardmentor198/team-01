package com.realestate.duediligence.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.NotificationDto;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.NotificationPriority;
import com.realestate.duediligence.enums.NotificationStatus;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.NotificationService;
import com.realestate.duediligence.util.JwtService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<Page<NotificationDto>> getNotifications(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String filter) {

        User user = requireUser(authHeader);
        NotificationStatus status = "unread".equalsIgnoreCase(filter)
                ? NotificationStatus.UNREAD
                : null;
        NotificationPriority priority = "critical".equalsIgnoreCase(filter)
                ? NotificationPriority.CRITICAL
                : null;

        return ResponseEntity.ok(notificationService.getNotifications(
                user.getUserId(),
                status,
                priority,
                PageRequest.of(page, size)));
    }

    @GetMapping("/unread")
    public ResponseEntity<Page<NotificationDto>> getUnreadNotifications(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        User user = requireUser(authHeader);
        return ResponseEntity.ok(notificationService.getNotifications(
                user.getUserId(),
                NotificationStatus.UNREAD,
                null,
                PageRequest.of(page, size)));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getUnreadCount(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = requireUser(authHeader);
        return ResponseEntity.ok(notificationService.countUnread(user.getUserId()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markAsRead(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {
        User user = requireUser(authHeader);
        return ResponseEntity.ok(notificationService.markAsRead(id, user.getUserId()));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = requireUser(authHeader);
        notificationService.markAllAsRead(user.getUserId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {
        User user = requireUser(authHeader);
        notificationService.deleteNotification(id, user.getUserId());
        return ResponseEntity.noContent().build();
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
