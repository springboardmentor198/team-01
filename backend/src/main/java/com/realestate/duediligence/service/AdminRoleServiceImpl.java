package com.realestate.duediligence.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.realestate.duediligence.dto.AdminRoleRequestResponse;
import com.realestate.duediligence.entity.RoleRequest;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.event.NotificationEvents;
import com.realestate.duediligence.repository.RoleRequestRepository;
import com.realestate.duediligence.repository.UserRepository;

@Service
public class AdminRoleServiceImpl implements AdminRoleService {

    private final RoleRequestRepository roleRequestRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    public AdminRoleServiceImpl(
            RoleRequestRepository roleRequestRepository,
            UserRepository userRepository,
            ApplicationEventPublisher eventPublisher) {
        this.roleRequestRepository = roleRequestRepository;
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminRoleRequestResponse> getRoleRequests(
            String adminEmail,
            AccountStatus status,
            Role requestedRole) {

        requireAdmin(adminEmail);

        List<RoleRequest> roleRequests;
        if (status != null && requestedRole != null) {
            roleRequests = roleRequestRepository.findByStatusAndRequestedRole(status, requestedRole);
        } else if (status != null) {
            roleRequests = roleRequestRepository.findByStatus(status);
        } else if (requestedRole != null) {
            roleRequests = roleRequestRepository.findByRequestedRole(requestedRole);
        } else {
            roleRequests = roleRequestRepository.findAll();
        }

        return roleRequests.stream()
                .sorted(Comparator.comparing(
                        RoleRequest::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminRoleRequestResponse getRoleRequestById(String adminEmail, Integer requestId) {
        requireAdmin(adminEmail);
        return toResponse(getRoleRequest(requestId));
    }

    @Override
    @Transactional
    public AdminRoleRequestResponse approveRoleRequest(String adminEmail, Integer requestId) {
        requireAdmin(adminEmail);

        RoleRequest roleRequest = getRoleRequest(requestId);
        requirePending(roleRequest);

        User user = roleRequest.getUser();
        user.setRole(roleRequest.getRequestedRole());
        user.setProfileCompleted(true);
        user.setStatus(AccountStatus.ACTIVE);

        roleRequest.setStatus(AccountStatus.ACTIVE);

        userRepository.save(user);
        RoleRequest savedRequest = roleRequestRepository.save(roleRequest);
        eventPublisher.publishEvent(new NotificationEvents.RoleRequestDecisionEvent(
                user,
                true,
                roleRequest.getRequestedRole().name()));

        return toResponse(savedRequest);
    }

    @Override
    @Transactional
    public AdminRoleRequestResponse rejectRoleRequest(String adminEmail, Integer requestId) {
        requireAdmin(adminEmail);

        RoleRequest roleRequest = getRoleRequest(requestId);
        requirePending(roleRequest);

        User user = roleRequest.getUser();
        user.setProfileCompleted(false);

        roleRequest.setStatus(AccountStatus.REJECTED);

        userRepository.save(user);
        RoleRequest savedRequest = roleRequestRepository.save(roleRequest);
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
