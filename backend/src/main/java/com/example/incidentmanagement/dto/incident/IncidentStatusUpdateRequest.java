package com.example.incidentmanagement.dto.incident;

import com.example.incidentmanagement.entity.enums.IncidentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private IncidentStatus status;
}
