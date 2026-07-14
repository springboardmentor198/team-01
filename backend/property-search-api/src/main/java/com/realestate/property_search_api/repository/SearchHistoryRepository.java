package com.realestate.property_search_api.repository;

import com.realestate.property_search_api.entity.SearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {
    
    // Find the 10 most recent search history records
    List<SearchHistory> findFirst10ByOrderBySearchedAtDesc();
}
