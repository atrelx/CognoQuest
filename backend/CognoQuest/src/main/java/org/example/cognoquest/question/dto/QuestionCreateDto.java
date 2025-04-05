package org.example.cognoquest.question.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.example.cognoquest.option.dto.OptionCreateDto;
import org.example.cognoquest.question.QuestionType;

import java.util.List;

@Data
public class QuestionCreateDto {
    @NotBlank(message = "Question text cannot be blank")
    private String questionText;
    @NotNull(message = "Question type cannot be null")
    private QuestionType type;
    private String correctTextAnswer; // For TextInput
    private List<OptionCreateDto> options; // For SingleChoice, MultipleChoice
    private List<MatchingPairCreateDto> matchingPairs; // For Matching
}