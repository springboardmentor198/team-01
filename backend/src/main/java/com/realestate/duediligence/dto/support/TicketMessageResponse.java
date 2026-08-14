package com.realestate.duediligence.dto.support;

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
public class TicketMessageResponse {

    private Long messageId;

    private Integer senderId;

    private String senderName;

    private String senderEmail;

    private String message;

    private LocalDateTime createdAt;
}