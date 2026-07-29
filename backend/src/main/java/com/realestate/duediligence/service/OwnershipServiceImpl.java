package com.realestate.duediligence.service;

import com.realestate.duediligence.exception.ResourceNotFoundException;

import com.realestate.duediligence.dto.OwnershipResponse;
import com.realestate.duediligence.entity.OwnershipRecord;
import com.realestate.duediligence.repository.OwnershipRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OwnershipServiceImpl implements OwnershipService {

    private final OwnershipRecordRepository ownershipRecordRepository;

    @Autowired
    public OwnershipServiceImpl(OwnershipRecordRepository ownershipRecordRepository) {
        this.ownershipRecordRepository = ownershipRecordRepository;
    }

    @Override
    public List<OwnershipResponse> getOwnershipByPropertyId(Integer propertyId) {

        List<OwnershipRecord> records =
                ownershipRecordRepository.findByPropertyPropertyId(propertyId);

        List<OwnershipResponse> responseList = new ArrayList<>();

        for (OwnershipRecord record : records) {

            OwnershipResponse response = OwnershipResponse.builder()
                    .ownershipId(record.getOwnershipId())
                    .propertyId(record.getProperty().getPropertyId())
                    .ownerName(record.getOwnerName())
                    .ownerType(record.getOwnerType())
                    .registrationNumber(record.getRegistrationNumber())
                    .verified(record.getVerified())
                    .ownershipStartDate(record.getOwnershipStartDate())
                    .ownershipEndDate(record.getOwnershipEndDate())
                    .build();

            responseList.add(response);
        }

        return responseList;
    }

    @Override
    public OwnershipRecord createOwnership(OwnershipRecord ownershipRecord) {

        ownershipRecord.setCreatedAt(LocalDateTime.now());

        return ownershipRecordRepository.save(ownershipRecord);
    }

    @Override
    public OwnershipRecord updateOwnership(Integer ownershipId,
                                           OwnershipRecord ownershipRecord) {

        OwnershipRecord existing = ownershipRecordRepository.findById(ownershipId)
                .orElseThrow(() -> new ResourceNotFoundException("Ownership record not found"));

        existing.setOwnerName(ownershipRecord.getOwnerName());
        existing.setOwnerType(ownershipRecord.getOwnerType());
        existing.setRegistrationNumber(ownershipRecord.getRegistrationNumber());
        existing.setVerified(ownershipRecord.getVerified());
        existing.setOwnershipStartDate(ownershipRecord.getOwnershipStartDate());
        existing.setOwnershipEndDate(ownershipRecord.getOwnershipEndDate());

        if (ownershipRecord.getProperty() != null) {
            existing.setProperty(ownershipRecord.getProperty());
        }

        return ownershipRecordRepository.save(existing);
    }

    @Override
    public void deleteOwnership(Integer ownershipId) {

        OwnershipRecord existing = ownershipRecordRepository.findById(ownershipId)
                .orElseThrow(() -> new ResourceNotFoundException("Ownership record not found"));

        ownershipRecordRepository.delete(existing);
    }
}
