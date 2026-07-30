package com.realestate.duediligence.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.ActivityLog;
@Repository
public interface ActivityLogRepository
        extends JpaRepository<ActivityLog,Integer>{

    List<ActivityLog> findByProperty_PropertyIdOrderByCreatedAtDesc(Integer propertyId);

}