package org.example.cognoquest.answer.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class AnswerCreateDto {
    private UUID questionId;
    private List<UUID> selectedOptionIds; // For SingleChoice, MultipleChoice
    private String textAnswer; // For TextInput
    private List<MatchingAnswerDto> matchingAnswers; // For Matching
}