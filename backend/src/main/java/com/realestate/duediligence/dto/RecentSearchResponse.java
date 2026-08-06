package com.realestate.duediligence.dto;

import java.time.LocalDateTime;

public class RecentSearchResponse {

    private Long searchId;

    private Integer userId;
    private String userName;
    private String userEmail;

    private String property;
    private String propertyType;
    private String risk;
    private String status;

    private String query;
    private String city;

    private Integer propertyId;
    private String propertyName;
    private String imageUrl;
    private LocalDateTime searchedAt;

    // No-Args Constructor
    public RecentSearchResponse() {
    }

    // All-Args Constructor
    public RecentSearchResponse(Long searchId, Integer userId, String userName, String userEmail,
                                String property, String propertyType, String risk, String status,
                                String query, String city, Integer propertyId,
                                String propertyName, String imageUrl,
                                LocalDateTime searchedAt) {
        this.searchId = searchId;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.property = property;
        this.propertyType = propertyType;
        this.risk = risk;
        this.status = status;
        this.query = query;
        this.city = city;
        this.propertyId = propertyId;
        this.propertyName = propertyName;
        this.imageUrl = imageUrl;
        this.searchedAt = searchedAt;
    }

    public Long getSearchId() {
        return searchId;
    }

    public void setSearchId(Long searchId) {
        this.searchId = searchId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getProperty() {
        return property;
    }

    public void setProperty(String property) {
        this.property = property;
    }

    public String getPropertyType() {
        return propertyType;
    }

    public void setPropertyType(String propertyType) {
        this.propertyType = propertyType;
    }

    public String getRisk() {
        return risk;
    }

    public void setRisk(String risk) {
        this.risk = risk;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Integer getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(Integer propertyId) {
        this.propertyId = propertyId;
    }

    public String getPropertyName() {
        return propertyName;
    }

    public void setPropertyName(String propertyName) {
        this.propertyName = propertyName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getSearchedAt() {
        return searchedAt;
    }

    public void setSearchedAt(LocalDateTime searchedAt) {
        this.searchedAt = searchedAt;
    }
}