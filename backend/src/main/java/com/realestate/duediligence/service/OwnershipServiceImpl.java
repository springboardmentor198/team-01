package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.OwnershipResponse;
import com.realestate.duediligence.entity.OwnershipRecord;
import com.realestate.duediligence.repository.OwnershipRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}