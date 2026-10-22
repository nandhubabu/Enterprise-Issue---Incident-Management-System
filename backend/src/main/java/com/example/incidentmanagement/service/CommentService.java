package com.example.incidentmanagement.service;

import com.example.incidentmanagement.dto.comment.CommentCreateRequest;
import com.example.incidentmanagement.dto.comment.CommentResponseDto;
import com.example.incidentmanagement.dto.comment.CommentUpdateRequest;

import java.util.List;

public interface CommentService {
    CommentResponseDto addComment(Long incidentId, CommentCreateRequest request, String currentUsername);
    List<CommentResponseDto> getCommentsByIncidentId(Long incidentId);
    CommentResponseDto updateComment(Long commentId, CommentUpdateRequest request, String currentUsername, boolean isAdmin);
    void deleteComment(Long commentId, String currentUsername, boolean isAdmin);
}
