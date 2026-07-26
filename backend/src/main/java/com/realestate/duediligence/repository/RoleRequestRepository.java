package com.realestate.duediligence.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.RoleRequest;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;

@Repository
public interface RoleRequestRepository extends JpaRepository<RoleRequest, Integer> {

    List<RoleRequest> findByUser(User user);

    List<RoleRequest> findByStatus(AccountStatus status);

    List<RoleRequest> findByRequestedRole(Role requestedRole);

    List<RoleRequest> findByStatusAndRequestedRole(AccountStatus status, Role requestedRole);

    boolean existsByUserAndStatus(User user, AccountStatus status);
}
