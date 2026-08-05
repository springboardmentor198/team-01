package com.realestate.duediligence.service;

import java.util.List;

import com.realestate.duediligence.dto.ActivityLogResponse;

public interface ActivityLogService {

    List<ActivityLogResponse> getActivityLogs(Integer propertyId);

    List<ActivityLogResponse> getAllActivityLogs();

}