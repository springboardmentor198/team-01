package com.realestate.duediligence.service.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.realestate.duediligence.dto.admin.SupportTicketResponse;

public interface AdminSupportService {
    Page<SupportTicketResponse> getTickets(
            String adminEmail,
            String status,
            String priority,
            Integer assignedToId,
            Integer userId,
            Pageable pageable);

    SupportTicketResponse getTicketById(String adminEmail, Integer ticketId);

    SupportTicketResponse assignTicket(String adminEmail, Integer ticketId, Integer assignedToId);

    SupportTicketResponse updateTicketStatus(String adminEmail, Integer ticketId, String status);

    SupportTicketResponse replyToTicket(String adminEmail, Integer ticketId, String message);
}
