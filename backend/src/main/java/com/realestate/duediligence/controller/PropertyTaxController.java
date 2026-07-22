package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.PropertyTaxHistoryResponse;
import com.realestate.duediligence.dto.PropertyTaxSummaryResponse;
import com.realestate.duediligence.service.PropertyTaxService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "*")
public class PropertyTaxController {

    @Autowired
    private PropertyTaxService propertyTaxService;

    @GetMapping("/{propertyId}/tax-history")
    public ResponseEntity<List<PropertyTaxHistoryResponse>> getTaxHistory(@PathVariable Integer propertyId) {
        return ResponseEntity.ok(propertyTaxService.getTaxHistoryByPropertyId(propertyId));
    }

    @GetMapping("/{propertyId}/tax-summary")
    public ResponseEntity<PropertyTaxSummaryResponse> getTaxSummary(@PathVariable Integer propertyId) {
        return ResponseEntity.ok(propertyTaxService.getTaxSummaryByPropertyId(propertyId));
    }

    @PostMapping("/{propertyId}/tax-history")
    public ResponseEntity<PropertyTaxHistoryResponse> addTaxRecord(
            @PathVariable Integer propertyId,
            @RequestBody PropertyTaxHistoryResponse record) {
        return ResponseEntity.ok(propertyTaxService.addTaxRecord(propertyId, record));
    }

    @PutMapping("/tax-history/{taxHistoryId}")
    public ResponseEntity<PropertyTaxHistoryResponse> updateTaxRecord(
            @PathVariable Long taxHistoryId,
            @RequestBody PropertyTaxHistoryResponse record) {
        return ResponseEntity.ok(propertyTaxService.updateTaxRecord(taxHistoryId, record));
    }

    @DeleteMapping("/tax-history/{taxHistoryId}")
    public ResponseEntity<String> deleteTaxRecord(@PathVariable Long taxHistoryId) {
        propertyTaxService.deleteTaxRecord(taxHistoryId);
        return ResponseEntity.ok("Tax record deleted successfully");
    }
}
