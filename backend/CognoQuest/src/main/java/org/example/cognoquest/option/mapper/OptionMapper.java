package org.example.cognoquest.option.mapper;

import org.example.cognoquest.option.Option;
import org.example.cognoquest.option.dto.OptionClientResponseDto;
import org.example.cognoquest.option.dto.OptionEditDto;
import org.example.cognoquest.question.Question;
import org.example.cognoquest.option.dto.OptionCreateDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OptionMapper {
    @Mapping(target = "question", source = "question")
    @Mapping(target = "id", ignore = true)
    Option toEntity(OptionCreateDto dto, Question question);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "optionText", source = "optionText")
    OptionClientResponseDto toClientResponseDto(Option option);
    List<OptionClientResponseDto> toClientDtoList(List<Option> options);

    OptionEditDto toEditDto(Option option);
    List<OptionEditDto> toEditDtoList(List<Option> options);

    List<OptionClientResponseDto> toClientResponseDto(List<Option> options);
}