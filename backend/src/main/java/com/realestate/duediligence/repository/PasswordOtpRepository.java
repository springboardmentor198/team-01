package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.PasswordOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Repository for the legacy OTP flow retained by {@code OtpService}. */
public interface PasswordOtpRepository extends JpaRepository<PasswordOtp, Long> {

    List<PasswordOtp> findByEmail(String email);

    void deleteByEmail(String email);
}
