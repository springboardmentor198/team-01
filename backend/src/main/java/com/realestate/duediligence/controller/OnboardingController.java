package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.ProfileCompletionRequest;
import com.realestate.duediligence.service.OnboardingService;
import com.realestate.duediligence.util.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class OnboardingController {

    private final OnboardingService onboardingService;
    private final JwtService jwtService;

    public OnboardingController(OnboardingService onboardingService, JwtService jwtService) {
        this.onboardingService = onboardingService;
        this.jwtService = jwtService;
    }

    @PostMapping("/complete")
    public ResponseEntity<?> completeProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody ProfileCompletionRequest request) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid Authorization header");
        }

        try {
            String email = jwtService.extractUsername(authHeader.substring(7));
            return ResponseEntity.ok(onboardingService.completeProfile(email, request));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Token verification failed: " + exception.getMessage());
        }
    }
}
