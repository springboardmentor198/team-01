package com.realestate.duediligence.controller.admin;

import java.time.LocalDateTime;

import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.service.admin.AdminSecurityService;
import com.realestate.duediligence.util.JwtService;

@RestController
@RequestMapping("/api/admin/security")
@CrossOrigin(origins = "*")
public class AdminSecurityController {

    private final AdminSecurityService adminSecurityService;
    private final JwtService jwtService;

    public AdminSecurityController(AdminSecurityService adminSecurityService, JwtService jwtService) {
        this.adminSecurityService = adminSecurityService;
        this.jwtService = jwtService;
    }

    @GetMapping("/events")
    public ResponseEntity<?> getEvents(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminSecurityService.getEvents(email, eventType, status, userId, startDate, endDate, pageable));
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@RequestHeader("Authorization") String authHeader) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminSecurityService.getSummary(email));
    }
}
