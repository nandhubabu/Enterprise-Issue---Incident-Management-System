package com.example.incidentmanagement.service.impl;

import com.example.incidentmanagement.dto.user.UserSummaryDto;
import com.example.incidentmanagement.dto.user.UserUpdateRequest;
import com.example.incidentmanagement.entity.Role;
import com.example.incidentmanagement.entity.User;
import com.example.incidentmanagement.entity.enums.RoleType;
import com.example.incidentmanagement.exception.ResourceNotFoundException;
import com.example.incidentmanagement.repository.RoleRepository;
import com.example.incidentmanagement.repository.UserRepository;
import com.example.incidentmanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserSummaryDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserSummaryDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserSummaryDto.fromEntity(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryDto> getDevelopers() {
        return userRepository.findByRoleType(RoleType.DEVELOPER).stream()
                .map(UserSummaryDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public UserSummaryDto updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : request.getRoles()) {
                String normalized = roleName.toUpperCase().replace("ROLE_", "");
                try {
                    RoleType roleType = RoleType.valueOf(normalized);
                    Role role = roleRepository.findByName(roleType)
                            .orElseGet(() -> roleRepository.save(new Role(roleType)));
                    roles.add(role);
                } catch (IllegalArgumentException ex) {
                    log.warn("Unknown role: {}", roleName);
                }
            }
            if (!roles.isEmpty()) {
                user.setRoles(roles);
            }
        }

        User updatedUser = userRepository.save(user);
        log.info("User {} updated successfully", id);
        return UserSummaryDto.fromEntity(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        // Soft disable user to maintain audit trails and relational integrity
        user.setEnabled(false);
        userRepository.save(user);
        log.info("User {} disabled successfully", id);
    }
}
