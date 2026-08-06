package com.realestate.duediligence.controller;

import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.service.PropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.realestate.duediligence.dto.*;
import com.realestate.duediligence.service.RiskSummaryService;
import com.realestate.duediligence.service.DocumentService;
import com.realestate.duediligence.service.PermitService;


@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "*")
public class PropertyController {

    @Autowired
    private PropertyService propertyService;
    @Autowired private RiskSummaryService riskSummaryService;
    @Autowired private DocumentService documentService;
    @Autowired private PermitService permitService;

    @PostMapping
    public ResponseEntity<Property> createProperty(@RequestBody Property property) {
        return ResponseEntity.ok(propertyService.save(property));
    }

    @GetMapping
    public ResponseEntity<List<Property>> getAllProperties() {
        return ResponseEntity.ok(propertyService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Property> getPropertyById(@PathVariable Integer id) {
        return ResponseEntity.ok(propertyService.getById(id));
    }
    @GetMapping("/{id}/overview") public ResponseEntity<Property> getOverview(@PathVariable Integer id) { return ResponseEntity.ok(propertyService.getById(id)); }
    @GetMapping("/{id}/risk") public ResponseEntity<RiskSummaryResponse> getRisk(@PathVariable Integer id) { return ResponseEntity.ok(riskSummaryService.getRiskSummary(id)); }
    @GetMapping("/{id}/documents") public ResponseEntity<List<DocumentResponse>> getDocuments(@PathVariable Integer id) { return ResponseEntity.ok(documentService.getDocuments(id)); }
    @GetMapping("/{id}/permits") public ResponseEntity<List<PermitResponse>> getPermits(@PathVariable Integer id) { return ResponseEntity.ok(permitService.getPermits(id)); }

    @PutMapping("/{id}")
    public ResponseEntity<Property> updateProperty(
            @PathVariable Integer id,
            @RequestBody Property property) {
        return ResponseEntity.ok(propertyService.update(id, property));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProperty(@PathVariable Integer id) {
        propertyService.delete(id);
        return ResponseEntity.ok("Property deleted successfully");
    }

@GetMapping("/search")
public ResponseEntity<List<Property>> searchProperties(
        @RequestParam String keyword) {
    return ResponseEntity.ok(propertyService.searchProperties(keyword));
}

    @GetMapping("/autocomplete")
    public ResponseEntity<List<PropertySuggestion>> autocomplete(
            @RequestParam(defaultValue = "") String keyword) {
        return ResponseEntity.ok(propertyService.autocomplete(keyword));
    }

    @GetMapping("/global-search")
    public ResponseEntity<List<Property>> globalSearch(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(propertyService.globalSearch(keyword, page, size));
    }
}
