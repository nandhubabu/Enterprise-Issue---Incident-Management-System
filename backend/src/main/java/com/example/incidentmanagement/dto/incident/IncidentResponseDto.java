package com.example.incidentmanagement.dto.incident;

import com.example.incidentmanagement.dto.user.UserSummaryDto;
import com.example.incidentmanagement.entity.Incident;
import com.example.incidentmanagement.entity.enums.IncidentPriority;
import com.example.incidentmanagement.entity.enums.IncidentSeverity;
import com.example.incidentmanagement.entity.enums.IncidentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentResponseDto {

    private Long id;
    private String title;
    private String description;
    private IncidentPriority priority;
    private IncidentSeverity severity;
    private IncidentStatus status;
    private UserSummaryDto createdBy;
    private UserSummaryDto assignedTo;
    private int commentsCount;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant resolvedAt;
    private Instant closedAt;

    public static IncidentResponseDto fromEntity(Incident incident) {
        if (incident == null) {
            return null;
        }
        return IncidentResponseDto.builder()
                .id(incident.getId())
                .title(incident.getTitle())
                .description(incident.getDescription())
                .priority(incident.getPriority())
                .severity(incident.getSeverity())
                .status(incident.getStatus())
                .createdBy(UserSummaryDto.fromEntity(incident.getCreatedBy()))
                .assignedTo(incident.getAssignedTo() != null ? UserSummaryDto.fromEntity(incident.getAssignedTo()) : null)
                .commentsCount(incident.getComments() != null ? incident.getComments().size() : 0)
                .createdAt(incident.getCreatedAt())
                .updatedAt(incident.getUpdatedAt())
                .resolvedAt(incident.getResolvedAt())
                .closedAt(incident.getClosedAt())
                .build();
    }
}
