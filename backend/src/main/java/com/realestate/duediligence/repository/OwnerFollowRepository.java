package com.realestate.duediligence.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.duediligence.entity.OwnerFollow;

public interface OwnerFollowRepository extends JpaRepository<OwnerFollow, Long> {

    Optional<OwnerFollow> findByUser_UserIdAndOwner_UserId(Integer userId, Integer ownerId);

    List<OwnerFollow> findByOwner_UserId(Integer ownerId);
}
