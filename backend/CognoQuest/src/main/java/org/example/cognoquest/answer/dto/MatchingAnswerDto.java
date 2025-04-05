package org.example.cognoquest.answer.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class MatchingAnswerDto {
    private UUID pairId;
    private String selectedRightSide;
}