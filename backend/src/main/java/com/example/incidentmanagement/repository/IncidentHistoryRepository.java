package com.example.incidentmanagement.repository;

import com.example.incidentmanagement.entity.IncidentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentHistoryRepository extends JpaRepository<IncidentHistory, Long> {

    @Query("SELECT h FROM IncidentHistory h JOIN FETCH h.changedBy WHERE h.incident.id = :incidentId ORDER BY h.changedAt DESC")
    List<IncidentHistory> findByIncidentIdWithUserDesc(@Param("incidentId") Long incidentId);
}
