package com.realestate.duediligence.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.Report;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findByPropertyIdOrderByCreatedAtDesc(Integer propertyId);

    long countByCreatedBy(String createdBy);

    @Query("""
            SELECT COUNT(DISTINCT r.propertyId)
            FROM Report r
            WHERE r.createdBy = :buyerEmail
            """)
    long countDistinctPropertiesByCreatedBy(@Param("buyerEmail") String buyerEmail);
}
