package org.example.cognoquest.survey.dto;

import lombok.Data;
import org.example.cognoquest.answer.dto.AnswerCreateDto;

import java.util.List;
import java.util.UUID;

@Data
public class SurveyAttemptCreateDto {
    private UUID surveyId;
    private List<AnswerCreateDto> answers;
}