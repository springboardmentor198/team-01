package com.realestate.duediligence.controller.admin;

import java.time.LocalDateTime;

import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.service.admin.AdminPropertyService;
import com.realestate.duediligence.util.JwtService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin/properties")
@CrossOrigin(origins = "*")
public class AdminPropertyController {

    private final AdminPropertyService adminPropertyService;
    private final JwtService jwtService;

    public AdminPropertyController(AdminPropertyService adminPropertyService, JwtService jwtService) {
        this.adminPropertyService = adminPropertyService;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<?> getProperties(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String propertyType,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String ownerName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminPropertyService.getProperties(email, status, propertyType, city, ownerName, startDate, endDate, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPropertyById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminPropertyService.getPropertyById(email, id));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approveProperty(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id,
            HttpServletRequest request) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(adminPropertyService.approveProperty(email, id, ipAddress));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectProperty(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id,
            HttpServletRequest request) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(adminPropertyService.rejectProperty(email, id, ipAddress));
    }

    @PatchMapping("/{id}/review")
    public ResponseEntity<?> reviewProperty(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id,
            HttpServletRequest request) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(adminPropertyService.reviewProperty(email, id, ipAddress));
    }
}
