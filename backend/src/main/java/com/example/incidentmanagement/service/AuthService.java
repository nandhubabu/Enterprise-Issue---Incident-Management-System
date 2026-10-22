package com.example.incidentmanagement.service;

import com.example.incidentmanagement.dto.auth.AuthResponse;
import com.example.incidentmanagement.dto.auth.LoginRequest;
import com.example.incidentmanagement.dto.auth.RegisterRequest;
import com.example.incidentmanagement.dto.user.UserSummaryDto;

public interface AuthService {
    UserSummaryDto register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserSummaryDto getCurrentUser(String username);
}
