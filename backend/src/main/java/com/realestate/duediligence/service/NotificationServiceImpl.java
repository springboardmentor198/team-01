package com.realestate.duediligence.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.duediligence.dto.NotificationDto;
import com.realestate.duediligence.entity.Notification;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.FollowReason;
import com.realestate.duediligence.enums.NotificationPriority;
import com.realestate.duediligence.enums.NotificationStatus;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.notification.NotificationCommand;
import com.realestate.duediligence.repository.AgentFollowRepository;
import com.realestate.duediligence.repository.NotificationRepository;
import com.realestate.duediligence.repository.OwnerFollowRepository;
import com.realestate.duediligence.repository.PropertyFollowRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.UserRepository;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final PropertyFollowRepository propertyFollowRepository;
    private final AgentFollowRepository agentFollowRepository;
    private final OwnerFollowRepository ownerFollowRepository;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            PropertyRepository propertyRepository,
            PropertyFollowRepository propertyFollowRepository,
            AgentFollowRepository agentFollowRepository,
            OwnerFollowRepository ownerFollowRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.propertyFollowRepository = propertyFollowRepository;
        this.agentFollowRepository = agentFollowRepository;
        this.ownerFollowRepository = ownerFollowRepository;
    }

    @Override
    @Transactional
    public NotificationDto notifyUser(NotificationCommand command) {
        if (command.getRecipientId() == null) {
            return null;
        }

        User recipient = userRepository.findById(command.getRecipientId())
                .orElse(null);
        if (recipient == null) {
            return null;
        }

        Notification saved = notificationRepository.save(buildNotification(recipient, command));
        return toDto(saved);
    }

    @Override
    @Transactional
    public void notifyRole(Role role, NotificationCommand command) {
        userRepository.findByRole(role).forEach(user -> {
            NotificationCommand userCommand = NotificationCommand.builder()
                    .recipientId(user.getUserId())
                    .senderId(command.getSenderId())
                    .propertyId(command.getPropertyId())
                    .roleTarget(role)
                    .title(command.getTitle())
                    .message(command.getMessage())
                    .type(command.getType())
                    .priority(command.getPriority())
                    .actionUrl(command.getActionUrl())
                    .metadata(command.getMetadata())
                    .build();
            notifyUser(userCommand);
        });
    }

    @Override
    @Transactional
    public void notifyPropertyFollowers(
            Integer propertyId,
            Integer excludeUserId,
            NotificationCommand command) {

        propertyFollowRepository.findByProperty_PropertyId(propertyId).forEach(follow -> {
            Integer followerId = follow.getUser().getUserId();
            if (excludeUserId != null && excludeUserId.equals(followerId)) {
                return;
            }
            notifyUser(copyForRecipient(command, followerId));
        });
    }

    @Override
    @Transactional
    public void notifySavedPropertyUsers(
            Integer propertyId,
            Integer excludeUserId,
            NotificationCommand command) {

        propertyFollowRepository.findByProperty_PropertyId(propertyId).stream()
                .filter(follow -> follow.getFollowReason() == FollowReason.SAVED)
                .forEach(follow -> {
                    Integer followerId = follow.getUser().getUserId();
                    if (excludeUserId != null && excludeUserId.equals(followerId)) {
                        return;
                    }
                    notifyUser(copyForRecipient(command, followerId));
                });
    }

    @Override
    @Transactional
    public void notifyAgentFollowers(
            Integer agentId,
            Integer excludeUserId,
            NotificationCommand command) {

        agentFollowRepository.findByAgent_UserId(agentId).forEach(follow -> {
            Integer followerId = follow.getUser().getUserId();
            if (excludeUserId != null && excludeUserId.equals(followerId)) {
                return;
            }
            notifyUser(copyForRecipient(command, followerId));
        });
    }

    @Override
    @Transactional
    public void notifyOwnerFollowers(
            Integer ownerId,
            Integer excludeUserId,
            NotificationCommand command) {

        ownerFollowRepository.findByOwner_UserId(ownerId).forEach(follow -> {
            Integer followerId = follow.getUser().getUserId();
            if (excludeUserId != null && excludeUserId.equals(followerId)) {
                return;
            }
            notifyUser(copyForRecipient(command, followerId));
        });
    }

    @Override
    @Transactional
    public void notifyAdmins(NotificationCommand command) {
        notifyRole(Role.ADMIN, command);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDto> getNotifications(
            Integer userId,
            NotificationStatus status,
            NotificationPriority priority,
            Pageable pageable) {

        Page<Notification> page;
        if (status != null) {
            page = notificationRepository.findByRecipient_UserIdAndStatusOrderByCreatedAtDesc(
                    userId, status, pageable);
        } else if (priority != null) {
            page = notificationRepository.findByRecipient_UserIdAndPriorityOrderByCreatedAtDesc(
                    userId, priority, pageable);
        } else {
            page = notificationRepository.findByRecipient_UserIdOrderByCreatedAtDesc(
                    userId, pageable);
        }

        return page.map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread(Integer userId) {
        return notificationRepository.countByRecipient_UserIdAndStatus(
                userId, NotificationStatus.UNREAD);
    }

    @Override
    @Transactional
    public NotificationDto markAsRead(Long notificationId, Integer userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipient().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized notification access");
        }

        notification.setStatus(NotificationStatus.READ);
        notification.setReadAt(LocalDateTime.now());
        return toDto(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public void markAllAsRead(Integer userId) {
        notificationRepository.findByRecipient_UserIdAndStatusOrderByCreatedAtDesc(
                userId,
                NotificationStatus.UNREAD,
                Pageable.unpaged()).forEach(notification -> {
                    notification.setStatus(NotificationStatus.READ);
                    notification.setReadAt(LocalDateTime.now());
                    notificationRepository.save(notification);
                });
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId, Integer userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipient().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized notification access");
        }

        notificationRepository.delete(notification);
    }

    @Override
    @Transactional
    public void deleteOldNotifications(int daysToKeep) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(daysToKeep);
        notificationRepository.findAll().stream()
                .filter(notification -> notification.getCreatedAt().isBefore(cutoff))
                .forEach(notificationRepository::delete);
    }

    private Notification buildNotification(User recipient, NotificationCommand command) {
        User sender = command.getSenderId() == null
                ? null
                : userRepository.findById(command.getSenderId()).orElse(null);

        Property property = command.getPropertyId() == null
                ? null
                : propertyRepository.findById(command.getPropertyId()).orElse(null);

        return Notification.builder()
                .recipient(recipient)
                .sender(sender)
                .property(property)
                .roleTarget(command.getRoleTarget())
                .title(command.getTitle())
                .message(command.getMessage())
                .type(command.getType())
                .priority(command.getPriority() != null
                        ? command.getPriority()
                        : NotificationPriority.MEDIUM)
                .status(NotificationStatus.UNREAD)
                .actionUrl(command.getActionUrl())
                .metadata(command.getMetadata())
                .build();
    }

    private NotificationCommand copyForRecipient(NotificationCommand command, Integer recipientId) {
        return NotificationCommand.builder()
                .recipientId(recipientId)
                .senderId(command.getSenderId())
                .propertyId(command.getPropertyId())
                .roleTarget(command.getRoleTarget())
                .title(command.getTitle())
                .message(command.getMessage())
                .type(command.getType())
                .priority(command.getPriority())
                .actionUrl(command.getActionUrl())
                .metadata(command.getMetadata())
                .build();
    }

    private NotificationDto toDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .recipientId(notification.getRecipient().getUserId())
                .senderId(notification.getSender() != null
                        ? notification.getSender().getUserId()
                        : null)
                .senderName(notification.getSender() != null
                        ? notification.getSender().getName()
                        : null)
                .propertyId(notification.getProperty() != null
                        ? notification.getProperty().getPropertyId()
                        : null)
                .propertyName(notification.getProperty() != null
                        ? notification.getProperty().getPropertyCode()
                        : null)
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .priority(notification.getPriority())
                .status(notification.getStatus())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .actionUrl(notification.getActionUrl())
                .metadata(notification.getMetadata())
                .build();
    }
}
