package com.realestate.duediligence.repository.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.admin.SupportTicket;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Integer> {

    @Query("SELECT st FROM SupportTicket st WHERE " +
            "(:status IS NULL OR st.status = :status) AND " +
            "(:priority IS NULL OR st.priority = :priority) AND " +
            "(:assignedToId IS NULL OR st.assignedTo.userId = :assignedToId) AND " +
            "(:userId IS NULL OR st.user.userId = :userId)")
    Page<SupportTicket> findWithFilters(
            @Param("status") String status,
            @Param("priority") String priority,
            @Param("assignedToId") Integer assignedToId,
            @Param("userId") Integer userId,
            Pageable pageable);

    long countByStatus(String status);
}
