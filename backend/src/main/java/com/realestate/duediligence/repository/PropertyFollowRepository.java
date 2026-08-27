package com.realestate.duediligence.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.duediligence.entity.PropertyFollow;

public interface PropertyFollowRepository extends JpaRepository<PropertyFollow, Long> {

    Optional<PropertyFollow> findByUser_UserIdAndProperty_PropertyId(
            Integer userId,
            Integer propertyId);

    List<PropertyFollow> findByProperty_PropertyId(Integer propertyId);

    List<PropertyFollow> findByUser_UserId(Integer userId);
    List<PropertyFollow> findByProperty_ManagedBy_UserIdAndFollowReason(Integer agentId, com.realestate.duediligence.enums.FollowReason followReason);

    void deleteByUser_UserIdAndProperty_PropertyId(Integer userId, Integer propertyId);
}
