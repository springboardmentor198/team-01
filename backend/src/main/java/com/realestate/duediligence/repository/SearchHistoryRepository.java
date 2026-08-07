package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.SearchHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {

    // Last N searches
    List<SearchHistory> findByUser_UserIdOrderBySearchedAtDesc(
            Integer userId,
            Pageable pageable);

    // All searches of user
    List<SearchHistory> findByUser_UserIdOrderBySearchedAtDesc(
            Integer userId);

    // Latest searches (Admin)
    List<SearchHistory> findAllByOrderBySearchedAtDesc(
            Pageable pageable);

    // Find existing search of same property
    Optional<SearchHistory> findFirstByUser_UserIdAndProperty_PropertyIdOrderBySearchedAtDesc(
            Integer userId,
            Integer propertyId);

// Delete all except keepIds
    void deleteByUser_UserIdAndSearchIdNotIn(
            Integer userId,
            List<Long> keepIds);

    // Delete a single search entry owned by the given user
    void deleteBySearchIdAndUser_UserId(Long searchId, Integer userId);

    // Delete all search history for the given user
    void deleteByUser_UserId(Integer userId);
}
