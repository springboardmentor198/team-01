package com.realestate.duediligence.service.admin;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.realestate.duediligence.dto.admin.AdminUserResponse;
import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;

public interface AdminUserService {
    Page<AdminUserResponse> getUsers(
            String adminEmail,
            Role role,
            AccountStatus status,
            String search,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable);

    AdminUserResponse getUserById(String adminEmail, Integer userId);

    AdminUserResponse updateUserStatus(String adminEmail, Integer userId, AccountStatus status, String ipAddress);
}
