package org.example.cognoquest.question.mapper;

import org.example.cognoquest.option.mapper.MatchingPairMapper;
import org.example.cognoquest.option.mapper.OptionMapper;
import org.example.cognoquest.question.Question;
import org.example.cognoquest.question.dto.QuestionClientResponseDto;
import org.example.cognoquest.question.dto.QuestionCreateDto;
import org.example.cognoquest.question.dto.QuestionEditDto;
import org.example.cognoquest.question.dto.QuestionResponseDto;
import org.example.cognoquest.survey.Survey;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {OptionMapper.class, MatchingPairMapper.class})
public interface QuestionMapper {
    @Mapping(target = "survey", source = "survey")
    @Mapping(target = "id", ignore = true)
    Question toEntity(QuestionCreateDto dto, Survey survey);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "questionText", source = "questionText")
    @Mapping(target = "type", source = "type")
    @Mapping(target = "correctTextAnswer", source = "correctTextAnswer")
    @Mapping(target = "options", ignore = true) // Is being set in the service
    @Mapping(target = "matchingPairs", ignore = true) // Is being set in the service
    QuestionResponseDto toResponseDto(Question question);


    @Mapping(target = "questionText", source = "questionText")
    @Mapping(target = "type", source = "type")
    @Mapping(target = "correctTextAnswer", source = "correctTextAnswer")
    @Mapping(target = "options", ignore = true) // Is being set in the service
    @Mapping(target = "matchingPairs", ignore = true) // Is being set in the service
    QuestionCreateDto toCreateDto(Question question);

    @Mapping(target = "options", ignore = true) // Is being set in the service
    @Mapping(target = "matchingPairs", ignore = true) // Is being set in the service
    @Mapping(target = "questionText", source = "questionText")
    @Mapping(target = "type", source = "type")
    @Mapping(target = "correctTextAnswer", source = "correctTextAnswer")
    QuestionEditDto toEditDto(Question question);
    List<QuestionEditDto> toEditDtoList(List<Question> questions);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "questionText", source = "questionText")
    @Mapping(target = "type", source = "type")
    @Mapping(target = "options", ignore = true) // Is being set in the service
    @Mapping(target = "matchingPairs", ignore = true) // Is being set in the service
    QuestionClientResponseDto toClientResponseDto(Question question);
    List<QuestionClientResponseDto> toClientResponseDtoList(List<Question> questions);
}