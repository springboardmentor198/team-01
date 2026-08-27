package com.realestate.duediligence.service.admin;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.realestate.duediligence.dto.admin.AdminUserResponse;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.entity.admin.SecurityEvent;
import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.repository.admin.SecurityEventRepository;

@Service
@Transactional
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final SecurityEventRepository securityEventRepository;

    public AdminUserServiceImpl(UserRepository userRepository, SecurityEventRepository securityEventRepository) {
        this.userRepository = userRepository;
        this.securityEventRepository = securityEventRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminUserResponse> getUsers(
            String adminEmail,
            Role role,
            AccountStatus status,
            String search,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {

        requireAdmin(adminEmail);
        String searchParam = (search != null && !search.trim().isEmpty()) ? "%" + search.trim().toLowerCase() + "%" : null;
        Page<User> users = userRepository.findWithFilters(role, status, searchParam, startDate, endDate, pageable);
        return users.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserResponse getUserById(String adminEmail, Integer userId) {
        requireAdmin(adminEmail);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId));
        return toResponse(user);
    }

    @Override
    public AdminUserResponse updateUserStatus(String adminEmail, Integer userId, AccountStatus status, String ipAddress) {
        User admin = requireAdmin(adminEmail);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId));

        if (admin.getUserId().equals(userId) && status == AccountStatus.SUSPENDED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Administrators cannot suspend their own account");
        }

        AccountStatus oldStatus = user.getStatus();
        user.setStatus(status);
        User savedUser = userRepository.save(user);

        // Audit the status change
        SecurityEvent event = SecurityEvent.builder()
                .user(admin)
                .eventType("USER_STATUS_CHANGE")
                .ipAddress(ipAddress)
                .action("Changed status of user " + user.getEmail() + " from " + oldStatus + " to " + status)
                .status("SUCCESS")
                .createdAt(LocalDateTime.now())
                .build();
        securityEventRepository.save(event);

        return toResponse(savedUser);
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

    private AdminUserResponse toResponse(User user) {
        return AdminUserResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .phoneNumber(user.getPhoneNumber())
                .profileCompleted(user.getProfileCompleted())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
