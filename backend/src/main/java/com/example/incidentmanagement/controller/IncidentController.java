package com.example.incidentmanagement.controller;

import com.example.incidentmanagement.dto.incident.*;
import com.example.incidentmanagement.entity.enums.IncidentPriority;
import com.example.incidentmanagement.entity.enums.IncidentSeverity;
import com.example.incidentmanagement.entity.enums.IncidentStatus;
import com.example.incidentmanagement.service.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
@Tag(name = "Incidents", description = "Core incident management, assignment, search, filtering, and workflow endpoints")
@SecurityRequirement(name = "BearerAuth")
public class IncidentController {

    private final IncidentService incidentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT', 'DEVELOPER')")
    @Operation(summary = "Create a new incident (Default status: OPEN)")
    public ResponseEntity<IncidentResponseDto> createIncident(
            @Valid @RequestBody IncidentCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        IncidentResponseDto response = incidentService.createIncident(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT', 'DEVELOPER')")
    @Operation(summary = "Search, filter, paginate, and sort incidents")
    public ResponseEntity<Page<IncidentResponseDto>> getIncidents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) IncidentStatus status,
            @RequestParam(required = false) IncidentPriority priority,
            @RequestParam(required = false) IncidentSeverity severity,
            @RequestParam(required = false) Long assignedTo,
            @RequestParam(required = false) Long createdBy,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<IncidentResponseDto> incidents = incidentService.getIncidents(
                keyword, status, priority, severity, assignedTo, createdBy, pageable
        );
        return ResponseEntity.ok(incidents);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT', 'DEVELOPER')")
    @Operation(summary = "Get dashboard analytics and incident counts")
    public ResponseEntity<IncidentStatsDto> getStats(@AuthenticationPrincipal UserDetails userDetails) {
        IncidentStatsDto stats = incidentService.getIncidentStats(userDetails != null ? userDetails.getUsername() : null);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT', 'DEVELOPER')")
    @Operation(summary = "Get incident details by ID with comments and audit history")
    public ResponseEntity<IncidentDetailResponseDto> getIncidentById(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getIncidentById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT', 'DEVELOPER')")
    @Operation(summary = "Update incident information, priority, or severity")
    public ResponseEntity<IncidentDetailResponseDto> updateIncident(
            @PathVariable Long id,
            @Valid @RequestBody IncidentUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(incidentService.updateIncident(id, request, userDetails.getUsername()));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT')")
    @Operation(summary = "Assign incident to a developer (Admin & Support only)")
    public ResponseEntity<IncidentDetailResponseDto> assignIncident(
            @PathVariable Long id,
            @Valid @RequestBody IncidentAssignRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(incidentService.assignIncident(id, request, userDetails.getUsername()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT', 'DEVELOPER')")
    @Operation(summary = "Transition incident status via the workflow state machine")
    public ResponseEntity<IncidentDetailResponseDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody IncidentStatusUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(incidentService.updateIncidentStatus(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an incident permanently (Admin only)")
    public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {
        incidentService.deleteIncident(id);
        return ResponseEntity.noContent().build();
    }
}
