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
import com.realestate.duediligence.repository.ActivityLogRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.RiskSummaryRepository;
import com.realestate.duediligence.dto.PopularPropertyResponse;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;


@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "*")
public class PropertyController {

    @Autowired
    private PropertyService propertyService;
    @Autowired private RiskSummaryService riskSummaryService;
    @Autowired private DocumentService documentService;
    @Autowired private PermitService permitService;
    @Autowired private ActivityLogRepository activityLogRepository;
    @Autowired private PropertyRepository propertyRepository;
    @Autowired private RiskSummaryRepository riskSummaryRepository;

    @PostMapping
    public ResponseEntity<Property> createProperty(@RequestBody Property property) {
        return ResponseEntity.ok(propertyService.save(property));
    }

    @GetMapping
    public ResponseEntity<List<Property>> getAllProperties() {
        return ResponseEntity.ok(propertyRepository.findByStatus("APPROVED"));
    }

    @GetMapping("/popular")
    public ResponseEntity<List<PopularPropertyResponse>> popularProperties(
            @RequestParam(defaultValue = "6") int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 12));
        LocalDateTime now = LocalDateTime.now();
        List<Object[]> metrics = activityLogRepository.findPopularPropertyMetrics(
                now.minusDays(7), now.minusDays(30), PageRequest.of(0, safeLimit));
        Map<Integer, Object[]> byPropertyId = metrics.stream().collect(Collectors.toMap(
                row -> (Integer) row[0], row -> row));
        List<Property> properties = byPropertyId.isEmpty()
                ? propertyRepository.findAll(PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent()
                : propertyRepository.findAllById(byPropertyId.keySet()).stream()
                        .sorted((left, right) -> Long.compare(score(byPropertyId.get(right.getPropertyId())), score(byPropertyId.get(left.getPropertyId())))).toList();
        return ResponseEntity.ok(properties.stream().map(property -> {
            Object[] row = byPropertyId.get(property.getPropertyId());
            long views = row == null ? 0 : ((Number) row[1]).longValue();
            long uniqueViewers = row == null ? 0 : ((Number) row[2]).longValue();
            long popularity = row == null ? 0 : score(row);
            String risk = riskSummaryRepository.findByProperty_PropertyId(property.getPropertyId()).map(item -> item.getOverallRisk()).orElse("Unrated");
            return PopularPropertyResponse.builder().propertyId(property.getPropertyId()).propertyCode(property.getPropertyCode()).address(property.getAddress()).city(property.getCity()).propertyType(property.getPropertyType()).status(property.getStatus()).imageUrl(property.getImageUrl()).riskLevel(risk).viewCount(views).uniqueViewerCount(uniqueViewers).popularityScore(popularity).trending(views >= 3).build();
        }).toList());
    }

    private static long score(Object[] row) {
        if (row == null) return 0;
        return ((Number) row[3]).longValue() * 3L + ((Number) row[1]).longValue() + ((Number) row[2]).longValue() * 2L;
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
