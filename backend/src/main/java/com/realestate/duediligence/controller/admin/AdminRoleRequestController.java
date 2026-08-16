package com.realestate.duediligence.controller.admin;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.service.admin.AdminRoleRequestService;
import com.realestate.duediligence.util.JwtService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin/role-requests")
@CrossOrigin(origins = "*")
public class AdminRoleRequestController {

    private final AdminRoleRequestService adminRoleRequestService;
    private final JwtService jwtService;

    public AdminRoleRequestController(AdminRoleRequestService adminRoleRequestService, JwtService jwtService) {
        this.adminRoleRequestService = adminRoleRequestService;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<?> getRoleRequests(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) AccountStatus status,
            @RequestParam(required = false) Role requestedRole,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        try {
            String email = jwtService.extractUsername(authHeader.substring(7));
            return ResponseEntity.ok(adminRoleRequestService.getRoleRequests(email, status, requestedRole, search, pageable));
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRoleRequestById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminRoleRequestService.getRoleRequestById(email, id));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approveRoleRequestPatch(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id,
            HttpServletRequest request) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(adminRoleRequestService.approveRoleRequest(email, id, ipAddress));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveRoleRequestPut(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id,
            HttpServletRequest request) {
        return approveRoleRequestPatch(authHeader, id, request);
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectRoleRequestPatch(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id,
            @RequestBody(required = false) java.util.Map<String, String> body,
            HttpServletRequest request) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        String remarks = body != null ? body.get("remarks") : "";
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(adminRoleRequestService.rejectRoleRequest(email, id, remarks, ipAddress));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectRoleRequestPut(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id,
            @RequestBody(required = false) java.util.Map<String, String> body,
            HttpServletRequest request) {
        return rejectRoleRequestPatch(authHeader, id, body, request);
    }
}
