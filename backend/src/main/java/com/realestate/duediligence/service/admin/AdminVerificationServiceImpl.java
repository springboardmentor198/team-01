package com.realestate.duediligence.service.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.realestate.duediligence.dto.admin.VerificationRecordResponse;
import com.realestate.duediligence.dto.admin.VerificationSummaryResponse;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.entity.admin.VerificationRecord;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.repository.admin.VerificationRecordRepository;

@Service
@Transactional(readOnly = true)
public class AdminVerificationServiceImpl implements AdminVerificationService {

    private final VerificationRecordRepository verificationRecordRepository;
    private final UserRepository userRepository;

    public AdminVerificationServiceImpl(
            VerificationRecordRepository verificationRecordRepository,
            UserRepository userRepository) {
        this.verificationRecordRepository = verificationRecordRepository;
        this.userRepository = userRepository;
    }

    @Override
    public VerificationSummaryResponse getSummary(String adminEmail) {
        requireAdmin(adminEmail);

        long total = verificationRecordRepository.count();
        long approved = verificationRecordRepository.countByStatus("APPROVED");
        long pending = verificationRecordRepository.countByStatus("PENDING");
        long rejected = verificationRecordRepository.countByStatus("REJECTED");

        return VerificationSummaryResponse.builder()
                .totalVerifications(total)
                .approvedVerifications(approved)
                .pendingVerifications(pending)
                .rejectedVerifications(rejected)
                .build();
    }

    @Override
    public Page<VerificationRecordResponse> getVerifications(
            String adminEmail,
            String status,
            String type,
            Integer verifierId,
            Integer propertyId,
            Pageable pageable) {

        requireAdmin(adminEmail);
        Page<VerificationRecord> records = verificationRecordRepository.findWithFilters(status, type, verifierId, propertyId, pageable);
        return records.map(this::toResponse);
    }

    @Override
    public VerificationRecordResponse getVerificationById(String adminEmail, Integer verificationId) {
        requireAdmin(adminEmail);
        VerificationRecord record = verificationRecordRepository.findById(verificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Verification record not found: " + verificationId));
        return toResponse(record);
    }

    private User requireAdmin(String adminEmail) {
        User user = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Administrator access is required"
                ));

        if (user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Administrator access is required"
            );
        }

        return user;
    }

    private VerificationRecordResponse toResponse(VerificationRecord record) {
        return VerificationRecordResponse.builder()
                .verificationId(record.getVerificationId())
                .propertyId(record.getProperty() != null ? record.getProperty().getPropertyId() : null)
                .propertyTitle(record.getProperty() != null ? record.getProperty().getPropertyCode() : null)
                .verifierId(record.getVerifier() != null ? record.getVerifier().getUserId() : null)
                .verifierName(record.getVerifier() != null ? record.getVerifier().getName() : null)
                .type(record.getType())
                .status(record.getStatus())
                .remarks(record.getRemarks())
                .verifiedAt(record.getVerifiedAt())
                .build();
    }
}
