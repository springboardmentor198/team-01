package com.realestate.duediligence.service;

import java.util.List;

import com.realestate.duediligence.dto.PermitRequest;
import com.realestate.duediligence.dto.PermitResponse;

public interface PermitService {

    PermitResponse createPermit(PermitRequest request);

    List<PermitResponse> getPermits(Integer propertyId);

    PermitResponse updatePermit(Integer id, PermitRequest request);

    void deletePermit(Integer id);

}