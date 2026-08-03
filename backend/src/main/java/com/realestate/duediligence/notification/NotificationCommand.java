package com.realestate.duediligence.notification;

import com.realestate.duediligence.enums.NotificationPriority;
import com.realestate.duediligence.enums.NotificationType;
import com.realestate.duediligence.enums.Role;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationCommand {

    private Integer recipientId;
    private Integer senderId;
    private Integer propertyId;
    private Role roleTarget;
    private String title;
    private String message;
    private NotificationType type;
    private NotificationPriority priority;
    private String actionUrl;
    private String metadata;
}
