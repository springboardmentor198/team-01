package com.realestate.duediligence.repository.admin;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.admin.VerificationRecord;

@Repository
public interface VerificationRecordRepository extends JpaRepository<VerificationRecord, Integer> {

    @Query("SELECT vr FROM VerificationRecord vr WHERE " +
            "(:status IS NULL OR vr.status = :status) AND " +
            "(:type IS NULL OR vr.type = :type) AND " +
            "(:verifierId IS NULL OR vr.verifier.userId = :verifierId) AND " +
            "(:propertyId IS NULL OR vr.property.propertyId = :propertyId)")
    Page<VerificationRecord> findWithFilters(
            @Param("status") String status,
            @Param("type") String type,
            @Param("verifierId") Integer verifierId,
            @Param("propertyId") Integer propertyId,
            Pageable pageable);

    long countByStatus(String status);
}
