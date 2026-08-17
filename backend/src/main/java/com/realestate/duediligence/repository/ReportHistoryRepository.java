package com.realestate.duediligence.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.ReportHistory;

@Repository
public interface ReportHistoryRepository extends JpaRepository<ReportHistory, Long> {

    List<ReportHistory> findByReportIdOrderByPerformedAtDesc(Long reportId);

    long countByAction(String action);
}
