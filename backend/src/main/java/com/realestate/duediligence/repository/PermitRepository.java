package com.realestate.duediligence.repository;

import java.util.List;
import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.PermitRecord;

@Repository
public interface PermitRepository extends JpaRepository<PermitRecord, Integer> {

    List<PermitRecord> findByProperty_PropertyId(Integer propertyId);
    List<PermitRecord> findByExpiryDateBetweenOrderByExpiryDateAsc(LocalDate from, LocalDate to);

}
