package com.realestate.duediligence.controller;

import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.service.PropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "*")
public class PropertyController {

    @Autowired
    private PropertyService propertyService;

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
    public ResponseEntity<List<Property>> searchByCity(@RequestParam String city) {
        return ResponseEntity.ok(propertyService.searchByCity(city));
    }
}
