package com.realestate.property_search_api.repository;

import com.realestate.property_search_api.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    // Search properties by city
    List<Property> findByCity(String city);

    // Search properties by property type
    List<Property> findByPropertyType(String propertyType);

    // Search properties by status
    List<Property> findByStatus(String status);
    
    // Find the 3 most recent properties
    List<Property> findFirst3ByOrderByCreatedAtDesc();
    
    // Count properties by status
    long countByStatus(String status);
}