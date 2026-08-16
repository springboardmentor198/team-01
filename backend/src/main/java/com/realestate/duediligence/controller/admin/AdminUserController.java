package com.realestate.duediligence.controller.admin;

import java.time.LocalDateTime;

import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.service.admin.AdminUserService;
import com.realestate.duediligence.util.JwtService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*")
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final JwtService jwtService;

    public AdminUserController(AdminUserService adminUserService, JwtService jwtService) {
        this.adminUserService = adminUserService;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<?> getUsers(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) AccountStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminUserService.getUsers(email, role, status, search, startDate, endDate, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminUserService.getUserById(email, id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id,
            @RequestBody java.util.Map<String, String> body,
            HttpServletRequest request) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        AccountStatus status = AccountStatus.valueOf(body.get("status"));
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(adminUserService.updateUserStatus(email, id, status, ipAddress));
    }
}
