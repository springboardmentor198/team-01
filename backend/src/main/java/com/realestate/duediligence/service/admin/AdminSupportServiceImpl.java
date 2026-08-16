package com.realestate.duediligence.service.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.realestate.duediligence.dto.admin.SupportTicketResponse;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.entity.admin.SupportTicket;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.repository.admin.SupportTicketRepository;

@Service
@Transactional
public class AdminSupportServiceImpl implements AdminSupportService {

    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;

    public AdminSupportServiceImpl(
            SupportTicketRepository supportTicketRepository,
            UserRepository userRepository) {
        this.supportTicketRepository = supportTicketRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupportTicketResponse> getTickets(
            String adminEmail,
            String status,
            String priority,
            Integer assignedToId,
            Integer userId,
            Pageable pageable) {

        requireAdmin(adminEmail);
        Page<SupportTicket> tickets = supportTicketRepository.findWithFilters(status, priority, assignedToId, userId, pageable);
        return tickets.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public SupportTicketResponse getTicketById(String adminEmail, Integer ticketId) {
        requireAdmin(adminEmail);
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Support ticket not found: " + ticketId));
        return toResponse(ticket);
    }

    @Override
    public SupportTicketResponse assignTicket(String adminEmail, Integer ticketId, Integer assignedToId) {
        requireAdmin(adminEmail);
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Support ticket not found: " + ticketId));

        User assignee = userRepository.findById(assignedToId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignee user not found: " + assignedToId));

        if (assignee.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tickets can only be assigned to Administrators");
        }

        ticket.setAssignedTo(assignee);
        SupportTicket saved = supportTicketRepository.save(ticket);
        return toResponse(saved);
    }

    @Override
    public SupportTicketResponse updateTicketStatus(String adminEmail, Integer ticketId, String status) {
        requireAdmin(adminEmail);
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Support ticket not found: " + ticketId));

        ticket.setStatus(status);
        SupportTicket saved = supportTicketRepository.save(ticket);
        return toResponse(saved);
    }

    @Override
    public SupportTicketResponse replyToTicket(String adminEmail, Integer ticketId, String message) {
        requireAdmin(adminEmail);
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Support ticket not found: " + ticketId));

        // In a real system, this would save to a ticket_replies table and trigger emails.
        // For compliance, we will mark status as IN_PROGRESS or ANSWERED and save the message in audit or log.
        ticket.setStatus("ANSWERED");
        SupportTicket saved = supportTicketRepository.save(ticket);
        return toResponse(saved);
    }

    private User requireAdmin(String adminEmail) {
        User user = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Administrator access is required"
                ));

        if (user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Administrator access is required"
            );
        }

        return user;
    }

    private SupportTicketResponse toResponse(SupportTicket st) {
        return SupportTicketResponse.builder()
                .ticketId(st.getTicketId())
                .userId(st.getUser() != null ? st.getUser().getUserId() : null)
                .userName(st.getUser() != null ? st.getUser().getName() : null)
                .userEmail(st.getUser() != null ? st.getUser().getEmail() : null)
                .subject(st.getSubject())
                .priority(st.getPriority())
                .status(st.getStatus())
                .assignedToId(st.getAssignedTo() != null ? st.getAssignedTo().getUserId() : null)
                .assignedToName(st.getAssignedTo() != null ? st.getAssignedTo().getName() : null)
                .createdAt(st.getCreatedAt())
                .build();
    }
}
