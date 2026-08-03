package com.realestate.duediligence.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.service.PropertyEngagementService;
import com.realestate.duediligence.util.JwtService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/engagements")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PropertyEngagementController {

    private final PropertyEngagementService propertyEngagementService;
    private final JwtService jwtService;

    @PostMapping("/properties/{propertyId}/save")
    public ResponseEntity<Map<String, String>> saveProperty(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer propertyId) {
        propertyEngagementService.saveProperty(extractEmail(authHeader), propertyId);
        return ResponseEntity.ok(Map.of("message", "Property saved"));
    }

    @DeleteMapping("/properties/{propertyId}/save")
    public ResponseEntity<Map<String, String>> unsaveProperty(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer propertyId) {
        propertyEngagementService.unsaveProperty(extractEmail(authHeader), propertyId);
        return ResponseEntity.ok(Map.of("message", "Property unsaved"));
    }

    @PostMapping("/properties/{propertyId}/contact-agent")
    public ResponseEntity<Map<String, String>> contactAgent(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer propertyId,
            @RequestBody Map<String, Object> body) {
        Integer agentId = Integer.valueOf(body.get("agentId").toString());
        String message = body.getOrDefault("message", "").toString();
        propertyEngagementService.contactAgent(extractEmail(authHeader), propertyId, agentId, message);
        return ResponseEntity.ok(Map.of("message", "Agent contacted"));
    }

    @PostMapping("/properties/{propertyId}/visits")
    public ResponseEntity<Map<String, String>> scheduleVisit(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer propertyId,
            @RequestBody Map<String, String> body) {
        propertyEngagementService.scheduleVisit(
                extractEmail(authHeader),
                propertyId,
                body.get("visitTime"));
        return ResponseEntity.ok(Map.of("message", "Visit scheduled"));
    }

    @DeleteMapping("/properties/{propertyId}/visits")
    public ResponseEntity<Map<String, String>> cancelVisit(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer propertyId) {
        propertyEngagementService.cancelVisit(extractEmail(authHeader), propertyId);
        return ResponseEntity.ok(Map.of("message", "Visit cancelled"));
    }

    @PostMapping("/properties/{propertyId}/offers")
    public ResponseEntity<Map<String, String>> submitOffer(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer propertyId,
            @RequestBody Map<String, String> body) {
        propertyEngagementService.submitOffer(
                extractEmail(authHeader),
                propertyId,
                body.get("offerAmount"));
        return ResponseEntity.ok(Map.of("message", "Offer submitted"));
    }

    private String extractEmail(String authHeader) {
        return jwtService.extractUsername(authHeader.substring(7));
    }
}
