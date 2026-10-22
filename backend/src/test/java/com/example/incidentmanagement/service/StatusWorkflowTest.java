package com.example.incidentmanagement.service;

import com.example.incidentmanagement.dto.incident.IncidentDetailResponseDto;
import com.example.incidentmanagement.dto.incident.IncidentStatusUpdateRequest;
import com.example.incidentmanagement.entity.Incident;
import com.example.incidentmanagement.entity.User;
import com.example.incidentmanagement.entity.enums.IncidentPriority;
import com.example.incidentmanagement.entity.enums.IncidentSeverity;
import com.example.incidentmanagement.entity.enums.IncidentStatus;
import com.example.incidentmanagement.exception.InvalidStatusTransitionException;
import com.example.incidentmanagement.repository.IncidentHistoryRepository;
import com.example.incidentmanagement.repository.IncidentRepository;
import com.example.incidentmanagement.repository.UserRepository;
import com.example.incidentmanagement.service.impl.IncidentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StatusWorkflowTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private IncidentHistoryRepository historyRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private IncidentServiceImpl incidentService;

    private Incident incident;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).username("operator").build();
        incident = Incident.builder()
                .id(100L)
                .title("Sample Incident")
                .description("Sample description")
                .priority(IncidentPriority.HIGH)
                .severity(IncidentSeverity.S2)
                .status(IncidentStatus.OPEN)
                .createdBy(testUser)
                .build();
    }

    @ParameterizedTest(name = "Valid Transition: {0} -> {1}")
    @CsvSource({
            "OPEN, ASSIGNED",
            "ASSIGNED, IN_PROGRESS",
            "IN_PROGRESS, RESOLVED",
            "RESOLVED, CLOSED",
            "CLOSED, REOPENED",
            "REOPENED, IN_PROGRESS"
    })
    @DisplayName("Should successfully transition incident through permitted lifecycle states")
    void validTransitions_Success(IncidentStatus initialStatus, IncidentStatus targetStatus) {
        incident.setStatus(initialStatus);

        when(incidentRepository.findById(100L)).thenReturn(Optional.of(incident));
        when(userRepository.findByUsername("operator")).thenReturn(Optional.of(testUser));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IncidentDetailResponseDto response = incidentService.updateIncidentStatus(
                100L,
                new IncidentStatusUpdateRequest(targetStatus),
                "operator"
        );

        assertNotNull(response);
        assertEquals(targetStatus, response.getStatus());

        if (targetStatus == IncidentStatus.RESOLVED) {
            assertNotNull(response.getResolvedAt());
        } else if (targetStatus == IncidentStatus.CLOSED) {
            assertNotNull(response.getClosedAt());
        }
    }

    @ParameterizedTest(name = "Invalid Transition Rejected: {0} -> {1}")
    @CsvSource({
            "OPEN, CLOSED",
            "OPEN, RESOLVED",
            "OPEN, REOPENED",
            "ASSIGNED, CLOSED",
            "ASSIGNED, RESOLVED",
            "IN_PROGRESS, CLOSED",
            "RESOLVED, ASSIGNED",
            "CLOSED, IN_PROGRESS"
    })
    @DisplayName("Should reject illegal transitions and throw InvalidStatusTransitionException")
    void invalidTransitions_ThrowException(IncidentStatus initialStatus, IncidentStatus targetStatus) {
        incident.setStatus(initialStatus);

        when(incidentRepository.findById(100L)).thenReturn(Optional.of(incident));
        when(userRepository.findByUsername("operator")).thenReturn(Optional.of(testUser));

        InvalidStatusTransitionException exception = assertThrows(
                InvalidStatusTransitionException.class,
                () -> incidentService.updateIncidentStatus(
                        100L,
                        new IncidentStatusUpdateRequest(targetStatus),
                        "operator"
                )
        );

        assertEquals(
                String.format("Incident cannot move from %s to %s", initialStatus, targetStatus),
                exception.getMessage()
        );
        verify(incidentRepository, never()).save(any(Incident.class));
    }
}
