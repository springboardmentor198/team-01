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

    List<Property> findByPropertyType(String propertyType);
    List<Property> findAllByOrderByLastUpdatedDesc(Pageable pageable);
    long countByStatusIgnoreCase(String status);

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
