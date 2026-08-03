package com.realestate.duediligence.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.realestate.duediligence.dto.NotificationDto;
import com.realestate.duediligence.enums.NotificationPriority;
import com.realestate.duediligence.enums.NotificationStatus;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.notification.NotificationCommand;

public interface NotificationService {

    NotificationDto notifyUser(NotificationCommand command);

    void notifyRole(Role role, NotificationCommand command);

    void notifyPropertyFollowers(Integer propertyId, Integer excludeUserId, NotificationCommand command);

    void notifySavedPropertyUsers(Integer propertyId, Integer excludeUserId, NotificationCommand command);

    void notifyAgentFollowers(Integer agentId, Integer excludeUserId, NotificationCommand command);

    void notifyOwnerFollowers(Integer ownerId, Integer excludeUserId, NotificationCommand command);

    void notifyAdmins(NotificationCommand command);

    Page<NotificationDto> getNotifications(Integer userId, NotificationStatus status,
            NotificationPriority priority, Pageable pageable);

    long countUnread(Integer userId);

    NotificationDto markAsRead(Long notificationId, Integer userId);

    void markAllAsRead(Integer userId);

    void deleteNotification(Long notificationId, Integer userId);

    void deleteOldNotifications(int daysToKeep);
}
