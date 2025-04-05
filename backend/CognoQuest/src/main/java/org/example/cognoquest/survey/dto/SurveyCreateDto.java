package org.example.cognoquest.survey.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.example.cognoquest.question.dto.QuestionCreateDto;

import java.time.OffsetDateTime;

@Data
public class SurveyCreateDto {
    @NotBlank(message = "Title cannot be blank")
    private String title;
    private String description;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    @NotNull(message = "Questions cannot be null")
    private List<QuestionCreateDto> questions;
}
