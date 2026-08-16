package com.realestate.duediligence.dto.admin;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityEventResponse {
    private Integer eventId;
    private Integer userId;
    private String userName;
    private String userEmail;
    private String eventType;
    private String ipAddress;
    private String action;
    private String status;
    private LocalDateTime createdAt;
}
