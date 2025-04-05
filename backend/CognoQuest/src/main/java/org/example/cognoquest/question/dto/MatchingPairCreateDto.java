package org.example.cognoquest.question.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MatchingPairCreateDto {
    @NotBlank(message = "Left side cannot be blank")
    private String leftSide;
    @NotBlank(message = "Right side cannot be blank")
    private String rightSide;
}