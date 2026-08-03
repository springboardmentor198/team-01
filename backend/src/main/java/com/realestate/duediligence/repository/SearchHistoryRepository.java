package com.realestate.duediligence.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.SearchHistory;

@Repository
public interface SearchHistoryRepository
        extends JpaRepository<SearchHistory, Long> {

    List<SearchHistory> findByUser_UserIdOrderBySearchedAtDesc(
            Integer userId,
            org.springframework.data.domain.Pageable pageable);

    List<SearchHistory> findAllByOrderBySearchedAtDesc(
            org.springframework.data.domain.Pageable pageable);
}

