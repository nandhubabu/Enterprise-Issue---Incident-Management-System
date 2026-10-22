package com.example.incidentmanagement.entity.enums;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

public enum IncidentStatus {
    OPEN,
    ASSIGNED,
    IN_PROGRESS,
    RESOLVED,
    CLOSED,
    REOPENED;

    /**
     * Determines whether transitioning from current status to the next target status is valid.
     * Transitions:
     * OPEN -> ASSIGNED
     * ASSIGNED -> IN_PROGRESS
     * IN_PROGRESS -> RESOLVED
     * RESOLVED -> CLOSED
     * CLOSED -> REOPENED
     * REOPENED -> IN_PROGRESS
     */
    public boolean canTransitionTo(IncidentStatus nextStatus) {
        if (nextStatus == null) {
            return false;
        }
        return getNextValidStatuses().contains(nextStatus);
    }

    public Set<IncidentStatus> getNextValidStatuses() {
        return switch (this) {
            case OPEN -> EnumSet.of(ASSIGNED);
            case ASSIGNED -> EnumSet.of(IN_PROGRESS);
            case IN_PROGRESS -> EnumSet.of(RESOLVED);
            case RESOLVED -> EnumSet.of(CLOSED);
            case CLOSED -> EnumSet.of(REOPENED);
            case REOPENED -> EnumSet.of(IN_PROGRESS);
        };
    }
}
