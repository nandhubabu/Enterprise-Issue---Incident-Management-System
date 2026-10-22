package com.example.incidentmanagement.service.impl;

import com.example.incidentmanagement.dto.incident.*;
import com.example.incidentmanagement.entity.Incident;
import com.example.incidentmanagement.entity.IncidentHistory;
import com.example.incidentmanagement.entity.User;
import com.example.incidentmanagement.entity.enums.IncidentPriority;
import com.example.incidentmanagement.entity.enums.IncidentSeverity;
import com.example.incidentmanagement.entity.enums.IncidentStatus;
import com.example.incidentmanagement.exception.InvalidStatusTransitionException;
import com.example.incidentmanagement.exception.ResourceNotFoundException;
import com.example.incidentmanagement.repository.IncidentHistoryRepository;
import com.example.incidentmanagement.repository.IncidentRepository;
import com.example.incidentmanagement.repository.UserRepository;
import com.example.incidentmanagement.repository.specification.IncidentSpecification;
import com.example.incidentmanagement.service.IncidentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentHistoryRepository historyRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public IncidentResponseDto createIncident(IncidentCreateRequest request, String currentUsername) {
        log.info("Creating new incident: '{}' by user '{}'", request.getTitle(), currentUsername);

        User creator = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        Incident incident = Incident.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .severity(request.getSeverity())
                .status(IncidentStatus.OPEN)
                .createdBy(creator)
                .build();

        Incident saved = incidentRepository.save(incident);

        // Record initial history
        recordHistory(saved, creator, "status", null, IncidentStatus.OPEN.name());

        log.info("Incident created successfully with ID: {}", saved.getId());
        return IncidentResponseDto.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<IncidentResponseDto> getIncidents(
            String keyword,
            IncidentStatus status,
            IncidentPriority priority,
            IncidentSeverity severity,
            Long assignedTo,
            Long createdBy,
            Pageable pageable) {

        Specification<Incident> spec = IncidentSpecification.withFilters(
                keyword, status, priority, severity, assignedTo, createdBy
        );

        return incidentRepository.findAll(spec, pageable)
                .map(IncidentResponseDto::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public IncidentDetailResponseDto getIncidentById(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));
        return IncidentDetailResponseDto.fromEntity(incident);
    }

    @Override
    @Transactional
    public IncidentDetailResponseDto updateIncident(Long id, IncidentUpdateRequest request, String currentUsername) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));

        User modifier = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        if (!Objects.equals(incident.getTitle(), request.getTitle())) {
            recordHistory(incident, modifier, "title", incident.getTitle(), request.getTitle());
            incident.setTitle(request.getTitle());
        }

        if (!Objects.equals(incident.getDescription(), request.getDescription())) {
            recordHistory(incident, modifier, "description", "Updated", "Updated");
            incident.setDescription(request.getDescription());
        }

        if (incident.getPriority() != request.getPriority()) {
            recordHistory(incident, modifier, "priority", incident.getPriority().name(), request.getPriority().name());
            incident.setPriority(request.getPriority());
        }

        if (incident.getSeverity() != request.getSeverity()) {
            recordHistory(incident, modifier, "severity", incident.getSeverity().name(), request.getSeverity().name());
            incident.setSeverity(request.getSeverity());
        }

        Incident updated = incidentRepository.save(incident);
        log.info("Incident {} updated by {}", id, currentUsername);
        return IncidentDetailResponseDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public IncidentDetailResponseDto assignIncident(Long id, IncidentAssignRequest request, String currentUsername) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));

        User modifier = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        User developer = userRepository.findById(request.getDeveloperId())
                .orElseThrow(() -> new ResourceNotFoundException("Developer not found with id: " + request.getDeveloperId()));

        String oldAssignee = incident.getAssignedTo() != null ? incident.getAssignedTo().getUsername() : "Unassigned";
        incident.setAssignedTo(developer);
        recordHistory(incident, modifier, "assignedTo", oldAssignee, developer.getUsername());

        // Automatically advance OPEN incidents to ASSIGNED upon assignment
        if (incident.getStatus() == IncidentStatus.OPEN) {
            incident.setStatus(IncidentStatus.ASSIGNED);
            recordHistory(incident, modifier, "status", IncidentStatus.OPEN.name(), IncidentStatus.ASSIGNED.name());
        }

        Incident updated = incidentRepository.save(incident);
        log.info("Incident {} assigned to {} by {}", id, developer.getUsername(), currentUsername);
        return IncidentDetailResponseDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public IncidentDetailResponseDto updateIncidentStatus(Long id, IncidentStatusUpdateRequest request, String currentUsername) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));

        User modifier = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        IncidentStatus currentStatus = incident.getStatus();
        IncidentStatus targetStatus = request.getStatus();

        if (currentStatus == targetStatus) {
            return IncidentDetailResponseDto.fromEntity(incident);
        }

        if (!currentStatus.canTransitionTo(targetStatus)) {
            log.warn("Invalid status transition attempt on incident {}: {} -> {}", id, currentStatus, targetStatus);
            throw new InvalidStatusTransitionException(currentStatus, targetStatus);
        }

        // Apply state lifecycle transitions
        incident.setStatus(targetStatus);
        if (targetStatus == IncidentStatus.RESOLVED) {
            incident.setResolvedAt(Instant.now());
        } else if (targetStatus == IncidentStatus.CLOSED) {
            incident.setClosedAt(Instant.now());
        } else if (targetStatus == IncidentStatus.REOPENED) {
            incident.setResolvedAt(null);
            incident.setClosedAt(null);
        }

        recordHistory(incident, modifier, "status", currentStatus.name(), targetStatus.name());

        Incident updated = incidentRepository.save(incident);
        log.info("Incident {} transitioned from {} to {} by {}", id, currentStatus, targetStatus, currentUsername);
        return IncidentDetailResponseDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteIncident(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));
        incidentRepository.delete(incident);
        log.info("Incident {} permanently deleted", id);
    }

    @Override
    @Transactional(readOnly = true)
    public IncidentStatsDto getIncidentStats(String currentUsername) {
        long total = incidentRepository.count();
        long open = incidentRepository.countByStatus(IncidentStatus.OPEN);
        long assigned = incidentRepository.countByStatus(IncidentStatus.ASSIGNED);
        long inProgress = incidentRepository.countByStatus(IncidentStatus.IN_PROGRESS);
        long resolved = incidentRepository.countByStatus(IncidentStatus.RESOLVED);
        long closed = incidentRepository.countByStatus(IncidentStatus.CLOSED);
        long reopened = incidentRepository.countByStatus(IncidentStatus.REOPENED);

        long critical = incidentRepository.countByPriority(IncidentPriority.CRITICAL);
        long high = incidentRepository.countByPriority(IncidentPriority.HIGH);

        long assignedToMe = 0;
        if (currentUsername != null) {
            userRepository.findByUsername(currentUsername).ifPresent(user -> {
                // assignedToMe
            });
            var userOpt = userRepository.findByUsername(currentUsername);
            if (userOpt.isPresent()) {
                assignedToMe = incidentRepository.countByAssignedTo(userOpt.get());
            }
        }

        Map<String, Long> statusBreakdown = new HashMap<>();
        for (IncidentStatus s : IncidentStatus.values()) {
            statusBreakdown.put(s.name(), incidentRepository.countByStatus(s));
        }

        Map<String, Long> priorityBreakdown = new HashMap<>();
        for (IncidentPriority p : IncidentPriority.values()) {
            priorityBreakdown.put(p.name(), incidentRepository.countByPriority(p));
        }

        return IncidentStatsDto.builder()
                .totalIncidents(total)
                .openCount(open)
                .assignedCount(assigned)
                .inProgressCount(inProgress)
                .resolvedCount(resolved)
                .closedCount(closed)
                .reopenedCount(reopened)
                .criticalCount(critical)
                .highCount(high)
                .assignedToMeCount(assignedToMe)
                .statusBreakdown(statusBreakdown)
                .priorityBreakdown(priorityBreakdown)
                .build();
    }

    private void recordHistory(Incident incident, User modifier, String fieldName, String oldValue, String newValue) {
        IncidentHistory history = IncidentHistory.builder()
                .incident(incident)
                .changedBy(modifier)
                .fieldName(fieldName)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();
        historyRepository.save(history);
    }
}
