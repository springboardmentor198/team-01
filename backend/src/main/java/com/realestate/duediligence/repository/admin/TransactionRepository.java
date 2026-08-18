package com.realestate.duediligence.repository.admin;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.admin.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {

    @Query("SELECT t FROM Transaction t WHERE " +
            "(:status IS NULL OR t.status = :status) AND " +
            "(:buyerId IS NULL OR t.buyer.userId = :buyerId) AND " +
            "(:agentId IS NULL OR t.agent.userId = :agentId) AND " +
            "(:propertyId IS NULL OR t.property.propertyId = :propertyId) AND " +
            "(CAST(:startDate AS timestamp) IS NULL OR t.createdAt >= :startDate) AND " +
            "(CAST(:endDate AS timestamp) IS NULL OR t.createdAt <= :endDate)")
    Page<Transaction> findWithFilters(
            @Param("status") String status,
            @Param("buyerId") Integer buyerId,
            @Param("agentId") Integer agentId,
            @Param("propertyId") Integer propertyId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    long countByStatus(String status);
    long countByAgent_UserIdAndStatus(Integer agentId, String status);
    List<Transaction> findByAgent_UserIdOrderByCreatedAtDesc(Integer agentId);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.createdAt >= :since")
    long countTransactionsSince(@Param("since") LocalDateTime since);

    @Query("SELECT t.createdAt, COUNT(t) FROM Transaction t WHERE t.createdAt >= :since GROUP BY t.createdAt ORDER BY t.createdAt ASC")
    List<Object[]> findActivityCountGroupByDate(@Param("since") LocalDateTime since);
}
