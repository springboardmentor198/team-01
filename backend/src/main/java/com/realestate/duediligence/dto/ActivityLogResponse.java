package com.realestate.duediligence.dto;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivityLogResponse {

    private Integer id;

    private String activityType;

    private String description;

    private String performedBy;

    private LocalDateTime createdAt;
}