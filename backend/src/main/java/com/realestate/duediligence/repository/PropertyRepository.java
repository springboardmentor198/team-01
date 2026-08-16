package com.realestate.duediligence.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.Property;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Integer> {

    List<Property> findByCity(String city);

    /**
     * Ranked, paginated global keyword search.
     * Matches case-insensitively (contains) across all searchable fields
     * and ranks results by relevance. Leading/trailing spaces are trimmed
     * via the service layer before invoking this query.
     */
    @Query("""
            SELECT p FROM Property p
            WHERE LOWER(TRIM(p.propertyCode)) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(COALESCE(TRIM(p.parcelId), '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(TRIM(p.address)) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(COALESCE(TRIM(p.city), '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(COALESCE(TRIM(p.country), '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(COALESCE(TRIM(p.propertyType), '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(COALESCE(TRIM(p.landUse), '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(COALESCE(TRIM(p.ownerName), '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
            ORDER BY
                CASE
                    WHEN LOWER(TRIM(p.propertyCode)) = LOWER(:kw) THEN 0
                    WHEN LOWER(TRIM(p.propertyCode)) LIKE LOWER(CONCAT(:kw, '%')) THEN 1
                    WHEN LOWER(TRIM(p.propertyCode)) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 2
                    WHEN LOWER(TRIM(p.address)) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 3
                    WHEN LOWER(COALESCE(TRIM(p.city), '')) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 4
                    WHEN LOWER(COALESCE(TRIM(p.propertyType), '')) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 5
                    WHEN LOWER(COALESCE(TRIM(p.landUse), '')) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 6
                    WHEN LOWER(COALESCE(TRIM(p.ownerName), '')) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 7
                    ELSE 8
                END,
                p.propertyCode ASC
            """)
    List<Property> globalSearch(@Param("keyword") String keyword,
                                @Param("kw") String kw,
                                Pageable pageable);

    @Query("""
            SELECT p FROM Property p
            WHERE LOWER(p.city) = LOWER(:city)
            """)
    List<Property> findByCityIgnoreCase(@Param("city") String city);

    List<Property> findByCityIgnoreCaseAndPropertyTypeIgnoreCase(
            String city,
            String propertyType
    );

    List<Property> findByPropertyType(String propertyType);
    List<Property> findAllByOrderByLastUpdatedDesc(Pageable pageable);
    long countByStatusIgnoreCase(String status);
    long countByStatus(String status);

    @Query("SELECT COUNT(p) FROM Property p WHERE p.createdAt >= :since")
    long countPropertiesSince(@Param("since") java.time.LocalDateTime since);

    @Query("SELECT p FROM Property p WHERE " +
            "(:status IS NULL OR p.status = :status) AND " +
            "(:propertyType IS NULL OR p.propertyType = :propertyType) AND " +
            "(:city IS NULL OR p.city = :city) AND " +
            "(:ownerName IS NULL OR LOWER(p.ownerName) LIKE :ownerName) AND " +
            "(CAST(:startDate AS timestamp) IS NULL OR p.createdAt >= :startDate) AND " +
            "(CAST(:endDate AS timestamp) IS NULL OR p.createdAt <= :endDate)")
    org.springframework.data.domain.Page<Property> findWithFilters(
            @Param("status") String status,
            @Param("propertyType") String propertyType,
            @Param("city") String city,
            @Param("ownerName") String ownerName,
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate,
            org.springframework.data.domain.Pageable pageable);

    @Query("SELECT p.createdAt, COUNT(p) FROM Property p WHERE p.createdAt >= :since GROUP BY p.createdAt ORDER BY p.createdAt ASC")
    List<Object[]> findActivityCountGroupByDate(@Param("since") java.time.LocalDateTime since);

    @Query("""
SELECT p FROM Property p
WHERE
    LOWER(p.propertyCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
    OR LOWER(COALESCE(p.parcelId, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
    OR LOWER(p.address) LIKE LOWER(CONCAT('%', :keyword, '%'))
    OR LOWER(p.city) LIKE LOWER(CONCAT('%', :keyword, '%'))
    OR LOWER(p.country) LIKE LOWER(CONCAT('%', :keyword, '%'))
    OR LOWER(p.propertyType) LIKE LOWER(CONCAT('%', :keyword, '%'))
    OR LOWER(p.landUse) LIKE LOWER(CONCAT('%', :keyword, '%'))
    OR LOWER(COALESCE(p.ownerName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
ORDER BY p.lastUpdated DESC
""")
List<Property> searchProperties(@Param("keyword") String keyword);
}
