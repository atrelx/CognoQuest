package org.example.cognoquest.question.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class MatchingPairEditDto {
    private UUID id;
    private String leftSide;
    private String rightSide;
}