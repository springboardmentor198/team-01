package com.realestate.duediligence.service;

import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PropertyServiceImpl implements PropertyService {

    @Autowired
    private PropertyRepository propertyRepository;

    @Override
    public Property save(Property property) {

        if (property.getPropertyCode() == null || property.getPropertyCode().isBlank()) {
            throw new RuntimeException("Property Code is required");
        }

        if (property.getAddress() == null || property.getAddress().isBlank()) {
            throw new RuntimeException("Address is required");
        }

        if (property.getCity() == null || property.getCity().isBlank()) {
            throw new RuntimeException("City is required");
        }

        if (property.getCountry() == null || property.getCountry().isBlank()) {
            throw new RuntimeException("Country is required");
        }

        return propertyRepository.save(property);
    }

    @Override
    public List<Property> getAll() {
        return propertyRepository.findAll();
    }

    @Override
    public Property getById(Integer id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
    }

    @Override
    public Property update(Integer id, Property property) {

        Property existing = getById(id);

        existing.setPropertyCode(property.getPropertyCode());
        existing.setParcelId(property.getParcelId());
        existing.setAddress(property.getAddress());
        existing.setCity(property.getCity());
        existing.setCountry(property.getCountry());
        existing.setPropertyType(property.getPropertyType());
        existing.setLandUse(property.getLandUse());
        existing.setLotSizeSqft(property.getLotSizeSqft());
        existing.setYearBuilt(property.getYearBuilt());
        existing.setBedrooms(property.getBedrooms());
        existing.setBathrooms(property.getBathrooms());
        existing.setOwnerName(property.getOwnerName());
        existing.setStatus(property.getStatus());
        existing.setImageUrl(property.getImageUrl());

        return propertyRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        propertyRepository.deleteById(id);
    }

    @Override
    public List<Property> searchByCity(String city) {
        return propertyRepository.findByCity(city);
    }
}
