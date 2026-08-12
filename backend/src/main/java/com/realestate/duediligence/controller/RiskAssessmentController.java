package com.realestate.duediligence.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.duediligence.dto.RiskAssessmentResponse;
import com.realestate.duediligence.service.RiskAssessmentService;

@RestController
@RequestMapping("/api/risk")
@CrossOrigin(origins = "*")
public class RiskAssessmentController {

    private final RiskAssessmentService riskAssessmentService;

    public RiskAssessmentController(
            RiskAssessmentService riskAssessmentService) {
        this.riskAssessmentService = riskAssessmentService;
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<RiskAssessmentResponse> calculateRisk(
            @PathVariable Integer propertyId) {

        return ResponseEntity.ok(
                riskAssessmentService.calculateRisk(propertyId));
    }
}
