package com.realestate.duediligence.service;

import java.util.List;

import com.realestate.duediligence.dto.PropertySuggestion;
import com.realestate.duediligence.entity.Property;

public interface PropertyService {

    Property save(Property property);

    List<Property> getAll();

    Property getById(Integer id);

    Property update(Integer id, Property property);

    void delete(Integer id);
    

List<Property> searchProperties(String keyword);

    /**
     * Ranked, paginated global keyword search across all searchable fields.
     * Returns an empty list (never throws) when nothing matches.
     */
    List<Property> globalSearch(String keyword, int page, int size);

    /**
     * Autocomplete suggestions (max 10) for the given partial keyword.
     * Returns an empty list when nothing matches.
     */
    List<PropertySuggestion> autocomplete(String keyword);
}
