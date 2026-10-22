package com.example.incidentmanagement.config;

import com.example.incidentmanagement.entity.*;
import com.example.incidentmanagement.entity.enums.*;
import com.example.incidentmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
@Profile("!test")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final IncidentRepository incidentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking and seeding initial roles and enterprise users...");

        Role adminRole = roleRepository.findByName(RoleType.ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ADMIN)));
        Role supportRole = roleRepository.findByName(RoleType.SUPPORT)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.SUPPORT)));
        Role devRole = roleRepository.findByName(RoleType.DEVELOPER)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.DEVELOPER)));

        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@enterprise.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("System")
                    .lastName("Administrator")
                    .enabled(true)
                    .roles(Set.of(adminRole, supportRole))
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created: admin / admin123");
        }

        User supportUser = userRepository.findByUsername("support").orElse(null);
        if (supportUser == null) {
            supportUser = User.builder()
                    .username("support")
                    .email("support@enterprise.com")
                    .password(passwordEncoder.encode("support123"))
                    .firstName("Alex")
                    .lastName("Morgan")
                    .enabled(true)
                    .roles(Set.of(supportRole))
                    .build();
            supportUser = userRepository.save(supportUser);
            log.info("Default support user created: support / support123");
        }

        User devUser = userRepository.findByUsername("developer").orElse(null);
        if (devUser == null) {
            devUser = User.builder()
                    .username("developer")
                    .email("dev@enterprise.com")
                    .password(passwordEncoder.encode("dev123"))
                    .firstName("Nandhu")
                    .lastName("Engineer")
                    .enabled(true)
                    .roles(Set.of(devRole))
                    .build();
            devUser = userRepository.save(devUser);
            log.info("Default developer user created: developer / dev123");
        }

        if (incidentRepository.count() == 0) {
            log.info("Seeding sample enterprise incidents for demo and initial testing...");

            Incident inc1 = Incident.builder()
                    .title("Production Payment Gateway Latency Spike")
                    .description("Stripe webhook latency degraded to >3000ms. Transactions queuing up in Redis backlog.")
                    .priority(IncidentPriority.CRITICAL)
                    .severity(IncidentSeverity.S1)
                    .status(IncidentStatus.IN_PROGRESS)
                    .createdBy(supportUser)
                    .assignedTo(devUser)
                    .build();
            inc1.addComment(Comment.builder()
                    .author(supportUser)
                    .content("Incident opened from Datadog alert: P99 latency exceeded 2.5s.")
                    .build());
            inc1.addComment(Comment.builder()
                    .author(devUser)
                    .content("Investigating connection pooling and gateway SSL renegotiation timeouts.")
                    .build());
            inc1.addHistory(IncidentHistory.builder()
                    .changedBy(supportUser)
                    .fieldName("status")
                    .oldValue("OPEN")
                    .newValue("ASSIGNED")
                    .build());
            inc1.addHistory(IncidentHistory.builder()
                    .changedBy(devUser)
                    .fieldName("status")
                    .oldValue("ASSIGNED")
                    .newValue("IN_PROGRESS")
                    .build());
            incidentRepository.save(inc1);

            Incident inc2 = Incident.builder()
                    .title("PostgreSQL High CPU & Slow Queries on Reports")
                    .description("Daily analytical reports running during peak hours causing lock contention on transactional tables.")
                    .priority(IncidentPriority.HIGH)
                    .severity(IncidentSeverity.S2)
                    .status(IncidentStatus.ASSIGNED)
                    .createdBy(supportUser)
                    .assignedTo(devUser)
                    .build();
            incidentRepository.save(inc2);

            Incident inc3 = Incident.builder()
                    .title("Customer Portal SSO Token Refresh Failure")
                    .description("Users encountering 401 Unauthorized upon JWT expiration instead of silent refresh.")
                    .priority(IncidentPriority.MEDIUM)
                    .severity(IncidentSeverity.S3)
                    .status(IncidentStatus.OPEN)
                    .createdBy(supportUser)
                    .build();
            incidentRepository.save(inc3);

            log.info("Seeded 3 sample incidents successfully.");
        }
    }
}
