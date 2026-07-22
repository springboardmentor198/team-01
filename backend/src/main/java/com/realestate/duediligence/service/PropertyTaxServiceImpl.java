package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.PropertyTaxHistoryResponse;
import com.realestate.duediligence.dto.PropertyTaxSummaryResponse;
import com.realestate.duediligence.entity.Property;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class PropertyTaxServiceImpl implements PropertyTaxService {

    @Autowired
    private PropertyService propertyService;

    // Thread-safe in-memory store for tax history
    private final Map<Integer, List<PropertyTaxHistoryResponse>> taxStore = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1000);

    private void ensureInitialized(Integer propertyId) {
        if (!taxStore.containsKey(propertyId)) {
            List<PropertyTaxHistoryResponse> defaultRecords = new ArrayList<>();
            
            // 2025 Tax Record
            defaultRecords.add(PropertyTaxHistoryResponse.builder()
                    .taxHistoryId(idGenerator.incrementAndGet())
                    .propertyId(propertyId)
                    .taxYear(2025)
                    .assessedValue(BigDecimal.valueOf(250000.00))
                    .taxAmount(BigDecimal.valueOf(3125.00))
                    .paymentStatus("PENDING")
                    .dueDate(LocalDate.of(2025, 12, 31))
                    .paymentDate(null)
                    .build());

            // 2024 Tax Record
            defaultRecords.add(PropertyTaxHistoryResponse.builder()
                    .taxHistoryId(idGenerator.incrementAndGet())
                    .propertyId(propertyId)
                    .taxYear(2024)
                    .assessedValue(BigDecimal.valueOf(245000.00))
                    .taxAmount(BigDecimal.valueOf(3062.50))
                    .paymentStatus("PAID")
                    .dueDate(LocalDate.of(2024, 12, 31))
                    .paymentDate(LocalDate.of(2024, 12, 15))
                    .build());

            // 2023 Tax Record
            defaultRecords.add(PropertyTaxHistoryResponse.builder()
                    .taxHistoryId(idGenerator.incrementAndGet())
                    .propertyId(propertyId)
                    .taxYear(2023)
                    .assessedValue(BigDecimal.valueOf(238000.00))
                    .taxAmount(BigDecimal.valueOf(2975.00))
                    .paymentStatus("PAID")
                    .dueDate(LocalDate.of(2023, 12, 31))
                    .paymentDate(LocalDate.of(2023, 12, 20))
                    .build());

            taxStore.put(propertyId, defaultRecords);
        }
    }

    @Override
    public List<PropertyTaxHistoryResponse> getTaxHistoryByPropertyId(Integer propertyId) {
        // Verify property exists
        propertyService.getById(propertyId);

        // Prepopulate defaults if first time
        ensureInitialized(propertyId);

        return taxStore.get(propertyId);
    }

    @Override
    public PropertyTaxSummaryResponse getTaxSummaryByPropertyId(Integer propertyId) {
        // Verify property exists
        propertyService.getById(propertyId);

        // Prepopulate defaults if first time
        ensureInitialized(propertyId);

        List<PropertyTaxHistoryResponse> records = taxStore.get(propertyId);

        String overallStatus = "PAID";
        String overallRisk = "LOW";
        BigDecimal totalPaid = BigDecimal.ZERO;
        BigDecimal totalUnpaid = BigDecimal.ZERO;

        boolean hasDelinquent = false;
        boolean hasPending = false;

        for (PropertyTaxHistoryResponse r : records) {
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
        propertyService.getById(propertyId);

        // Prepopulate defaults if first time
        ensureInitialized(propertyId);

        record.setTaxHistoryId(idGenerator.incrementAndGet());
        record.setPropertyId(propertyId);

        taxStore.get(propertyId).add(record);
        return record;
    }

    @Override
    public PropertyTaxHistoryResponse updateTaxRecord(Long taxHistoryId, PropertyTaxHistoryResponse record) {
        for (Map.Entry<Integer, List<PropertyTaxHistoryResponse>> entry : taxStore.entrySet()) {
            List<PropertyTaxHistoryResponse> list = entry.getValue();
            for (int i = 0; i < list.size(); i++) {
                PropertyTaxHistoryResponse r = list.get(i);
                if (r.getTaxHistoryId().equals(taxHistoryId)) {
                    // Update fields
                    r.setTaxYear(record.getTaxYear());
                    r.setAssessedValue(record.getAssessedValue());
                    r.setTaxAmount(record.getTaxAmount());
                    r.setPaymentStatus(record.getPaymentStatus());
                    r.setDueDate(record.getDueDate());
                    r.setPaymentDate(record.getPaymentDate());
                    return r;
                }
            }
        }
        throw new RuntimeException("Tax record not found with ID: " + taxHistoryId);
    }

    @Override
    public void deleteTaxRecord(Long taxHistoryId) {
        for (Map.Entry<Integer, List<PropertyTaxHistoryResponse>> entry : taxStore.entrySet()) {
            List<PropertyTaxHistoryResponse> list = entry.getValue();
            for (int i = 0; i < list.size(); i++) {
                if (list.get(i).getTaxHistoryId().equals(taxHistoryId)) {
                    list.remove(i);
                    return;
                }
            }
        }
        throw new RuntimeException("Tax record not found with ID: " + taxHistoryId);
    }
}
