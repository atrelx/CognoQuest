package org.example.cognoquest.question.dto;

import lombok.Data;
import org.example.cognoquest.option.dto.MatchingPairCreateDto;
import org.example.cognoquest.option.dto.OptionCreateDto;
import org.example.cognoquest.question.QuestionType;

import java.util.List;
import java.util.UUID;

@Data
public class QuestionResponseDto {
    private UUID id;
    private String questionText;
    private QuestionType type;
    private String correctTextAnswer;
    private List<OptionCreateDto> options;
    private List<MatchingPairCreateDto> matchingPairs;
}