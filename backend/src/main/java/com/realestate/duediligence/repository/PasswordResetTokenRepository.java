package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.PasswordResetToken;
import com.realestate.duediligence.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenHashAndUsedAtIsNull(String tokenHash);
    void deleteByUser(User user);
}
