package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Integer> {

    List<Property> findByCity(String city);

    List<Property> findByPropertyType(String propertyType);
}
