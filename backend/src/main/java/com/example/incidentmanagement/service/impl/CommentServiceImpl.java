package com.example.incidentmanagement.service.impl;

import com.example.incidentmanagement.dto.comment.CommentCreateRequest;
import com.example.incidentmanagement.dto.comment.CommentResponseDto;
import com.example.incidentmanagement.dto.comment.CommentUpdateRequest;
import com.example.incidentmanagement.entity.Comment;
import com.example.incidentmanagement.entity.Incident;
import com.example.incidentmanagement.entity.User;
import com.example.incidentmanagement.exception.ForbiddenException;
import com.example.incidentmanagement.exception.ResourceNotFoundException;
import com.example.incidentmanagement.repository.CommentRepository;
import com.example.incidentmanagement.repository.IncidentRepository;
import com.example.incidentmanagement.repository.UserRepository;
import com.example.incidentmanagement.service.CommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CommentResponseDto addComment(Long incidentId, CommentCreateRequest request, String currentUsername) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + incidentId));

        User author = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        Comment comment = Comment.builder()
                .incident(incident)
                .author(author)
                .content(request.getContent())
                .build();

        Comment saved = commentRepository.save(comment);
        log.info("New comment {} added on incident {} by {}", saved.getId(), incidentId, currentUsername);
        return CommentResponseDto.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponseDto> getCommentsByIncidentId(Long incidentId) {
        if (!incidentRepository.existsById(incidentId)) {
            throw new ResourceNotFoundException("Incident not found with id: " + incidentId);
        }
        return commentRepository.findByIncidentIdWithAuthorAsc(incidentId).stream()
                .map(CommentResponseDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public CommentResponseDto updateComment(Long commentId, CommentUpdateRequest request, String currentUsername, boolean isAdmin) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!isAdmin && !comment.getAuthor().getUsername().equals(currentUsername)) {
            log.warn("User {} attempted to modify comment {} owned by {}", currentUsername, commentId, comment.getAuthor().getUsername());
            throw new ForbiddenException("You can only modify your own comments");
        }

        comment.setContent(request.getContent());
        Comment updated = commentRepository.save(comment);
        log.info("Comment {} updated by {}", commentId, currentUsername);
        return CommentResponseDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, String currentUsername, boolean isAdmin) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!isAdmin && !comment.getAuthor().getUsername().equals(currentUsername)) {
            log.warn("User {} attempted to delete comment {} owned by {}", currentUsername, commentId, comment.getAuthor().getUsername());
            throw new ForbiddenException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
        log.info("Comment {} deleted by {}", commentId, currentUsername);
    }
}
