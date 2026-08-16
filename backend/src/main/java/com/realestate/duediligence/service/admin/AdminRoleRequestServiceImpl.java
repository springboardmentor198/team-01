package com.realestate.duediligence.service.admin;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.realestate.duediligence.dto.admin.AdminRoleRequestResponse;
import com.realestate.duediligence.entity.RoleRequest;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.entity.admin.SecurityEvent;
import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.event.NotificationEvents;
import com.realestate.duediligence.repository.RoleRequestRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.repository.admin.SecurityEventRepository;

@Service
@Transactional
public class AdminRoleRequestServiceImpl implements AdminRoleRequestService {

    private final RoleRequestRepository roleRequestRepository;
    private final UserRepository userRepository;
    private final SecurityEventRepository securityEventRepository;
    private final ApplicationEventPublisher eventPublisher;

    public AdminRoleRequestServiceImpl(
            RoleRequestRepository roleRequestRepository,
            UserRepository userRepository,
            SecurityEventRepository securityEventRepository,
            ApplicationEventPublisher eventPublisher) {
        this.roleRequestRepository = roleRequestRepository;
        this.userRepository = userRepository;
        this.securityEventRepository = securityEventRepository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminRoleRequestResponse> getRoleRequests(
            String adminEmail,
            AccountStatus status,
            Role requestedRole,
            String search,
            Pageable pageable) {

        requireAdmin(adminEmail);
        String searchParam = (search != null && !search.trim().isEmpty()) ? "%" + search.trim().toLowerCase() + "%" : null;

        if (requestedRole == Role.BUYER) {
            Page<User> users = userRepository.findWithFilters(Role.BUYER, status, searchParam, null, null, pageable);
            return users.map(this::toResponseFromUser);
        }

        if (requestedRole != null) {
            Page<RoleRequest> requests = roleRequestRepository.findWithFilters(status, requestedRole, searchParam, pageable);
            return requests.map(this::toResponse);
        }

        // If requestedRole is null, fetch both and combine them
        Page<RoleRequest> requests = roleRequestRepository.findWithFilters(status, null, searchParam, pageable);
        Page<User> buyers = userRepository.findWithFilters(Role.BUYER, status, searchParam, null, null, pageable);

        List<AdminRoleRequestResponse> combinedList = new java.util.ArrayList<>();
        for (RoleRequest rr : requests.getContent()) {
            combinedList.add(toResponse(rr));
        }
        for (User u : buyers.getContent()) {
            combinedList.add(toResponseFromUser(u));
        }

        combinedList.sort((a, b) -> {
            if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
            if (a.getCreatedAt() == null) return 1;
            if (b.getCreatedAt() == null) return -1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        long totalElements = requests.getTotalElements() + buyers.getTotalElements();
        return new org.springframework.data.domain.PageImpl<>(combinedList, pageable, totalElements);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminRoleRequestResponse getRoleRequestById(String adminEmail, Integer requestId) {
        requireAdmin(adminEmail);
        if (requestId < 0) {
            Integer userId = -requestId;
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "User not found: " + userId
                    ));
            return toResponseFromUser(user);
        }
        return toResponse(getRoleRequest(requestId));
    }

    @Override
    public AdminRoleRequestResponse approveRoleRequest(String adminEmail, Integer requestId, String ipAddress) {
        User admin = requireAdmin(adminEmail);

        if (requestId < 0) {
            Integer userId = -requestId;
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "User not found: " + userId
                    ));

            user.setStatus(AccountStatus.ACTIVE);
            user.setProfileCompleted(true);
            User savedUser = userRepository.save(user);

            // Record audit security event
            SecurityEvent event = SecurityEvent.builder()
                    .user(admin)
                    .eventType("ROLE_REQUEST_APPROVED")
                    .ipAddress(ipAddress)
                    .action("Approved BUYER status for user " + user.getEmail())
                    .status("SUCCESS")
                    .createdAt(LocalDateTime.now())
                    .build();
            securityEventRepository.save(event);

            eventPublisher.publishEvent(new NotificationEvents.RoleRequestDecisionEvent(
                    user,
                    true,
                    "BUYER"));

            return toResponseFromUser(savedUser);
        }

        RoleRequest roleRequest = getRoleRequest(requestId);
        requirePending(roleRequest);

        Role requestedRole = roleRequest.getRequestedRole();
        if (requestedRole != Role.AGENT && requestedRole != Role.LEGAL_REVIEWER && requestedRole != Role.BANK) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid requested professional role: " + requestedRole
            );
        }

        User user = roleRequest.getUser();
        user.setRole(requestedRole);
        user.setProfileCompleted(true);
        user.setStatus(AccountStatus.ACTIVE);

        roleRequest.setStatus(AccountStatus.ACTIVE);
        roleRequest.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        RoleRequest savedRequest = roleRequestRepository.save(roleRequest);

        // Record audit security event
        SecurityEvent event = SecurityEvent.builder()
                .user(admin)
                .eventType("ROLE_REQUEST_APPROVED")
                .ipAddress(ipAddress)
                .action("Approved " + requestedRole + " role request for user " + user.getEmail())
                .status("SUCCESS")
                .createdAt(LocalDateTime.now())
                .build();
        securityEventRepository.save(event);

        eventPublisher.publishEvent(new NotificationEvents.RoleRequestDecisionEvent(
                user,
                true,
                requestedRole.name()));

        return toResponse(savedRequest);
    }

    @Override
    public AdminRoleRequestResponse rejectRoleRequest(String adminEmail, Integer requestId, String remarks, String ipAddress) {
        User admin = requireAdmin(adminEmail);

        if (requestId < 0) {
            Integer userId = -requestId;
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "User not found: " + userId
                    ));

            user.setStatus(AccountStatus.REJECTED);
            user.setProfileCompleted(false);
            User savedUser = userRepository.save(user);

            // Record audit security event
            SecurityEvent event = SecurityEvent.builder()
                    .user(admin)
                    .eventType("ROLE_REQUEST_REJECTED")
                    .ipAddress(ipAddress)
                    .action("Rejected BUYER status for user " + user.getEmail() + ". Remarks: " + remarks)
                    .status("SUCCESS")
                    .createdAt(LocalDateTime.now())
                    .build();
            securityEventRepository.save(event);

            eventPublisher.publishEvent(new NotificationEvents.RoleRequestDecisionEvent(
                    user,
                    false,
                    "BUYER"));

            return toResponseFromUser(savedUser);
        }

        RoleRequest roleRequest = getRoleRequest(requestId);
        requirePending(roleRequest);

        User user = roleRequest.getUser();
        user.setProfileCompleted(false);

        roleRequest.setStatus(AccountStatus.REJECTED);
        roleRequest.setRemarks(remarks);
        roleRequest.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        RoleRequest savedRequest = roleRequestRepository.save(roleRequest);

        // Record audit security event
        SecurityEvent event = SecurityEvent.builder()
                .user(admin)
                .eventType("ROLE_REQUEST_REJECTED")
                .ipAddress(ipAddress)
                .action("Rejected " + roleRequest.getRequestedRole() + " role request for user " + user.getEmail() + ". Remarks: " + remarks)
                .status("SUCCESS")
                .createdAt(LocalDateTime.now())
                .build();
        securityEventRepository.save(event);

        eventPublisher.publishEvent(new NotificationEvents.RoleRequestDecisionEvent(
                user,
                false,
                roleRequest.getRequestedRole().name()));

        return toResponse(savedRequest);
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

    private RoleRequest getRoleRequest(Integer requestId) {
        return roleRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Role request not found: " + requestId
                ));
    }

    private void requirePending(RoleRequest roleRequest) {
        if (roleRequest.getStatus() != AccountStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only pending role requests can be updated"
            );
        }
    }

    private AdminRoleRequestResponse toResponse(RoleRequest roleRequest) {
        User user = roleRequest.getUser();

        return AdminRoleRequestResponse.builder()
                .requestId(roleRequest.getId())
                .userId(user.getUserId())
                .userName(user.getName())
                .email(user.getEmail())
                .requestedRole(roleRequest.getRequestedRole())
                .companyName(roleRequest.getCompanyName())
                .companyEmail(roleRequest.getCompanyEmail())
                .licenseNumber(roleRequest.getLicenseNumber())
                .yearsOfExperience(roleRequest.getYearsOfExperience())
                .documentName(roleRequest.getDocumentName())
                .documentPath(roleRequest.getDocumentPath())
                .documentMimeType(roleRequest.getDocumentMimeType())
                .documentSize(roleRequest.getDocumentSize())
                .status(roleRequest.getStatus())
                .remarks(roleRequest.getRemarks())
                .createdAt(roleRequest.getCreatedAt())
                .updatedAt(roleRequest.getUpdatedAt())
                .build();
    }

    private AdminRoleRequestResponse toResponseFromUser(User user) {
        return AdminRoleRequestResponse.builder()
                .requestId(-user.getUserId())
                .userId(user.getUserId())
                .userName(user.getName())
                .email(user.getEmail())
                .requestedRole(Role.BUYER)
                .companyName("N/A")
                .companyEmail("N/A")
                .licenseNumber("N/A")
                .yearsOfExperience(0)
                .documentName("N/A")
                .documentPath("N/A")
                .documentMimeType("N/A")
                .documentSize(0L)
                .status(user.getStatus())
                .remarks("")
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
