package org.example.cognoquest.survey.dto;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO without questions, for listing surveys
 */
@Data
public class SurveyListDto {
    private UUID id;
    private String title;
    private String description;
    private UUID createdBy;
    private String createdByName;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
}
