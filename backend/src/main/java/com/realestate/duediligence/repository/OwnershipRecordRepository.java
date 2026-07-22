package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.OwnershipRecord;
import com.realestate.duediligence.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OwnershipRecordRepository extends JpaRepository<OwnershipRecord, Integer> {

    List<OwnershipRecord> findByProperty(Property property);

    List<OwnershipRecord> findByPropertyPropertyId(Integer propertyId);

}
