package com.example.incidentmanagement.service;

import com.example.incidentmanagement.dto.user.UserSummaryDto;
import com.example.incidentmanagement.dto.user.UserUpdateRequest;

import java.util.List;

public interface UserService {
    List<UserSummaryDto> getAllUsers();
    UserSummaryDto getUserById(Long id);
    List<UserSummaryDto> getDevelopers();
    UserSummaryDto updateUser(Long id, UserUpdateRequest request);
    void deleteUser(Long id);
}
