package com.realestate.duediligence.service;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.FollowReason;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.event.NotificationEvents;
import com.realestate.duediligence.exception.ResourceNotFoundException;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.UserRepository;

@Service
public class ReviewWorkflowServiceImpl implements ReviewWorkflowService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final PropertyEngagementService propertyEngagementService;
    private final ApplicationEventPublisher eventPublisher;

    public ReviewWorkflowServiceImpl(
            UserRepository userRepository,
            PropertyRepository propertyRepository,
            PropertyEngagementService propertyEngagementService,
            ApplicationEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.propertyEngagementService = propertyEngagementService;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public void startLegalReview(String reviewerEmail, Integer propertyId) {
        User reviewer = requireRole(reviewerEmail, Role.LEGAL_REVIEWER);
        Property property = requireProperty(propertyId);
        propertyEngagementService.followProperty(reviewerEmail, propertyId, FollowReason.REVIEW_REQUESTED);
        eventPublisher.publishEvent(new NotificationEvents.LegalReviewEvent(reviewer, property, false));
    }

    @Override
    @Transactional
    public void completeLegalReview(String reviewerEmail, Integer propertyId, boolean approved) {
        User reviewer = requireRole(reviewerEmail, Role.LEGAL_REVIEWER);
        Property property = requireProperty(propertyId);
        eventPublisher.publishEvent(new NotificationEvents.LegalReviewEvent(reviewer, property, true));
    }

    @Override
    @Transactional
    public void startFinancialReview(String reviewerEmail, Integer propertyId) {
        User reviewer = requireRole(reviewerEmail, Role.BANK);
        Property property = requireProperty(propertyId);
        eventPublisher.publishEvent(new NotificationEvents.FinancialReviewEvent(reviewer, property, false, false));
    }

    @Override
    @Transactional
    public void completeFinancialReview(String reviewerEmail, Integer propertyId, boolean approved) {
        User reviewer = requireRole(reviewerEmail, Role.BANK);
        Property property = requireProperty(propertyId);
        eventPublisher.publishEvent(
                new NotificationEvents.FinancialReviewEvent(reviewer, property, true, approved));
    }

    private User requireRole(String email, Role role) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole() != role && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Unauthorized role for this review action");
        }
        return user;
    }

    private Property requireProperty(Integer propertyId) {
        return propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
    }
}
