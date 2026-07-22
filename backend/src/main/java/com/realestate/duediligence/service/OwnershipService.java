package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.OwnershipResponse;

import java.util.List;

public interface OwnershipService {

    List<OwnershipResponse> getOwnershipByPropertyId(Integer propertyId);

}