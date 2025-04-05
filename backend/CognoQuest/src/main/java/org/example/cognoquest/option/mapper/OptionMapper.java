package org.example.cognoquest.option.mapper;

import org.example.cognoquest.option.Option;
import org.example.cognoquest.question.Question;
import org.example.cognoquest.option.dto.OptionCreateDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OptionMapper {
    @Mapping(target = "question", source = "question")
    @Mapping(target = "id", ignore = true)
    Option toEntity(OptionCreateDto dto, Question question);
}