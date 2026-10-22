package com.example.incidentmanagement.repository;

import com.example.incidentmanagement.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("SELECT c FROM Comment c JOIN FETCH c.author WHERE c.incident.id = :incidentId ORDER BY c.createdAt ASC")
    List<Comment> findByIncidentIdWithAuthorAsc(@Param("incidentId") Long incidentId);

    @Query("SELECT c FROM Comment c JOIN FETCH c.author WHERE c.incident.id = :incidentId ORDER BY c.createdAt DESC")
    List<Comment> findByIncidentIdWithAuthorDesc(@Param("incidentId") Long incidentId);
}
