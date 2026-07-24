package com.realestate.duediligence.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.realestate.duediligence.entity.PropertyTaxHistory;

@Repository
public interface PropertyTaxRepository extends JpaRepository<PropertyTaxHistory, Long> {
    List<PropertyTaxHistory> findByProperty_PropertyId(Integer propertyId);
    List<PropertyTaxHistory> findByProperty_PropertyIdOrderByTaxYearDesc(Integer propertyId);
}
