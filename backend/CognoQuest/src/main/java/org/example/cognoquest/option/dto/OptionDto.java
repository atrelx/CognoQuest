package org.example.cognoquest.option.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class OptionDto {
    private UUID id;
    @NotBlank
    private String optionText;
    private boolean isCorrect;
}