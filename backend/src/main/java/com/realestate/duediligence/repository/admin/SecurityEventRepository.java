package com.realestate.duediligence.repository.admin;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.admin.SecurityEvent;

@Repository
public interface SecurityEventRepository extends JpaRepository<SecurityEvent, Integer> {

    @Query("SELECT se FROM SecurityEvent se WHERE " +
            "(:eventType IS NULL OR se.eventType = :eventType) AND " +
            "(:status IS NULL OR se.status = :status) AND " +
            "(:userId IS NULL OR se.user.userId = :userId) AND " +
            "(CAST(:startDate AS timestamp) IS NULL OR se.createdAt >= :startDate) AND " +
            "(CAST(:endDate AS timestamp) IS NULL OR se.createdAt <= :endDate)")
    Page<SecurityEvent> findWithFilters(
            @Param("eventType") String eventType,
            @Param("status") String status,
            @Param("userId") Integer userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    long countByEventType(String eventType);

    @Query("SELECT COUNT(se) FROM SecurityEvent se WHERE se.status = 'FAILURE'")
    long countFailedLoginAttempts();
}
