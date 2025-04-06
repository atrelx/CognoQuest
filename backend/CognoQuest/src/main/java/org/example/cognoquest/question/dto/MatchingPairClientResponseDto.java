package org.example.cognoquest.question.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

/**
 * DTO with hidden correct answers
 */
@Data
@AllArgsConstructor
public class MatchingPairClientResponseDto {
    private UUID id;
    private String leftSide;
    private String rightSide;
}