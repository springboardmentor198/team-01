package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.RoleRequestRequest;
import com.realestate.duediligence.dto.RoleRequestResponse;
import com.realestate.duediligence.service.RoleRequestService;
import com.realestate.duediligence.util.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/role-request")
@CrossOrigin(origins = "*")
public class RoleRequestController {

    private final RoleRequestService roleRequestService;
    private final JwtService jwtService;

    public RoleRequestController(RoleRequestService roleRequestService, JwtService jwtService) {
        this.roleRequestService = roleRequestService;
        this.jwtService = jwtService;
    }

    @PostMapping
    public ResponseEntity<?> createRoleRequest(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody RoleRequestRequest request) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid Authorization header");
        }

        try {
            String email = jwtService.extractUsername(authHeader.substring(7));
            RoleRequestResponse response = roleRequestService.createRoleRequest(email, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Token verification failed: " + exception.getMessage());
        }
    }
}
