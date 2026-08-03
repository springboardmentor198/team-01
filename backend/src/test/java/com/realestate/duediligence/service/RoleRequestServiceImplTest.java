package com.realestate.duediligence.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.realestate.duediligence.dto.RoleRequestRequest;
import com.realestate.duediligence.dto.RoleRequestResponse;
import com.realestate.duediligence.entity.RoleRequest;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.repository.RoleRequestRepository;
import com.realestate.duediligence.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class RoleRequestServiceImplTest {

    @Mock
    private RoleRequestRepository roleRequestRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private RoleRequestServiceImpl roleRequestService;

    @Test
    void createsPendingProfessionalVerificationRequestWithoutChangingUser() {
        User user = User.builder()
                .userId(1)
                .email("buyer@example.com")
                .role(Role.BUYER)
                .status(AccountStatus.ACTIVE)
                .profileCompleted(false)
                .build();
        RoleRequestRequest request = validRequest();

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(roleRequestRepository.existsByUserAndStatus(user, AccountStatus.PENDING)).thenReturn(false);
        when(roleRequestRepository.save(any(RoleRequest.class))).thenAnswer(invocation -> {
            RoleRequest savedRequest = invocation.getArgument(0);
            savedRequest.setId(1);
            savedRequest.setCreatedAt(LocalDateTime.now());
            savedRequest.setUpdatedAt(LocalDateTime.now());
            return savedRequest;
        });

        RoleRequestResponse response = roleRequestService.createRoleRequest(user.getEmail(), request);

        assertEquals(AccountStatus.PENDING, response.getStatus());
        assertEquals(Role.AGENT, response.getRequestedRole());
        assertEquals(Role.BUYER, user.getRole());
        assertFalse(user.getProfileCompleted());
    }

    @Test
    void rejectsDuplicatePendingRoleRequest() {
        User user = User.builder().userId(1).email("buyer@example.com").build();

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(roleRequestRepository.existsByUserAndStatus(user, AccountStatus.PENDING)).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> roleRequestService.createRoleRequest(user.getEmail(), validRequest()));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    private RoleRequestRequest validRequest() {
        RoleRequestRequest request = new RoleRequestRequest();
        request.setRequestedRole(Role.AGENT);
        request.setCompanyName("Example Realty");
        request.setCompanyEmail("verification@example.com");
        request.setLicenseNumber("LIC-100");
        request.setYearsOfExperience(5);
        request.setDocumentName("license.pdf");
        request.setDocumentPath("/uploads/license.pdf");
        request.setDocumentMimeType("application/pdf");
        request.setDocumentSize(1024L);
        return request;
    }
}
