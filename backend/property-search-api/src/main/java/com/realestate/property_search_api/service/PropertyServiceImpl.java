package com.realestate.property_search_api.service;

import com.realestate.property_search_api.entity.Property;
import com.realestate.property_search_api.exception.ResourceNotFoundException;
import com.realestate.property_search_api.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PropertyServiceImpl implements PropertyService {

    @Autowired
    private PropertyRepository propertyRepository;

    @Override
    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    @Override
    public Property getPropertyById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));
    }

    @Override
    public List<Property> getPropertiesByCity(String city) {
        return propertyRepository.findByCity(city);
    }

    @Override
    public List<Property> getPropertiesByType(String propertyType) {
        return propertyRepository.findByPropertyType(propertyType);
    }

    @Override
    public List<Property> getPropertiesByStatus(String status) {
        return propertyRepository.findByStatus(status);
    }
}