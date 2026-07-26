package com.realestate.duediligence.controller;

import java.util.List;

import com.realestate.duediligence.dto.AdminRoleRequestResponse;
import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.service.AdminRoleService;
import com.realestate.duediligence.util.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/role-requests")
@CrossOrigin(origins = "*")
public class AdminRoleController {

    private final AdminRoleService adminRoleService;
    private final JwtService jwtService;

    public AdminRoleController(AdminRoleService adminRoleService, JwtService jwtService) {
        this.adminRoleService = adminRoleService;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<?> getRoleRequests(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false) AccountStatus status,
            @RequestParam(required = false) Role requestedRole) {

        String adminEmail = extractAdminEmail(authHeader);
        List<AdminRoleRequestResponse> requests =
                adminRoleService.getRoleRequests(adminEmail, status, requestedRole);

        return ResponseEntity.ok(requests);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRoleRequestById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Integer id) {

        String adminEmail = extractAdminEmail(authHeader);
        return ResponseEntity.ok(adminRoleService.getRoleRequestById(adminEmail, id));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveRoleRequest(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Integer id) {

        String adminEmail = extractAdminEmail(authHeader);
        return ResponseEntity.ok(adminRoleService.approveRoleRequest(adminEmail, id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectRoleRequest(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Integer id) {

        String adminEmail = extractAdminEmail(authHeader);
        return ResponseEntity.ok(adminRoleService.rejectRoleRequest(adminEmail, id));
    }

    private String extractAdminEmail(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Missing or invalid Authorization header"
            );
        }

        try {
            return jwtService.extractUsername(authHeader.substring(7));
        } catch (Exception exception) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Token verification failed"
            );
        }
    }
}
