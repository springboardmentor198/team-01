package com.realestate.duediligence.repository;

import java.util.List;

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
