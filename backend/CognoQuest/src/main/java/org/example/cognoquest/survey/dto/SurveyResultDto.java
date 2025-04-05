package org.example.cognoquest.survey.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class SurveyResultDto {
    private UUID id;
    private String title;
    private Double averageScore;
    private Long completionCount;
    private SurveyAttemptResultDto userAttempt;
}