package com.realestate.duediligence.controller.admin;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import com.realestate.duediligence.dto.admin.AdminRoleRequestResponse;
import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.service.admin.AdminRoleRequestService;
import com.realestate.duediligence.util.JwtService;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

class AdminRoleRequestControllerTest {

    @Mock
    private AdminRoleRequestService adminRoleRequestService;

    @Mock
    private JwtService jwtService;

    @Mock
    private HttpServletRequest httpServletRequest;

    @InjectMocks
    private AdminRoleRequestController adminRoleRequestController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetRoleRequests() {
        String authHeader = "Bearer token";
        String email = "admin@example.com";
        Pageable pageable = PageRequest.of(0, 10);
        AdminRoleRequestResponse responseDto = AdminRoleRequestResponse.builder()
                .requestId(1)
                .userName("Test Agent")
                .requestedRole(Role.AGENT)
                .status(AccountStatus.PENDING)
                .build();
        Page<AdminRoleRequestResponse> page = new PageImpl<>(List.of(responseDto));

        when(jwtService.extractUsername("token")).thenReturn(email);
        when(adminRoleRequestService.getRoleRequests(eq(email), eq(AccountStatus.PENDING), eq(Role.AGENT), eq("search"), any(Pageable.class)))
                .thenReturn(page);

        ResponseEntity<?> response = adminRoleRequestController.getRoleRequests(
                authHeader, AccountStatus.PENDING, Role.AGENT, "search", pageable);

        Assertions.assertNotNull(response);
        Assertions.assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void testApproveRoleRequest() {
        String authHeader = "Bearer token";
        String email = "admin@example.com";
        AdminRoleRequestResponse responseDto = AdminRoleRequestResponse.builder()
                .requestId(1)
                .userName("Test Agent")
                .requestedRole(Role.AGENT)
                .status(AccountStatus.ACTIVE)
                .build();

        when(jwtService.extractUsername("token")).thenReturn(email);
        when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        when(adminRoleRequestService.approveRoleRequest(email, 1, "127.0.0.1")).thenReturn(responseDto);

        ResponseEntity<?> response = adminRoleRequestController.approveRoleRequestPut(authHeader, 1, httpServletRequest);

        Assertions.assertNotNull(response);
        Assertions.assertEquals(200, response.getStatusCode().value());
        Assertions.assertEquals(AccountStatus.ACTIVE, ((AdminRoleRequestResponse) response.getBody()).getStatus());
    }

    @Test
    void testRejectRoleRequest() {
        String authHeader = "Bearer token";
        String email = "admin@example.com";
        AdminRoleRequestResponse responseDto = AdminRoleRequestResponse.builder()
                .requestId(1)
                .userName("Test Agent")
                .requestedRole(Role.AGENT)
                .status(AccountStatus.REJECTED)
                .build();

        when(jwtService.extractUsername("token")).thenReturn(email);
        when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        when(adminRoleRequestService.rejectRoleRequest(email, 1, "Incomplete docs", "127.0.0.1")).thenReturn(responseDto);

        java.util.Map<String, String> body = java.util.Map.of("remarks", "Incomplete docs");
        ResponseEntity<?> response = adminRoleRequestController.rejectRoleRequestPut(authHeader, 1, body, httpServletRequest);

        Assertions.assertNotNull(response);
        Assertions.assertEquals(200, response.getStatusCode().value());
        Assertions.assertEquals(AccountStatus.REJECTED, ((AdminRoleRequestResponse) response.getBody()).getStatus());
    }
}
