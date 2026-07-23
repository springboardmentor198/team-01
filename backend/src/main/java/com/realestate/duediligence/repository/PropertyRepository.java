package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.domain.Pageable;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Integer> {

    List<Property> findByCity(String city);

    List<Property> findByPropertyType(String propertyType);
    List<Property> findAllByOrderByLastUpdatedDesc(Pageable pageable);
    long countByStatusIgnoreCase(String status);
}
