package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.OwnershipResponse;
import com.realestate.duediligence.service.OwnershipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ownership")
@CrossOrigin(origins = "*")
public class OwnershipController {

    private final OwnershipService ownershipService;

    @Autowired
    public OwnershipController(OwnershipService ownershipService) {
        this.ownershipService = ownershipService;
    }

    @GetMapping("/{propertyId}")
    public List<OwnershipResponse> getOwnershipByPropertyId(
            @PathVariable Integer propertyId) {

        return ownershipService.getOwnershipByPropertyId(propertyId);
    }
}