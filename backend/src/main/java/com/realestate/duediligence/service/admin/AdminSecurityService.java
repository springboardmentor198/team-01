package com.realestate.duediligence.service.admin;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.realestate.duediligence.dto.admin.SecurityEventResponse;

public interface AdminSecurityService {
    Page<SecurityEventResponse> getEvents(
            String adminEmail,
            String eventType,
            String status,
            Integer userId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable);

    Map<String, Object> getSummary(String adminEmail);
}
