package com.realestate.duediligence.controller.admin;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.service.admin.AdminVerificationService;
import com.realestate.duediligence.util.JwtService;

@RestController
@RequestMapping("/api/admin/verifications")
@CrossOrigin(origins = "*")
public class AdminVerificationController {

    private final AdminVerificationService adminVerificationService;
    private final JwtService jwtService;

    public AdminVerificationController(AdminVerificationService adminVerificationService, JwtService jwtService) {
        this.adminVerificationService = adminVerificationService;
        this.jwtService = jwtService;
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@RequestHeader("Authorization") String authHeader) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminVerificationService.getSummary(email));
    }

    @GetMapping
    public ResponseEntity<?> getVerifications(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer verifierId,
            @RequestParam(required = false) Integer propertyId,
            Pageable pageable) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminVerificationService.getVerifications(email, status, type, verifierId, propertyId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVerificationById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminVerificationService.getVerificationById(email, id));
    }
}
