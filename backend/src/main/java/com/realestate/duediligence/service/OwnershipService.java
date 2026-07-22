package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.OwnershipResponse;
import com.realestate.duediligence.entity.OwnershipRecord;

import java.util.List;

public interface OwnershipService {

    List<OwnershipResponse> getOwnershipByPropertyId(Integer propertyId);

    OwnershipRecord createOwnership(OwnershipRecord ownershipRecord);

    OwnershipRecord updateOwnership(Integer ownershipId,
                                    OwnershipRecord ownershipRecord);

    void deleteOwnership(Integer ownershipId);

}