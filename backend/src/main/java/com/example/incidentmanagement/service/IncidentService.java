package com.example.incidentmanagement.service;

import com.example.incidentmanagement.dto.incident.*;
import com.example.incidentmanagement.entity.enums.IncidentPriority;
import com.example.incidentmanagement.entity.enums.IncidentSeverity;
import com.example.incidentmanagement.entity.enums.IncidentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IncidentService {

    IncidentResponseDto createIncident(IncidentCreateRequest request, String currentUsername);

    Page<IncidentResponseDto> getIncidents(
            String keyword,
            IncidentStatus status,
            IncidentPriority priority,
            IncidentSeverity severity,
            Long assignedTo,
            Long createdBy,
            Pageable pageable);

    IncidentDetailResponseDto getIncidentById(Long id);

    IncidentDetailResponseDto updateIncident(Long id, IncidentUpdateRequest request, String currentUsername);

    IncidentDetailResponseDto assignIncident(Long id, IncidentAssignRequest request, String currentUsername);

    IncidentDetailResponseDto updateIncidentStatus(Long id, IncidentStatusUpdateRequest request, String currentUsername);

    void deleteIncident(Long id);

    IncidentStatsDto getIncidentStats(String currentUsername);
}
