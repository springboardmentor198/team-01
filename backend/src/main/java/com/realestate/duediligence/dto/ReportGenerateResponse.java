package com.realestate.duediligence.dto;

import java.time.LocalDateTime;

public class ReportGenerateResponse {

    private Long id;
    private Integer propertyId;
    private String executiveSummary;
    private String status;
    private LocalDateTime createdAt;

    public ReportGenerateResponse() {
    }

    public ReportGenerateResponse(Long id, Integer propertyId, String executiveSummary,
                                   String status, LocalDateTime createdAt) {
        this.id = id;
        this.propertyId = propertyId;
        this.executiveSummary = executiveSummary;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(Integer propertyId) {
        this.propertyId = propertyId;
    }

    public String getExecutiveSummary() {
        return executiveSummary;
    }

    public void setExecutiveSummary(String executiveSummary) {
        this.executiveSummary = executiveSummary;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
