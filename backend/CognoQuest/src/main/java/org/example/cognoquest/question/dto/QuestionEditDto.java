package org.example.cognoquest.question.dto;

import lombok.Data;
import org.example.cognoquest.option.dto.OptionEditDto;
import org.example.cognoquest.question.QuestionType;

import java.util.List;
import java.util.UUID;

@Data
public class QuestionEditDto {
    private UUID id;
    private String questionText;
    private QuestionType type;
    private String correctTextAnswer;
    private List<OptionEditDto> options;
    private List<MatchingPairEditDto> matchingPairs;
}
