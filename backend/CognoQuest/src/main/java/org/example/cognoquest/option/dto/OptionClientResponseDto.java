package org.example.cognoquest.option.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

/**
 * DTO with hidden correct answers
 */
@Data
@AllArgsConstructor
public class OptionClientResponseDto {
    private UUID id;
    private String optionText;
}