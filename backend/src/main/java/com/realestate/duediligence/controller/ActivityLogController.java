package com.realestate.duediligence.controller;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.ActivityLogResponse;
import com.realestate.duediligence.service.ActivityLogService;
@RestController
@RequestMapping("/api/activity-log")
public class ActivityLogController {

    private final ActivityLogService service;

    public ActivityLogController(ActivityLogService service){
        this.service=service;
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<List<ActivityLogResponse>> getLogs(
            @PathVariable Integer propertyId){

        return ResponseEntity.ok(service.getActivityLogs(propertyId));

    }

}