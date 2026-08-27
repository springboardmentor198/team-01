package com.realestate.duediligence.listener;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.NotificationPriority;
import com.realestate.duediligence.enums.NotificationType;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.event.NotificationEvents;
import com.realestate.duediligence.notification.NotificationCommand;
import com.realestate.duediligence.service.NotificationService;

@Component
public class NotificationEventListener {

    private final NotificationService notificationService;

    public NotificationEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Async
    @EventListener
    public void onPropertyCreated(NotificationEvents.PropertyCreatedEvent event) {
        Property property = event.property();
        String propertyName = property.getPropertyCode();
        Integer propertyId = property.getPropertyId();

        notificationService.notifyAdmins(NotificationCommand.builder()
                .senderId(event.actorUserId())
                .propertyId(propertyId)
                .title("New property listed")
                .message(propertyName + " was added to the platform.")
                .type(NotificationType.PROPERTY_CREATED)
                .priority(NotificationPriority.MEDIUM)
                .actionUrl("/property-details/" + propertyId)
                .build());

        if (property.getOwner() != null) {
            notificationService.notifyOwnerFollowers(
                    property.getOwner().getUserId(),
                    event.actorUserId(),
                    NotificationCommand.builder()
                            .senderId(event.actorUserId())
                            .propertyId(propertyId)
                            .title("New listing from property owner")
                            .message("Property owner uploaded another property: " + propertyName)
                            .type(NotificationType.NEW_LISTING_BY_OWNER)
                            .priority(NotificationPriority.MEDIUM)
                            .actionUrl("/property-details/" + propertyId)
                            .build());

            if (property.getOwner().getRole() == Role.AGENT) {
                notificationService.notifyAgentFollowers(
                        property.getOwner().getUserId(),
                        event.actorUserId(),
                        NotificationCommand.builder()
                                .senderId(event.actorUserId())
                                .propertyId(propertyId)
                                .title("New listing by agent")
                                .message(property.getOwner().getName()
                                        + " uploaded a new property: "
                                        + propertyName)
                                .type(NotificationType.NEW_LISTING_BY_AGENT)
                                .priority(NotificationPriority.MEDIUM)
                                .actionUrl("/property-details/" + propertyId)
                                .build());
            }
        }
    }

    @Async
    @EventListener
    public void onPropertyUpdated(NotificationEvents.PropertyUpdatedEvent event) {
        Property property = event.property();
        Integer propertyId = property.getPropertyId();
        String propertyName = property.getPropertyCode();

        NotificationCommand base = NotificationCommand.builder()
                .senderId(event.actorUserId())
                .propertyId(propertyId)
                .title("Property updated")
                .message(propertyName + " details were updated.")
                .type(NotificationType.PROPERTY_UPDATED)
                .priority(NotificationPriority.MEDIUM)
                .actionUrl("/property-details/" + propertyId)
                .build();

        notificationService.notifyPropertyFollowers(propertyId, event.actorUserId(), base);

        if ("APPROVED".equalsIgnoreCase(event.newStatus())) {
            notificationService.notifyRole(Role.BUYER, NotificationCommand.builder()
                    .senderId(event.actorUserId())
                    .propertyId(propertyId)
                    .title("New property available")
                    .message(propertyName + " has been approved and is now available to view.")
                    .type(NotificationType.PROPERTY_UPDATED)
                    .priority(NotificationPriority.MEDIUM)
                    .actionUrl("/property/" + propertyId)
                    .build());
        }

        if (event.previousStatus() != null
                && event.newStatus() != null
                && !event.previousStatus().equalsIgnoreCase(event.newStatus())) {
            notificationService.notifyPropertyFollowers(
                    propertyId,
                    event.actorUserId(),
                    NotificationCommand.builder()
                            .senderId(event.actorUserId())
                            .propertyId(propertyId)
                            .title("Property status changed")
                            .message(propertyName + " status changed from "
                                    + event.previousStatus() + " to " + event.newStatus())
                            .type(NotificationType.PROPERTY_UPDATED)
                            .priority(NotificationPriority.HIGH)
                            .actionUrl("/property-details/" + propertyId)
                            .build());
        }
    }

    @Async
    @EventListener
    public void onPropertyDeleted(NotificationEvents.PropertyDeletedEvent event) {
        notificationService.notifyAdmins(NotificationCommand.builder()
                .senderId(event.actorUserId())
                .title("Property deleted")
                .message(event.propertyName() + " was removed from the platform.")
                .type(NotificationType.PROPERTY_DELETED)
                .priority(NotificationPriority.HIGH)
                .build());
    }

    @Async
    @EventListener
    public void onDocumentUploaded(NotificationEvents.DocumentUploadedEvent event) {
        notifyPropertyActivity(
                event.propertyId(),
                event.propertyName(),
                event.actorUserId(),
                "Document uploaded",
                event.documentName() + " was uploaded for " + event.propertyName() + ".",
                NotificationType.DOCUMENT_UPLOADED,
                NotificationPriority.MEDIUM);
    }

    @Async
    @EventListener
    public void onDocumentUpdated(NotificationEvents.DocumentUpdatedEvent event) {
        notifyPropertyActivity(
                event.propertyId(),
                event.propertyName(),
                event.actorUserId(),
                "Document updated",
                event.documentName() + " was updated for " + event.propertyName() + ".",
                NotificationType.DOCUMENT_UPDATED,
                NotificationPriority.MEDIUM);
    }

    @Async
    @EventListener
    public void onDocumentDeleted(NotificationEvents.DocumentDeletedEvent event) {
        notifyPropertyActivity(
                event.propertyId(),
                event.propertyName(),
                event.actorUserId(),
                "Document removed",
                event.documentName() + " was removed from " + event.propertyName() + ".",
                NotificationType.DOCUMENT_UPDATED,
                NotificationPriority.LOW);
    }

    @Async
    @EventListener
    public void onRiskUpdated(NotificationEvents.RiskSummaryUpdatedEvent event) {
        NotificationType type = NotificationType.RISK_SCORE_CHANGED;
        NotificationPriority priority = NotificationPriority.MEDIUM;

        if ("HIGH".equalsIgnoreCase(event.newRisk())) {
            type = NotificationType.HIGH_RISK_DETECTED;
            priority = NotificationPriority.HIGH;
        } else if ("CRITICAL".equalsIgnoreCase(event.newRisk())) {
            type = NotificationType.CRITICAL_RISK;
            priority = NotificationPriority.CRITICAL;
        }

        notificationService.notifyPropertyFollowers(
                event.propertyId(),
                event.actorUserId(),
                NotificationCommand.builder()
                        .senderId(event.actorUserId())
                        .propertyId(event.propertyId())
                        .title("Risk score updated")
                        .message(event.propertyName() + " risk changed to " + event.newRisk() + ".")
                        .type(type)
                        .priority(priority)
                        .actionUrl("/property-details/" + event.propertyId())
                        .build());

        if (priority == NotificationPriority.CRITICAL || priority == NotificationPriority.HIGH) {
            notificationService.notifyAdmins(NotificationCommand.builder()
                    .senderId(event.actorUserId())
                    .propertyId(event.propertyId())
                    .title("High priority risk alert")
                    .message(event.propertyName() + " is now marked as " + event.newRisk() + ".")
                    .type(type)
                    .priority(priority)
                    .actionUrl("/property-details/" + event.propertyId())
                    .build());
        }
    }

    @Async
    @EventListener
    public void onUserRegistered(NotificationEvents.UserRegisteredEvent event) {
        User user = event.user();

        notificationService.notifyUser(NotificationCommand.builder()
                .recipientId(user.getUserId())
                .title("Welcome to DueDiligence")
                .message("Your account was created successfully. Complete your profile to get started.")
                .type(NotificationType.WELCOME)
                .priority(NotificationPriority.LOW)
                .actionUrl("/profile")
                .build());

        notificationService.notifyAdmins(NotificationCommand.builder()
                .senderId(user.getUserId())
                .title("New user registered")
                .message(user.getName() + " (" + user.getEmail() + ") joined the platform.")
                .type(NotificationType.USER_REGISTERED)
                .priority(NotificationPriority.LOW)
                .actionUrl("/admin/dashboard")
                .build());
    }

    @Async
    @EventListener
    public void onProfileCompleted(NotificationEvents.ProfileCompletedEvent event) {
        User user = event.user();
        notificationService.notifyUser(NotificationCommand.builder()
                .recipientId(user.getUserId())
                .title("Profile completed")
                .message("Your buyer profile is ready. Start exploring properties.")
                .type(NotificationType.PROFILE_COMPLETED)
                .priority(NotificationPriority.LOW)
                .actionUrl("/buyer/dashboard")
                .build());
    }

    @Async
    @EventListener
    public void onRoleRequestSubmitted(NotificationEvents.RoleRequestSubmittedEvent event) {
        notificationService.notifyAdmins(NotificationCommand.builder()
                .senderId(event.requester().getUserId())
                .title("New verification request")
                .message(event.requester().getName() + " requested " + event.requestedRole() + " access.")
                .type(NotificationType.ROLE_REQUEST_SUBMITTED)
                .priority(NotificationPriority.HIGH)
                .actionUrl("/admin/dashboard")
                .build());
    }

    @Async
    @EventListener
    public void onRoleRequestDecision(NotificationEvents.RoleRequestDecisionEvent event) {
        notificationService.notifyUser(NotificationCommand.builder()
                .recipientId(event.user().getUserId())
                .title(event.approved() ? "Verification approved" : "Verification rejected")
                .message(event.approved()
                        ? "Your " + event.requestedRole() + " verification request was approved."
                        : "Your " + event.requestedRole() + " verification request was rejected.")
                .type(event.approved()
                        ? NotificationType.ROLE_REQUEST_APPROVED
                        : NotificationType.ROLE_REQUEST_REJECTED)
                .priority(NotificationPriority.HIGH)
                .actionUrl("/profile")
                .build());
    }

    @Async
    @EventListener
    public void onPropertySaved(NotificationEvents.PropertySavedEvent event) {
        Property property = event.property();
        notificationService.notifyUser(NotificationCommand.builder()
                .recipientId(event.buyer().getUserId())
                .propertyId(property.getPropertyId())
                .title("Property saved")
                .message(property.getPropertyCode() + " was added to your saved list.")
                .type(NotificationType.PROPERTY_SAVED)
                .priority(NotificationPriority.LOW)
                .actionUrl("/property-details/" + property.getPropertyId())
                .build());
    }

    @Async
    @EventListener
    public void onPropertyUnsaved(NotificationEvents.PropertyUnsavedEvent event) {
        notificationService.notifyUser(NotificationCommand.builder()
                .recipientId(event.buyer().getUserId())
                .propertyId(event.property().getPropertyId())
                .title("Property removed")
                .message(event.property().getPropertyCode() + " was removed from your saved list.")
                .type(NotificationType.PROPERTY_UNSAVED)
                .priority(NotificationPriority.LOW)
                .build());
    }

    @Async
    @EventListener
    public void onAgentContacted(NotificationEvents.AgentContactedEvent event) {
        Property property = event.property();
        notificationService.notifyUser(NotificationCommand.builder()
                .recipientId(event.agent().getUserId())
                .senderId(event.buyer().getUserId())
                .propertyId(property.getPropertyId())
                .title("Buyer contacted you")
                .message(event.buyer().getName() + " contacted you about " + property.getPropertyCode() + ".")
                .type(NotificationType.AGENT_CONTACTED)
                .priority(NotificationPriority.HIGH)
                .actionUrl("/property-details/" + property.getPropertyId())
                .build());
    }

    @Async
    @EventListener
    public void onVisitScheduled(NotificationEvents.VisitScheduledEvent event) {
        Property property = event.property();
        NotificationCommand command = NotificationCommand.builder()
                .senderId(event.buyer().getUserId())
                .propertyId(property.getPropertyId())
                .title("Visit scheduled")
                .message("A property visit was scheduled for " + property.getPropertyCode()
                        + (event.visitTime() != null ? " at " + event.visitTime() : "") + ".")
                .type(NotificationType.VISIT_SCHEDULED)
                .priority(NotificationPriority.MEDIUM)
                .actionUrl("/property-details/" + property.getPropertyId())
                .build();

        notificationService.notifyUser(copyForAgent(property, command));
        notificationService.notifyAdmins(command);
    }

    @Async
    @EventListener
    public void onVisitCancelled(NotificationEvents.VisitCancelledEvent event) {
        Property property = event.property();
        NotificationCommand command = NotificationCommand.builder()
                .senderId(event.buyer().getUserId())
                .propertyId(property.getPropertyId())
                .title("Visit cancelled")
                .message("The scheduled visit for " + property.getPropertyCode() + " was cancelled.")
                .type(NotificationType.VISIT_CANCELLED)
                .priority(NotificationPriority.MEDIUM)
                .actionUrl("/property-details/" + property.getPropertyId())
                .build();
        notificationService.notifyUser(copyForAgent(property, command));
    }

    @Async
    @EventListener
    public void onOfferSubmitted(NotificationEvents.OfferSubmittedEvent event) {
        Property property = event.property();
        NotificationCommand command = NotificationCommand.builder()
                .senderId(event.buyer().getUserId())
                .propertyId(property.getPropertyId())
                .title("New offer submitted")
                .message(event.buyer().getName() + " submitted an offer on " + property.getPropertyCode() + ".")
                .type(NotificationType.OFFER_SUBMITTED)
                .priority(NotificationPriority.HIGH)
                .actionUrl("/property-details/" + property.getPropertyId())
                .build();
        notificationService.notifyUser(copyForAgent(property, command));
        notificationService.notifyAdmins(command);
    }

    @Async
    @EventListener
    public void onOfferDecision(NotificationEvents.OfferDecisionEvent event) {
        notificationService.notifyUser(NotificationCommand.builder()
                .recipientId(event.buyer().getUserId())
                .propertyId(event.property().getPropertyId())
                .title(event.accepted() ? "Offer accepted" : "Offer rejected")
                .message("Your offer on " + event.property().getPropertyCode()
                        + (event.accepted() ? " was accepted." : " was rejected."))
                .type(event.accepted() ? NotificationType.OFFER_ACCEPTED : NotificationType.OFFER_REJECTED)
                .priority(NotificationPriority.HIGH)
                .actionUrl("/property-details/" + event.property().getPropertyId())
                .build());
    }

    @Async
    @EventListener
    public void onLegalReview(NotificationEvents.LegalReviewEvent event) {
        Property property = event.property();
        NotificationType type = event.completed()
                ? NotificationType.LEGAL_REVIEW_COMPLETED
                : NotificationType.LEGAL_REVIEW_STARTED;

        NotificationCommand command = NotificationCommand.builder()
                .senderId(event.reviewer().getUserId())
                .propertyId(property.getPropertyId())
                .title(event.completed() ? "Legal review completed" : "Legal review started")
                .message((event.completed() ? "Legal review completed for " : "Legal review started for ")
                        + property.getPropertyCode() + ".")
                .type(type)
                .priority(NotificationPriority.HIGH)
                .actionUrl("/property-details/" + property.getPropertyId())
                .build();

        notificationService.notifyPropertyFollowers(property.getPropertyId(), event.reviewer().getUserId(), command);
        notificationService.notifyRole(Role.BANK, command);
    }

    @Async
    @EventListener
    public void onFinancialReview(NotificationEvents.FinancialReviewEvent event) {
        Property property = event.property();
        NotificationType type;
        if (event.completed()) {
            type = event.approved() ? NotificationType.FINANCIAL_APPROVED : NotificationType.FINANCIAL_REJECTED;
        } else {
            type = NotificationType.FINANCIAL_REVIEW_STARTED;
        }

        NotificationCommand command = NotificationCommand.builder()
                .senderId(event.reviewer().getUserId())
                .propertyId(property.getPropertyId())
                .title(event.completed()
                        ? (event.approved() ? "Financial review approved" : "Financial review rejected")
                        : "Financial review started")
                .message("Financial review update for " + property.getPropertyCode() + ".")
                .type(type)
                .priority(NotificationPriority.HIGH)
                .actionUrl("/property-details/" + property.getPropertyId())
                .build();

        notificationService.notifyPropertyFollowers(property.getPropertyId(), event.reviewer().getUserId(), command);
    }

    @Async
    @EventListener
    public void onReportGenerated(NotificationEvents.ReportGeneratedEvent event) {
        notificationService.notifyUser(NotificationCommand.builder()
                .recipientId(event.requester().getUserId())
                .propertyId(event.property().getPropertyId())
                .title("Due diligence report ready")
                .message("Report for " + event.property().getPropertyCode() + " is ready to view.")
                .type(NotificationType.REPORT_GENERATED)
                .priority(NotificationPriority.MEDIUM)
                .actionUrl("/reports/" + event.property().getPropertyId())
                .build());
    }

    @Async
    @EventListener
    public void onAdminBroadcast(NotificationEvents.AdminBroadcastEvent event) {
        NotificationCommand command = NotificationCommand.builder()
                .senderId(event.adminUserId())
                .title(event.title())
                .message(event.message())
                .type(NotificationType.ADMIN_MESSAGE)
                .priority(NotificationPriority.HIGH)
                .build();

        for (Role role : Role.values()) {
            notificationService.notifyRole(role, command);
        }
    }

    private void notifyPropertyActivity(
            Integer propertyId,
            String propertyName,
            Integer actorUserId,
            String title,
            String message,
            NotificationType type,
            NotificationPriority priority) {

        notificationService.notifyPropertyFollowers(
                propertyId,
                actorUserId,
                NotificationCommand.builder()
                        .senderId(actorUserId)
                        .propertyId(propertyId)
                        .title(title)
                        .message(message)
                        .type(type)
                        .priority(priority)
                        .actionUrl("/property-details/" + propertyId)
                        .build());
    }

    private NotificationCommand copyForAgent(Property property, NotificationCommand command) {
        if (property.getOwner() == null) {
            return command;
        }
        return NotificationCommand.builder()
                .recipientId(property.getOwner().getUserId())
                .senderId(command.getSenderId())
                .propertyId(command.getPropertyId())
                .title(command.getTitle())
                .message(command.getMessage())
                .type(command.getType())
                .priority(command.getPriority())
                .actionUrl(command.getActionUrl())
                .metadata(command.getMetadata())
                .build();
    }
}
