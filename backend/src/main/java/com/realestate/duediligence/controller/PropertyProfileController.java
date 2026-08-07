package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.PropertyProfileResponse;
import com.realestate.duediligence.service.PropertyProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/property-profile")
@CrossOrigin(origins = "*")
public class PropertyProfileController {

    private final PropertyProfileService propertyProfileService;

    public PropertyProfileController(PropertyProfileService propertyProfileService) {
        this.propertyProfileService = propertyProfileService;
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<PropertyProfileResponse> getPropertyProfile(
            @PathVariable Integer propertyId) {

        return ResponseEntity.ok(
                propertyProfileService.getPropertyProfile(propertyId));

    }
}