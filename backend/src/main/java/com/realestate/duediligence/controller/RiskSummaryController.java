package com.realestate.duediligence.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.RiskSummaryRequest;
import com.realestate.duediligence.dto.RiskSummaryResponse;
import com.realestate.duediligence.service.RiskSummaryService;

@RestController
@RequestMapping("/api/risk-summary")
@CrossOrigin(origins = "*")
public class RiskSummaryController {

    private final RiskSummaryService service;

    public RiskSummaryController(RiskSummaryService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<RiskSummaryResponse> create(@RequestBody RiskSummaryRequest request) {
        return ResponseEntity.ok(service.createRiskSummary(request));
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<RiskSummaryResponse> get(@PathVariable Integer propertyId) {
        return ResponseEntity.ok(service.getRiskSummary(propertyId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RiskSummaryResponse> update(
            @PathVariable Integer id,
            @RequestBody RiskSummaryRequest request) {
        return ResponseEntity.ok(service.updateRiskSummary(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        service.deleteRiskSummary(id);
        return ResponseEntity.ok("Risk Summary deleted successfully");
    }
}