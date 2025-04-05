package org.example.cognoquest.survey.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.cognoquest.question.dto.QuestionCreateDto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SurveyResponseDto {
    private UUID id;
    @NotBlank(message = "Title cannot be blank")
    private String title;
    private String description;
    private UUID createdBy;
    private String createdByName;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    @NotNull(message = "Questions cannot be null")
    private List<QuestionCreateDto> questions;
}
