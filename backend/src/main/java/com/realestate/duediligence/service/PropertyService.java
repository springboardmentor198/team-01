package com.realestate.duediligence.service;

import com.realestate.duediligence.entity.Property;

import java.util.List;

public interface PropertyService {

    Property save(Property property);

    List<Property> getAll();

    Property getById(Integer id);

    Property update(Integer id, Property property);

    void delete(Integer id);

    List<Property> searchByCity(String city);
}