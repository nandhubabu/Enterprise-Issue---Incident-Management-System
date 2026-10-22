package com.example.incidentmanagement.dto.incident;

import com.example.incidentmanagement.dto.user.UserSummaryDto;
import com.example.incidentmanagement.entity.IncidentHistory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentHistoryResponseDto {

    private Long id;
    private Long incidentId;
    private UserSummaryDto changedBy;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private Instant changedAt;

    public static IncidentHistoryResponseDto fromEntity(IncidentHistory history) {
        if (history == null) {
            return null;
        }
        return IncidentHistoryResponseDto.builder()
                .id(history.getId())
                .incidentId(history.getIncident() != null ? history.getIncident().getId() : null)
                .changedBy(UserSummaryDto.fromEntity(history.getChangedBy()))
                .fieldName(history.getFieldName())
                .oldValue(history.getOldValue())
                .newValue(history.getNewValue())
                .changedAt(history.getChangedAt())
                .build();
    }
}
