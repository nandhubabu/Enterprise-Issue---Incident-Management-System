package com.example.incidentmanagement.dto.incident;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentStatsDto {
    private long totalIncidents;
    private long openCount;
    private long assignedCount;
    private long inProgressCount;
    private long resolvedCount;
    private long closedCount;
    private long reopenedCount;
    private long criticalCount;
    private long highCount;
    private long assignedToMeCount;
    private Map<String, Long> statusBreakdown;
    private Map<String, Long> priorityBreakdown;
}
