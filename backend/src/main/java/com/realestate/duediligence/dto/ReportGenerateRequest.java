package com.realestate.duediligence.dto;

public class ReportGenerateRequest {

    private Integer propertyId;

    public ReportGenerateRequest() {
    }

    public ReportGenerateRequest(Integer propertyId) {
        this.propertyId = propertyId;
    }

    public Integer getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(Integer propertyId) {
        this.propertyId = propertyId;
    }
}
