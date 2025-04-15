package org.example.cognoquest.survey.dto;

import lombok.Data;
import org.example.cognoquest.question.dto.QuestionEditDto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class SurveyEditDto {
    private UUID id;
    private String title;
    private String description;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private List<QuestionEditDto> questions;
}