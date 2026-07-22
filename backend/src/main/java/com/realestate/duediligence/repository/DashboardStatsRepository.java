package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.DashboardStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DashboardStatsRepository extends JpaRepository<DashboardStats, Long> {

}
