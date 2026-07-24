package com.realestate.duediligence.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.realestate.duediligence.entity.ZoningRecord;

@Repository
public interface ZoningRepository extends JpaRepository<ZoningRecord, Integer> {
    Optional<ZoningRecord> findByProperty_PropertyId(Integer propertyId);
}
