package com.example.incidentmanagement.dto.comment;

import com.example.incidentmanagement.dto.user.UserSummaryDto;
import com.example.incidentmanagement.entity.Comment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponseDto {

    private Long id;
    private Long incidentId;
    private String content;
    private UserSummaryDto author;
    private Instant createdAt;
    private Instant updatedAt;

    public static CommentResponseDto fromEntity(Comment comment) {
        if (comment == null) {
            return null;
        }
        return CommentResponseDto.builder()
                .id(comment.getId())
                .incidentId(comment.getIncident() != null ? comment.getIncident().getId() : null)
                .content(comment.getContent())
                .author(UserSummaryDto.fromEntity(comment.getAuthor()))
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
