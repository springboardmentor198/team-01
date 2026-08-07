package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.PropertySuggestion;
import com.realestate.duediligence.entity.ActivityLog;
import com.realestate.duediligence.repository.ActivityLogRepository;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.event.NotificationEvents;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Optional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PropertyServiceImpl implements PropertyService {

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
public Property save(Property property) {

    if (property.getPropertyCode() == null || property.getPropertyCode().isBlank()) {
        throw new RuntimeException("Property Code is required");
    }

    if (property.getAddress() == null || property.getAddress().isBlank()) {
        throw new RuntimeException("Address is required");
    }

    if (property.getCity() == null || property.getCity().isBlank()) {
        throw new RuntimeException("City is required");
    }

    if (property.getCountry() == null || property.getCountry().isBlank()) {
        throw new RuntimeException("Country is required");
    }

    Property savedProperty = propertyRepository.save(property);

    activityLogRepository.save(
        ActivityLog.builder()
            .property(savedProperty)
            .activityType("PROPERTY_CREATED")
            .description("Property was added to the system.")
            .performedBy("System")
            .createdAt(LocalDateTime.now())
            .build()
    );

    eventPublisher.publishEvent(new NotificationEvents.PropertyCreatedEvent(savedProperty, null));

    return savedProperty;
}

    @Override
    public List<Property> getAll() {
        return propertyRepository.findAll();
    }

    @Override
    public Property getById(Integer id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
    }

    @Override
    public Property update(Integer id, Property property) {

        Property existing = getById(id);
        String previousStatus = existing.getStatus();

        existing.setPropertyCode(property.getPropertyCode());
        existing.setParcelId(property.getParcelId());
        existing.setAddress(property.getAddress());
        existing.setCity(property.getCity());
        existing.setCountry(property.getCountry());
        existing.setPropertyType(property.getPropertyType());
        existing.setLandUse(property.getLandUse());
        existing.setLotSizeSqft(property.getLotSizeSqft());
        existing.setYearBuilt(property.getYearBuilt());
        existing.setBedrooms(property.getBedrooms());
        existing.setBathrooms(property.getBathrooms());
        existing.setOwnerName(property.getOwnerName());
        existing.setStatus(property.getStatus());
        existing.setImageUrl(property.getImageUrl());

        Property updated = propertyRepository.save(existing);
        eventPublisher.publishEvent(new NotificationEvents.PropertyUpdatedEvent(
                updated,
                null,
                previousStatus,
                updated.getStatus()));
        return updated;
    }

    @Override
    public void delete(Integer id) {
        Property property = getById(id);
        eventPublisher.publishEvent(new NotificationEvents.PropertyDeletedEvent(
                id,
                property.getPropertyCode(),
                null));
        propertyRepository.deleteById(id);
    }

   @Override
public List<Property> searchProperties(String keyword) {
    return propertyRepository.searchProperties(keyword);
}

    @Override
    public List<Property> globalSearch(String keyword, int page, int size) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }

        String term = keyword.trim();
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);

        return propertyRepository.globalSearch(
                term,
                term,
                PageRequest.of(safePage, safeSize));
    }

    @Override
    public List<PropertySuggestion> autocomplete(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }

        String term = keyword.trim();

        return propertyRepository.globalSearch(term, term, PageRequest.of(0, 10))
                .stream()
                .map(property -> PropertySuggestion.builder()
                        .propertyId(property.getPropertyId())
                        .name(property.getPropertyCode())
                        .city(property.getCity())
                        .propertyType(property.getPropertyType())
                        .address(property.getAddress())
                        .build())
                .collect(Collectors.toList());
    }
}
