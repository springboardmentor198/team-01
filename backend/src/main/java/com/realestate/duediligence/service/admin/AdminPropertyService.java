package com.realestate.duediligence.service.admin;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.realestate.duediligence.dto.admin.AdminPropertyResponse;

public interface AdminPropertyService {
    Page<AdminPropertyResponse> getProperties(
            String adminEmail,
            String status,
            String propertyType,
            String city,
            String ownerName,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable);

    AdminPropertyResponse getPropertyById(String adminEmail, Integer propertyId);

    AdminPropertyResponse approveProperty(String adminEmail, Integer propertyId, String ipAddress);

    AdminPropertyResponse rejectProperty(String adminEmail, Integer propertyId, String ipAddress);

    AdminPropertyResponse reviewProperty(String adminEmail, Integer propertyId, String ipAddress);
}
