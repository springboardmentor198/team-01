package com.realestate.property_search_api.service;

import com.realestate.property_search_api.entity.Property;
import java.util.List;

public interface PropertyService {

    List<Property> getAllProperties();

    Property getPropertyById(Long id);

    List<Property> getPropertiesByCity(String city);

    List<Property> getPropertiesByType(String propertyType);

    List<Property> getPropertiesByStatus(String status);
}