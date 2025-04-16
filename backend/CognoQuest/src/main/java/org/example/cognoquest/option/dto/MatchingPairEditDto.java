package org.example.cognoquest.option.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class MatchingPairEditDto implements MatchingPairData {
    private UUID id;
    private String leftSide;
    private String rightSide;
}