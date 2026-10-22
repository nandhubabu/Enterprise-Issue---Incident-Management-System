package com.example.incidentmanagement.controller;

import com.example.incidentmanagement.dto.auth.LoginRequest;
import com.example.incidentmanagement.dto.auth.RegisterRequest;
import com.example.incidentmanagement.dto.comment.CommentCreateRequest;
import com.example.incidentmanagement.dto.incident.IncidentCreateRequest;
import com.example.incidentmanagement.dto.incident.IncidentStatusUpdateRequest;
import com.example.incidentmanagement.entity.Role;
import com.example.incidentmanagement.entity.enums.IncidentPriority;
import com.example.incidentmanagement.entity.enums.IncidentSeverity;
import com.example.incidentmanagement.entity.enums.IncidentStatus;
import com.example.incidentmanagement.entity.enums.RoleType;
import com.example.incidentmanagement.repository.RoleRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class IncidentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RoleRepository roleRepository;

    private String jwtToken;

    @BeforeEach
    void setUp() throws Exception {
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(RoleType.ADMIN));
            roleRepository.save(new Role(RoleType.SUPPORT));
            roleRepository.save(new Role(RoleType.DEVELOPER));
        }

        // Register a test operator
        RegisterRequest register = RegisterRequest.builder()
                .username("integration_admin")
                .email("integration_admin@example.com")
                .password("Password123!")
                .firstName("Integration")
                .lastName("Admin")
                .roles(Set.of("ADMIN", "SUPPORT"))
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(register)));

        // Login to get token
        LoginRequest login = LoginRequest.builder()
                .username("integration_admin")
                .password("Password123!")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        jwtToken = root.get("token").asText();
    }

    @Test
    @DisplayName("Unauthenticated request to /api/incidents returns 401 Unauthorized")
    void unauthenticatedRequest_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/incidents"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("End-to-end incident lifecycle test: Create -> Retrieve -> Status Workflow -> Comment")
    void endToEndIncidentLifecycle_Success() throws Exception {
        // 1. Create Incident
        IncidentCreateRequest createReq = IncidentCreateRequest.builder()
                .title("Production Network Partition in Region US-East")
                .description("Packet drops observed across Kubernetes ingress nodes.")
                .priority(IncidentPriority.CRITICAL)
                .severity(IncidentSeverity.S1)
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/incidents")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andReturn();

        JsonNode createdIncident = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long incidentId = createdIncident.get("id").asLong();

        // 2. Retrieve Incident Details
        mockMvc.perform(get("/api/incidents/" + incidentId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Production Network Partition in Region US-East"))
                .andExpect(jsonPath("$.status").value("OPEN"));

        // 3. Valid Status Transition: OPEN -> ASSIGNED
        IncidentStatusUpdateRequest assignStatus = new IncidentStatusUpdateRequest(IncidentStatus.ASSIGNED);
        mockMvc.perform(patch("/api/incidents/" + incidentId + "/status")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignStatus)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ASSIGNED"));

        // 4. Invalid Status Transition: ASSIGNED -> CLOSED (Must be rejected with 400 Bad Request)
        IncidentStatusUpdateRequest invalidTransition = new IncidentStatusUpdateRequest(IncidentStatus.CLOSED);
        mockMvc.perform(patch("/api/incidents/" + incidentId + "/status")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidTransition)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_STATUS_TRANSITION"))
                .andExpect(jsonPath("$.message").value("Incident cannot move from ASSIGNED to CLOSED"));

        // 5. Add Comment
        CommentCreateRequest commentReq = new CommentCreateRequest("Core switches rebooted. Investigating BGP routes.");
        mockMvc.perform(post("/api/incidents/" + incidentId + "/comments")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content").value("Core switches rebooted. Investigating BGP routes."));

        // 6. Search / Filter query
        mockMvc.perform(get("/api/incidents?keyword=Kubernetes&status=ASSIGNED")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(incidentId));
    }
}
