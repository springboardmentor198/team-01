package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.ProfileCompletionRequest;
import com.realestate.duediligence.dto.ProfileCompletionResponse;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class OnboardingServiceImpl implements OnboardingService {

    private final UserRepository userRepository;

    public OnboardingServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public ProfileCompletionResponse completeProfile(String email, ProfileCompletionRequest request) {
        if (request == null || request.getAccountType() == null) {
            throw new IllegalArgumentException("Account type is required");
        }

        Role accountType = request.getAccountType();
        if (accountType == Role.ADMIN) {
            throw new IllegalArgumentException("ADMIN is not a valid onboarding account type");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        if (accountType == Role.BUYER) {
            user.setProfileCompleted(true);
            user.setStatus(AccountStatus.ACTIVE);
            User savedUser = userRepository.save(user);

            return new ProfileCompletionResponse(
                    "Buyer onboarding completed successfully",
                    "Open Buyer Dashboard",
                    savedUser.getProfileCompleted(),
                    savedUser.getRole()
            );
        }

        if (accountType == Role.AGENT
                || accountType == Role.LEGAL_REVIEWER
                || accountType == Role.BANK) {
            return new ProfileCompletionResponse(
                    "Verification required",
                    "Submit Professional Verification via /api/role-request",
                    user.getProfileCompleted(),
                    user.getRole()
            );
        }

        throw new IllegalArgumentException("Unsupported onboarding account type");
    }
}
