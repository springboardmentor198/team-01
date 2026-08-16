package com.realestate.duediligence.service.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.realestate.duediligence.dto.admin.AdminRoleRequestResponse;
import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;

public interface AdminRoleRequestService {
    Page<AdminRoleRequestResponse> getRoleRequests(
            String adminEmail,
            AccountStatus status,
            Role requestedRole,
            String search,
            Pageable pageable);

    AdminRoleRequestResponse getRoleRequestById(String adminEmail, Integer requestId);

    AdminRoleRequestResponse approveRoleRequest(String adminEmail, Integer requestId, String ipAddress);

    AdminRoleRequestResponse rejectRoleRequest(String adminEmail, Integer requestId, String remarks, String ipAddress);
}
