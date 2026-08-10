package com.realestate.duediligence.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import com.realestate.duediligence.dto.ComparablePropertyResponse;
import com.realestate.duediligence.dto.PropertyValuationResponse;
import com.realestate.duediligence.dto.RiskSummaryResponse;
import com.realestate.duediligence.service.PropertyAnalyticsService;
import com.realestate.duediligence.service.RiskSummaryService;
import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PropertyAnalyticsController {
    private final RiskSummaryService riskSummaryService;
    private final PropertyAnalyticsService analyticsService;
    @GetMapping("/api/risk/{propertyId}")
    public ResponseEntity<RiskSummaryResponse> risk(@PathVariable Integer propertyId) {
        return ResponseEntity.ok(riskSummaryService.getRiskSummary(propertyId));
    }
    @GetMapping("/api/comparison/{propertyId}")
    public ResponseEntity<List<ComparablePropertyResponse>> comparison(@PathVariable Integer propertyId) {
        return ResponseEntity.ok(analyticsService.getComparables(propertyId));
    }
    @GetMapping("/api/valuation/{propertyId}")
    public ResponseEntity<PropertyValuationResponse> valuation(@PathVariable Integer propertyId) {
        return ResponseEntity.ok(analyticsService.getValuation(propertyId));
    }
}
