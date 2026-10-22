package com.example.incidentmanagement.entity;

import com.example.incidentmanagement.entity.enums.IncidentPriority;
import com.example.incidentmanagement.entity.enums.IncidentSeverity;
import com.example.incidentmanagement.entity.enums.IncidentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "incidents",
    indexes = {
        @Index(name = "idx_incidents_status", columnList = "status"),
        @Index(name = "idx_incidents_priority", columnList = "priority"),
        @Index(name = "idx_incidents_severity", columnList = "severity"),
        @Index(name = "idx_incidents_assigned_to", columnList = "assigned_to_id"),
        @Index(name = "idx_incidents_created_by", columnList = "created_by_id"),
        @Index(name = "idx_incidents_created_at", columnList = "created_at")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private IncidentPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private IncidentSeverity severity;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 50)
    private IncidentStatus status = IncidentStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("createdAt DESC")
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("changedAt DESC")
    private List<IncidentHistory> histories = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    public void addComment(Comment comment) {
        comments.add(comment);
        comment.setIncident(this);
    }

    public void addHistory(IncidentHistory history) {
        histories.add(history);
        history.setIncident(this);
    }
}
