package com.example.incidentmanagement.repository;

import com.example.incidentmanagement.entity.Incident;
import com.example.incidentmanagement.entity.User;
import com.example.incidentmanagement.entity.enums.IncidentPriority;
import com.example.incidentmanagement.entity.enums.IncidentSeverity;
import com.example.incidentmanagement.entity.enums.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long>, JpaSpecificationExecutor<Incident> {

    List<Incident> findByStatus(IncidentStatus status);

    List<Incident> findByPriority(IncidentPriority priority);

    List<Incident> findBySeverity(IncidentSeverity severity);

    List<Incident> findByAssignedTo(User assignedTo);

    List<Incident> findByCreatedBy(User createdBy);

    @Query("SELECT i FROM Incident i " +
           "JOIN FETCH i.createdBy " +
           "LEFT JOIN FETCH i.assignedTo " +
           "WHERE i.id = :id")
    Optional<Incident> findByIdWithUsers(@Param("id") Long id);

    long countByStatus(IncidentStatus status);

    long countByPriority(IncidentPriority priority);

    long countByAssignedTo(User assignedTo);
}
