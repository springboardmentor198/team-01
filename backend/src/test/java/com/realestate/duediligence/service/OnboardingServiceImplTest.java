package com.realestate.duediligence.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.realestate.duediligence.dto.ProfileCompletionRequest;
import com.realestate.duediligence.dto.ProfileCompletionResponse;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class OnboardingServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OnboardingServiceImpl onboardingService;

    @Test
    void completesBuyerOnboarding() {
        User user = User.builder()
                .userId(1)
                .email("buyer@example.com")
                .role(Role.BUYER)
                .status(AccountStatus.ACTIVE)
                .profileCompleted(false)
                .build();
        ProfileCompletionRequest request = new ProfileCompletionRequest();
        request.setAccountType(Role.BUYER);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProfileCompletionResponse response = onboardingService.completeProfile(user.getEmail(), request);

        assertTrue(user.getProfileCompleted());
        assertEquals(AccountStatus.ACTIVE, user.getStatus());
        assertEquals("Open Buyer Dashboard", response.getNextStep());
    }
}
