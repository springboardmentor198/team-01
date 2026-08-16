package com.realestate.duediligence.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
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

    @org.springframework.data.jpa.repository.Query("SELECT rr FROM RoleRequest rr WHERE " +
            "(:status IS NULL OR rr.status = :status) AND " +
            "(:requestedRole IS NULL OR rr.requestedRole = :requestedRole) AND " +
            "(:search IS NULL OR LOWER(rr.user.name) LIKE :search OR LOWER(rr.user.email) LIKE :search)")
    org.springframework.data.domain.Page<RoleRequest> findWithFilters(
            @Param("status") AccountStatus status,
            @Param("requestedRole") Role requestedRole,
            @Param("search") String search,
            org.springframework.data.domain.Pageable pageable);
}
