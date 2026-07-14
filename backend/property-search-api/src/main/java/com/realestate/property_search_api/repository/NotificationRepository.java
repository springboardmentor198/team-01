package com.realestate.property_search_api.repository;

import com.realestate.property_search_api.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find the 5 most recent notifications
    List<Notification> findFirst5ByOrderByCreatedAtDesc();
}
