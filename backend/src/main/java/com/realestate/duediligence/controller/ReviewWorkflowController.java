package com.realestate.duediligence.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.service.ReviewWorkflowService;
import com.realestate.duediligence.util.JwtService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReviewWorkflowController {

    private final ReviewWorkflowService reviewWorkflowService;
    private final JwtService jwtService;

    @PostMapping("/legal/{propertyId}/start")
    public ResponseEntity<Map<String, String>> startLegalReview(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer propertyId) {
        reviewWorkflowService.startLegalReview(extractEmail(authHeader), propertyId);
        return ResponseEntity.ok(Map.of("message", "Legal review started"));
    }

    @PostMapping("/legal/{propertyId}/complete")
    public ResponseEntity<Map<String, String>> completeLegalReview(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer propertyId,
            @RequestBody(required = false) Map<String, Object> body) {
        boolean approved = body != null && Boolean.TRUE.equals(body.get("approved"));
        reviewWorkflowService.completeLegalReview(extractEmail(authHeader), propertyId, approved);
        return ResponseEntity.ok(Map.of("message", "Legal review completed"));
    }

    @PostMapping("/financial/{propertyId}/start")
    public ResponseEntity<Map<String, String>> startFinancialReview(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer propertyId) {
        reviewWorkflowService.startFinancialReview(extractEmail(authHeader), propertyId);
        return ResponseEntity.ok(Map.of("message", "Financial review started"));
    }

    @PostMapping("/financial/{propertyId}/complete")
    public ResponseEntity<Map<String, String>> completeFinancialReview(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer propertyId,
            @RequestBody(required = false) Map<String, Object> body) {
        boolean approved = body != null && Boolean.TRUE.equals(body.get("approved"));
        reviewWorkflowService.completeFinancialReview(extractEmail(authHeader), propertyId, approved);
        return ResponseEntity.ok(Map.of("message", "Financial review completed"));
    }

    private String extractEmail(String authHeader) {
        return jwtService.extractUsername(authHeader.substring(7));
    }
}
