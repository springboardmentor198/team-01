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

        if (requestedRole != null) {
            Page<RoleRequest> requests = roleRequestRepository.findWithFilters(status, requestedRole, searchParam, pageable);
            return requests.map(this::toResponse);
        }

        return roleRequestRepository.findWithFilters(status, null, searchParam, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminRoleRequestResponse getRoleRequestById(String adminEmail, Integer requestId) {
        requireAdmin(adminEmail);
        return toResponse(getRoleRequest(requestId));
    }

    @Override
    public AdminRoleRequestResponse approveRoleRequest(String adminEmail, Integer requestId, String ipAddress) {
        User admin = requireAdmin(adminEmail);

        RoleRequest roleRequest = getRoleRequest(requestId);
        requirePending(roleRequest);

        Role requestedRole = roleRequest.getRequestedRole();
        if (requestedRole == Role.ADMIN) {
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

        RoleRequest roleRequest = getRoleRequest(requestId);
        requirePending(roleRequest);

        User user = roleRequest.getUser();
        user.setStatus(AccountStatus.REJECTED);
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

}
