package com.realestate.duediligence.repository;

import java.util.List;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.ActivityLog;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.Property;

@Repository
public interface ActivityLogRepository
        extends JpaRepository<ActivityLog, Integer> {

    List<ActivityLog> findByProperty_PropertyIdOrderByCreatedAtDesc(
            Integer propertyId
    );

    List<ActivityLog> findByPerformedByAndActivityTypeOrderByCreatedAtDesc(
            String performedBy,
            String activityType
    );

    List<ActivityLog> findByPerformedByOrderByCreatedAtDesc(String performedBy);

    long countByPerformedByAndActivityType(String performedBy, String activityType);

    Optional<ActivityLog> findFirstByProperty_PropertyIdAndPerformedByAndActivityTypeOrderByCreatedAtDesc(
            Integer propertyId, String performedBy, String activityType);

    @Query("""
        SELECT a.property.propertyId, COUNT(a), COUNT(DISTINCT a.performedBy),
               SUM(CASE WHEN a.createdAt >= :sevenDaysAgo THEN 1 ELSE 0 END)
        FROM ActivityLog a
        WHERE a.activityType = 'PROPERTY_VIEW' AND a.createdAt >= :thirtyDaysAgo
        GROUP BY a.property.propertyId
        ORDER BY (SUM(CASE WHEN a.createdAt >= :sevenDaysAgo THEN 1 ELSE 0 END) * 3 + COUNT(a) + COUNT(DISTINCT a.performedBy) * 2) DESC
    """)
    List<Object[]> findPopularPropertyMetrics(@Param("sevenDaysAgo") LocalDateTime sevenDaysAgo,
            @Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo, org.springframework.data.domain.Pageable pageable);

    @Query("""
        SELECT COUNT(DISTINCT a.property.propertyId)
        FROM ActivityLog a
        WHERE a.performedBy = :performedBy
        AND a.activityType = :activityType
    """)
    long countDistinctViewedProperties(
            @Param("performedBy") String performedBy,
            @Param("activityType") String activityType
    );

    @Query("""
        SELECT DISTINCT a.property
        FROM ActivityLog a
        WHERE a.performedBy = :performedBy
        AND a.activityType = :activityType
    """)
    List<Property> findDistinctPropertiesByPerformedByAndActivityType(
            @Param("performedBy") String performedBy,
            @Param("activityType") String activityType
    );

}
