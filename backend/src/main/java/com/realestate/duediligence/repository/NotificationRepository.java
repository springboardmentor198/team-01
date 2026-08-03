package com.realestate.duediligence.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.duediligence.entity.Notification;
import com.realestate.duediligence.enums.NotificationPriority;
import com.realestate.duediligence.enums.NotificationStatus;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipient_UserIdOrderByCreatedAtDesc(
            Integer userId,
            Pageable pageable);

    Page<Notification> findByRecipient_UserIdAndStatusOrderByCreatedAtDesc(
            Integer userId,
            NotificationStatus status,
            Pageable pageable);

    Page<Notification> findByRecipient_UserIdAndPriorityOrderByCreatedAtDesc(
            Integer userId,
            NotificationPriority priority,
            Pageable pageable);

    long countByRecipient_UserIdAndStatus(Integer userId, NotificationStatus status);
}
