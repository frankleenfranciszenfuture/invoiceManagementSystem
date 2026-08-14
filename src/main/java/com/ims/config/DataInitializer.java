package com.ims.config;


import com.ims.entity.*;
import com.ims.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;



    @Override
    public void run(String... args) {
        createDefaultRoleAndAdmin();
    }

    private void createDefaultRoleAndAdmin(){
        log.info("========== Initializing Default Admin ==========");
        String adminEmail = "admin@ims.com";
        String adminPassword = "admin123";

        String roleName = "ADMIN";

        RoleEntity role = roleRepository
                .findByRoleName(roleName)
                .orElseGet(() -> {

                    RoleEntity r = new RoleEntity();
                    r.setRoleName(roleName);

                    return roleRepository.save(r);
                });
        if (!userRepository.existsByEmail(adminEmail)) {

            UserEntity admin = UserEntity.builder()
                    .userId("USR001")
                    .name("ADMIN")
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(role)
                    // IMPORTANT
                    .isAccountVerified(true)
                    .build();

            userRepository.save(admin);

            log.info("Admin user created.");
        }

        log.info("====================================");
        log.info("Default Admin Credentials");
        log.info("Email    : {}", adminEmail);
        log.info("Password : {}", adminPassword);
        log.info("====================================");
    }
}
