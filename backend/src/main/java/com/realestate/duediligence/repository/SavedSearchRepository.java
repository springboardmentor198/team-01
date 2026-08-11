package com.realestate.duediligence.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.realestate.duediligence.entity.SavedSearch;

public interface SavedSearchRepository extends JpaRepository<SavedSearch, Long> {
    List<SavedSearch> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);
    Optional<SavedSearch> findByIdAndUser_UserId(Long id, Integer userId);
}
