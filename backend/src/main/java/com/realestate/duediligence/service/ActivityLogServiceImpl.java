package com.realestate.duediligence.service;
import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.ActivityLogResponse;
import com.realestate.duediligence.repository.ActivityLogRepository;
@Service
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository repository;

    public ActivityLogServiceImpl(ActivityLogRepository repository){
        this.repository = repository;
    }

    @Override
    public List<ActivityLogResponse> getActivityLogs(Integer propertyId){

        return repository
                .findByProperty_PropertyIdOrderByCreatedAtDesc(propertyId)
                .stream()
                .map(log->ActivityLogResponse.builder()
                        .id(log.getActivityId())
                        .activityType(log.getActivityType())
                        .description(log.getDescription())
                        .performedBy(log.getPerformedBy())
                        .createdAt(log.getCreatedAt())
                        .build())
                .toList();

    }

}