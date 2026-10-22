package com.example.incidentmanagement.controller;

import com.example.incidentmanagement.dto.comment.CommentCreateRequest;
import com.example.incidentmanagement.dto.comment.CommentResponseDto;
import com.example.incidentmanagement.dto.comment.CommentUpdateRequest;
import com.example.incidentmanagement.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Endpoints for Incident Comments and Technical Collaboration")
@SecurityRequirement(name = "BearerAuth")
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/api/incidents/{incidentId}/comments")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT', 'DEVELOPER')")
    @Operation(summary = "Add a comment to an incident")
    public ResponseEntity<CommentResponseDto> addComment(
            @PathVariable Long incidentId,
            @Valid @RequestBody CommentCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        CommentResponseDto response = commentService.addComment(incidentId, request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/incidents/{incidentId}/comments")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT', 'DEVELOPER')")
    @Operation(summary = "Get all comments for an incident")
    public ResponseEntity<List<CommentResponseDto>> getCommentsByIncidentId(@PathVariable Long incidentId) {
        return ResponseEntity.ok(commentService.getCommentsByIncidentId(incidentId));
    }

    @PutMapping("/api/comments/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT', 'DEVELOPER')")
    @Operation(summary = "Update an existing comment (Author or Admin only)")
    public ResponseEntity<CommentResponseDto> updateComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(commentService.updateComment(id, request, userDetails.getUsername(), isAdmin));
    }

    @DeleteMapping("/api/comments/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT', 'DEVELOPER')")
    @Operation(summary = "Delete a comment (Author or Admin only)")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        commentService.deleteComment(id, userDetails.getUsername(), isAdmin);
        return ResponseEntity.noContent().build();
    }
}
