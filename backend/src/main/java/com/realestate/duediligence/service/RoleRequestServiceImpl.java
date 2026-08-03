package com.realestate.duediligence.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.realestate.duediligence.dto.RoleRequestRequest;
import com.realestate.duediligence.dto.RoleRequestResponse;
import com.realestate.duediligence.entity.RoleRequest;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.exception.BadRequestException;
import com.realestate.duediligence.exception.ResourceNotFoundException;
import com.realestate.duediligence.repository.RoleRequestRepository;
import com.realestate.duediligence.repository.UserRepository;

@Service
public class RoleRequestServiceImpl implements RoleRequestService {

    private final RoleRequestRepository roleRequestRepository;
    private final UserRepository userRepository;

    public RoleRequestServiceImpl(RoleRequestRepository roleRequestRepository,
                                  UserRepository userRepository) {
        this.roleRequestRepository = roleRequestRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public RoleRequestResponse createRoleRequest(String email, RoleRequestRequest request) {
        if (request == null || request.getRequestedRole() == null) {
            throw new BadRequestException("Requested role is required");
        }

        validateRequestedRole(request.getRequestedRole());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (roleRequestRepository.existsByUserAndStatus(user, AccountStatus.PENDING)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A pending role request already exists for this user");
        }

        RoleRequest roleRequest = RoleRequest.builder()
                .user(user)
                .requestedRole(request.getRequestedRole())
                .companyName(request.getCompanyName())
                .companyEmail(request.getCompanyEmail())
                .licenseNumber(request.getLicenseNumber())
                .yearsOfExperience(request.getYearsOfExperience())
                .documentName(request.getDocumentName())
                .documentPath(request.getDocumentPath())
                .documentMimeType(request.getDocumentMimeType())
                .documentSize(request.getDocumentSize())
                .status(AccountStatus.PENDING)
                .build();

        return toResponse(roleRequestRepository.save(roleRequest));
    }

    private void validateRequestedRole(Role requestedRole) {
        if (requestedRole != Role.AGENT
                && requestedRole != Role.LEGAL_REVIEWER
                && requestedRole != Role.BANK) {
            throw new BadRequestException("Only AGENT, LEGAL_REVIEWER, and BANK can request verification");
        }
    }

    private RoleRequestResponse toResponse(RoleRequest roleRequest) {
        return RoleRequestResponse.builder()
                .id(roleRequest.getId())
                .userId(roleRequest.getUser().getUserId())
                .requestedRole(roleRequest.getRequestedRole())
                .companyName(roleRequest.getCompanyName())
                .companyEmail(roleRequest.getCompanyEmail())
                .licenseNumber(roleRequest.getLicenseNumber())
                .yearsOfExperience(roleRequest.getYearsOfExperience())
                .documentName(roleRequest.getDocumentName())
                .documentPath(roleRequest.getDocumentPath())
                .documentMimeType(roleRequest.getDocumentMimeType())
                .documentSize(roleRequest.getDocumentSize())
                .status(roleRequest.getStatus())
                .remarks(roleRequest.getRemarks())
                .createdAt(roleRequest.getCreatedAt())
                .updatedAt(roleRequest.getUpdatedAt())
                .build();
    }
}
