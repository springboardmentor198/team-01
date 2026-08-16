package com.realestate.duediligence.service.admin;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.realestate.duediligence.dto.admin.SecurityEventResponse;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.entity.admin.SecurityEvent;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.repository.admin.SecurityEventRepository;

@Service
@Transactional(readOnly = true)
public class AdminSecurityServiceImpl implements AdminSecurityService {

    private final SecurityEventRepository securityEventRepository;
    private final UserRepository userRepository;

    public AdminSecurityServiceImpl(
            SecurityEventRepository securityEventRepository,
            UserRepository userRepository) {
        this.securityEventRepository = securityEventRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Page<SecurityEventResponse> getEvents(
            String adminEmail,
            String eventType,
            String status,
            Integer userId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {

        requireAdmin(adminEmail);
        Page<SecurityEvent> events = securityEventRepository.findWithFilters(eventType, status, userId, startDate, endDate, pageable);
        return events.map(this::toResponse);
    }

    @Override
    public Map<String, Object> getSummary(String adminEmail) {
        requireAdmin(adminEmail);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalEvents", securityEventRepository.count());
        summary.put("failedLogins", securityEventRepository.countFailedLoginAttempts());
        summary.put("suspiciousActivities", securityEventRepository.countByEventType("SUSPICIOUS_ACTIVITY"));
        summary.put("suspendedAccountsCount", securityEventRepository.countByEventType("ACCOUNT_SUSPENDED"));

        return summary;
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

    private SecurityEventResponse toResponse(SecurityEvent se) {
        return SecurityEventResponse.builder()
                .eventId(se.getEventId())
                .userId(se.getUser() != null ? se.getUser().getUserId() : null)
                .userName(se.getUser() != null ? se.getUser().getName() : null)
                .userEmail(se.getUser() != null ? se.getUser().getEmail() : null)
                .eventType(se.getEventType())
                .ipAddress(se.getIpAddress())
                .action(se.getAction())
                .status(se.getStatus())
                .createdAt(se.getCreatedAt())
                .build();
    }
}
