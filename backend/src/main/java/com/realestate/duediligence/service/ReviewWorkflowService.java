package com.realestate.duediligence.service;

public interface ReviewWorkflowService {

    void startLegalReview(String reviewerEmail, Integer propertyId);

    void completeLegalReview(String reviewerEmail, Integer propertyId, boolean approved);

    void startFinancialReview(String reviewerEmail, Integer propertyId);

    void completeFinancialReview(String reviewerEmail, Integer propertyId, boolean approved);
}
