package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.ActivityLogResponse;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.ActivityLogService;
import com.realestate.duediligence.util.JwtService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class AuditControllerTest {

    @Mock
    private ActivityLogService activityLogService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuditController auditController;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetAuditLogs_Success() {
        // Arrange
        String authHeader = "Bearer mock-token";
        String email = "admin@example.com";
        User mockUser = User.builder()
                .userId(1)
                .email(email)
                .name("Admin User")
                .role(com.realestate.duediligence.enums.Role.ADMIN)
                .build();

        List<ActivityLogResponse> mockLogs = new ArrayList<>();
        mockLogs.add(ActivityLogResponse.builder()
                .id(1)
                .activityType("PROPERTY_CREATED")
                .description("Test Description")
                .performedBy("System")
                .createdAt(LocalDateTime.now())
                .build());

        Mockito.when(jwtService.extractUsername("mock-token")).thenReturn(email);
        Mockito.when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        Mockito.when(activityLogService.getAllActivityLogs()).thenReturn(mockLogs);

        // Act
        ResponseEntity<List<ActivityLogResponse>> response = auditController.getAuditLogs(authHeader);

        // Assert
        Assertions.assertNotNull(response);
        Assertions.assertEquals(200, response.getStatusCode().value());
        Assertions.assertEquals(1, response.getBody().size());
        Assertions.assertEquals("PROPERTY_CREATED", response.getBody().get(0).getActivityType());
    }

    @Test
    public void testGetAuditLogs_MissingHeader() {
        // Act & Assert
        Assertions.assertThrows(ResponseStatusException.class, () -> {
            auditController.getAuditLogs(null);
        });
    }

    @Test
    public void testGetAuditLogs_InvalidHeader() {
        // Act & Assert
        Assertions.assertThrows(ResponseStatusException.class, () -> {
            auditController.getAuditLogs("InvalidHeaderFormat");
        });
    }

    @Test
    public void testGetAuditLogs_UserNotFound() {
        // Arrange
        String authHeader = "Bearer mock-token";
        String email = "unknown@example.com";

        Mockito.when(jwtService.extractUsername("mock-token")).thenReturn(email);
        Mockito.when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act & Assert
        Assertions.assertThrows(ResponseStatusException.class, () -> {
            auditController.getAuditLogs(authHeader);
        });
    }

    @Test
    public void testGetAuditLogs_TokenVerificationFailed() {
        // Arrange
        String authHeader = "Bearer mock-token";

        Mockito.when(jwtService.extractUsername("mock-token")).thenThrow(new RuntimeException("Expired token"));

        // Act & Assert
        Assertions.assertThrows(ResponseStatusException.class, () -> {
            auditController.getAuditLogs(authHeader);
        });
    }
}
