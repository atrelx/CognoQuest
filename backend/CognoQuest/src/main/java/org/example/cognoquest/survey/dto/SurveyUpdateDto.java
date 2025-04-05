package org.example.cognoquest.survey.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class SurveyUpdateDto {
    @NotBlank(message = "Title cannot be blank")
    private String title;
    private String description;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
}