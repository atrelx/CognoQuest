package org.example.cognoquest.question.mapper;

import org.example.cognoquest.question.MatchingPair;
import org.example.cognoquest.question.dto.MatchingPairClientResponseDto;
import org.example.cognoquest.question.dto.MatchingPairCreateDto;
import org.example.cognoquest.question.Question;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MatchingPairMapper {
    @Mapping(target = "question", source = "question")
    @Mapping(target = "id", ignore = true)
    MatchingPair toEntity(MatchingPairCreateDto dto, Question question);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "leftSide", source = "leftSide")
    @Mapping(target = "rightSide", source = "rightSide")
    MatchingPairClientResponseDto toClientResponseDto(MatchingPair matchingPair);

    List<MatchingPairClientResponseDto> toClientResponseDto(List<MatchingPair> matchingPairs);
}