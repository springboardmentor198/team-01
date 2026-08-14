package com.realestate.duediligence.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.realestate.duediligence.dto.support.CreateSupportTicketRequest;
import com.realestate.duediligence.dto.support.SupportTicketResponse;
import com.realestate.duediligence.dto.support.TicketMessageResponse;
import com.realestate.duediligence.dto.support.TicketReplyRequest;
import com.realestate.duediligence.dto.support.UpdateTicketStatusRequest;
import com.realestate.duediligence.entity.SupportTicket;
import com.realestate.duediligence.entity.TicketMessage;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.enums.NotificationPriority;
import com.realestate.duediligence.enums.NotificationType;
import com.realestate.duediligence.enums.TicketPriority;
import com.realestate.duediligence.enums.TicketStatus;
import com.realestate.duediligence.exception.ResourceNotFoundException;
import com.realestate.duediligence.notification.NotificationCommand;
import com.realestate.duediligence.repository.SupportTicketRepository;
import com.realestate.duediligence.repository.TicketMessageRepository;
import com.realestate.duediligence.repository.UserRepository;

@Service
@Transactional(readOnly = true)
public class SupportTicketServiceImpl implements SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final TicketMessageRepository ticketMessageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public SupportTicketServiceImpl(
            SupportTicketRepository supportTicketRepository,
            TicketMessageRepository ticketMessageRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.supportTicketRepository = supportTicketRepository;
        this.ticketMessageRepository = ticketMessageRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // ============================================================
    // CREATE SUPPORT TICKET
    // ============================================================

    @Override
    @Transactional
    public SupportTicketResponse createTicket(
            String userEmail,
            CreateSupportTicketRequest request) {

        // Find logged-in user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        // Create ticket
        SupportTicket ticket = SupportTicket.builder()
                .user(user)
                .subject(request.getSubject())
                .description(request.getDescription())
                .priority(
                        request.getPriority() != null
                                ? request.getPriority()
                                : TicketPriority.MEDIUM
                )
                .status(TicketStatus.OPEN)
                .build();

        // Save ticket
        SupportTicket savedTicket =
                supportTicketRepository.save(ticket);

        // Return response
        return toResponseWithoutMessages(savedTicket);
    }

    // ============================================================
    // GET ALL SUPPORT TICKETS
    // ============================================================

    @Override
    public Page<SupportTicketResponse> getTickets(
            String adminEmail,
            String search,
            TicketStatus status,
            TicketPriority priority,
            Pageable pageable) {

        // Only ADMIN can access
        validateAdmin(adminEmail);

        Specification<SupportTicket> specification =
                Specification.allOf();

        // Search
        if (search != null && !search.trim().isEmpty()) {

            String searchValue =
                    "%" + search.trim().toLowerCase() + "%";

            specification = specification.and(
                    (root, query, cb) ->
                            cb.or(

                                    cb.like(
                                            cb.lower(
                                                    root.get("subject")
                                            ),
                                            searchValue
                                    ),

                                    cb.like(
                                            cb.lower(
                                                    root.get("description")
                                            ),
                                            searchValue
                                    ),

                                    cb.like(
                                            cb.lower(
                                                    root.get("user")
                                                    .get("name")
                                            ),
                                            searchValue
                                    ),

                                    cb.like(
                                            cb.lower(
                                                    root.get("user")
                                                    .get("email")
                                            ),
                                            searchValue
                                    )
                            )
            );
        }

        // Status filter
        if (status != null) {

            specification = specification.and(
                    (root, query, cb) ->
                            cb.equal(
                                    root.get("status"),
                                    status
                            )
            );
        }

        // Priority filter
        if (priority != null) {

            specification = specification.and(
                    (root, query, cb) ->
                            cb.equal(
                                    root.get("priority"),
                                    priority
                            )
            );
        }

        // Get paginated tickets
        Page<SupportTicket> tickets =
                supportTicketRepository.findAll(
                        specification,
                        pageable
                );

        // Convert entity -> DTO
        return tickets.map(
                this::toResponseWithoutMessages
        );
    }

    // ============================================================
    // GET SINGLE SUPPORT TICKET
    // ============================================================

    @Override
    public SupportTicketResponse getTicketById(
            String adminEmail,
            Long ticketId) {

        // Only ADMIN can access
        validateAdmin(adminEmail);

        // Find ticket
        SupportTicket ticket =
                supportTicketRepository.findById(ticketId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Support ticket not found with id: "
                                                + ticketId
                                )
                        );

        // Return ticket with messages
        return toResponseWithMessages(ticket);
    }

    // ============================================================
    // ASSIGN TICKET TO ADMIN
    // ============================================================

    @Override
    @Transactional
    public SupportTicketResponse assignTicket(
            String adminEmail,
            Long ticketId,
            Integer assignedAdminId) {

        // Check requester
        validateAdmin(adminEmail);

        // Find ticket
        SupportTicket ticket =
                supportTicketRepository.findById(ticketId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Support ticket not found with id: "
                                                + ticketId
                                )
                        );

        // Find admin
        User assignedAdmin =
                userRepository.findById(assignedAdminId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Admin user not found with id: "
                                                + assignedAdminId
                                )
                        );

        // Check role
        if (assignedAdmin.getRole() != Role.ADMIN) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ticket can only be assigned to an ADMIN"
            );
        }

        // Assign admin
        ticket.setAssignedAdmin(assignedAdmin);

        // Save
        SupportTicket updatedTicket =
                supportTicketRepository.save(ticket);

        // Return updated ticket
        return toResponseWithMessages(updatedTicket);
    }

    // ============================================================
    // ADMIN REPLY TO TICKET
    // ============================================================

    @Override
    @Transactional
    public SupportTicketResponse replyToTicket(
            String adminEmail,
            Long ticketId,
            TicketReplyRequest request) {

        // Check requester is ADMIN
        validateAdmin(adminEmail);

        // Find ticket
        SupportTicket ticket =
                supportTicketRepository.findById(ticketId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Support ticket not found with id: "
                                                + ticketId
                                )
                        );

        // Find admin
        User admin =
                userRepository.findByEmail(adminEmail)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Admin user not found"
                                )
                        );

        // Create message
        TicketMessage message =
                TicketMessage.builder()
                        .ticket(ticket)
                        .sender(admin)
                        .message(request.getMessage())
                        .build();

        // Save message
        ticketMessageRepository.save(message);

        // Notify the ticket owner so the reply appears in their notification inbox.
        notificationService.notifyUser(NotificationCommand.builder()
                .recipientId(ticket.getUser().getUserId())
                .senderId(admin.getUserId())
                .title("Support replied to your request")
                .message("Support replied to ticket #" + ticket.getTicketId()
                        + ": " + request.getMessage())
                .type(NotificationType.SUPPORT_TICKET_REPLY)
                .priority(NotificationPriority.MEDIUM)
                .actionUrl("/notifications")
                .metadata("{\"ticketId\":" + ticket.getTicketId() + "}")
                .build());

        // Return ticket with messages
        return toResponseWithMessages(ticket);
    }
    // ============================================================
// UPDATE TICKET STATUS
// ============================================================

@Override
@Transactional
public SupportTicketResponse updateTicketStatus(
        String adminEmail,
        Long ticketId,
        UpdateTicketStatusRequest request) {

    // 1. Verify admin
    validateAdmin(adminEmail);

    // 2. Validate request
    if (request == null || request.getStatus() == null) {
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST,
                "Status is required"
        );
    }

    // 3. Find ticket
    SupportTicket ticket =
            supportTicketRepository.findById(ticketId)
                    .orElseThrow(
                            () -> new ResourceNotFoundException(
                                    "Support ticket not found with id: "
                                            + ticketId
                            )
                    );

    // 4. Update status
    TicketStatus newStatus = request.getStatus();

    ticket.setStatus(newStatus);

    // 5. Handle resolvedAt correctly
    if (newStatus == TicketStatus.RESOLVED
            || newStatus == TicketStatus.CLOSED) {

        if (ticket.getResolvedAt() == null) {
            ticket.setResolvedAt(java.time.LocalDateTime.now());
        }

    } else {

        // OPEN / IN_PROGRESS / WAITING_FOR_USER
        ticket.setResolvedAt(null);
    }

    // 6. Save
    SupportTicket updatedTicket =
            supportTicketRepository.save(ticket);

    // 7. Return updated ticket with messages
    return toResponseWithMessages(updatedTicket);
}

    // ============================================================
    // VALIDATE ADMIN
    // ============================================================

    private void validateAdmin(String adminEmail) {

        User admin =
                userRepository.findByEmail(adminEmail)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Admin user not found"
                                )
                        );

        if (admin.getRole() != Role.ADMIN) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only administrators can access support tickets"
            );
        }
    }

    // ============================================================
    // ENTITY -> RESPONSE WITHOUT MESSAGES
    // ============================================================

    private SupportTicketResponse toResponseWithoutMessages(
            SupportTicket ticket) {

        User user = ticket.getUser();
        User assignedAdmin = ticket.getAssignedAdmin();

        return SupportTicketResponse.builder()

                .ticketId(ticket.getTicketId())

                // User
                .userId(
                        user != null
                                ? user.getUserId()
                                : null
                )

                .userName(
                        user != null
                                ? user.getName()
                                : null
                )

                .userEmail(
                        user != null
                                ? user.getEmail()
                                : null
                )

                // Ticket
                .subject(ticket.getSubject())

                .description(ticket.getDescription())

                .priority(ticket.getPriority())

                .status(ticket.getStatus())

                // Assigned admin
                .assignedAdminId(
                        assignedAdmin != null
                                ? assignedAdmin.getUserId()
                                : null
                )

                .assignedAdminName(
                        assignedAdmin != null
                                ? assignedAdmin.getName()
                                : null
                )

                .assignedAdminEmail(
                        assignedAdmin != null
                                ? assignedAdmin.getEmail()
                                : null
                )

                // Dates
                .createdAt(ticket.getCreatedAt())

                .updatedAt(ticket.getUpdatedAt())

                .resolvedAt(ticket.getResolvedAt())

                // No messages for list
                .messages(new ArrayList<>())

                .build();
    }

    // ============================================================
    // ENTITY -> RESPONSE WITH MESSAGES
    // ============================================================

    private SupportTicketResponse toResponseWithMessages(
            SupportTicket ticket) {

        SupportTicketResponse response =
                toResponseWithoutMessages(ticket);

        List<TicketMessage> messages =
                ticketMessageRepository
                        .findByTicketTicketIdOrderByCreatedAtAsc(
                                ticket.getTicketId()
                        );

        List<TicketMessageResponse> messageResponses =
                messages.stream()
                        .map(this::toMessageResponse)
                        .toList();

        response.setMessages(messageResponses);

        return response;
    }

    // ============================================================
    // TICKET MESSAGE -> RESPONSE
    // ============================================================

    private TicketMessageResponse toMessageResponse(
            TicketMessage message) {

        User sender = message.getSender();

        return TicketMessageResponse.builder()

                .messageId(message.getMessageId())

                .senderId(
                        sender != null
                                ? sender.getUserId()
                                : null
                )

                .senderName(
                        sender != null
                                ? sender.getName()
                                : null
                )

                .senderEmail(
                        sender != null
                                ? sender.getEmail()
                                : null
                )

                .message(message.getMessage())

                .createdAt(message.getCreatedAt())

                .build();
    }
}
