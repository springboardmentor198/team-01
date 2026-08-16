package com.realestate.duediligence.service;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.ActivityLogResponse;
import com.realestate.duediligence.entity.ActivityLog;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.repository.ActivityLogRepository;
import com.realestate.duediligence.repository.PropertyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final PropertyRepository propertyRepository;

    @Override
    public List<ActivityLogResponse> getActivityLogs(Integer propertyId) {

        return activityLogRepository
                .findByProperty_PropertyIdOrderByCreatedAtDesc(propertyId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<ActivityLogResponse> getAllActivityLogs() {

        return activityLogRepository
                .findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void recordPropertyView(Integer propertyId, String performedBy) {

        Property property = propertyRepository
                .findById(propertyId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Property not found with id: " + propertyId
                        )
                );

        var latestView = activityLogRepository
                .findFirstByProperty_PropertyIdAndPerformedByAndActivityTypeOrderByCreatedAtDesc(propertyId, performedBy, "PROPERTY_VIEW");
        if (latestView.isPresent() && latestView.get().getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(30))) {
            return;
        }

        ActivityLog activityLog = ActivityLog.builder()
                .property(property)
                .activityType("PROPERTY_VIEW")
                .description("Property viewed by buyer")
                .performedBy(performedBy)
                .createdAt(LocalDateTime.now())
                .build();

        activityLogRepository.save(activityLog);
    }

    private ActivityLogResponse toResponse(ActivityLog log) {

        return ActivityLogResponse.builder()
                .id(log.getActivityId())
                .activityType(log.getActivityType())
                .description(log.getDescription())
                .performedBy(log.getPerformedBy())
                .propertyId(log.getProperty() != null ? log.getProperty().getPropertyId() : null)
                .propertyCode(log.getProperty() != null ? log.getProperty().getPropertyCode() : null)
                .createdAt(log.getCreatedAt())
                .build();
    }
}
