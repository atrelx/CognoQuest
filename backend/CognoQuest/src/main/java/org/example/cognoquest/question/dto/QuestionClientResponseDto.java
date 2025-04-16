package org.example.cognoquest.question.dto;

import lombok.Data;
import org.example.cognoquest.option.dto.MatchingPairClientResponseDto;
import org.example.cognoquest.option.dto.OptionClientResponseDto;
import org.example.cognoquest.question.QuestionType;

import java.util.List;
import java.util.UUID;

/**
 * DTO with hidden correct answers
 */
@Data
public class QuestionClientResponseDto {
    private UUID id;
    private String questionText;
    private QuestionType type;
    private List<OptionClientResponseDto> options;
    private List<MatchingPairClientResponseDto> matchingPairs;
}
