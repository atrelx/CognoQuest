package org.example.cognoquest.option.mapper;

import org.example.cognoquest.option.MatchingPair;
import org.example.cognoquest.option.dto.MatchingPairClientResponseDto;
import org.example.cognoquest.option.dto.MatchingPairCreateDto;
import org.example.cognoquest.question.Question;
import org.example.cognoquest.option.dto.MatchingPairEditDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MatchingPairMapper {
    @Mapping(target = "question", source = "question")
    @Mapping(target = "id", ignore = true)
    MatchingPair toEntity(MatchingPairCreateDto dto, Question question);

    @Mapping(target = "question", source = "question")
    @Mapping(target = "id", source = "dto.id")
    MatchingPair toEntity(MatchingPairEditDto dto, Question question);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "leftSide", source = "leftSide")
    MatchingPairClientResponseDto toClientResponseDto(MatchingPair matchingPair);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "leftSide", source = "leftSide")
    @Mapping(target = "rightSide", source = "rightSide")
    MatchingPairEditDto toEditDto(MatchingPair matchingPair);
    List<MatchingPairEditDto> toEditDtoList(List<MatchingPair> matchingPairs);

    List<MatchingPairClientResponseDto> toClientResponseDto(List<MatchingPair> matchingPairs);
}