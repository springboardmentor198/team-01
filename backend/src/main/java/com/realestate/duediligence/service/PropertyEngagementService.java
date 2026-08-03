package com.realestate.duediligence.service;

import com.realestate.duediligence.enums.FollowReason;

public interface PropertyEngagementService {

    void saveProperty(String buyerEmail, Integer propertyId);

    void unsaveProperty(String buyerEmail, Integer propertyId);

    void contactAgent(String buyerEmail, Integer propertyId, Integer agentId, String message);

    void scheduleVisit(String buyerEmail, Integer propertyId, String visitTime);

    void cancelVisit(String buyerEmail, Integer propertyId);

    void submitOffer(String buyerEmail, Integer propertyId, String offerAmount);

    void respondToOffer(String responderEmail, Integer propertyId, Integer buyerId, boolean accepted);

    void followProperty(String userEmail, Integer propertyId, FollowReason reason);
}
