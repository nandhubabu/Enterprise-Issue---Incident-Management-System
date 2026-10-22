package com.example.incidentmanagement.service.impl;

import com.example.incidentmanagement.dto.auth.AuthResponse;
import com.example.incidentmanagement.dto.auth.LoginRequest;
import com.example.incidentmanagement.dto.auth.RegisterRequest;
import com.example.incidentmanagement.dto.user.UserSummaryDto;
import com.example.incidentmanagement.entity.Role;
import com.example.incidentmanagement.entity.User;
import com.example.incidentmanagement.entity.enums.RoleType;
import com.example.incidentmanagement.exception.DuplicateResourceException;
import com.example.incidentmanagement.exception.ResourceNotFoundException;
import com.example.incidentmanagement.repository.RoleRepository;
import com.example.incidentmanagement.repository.UserRepository;
import com.example.incidentmanagement.security.CustomUserDetails;
import com.example.incidentmanagement.security.JwtTokenProvider;
import com.example.incidentmanagement.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public UserSummaryDto register(RegisterRequest request) {
        log.info("Attempting to register user: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username is already taken: " + request.getUsername());
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered: " + request.getEmail());
        }

        Set<Role> roles = new HashSet<>();
        if (request.getRoles() == null || request.getRoles().isEmpty()) {
            Role defaultRole = roleRepository.findByName(RoleType.SUPPORT)
                    .orElseGet(() -> roleRepository.save(new Role(RoleType.SUPPORT)));
            roles.add(defaultRole);
        } else {
            for (String roleName : request.getRoles()) {
                String normalizedRole = roleName.toUpperCase().replace("ROLE_", "");
                try {
                    RoleType roleType = RoleType.valueOf(normalizedRole);
                    Role role = roleRepository.findByName(roleType)
                            .orElseGet(() -> roleRepository.save(new Role(roleType)));
                    roles.add(role);
                } catch (IllegalArgumentException ex) {
                    log.warn("Unknown role passed during registration: {}", roleName);
                }
            }
            if (roles.isEmpty()) {
                Role defaultRole = roleRepository.findByName(RoleType.SUPPORT)
                        .orElseGet(() -> roleRepository.save(new Role(RoleType.SUPPORT)));
                roles.add(defaultRole);
            }
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .enabled(true)
                .roles(roles)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());
        return UserSummaryDto.fromEntity(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        log.info("Attempting login authentication for user: {}", request.getUsername());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateToken(authentication);

        CustomUserDetails userPrincipal = (CustomUserDetails) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userPrincipal.getId()));

        log.info("User {} successfully authenticated", user.getUsername());
        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .user(UserSummaryDto.fromEntity(user))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return UserSummaryDto.fromEntity(user);
    }
}
