package org.example.cognoquest.option.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class OptionEditDto {
    private UUID id;
    private String optionText;
    private Boolean isCorrect;
}
