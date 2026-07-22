package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.PropertyTaxHistoryResponse;
import com.realestate.duediligence.dto.PropertyTaxSummaryResponse;
import java.util.List;

public interface PropertyTaxService {
    List<PropertyTaxHistoryResponse> getTaxHistoryByPropertyId(Integer propertyId);
    PropertyTaxSummaryResponse getTaxSummaryByPropertyId(Integer propertyId);
    PropertyTaxHistoryResponse addTaxRecord(Integer propertyId, PropertyTaxHistoryResponse record);
    PropertyTaxHistoryResponse updateTaxRecord(Long taxHistoryId, PropertyTaxHistoryResponse record);
    void deleteTaxRecord(Long taxHistoryId);
}
