package com.realestate.duediligence.service;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.duediligence.entity.AgentFollow;
import com.realestate.duediligence.entity.OwnerFollow;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.PropertyFollow;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.FollowReason;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.event.NotificationEvents;
import com.realestate.duediligence.exception.ResourceNotFoundException;
import com.realestate.duediligence.repository.AgentFollowRepository;
import com.realestate.duediligence.repository.OwnerFollowRepository;
import com.realestate.duediligence.repository.PropertyFollowRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.UserRepository;

@Service
public class PropertyEngagementServiceImpl implements PropertyEngagementService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final PropertyFollowRepository propertyFollowRepository;
    private final AgentFollowRepository agentFollowRepository;
    private final OwnerFollowRepository ownerFollowRepository;
    private final ApplicationEventPublisher eventPublisher;

    public PropertyEngagementServiceImpl(
            UserRepository userRepository,
            PropertyRepository propertyRepository,
            PropertyFollowRepository propertyFollowRepository,
            AgentFollowRepository agentFollowRepository,
            OwnerFollowRepository ownerFollowRepository,
            ApplicationEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.propertyFollowRepository = propertyFollowRepository;
        this.agentFollowRepository = agentFollowRepository;
        this.ownerFollowRepository = ownerFollowRepository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public void saveProperty(String buyerEmail, Integer propertyId) {
        User buyer = requireUser(buyerEmail);
        Property property = requireProperty(propertyId);
        followProperty(buyer, property, FollowReason.SAVED);
        eventPublisher.publishEvent(new NotificationEvents.PropertySavedEvent(buyer, property));
    }

    @Override
    @Transactional
    public void unsaveProperty(String buyerEmail, Integer propertyId) {
        User buyer = requireUser(buyerEmail);
        Property property = requireProperty(propertyId);
        propertyFollowRepository.deleteByUser_UserIdAndProperty_PropertyId(
                buyer.getUserId(),
                propertyId);
        eventPublisher.publishEvent(new NotificationEvents.PropertyUnsavedEvent(buyer, property));
    }

    @Override
    @Transactional
    public void contactAgent(String buyerEmail, Integer propertyId, Integer agentId, String message) {
        User buyer = requireUser(buyerEmail);
        Property property = requireProperty(propertyId);
        if (buyer.getRole() != Role.BUYER || !"APPROVED".equals(property.getStatus()) || property.getManagedBy() == null) {
            throw new IllegalStateException("Interest can only be submitted by a buyer for an approved managed property");
        }
        User agent = property.getManagedBy();

        followProperty(buyer, property, FollowReason.CONTACTED);
        followAgent(buyer, agent);
        if (property.getOwner() != null) {
            followOwner(buyer, property.getOwner());
        }

        eventPublisher.publishEvent(new NotificationEvents.AgentContactedEvent(buyer, agent, property));
    }

    @Override
    @Transactional
    public void scheduleVisit(String buyerEmail, Integer propertyId, String visitTime) {
        User buyer = requireUser(buyerEmail);
        Property property = requireProperty(propertyId);
        followProperty(buyer, property, FollowReason.DUE_DILIGENCE);
        eventPublisher.publishEvent(new NotificationEvents.VisitScheduledEvent(buyer, property, visitTime));
    }

    @Override
    @Transactional
    public void cancelVisit(String buyerEmail, Integer propertyId) {
        User buyer = requireUser(buyerEmail);
        Property property = requireProperty(propertyId);
        eventPublisher.publishEvent(new NotificationEvents.VisitCancelledEvent(buyer, property));
    }

    @Override
    @Transactional
    public void submitOffer(String buyerEmail, Integer propertyId, String offerAmount) {
        User buyer = requireUser(buyerEmail);
        Property property = requireProperty(propertyId);
        followProperty(buyer, property, FollowReason.DUE_DILIGENCE);
        eventPublisher.publishEvent(new NotificationEvents.OfferSubmittedEvent(buyer, property, offerAmount));
    }

    @Override
    @Transactional
    public void respondToOffer(
            String responderEmail,
            Integer propertyId,
            Integer buyerId,
            boolean accepted) {
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found"));
        Property property = requireProperty(propertyId);
        requireUser(responderEmail);
        eventPublisher.publishEvent(new NotificationEvents.OfferDecisionEvent(buyer, property, accepted));
    }

    @Override
    @Transactional
    public void followProperty(String userEmail, Integer propertyId, FollowReason reason) {
        User user = requireUser(userEmail);
        Property property = requireProperty(propertyId);
        followProperty(user, property, reason);
    }

    private void followProperty(User user, Property property, FollowReason reason) {
        propertyFollowRepository.findByUser_UserIdAndProperty_PropertyId(
                user.getUserId(),
                property.getPropertyId()).ifPresentOrElse(existing -> {
                    existing.setFollowReason(reason);
                    propertyFollowRepository.save(existing);
                }, () -> propertyFollowRepository.save(PropertyFollow.builder()
                        .user(user)
                        .property(property)
                        .followReason(reason)
                        .build()));
    }

    private void followAgent(User buyer, User agent) {
        agentFollowRepository.findByUser_UserIdAndAgent_UserId(
                buyer.getUserId(),
                agent.getUserId()).orElseGet(() -> agentFollowRepository.save(AgentFollow.builder()
                        .user(buyer)
                        .agent(agent)
                        .build()));
    }

    private void followOwner(User buyer, User owner) {
        if (owner.getUserId().equals(buyer.getUserId())) {
            return;
        }
        ownerFollowRepository.findByUser_UserIdAndOwner_UserId(
                buyer.getUserId(),
                owner.getUserId()).orElseGet(() -> ownerFollowRepository.save(OwnerFollow.builder()
                        .user(buyer)
                        .owner(owner)
                        .build()));
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Property requireProperty(Integer propertyId) {
        return propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
    }
}
