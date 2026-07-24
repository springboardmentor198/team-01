package com.realestate.duediligence.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.realestate.duediligence.entity.FloodZoneRecord;

@Repository
public interface FloodZoneRepository extends JpaRepository<FloodZoneRecord, Integer> {
    Optional<FloodZoneRecord> findByProperty_PropertyId(Integer propertyId);
}
