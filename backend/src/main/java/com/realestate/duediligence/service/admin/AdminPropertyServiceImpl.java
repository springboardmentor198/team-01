package com.realestate.duediligence.service.admin;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.realestate.duediligence.dto.admin.AdminPropertyResponse;
import com.realestate.duediligence.entity.ActivityLog;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.entity.admin.SecurityEvent;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.repository.ActivityLogRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.repository.admin.SecurityEventRepository;

@Service
@Transactional
public class AdminPropertyServiceImpl implements AdminPropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final SecurityEventRepository securityEventRepository;

    public AdminPropertyServiceImpl(
            PropertyRepository propertyRepository,
            UserRepository userRepository,
            ActivityLogRepository activityLogRepository,
            SecurityEventRepository securityEventRepository) {
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.securityEventRepository = securityEventRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminPropertyResponse> getProperties(
            String adminEmail,
            String status,
            String propertyType,
            String city,
            String ownerName,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {

        requireAdmin(adminEmail);
        
        String cleanStatus = status != null && !status.trim().isEmpty() ? status.trim() : null;
        String cleanType = propertyType != null && !propertyType.trim().isEmpty() ? propertyType.trim() : null;
        String cleanCity = city != null && !city.trim().isEmpty() ? city.trim() : null;
        String cleanOwner = ownerName != null && !ownerName.trim().isEmpty() ? "%" + ownerName.trim().toLowerCase() + "%" : null;

        Page<Property> properties = propertyRepository.findWithFilters(
                cleanStatus, cleanType, cleanCity, cleanOwner, startDate, endDate, pageable);
        return properties.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminPropertyResponse getPropertyById(String adminEmail, Integer propertyId) {
        requireAdmin(adminEmail);
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found: " + propertyId));
        return toResponse(property);
    }

    @Override
    public AdminPropertyResponse approveProperty(String adminEmail, Integer propertyId, String ipAddress) {
        User admin = requireAdmin(adminEmail);
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found: " + propertyId));

        property.setStatus("APPROVED");
        property.setLastUpdated(LocalDateTime.now());
        Property saved = propertyRepository.save(property);

        // Record ActivityLog
        activityLogRepository.save(ActivityLog.builder()
                .property(saved)
                .activityType("PROPERTY_APPROVED")
                .description("Property " + property.getPropertyCode() + " approved by admin.")
                .performedBy(admin.getName())
                .createdAt(LocalDateTime.now())
                .build());

        // Record Security Event
        securityEventRepository.save(SecurityEvent.builder()
                .user(admin)
                .eventType("PROPERTY_APPROVED")
                .ipAddress(ipAddress)
                .action("Approved property ID " + propertyId + " (" + property.getPropertyCode() + ")")
                .status("SUCCESS")
                .createdAt(LocalDateTime.now())
                .build());

        return toResponse(saved);
    }

    @Override
    public AdminPropertyResponse rejectProperty(String adminEmail, Integer propertyId, String ipAddress) {
        User admin = requireAdmin(adminEmail);
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found: " + propertyId));

        property.setStatus("REJECTED");
        property.setLastUpdated(LocalDateTime.now());
        Property saved = propertyRepository.save(property);

        // Record ActivityLog
        activityLogRepository.save(ActivityLog.builder()
                .property(saved)
                .activityType("PROPERTY_REJECTED")
                .description("Property " + property.getPropertyCode() + " rejected by admin.")
                .performedBy(admin.getName())
                .createdAt(LocalDateTime.now())
                .build());

        // Record Security Event
        securityEventRepository.save(SecurityEvent.builder()
                .user(admin)
                .eventType("PROPERTY_REJECTED")
                .ipAddress(ipAddress)
                .action("Rejected property ID " + propertyId + " (" + property.getPropertyCode() + ")")
                .status("SUCCESS")
                .createdAt(LocalDateTime.now())
                .build());

        return toResponse(saved);
    }

    @Override
    public AdminPropertyResponse reviewProperty(String adminEmail, Integer propertyId, String ipAddress) {
        User admin = requireAdmin(adminEmail);
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found: " + propertyId));

        property.setStatus("UNDER_REVIEW");
        property.setLastUpdated(LocalDateTime.now());
        Property saved = propertyRepository.save(property);

        // Record ActivityLog
        activityLogRepository.save(ActivityLog.builder()
                .property(saved)
                .activityType("PROPERTY_UNDER_REVIEW")
                .description("Property " + property.getPropertyCode() + " set to under review by admin.")
                .performedBy(admin.getName())
                .createdAt(LocalDateTime.now())
                .build());

        // Record Security Event
        securityEventRepository.save(SecurityEvent.builder()
                .user(admin)
                .eventType("PROPERTY_UNDER_REVIEW")
                .ipAddress(ipAddress)
                .action("Set property ID " + propertyId + " (" + property.getPropertyCode() + ") to under review")
                .status("SUCCESS")
                .createdAt(LocalDateTime.now())
                .build());

        return toResponse(saved);
    }

    private User requireAdmin(String adminEmail) {
        User user = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Administrator access is required"
                ));

        if (user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Administrator access is required"
            );
        }

        return user;
    }

    private AdminPropertyResponse toResponse(Property property) {
        return AdminPropertyResponse.builder()
                .propertyId(property.getPropertyId())
                .propertyCode(property.getPropertyCode())
                .parcelId(property.getParcelId())
                .address(property.getAddress())
                .city(property.getCity())
                .state(property.getState())
                .country(property.getCountry())
                .propertyType(property.getPropertyType())
                .landUse(property.getLandUse())
                .lotSizeSqft(property.getLotSizeSqft())
                .estimatedPrice(property.getEstimatedPrice())
                .yearBuilt(property.getYearBuilt())
                .bedrooms(property.getBedrooms())
                .bathrooms(property.getBathrooms())
                .ownerId(property.getOwner() != null ? property.getOwner().getUserId() : null)
                .ownerName(property.getOwnerName())
                .status(property.getStatus())
                .imageUrl(property.getImageUrl())
                .lastUpdated(property.getLastUpdated())
                .createdAt(property.getCreatedAt())
                .build();
    }
}
