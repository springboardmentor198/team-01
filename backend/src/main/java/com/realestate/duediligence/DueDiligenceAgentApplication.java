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