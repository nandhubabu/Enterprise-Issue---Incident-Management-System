package com.example.incidentmanagement.dto.incident;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentAssignRequest {

    @NotNull(message = "Developer ID is required")
    private Long developerId;
}
