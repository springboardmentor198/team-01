package com.realestate.duediligence.service.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.realestate.duediligence.dto.admin.VerificationRecordResponse;
import com.realestate.duediligence.dto.admin.VerificationSummaryResponse;

public interface AdminVerificationService {
    VerificationSummaryResponse getSummary(String adminEmail);

    Page<VerificationRecordResponse> getVerifications(
            String adminEmail,
            String status,
            String type,
            Integer verifierId,
            Integer propertyId,
            Pageable pageable);

    VerificationRecordResponse getVerificationById(String adminEmail, Integer verificationId);
}
