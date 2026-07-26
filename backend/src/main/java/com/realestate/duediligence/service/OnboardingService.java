package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.ProfileCompletionRequest;
import com.realestate.duediligence.dto.ProfileCompletionResponse;

public interface OnboardingService {

    ProfileCompletionResponse completeProfile(String email, ProfileCompletionRequest request);
}
