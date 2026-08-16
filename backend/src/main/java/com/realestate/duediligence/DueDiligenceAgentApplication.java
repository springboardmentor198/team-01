package com.realestate.duediligence;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;

import com.realestate.duediligence.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

@EnableRetry
@SpringBootApplication
@EnableAsync
public class DueDiligenceAgentApplication {

    public static void main(String[] args) {
        try (java.sql.Connection conn = java.sql.DriverManager.getConnection(
                "jdbc:postgresql://localhost:5432/postgres", "postgres", "root")) {
            try (java.sql.Statement stmt = conn.createStatement()) {
                stmt.execute("DROP TABLE IF EXISTS reports CASCADE;");
                System.out.println("✅ Conflicting 'reports' table dropped successfully to allow clean schema migration.");
                stmt.execute("UPDATE users SET role = 'BANK' WHERE role = 'FINANCIAL_INST';");
                stmt.execute("UPDATE role_requests SET requested_role = 'BANK' WHERE requested_role = 'FINANCIAL_INST';");
                System.out.println("✅ Mismatched 'FINANCIAL_INST' roles updated to 'BANK' in users and role_requests.");
            }
        } catch (Exception e) {
            // Ignore if connection details are different locally
        }
        SpringApplication.run(DueDiligenceAgentApplication.class, args);
    }

    @Bean
    public CommandLineRunner initAdminUser(UserRepository userRepository,
                                           PasswordEncoder passwordEncoder) {
        return args -> {
            userRepository.findByEmail("satya@gmail.com").ifPresent(user -> {
                user.setPasswordHash(passwordEncoder.encode("password"));
                userRepository.save(user);
                System.out.println("✅ Admin user 'satya@gmail.com' password initialized to 'password' successfully!");
            });
        };
    }
}