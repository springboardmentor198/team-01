package com.realestate.duediligence.event;

import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.User;

public final class NotificationEvents {

    private NotificationEvents() {
    }

    public record PropertyCreatedEvent(Property property, Integer actorUserId) {
    }

    public record PropertyUpdatedEvent(
            Property property,
            Integer actorUserId,
            String previousStatus,
            String newStatus) {
    }

    public record PropertyDeletedEvent(Integer propertyId, String propertyName, Integer actorUserId) {
    }

    public record DocumentUploadedEvent(
            Integer propertyId,
            String propertyName,
            String documentName,
            Integer actorUserId) {
    }

    public record DocumentUpdatedEvent(
            Integer propertyId,
            String propertyName,
            String documentName,
            Integer actorUserId) {
    }

    public record DocumentDeletedEvent(
            Integer propertyId,
            String propertyName,
            String documentName,
            Integer actorUserId) {
    }

    public record RiskSummaryUpdatedEvent(
            Integer propertyId,
            String propertyName,
            String previousRisk,
            String newRisk,
            Integer actorUserId) {
    }

    public record UserRegisteredEvent(User user) {
    }

    public record ProfileCompletedEvent(User user) {
    }

    public record RoleRequestSubmittedEvent(User requester, String requestedRole) {
    }

    public record RoleRequestDecisionEvent(User user, boolean approved, String requestedRole) {
    }

    public record PropertySavedEvent(User buyer, Property property) {
    }

    public record PropertyUnsavedEvent(User buyer, Property property) {
    }

    public record AgentContactedEvent(User buyer, User agent, Property property) {
    }

    public record VisitScheduledEvent(User buyer, Property property, String visitTime) {
    }

    public record VisitCancelledEvent(User buyer, Property property) {
    }

    public record OfferSubmittedEvent(User buyer, Property property, String offerAmount) {
    }

    public record OfferDecisionEvent(User buyer, Property property, boolean accepted) {
    }

    public record LegalReviewEvent(User reviewer, Property property, boolean completed) {
    }

    public record FinancialReviewEvent(
            User reviewer,
            Property property,
            boolean completed,
            boolean approved) {
    }

    public record ReportGeneratedEvent(User requester, Property property) {
    }

    public record AdminBroadcastEvent(String title, String message, Integer adminUserId) {
    }
}
