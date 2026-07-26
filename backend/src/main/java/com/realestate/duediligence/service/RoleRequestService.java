package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.RoleRequestRequest;
import com.realestate.duediligence.dto.RoleRequestResponse;

public interface RoleRequestService {

    RoleRequestResponse createRoleRequest(String email, RoleRequestRequest request);
}
