package com.realestate.duediligence.dto.support;

import java.time.LocalDateTime;
import java.util.List;

import com.realestate.duediligence.enums.TicketPriority;
import com.realestate.duediligence.enums.TicketStatus;

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

    private Long ticketId;

    private Integer userId;

    private String userName;

    private String userEmail;

    private String subject;

    private String description;

    private TicketPriority priority;

    private TicketStatus status;

    private Integer assignedAdminId;

    private String assignedAdminName;

    private String assignedAdminEmail;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime resolvedAt;

    private List<TicketMessageResponse> messages;
}