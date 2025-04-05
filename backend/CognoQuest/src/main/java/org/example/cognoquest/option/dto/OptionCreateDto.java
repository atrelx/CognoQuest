package org.example.cognoquest.option.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OptionCreateDto {
    @NotBlank(message = "Option text cannot be blank")
    private String optionText;
    @NotNull(message = "isCorrect cannot be null")
    private Boolean isCorrect;
}