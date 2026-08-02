package com.realestate.duediligence.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.PermitRequest;
import com.realestate.duediligence.dto.PermitResponse;
import com.realestate.duediligence.entity.ActivityLog;
import com.realestate.duediligence.entity.PermitRecord;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.exception.ResourceNotFoundException;
import com.realestate.duediligence.repository.PermitRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.ActivityLogRepository;

@Service
public class PermitServiceImpl implements PermitService {

    private final PermitRepository repository;
    private final PropertyRepository propertyRepository;
    private final ActivityLogRepository activityLogRepository;

    public PermitServiceImpl(PermitRepository repository,
                             PropertyRepository propertyRepository,
                             ActivityLogRepository activityLogRepository) {
        this.repository = repository;
        this.propertyRepository = propertyRepository;
        this.activityLogRepository = activityLogRepository;
    }

    @Override
    public PermitResponse createPermit(PermitRequest request) {

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        PermitRecord permit = PermitRecord.builder()
                .property(property)
                .permitType(request.getPermitType())
                .issuingAuthority(request.getIssuingAuthority())
                .issueDate(request.getIssueDate())
                .expiryDate(request.getExpiryDate())
                .status(request.getStatus())
                .remarks(request.getRemarks())
                .createdAt(LocalDateTime.now())
                .build();

        repository.save(permit);

        // Activity log now correctly fires on CREATE, using the real permit data
        activityLogRepository.save(
                ActivityLog.builder()
                        .property(permit.getProperty())
                        .activityType("PERMIT_ADDED")
                        .description("Permit '" + permit.getPermitType() + "' added with status "
                                + permit.getStatus() + ".")
                        .performedBy("System")
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        return mapToResponse(permit);
    }

    @Override
    public List<PermitResponse> getPermits(Integer propertyId) {

        return repository.findByProperty_PropertyId(propertyId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PermitResponse updatePermit(Integer id, PermitRequest request) {

        PermitRecord permit = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permit not found"));

        permit.setPermitType(request.getPermitType());
        permit.setIssuingAuthority(request.getIssuingAuthority());
        permit.setIssueDate(request.getIssueDate());
        permit.setExpiryDate(request.getExpiryDate());
        permit.setStatus(request.getStatus());
        permit.setRemarks(request.getRemarks());

        repository.save(permit);

        // Activity log now correctly reflects an UPDATE, not a fake "approved" creation event
        activityLogRepository.save(
                ActivityLog.builder()
                        .property(permit.getProperty())
                        .activityType("PERMIT_UPDATED")
                        .description("Permit '" + permit.getPermitType() + "' updated. New status: "
                                + permit.getStatus() + ".")
                        .performedBy("System")
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        return mapToResponse(permit);
    }

    @Override
    public void deletePermit(Integer id) {

        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Permit not found");
        }
        repository.deleteById(id);

    }

    private PermitResponse mapToResponse(PermitRecord permit) {

        return PermitResponse.builder()
                .id(permit.getId())
                .propertyId(permit.getProperty().getPropertyId())
                .permitType(permit.getPermitType())
                .issuingAuthority(permit.getIssuingAuthority())
                .issueDate(permit.getIssueDate())
                .expiryDate(permit.getExpiryDate())
                .status(permit.getStatus())
                .remarks(permit.getRemarks())
                .build();
    }
}
