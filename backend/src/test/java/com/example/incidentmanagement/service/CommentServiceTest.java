package com.example.incidentmanagement.service;

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
import com.example.incidentmanagement.service.impl.CommentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CommentServiceImpl commentService;

    private Incident incident;
    private User authorUser;
    private User otherUser;
    private Comment comment;

    @BeforeEach
    void setUp() {
        authorUser = User.builder().id(1L).username("developer1").build();
        otherUser = User.builder().id(2L).username("developer2").build();
        incident = Incident.builder().id(10L).title("Test Incident").build();

        comment = Comment.builder()
                .id(50L)
                .incident(incident)
                .author(authorUser)
                .content("Initial root cause investigation note")
                .build();
    }

    @Test
    @DisplayName("Should add comment to an incident")
    void addComment_Success() {
        CommentCreateRequest request = new CommentCreateRequest("New analysis notes");

        when(incidentRepository.findById(10L)).thenReturn(Optional.of(incident));
        when(userRepository.findByUsername("developer1")).thenReturn(Optional.of(authorUser));
        when(commentRepository.save(any(Comment.class))).thenReturn(comment);

        CommentResponseDto result = commentService.addComment(10L, request, "developer1");

        assertNotNull(result);
        assertEquals(50L, result.getId());
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when adding comment to missing incident")
    void addComment_IncidentNotFound_ThrowsException() {
        when(incidentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                commentService.addComment(99L, new CommentCreateRequest("test"), "developer1")
        );
    }

    @Test
    @DisplayName("Should retrieve comments for an incident")
    void getComments_Success() {
        when(incidentRepository.existsById(10L)).thenReturn(true);
        when(commentRepository.findByIncidentIdWithAuthorAsc(10L)).thenReturn(List.of(comment));

        List<CommentResponseDto> list = commentService.getCommentsByIncidentId(10L);

        assertEquals(1, list.size());
        assertEquals("Initial root cause investigation note", list.get(0).getContent());
    }

    @Test
    @DisplayName("Should update comment by author")
    void updateComment_ByAuthor_Success() {
        when(commentRepository.findById(50L)).thenReturn(Optional.of(comment));
        when(commentRepository.save(any(Comment.class))).thenReturn(comment);

        CommentResponseDto result = commentService.updateComment(
                50L,
                new CommentUpdateRequest("Updated note content"),
                "developer1",
                false
        );

        assertNotNull(result);
        assertEquals("Updated note content", comment.getContent());
    }

    @Test
    @DisplayName("Should throw ForbiddenException when non-author and non-admin updates comment")
    void updateComment_ByOtherUser_ThrowsForbidden() {
        when(commentRepository.findById(50L)).thenReturn(Optional.of(comment));

        assertThrows(ForbiddenException.class, () ->
                commentService.updateComment(
                        50L,
                        new CommentUpdateRequest("Hacked note"),
                        "developer2",
                        false
                )
        );
    }

    @Test
    @DisplayName("Should allow admin to delete any comment")
    void deleteComment_ByAdmin_Success() {
        when(commentRepository.findById(50L)).thenReturn(Optional.of(comment));
        doNothing().when(commentRepository).delete(comment);

        assertDoesNotThrow(() -> commentService.deleteComment(50L, "admin", true));
        verify(commentRepository).delete(comment);
    }

    @Test
    @DisplayName("Should throw ForbiddenException when non-author deletes comment")
    void deleteComment_ByOtherUser_ThrowsForbidden() {
        when(commentRepository.findById(50L)).thenReturn(Optional.of(comment));

        assertThrows(ForbiddenException.class, () ->
                commentService.deleteComment(50L, "developer2", false)
        );
        verify(commentRepository, never()).delete(any());
    }
}
