package com.realestate.duediligence.dto;

import java.time.LocalDateTime;

import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;

public class UserProfileResponse {

    private Integer userId;
    private String name;
    private String email;
    private String phoneNumber;
    private String bio;
    private String avatarUrl;
    private Role role;
    private AccountStatus status;
    private Boolean profileCompleted;
    private String location;
    private LocalDateTime joinDate;

    // Getters and Setters

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public AccountStatus getStatus() {
        return status;
    }

    public void setStatus(AccountStatus status) {
        this.status = status;
    }

    public Boolean getProfileCompleted() {
        return profileCompleted;
    }

    public void setProfileCompleted(Boolean profileCompleted) {
        this.profileCompleted = profileCompleted;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getJoinDate() {
        return joinDate;
    }

    public void setJoinDate(LocalDateTime joinDate) {
        this.joinDate = joinDate;
    }
}
