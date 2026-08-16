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
public class SupportTicketResponse {
    private Integer ticketId;
    private Integer userId;
    private String userName;
    private String userEmail;
    private String subject;
    private String priority;
    private String status;
    private Integer assignedToId;
    private String assignedToName;
    private LocalDateTime createdAt;
}
