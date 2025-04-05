package org.example.cognoquest.survey.dto;

import lombok.Data;
import org.example.cognoquest.answer.dto.AnswerResultDto;

import java.util.List;
import java.util.UUID;

@Data
public class SurveyAttemptResultDto {
    private UUID attemptId;
    private Double score;
    private List<AnswerResultDto> answers;
}