package org.example.cognoquest.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.cognoquest.question.dto.QuestionClientResponseDto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO with hidden correct answers
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SurveyClientResponseDto {
    private UUID id;
    private String title;
    private String description;
    private UUID createdBy;
    private String createdByName;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private List<QuestionClientResponseDto> questions;
}
