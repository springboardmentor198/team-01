package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.PasswordResetToken;
<<<<<<< HEAD
import com.realestate.duediligence.entity.User;
=======
>>>>>>> upstream/develop
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

<<<<<<< HEAD
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenHashAndUsedAtIsNull(String tokenHash);
    void deleteByUser(User user);
}
=======
public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, Integer> {

    Optional<PasswordResetToken> findByToken(String token);

}
>>>>>>> upstream/develop
