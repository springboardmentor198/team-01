package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.PropertyTaxHistoryResponse;
import com.realestate.duediligence.dto.PropertyTaxSummaryResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.PropertyTaxHistory;
import com.realestate.duediligence.repository.PropertyTaxRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PropertyTaxServiceImpl implements PropertyTaxService {

    @Autowired
    private PropertyService propertyService;

    @Autowired
    private PropertyTaxRepository propertyTaxRepository;

    private PropertyTaxHistoryResponse mapToResponse(PropertyTaxHistory entity) {
        return PropertyTaxHistoryResponse.builder()
                .taxHistoryId(entity.getTaxHistoryId())
                .propertyId(entity.getProperty().getPropertyId())
                .taxYear(entity.getTaxYear())
                .assessedValue(entity.getAssessedValue())
                .taxAmount(entity.getTaxAmount())
                .paymentStatus(entity.getPaymentStatus())
                .dueDate(entity.getDueDate())
                .paymentDate(entity.getPaymentDate())
                .build();
    }

    @Override
    public List<PropertyTaxHistoryResponse> getTaxHistoryByPropertyId(Integer propertyId) {
        // Verify property exists
        propertyService.getById(propertyId);

        return propertyTaxRepository.findByProperty_PropertyIdOrderByTaxYearDesc(propertyId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PropertyTaxSummaryResponse getTaxSummaryByPropertyId(Integer propertyId) {
        // Verify property exists
        propertyService.getById(propertyId);

        List<PropertyTaxHistory> records = propertyTaxRepository.findByProperty_PropertyId(propertyId);

        if (records.isEmpty()) {
            return PropertyTaxSummaryResponse.builder()
                    .propertyId(propertyId)
                    .taxStatus(null)
                    .taxRisk(null)
                    .totalPaidAmount(null)
                    .totalUnpaidAmount(null)
                    .build();
        }

        String overallStatus = "PAID";
        String overallRisk = "LOW";
        BigDecimal totalPaid = BigDecimal.ZERO;
        BigDecimal totalUnpaid = BigDecimal.ZERO;

        boolean hasDelinquent = false;
        boolean hasPending = false;

        for (PropertyTaxHistory r : records) {
            BigDecimal amt = r.getTaxAmount() != null ? r.getTaxAmount() : BigDecimal.ZERO;

            if ("DELINQUENT".equalsIgnoreCase(r.getPaymentStatus())) {
                hasDelinquent = true;
                totalUnpaid = totalUnpaid.add(amt);
            } else if ("PENDING".equalsIgnoreCase(r.getPaymentStatus())) {
                hasPending = true;
                totalUnpaid = totalUnpaid.add(amt);
            } else if ("PAID".equalsIgnoreCase(r.getPaymentStatus())) {
                totalPaid = totalPaid.add(amt);
            }
        }

        if (hasDelinquent) {
            overallStatus = "DELINQUENT";
            overallRisk = "HIGH";
        } else if (hasPending) {
            overallStatus = "PENDING";
            overallRisk = "MEDIUM";
        }

        return PropertyTaxSummaryResponse.builder()
                .propertyId(propertyId)
                .taxStatus(overallStatus)
                .taxRisk(overallRisk)
                .totalPaidAmount(totalPaid)
                .totalUnpaidAmount(totalUnpaid)
                .build();
    }

    @Override
    public PropertyTaxHistoryResponse addTaxRecord(Integer propertyId, PropertyTaxHistoryResponse record) {
        // Verify property exists
        Property property = propertyService.getById(propertyId);

        PropertyTaxHistory entity = PropertyTaxHistory.builder()
                .property(property)
                .taxYear(record.getTaxYear())
                .assessedValue(record.getAssessedValue())
                .taxAmount(record.getTaxAmount())
                .paymentStatus(record.getPaymentStatus())
                .dueDate(record.getDueDate())
                .paymentDate(record.getPaymentDate())
                .build();

        PropertyTaxHistory saved = propertyTaxRepository.save(entity);
        return mapToResponse(saved);
    }

    @Override
    public PropertyTaxHistoryResponse updateTaxRecord(Long taxHistoryId, PropertyTaxHistoryResponse record) {
        PropertyTaxHistory existing = propertyTaxRepository.findById(taxHistoryId)
                .orElseThrow(() -> new RuntimeException("Tax record not found with ID: " + taxHistoryId));

        existing.setTaxYear(record.getTaxYear());
        existing.setAssessedValue(record.getAssessedValue());
        existing.setTaxAmount(record.getTaxAmount());
        existing.setPaymentStatus(record.getPaymentStatus());
        existing.setDueDate(record.getDueDate());
        existing.setPaymentDate(record.getPaymentDate());

        PropertyTaxHistory saved = propertyTaxRepository.save(existing);
        return mapToResponse(saved);
    }

    @Override
    public void deleteTaxRecord(Long taxHistoryId) {
        PropertyTaxHistory existing = propertyTaxRepository.findById(taxHistoryId)
                .orElseThrow(() -> new RuntimeException("Tax record not found with ID: " + taxHistoryId));
        propertyTaxRepository.delete(existing);
    }
}
