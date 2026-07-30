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
                .orElseThrow(() -> new RuntimeException("Property not found"));

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
                .orElseThrow(() -> new RuntimeException("Permit not found"));

        permit.setPermitType(request.getPermitType());
        permit.setIssuingAuthority(request.getIssuingAuthority());
        permit.setIssueDate(request.getIssueDate());
        permit.setExpiryDate(request.getExpiryDate());
        permit.setStatus(request.getStatus());
        permit.setRemarks(request.getRemarks());

        repository.save(permit);

        activityLogRepository.save(
    ActivityLog.builder()
        .property(permit.getProperty())
        .activityType("PERMIT_ADDED")
        .description("Building permit approved.")
        .performedBy("Legal Reviewer")
        .createdAt(LocalDateTime.now())
        .build()
);

        return mapToResponse(permit);
    }

    @Override
    public void deletePermit(Integer id) {

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