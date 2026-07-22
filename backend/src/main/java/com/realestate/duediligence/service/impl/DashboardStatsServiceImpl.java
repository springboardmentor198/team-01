package com.realestate.duediligence.service.impl;

import com.realestate.duediligence.entity.DashboardStats;
import com.realestate.duediligence.repository.DashboardStatsRepository;
import com.realestate.duediligence.service.DashboardStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardStatsServiceImpl implements DashboardStatsService {

    private final DashboardStatsRepository dashboardStatsRepository;

    @Override
    public DashboardStats getDashboardStats() {
        return dashboardStatsRepository.findAll().stream()
                .findFirst()
                .orElse(null);
    }
}
