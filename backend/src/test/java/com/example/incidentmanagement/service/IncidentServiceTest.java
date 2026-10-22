package com.example.incidentmanagement.service;

import com.example.incidentmanagement.dto.incident.*;
import com.example.incidentmanagement.entity.Incident;
import com.example.incidentmanagement.entity.User;
import com.example.incidentmanagement.entity.enums.IncidentPriority;
import com.example.incidentmanagement.entity.enums.IncidentSeverity;
import com.example.incidentmanagement.entity.enums.IncidentStatus;
import com.example.incidentmanagement.exception.ResourceNotFoundException;
import com.example.incidentmanagement.repository.IncidentHistoryRepository;
import com.example.incidentmanagement.repository.IncidentRepository;
import com.example.incidentmanagement.repository.UserRepository;
import com.example.incidentmanagement.service.impl.IncidentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidentServiceTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private IncidentHistoryRepository historyRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private IncidentServiceImpl incidentService;

    private User supportUser;
    private User devUser;
    private Incident sampleIncident;

    @BeforeEach
    void setUp() {
        supportUser = User.builder().id(1L).username("support").build();
        devUser = User.builder().id(2L).username("developer").build();

        sampleIncident = Incident.builder()
                .id(101L)
                .title("API Latency Issue")
                .description("High P99 latency detected")
                .priority(IncidentPriority.HIGH)
                .severity(IncidentSeverity.S2)
                .status(IncidentStatus.OPEN)
                .createdBy(supportUser)
                .build();
    }

    @Test
    @DisplayName("Should successfully create an incident with status OPEN")
    void createIncident_Success() {
        IncidentCreateRequest request = IncidentCreateRequest.builder()
                .title("Database Connection Pool Exhaustion")
                .description("Hikari pool timeout")
                .priority(IncidentPriority.CRITICAL)
                .severity(IncidentSeverity.S1)
                .build();

        when(userRepository.findByUsername("support")).thenReturn(Optional.of(supportUser));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> {
            Incident inc = invocation.getArgument(0);
            inc.setId(102L);
            return inc;
        });

        IncidentResponseDto response = incidentService.createIncident(request, "support");

        assertNotNull(response);
        assertEquals(102L, response.getId());
        assertEquals("Database Connection Pool Exhaustion", response.getTitle());
        assertEquals(IncidentStatus.OPEN, response.getStatus());
        assertEquals(IncidentPriority.CRITICAL, response.getPriority());
        verify(incidentRepository).save(any(Incident.class));
    }

    @Test
    @DisplayName("Should retrieve incident details by ID")
    void getIncidentById_Success() {
        when(incidentRepository.findById(101L)).thenReturn(Optional.of(sampleIncident));

        IncidentDetailResponseDto response = incidentService.getIncidentById(101L);

        assertNotNull(response);
        assertEquals(101L, response.getId());
        assertEquals("API Latency Issue", response.getTitle());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when incident does not exist")
    void getIncidentById_NotFound_ThrowsException() {
        when(incidentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> incidentService.getIncidentById(999L));
    }

    @Test
    @DisplayName("Should assign incident to developer and advance status from OPEN to ASSIGNED")
    void assignIncident_Success() {
        IncidentAssignRequest request = new IncidentAssignRequest(2L);

        when(incidentRepository.findById(101L)).thenReturn(Optional.of(sampleIncident));
        when(userRepository.findByUsername("support")).thenReturn(Optional.of(supportUser));
        when(userRepository.findById(2L)).thenReturn(Optional.of(devUser));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IncidentDetailResponseDto response = incidentService.assignIncident(101L, request, "support");

        assertNotNull(response);
        assertEquals(IncidentStatus.ASSIGNED, response.getStatus());
        assertNotNull(response.getAssignedTo());
        assertEquals("developer", response.getAssignedTo().getUsername());
    }

    @Test
    @DisplayName("Should update incident fields and create audit history")
    void updateIncident_Success() {
        IncidentUpdateRequest request = IncidentUpdateRequest.builder()
                .title("Updated Title")
                .description("Updated Description")
                .priority(IncidentPriority.LOW)
                .severity(IncidentSeverity.S4)
                .build();

        when(incidentRepository.findById(101L)).thenReturn(Optional.of(sampleIncident));
        when(userRepository.findByUsername("support")).thenReturn(Optional.of(supportUser));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IncidentDetailResponseDto response = incidentService.updateIncident(101L, request, "support");

        assertNotNull(response);
        assertEquals("Updated Title", response.getTitle());
        assertEquals(IncidentPriority.LOW, response.getPriority());
        assertEquals(IncidentSeverity.S4, response.getSeverity());
    }

    @Test
    @DisplayName("Should delete incident by ID")
    void deleteIncident_Success() {
        when(incidentRepository.findById(101L)).thenReturn(Optional.of(sampleIncident));
        doNothing().when(incidentRepository).delete(sampleIncident);

        assertDoesNotThrow(() -> incidentService.deleteIncident(101L));
        verify(incidentRepository).delete(sampleIncident);
    }
}
