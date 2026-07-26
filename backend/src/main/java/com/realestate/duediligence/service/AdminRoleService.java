package com.realestate.duediligence.service;

import java.util.List;

import com.realestate.duediligence.dto.AdminRoleRequestResponse;
import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;

public interface AdminRoleService {

    List<AdminRoleRequestResponse> getRoleRequests(
            String adminEmail,
            AccountStatus status,
            Role requestedRole
    );

    AdminRoleRequestResponse getRoleRequestById(String adminEmail, Integer requestId);

    AdminRoleRequestResponse approveRoleRequest(String adminEmail, Integer requestId);

    AdminRoleRequestResponse rejectRoleRequest(String adminEmail, Integer requestId);
}
