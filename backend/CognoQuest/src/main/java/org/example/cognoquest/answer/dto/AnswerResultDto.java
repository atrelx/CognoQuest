package org.example.cognoquest.answer.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class AnswerResultDto {
    private UUID questionId;
    private String questionText;
    private Boolean isCorrect;
    private List<String> userAnswers;
    private List<String> correctAnswers;
}