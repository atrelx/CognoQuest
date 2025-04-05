package org.example.cognoquest.question.mapper;

import org.example.cognoquest.question.MatchingPair;
import org.example.cognoquest.question.dto.MatchingPairCreateDto;
import org.example.cognoquest.question.Question;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MatchingPairMapper {
    @Mapping(target = "question", source = "question")
    @Mapping(target = "id", ignore = true)
    MatchingPair toEntity(MatchingPairCreateDto dto, Question question);
}