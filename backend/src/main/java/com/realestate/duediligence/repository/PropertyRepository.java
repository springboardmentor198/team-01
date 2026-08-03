package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.domain.Pageable;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Integer> {

    List<Property> findByCity(String city);

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
            WHERE LOWER(p.address) LIKE LOWER(CONCAT('%', :term, '%'))
               OR LOWER(p.propertyCode) LIKE LOWER(CONCAT('%', :term, '%'))
            """)
    List<Property> searchByTerm(@Param("term") String term);
}
