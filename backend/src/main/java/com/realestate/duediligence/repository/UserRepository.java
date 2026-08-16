package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    List<User> findByRole(Role role);

    long countByRole(Role role);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(u) FROM User u WHERE u.role IN :roles")
    long countByRoleIn(@Param("roles") List<Role> roles);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :since")
    long countUsersSince(@Param("since") java.time.LocalDateTime since);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE " +
            "(:role IS NULL OR u.role = :role) AND " +
            "(:status IS NULL OR u.status = :status) AND " +
            "(:search IS NULL OR LOWER(u.name) LIKE :search OR LOWER(u.email) LIKE :search) AND " +
            "(CAST(:startDate AS timestamp) IS NULL OR u.createdAt >= :startDate) AND " +
            "(CAST(:endDate AS timestamp) IS NULL OR u.createdAt <= :endDate)")
    org.springframework.data.domain.Page<User> findWithFilters(
            @Param("role") Role role,
            @Param("status") com.realestate.duediligence.enums.AccountStatus status,
            @Param("search") String search,
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate,
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT u.createdAt, COUNT(u) FROM User u WHERE u.createdAt >= :since GROUP BY u.createdAt ORDER BY u.createdAt ASC")
    List<Object[]> findActivityCountGroupByDate(@Param("since") java.time.LocalDateTime since);
}