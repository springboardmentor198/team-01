package com.realestate.duediligence.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.realestate.duediligence.dto.support.CreateSupportTicketRequest;
import com.realestate.duediligence.dto.support.SupportTicketResponse;
import com.realestate.duediligence.dto.support.TicketReplyRequest;
import com.realestate.duediligence.dto.support.UpdateTicketStatusRequest;
import com.realestate.duediligence.enums.TicketPriority;
import com.realestate.duediligence.enums.TicketStatus;

public interface SupportTicketService {

    SupportTicketResponse createTicket(
            String userEmail,
            CreateSupportTicketRequest request
    );

    Page<SupportTicketResponse> getTickets(
            String adminEmail,
            String search,
            TicketStatus status,
            TicketPriority priority,
            Pageable pageable
    );

    SupportTicketResponse getTicketById(
            String adminEmail,
            Long ticketId
    );

    SupportTicketResponse assignTicket(
            String adminEmail,
            Long ticketId,
            Integer assignedAdminId
    );

    SupportTicketResponse replyToTicket(
            String adminEmail,
            Long ticketId,
            TicketReplyRequest request
    );
    SupportTicketResponse updateTicketStatus(
        String adminEmail,
        Long ticketId,
        UpdateTicketStatusRequest request
);
}