package com.realestate.duediligence.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.duediligence.entity.PasswordResetToken;
import com.realestate.duediligence.entity.User;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHashAndUsedAtIsNull(String tokenHash);

    Optional<PasswordResetToken> findTopByUserAndUsedAtIsNullOrderByExpiresAtDesc(User user);

    void deleteByUser(User user);
}