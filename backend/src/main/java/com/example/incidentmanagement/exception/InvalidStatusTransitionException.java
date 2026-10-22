package com.example.incidentmanagement.exception;

import com.example.incidentmanagement.entity.enums.IncidentStatus;
import lombok.Getter;

@Getter
public class InvalidStatusTransitionException extends RuntimeException {

    private final IncidentStatus currentStatus;
    private final IncidentStatus attemptedStatus;

    public InvalidStatusTransitionException(IncidentStatus currentStatus, IncidentStatus attemptedStatus) {
        super(String.format("Incident cannot move from %s to %s", currentStatus, attemptedStatus));
        this.currentStatus = currentStatus;
        this.attemptedStatus = attemptedStatus;
    }

    public InvalidStatusTransitionException(String message) {
        super(message);
        this.currentStatus = null;
        this.attemptedStatus = null;
    }
}
