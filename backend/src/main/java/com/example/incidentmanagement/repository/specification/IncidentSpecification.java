package com.example.incidentmanagement.repository.specification;

import com.example.incidentmanagement.entity.Incident;
import com.example.incidentmanagement.entity.enums.IncidentPriority;
import com.example.incidentmanagement.entity.enums.IncidentSeverity;
import com.example.incidentmanagement.entity.enums.IncidentStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class IncidentSpecification {

    public static Specification<Incident> withFilters(
            String keyword,
            IncidentStatus status,
            IncidentPriority priority,
            IncidentSeverity severity,
            Long assignedToId,
            Long createdById) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(keyword)) {
                String pattern = "%" + keyword.toLowerCase().trim() + "%";
                Predicate titlePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern);
                Predicate descPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), pattern);
                predicates.add(criteriaBuilder.or(titlePredicate, descPredicate));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (priority != null) {
                predicates.add(criteriaBuilder.equal(root.get("priority"), priority));
            }

            if (severity != null) {
                predicates.add(criteriaBuilder.equal(root.get("severity"), severity));
            }

            if (assignedToId != null) {
                predicates.add(criteriaBuilder.equal(root.get("assignedTo").get("id"), assignedToId));
            }

            if (createdById != null) {
                predicates.add(criteriaBuilder.equal(root.get("createdBy").get("id"), createdById));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
